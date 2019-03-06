'use strict';

import log4Js from 'log4js';
import * as responseHelper from '../../../components/helper/response-helper';
import config from '../../../../server/config/environment/shared';
import json2Csv from 'json2csv';
import {
  ClientAnalystAlignmentHistory,
  Analyst,
  sequelize
} from '../../../sqldb';
import {TaskDto} from '../../dtos/taskDto';

log4Js.configure({
  appenders: [
    {type: 'file', filename: 'logs/client-report-controller.log', category: 'client-report-controller'}
  ]
});
var logger = log4Js.getLogger('client-report-controller');

var checkTaskType = function (type) {
  switch (type) {
  case config.outcomeTaskType.SHOWCASE:
    return 1;
  case config.outcomeTaskType.CITED:
    return 1;
  case config.outcomeTaskType.LEAD :
    return 1;
  case config.outcomeTaskType.PROMOTION :
    return 1;
  default:
    return 0;
  }
};

var checkQuerter = function (querter, taskDate) {
  var bool = -1;
  for (var i = 0; i < querter.length; i++) {
    if (querter[i] === taskDate) {
      bool = i;
    }
  }
  if (bool !== -1) {
    return bool;
  }
  return bool;
};

var checkAnalyst = function (analyst, taskDate) {
  var bool = -1;
  for (var i = 0; i < analyst.length; i++) {
    if (analyst[i].split('- Inactive')[0] === taskDate) {
      bool = i;
    }
  }
  if (bool !== -1) {
    return bool;
  }
  return bool;
};

var checkMonth = function (monthLabel, label) {
  var bool = -1;
  for (var i = 0; i < monthLabel.length; i++) {
    if (monthLabel[i] === label) {
      bool = i;
    }
  }
  if (bool !== -1) {
    return bool;
  }
  return bool;
};

var getLabelQuerter = function (quarter, start) {
  if (quarter >= 0 && quarter <= 1) {
    return (`${start.getFullYear()} ${config.quarter.QUARTER_1}`);
  } else if (quarter > 1 && quarter <= 2) {
    return (`${start.getFullYear()} ${config.quarter.QUARTER_2}`);
  } else if (quarter > 2 && quarter <= 3) {
    return (`${start.getFullYear()} ${config.quarter.QUARTER_3}`);
  } else {
    return (`${start.getFullYear()} ${config.quarter.QUARTER_4}`);
  }
};

var getLabelMonth = function (month) {
  switch (month) {
  case 0 :
    return config.fullMonthLabel.MONTH_1;
  case 1 :
    return config.fullMonthLabel.MONTH_2;
  case 2 :
    return config.fullMonthLabel.MONTH_3;
  case 3 :
    return config.fullMonthLabel.MONTH_4;
  case 4 :
    return config.fullMonthLabel.MONTH_5;
  case 5 :
    return config.fullMonthLabel.MONTH_6;
  case 6 :
    return config.fullMonthLabel.MONTH_7;
  case 7 :
    return config.fullMonthLabel.MONTH_8;
  case 8 :
    return config.fullMonthLabel.MONTH_9;
  case 9 :
    return config.fullMonthLabel.MONTH_10;
  case 10 :
    return config.fullMonthLabel.MONTH_11;
  case 11 :
    return config.fullMonthLabel.MONTH_12;
  }
};

