'use strict';
import log4Js from 'log4js';
import {
  GlobalSetting
} from '../../sqldb';

var Promise = require('bluebird');

log4Js.configure({
  appenders: [
    { type: 'file', filename: 'logs/client-controller.log', category: 'client-controller' }
  ]
});
//var logger = log4Js.getLogger('client-controller');

export function getAllGlobalSettings() {
  return new Promise((resolve, reject) => {
    return GlobalSetting.findAll()
      .then(data => {
        resolve(data);
      })
      .catch(err => {
        console.log(err);
        reject(err);
      });
  });
}


