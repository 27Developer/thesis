'use strict';
import { checkRole } from '../../../permission';
import config from '../../../config/environment/shared';
var express = require('express');
var controller = require('./client-profile.controller');

var router = express.Router();

router.get('/overview/get-list-activiti-by-client-id', controller.getListActivitiByClientId);

module.exports = router;
