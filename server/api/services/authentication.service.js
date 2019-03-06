'use strict';
var jwt = require('jsonwebtoken')
import log4Js from 'log4js';
import https from 'https';
import config from '../../config/environment';
import uuid from 'uuid/v1';
import * as responseHelper from '../../components/helper/response-helper';
var ClientService = require('./client.service');
import {
  UserLogin,
  UserToken,
  User,
  Role,
  Claim,
  Client,
  sequelize,
} from '../../sqldb';

log4Js.configure({
  appenders: [
    { type: 'file', filename: 'logs/authentication.log', category: 'authentication' }
  ]
});
var logger = log4Js.getLogger('authentication');
var secretKey = 'vdEzyy9lqVCUr3vsB6n4g8AnSNQjqDOfX1aDN5pzF3w7IYFBJGyIR1El1XX8';
var environmentId = 'LmAloQWRcWJY0pxbJlue';

import awsCognitoService from '../../components/aws-cognito/aws-cognito-register';
var Promise = require('bluebird');

export function authentication(token) {
  return new Promise((resolve, reject) => {
    // var token = req.body.authentication;
    https.get(`https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=${token.id}`, (response) => {
      response.on('data', (buffer) => {
        var userData = JSON.parse(buffer.toString());
        if (userData.hd !== config.hostedDomain) {
          res.sendStatus(401);
        } else {
          var currentDate = new Date();
          var expire = new Date();
          var authen = {};
          authen.id = uuid() || '';
          authen.access_token = token.access_token;
          authen.id_token = token.id;
          authen.expires_at = currentDate;
          authen.token_expire = expire.setDate(expire.getDate() + 1);
          return sequelize.transaction(async function (t) {
            return UserLogin.create(authen, { transaction: t })
              .then(res => resolve(res))
              .catch(err => reject(err));
          }).then(res => resolve(res))
            .catch(err => reject(err));
        }
      });
    }).on('error', (e) => {
      reject(e);
    });
  });
}

export async function register(email, code, password) {
  return new Promise(async (resolve, reject) => {
    try {
      let confirm = await awsCognitoService.confirmRegistration(code, email);
      let changPassword = await awsCognitoService.changePassword(email, config.passwordDefault, password.password);
      if ((confirm && confirm.statusCode) || (changPassword && changPassword.statusCode)) {
        return resolve(confirm.message);
      }
      return resolve();
    } catch (err) {
      reject(err);
    }
  });
}

export async function confirmForgotPassword(email, code, password) {
  return new Promise(async (resolve, reject) => {
    try {
      let confirm = await awsCognitoService.confirmForgotPassword(code, email, password.password);
      if (confirm && confirm.statusCode) {
        return resolve(confirm.message);
      }
      return resolve();
    } catch (err) {
      reject(err);
    }
  });
}

export async function forgotPassword(email) {
  return new Promise(async (resolve, reject) => {
    try {
      let confirm = await awsCognitoService.forgotPassword(email);
      if (confirm && confirm.statusCode) {
        if (confirm.code === 'LimitExceededException') {
          return resolve(confirm.message);
        } else {
          return resolve(config.invalidEmail);
        }
      }
      return resolve();
    } catch (err) {
      reject(err);
    }
  });
}

export async function login(data) {
  return new Promise(async (resolve, reject) => {
    try {
      //var data = req.body.data;
      let result = await awsCognitoService.login(data);
      if (result && result.statusCode) {
        //return res.status(401).json(result.message);
        resolve({ code: 401, message: result.message });
      }
      var currentDate = new Date();
      var expire = new Date();
      var responseObj = {};
      responseObj.user = result.idToken.payload;
      return sequelize.transaction(async function (t) {
        var currentUserData = result.idToken.payload;
        var roleId = currentUserData['custom:role'];
        let clientIdStr = currentUserData['custom:client_id'];
        let collectionIdStr = currentUserData['custom:collection_id'];
        await Role.findAll({
          include: [
            {
              model: Claim,
            },
          ],
          where: {
            is_active: true,
            code: roleId
          }
        }).then(data => {
          responseObj.role = data.length > 0 ? data[0].dataValues : {};
        });


        await User.update(
          {
            last_login: new Date(),
            access_token: result.getAccessToken().getJwtToken(),
            token_expire: expire.setDate(expire.getDate() + 1),
            token_id: result.idToken.jwtToken
          },
          {
            where: {
              email: data.email
            },
            transaction: t
          })
          .then(dat => {
            var tokenObj = {
              email: data.email,
              access_token: result.getAccessToken().getJwtToken(),
              token_expire: expire.setDate(expire.getDate() + 1),
              token_id: result.idToken.jwtToken
            }
            console.log(tokenObj);
            UserToken.create(tokenObj).then(da => {
              responseObj.id = result.getAccessToken().getJwtToken();
            })
          });

        let listClientId13 = [''];
        if (clientIdStr && clientIdStr !== '' && clientIdStr !== 'All') {
          listClientId13 = clientIdStr.split(', ');
        }

        responseObj.client = await ClientService.getClientAssignedToCurrentUser(currentUserData.email, currentUserData.given_name + ' ' + currentUserData.name, currentUserData.role, listClientId13)

        let listCollectionIds = [''];
        if (collectionIdStr && collectionIdStr !== '' && collectionIdStr !== 'All') {
          listCollectionIds = collectionIdStr.split(', ');
        }

        let queryStrCollection = `SELECT * FROM collection where id in (:collectionIds) ORDER BY name ASC`;
        await sequelize.query(queryStrCollection, { replacements: { collectionIds: listCollectionIds }, type: sequelize.QueryTypes.SELECT })
          .then(data => {
            responseObj.collection = data;
          });
      }).then(() => {
        resolve({ code: 200, data: responseObj });
      })
        .catch(err => reject(err));
    } catch (err) {
      reject(err);
    }
  });
}

export function getCkToken(email) {
  return new Promise((resolve, reject) => {
    try {
      var payload = {
        iss: environmentId,
        user: {
          id: email,
          email: email,
          name: email
        },
        services: {
          'ckeditor-collaboration': {
            permissions: {
              '*': 'write'
            }
          }
        }
      };
      var result = jwt.sign(payload, secretKey, { algorithm: 'HS256' });
      resolve(result);
    }
    catch (err) {
      reject(err);
    }
  });
}
