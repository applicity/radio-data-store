const fs = require('fs')
require('dotenv').config()

const sqlite3 = require('sqlite3').verbose();
const {InfluxDB, Point} = require('@influxdata/influxdb-client')

const all = true
let run = true

const { INFLUX_URL, INFLUX_TOKEN, INFLUX_BUCKET, INFLUX_ORG } = process.env

// console.log({INFLUX_URL, INFLUX_TOKEN, INFLUX_BUCKET, INFLUX_ORG})
// console.log(process.env)
// process.exit()

const WATERMARK = 'watermarks/influx.watermark.json';

const db = new sqlite3.Database('./app.sqllite');

let watermark = 0;

// const query = 'select * from report where reported > 1735734906 and report_id > ? order by report_id limit 10000'
const query = 'select * from report where report_id > ? order by report_id limit 10000'


const wifi_strength = (inp) =>{ 
  if (inp > -50) return 100
  if (inp < -90) return 0


  return parseInt(((inp + 90) / 40) * 100, 10)
  return inp + 150


}

const get_report_data = () => {
  // console.log('get_report_data', watermark)
  return new Promise((res, rej) => {
    db.all(query, [watermark], function(err, rows) {
      if (err) return rej(err);
      return res(rows);
    })

  })
}

const get_watermark = () => {
  return new Promise((res, rej) => {
    try {
      const text = fs.readFileSync(WATERMARK, 'utf8')
      const wm = JSON.parse(text)
      // console.log('wm', wm, parseInt(wm))
      watermark = parseInt(wm)  
    } catch {
      console.log('Failed to get watermark')
    }
    res()
  
  })
}

const store_watermark = (data) => {
  return new Promise((res, rej) => {
    console.log('store_watermark', watermark)
    fs.writeFileSync(WATERMARK, JSON.stringify(watermark))
    res(data)
  })
}

const dump_data = (data) => {
  return new Promise((res, rej) => {
    // console.log('Data', data)
    console.log('dump', watermark)
    res(data)
  })
}

const isPlaying = (report) => {
  const { state, volume, uri } = report
  if (state === 'PLAYING' && uri.includes('radiowey') && volume > 10) return true
  return false
}

const store_data = (data) => {

  const url = INFLUX_URL
const token = INFLUX_TOKEN
const org = INFLUX_ORG
const bucket = INFLUX_BUCKET

// const token = process.env.INFLUXDB_TOKEN
// const url = 'http://localhost:8086'

// const client = new InfluxDB({url: INFLUX_URL, token: INFLUX_TOKEN})
// console.log('new client', {url, token } )
const client = new InfluxDB({ url, token})
console.log('getWriteAPI', org, bucket)
const writeApi = client.getWriteApi(org, bucket)

  return new Promise((res, rej) => {
    const last = data.slice(-1)[0]
    console.log('Store the data to influx')

    data.forEach(report => {
      // console.log('Report', report)

      const playing = isPlaying(report)

      // console.log('Report', report)
      const p = new Point('radios')
      .tag('radio', report.radio)
        .stringField('radio_name', report.radio)
        .tag('playingtag', playing ? 'Y' : 'N')
        // .stringField('radio', report.radio)
        // .stringField('status', report.status)
        .stringField('state', report.state)
        // .stringField('uri', report.uri)
        .timestamp(new Date(report.reported * 1000))
        .intField('volume', report.volume)
        .booleanField('playing', playing)
        // .intField('report_id', report.report_id)

      if (report.rssi) {
        // console.log('RSSI', report.rssi)
        const rssi = parseInt(report.rssi)
        const strength = wifi_strength(rssi)
        p.intField('rssi', rssi)
        p.intField('strength', strength)
      }

      writeApi.writePoint(p)      
    });

    writeApi.close().then(() => {
      console.log('Write done')
      // console.log('Last', last)
      if (last) {
        watermark = last.report_id
        if (!all) {
          run = false
        }
      } else {
        run = false
      }
      res(data)
  
    })

  })
}


const processor = async () => {
  while (run) {
    await get_watermark().then(get_report_data)
    .then(dump_data)
    .then(store_data)
    .then(store_watermark)  
  
  }

};

// while (run) {
  // get_watermark().then(get_report_data)
  // .then(dump_data)
  // .then(store_data)
  // .then(store_watermark)  
// }

// while (run) {
  processor()
// }
//.then(data => console.log(data))
// add_period(['daily', start.year(), start.month() + 1, start.date(), start.unix(), end.unix() ]);
