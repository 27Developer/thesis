'use strict';
import { checkRole } from '../../../permission';
import config from '../../../config/environment/shared';
var express = require('express');
var controller = require('./etl-process.controller');

var router = express.Router();

router.get('/interaction-type-update', checkRole(config.claim.spotlightSeeNavigation), controller.updateInteractionTypeProcess);

module.exports = router;
