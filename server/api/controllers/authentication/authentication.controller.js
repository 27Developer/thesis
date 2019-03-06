'use strict';
import log4Js from 'log4js';
import https from 'https';
import config from '../../../config/environment';
import uuid from 'uuid/v1';
import * as responseHelper from '../../../components/helper/response-helper';
import {
  UserLogin,
  User,
  Role,
  Claim,
  Client,
  sequelize,
} from '../../../sqldb';

log4Js.configure({
  appenders: [
    { type: 'file', filename: 'logs/authentication.log', category: 'authentication' }
  ]
});
var logger = log4Js.getLogger('authentication');
var AuthenticationService = require('../../services/authentication.service');

import awsCognitoService from '../../../components/aws-cognito/aws-cognito-register';

export function authentication(req, res) {
  var token = req.body.authentication;
  AuthenticationService.authentication(token)
    .then((rs) => res.send(rs))
    .catch(err => {
      console.log(err);
      res.status(500).json();
    });
}

export async function register(req, res) {
  var email = req.body.email;
  var code = req.body.code;
  var password = req.body.password;
  AuthenticationService.register(email, code, password).then(rs => {
    if (rs) {
      return res.status(400).json(rs);
    } else {
      res.status(200).json();
    }
  })
    .catch(err => {
      console.log(err);
      res.status(500).json();
    });
}

export async function confirmForgotPassword(req, res) {
  var email = req.body.email;
  var code = req.body.code;
  var password = req.body.password;
  AuthenticationService.confirmForgotPassword(email, code, password).then(rs => {
    if (rs) {
      return res.status(400).json(rs);
    } else {
      res.status(200).json();
    }
  })
    .catch(err => {
      console.log(err);
      res.status(500).json();
    });
}

export async function forgotPassword(req, res) {
  var email = req.query.email;
  AuthenticationService.forgotPassword(email).then(rs => {
    if (rs) {
      return res.status(400).json(rs);
    } else {
      res.status(200).json();
    }
  })
    .catch(err => {
      console.log(err);
      res.status(500).json();
    });
}

export async function login(req, res) {
  var data = req.body.data;
  AuthenticationService.login(data).then(rs => {
    if (rs) {
      return res.status(rs.code).json(rs.data);
    }
  })
    .catch(err => {
      console.log(err);
      res.status(500).json();
    });
}

export async function getCkToken(req, res) {
  var email = req.query.email;

  AuthenticationService.getCkToken(email).then(token => {
    return res.status(200).send(token);
  })
    .catch(err => {
      console.log(err);
      res.status(500).json();
    });
}
