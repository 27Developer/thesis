'use strict';
import {
  sequelize,
  User,
} from '../../sqldb';

var Promise = require('bluebird');
import log4Js from 'log4js';
log4Js.configure({
  appenders: [
    { type: 'file', filename: 'logs/report-controller.log', category: 'report-controller' }
  ]
});

export function getAllUsersFromDb(reportId) {
  return new Promise((resolve, reject) => {
    var query = {
      attributes: ['id', 'full_name', 'email'],
      where: { is_active: true }
    }

    return User.findAll(query)
      .then(data => {
        resolve(data);
      })
      .catch((err) => {
        console.log(err);
        reject(err);
      });
  });
}

export async function migrateDataFromAws() {
  let data = await awsCognitoService.getListUser();
  if (!data.statusCode) {
    for (let i = 0; i < data.Users.length; i++) {
      let item = data.Users[i];
      let obj = {};
      for (let j = 0; j < item.Attributes.length; j++) {
        let temp = item.Attributes[j];
        switch (temp.Name) {
          case 'email':
            obj.email = temp.Value;
            break;
          case 'given_name':
            obj.firstName = temp.Value;
            break;
          case 'name':
            obj.lastName = temp.Value;
            break;
        }
      }
      await User.update({ full_name: obj.firstName + ' ' + obj.lastName }, { where: { email: obj.email } }, { transaction: t });
    }
  }
  return true;
}