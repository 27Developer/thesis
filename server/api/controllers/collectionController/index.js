'use strict';

import { checkRole } from '../../../permission';
import config from '../../../config/environment/shared';

var express = require('express');
var controller = require('./collection.controller');

var router = express.Router();

router.get('/', controller.getAllCollections);
router.get('/get-by-id', controller.getCollectionById);
router.post('/add-collection', controller.addCollection);
router.put('/edit-collection', controller.editCollection);
router.put('/update-insight-in-collection', controller.updateInsightStatusInCollection);
router.delete('/delete-collection', controller.deleteCollectionSelected);
router.get('/get-overview', controller.getOverviewByCollectionId);
router.get('/get-client-by-collection-id', controller.getClientByCollectionId);
router.get('/get-list-collection', controller.getListCollection);
router.get('/get-analyst-by-collection-id', controller.getAnalystByCollectionId);
router.get('/get-list-insights-by-collection-id', checkRole(config.claim.spotlightSeeNavigation, config.claim.spotlightClientEdit, config.claim.spotlightReadOnly), controller.getListInsightsByCollectionId);
router.get('/get-event-by-collection-id', controller.getListEventByCollectionId);
router.get('/get-speaker-by-collection-id', controller.getListSpeakerByCollectionId);
router.get('/get-list-note-by-collection-id', controller.getListNoteByCollectionId);
router.get('/get-analyst-associal-client-global-segment', controller.getAnalystAssocialClientGlobalSegment);
router.get('/get-client-global-segment', controller.getClientGlobalSegment);
router.get('/get-anlyst-unassigned-global-segment', controller.getAnalystUnassignedGlobalSegment);
router.get('/get-anlyst-and-subsegment-for-client', controller.getAnalystAndSubSegmentForClient);
router.post('/get-avg-sentiment-for-analyst-and-client', controller.getAvgSentimentForAnalystAndClient);
router.get('/get-assigned-collections', controller.getAssignedCollections);
router.get('/get-client-activity-by-collection-id', controller.getClientActivityByCollectionId);

module.exports = router;
