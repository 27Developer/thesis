'use strict';
import log4Js from 'log4js';
import * as responseHelper from '../../../components/helper/response-helper';
import uuid from 'uuid/v1';
import {
  User,
  Client,
  Role,
  sequelize
} from '../../../sqldb';

log4Js.configure({
  appenders: [
    {type: 'file', filename: 'logs/user-controller.log', category: 'user-controller'}
  ]
});

import awsCognitoService from '../../../components/aws-cognito/aws-cognito-register';

import config from '../../../config/environment';
var UserService = require('../../services/user.service');

export async function getAllUsers(req, res) {
  let filter = req.query.filter;
  let data = await awsCognitoService.getListUser(filter);
  let dataCount = 0;
  let response = {
    data: [],
  };
  if (!data.statusCode) {
    for (let i = 0; i < data.Users.length; i++) {
      let item = data.Users[i];
      let objTemp = {
        User: {},
        Client: [],
      };
      let obj = {
        is_active: (!item.Enabled || item.UserStatus === 'UNCONFIRMED') ? 'false' : 'true',
        status: item.UserStatus,
      };
      for (let j = 0; j < item.Attributes.length; j++) {
        let temp = item.Attributes[j];
        switch (temp.Name) {
          case 'email' :
            obj.email = temp.Value;
            break;
          case 'nickname' :
            obj.nickName = temp.Value;
            break;
          case 'phone_number' :
            obj.phone = temp.Value;
            break;
          case 'given_name' :
            obj.firstName = temp.Value;
            break;
          case 'name' :
            obj.lastName = temp.Value;
            break;
          case 'custom:role' :
            obj.role = temp.Value;
            break;
          case 'custom:client_id' :
            obj.clientId = temp.Value;
            break;
          case 'custom:collection_id' :
            obj.collectionId = temp.Value;
            break;
        }
      }
      objTemp.User = obj;
      response.data.push(objTemp);
    }

    dataCount++;
    if (dataCount === 2) {
      return res.status(200).json(response);
    }

    Client.findAll({where: {is_active: true}})
      .then(client => {
        User.findAll()
          .then(users => {
            Role.findAll()
              .then(roles => {
                for (let i = 0; i < client.length; i++) {
                  let clientObj = client[i].dataValues;
                  for (let j = 0; j < response.data.length; j++) {
                    let userObj = response.data[j].User;
                    if (userObj.clientId && userObj.clientId.indexOf(clientObj.id) !== -1) {
                      response.data[j].Client.push(clientObj);
                    }
                    for (let m = 0; m < users.length; m++) {
                      if (users[m].dataValues.email === userObj.email) {
                        userObj.last_login = users[m].dataValues.last_login;
                        break;
                      }
                    }
                    for (let n = 0; n < roles.length; n++) {
                      if (roles[n].dataValues.code === userObj.role) {
                        userObj.role = roles[n].dataValues;
                        break;
                      }
                    }
                  }
                }

                dataCount++;
                if (dataCount === 2) {
                  return res.status(200).json(response);
                }
              })
              .catch(function (err) {
              });
          })
          .catch(function (err) {
          });
      })
      .catch(function (err) {
      });
  } else {
    return res.status(400).json(data.message);
  }
}

export function getUserByEmail(req, res) {
  let email = req.query.email;
  let role = req.query.role;
  let userObj = {};
  User.findAll({where: {email}})
    .then(user => {
      userObj = user.length > 0 ? user[0].dataValues : {};
      Role.findAll({where: {code: role}})
        .then(role => {
          userObj.role = role.length > 0 ? role[0].dataValues : {};
          return res.status(200).json(userObj);
        })
        .catch(function (err) {
        });
    })
    .catch(function (err) {
    });
}

export function getClientByUserId(req, res) {
  let user = JSON.parse(req.query.user);
  let ids = '(\'\')';
  if (user.clientId && user.clientId !== '' && user.clientId !== 'All') {
    let listCLientId = user.clientId.split(', ');
    ids = '(';
    for (let i = 0; i < listCLientId.length; i++) {
      ids = `${ids + (i === 0 ? '\'' : ', \'') + listCLientId[i]}'`;
    }
    ids = `${ids})`;
  }
  let queryStr = `SELECT * FROM client where id in ${ids}`;
  sequelize.query(queryStr, {type: sequelize.QueryTypes.SELECT})
    .then(data => {
      return res.status(200).json(data);
    })
    .catch(function (err) {
      responseHelper.handleError(res);
    });
}

export function createUserAdmin(req, res) {
  var data = req.body.userModel;
  let user = {
    email: data.User.email,
    firstName: data.User.firstName,
    lastName: data.User.lastName,
    phone: data.User.phone,
    password: config.passwordDefault,
    nickName: data.User.nickName,
    role: data.User.role.code,
    clientId: data.client_id,
    collectionId: data.collection_id
  };

  var userModel = {};
  userModel.id = uuid() || '';
  userModel.email = data.User.email;
  userModel.is_active = true;
  userModel.first_login = false;
  return sequelize.transaction(async function (t) {
    let createObj = await awsCognitoService.createUser(user);
    if (createObj.statusCode) {
      return res.status(400).json(createObj.message);
    } else {
      let newUser = await User.create(userModel, {transaction: t});
    }
  })
    .then(() => {
      res.send();
    })
    .catch(responseHelper.handleError(res));
}

