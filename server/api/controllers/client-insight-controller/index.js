'use strict';

import { checkRole } from '../../../permission';
import config from '../../../config/environment/shared';

var express = require('express');
var controller = require('./client-insight.controller');

var router = express.Router();

router.post('/add-new-client-insight', controller.addNewClientInsight);

router.get('/get-insight-by-id', controller.getInsightById);

router.get('/get-insight-by-client-id', checkRole(config.claim.spotlightSeeNavigation, config.claim.spotlightClientEdit, config.claim.spotlightReadOnly), controller.getListInsightsByClientId);

router.post('/add-new-client-insight', controller.addNewClientInsight);

router.post('/update-client-insight', controller.updateClientInsight);

module.exports = router;
