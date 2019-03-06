/**
 * Main application file
 */

'use strict';


import express from 'express';
import sqldb from './sqldb';
import config from './config/environment';
import http from 'http';
import seedDatabaseIfNeeded from './config/seed';
import Logger from './logger';

// Setup server

var nr = require('newrelic');
var app = express();
var server = http.createServer(app);
var socketio = require('socket.io')(server, {
 serveClient: config.env !== 'production',
 path: '/socket.io-client'
});

if (config.logOptions && config.logOptions.isSupportGrayLog) {
  const logger = Logger.getLogger(config.logOptions);
  logger.on('error', (err) => {
    console.log('cannot log to GrayLog as error: ', err);
  });
  app.use(function profileMiddleware(req, res, next) {
    res.startTime = new Date();
    // The 'finish' event will emit once the response is done sending
    res.once('finish', () => {
      let elapsedMS = new Date() - res.startTime;
      let message = {
        timestamp: res.startTime.toISOString(),
        user: req.userEmail ? req.userEmail : 'anonymous',
        action: req.method,
        originalUrl: req.originalUrl,
        statusCode: res.statusCode,
        elapsedInMs: elapsedMS
      };
      if (res.statusCode === 500 || (res.statusCode >= 400 && res.statusCode <= 499)) {
        if (res.errorObj) {
          if (res.errorObj.message) {
            message.errorMessage = res.errorObj.message;
          }
          if (res.errorObj.stack) {
            message.errorStack = res.errorObj.stack;
          }
        }
        logger.error(message);
      } else {
        logger.info(message);
      }
    });
    next();
  });
}

require('./config/socketio').default(socketio);
require('./config/express').default(app);
require('./routes').default(app);

// Start server
function startServer() {
  app.angularFullstack = server.listen(config.port, config.ip, function() {
    console.log('Express server listening on %d, in %s mode', config.port, app.get('env'));
  });
}

// sqldb.sequelize.sync()
//   .then(seedDatabaseIfNeeded)
//   .then(startServer)
//   .catch(function(err) {
//     console.log('Server failed to start due to error: %s', err);
//   });

startServer();

// Expose app
exports = module.exports = app;
