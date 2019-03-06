'use strict';

import { checkRole, checkRoleWithAssignedClients } from '../../../permission';
import config from '../../../config/environment/shared';

var express = require('express');
var controller = require('./ranking-report.controller');

var router = express.Router();

router.get('/ranking-report-list', controller.getRankingReportsList);
router.get('/ranking-report-by-id', checkRoleWithAssignedClients(config.claim.spotlightSeeNavigation, config.claim.spotlightClientEdit, config.claim.spotlightReadOnly), controller.getRankingReportById);
router.get('/ranking-report-simple-list', controller.getRankingReportsSimpleList);
router.get('/ranking-report-options', controller.getRankingReportOptions);
router.post('/add-list-ranking-report', checkRole(config.claim.spotlightSeeNavigation, config.claim.spotlightClientEdit), controller.addListRankingReport);
router.put('/update-list-ranking-report', checkRole(config.claim.spotlightSeeNavigation, config.claim.spotlightClientEdit), controller.updateListRankingReport);
router.put('/update-report-segment', checkRole(config.claim.spotlightSeeNavigation, config.claim.spotlightClientEdit), controller.updateReportPlacement);
router.put('/delete-list-ranking-report', checkRole(config.claim.spotlightSeeNavigation, config.claim.spotlightClientEdit), controller.deleteListRankingReport);
router.post('/export-ranking-report-to-csv', controller.exportRankingReportToCsv);
router.put('/update-report-client-placement', controller.updateReportClientPlacement);
router.get('/getLength', controller.getLength);
module.exports = router;
