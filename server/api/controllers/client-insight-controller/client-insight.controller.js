'use strict';

import * as responseHelper from '../../../components/helper/response-helper';
import log4Js from 'log4js';
import json2Csv from 'json2csv';
import moment from 'moment';
import config from '../../../../server/config/environment/shared';
log4Js.configure({
  appenders: [
    { type: 'file', filename: 'logs/client-insight-controller.log', category: 'client-insight-controller' }
  ]
});
var logger = log4Js.getLogger('client-insight-controller');

import {
  ClientInsight,
  sequelize
} from '../../../sqldb';

var ClientInsightService = require('../../services/client-insight.service');


export function updateClientInsight(req, res) {
  var data = req.body.clientInsight;

  return ClientInsight.update({
      name: data.name,
      title: data.title,
      email: data.email,
      phone: data.phone,
      comment: data.comment
    },
    {
      where: {
        id: data.id
      }
    })
    .then(function(response) {
      res.send(response);
    })
    .catch(err => {
    });
}

export function addNewClientInsight(req, res) {
  var data = req.body.clientInsight;
  return ClientInsight.create(data)
    .then(function(response) {
      res.send(response);
    })
    .catch(err => {
    });
}

export function getListInsightsByClientId(req, res) {
  var clientId = req.query.clientId || null;
  var currentUserData = req.userData;
  ClientInsightService.getListInsightsByClientId(clientId, currentUserData).then(data => {
    res.send(data);
  }).catch(responseHelper.handleError(res));
}

export function getInsightById(req, res) {
  let id = req.query.id;
  ClientInsightService.getInsightById(id).then(data => {
    res.send(data);
  }).catch(responseHelper.handleError(res));
}


