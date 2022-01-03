const path = require('path')
const marv = require('marv')
const sqliteDriver = require('@open-fidias/marv-better-sqlite3-driver');
const { Database } = require('sqlite3');
const sqlite3 = require('sqlite3').verbose();
const dbFile = 'app.sqllite';

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

const getDb = async () => {

  await marv.scan(directory, (err, migrations) => {
    if (err) throw err
    marv.migrate(migrations, driver, (err) => {
        if (err) throw err
    })
  })


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
      db.all("SELECT * FROM radios order by name", (err, rows) => {
        if (err) {
          console.error(err);
          return rej([]);
        }

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

  const addRadioReport = (name, ip, volume, status) => {
    return new Promise((res, rej) => {

      db.run(`INSERT INTO radio (name, created, last_reported, last_ip) VALUES(?, strftime('%s', 'now'), strftime('%s', 'now'), ?) ON CONFLICT(name) DO UPDATE set last_reported = strftime('%s', 'now'), last_ip = ?`, [name, ip, ip], function(err) {
        if (err) {
          return rej(err);
        }

        db.run(`INSERT INTO report (radio, volume, status, reported) VALUES (?, ?, ?, strftime('%s', 'now'))`, [name, volume, status], async function(err2) {
          if (err2) {
            return rej(err2);
          }

          getRadio(name).then(radio => res(radio)).catch(err => rej(err));

        })
      })
    })

  }


  return { allNumbers, addPhoneNumber, deletePhoneNumber, updatePhoneNumber, allRadios, addRadioReport }
}

export default getDb;