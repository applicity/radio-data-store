# Radio Storage Server

This repository contains the server that is used to store data that is collected
by the radio discovery service.

It can be initialised for the first time by running

```
node create.js
```

This will create an empty app.sqllite database with the right structure for data storage.

The file can be copied from the live server but care should be taken to copy the file when it's not in use.  Otherwise you can get an inconsistent file.

## Running the server

The server runs under pm2 and can be started with 

```
npm run pm2
```

The status can be seen with

```
pm2 ls
```

the logs can be shown with

```
pm2 logs
```


## Development

For development you can run the server with 

```
npm run server
```

This will start a local server and tell you the port that it is running on.

You can access the server to run queries and mutations.

NOTE: This doesn't work properly in Safari so make sure to use Chrome (this is a note for mw to save time)


