'use strict';

import { checkRole } from '../../../permission';
import config from '../../../config/environment/shared';

var express = require('express');
var controller = require('./client-maturity.controller');

var router = express.Router();

router.get('', controller.getListClientMaturityByClientId);
router.delete('/delete-client-maturity', checkRole(config.claim.spotlightSeeNavigation, config.claim.spotlightClientEdit), controller.deleteClientMaturity);
router.get('/get-client-maturity', controller.getListClientAnalystAlignmentHistory);
router.post('/save-client-maturity', checkRole(config.claim.spotlightSeeNavigation, config.claim.spotlightClientEdit), controller.saveClientMaturity);
router.put('/update-client-maturity', checkRole(config.claim.spotlightSeeNavigation, config.claim.spotlightClientEdit), controller.updateClientMaturity);
router.post('/save-maturity-label', checkRole(config.claim.spotlightSeeNavigation, config.claim.spotlightClientEdit), controller.saveMaturityLabel);
router.delete('/delete-maturity-label', checkRole(config.claim.spotlightSeeNavigation, config.claim.spotlightClientEdit), controller.deleteMaturityLabel);
router.put('/edit-maturity-label', checkRole(config.claim.spotlightSeeNavigation, config.claim.spotlightClientEdit), controller.updateMaturityLabel);
router.get('/check-client-maturity', controller.checkClientMaturity);
router.get('/export', controller.exportCSV);


module.exports = router;
