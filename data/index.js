// import { rawListeners } from 'process';

const moment = require('moment');
const path = require('path');
const marv = require('marv');
const sqliteDriver = require('@open-fidias/marv-better-sqlite3-driver');
const { Database } = require('sqlite3');
const sqlite3 = require('sqlite3').verbose();
const dbFile = 'app.sqllite';
// const dbFile = ':memory';

const connection = {
  path: dbFile,
  options: {
      memory: false,
      fileMustExist: false,
      timeout: 5000,
      verbose: null // function or null
  } // See https://github.com/JoshuaWise/better-sqlite3/blob/master/docs/api.md#new-databasepath-options
};

const directory = path.join(process.cwd(), 'migrations' )
const driver = sqliteDriver({
    table: 'db_migrations',     // defaults to 'migrations'
    connection
})

const migrate = async () => {
  await marv.scan(directory, (err, migrations) => {
    if (err) throw err
    marv.migrate(migrations, driver, (err) => {
        if (err) throw err
    })
  })
}

migrate();

const getDb = async () => {

  const db = new sqlite3.Database(dbFile);

  const allNumbers = () => {
    return new Promise((res, rej) => {
      db.all("SELECT * from numbers where deleted = 0 order by name", (err, rows) => {
        if(err) {
          console.error(err);
          return rej([]);
        }

        return res(rows);
      })
    })
  }

  const allRadios = () => {
    return new Promise((res, rej) => {
      db.all("SELECT * FROM radio order by name", (err, rows) => {
        if (err) {
          console.error(err);
          return rej([]);
        }

        return res(rows);
      })
    })

  }

  const getRadioCount = () => {
    return new Promise((res, rej) => {
      db.all("SELECT count(*) as count FROM radio", (err, rows) => {
        if (err) {
          console.error(err);
          return rej();
        }

        // return res({ count: 49})
        return res(rows[0]);
      })
    })

  }


  const getLatestReport = () => {

    return new Promise((res, rej) => {
      db.all("select *, date(reported, 'unixepoch') as date, datetime(reported, 'unixepoch', 'localtime') as datetime from report ORDER BY reported DESC limit 1", (err, rows) => {
        if (err) {
          console.error(err)
          return rej()
        }

        return res(rows[0])
      })
    })
  }

  const getRangeFromPeriodName = (periodName) => {
    let start = moment();
    let end = start.clone();


    switch (periodName) {
      case 'today':
        start = start.startOf('day');
        end = end.endOf('day');
        break;
      case 'yesterday':
        start = start.subtract(1, 'days').startOf('day');
        end = end.subtract(1, 'days').endOf('day');
        break;
      case 'last_month':
        start = start.subtract(1, 'month').startOf('month');
        end = end.subtract(1, 'month').endOf('month');
        break;
      case 'this_week':
        start = start.startOf('week');
        end = end.endOf('week');

        break;
      case 'last_week':
        start = start.subtract(7, 'days').startOf('week');
        end = end.subtract(7, 'days').endOf('week');

        break;
      case '7_days':
        end = end.subtract(1, 'days').endOf('day');
        start = start.subtract(7, 'days').startOf('day');
        break;

      case '30_days':
        end = end.subtract(1, 'days').endOf('day');
        start = start.subtract(30, 'days').startOf('day');
        break;

      case 'last_7_days':
        end = end.subtract(8, 'days').endOf('day');
        start = start.subtract(14, 'days').startOf('day');
        break;

      default:
        end = end.endOf('week');
        break;
    }

    return [start.unix(), end.unix()]
  }

  const getRadioDataForPeriod = ({ periodName, groupBy, playing = false }) => {

    console.log('PeriodName', periodName);
    const [start, end ] = getRangeFromPeriodName(periodName);
    console.log('Period', { start, end});

    const periodType = 'daily';

    console.log({groupBy});
    const group = groupBy || 'display';

    const sql = `select ${groupBy ? groupBy + ' as display, ' : ''} count(distinct radio) as count
    from report_periods rp
    inner join report r
    on r.reported >= rp.start and r.reported < rp.end
    where rp.type = ? and reported >= ? and reported < ?
    ${ playing ? " and state = 'PLAYING' and volume > 10 ": ''}
    ${ groupBy ? 'group by ' + groupBy : ''}
    order by rp.start`;

    console.log(sql);

    return new Promise((res, rej) => {
      db.all(sql, [periodType, start, end], function(err, rows) {
        if (err) return rej(err);

        return res(rows);
      })

    })
  }




  const getRadioTimes = ({ type, year, month, day, hour }) => {
    const params = [
      { key: 'type', val: type},
      { key: 'year', val: year},
      { key: 'month', val: month},
      { key: 'day', val: day},
      { key: 'hour', val: hour}
    ].filter(p => Boolean(p.val));

    const where  = params.map(p => `${p.key} = ?`).join(' and ');
    const values = params.map(p => p.val);

    console.log({where, values});

    const sql = `select year, month, day, count(distinct radio) as count
    from report_periods rp
    left outer join report r
    on r.reported >= rp.start and r.reported < rp.end
    where ${where}
    group by year, month, day`;

    return new Promise((res, rej) => {
      db.all(sql, values, function(err, rows) {
        if (err) return rej(err);

        return res(rows);
      })
    })
  }


  const deletePhoneNumber = (number_id) => {
    return new Promise((res, rej) => {
      db.run(`UPDATE numbers SET deleted = 1 WHERE number_id = ?`, [number_id], function(err) {
        if (err) {
          return rej(err);
        }

        return res({id: number_id});
      })
    })

  }

  const updatePhoneNumber = (number_id, name, number) => {
    return new Promise((res, rej) => {
      db.run(`UPDATE numbers SET name = ?, number = ?, deleted = 0 WHERE number_id = ?`, [name, number, number_id], function(err) {
        if (err) {
          return rej(err);
        }

        return res(true);
      })
    })

  }

  const addPhoneNumber = (name, number) => {
    return new Promise((res, rej) => {
      db.run(`INSERT INTO numbers (name, number) VALUES(?, ?)`, [name, number], function(err) {
        if (err) {
          return rej(err);
        }
        res({ number_id: `${this.lastID}`, name, number });
      })
    })

  }

  const getRadio = (name) => {
    return new Promise((res, rej) => {
      db.get(`SELECT * from radio where name = ?`, [name], (err, row) => {
        if (err) {
          return rej(err);
        }
        return res(row);
      })
    })
  }

  const addRadioReport = (name, radioType, ip, volume, status, state, uri) => {
    return new Promise((res, rej) => {

      db.run(`INSERT INTO radio (name, radio_type, created, last_reported, last_ip) VALUES(?, ?, strftime('%s', 'now'), strftime('%s', 'now'), ?) ON CONFLICT(name) DO UPDATE set last_reported = strftime('%s', 'now'), last_ip = ?`, [name, radioType, ip, ip], function(err) {
        if (err) {
          return rej(err);
        }

        db.run(`INSERT INTO report (radio, volume, status, state, uri, reported) VALUES (?, ?, ?, ?, ?, strftime('%s', 'now'))`, [name, volume, status, state, uri], async function(err2) {
          if (err2) {
            return rej(err2);
          }

          getRadio(name).then(radio => res(radio)).catch(err => rej(err));

        })
      })
    })

  }

  return { allNumbers, addPhoneNumber, deletePhoneNumber, updatePhoneNumber, allRadios, addRadioReport, getRadioCount, getLatestReport, getRadioTimes, getRadioDataForPeriod }
}

export default getDb;
