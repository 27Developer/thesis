'use strict';

import { checkRole } from '../../../permission';
import config from '../../../config/environment/shared';

var express = require('express');
var controller = require('./client-health.controller');

var router = express.Router();

router.get('', controller.getListClientHealthByClientId);

router.get('/export', controller.exportCsv);

router.post('/add-list-new-client-health', checkRole(config.claim.spotlightSeeNavigation, config.claim.spotlightClientEdit, config.claim.spotlightClientHealth), controller.addListNewClientHealth);

router.post('/update-list-client-health', checkRole(config.claim.spotlightSeeNavigation, config.claim.spotlightClientEdit, config.claim.spotlightClientHealth), controller.updateListClientHealth);

module.exports = router;