export async function updateUser(req, res) {
  var data = req.body.userModel;
  try {
    for (var property in data.User) {
      switch (property) {
        case 'lastName':
          await awsCognitoService.updateAttribute(data.User.email, 'name', data.User[property]);
          break;
        case 'nickName':
          await awsCognitoService.updateAttribute(data.User.email, 'nickname', data.User[property]);
          break;
        case 'firstName':
          await awsCognitoService.updateAttribute(data.User.email, 'given_name', data.User[property]);
          break;
        case 'phone':
          await awsCognitoService.updateAttribute(data.User.email, 'phone_number', data.User[property]);
          break;
        case 'role':
          await awsCognitoService.updateAttribute(data.User.email, 'custom:role', data.User[property].code);
          break;
      }
    }
    await awsCognitoService.updateAttribute(data.User.email, 'custom:client_id', data.client_id);
    await awsCognitoService.updateAttribute(data.User.email, 'custom:collection_id', data.collection_id);

    res.send(true);
  } catch (err) {
    res.status(500).json(err);
  }
}

export async function resendInvite(req, res) {
  var email = req.query.email;
  let data = await awsCognitoService.resendConfirmationCode(email);
  if (data.statusCode) {
    return res.status(400).json(data.message);
  } else {
    return res.status(200).json('');
  }
}

export async function updateUserStatus(req, res) {
  var email = req.query.email;
  var status = req.query.status;
  let data = {};
  if (status === 'true') {
    data = await awsCognitoService.adminEnableUser(email);
  } else {
    data = await awsCognitoService.adminDisableUser(email);
  }
  if (data.statusCode) {
    return res.status(400).json(data.message);
  } else {
    return res.status(200).json('');
  }
}

export function getAllUsersFromDb(req, res) {
  UserService.getAllUsersFromDb().then(data => {
    res.send(data);
  }).catch(responseHelper.handleError(res));
}

export async function getListUserFilter(req, res) {
  let filter = req.query.filter;
  let data = await awsCognitoService.getListUserFilter(filter);
  let dataCount = 0;
  let response = {
    data: [],
  };
  if (!data.statusCode) {
    for (let i = 0; i < data.Users.length; i++) {
      let item = data.Users[i];
      let objTemp = {
        User: {},
        Client: [],
      };
      let obj = {
        is_active: (!item.Enabled || item.UserStatus === 'UNCONFIRMED') ? 'false' : 'true',
        status: item.UserStatus,
      }
      for (let j = 0; j < item.Attributes.length; j++) {
        let temp = item.Attributes[j];
        switch (temp.Name) {
          case 'email' :
            obj.email = temp.Value;
            break;
          case 'nickname' :
            obj.nickName = temp.Value;
            break;
          case 'phone_number' :
            obj.phone = temp.Value;
            break;
          case 'given_name' :
            obj.firstName = temp.Value;
            break;
          case 'name' :
            obj.lastName = temp.Value;
            break;
          case 'custom:role' :
            obj.role = temp.Value;
            break;
          case 'custom:client_id' :
            obj.clientId = temp.Value;
            break;
          case 'custom:collection_id' :
            obj.collectionId = temp.Value;
            break;
        }
      }
      objTemp.User = obj;
      response.data.push(objTemp);
    }

    dataCount++;
    if (dataCount === 2) {
      return res.status(200).json(response);
    }

    Client.findAll({where: {is_active: true}})
      .then(client => {
        User.findAll()
          .then(users => {
            Role.findAll()
              .then(roles => {
                for (let i = 0; i < client.length; i++) {
                  let clientObj = client[i].dataValues;
                  for (let j = 0; j < response.data.length; j++) {
                    let userObj = response.data[j].User;
                    if (userObj.clientId && userObj.clientId.indexOf(clientObj.id) !== -1) {
                      response.data[j].Client.push(clientObj);
                    }
                    for (let m = 0; m < users.length; m++) {
                      if (users[m].dataValues.email === userObj.email) {
                        userObj.last_login = users[m].dataValues.last_login;
                        break;
                      }
                    }
                    for (let n = 0; n < roles.length; n++) {
                      if (roles[n].dataValues.code === userObj.role) {
                        userObj.role = roles[n].dataValues;
                        break;
                      }
                    }
                  }
                }

                dataCount++;
                if (dataCount === 2) {
                  return res.status(200).json(response);
                }
              })
              .catch(function (err) {
              });
          })
          .catch(function (err) {
          });
      })
      .catch(function (err) {
      });


  } else {
    return res.status(400).json(data.message);
  }
}

