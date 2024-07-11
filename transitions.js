const sqlite3 = require('sqlite3').verbose();
const moment = require('moment');

const db = new sqlite3.Database('./app.sqllite');


// find all the reports for a radio



const isPlaying = (report) => {
  const { state, volume, uri } = report
  if (state === 'PLAYING' && uri.includes('radiowey') && volume > 10) return true
  return false
}


const insert_transitions = (transitions) => {
  db.run("BEGIN TRANSACTION;");
      const insert = db.prepare("INSERT INTO transition (reported, type, radio) VALUES (?, ?, ?)")
  
      transitions.forEach(t => {
        insert.run([t.reported, t.type, t.radio])
      })
    // many times
    // insertStatement.run([a,b]);
      insert.finalize();
      db.run("END;", () => console.log(`done transitions`, transitions.length));
}


const all_radios = async () => {
  console.log('Running all radios')
  let transitions = []


  await new Promise((res, rej) => {
    db.all("select distinct radio from report", async (err, rows) => {
      // console.log('Rows', rows)
      for (const row of rows) {
        const { radio } = row
  
        console.log('Row', row)
        const rt = await radio_transitions(radio)
        transitions = transitions.concat(rt)
        console.log(radio, 'transitions', rt.length, transitions.length)
        // process.exit()
    
      }

      console.log('Total tran', transitions.length)
      insert_transitions(transitions)
      res(transitions)
  
    }
    // , () => {
    //   console.log('Finally')
    // } 
    )

  })
  
  
}

const radio_transitions = async (radio) => {
  const transitions = []
  let last = null

  return new Promise((res, rej) => {

    db.each("select * from report where radio = ? ", radio, (err, row) => {
      // console.log('Row', row)
      const playing = isPlaying(row)
  
      if (!last) {
        last = { reported: row.reported, type: 'initial', radio}
        transitions.push(last)
      } else if (
        playing && last.type !== 'on'
  
      ) {
        last = { reported: row.reported, type: 'on', radio}
        transitions.push(last)
      } else if (
        !playing && last.type !== 'off'
      ) {
        last = { reported: row.reported, type: 'off', radio}
        transitions.push(last)
      }
    
    },
    () => {
      res(transitions)
    }
    // , () => {
  
    //   db.run("BEGIN TRANSACTION;");
    //   const insert = db.prepare("INSERT INTO transition (reported, type, radio) VALUES (?, ?, ?)")
  
    //   transitions.forEach(t => {
    //     insert.run([t.reported, t.type, t.radio])
    //   })
    // // many times
    // // insertStatement.run([a,b]);
    //   insert.finalize();
    //   db.run("END;", () => console.log(radio, `done transitions`, transitions.length));
    //   res()
    //   // console.log('Trans', transitions)
  
    // }
  )
  

  })




}

all_radios()


// radio_transitions('WEY072')






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

// create_year_periods();
// add_period(['daily', start.year(), start.month() + 1, start.date(), start.unix(), end.unix() ]);
