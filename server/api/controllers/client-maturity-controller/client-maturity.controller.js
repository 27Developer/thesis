'use strict';

import log4Js from 'log4js';
import uuid from 'uuid/v1';
import * as responseHelper from '../../../components/helper/response-helper';
import { ListClientMaturityDto } from '../../dtos/clienMaturityDto';
import json2Csv from 'json2csv';

log4Js.configure({
  appenders: [
    { type: 'file', filename: 'logs/client-maturity-controller.log', category: 'client-maturity-controller' }
  ]
});
var logger = log4Js.getLogger('client-maturity-controller');
import {
  MaturityByAnalyst,
  sequelize,
  ClientAnalystAlignmentHistory,
  AnalystHistory,
  ImportanceByAnalystCd,
  Analyst,
  ReasonChangeMaturity
} from '../../../sqldb';

export function getListClientMaturityByClientId(req, res) {
  const clientId = req.query.clientId;
  var dataCount = 0;
  var responseData = {
    ClientAnalystAlignmentHistory: [],
    maturity: []
  };

  var queryGetMaturuty = `SELECT * FROM maturity_by_analyst as a where (client_id is null or client_id = '${clientId}') order by a.desc`;

  sequelize.query(queryGetMaturuty, { type: sequelize.QueryTypes.SELECT })
    .then(maturityData => {
      responseData.maturity = JSON.parse(JSON.stringify(maturityData));
      for (var i = 0; i < maturityData.length; i++) {
        var item = maturityData[i];
        if (item.clone_to !== null || item.clone_to !== 'null') {
          for (var j = 0; j < responseData.maturity.length; j++) {
            if (item.clone_to === responseData.maturity[j].id) {
              responseData.maturity.splice(j, 1);
            }
          }
        }
      }
      responseData.maturity = responseData.maturity.filter(function (item) {
        var buf = new Buffer.from(JSON.stringify(item.is_active));
        var temp = JSON.parse(buf.toString());
        if (temp.data[0]) {
          return true;
        }
      });

      dataCount++;
      if (dataCount === 2) {
        logger.info(responseData);
        return res.status(200).json(responseData);
      }
    })
    .then(responseHelper.respondWithResult(res))
    .catch(function (err) {
      console.log(err);
      responseHelper.handleError(res);
    });

  var queryString = `
      SELECT 
      a.id, 
      b.desc, 
      b.code, 
      c.id AS maturityByAnalystId, 
      c.desc AS maturityByAnalystDesc, 
      d.id AS analystId, 
      d.name,
      e.title,
      g.name as firm_name
      FROM 
      client_analyst_alignment_history AS a 
      LEFT JOIN 
      importance_by_analyst_cd AS b ON a.importance_cd = b.code 
      AND b.is_active = TRUE 
      LEFT JOIN 
      maturity_by_analyst AS c ON a.maturity_id = c.id 
      AND c.is_active = TRUE 
      LEFT JOIN 
      analyst AS d ON d.id = a.analyst_id
      LEFT JOIN 
      analyst_history AS e ON e.analyst_id = a.analyst_id and e.is_active_record=true
      LEFT JOIN 
      firm AS g ON g.id = e.firm_id and g.is_active=true
      WHERE 
      a.is_active = TRUE 
      AND d.is_active = TRUE 
      AND a.client_id = '${clientId}' 
      AND a.importance_cd IS NOT NULL 
      AND a.maturity_id IS NOT NULL;`;
  sequelize.query(queryString, { type: sequelize.QueryTypes.SELECT })
    .then(data => {
      responseData.ClientAnalystAlignmentHistory = ListClientMaturityDto(data);
      dataCount++;
      if (dataCount === 2) {
        logger.info(responseData);
        return res.status(200).json(responseData);
      }
    })
    .then(responseHelper.respondWithResult(res))
    .catch(function (err) {
      console.log(err);
      responseHelper.handleError(res);
    });
}

var exportFunc = function (data, req, res) {
  try {
    const fields = [
      'firstName',
      'lastName',
      'firm',
      'importance',
      'maturity',
    ];

    const fieldNames = [
      'Analyst First Name',
      'Analyst Last Name',
      'Research Firm',
      'Importance',
      'Maturity',
    ];

    let dataExport = [];
    for (let i = 0; i < data.length; i++) {
      let dataTemp = data[i];
      let temp = {};
      let analystNameTemp = dataTemp.analyst.name ? dataTemp.analyst.name.split(' ') : [];
      temp.firstName = analystNameTemp[0];
      analystNameTemp.splice(0, 1);
      temp.lastName = analystNameTemp.length > 0 ? analystNameTemp.toString().replace(',', ' ') : analystNameTemp[0];
      temp.firm = dataTemp.firm.firm;
      temp.importance = dataTemp.importanceByAnalystCd.code === 1 ? 'L' : dataTemp.importanceByAnalystCd.code === 2 ? 'M' : 'H';
      temp.maturity = dataTemp.maturityByAnalyst.desc.replace('–', '-');
      dataExport.push(temp);
    }
    json2Csv({ data: dataExport, fields, fieldNames }, function (err, csv) {
      if (err) {
        console.log(err);
      }
      res.send(csv);
    });
  } catch (err) {
    console.log(err);
  }
};

