'use strict';

import { checkRole, checkRoleWithAssignedClients } from '../../../permission';
import config from '../../../config/environment/shared';

var express = require('express');
var controller = require('./my-feed.controller');

var router = express.Router();

router.get('/get-my-feed-clients', controller.getMyFeedClients);
router.get('/get-my-feed-activities', checkRoleWithAssignedClients(config.claim.spotlightSeeNavigation, config.claim.spotlightClientEdit, config.claim.spotlightReadOnly), controller.getMyFeedActivities);
router.get('/get-my-feed-insights', checkRoleWithAssignedClients(config.claim.spotlightSeeNavigation, config.claim.spotlightClientEdit, config.claim.spotlightReadOnly), controller.getMyFeedInsights);

module.exports = router;
