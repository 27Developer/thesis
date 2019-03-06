'use strict';
import { checkRole } from '../../../permission';
import config from '../../../config/environment/shared';
var express = require('express');
var controller = require('./tag.controller');

var router = express.Router();

router.get('', checkRole(config.claim.spotlightSeeNavigation), controller.getAllTags);
router.post('/interaction-type-update', checkRole(config.claim.spotlightSeeNavigation), controller.updateInteractionTypeProcess);

module.exports = router;