export function exportCSV(req, res) {
  const clientId = req.query.clientId;

  var queryString = `${'SELECT a.id, b.desc, b.code, c.id AS maturityByAnalystId, c.desc AS maturityByAnalystDesc,'
    + ' d.id AS analystId,'
    + ' d.name,'
    + ' f.name as firm'
    + ' FROM'
    + ' client_analyst_alignment_history AS a'
    + ' LEFT JOIN'
    + ' importance_by_analyst_cd AS b ON a.importance_cd = b.code'
    + ' AND a.client_id = \''}${clientId}'`
    + ' LEFT JOIN'
    + ' maturity_by_analyst AS c ON a.maturity_id = c.id'
    + ' LEFT JOIN'
    + ' analyst AS d ON d.id = a.analyst_id'
    + ' left join analyst_history as e on d.id = e.analyst_id AND e.is_active_record = true '
    + ' left join firm as f on e.firm_id = f.id'
    + ' WHERE'
    + ' a.is_active = TRUE'
    + ' AND b.is_active = TRUE'
    + ' AND c.is_active = TRUE'
    + ' AND d.is_active = TRUE'
    + ' GROUP BY (d.name)';

  sequelize.query(queryString, { type: sequelize.QueryTypes.SELECT })
    .then(data => {
      exportFunc(ListClientMaturityDto(data), req, res);
    })
    .then(responseHelper.respondWithResult(res))
    .catch(function (err) {
      console.log(err);
      responseHelper.handleError(res);
    });
}

export function deleteClientMaturity(req, res) {
  try {
    const clientMaturityId = req.query.clientMaturityId;
    return sequelize.transaction(function (t) {
      return ClientAnalystAlignmentHistory.update({
        is_active: false
      },
      {
        where: {
          id: clientMaturityId
        },
        transaction: t
      });
    })
      .then(() => {
        res.send();
      })
      .catch(responseHelper.handleError(res));
  } catch (err) {
    logger.error(err);
  }
}

export function getListClientAnalystAlignmentHistory(req, res) {
  try {
    var dataCount = 0;
    var responseData = {
      analystHistory: [],
      importance: [],
      maturity: []
    };
    AnalystHistory.findAll({ include: [{ model: Analyst }], where: { is_active_record: true }, attributes: [] })
      .then(analystHistoryData => {
        responseData.analystHistory = analystHistoryData.filter(function (data) {
          return data.Analyst.is_active;
        });
        dataCount++;
        if (dataCount === 3) {
          logger.info(responseData);
          return res.status(200).json(responseData);
        }
      })
      .catch(function (err) {
        logger.error(err);
      });

    ImportanceByAnalystCd.findAll({ where: { is_active: true } })
      .then(importanceData => {
        responseData.importance = importanceData;
        dataCount++;
        if (dataCount === 3) {
          logger.info(responseData);
          return res.status(200).json(responseData);
        }
      })
      .catch(function (err) {
        logger.error(err);
      });

    MaturityByAnalyst.findAll({ where: { is_active: true } })
      .then(maturityData => {
        responseData.maturity = maturityData;
        dataCount++;
        if (dataCount === 3) {
          logger.info(responseData);
          return res.status(200).json(responseData);
        }
      })
      .catch(function (err) {
        logger.error(err);
      });
  } catch (err) {
    logger.error(err);
  }
}

export function saveClientMaturity(req, res) {
  try {
    const data = req.body.addEditClientAnalystHealthHistory;
    var clientMaturity = {};
    clientMaturity.id = uuid() || '';
    clientMaturity.client_id = (data.client_id === undefined || data.client_id === null) ? null : data.client_id;
    clientMaturity.analyst_id = data.current_analyst_id;
    clientMaturity.importance_cd = data.current_importance_cd;
    clientMaturity.maturity_id = data.current_maturity_id;
    clientMaturity.is_active = true;
    clientMaturity.insert_date = new Date();
    return sequelize.transaction(async function (t) {
      var check = await ClientAnalystAlignmentHistory.findAll({
        where: {
          client_id: data.client_id,
          analyst_id: data.current_analyst_id
        }
      })
        .then((data) => {
          if (data.length > 0) {
            ClientAnalystAlignmentHistory.update({
              importance_cd: clientMaturity.importance_cd,
              maturity_id: clientMaturity.maturity_id,
              is_active: true,
              insert_date: new Date()
            }, {
              where: {
                id: data[data.length - 1].dataValues.id,
              }
            }, { transaction: t });
          } else {
            ClientAnalystAlignmentHistory.create(clientMaturity, { transaction: t });
          }
        });
    })
      .then(() => {
        res.send();
      })
      .catch(responseHelper.handleError(res));
  } catch (err) {
    logger.error(err);
  }
}

