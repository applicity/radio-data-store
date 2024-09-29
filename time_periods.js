const sqlite3 = require('sqlite3').verbose();
const moment = require('moment');

const db = new sqlite3.Database('./app.sqllite');

const START = '2024-01-01'


const create_year_periods = () => {
  let start = moment(START);
  // const end = start.moment().add(1, 'days');


  for (i = 0; i< 365; i++) {

    const end = start.clone().add(1, 'days');

    add_period(['daily', start.format('YYYY-MM-DD'), start.year(), start.month() + 1, start.date(), start.format('dddd'),  null, start.unix(), end.unix()]);
    start = end;
  }
}


const create_hour_periods = () => {
  let start = moment(START)

  for (i = 0; i< 365; i++) {

    for (j = 0; j < 24; j++) {
      const hd = `0${j}`.slice(-2)
      const display = `${start.format('YYYY-MM-DD')} ${hd}`
      const hs = start.unix() + (j * 3600)
      const he = start.unix() + ((j+1) * 3600)
      add_period(['hourly', display, start.year(), start.month() + 1, start.date(), start.format('dddd'),  j, hs, he]);
    }

    const end = start.clone().add(1, 'days');
    start = end;
  }
  

}

const add_period = (values) => {


db.run(`INSERT INTO report_periods(type, display, year, month, day, dotw, hour, start, end) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?)`, values, function(err) {
  if (err) {
    return console.log(err.message);
  }
  // get the last insert id
  console.log(`A row has been inserted with rowid ${this.lastID}`);
});

}

// create_year_periods();
create_hour_periods();
// add_period(['daily', start.year(), start.month() + 1, start.date(), start.unix(), end.unix() ]);
