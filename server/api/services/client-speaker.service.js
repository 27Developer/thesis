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
import { 
  ClientSpeaker,
  ClientSpeakerMedia,
  Media
 } from '../../sqldb';
var Promise = require('bluebird');

export function getListSpeakers() {
  return new Promise((resolve, reject) => {
    return ClientSpeaker.findAll(
      {
        where: {
          client_id: {
            ne: null
          }
        }
      }
    ).then((rs) => {
      resolve(rs)
    })
    .catch(err => {
      console.log(err);
      reject(err);
    });
  });
}

export function getSpeakerById(id) {
  return new Promise((resolve, reject) => {
    return ClientSpeaker.findAll({
      include: [
        {
          model: ClientSpeakerMedia,
          required: false, 
          where: {
            is_active: true,
          },
          include: [
            {
              model: Media
            }
          ]
        }
      ],
      where: {
        id: id,
      }
    }).then((rs) => {
      resolve(rs)
    })
    .catch(err => {
      console.log(err);
      reject(err);
    });
  });
}

export function getListSpeakersByClientId(client_id) {
  return new Promise((resolve, reject) => {
    return ClientSpeaker.findAll({
      where: {
        client_id: client_id,
      }
    }).then((rs) => {
      resolve(rs)
    })
    .catch(err => {
      console.log(err);
      reject(err);
    });
  });
}

export function deleteClientSpeaker(id) {
  let speaker = [];
  speaker.push(id);
  return new Promise((resolve, reject) => {
    return ClientSpeaker.update({
      client_id: null,
    },{
        where: {
          id: { $in: speaker },
        }
      }
    )
      .then((rs) => {
    resolve(rs)
  })
    .catch(err => {
      console.log(err);
      reject(err);
    });
  });
}