export function updateClientMaturity(req, res) {
  try {
    const data = req.body.addEditClientAnalystHealthHistory;
    var clientMaturity = {};
    var reasonChangeMaturity = {};
    clientMaturity.client_id = data.client_id;
    clientMaturity.client_id = (data.client_id === undefined || data.client_id === null) ? null : data.client_id;
    clientMaturity.analyst_id = data.current_analyst_id;
    clientMaturity.importance_cd = data.current_importance_cd;
    clientMaturity.maturity_id = data.current_maturity_id;
    clientMaturity.is_active = true;
    clientMaturity.insert_date = new Date();

    reasonChangeMaturity.reason_change_maturity = data.reason_change_maturity;
    reasonChangeMaturity.client_id = (data.client_id === undefined || data.client_id === null) ? null : data.client_id;
    reasonChangeMaturity.analyst_id = data.current_analyst_id;
    reasonChangeMaturity.maturity_old = data.maturity_old;
    reasonChangeMaturity.maturity_new = data.current_maturity_id;
    reasonChangeMaturity.create_at = new Date();

    return sequelize.transaction(async function (t) {
      await ClientAnalystAlignmentHistory.update(clientMaturity, { where: { id: data.id } }, { transaction: t });
      await ReasonChangeMaturity.create(reasonChangeMaturity, { transaction: t });
    })
      .then(() => {
        res.send();
      })
      .catch(responseHelper.handleError(res));
  } catch (err) {
    logger.error(err);
  }
}

export function saveMaturityLabel(req, res) {
  try {
    var maturity = {};
    maturity.id = uuid() || '';
    maturity.desc = req.body.marurity.desc;
    maturity.detail = req.body.marurity.detail;
    maturity.client_id = req.body.clientId;
    maturity.is_active = true;
    return sequelize.transaction(async function (t) {
      await MaturityByAnalyst.create(maturity, { transaction: t });
    })
      .then(() => {
        res.send();
      })
      .catch(responseHelper.handleError(res));
  } catch (err) {
    logger.error(err);
  }
}

export function deleteMaturityLabel(req, res) {
  try {
    const maturity = JSON.parse(req.query.maturity);
    const clientId = req.query.clientId;
    var maturityObj = {};
    maturityObj.id = uuid() || '';
    maturityObj.desc = maturity.desc;
    maturityObj.client_id = clientId;
    maturityObj.is_active = false;
    maturityObj.clone_to = maturity.id;
    if (maturity.client_id === null) {
      return sequelize.transaction(async function (t) {
        await MaturityByAnalyst.create(maturityObj, { transaction: t });
      })
        .then(() => {
          res.send();
        })
        .catch(responseHelper.handleError(res));
    } else {
      return sequelize.transaction(async function (t) {
        await MaturityByAnalyst.update({ is_active: false }, { where: { id: maturity.id } }, { transaction: t });
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

export function updateMaturityLabel(req, res) {
  try {
    const maturity = req.body.maturity;
    const clientId = req.body.clientId;

    var maturityObj = {};
    maturityObj.id = uuid() || '';
    maturityObj.desc = maturity.desc;
    maturityObj.client_id = clientId;
    maturityObj.is_active = true;
    maturityObj.clone_to = maturity.id;
    maturityObj.detail = maturity.detail;
    if (maturity.client_id === null) {
      return sequelize.transaction(async function (t) {
        await MaturityByAnalyst.create(maturityObj, { transaction: t });
        await ClientAnalystAlignmentHistory.update({ maturity_id: maturityObj.id }, {
          where: {
            client_id: clientId, maturity_id: maturity.id
          }, transaction: t
        });
      })
        .then(() => {
          res.send();
        })
        .catch(responseHelper.handleError(res));
    } else {
      return sequelize.transaction(async function (t) {
        await MaturityByAnalyst.update({
          desc: maturity.desc,
          detail: maturity.detail
        }, { where: { id: maturity.id } }, { transaction: t });
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

export function checkClientMaturity(req, res) {
  const maturityId = req.query.maturityId;
  const clientId = req.query.clientId;
  ClientAnalystAlignmentHistory.findAll({ where: { is_active: true, maturity_id: maturityId, client_id: clientId } })
    .then(maturityData => {
      if (maturityData.length > 0) {
        return res.status(200).json(true);
      } else {
        return res.status(200).json(false);
      }
    })
    .catch(function (err) {
      logger.error(err);
    });
}

