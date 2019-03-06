'use strict';

import uuid from 'uuid/v1';
import log4Js from 'log4js';
import * as responseHelper from '../../../components/helper/response-helper';
log4Js.configure({
  appenders: [
    { type: 'file', filename: 'logs/analyst-alignment-controller.log', category: 'analyst-alignment-controller' }
  ]
});
var logger = log4Js.getLogger('analyst-alignment-controller');
var AnalystAlignmentService = require('../../services/analyst-alignment.service');

export function getListClientAnalystAlignmentHistoryByClientId(req, res) {
  var clientId = req.query.clientId;
  AnalystAlignmentService.getListClientAnalystAlignmentHistoryByClientId(clientId).then(data => {
    return res.status(200).json(data);
  })
    .catch(function (err) {
      logger.error(err);
    });
}

export function addNewClientAnalystAlignmentHistory(req, res) {
  var listNewClientAnalystHealthHistory = req.body.listNewClientAnalystHealthHistory;
  AnalystAlignmentService.addNewClientAnalystAlignmentHistory(listNewClientAnalystHealthHistory).then(data => {
    return res.status(201).json(data);
  })
    .catch(function (err) {
      logger.error(err);
    });
}

export function updateClientAnalystAlignmentHistory(req, res) {
  var listChangedClientAnalystHealthHistory = req.body.listChangedClientAnalystHealthHistory;
  AnalystAlignmentService.updateClientAnalystAlignmentHistory(listChangedClientAnalystHealthHistory).then(data => {
    return res.status(201).json(data);
  })
    .catch(function (err) {
      logger.error(err);
    });
}

export function getListClientByAnalystId(req, res) {
  var analystId = req.query.id;
  let currentUserData = req.userData;

  AnalystAlignmentService.getListClientByAnalystId(analystId, currentUserData).then(data => {
    return res.send(data);
  })
    .catch(function (err) {
    });
}

export function getAnalystOverviewInfoByAnalystId(req, res) {
  var analystId = req.query.id;
  let currentUserData = req.userData;

  AnalystAlignmentService.getAnalystOverviewInfoByAnalystId(analystId, currentUserData).then(data => {
    return res.send(data);
  })
    .catch(function (err) {
    });
}
