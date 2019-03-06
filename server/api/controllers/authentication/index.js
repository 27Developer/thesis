'use strict';

var express = require('express');
var controller = require('./authentication.controller.js');

var router = express.Router();

router.post('/verify', controller.authentication);

router.post('/register', controller.register);

router.post('/confirmForgotPassword', controller.confirmForgotPassword);

router.post('/login', controller.login);

router.get('/forgotPassword', controller.forgotPassword);

router.get('/ckToken', controller.getCkToken)

module.exports = router;
