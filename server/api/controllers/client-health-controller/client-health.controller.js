'use strict';

import * as responseHelper from '../../../components/helper/response-helper';
import log4Js from 'log4js';
import json2Csv from 'json2csv';
import moment from 'moment';
import config from '../../../../server/config/environment/shared';
log4Js.configure({
  appenders: [
    { type: 'file', filename: 'logs/client-health-controller.log', category: 'client-health-controller' }
  ]
});
var logger = log4Js.getLogger('client-health-controller');
import { ClientHealthHistory,ClientType } from '../../../sqldb';
var ClientHealthService = require('../../services/client-health.service');

export function getListClientHealthByClientId(req, res) {
  var clientId = req.query.clientId;
  ClientHealthService.getListClientHealthByClientId(clientId)
    .then(responseHelper.respondWithResult(res))
    .catch(responseHelper.handleError(res));
}

export function addListNewClientHealth(req, res) {
  try {
    var listNewClientHealth = req.body.listNewClientHealth;

    return ClientHealthHistory.bulkCreate(listNewClientHealth)
      .then(responseHelper.respondWithResult(res))
      .catch(responseHelper.handleError(res));
  } catch (err) {
    logger.error(err);
  }
}


export function updateListClientHealth(req, res) {
  var listClientHealth = req.body.listClientHealth;
  ClientHealthService.updateListClientHealth(listClientHealth)
    .then(() => {
      res.status(200).json(null);
    })
    .catch(responseHelper.handleError(res));
}

export function exportCsv(req, res) {
  var clientId = req.query.clientId;
  ClientHealthService.exportCsv(clientId)
    .then((csv) => {
      res.send(csv);
    })
    .catch(responseHelper.handleError(res));
}