export function getTaskDataByClientIdAndDate(req, res) {
  var queryString = 'SELECT t.*, tt.desc FROM task t INNER JOIN task_interaction ti ON t.id = ti.task_id AND t.client_id = ? and ti.is_active = true INNER JOIN interaction_type it ON ti.interaction_id = it.id AND it.is_active = true INNER JOIN task_type tt ON it.task_type_id = tt.id and tt.is_active = true WHERE t.date >= ? AND t.date <= ?';
  var clientId = req.query.clientId;
  var startDate = req.query.startDate;
  var endDate = req.query.endDate;
  var type = req.query.type;
  var response = {
    label: [],
    data: []
  };
  return sequelize.query(queryString, {
    replacements: [clientId, converDate(startDate), converDate(endDate)],
    type: sequelize.QueryTypes.SELECT
  })
    .then(data => {
      var result = TaskDto(data);
      if (type === config.reportType.QUARTER) {
        var star = new Date(startDate);
        star.setDate(1);
        var end = new Date(endDate);
        while ((star.getMonth() <= end.getMonth() && star.getFullYear() <= end.getFullYear()) || (star.getMonth() > end.getMonth() && star.getFullYear() < end.getFullYear())) {
          var quarter = (star.getMonth() + 1) / 3;
          response.label.push(getLabelQuerter(quarter, star));
          star.setMonth(star.getMonth() + 1);
        }
        var uSet = new Set(response.label);
        response.label = [...uSet];
        var outcomes = [];
        var interactions = [];
        for (var i = 0; i < response.label.length; i++) {
          outcomes.push(0);
          interactions.push(0);
        }
        for (var i = 0; i < result.length; i++) {
          var dateTemp = new Date(result[i].date);
          var quarter = (dateTemp.getMonth() + 1) / 3;
          if (checkTaskType(result[i].desc_type)) {
            outcomes[checkQuerter(response.label, getLabelQuerter(quarter, dateTemp))]++;
          } else {
            interactions[checkQuerter(response.label, getLabelQuerter(quarter, dateTemp))]++;
          }
        }
        response.data.push(interactions);
        response.data.push(outcomes);
      } else {
        var start = new Date(startDate);
        start.setDate(1);
        var end = new Date(endDate);
        while ((start.getMonth() <= end.getMonth() && start.getFullYear() <= end.getFullYear()) || (start.getMonth() > end.getMonth() && start.getFullYear() < end.getFullYear())) {
          response.label.push(`${getLabelMonth(start.getMonth())} ${start.getFullYear()}`);
          start.setMonth(start.getMonth() + 1);
        }
        var outcomes = [];
        var interactions = [];
        for (var i = 0; i < response.label.length; i++) {
          outcomes.push(0);
          interactions.push(0);
        }
        for (var i = 0; i < result.length; i++) {
          var dateTemp = new Date(result[i].date);
          if (checkTaskType(result[i].desc_type)) {
            outcomes[checkMonth(response.label, (`${getLabelMonth(dateTemp.getMonth())} ${dateTemp.getFullYear()}`))]++;
          } else {
            interactions[checkMonth(response.label, (`${getLabelMonth(dateTemp.getMonth())} ${dateTemp.getFullYear()}`))]++;
          }
        }
        response.data.push(interactions);
        response.data.push(outcomes);
      }
      return res.status(200).json(response);
    }
    )
    .then(responseHelper.respondWithResult(res))
    .catch(function (err) {
      responseHelper.handleError(res);
    });
}

