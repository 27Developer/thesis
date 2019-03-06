'use strict';

import { checkRole } from '../../../permission';
import config from '../../../config/environment/shared';

var express = require('express');
var controller = require('./client-analyst-objective.controller.js');

var router = express.Router();

router.post('/add-objective', checkRole(config.claim.spotlightSeeNavigation, config.claim.spotlightClientEdit), controller.addObjective);
router.put('/edit-objective', checkRole(config.claim.spotlightSeeNavigation, config.claim.spotlightClientEdit), controller.updateObjective);
router.delete('/delete-objective', checkRole(config.claim.spotlightSeeNavigation, config.claim.spotlightClientEdit), controller.deleteObjective);
router.get('/get-objective/:analystId/:clientId', controller.getObjective);

module.exports = router;
