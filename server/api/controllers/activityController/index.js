'use strict';

import { checkRole, checkRoleWithAssignedClients } from '../../../permission';
import config from '../../../config/environment/shared';

var express = require('express');
var controller = require('./activity.controller');

var router = express.Router();

router.get('/', controller.GetAllActivity);
router.get('/get-activity-for-month', controller.getActivityForMonth);
router.get('/getById', checkRoleWithAssignedClients(config.claim.spotlightSeeNavigation, config.claim.spotlightClientEdit, config.claim.spotlightReadOnly), controller.getActivityById);

router.get('/getActivityAnalystByActivityId', controller.getActivityAnalystByActivityId);
router.get('/getActivityCategoryByActivityId', controller.getActivityCategoryByActivityId);
router.get('/getActivityClientByActivityId', controller.getActivityClientByActivityId);
router.get('/getActivityEventByActivityId', controller.getActivityEventByActivityId);
router.get('/getActivityReportByActivityId', controller.getActivityReportByActivityId);
router.get('/getActivitySpeakerByActivityId', controller.getActivitySpeakerByActivityId);
router.get('/getActivityProgressById', controller.getActivityProgressById)
router.get('/getLength', controller.getLength);
router.get('/get-activity-types', checkRole(config.claim.spotlightSeeNavigation, config.claim.spotlightClientEdit, config.claim.spotlightReadOnly), controller.getActivityTypes);
router.post('/add-activity', controller.addActivity);
router.put('/edit-activity', controller.editActivity);
router.get('/get-data-for-note', controller.getDataForNote);
router.get('/get-note', controller.getNote);
router.post('/add-note', checkRole(config.claim.spotlightSeeNavigation, config.claim.spotlightClientEdit, config.claim.spotlightReadOnly), controller.addNote);
router.get('/get-list-note-by-clientId/', controller.getListNoteByClientId);
router.get('/get-list-note-by-event-id/', checkRoleWithAssignedClients(config.claim.spotlightSeeNavigation, config.claim.spotlightClientEdit, config.claim.spotlightReadOnly), controller.getListNoteByEventId);
router.get('/get-list-note', controller.getListNote);
router.put('/update-note', controller.updateNote);
router.put('/delete-note', controller.deleteNote);
router.put('/update-activity-color', controller.updateActivityColor);
router.post('/get-activity-color', controller.getActivityColor);
router.get('/get-list-note-by-analystId/', controller.getListNoteByAnalystId);
router.delete('/deleteActivitySelected/', controller.deleteActivitySelected);
router.get('/count-upcoming-acitivity/', controller.countUpcomingAcitivity);
router.get('/fix-activity-date-time-data', controller.fixActivityDateTimeData);
router.put('/update-attribute-activity', controller.updateAttributeActivity);
router.get('/update-activity-name-data', controller.updateActivityNameData);
router.get('/search-outcome-object', controller.searchOutcomeObject);
router.put('/modify-activity-types', controller.modifyActivityTypes);
router.get('/get-activity-by-analyst-id', controller.getActivityByAnalystId);
router.get('/get-activity-by-client-id', controller.getActivityByClientId);
router.get('/get-activity-by-collection-id', controller.getActivityByCollectionId);
router.get('/get-activity-by-event-id', controller.getActivityByEventId);
router.get('/get-analyst-by-activity', controller.getAnalystByActivity)
router.post('/count-insight-for-activity-list', controller.countInsightForActivityList);
router.post('/count-past-insight-for-activity-list', controller.countPastInsightForActivityList);
router.get('/convert-text-from-etherpad-to-ckeditor-for-note', controller.convertTextFromEtherpadToCkeditorForNote);
router.get('/getSoleActivityById', controller.getSoleActivityById);
router.get('/get-analyst-name-by-activity-id', controller.getAnalystNameByActivityId);
router.get('/get-type-by-activity', controller.getTypeByActivityId);

module.exports = router;
