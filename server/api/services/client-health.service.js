'use strict';

import log4Js from 'log4js';
import json2Csv from 'json2csv';
import moment from 'moment';
import config from '../../../server/config/environment/shared';
log4Js.configure({
  appenders: [
    { type: 'file', filename: 'logs/client-health-controller.log', category: 'client-health-controller' }
  ]
});
//var logger = log4Js.getLogger('client-health-controller');
import { ClientHealthHistory } from '../../sqldb';
var Promise = require('bluebird');

export function getListClientHealthByClientId(clientId) {
  return new Promise((resolve, reject) => {
    //var clientId = req.query.clientId;
    return ClientHealthHistory.findAll({ where: { client_id: clientId },order: [['created_date', 'DESC']]})
      .then(res => resolve(res))
      .catch(err => reject(err));
  });
}

export function addListNewClientHealth(listNewClientHealth) {
  return new Promise((resolve, reject) => {
    return ClientHealthHistory.bulkCreate(listNewClientHealth)
      .then(res => resolve(res))
      .catch(err => reject(err));
  });
}

export function updateListClientHealth(listClientHealth) {
  return new Promise((resolve, reject) => {
    for (var i = 0; i < listClientHealth.length; i++) {
      if (listClientHealth[i].isDeleted) {
        ClientHealthHistory.destroy({
          where: {
            id: listClientHealth[i].id
          },
          order: [['date', 'ASC']]
        });
      } else {
        ClientHealthHistory
          .update(listClientHealth[i], { where: { id: listClientHealth[i].id } });
      }
    }
    return resolve();
  });
}

var caculateTotalScoreForClientHealth = function (clientHealth) {
  return clientHealth.sentiment
    + clientHealth.mechanics
    + clientHealth.message
    + clientHealth.outcome
    + clientHealth.activation;
};

var getProgramHealth = function (val) {
  let programHealthList = config.programHealthList;
  return programHealthList.filter(function (obj) {
    return obj.value === val;
  })[0].name;
};

export function exportCsv(clientId) {
  return new Promise((resolve, reject) => {
    //var clientId = req.query.clientId;
    return ClientHealthHistory.findAll({ where: { client_id: clientId }, order: [['date', 'DESC']] })
      .then(data => {
        const fields = [
          'date',
          'sentiment',
          'mechanics',
          'message',
          'outcome',
          'activation',
          'totalScore',
          'load',
          'programHealth',
          'renew03',
          'renew04',
          'comment'
        ];

        const fieldNames = [
          'Date',
          'Sentiment',
          'Mechanics',
          'Message',
          'Outcome',
          'Activation',
          'Total Score',
          'Load',
          'Program Health',
          'Likelihood to Renew (0-3 months)',
          'Likelihood to Renew (4-6 months)',
          'Comments'
        ];

        let dataExport = [];
        for (let i = 0; i < data.length; i++) {
          let dataTemp = data[i].dataValues;
          let temp = {};
          temp.date = moment(dataTemp.date).format('MM/DD/YYYY');
          temp.sentiment = dataTemp.sentiment;
          temp.mechanics = dataTemp.mechanics;
          temp.message = dataTemp.message;
          temp.outcome = dataTemp.outcome;
          temp.activation = dataTemp.activation;
          temp.totalScore = caculateTotalScoreForClientHealth(dataTemp);
          temp.load = dataTemp.load;
          temp.programHealth = getProgramHealth(dataTemp.program_health);
          temp.renew03 = dataTemp.likelyhood_renew_0_3;
          temp.renew04 = dataTemp.likelyhood_renew_4_6;
          temp.comment = dataTemp.comments ? dataTemp.comments.replace(/�/g, '-') : '';
          dataExport.push(temp);
        }
        json2Csv({ data: dataExport, fields, fieldNames }, (err, csv) => {
          if (err) {
            throw err;
          }
          resolve(csv);
        });
      })
      .catch(err => {
        reject(err);
      });
  });
}