export function getTaskDataByClientIdAndDateForAnalystReport(req, res) {
  var queryString = 'SELECT t.*, tt.desc, a.name AS analystName FROM task t INNER JOIN task_interaction ti ON t.id = ti.task_id AND t.client_id = ? AND ti.is_active = TRUE INNER JOIN interaction_type it ON ti.interaction_id = it.id AND it.is_active = TRUE INNER JOIN task_type tt ON it.task_type_id = tt.id AND tt.is_active = TRUE INNER JOIN analyst a ON t.analyst_id = a.id WHERE t.date >= ? AND t.date <= ? AND t.analyst_id';
  var queryStringAllAnalyst = 'SELECT t.*, tt.desc, a.name AS analystName FROM task t INNER JOIN task_interaction ti ON t.id = ti.task_id AND t.client_id = ? AND ti.is_active = TRUE INNER JOIN interaction_type it ON ti.interaction_id = it.id AND it.is_active = TRUE INNER JOIN task_type tt ON it.task_type_id = tt.id AND tt.is_active = TRUE INNER JOIN analyst a ON t.analyst_id = a.id WHERE t.date >= ? AND t.date <= ? AND t.analyst_id';
  var clientId = req.query.clientId;
  var startDate = req.query.startDate;
  var endDate = req.query.endDate;
  var response = {};
  var dataCount = 0;
  var nonCoreTask = {
    label: [],
    data: []
  };
  var coreTask = {
    label: [],
    data: []
  };

  return ClientAnalystAlignmentHistory.findAll({
    where: {
      client_id: clientId,
      is_active: 1,
      maturity_id:
        {
          $ne: null
        },
      importance_cd: {
        $ne: null
      }
    },
    include: [
      {
        model: Analyst
      }
    ],
    attributes: [
      'analyst_id'
    ]
  })
    .then((responseAnaLystId) => {
      let conditionStr = '(';
      if (responseAnaLystId.length === 0) {
        conditionStr = '(\'data\')';
      } else {
        for (let i = 0; i < responseAnaLystId.length; i++) {
          conditionStr = `${conditionStr + (conditionStr === '(' ? '\'' : ', \'') + responseAnaLystId[i].dataValues.analyst_id}'`;
        }
        conditionStr = `${conditionStr})`;
      }
      // core analyst
      console.log(conditionStr);
      let queryStringCore = `${queryString} in ${conditionStr}`;

      sequelize.query(queryStringCore, {
        replacements: [clientId, converDate(startDate), converDate(endDate)],
        type: sequelize.QueryTypes.SELECT
      })
        .then(data => {
          var result = TaskDto(data);
          for (let i = 0; i < responseAnaLystId.length; i++) {
            if (responseAnaLystId[i].dataValues.Analyst.dataValues.is_active) {
              coreTask.label.push(responseAnaLystId[i].dataValues.Analyst.dataValues.name);
            } else {
              coreTask.label.push(`${responseAnaLystId[i].dataValues.Analyst.dataValues.name}- Inactive`);
            }
          }
          var uSetCore = new Set(coreTask.label);
          coreTask.label = [...uSetCore];
          coreTask.label.sort();
          var outcomesCore = [];
          var interactionsCore = [];
          for (var i = 0; i < coreTask.label.length; i++) {
            outcomesCore.push(0);
            interactionsCore.push(0);
          }
          for (var i = 0; i < result.length; i++) {
            if (checkTaskType(result[i].desc_type)) {
              outcomesCore[checkAnalyst(coreTask.label, result[i].analystName)]++;
            } else {
              interactionsCore[checkAnalyst(coreTask.label, result[i].analystName)]++;
            }
          }

          for (var i = 0; i < coreTask.label.length; i++) {
            if (coreTask.label[i].indexOf('- Inactive') !== -1) {
              coreTask.label[i] = coreTask.label[i].split('- Inactive')[0];
              if (interactionsCore[i] === 0 && outcomesCore[i] === 0) {
                interactionsCore.splice(i, 1);
                outcomesCore.splice(i, 1);
                coreTask.label.splice(i, 1);
              }
            }
          }

          coreTask.data.push(interactionsCore);
          coreTask.data.push(outcomesCore);
          response.coreTask = coreTask;
          dataCount++;
          if (dataCount === 2) {
            return res.status(200).json(response);
          }
        }
        )
        .then(responseHelper.respondWithResult(res))
        .catch(function (err) {
          console.log(err);
          responseHelper.handleError(res);
        });

      // non core analyst
      let queryStringNonCore = `${queryStringAllAnalyst} not in ${conditionStr}`;

      sequelize.query(queryStringNonCore, {
        replacements: [clientId, converDate(startDate), converDate(endDate)],
        type: sequelize.QueryTypes.SELECT
      })
        .then(data => {
          var result = TaskDto(data);
          for (var i = 0; i < result.length; i++) {
            nonCoreTask.label.push(result[i].analystName);
          }
          var uSetNonCore = new Set(nonCoreTask.label);
          nonCoreTask.label = [...uSetNonCore];
          nonCoreTask.label.sort();
          var outcomesNonCore = [];
          var interactionsNonCore = [];
          for (var i = 0; i < nonCoreTask.label.length; i++) {
            outcomesNonCore.push(0);
            interactionsNonCore.push(0);
          }
          for (var i = 0; i < result.length; i++) {
            if (checkTaskType(result[i].desc_type)) {
              outcomesNonCore[checkAnalyst(nonCoreTask.label, result[i].analystName)]++;
            } else {
              interactionsNonCore[checkAnalyst(nonCoreTask.label, result[i].analystName)]++;
            }
          }
          nonCoreTask.data.push(interactionsNonCore);
          nonCoreTask.data.push(outcomesNonCore);
          response.nonCoreTask = nonCoreTask;
          dataCount++;
          if (dataCount === 2) {
            return res.status(200).json(response);
          }
        }
        )
        .then(responseHelper.respondWithResult(res))
        .catch(function (err) {
          console.log(err);
          responseHelper.handleError(res);
        });
    }
    )
    .catch((err) => {
    });
}

export function getInteractionTaskByClientIdAndDate(req, res) {
  var queryString = 'SELECT t.*, tt.desc, a.name AS analystName, f.name AS firmName FROM task t INNER JOIN task_interaction ti ON t.id = ti.task_id AND t.client_id = ? AND ti.is_active = TRUE INNER JOIN interaction_type it ON ti.interaction_id = it.id AND it.is_active = TRUE INNER JOIN task_type tt ON it.task_type_id = tt.id AND tt.is_active = TRUE INNER JOIN analyst a ON t.analyst_id = a.id LEFT JOIN analyst_history a_h ON a.id = a_h.analyst_id AND a_h.is_active_record = TRUE LEFT JOIN firm f ON a_h.firm_id = f.id AND f.is_active = TRUE WHERE t.date >= ? AND t.date <= ? AND t.analyst_id IS NOT NULL GROUP BY t.id ORDER BY analystName';
  var clientId = req.query.clientId;
  var startDate = req.query.startDate;
  var endDate = req.query.endDate;
  var response = [];
  return sequelize.query(queryString, {
    replacements: [clientId, converDate(startDate), converDate(endDate)],
    type: sequelize.QueryTypes.SELECT
  })
    .then(data => {
      response = TaskDto(data);
      return res.status(200).json(response);
    }
    )
    .then(responseHelper.respondWithResult(res))
    .catch(function (err) {
      console.log(err);
      responseHelper.handleError(res);
    });
}

var converDate = function (date) {
  let temp = date.split('/');
  return `${temp[2]}-${temp[0]}-${temp[1]}`;
};

var splitDate = function (date) {
  let temp = date.split('T')[0].split('-');
  return `${temp[1]}/${temp[2]}/${temp[0]}`;
};
