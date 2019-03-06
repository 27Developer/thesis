'use strict';

import log4Js from 'log4js';
import * as responseHelper from '../../../components/helper/response-helper';
import config from '../../../../server/config/environment/shared';
log4Js.configure({
  appenders: [
    {
      type: 'file',
      filename: 'logs/client-analyst-objective-controller.log',
      category: 'client-analyst-objective-controller'
    }
  ]
});
var logger = log4Js.getLogger('client-analyst-objective-controller');
import { ClientAnalystObjective, sequelize } from '../../../sqldb';
var ClientAnalystObjectiveService = require('../../services/client-analyst-objective.service');

export function addObjective(req, res) {
  var data = req.body.objective;
  ClientAnalystObjectiveService.addObjective(data).then(rs => {
    res.send();
  })
    .catch(responseHelper.handleError(res));
}

export function updateObjective(req, res) {
  var id = req.body.id;
  var detail = req.body.detail;
  ClientAnalystObjectiveService.updateObjective(id, detail).then(rs => {
    res.send();
  })
    .catch(responseHelper.handleError(res));
}

export function deleteObjective(req, res) {
  var id = req.query.id;
  ClientAnalystObjectiveService.deleteObjective(id).then(rs => {
    res.send();
  })
    .catch(responseHelper.handleError(res));
}

export function getObjective(req, res) {
  const analystId = req.params.analystId;
  const clientId = req.params.clientId;
  ClientAnalystObjectiveService.getObjective(analystId, clientId)
    .then(responseHelper.respondWithResult(res))
    .catch(responseHelper.handleError(res));
}
