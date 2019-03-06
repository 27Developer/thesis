'use strict';

import log4Js from 'log4js';
import * as responseHelper from '../../../components/helper/response-helper';
import * as changeLogHelper from '../../../components/helper/change-log-helper';
import config from '../../../../server/config/environment/shared';
log4Js.configure({
  appenders: [
    {type: 'file', filename: 'logs/client-objective-controller.log', category: 'client-objective-controller'}
  ]
});
var logger = log4Js.getLogger('client-objective-controller');
import {Objective, ClientObjective, sequelize} from '../../../sqldb';

export function getListObjectivesByClientId(req, res) {
  try {
    var clientId = req.query.clientId;
    return ClientObjective.findAll({
      include: [
        {
          model: Objective,
          attributes: ['id', 'name'],
          where: {is_active: true}
        },
      ], where: {client_id: clientId, is_active: true},
      order: [['create_at', 'ASC']]
    })
      .then(responseHelper.respondWithResult(res))
      .catch(responseHelper.handleError(res));
  } catch (err) {
    logger.error(err);
  }
}

export function getListObjectiveGlobal(req, res) {
  try {
    return Objective.findAll({where: {client_id: null, is_active: true}})
      .then(responseHelper.respondWithResult(res))
      .catch(responseHelper.handleError(res));
  } catch (err) {
    logger.error(err);
  }
}

export function deleteObjective(req, res) {
  try {
    var objectiveId = req.query.objectiveId;
    var clientId = req.query.clientId;
    var id = req.query.id;

    return sequelize.transaction(async function (t) {
      await Objective.update({is_active: false, update_at: new Date()}, {
        where: {
          id: objectiveId,
          client_id: clientId
        }
      }, {transaction: t});
      await ClientObjective.update({is_active: false, update_at: new Date()}, {
        where: {
          id,
        }
      }, {transaction: t});
    })
      .then(() => {
        res.send();
      })
      .catch(responseHelper.handleError(res));
  } catch (err) {
    logger.error(err);
  }
}

export function addNewObjective(req, res) {
  try {
    var type = req.body.type;

    var clientObjective = {};
    clientObjective.client_id = req.body.clientId;
    clientObjective.is_active = true;
    clientObjective.detail = req.body.detail;
    clientObjective.update_at = new Date();
    clientObjective.create_at = new Date();
    clientObjective.last_updated = Date.now();
    clientObjective.last_updated_by = req.body.last_updated_by;
    if (type === config.typeSaveObjective.CLIENT) {
      var objective = {};
      objective.name = req.body.objective || '';
      objective.client_id = req.body.clientId;
      objective.is_active = true;
      objective.update_at = new Date();
      objective.create_at = new Date();
      return sequelize.transaction(async function (t) {
        var obj = await Objective.create(objective, {transaction: t});
        clientObjective.objective_id = obj.id;
        await ClientObjective.create(clientObjective, {transaction: t});
      })
        .then(() => {
          res.send();
        })
        .catch(responseHelper.handleError(res));
    } else {
      return sequelize.transaction(async function (t) {
        clientObjective.objective_id = req.body.objective;
        await ClientObjective.create(clientObjective, {transaction: t});
      })
        .then(() => {
          res.send();
        })
        .catch(responseHelper.handleError(res));
    }
  } catch (err) {
    logger.error(err);
  }
}

export function updateObjective(req, res) {
  var conflict = false;
  var detail;
  var last_updated_date;
  var last_updated_by;
  try {
    var id = req.body.objective;
    var detail = req.body.detail || '';
    return sequelize.transaction(async function (t) {
      return await ClientObjective.findOne({
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
          data.last_updated = Date.now();
          last_updated_date = data.last_updated;
          data.last_updated_by = data.last_updated_by;
          ClientObjective.update({detail, update_at: new Date()}, {where: {id}}, {transaction: t});
        })
        .then(() => {
          responseHelper.respondWithResult(last_updated_date);
        })
        .catch(err)
        {
          err.conflict = conflict;
          err.last_updated = last_updated_date;
          err.last_updated_by = last_updated_by;
          err.detail = detail;
          responseHelper.handleError(err)
        }
    });
  } catch (err) {
    err.conflict = conflict;
    err.last_updated = last_updated_date;
    err.last_updated_by = last_updated_by;
    err.detail = detail;
    responseHelper.handleError(err)
  }
}

export function changeObjective(req, res) {
  var conflict = false;
  var detail;
  var last_updated_date;
  var last_updated_by;

  try {

    var id = req.body.id;
    var detail = req.body.detail;
    return sequelize.transaction(async function (t) {
      return await ClientObjective.findOne({
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
          data.last_updated = Date.now();
          last_updated_date = data.last_updated;
          last_updated_by = data.last_updated_by;
          ClientObjective.update({update_at: new Date(), detail}, {where: {id}}, {transaction: t});

          let logObj = {
            section: config.section.OBJECTIVE,
            summary: `${req.body.objectiveName} was changed detail to ${detail}`,
            user: req.body.user,
            page: config.pageTemplate.CLIENT_PROFILE,
            object_id: req.body.client_id,
          };
          changeLogHelper.createChangeLog(logObj);
        })
        .then(() => {
          responseHelper.respondWithResult(last_updated_date);
        })
        .catch(err => {
          console.log(err);
          err.conflict = conflict;
          err.last_updated = last_updated_date;
          err.last_updated_by = last_updated_by;
          err.detail = detail;
          responseHelper.handleError(err)
        });
        })
      } catch (err) {
        logger.error(err);
        err.conflict = conflict;
        err.last_updated = last_updated_date;
        err.last_updated_by = last_updated_by;
        err.detail = detail;
        responseHelper.handleError(err)
      }
}

