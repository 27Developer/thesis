'use strict';

import { checkRole, checkRoleWithAssignedClients } from '../../../permission';
import config from '../../../config/environment/shared';

var express = require('express');
var controller = require('./publish.controller.js');

var router = express.Router();

router.get('/get-publish-analyst-image', controller.getPublishAnalystImage);
router.get('/get-publish-client-image', controller.getPublishClientImage);
router.get('/get-publish-analyst', controller.getPublishAnalyst);
router.get('/get-publish-client', controller.getPublishClientById);
router.get('/get-publish-market-activity', controller.getPublishMarketActivity);
router.get('/get-publish-notes', controller.getPublishNotes);
router.get('/get-publish-analysts-list', controller.getPublishAnalystList);
router.get('/get-list-publish-item-value-by-analyst-id', controller.getListPublishItemValueByAnalystId);
router.get('/get-list-publish-group-by-template-id', controller.getListPublishGroupByTemplateId);
router.get('/get-list-publish-item-value-by-analyst-client-view-id', controller.getListPublishItemValueByAnalystClientViewId);
router.get('/get-publish-insight-by-analyst-id', controller.getPublishInsightByAnalystId);
router.get('/get-publish-major-report', controller.getMajorReport);
router.get('/get-publish-activity-by-analyst-id', controller.getPublishActivityByAnalystId);
router.get('/get-publish-event-by-analyst-id', controller.getPublishEventByAnalystId);
router.post('/get-list-insight-by-analystId', checkRoleWithAssignedClients(config.claim.spotlightSeeNavigation, config.claim.spotlightClientEdit, config.claim.spotlightReadOnly), controller.getListInsightByAnalystId);
router.get('/get-publish-client-associal-analyst', controller.getPublishClientAssocialAnalyst);
module.exports = router;
