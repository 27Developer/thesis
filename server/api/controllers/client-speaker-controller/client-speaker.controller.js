'use strict';

import * as responseHelper from '../../../components/helper/response-helper';
import log4Js from 'log4js';
import json2Csv from 'json2csv';
import moment from 'moment';
import config from '../../../../server/config/environment/shared';
log4Js.configure({
  appenders: [
    { type: 'file', filename: 'logs/client-speaker-controller.log', category: 'client-speaker-controller' }
  ]
});
var logger = log4Js.getLogger('client-speaker-controller');

import {
  ClientHealthHistory,
  ClientSpeaker,
  sequelize
} from '../../../sqldb';

var ClientSpeakerService = require('../../services/client-speaker.service');
import {toClientSpeakerDetailDto} from '../../dtos/clientSpeakerDetailDto';


export async function getAll(req, res) {

  await ClientSpeaker.findAll({
    where: {
      client_id: {
          ne: null
        }
      }
    })
      .then(function (data) {
        return data;
      })
      .then(responseHelper.handleEntityNotFound(res))
      .then(responseHelper.respondWithResult(res))
      .catch(err => {
          responseHelper.handleError(res)(err);
      });
}

export function updateClientSpeaker(req, res) {
  var data = req.body.clientSpeaker;

  return ClientSpeaker.update({
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

export function addNewClientSpeaker(req, res) {
  var data = req.body.clientSpeaker;
  return ClientSpeaker.create(data)
    .then(function(response) {
      res.send(response);
    })
    .catch(err => {
    });
}

export function getListSpeakersByClientId(req, res) {
  let client_id = req.query.clientId;
  ClientSpeakerService.getListSpeakersByClientId(client_id).then(data => {
    res.send(data);
  }).catch(responseHelper.handleError(res));
}

export function getSpeakerById(req, res) {
  let id = req.query.id;
  ClientSpeakerService.getSpeakerById(id).then(data => {
    res.send(data);
  }).catch(responseHelper.handleError(res));
}

export function deleteClientSpeaker(req, res) {
  let id = req.query.id;
  ClientSpeakerService.deleteClientSpeaker(id).then(data => {
    res.send(data);
  }).catch(responseHelper.handleError(res));
}

