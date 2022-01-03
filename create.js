const path = require('path')
const marv = require('marv')

const sqliteDriver = require('@open-fidias/marv-better-sqlite3-driver')
const directory = path.join(process.cwd(), 'migrations' )
const driver = sqliteDriver({
    table: 'db_migrations',     // defaults to 'migrations'
    connection: {
        path: 'app.sqlite',
        options: {
            memory: false,
            fileMustExist: false,
            timeout: 5000,
            verbose: null // function or null
        } // See https://github.com/JoshuaWise/better-sqlite3/blob/master/docs/api.md#new-databasepath-options
    }
})
marv.scan(directory, (err, migrations) => {
    if (err) throw err
    marv.migrate(migrations, driver, (err) => {
        if (err) throw err
    })
})
