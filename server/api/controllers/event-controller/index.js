
var express = require('express');
var controller = require('./event.controller');
import { checkRole, checkRoleWithAssignedClients } from '../../../permission';
import config from '../../../config/environment/shared';

var router = express.Router();
router.get('/', controller.getListEvent);
router.post('/', controller.addEvent);
router.delete('/', controller.deleteEvent)
router.put('/', controller.updateEvent)
router.put('/assign-event-to-client', controller.assginEventToClient)
router.put('/update-event-color', controller.updateEventColor)
router.put('/update-client-event-color', controller.updateClientEventColor)
router.get('/id', checkRoleWithAssignedClients(config.claim.spotlightSeeNavigation, config.claim.spotlightClientEdit, config.claim.spotlightReadOnly), controller.getEvent)
router.get('/event-by-client-id', controller.getEventByClientId);
router.get('/all-client-event', controller.getAllEvent);
router.get('/event-by-collection-id', controller.getEventByCollectionId);
router.get('/event-by-analyst-id', controller.getEventByAnalystId)
router.get('/analyst-by-event-id', controller.getAnalystByEventId)
module.exports = router;
