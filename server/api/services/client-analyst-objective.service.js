'use strict';

import log4Js from 'log4js';
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
import { ClientAnalystObjective, sequelize } from '../../sqldb';
var Promise = require('bluebird');

export function addObjective(data) {
  return new Promise(async (resolve, reject) => {
    try {
      var objective = {};
      objective.client_id = data.clientId;
      objective.analyst_id = data.analystId;
      objective.detail = data.detail;
      objective.is_active_record = true;
      objective.create_at = new Date();
      objective.update_at = new Date();
      objective.last_updated = Date.now();
      objective.last_updated_by = data.last_updated_by;
      return sequelize.transaction(async function (t) {
        await ClientAnalystObjective.create(objective, { transaction: t });
      }).then(() => {
        resolve();
      });
    } catch (err) {
      logger.error(err);
      reject(err);
    }
  });
}

export function updateObjective(id, detail) {
  var conflict = false;
  var detail;
  var last_updated_date;
  var last_updated_by;

  return new Promise(async (resolve, reject) => {
    try {
      // var id = req.body.id;
      // var detail = req.body.detail;
      return sequelize.transaction(async function (t) {
        return await ClientAnalystObjective.findOne({
          where: {
            id: id
          }
        })
          .then(result => {
            if (result) {
              data.id = result.dataValues.id;

              var comp1 = new Date(result.dataValues.last_updated);
              var comp2 = new Date(data.last_updated);

              if (result.dataValues.last_updated_by != data.last_updated_by && comp1.toString() != comp2.toString()) {
                conflict = true;
                last_updated_date = result.dataValues.last_updated;
                last_updated_by = result.dataValues.last_updated_by;
                detail = result.dataValues.detail;
                throw new Error('Unable to save, Item has been modified');
              }
            }
            detail.last_updated = Date.now();
            last_updated_date = detail.last_updated;
            detail.last_updated_by = data.last_updated_by;

            ClientAnalystObjective.update({detail, update_at: new Date()}, {where: {id}}, {transaction: t});
          })
          .then(() => {
            resolve(last_updated_date);
          })
          .catch(err => {
            err.conflict = conflict;
            err.last_updated = last_updated_date;
            err.last_updated_by = last_updated_by;
            err.detail = detail;
            reject(err);
          });
      });
    } catch (err) {
      err.conflict = conflict;
      err.last_updated = last_updated_date;
      err.last_updated_by = last_updated_by;
      err.detail = detail;
      logger.error(err);
      reject(err);
    }
  });
}

export function deleteObjective(objectiveId) {
  return new Promise(async (resolve, reject) => {
    try {
      //var id = req.query.id;
      return sequelize.transaction(async function (t) {
        await ClientAnalystObjective.update({ is_active_record: false, update_at: new Date() }, { where: { id: objectiveId } }, { transaction: t });
      }).then(() => {
        resolve();
      });
    } catch (err) {
      logger.error(err);
      reject(err);
    }
  });
}

export function getObjective(analystId, clientId) {
  // const analystId = req.params.analystId;
  // const clientId = req.params.clientId;
  return new Promise(async (resolve, reject) => {
    return ClientAnalystObjective.findAll({
      where: {
        analyst_id: analystId,
        client_id: clientId,
        is_active_record: true
      },
      order: [['create_at', 'ASC']]
    })
      .then(res => resolve(res))
      .catch(err => reject(err));
  });
}
