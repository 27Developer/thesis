'use strict';
import { checkRole } from '../../../permission';
import config from '../../../config/environment/shared';
var express = require('express');
var controller = require('./global-settings.controller.js');

var router = express.Router();
router.get('/get-global-settings', controller.getAllGlobalSettings);


module.exports = router;
