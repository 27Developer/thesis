'use strict';
import { checkRole } from '../../../permission';
import config from '../../../config/environment/shared';
var express = require('express');
var controller = require('./client-objective.controller.js');

var router = express.Router();

router.get('', controller.getListObjectivesByClientId);
router.get('/get-objective-global', controller.getListObjectiveGlobal);
router.delete('/delete-client-objective', checkRole(config.claim.spotlightSeeNavigation, config.claim.spotlightClientEdit), controller.deleteObjective);
router.post('/add-objective', checkRole(config.claim.spotlightSeeNavigation, config.claim.spotlightClientEdit), controller.addNewObjective);
router.put('/edit-objective', checkRole(config.claim.spotlightSeeNavigation, config.claim.spotlightClientEdit), controller.updateObjective);
router.post('/change-objective', checkRole(config.claim.spotlightSeeNavigation, config.claim.spotlightClientEdit), controller.changeObjective);

module.exports = router;
