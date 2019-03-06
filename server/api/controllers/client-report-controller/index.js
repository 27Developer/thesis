'use strict';

var express = require('express');
var controller = require('./client-report.controller.js');

var router = express.Router();

module.exports = router;
router.get('/getTaskDataByClientIdAndDate', controller.getTaskDataByClientIdAndDate);
router.get('/getTaskDataByClientIdAndDateForAnalystReport', controller.getTaskDataByClientIdAndDateForAnalystReport);
router.get('/getInteractionTaskByClientIdAndDate', controller.getInteractionTaskByClientIdAndDate);
