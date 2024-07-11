const sqlite3 = require('sqlite3').verbose();
const moment = require('moment');

const db = new sqlite3.Database('./app.sqllite');




const create_year_periods = () => {
  let start = moment('2024-01-01');
  // const end = start.moment().add(1, 'days');


  for (i = 0; i< 365; i++) {

    const end = start.clone().add(1, 'days');

    add_period(['daily', start.format('YYYY-MM-DD'), start.year(), start.month() + 1, start.date(), start.format('dddd'),  null, start.unix(), end.unix()]);
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

create_year_periods();
// add_period(['daily', start.year(), start.month() + 1, start.date(), start.unix(), end.unix() ]);
