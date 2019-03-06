'use strict';

import { checkRole, checkRoleWithAssignedClients } from '../../../permission';
import config from '../../../config/environment/shared';

var express = require('express');
var controller = require('./analyst.controller');

var router = express.Router();

router.get('/', controller.GetAllAnalysts);
router.get('/getAnalystsInfo', controller.GetAnalystList);
router.get('/getDataToFilters', controller.GetDataToFilters);
router.get('/getAnalystById/:id', controller.GetAnalystById);
router.get('/checkAnalyst', controller.CheckAnalyst);
router.post('/addAnalyst', controller.AddAnalyst);
router.put('/updateAnalyst', controller.UpdateAnalyst);
router.get('/getAnalystForMasterById', checkRoleWithAssignedClients(config.claim.spotlightSeeNavigation, config.claim.spotlightClientEdit, config.claim.spotlightReadOnly), controller.getAnalystForMasterById);
router.get('/goToPageEngagement', controller.goToPageEngagement);
router.get('/getAnalystImage/:type/:id', controller.getAnalystImage);
router.put('/updateInfluencing', checkRole(config.claim.spotlightSeeNavigation, config.claim.spotlightClientEdit), controller.updateInfluencing);
router.get('/getAnalystForCalendar', controller.getAnalystForCalendar);
router.get('/get-analyst-for-calendar-by-collection-id', controller.getAnalystForCalendarByCollectionId);
router.put('/updateTask', checkRole(config.claim.spotlightSeeNavigation, config.claim.spotlightClientEdit), controller.updateTask);
router.post('/createTask', checkRole(config.claim.spotlightSeeNavigation, config.claim.spotlightClientEdit), controller.createTask);
router.get('/checkAnalystForMasterById', controller.checkAnalystForMasterById);
router.get('/getAnalystDetailById', controller.getAnalystDetailById);
router.post('/createBriefingRequest', controller.createBriefingRequest);
router.get('/getBriefingRequestByTaskId', controller.getBriefingRequestByTaskId);
router.get('/getClientAssocialAnalyst', controller.getClientAssocialAnalyst);
router.get('/getClientAssocialAnalystViaActivity', controller.getClientAssocialAnalystViaActivity);
router.put('/deleteAnalyst', controller.deleteAnalyst);
router.get('/getMajorReport', controller.getMajorReport);
router.get('/info-analysts',controller.getAllAnalystInfo);
router.get('/subSegment-by-analyst-segment', controller.getSubSegmentByAnalystSegment);
router.get('/avg-sentiment-for-analysts', controller.getAvgSentimentForAnalysts);
router.get('/get-global-segment', controller.getGlobalSegment);
router.post('/count-insight-for-analyst-list', controller.countInsightForAnalystList);
router.post('/count-past-insight-for-analyst-list', controller.countPastInsightForAnalystList);
router.get('/get-analyst-by-client', controller.getAnalystsByClient);

module.exports = router;
