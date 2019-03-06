'use strict';

import log4Js from 'log4js';
import * as responseHelper from '../../../components/helper/response-helper';
import config from '../../../../server/config/environment/shared';
log4Js.configure({
  appenders: [
    { type: 'file', filename: 'logs/client-resource-controller.log', category: 'client-resource-controller' }
  ]
});
var logger = log4Js.getLogger('client-resource-controller');
import { ClientResouce, sequelize } from '../../../sqldb';

export function addNewResource(req, res) {
  try {
    var clientResouce = {};
    clientResouce.client_id = req.body.clientId;
    clientResouce.is_active = true;
    clientResouce.detail = req.body.detail;
    clientResouce.resource_name = req.body.resource_name;
    clientResouce.create_at = new Date();
    return sequelize.transaction(async function (t) {
      await ClientResouce.create(clientResouce, { transaction: t });
    })
      .then(() => {
        res.send();
      })
      .catch(responseHelper.handleError(res));
  } catch (err) {
    logger.error(err);
  }
}
export function getListClientResourceByClientId(req, res) {
  try {
    var clientId = req.query.clientId;
    return ClientResouce.findAll({
      where: { client_id: clientId, is_active: true },
      order: [['create_at', 'ASC']]
    })
      .then(responseHelper.respondWithResult(res))
      .catch(responseHelper.handleError(res));
  } catch (error) {
    logger.error(error);
  }
}
export function deleteResource(req, res) {
  try {
    var id = req.query.id;
    return sequelize.transaction(async function (t) {
      await ClientResouce.update({ is_active: false, update_at: new Date() }, {
        where: {
          id,
        }
      }, { transaction: t });
    })
      .then(() => {
        res.send();
      })
      .catch(responseHelper.handleError(res));
  } catch (err) {
    logger.error(err);
  }
}

export function updateResource(req, res) {
  try {
    var detail = req.body.detail || '';
    var id = req.body.id;
    return sequelize.transaction(async function (t) {
      await ClientResouce.update({detail, update_at: new Date()}, {where: {id}}, {transaction: t});
    })
      .then(() => {
        res.send();
      })
      .catch(responseHelper.handleError(res));
  } catch (err) {
    logger.error(err);
  }
}
