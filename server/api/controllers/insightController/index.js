'use strict';

import { checkRole, checkRoleWithAssignedClients } from '../../../permission';
import config from '../../../config/environment/shared';

var express = require('express');
var controller = require('./insight.controller');

var router = express.Router();
router.post('/get-list-insight-by-analystId', checkRoleWithAssignedClients(config.claim.spotlightSeeNavigation, config.claim.spotlightClientEdit, config.claim.spotlightReadOnly), controller.getListInsightByAnalystId);
router.get('/', controller.getAllInsight);
router.put('/update-insight', controller.updateInsight);
router.put('/update-insight-description', controller.updateInsightDescription);

router.get('/search-insight-object', checkRoleWithAssignedClients(config.claim.spotlightSeeNavigation, config.claim.spotlightClientEdit), controller.searchInsightObject);
router.get('/get-insight-object-by-insight-id', controller.getInsightObjectByInsightId);

router.delete('/object-associated-to-insight', controller.deleteObjectAssociatedToInsight);

router.post('/', checkRole(config.claim.spotlightSeeNavigation, config.claim.spotlightClientEdit), controller.addInsight);
router.put('/', checkRole(config.claim.spotlightSeeNavigation, config.claim.spotlightClientEdit), controller.editInsight);
router.delete('/', controller.deleteInsight);

router.get('/get-by-id', controller.getInsightById);

router.get('/search-analyst-for-insight', controller.searchAnalystForInsight);
router.get('/search-client-for-insight', controller.searchClientForInsight);
router.get('/search-event-for-insight', controller.searchEventForInsight);
router.get('/search-category-for-insight', controller.searchCategoryForInsight);
router.get('/search-report-for-insight', controller.searchReportForInsight);
router.get('/search-activity-for-insight', controller.searchActivityForInsight);
router.get('/convert-media-to-smaller', controller.convertBase64ImageToSmaller);
router.post('/get-insight-by-report-id', checkRoleWithAssignedClients(config.claim.spotlightSeeNavigation, config.claim.spotlightClientEdit, config.claim.spotlightReadOnly), controller.getInsightByReportId);
router.get('/get-insight-by-activity-id', checkRoleWithAssignedClients(config.claim.spotlightSeeNavigation, config.claim.spotlightClientEdit, config.claim.spotlightReadOnly), controller.getInsightByActivityId);
router.get('/get-insight-by-activity-id-client-mode', controller.getInsightByActivityIdClientMode);
router.get('/get-insight-by-category-id', controller.getInsightByCategoryId);
router.get('/get-insight-by-analyst-id', checkRoleWithAssignedClients(config.claim.spotlightSeeNavigation, config.claim.spotlightClientEdit, config.claim.spotlightReadOnly), controller.getInsightByAnalystId);
router.get('/get-insight-by-analyst-id-client-mode', controller.getInsightByAnalystIdClientMode);
router.get('/get-insight-by-client-id', controller.getInsightByClientId);
router.get('/get-insight-by-client-id-client-mode', controller.getInsightByClientIdClientMode);
router.get('/get-insight-by-event-id', checkRoleWithAssignedClients(config.claim.spotlightSeeNavigation, config.claim.spotlightClientEdit, config.claim.spotlightReadOnly), controller.getInsightByEventId);
router.get('/update-insight-type', controller.updateInsightType);
router.put('/update-insight-status', controller.updateInsightStatus);
router.get('/get-insight-by-market-id', controller.getInsightByMarketId);
router.get('/get-insight-by-collection-id', checkRoleWithAssignedClients(config.claim.spotlightSeeNavigation, config.claim.spotlightClientEdit, config.claim.spotlightReadOnly), controller.getInsightByCollectionId);
router.delete('/delete-insight-relationship', controller.deleteInsightRelationship);
router.get('/convert-text-from-etherpad-to-ckeditor-for-insight', controller.convertTextFromEtherpadToCkeditorForInsight);
router.get('/get-publisher-of-insight', controller.getPublisherOfInsight);

module.exports = router;
