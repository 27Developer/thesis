'use strict';

import { checkRole, assignUserInfoToReq } from '../../../permission';
import config from '../../../config/environment/shared';

var express = require('express');
var controller = require('./analyst-alignment.controller');

var router = express.Router();

router.get('', controller.getListClientAnalystAlignmentHistoryByClientId);
router.get('/getListClientByAnalystId', assignUserInfoToReq(),controller.getListClientByAnalystId);
router.get('/getAnalystOverviewInfoByAnalystId', assignUserInfoToReq(),controller.getAnalystOverviewInfoByAnalystId);
router.post('/add-new-analyst-alignment', checkRole(config.claim.spotlightSeeNavigation, config.claim.spotlightClientEdit), controller.addNewClientAnalystAlignmentHistory);
router.put('/update-analyst-alignment', checkRole(config.claim.spotlightSeeNavigation, config.claim.spotlightClientEdit), controller.updateClientAnalystAlignmentHistory);

module.exports = router;
