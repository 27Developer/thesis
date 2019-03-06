/**
 * Main application routes
 */

'use strict';

import errors from './components/errors';
import path from 'path';
import config from './config/environment';
import https from 'https';
import { User, UserToken, PublishLink } from './sqldb/index';
var express = require('express');

export default function(app) {
  // Insert routes below
  app.use('/api/clients', authorized, require('./api/controllers/clientController'));
  app.use('/api/activities', authorized, require('./api/controllers/activityController'));
  app.use('/api/analysts', authorized, require('./api/controllers/analystController'));
  app.use('/api/defaultData', authorized, require('./api/controllers/defaultDataController'));
  app.use('/api/client-health', authorized, require('./api/controllers/client-health-controller'));
  app.use('/api/analyst-alignment', authorized, require('./api/controllers/analyst-alignment-controller'));
  app.use('/api/etl-process', authorized, require('./api/controllers/etl-process-controller'));
  app.use('/api/tags', authorized, require('./api/controllers/tag-controller'));
  app.use('/api/client-ranking-report', authorized, require('./api/controllers/client-ranking-report-controller'));
  app.use('/api/ranking-report', authorized, require('./api/controllers/ranking-report-controller'));
  app.use('/api/client-maturity', authorized, require('./api/controllers/client-maturity-controller'));
  app.use('/api/upload-image', authorized, require('./api/controllers/upload-image-controller'));
  app.use('/api/client-objective', authorized, require('./api/controllers/client-objective-controller'));
  app.use('/api/client-resource', authorized, require('./api/controllers/client-resource-controller'));
  app.use('/api/client-analyst-objective', authorized, require('./api/controllers/client-analyst-objective-controller'));
  app.use('/api/client-report', authorized, require('./api/controllers/client-report-controller'));
  app.use('/api/authentication', require('./api/controllers/authentication'));
  app.use('/api/users', authorized, require('./api/controllers/user-controller'));
  app.use('/api/object-templates', authorized, require('./api/controllers/object-templates-controller'));
  app.use('/api/client-profile', authorized, require('./api/controllers/client-profile-controller'));
  app.use('/api/firm', authorized, require('./api/controllers/firm-controller'));
  app.use('/api/report', authorized, require('./api/controllers/report-controller'));
  app.use('/api/categories', authorized, require('./api/controllers/category-controller'));
  app.use('/api/global-setting', authorized, require('./api/controllers/global-settings-controller'));
  app.use('/api/client-speakers', authorized, require('./api/controllers/client-speaker-controller'));
  app.use('/api/insights', authorized, require('./api/controllers/insightController'));
  app.use('/api/event', authorized, require('./api/controllers/event-controller'));
  app.use('/api/my-feed', authorized, require('./api/controllers/my-feed-controller'));
  app.use('/api/client-insight', authorized, require('./api/controllers/client-insight-controller'));
  app.use('/api/collections', authorized, require('./api/controllers/collectionController'));
  app.use('/api/markets', authorized, require('./api/controllers/market-controller'));
  app.use('/api/publish', verifyPublishLink, require('./api/controllers/publish-controller'));
  app.use('/api/image', require('./api/controllers/image-controller'));

  // All undefined asset or api routes should return a 404
  app.route('/:url(api|auth|components|app|bower_components|assets)/*')
    .get(errors[404]);

  // All other routes should redirect to the index.html
  app.route('/*')
    .get((req, res) => {
      res.sendFile(path.resolve(`${app.get('appPath')}/index.html`));
    });
}

var authorized = function(req, res, next) {
  var bearerToken;
  var bearerHeader = req.headers['authorization'];
  if (typeof (bearerHeader) !== 'undefined') {
    var bearer = bearerHeader.split(' ');
    bearerToken = bearer[1];
    req.token = bearerToken;
    UserToken.findAll({ where: { access_token: bearerToken } })
      .then(res => {
        var data = res[0].dataValues;
        req.userEmail = data.email;
        var currentDate = new Date();
        var tokenExpire = new Date(data.token_expire);
        if (currentDate <= tokenExpire) {
          return next();
        } else {
          return next();
        }
      })
      .catch(err => {
        return next();
      });
  } else {
    res.sendStatus(401);
  }
};

var verifyPublishLink = function(req, res, next) {
  var bearerToken;
  var bearerToken = typeof (req.query.token) !== 'undefined' ? req.query.token : req.body.data.token;
  if (typeof (bearerToken) !== 'undefined') {
    PublishLink.findAll({ where: { token: bearerToken } })
      .then(res => {
        var data = res[0].dataValues;
        var currentDate = new Date();
        var tokenExpire = new Date(data.exprire);
        if (currentDate <= tokenExpire) {
          req.publishData = data;
          return next();
        } else {
          res.sendStatus(401);
        }
      })
      .catch(err => {
        res.sendStatus(401);
      });
  } else {
    res.sendStatus(401);
  }
};

