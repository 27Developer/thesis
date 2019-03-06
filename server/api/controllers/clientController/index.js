'use strict';

import { checkRole, checkRoleWithAssignedClients } from '../../../permission';
import config from '../../../config/environment/shared';

var express = require('express');
var controller = require('./client.controller');

var router = express.Router();

router.get('/', controller.GetAllClients);
router.get('/single-history', controller.GetAllClientsSingleHistory);
router.get('/simple-list', controller.getAllSimpleClients);

router.put('/', controller.deleteClients);
router.get('/getClientById/:id', controller.getClientById);
router.get('/getClientHistoryByClientId/:id', controller.getClientHistoryByClientId);
router.get('/getClientAvatar/:id', controller.getClientAvatar);
router.get('/checkClient', controller.CheckClient);
router.get('/getDataSearchClient', controller.getDataSearchClient);
router.post('/addClient', checkRole(config.claim.spotlightSeeNavigation), controller.addClient);
router.put('/updateClient', checkRole(config.claim.spotlightSeeNavigation), controller.UpdateClient);
router.post('/addListClient', checkRole(config.claim.spotlightClientEdit, config.claim.spotlightSeeNavigation), controller.AddListClient);
router.get('/checkNameClient', controller.checkNameClient);
router.get('/getClientNamebyId', controller.getClientNamebyId);
router.post('/addClientActivity', checkRole(config.claim.spotlightClientEdit, config.claim.spotlightSeeNavigation), controller.addClientActivity);
router.put('/editClientActivity', checkRole(config.claim.spotlightClientEdit, config.claim.spotlightSeeNavigation), controller.editClientActivity);
router.delete('/deleteClientActivity', checkRole(config.claim.spotlightClientEdit, config.claim.spotlightSeeNavigation), controller.deleteClientActivity);
router.get('/getClientActivityByClientId', controller.getClientActivityByClientId);
router.get('/getClientDetailById', controller.getClientDetailById);
router.put('/updateClientInfluence', checkRole(config.claim.spotlightClientEdit, config.claim.spotlightSeeNavigation), controller.updateClientInfluence);
router.get('/get-major-report', controller.getMajorReport);
router.get('/get-major-report-by-collection-id', controller.getMajorReportByCollectionId);
router.get('/get-client-segments', controller.getClientSegments);
router.get('/get-client-insight-status', controller.getClientInsightStatus);
router.get('/get-placement', controller.getPlacement);
router.get('/get-analyst-subsegment', controller.getAnalystAndSubSegment);
router.get('/get-analysts', controller.getAnalysts);
router.put('/update-analyst-segment', controller.updateAnalystSegment);
router.post('/add-analyst-subsegment', controller.addAnalystToSubSegment);
router.post('/save-client-segments', controller.saveClientSegments);
router.post('/save-global-segments', controller.saveGlobalSegments);
router.post('/save-global-placement', controller.saveGlobalPlacement);
router.delete('/delete-analyst-subsegment', controller.deleteAnlystInSubSegment);
router.delete('/delete-analyst-kanban', controller.deleteAnlystInKanban);
router.delete('/delete-subsegment-by-id', controller.deleteSubSegmentById);
router.put('/update-label-subsegment', controller.updateLabelSegment);
router.post('/add-label-subsegment', controller.addLabelSegment);
router.get('/migrate-data-maturity', controller.migrateDataSegmentFromV13ToV20);
router.get('/getAnalystAssocialClient', controller.getAnalystAssocialClient);
router.get('/get-analyst-has-activity-for-client-list', controller.getAnalystHasActivityForClientList);
router.get('/countCoreSegment', controller.countCoreSegment);
router.get('/get-analyst-unassigned', controller.getAnalystUnassigned);
router.get('/get-analyst-has-activity-with-client', controller.getAnalystHasActivityWithClient);
router.get('/get-analyst-has-activity-with-collection', controller.getAnalystHasActivityWithCollection);
router.get('/get-analyst-by-client-id', controller.getAnalystbyClientId);
router.get('/get-analyst-by-client-id-via-activity', controller.getAnalystbyClientViaActivity);

router.get('/get-assigned-clients', controller.getClientAssignedToCurrentUser);
router.get('/get-subsegment-for-analyst', controller.getSubSegmentIdForAnalyst);
router.post('/add-analyst-to-segments', controller.addAnalystToSegments);

router.get('/get-permission-to-page', checkRoleWithAssignedClients(config.claim.spotlightSeeNavigation, config.claim.spotlightClientEdit, config.claim.spotlightReadOnly), controller.getPermissionToPage);
router.get('/get-categories-by-client', controller.getCategoriesByClient);

module.exports = router;
