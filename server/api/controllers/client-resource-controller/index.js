'use strict';
import { checkRole } from '../../../permission';
import config from '../../../config/environment/shared';
var express = require('express');
var controller = require('./client-resource-controller.js');

var router = express.Router();

router.get('', controller.getListClientResourceByClientId);
router.delete('/delete-client-resource', checkRole(config.claim.spotlightSeeNavigation, config.claim.spotlightClientEdit), controller.deleteResource);
router.post('/add-resource', checkRole(config.claim.spotlightSeeNavigation, config.claim.spotlightClientEdit), controller.addNewResource);
router.put('/edit-resource', checkRole(config.claim.spotlightSeeNavigation, config.claim.spotlightClientEdit), controller.updateResource);

module.exports = router;
