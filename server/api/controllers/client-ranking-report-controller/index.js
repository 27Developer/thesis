'use strict';

import { checkRole } from '../../../permission';
import config from '../../../config/environment/shared';

var express = require('express');
var controller = require('./client-ranking-report.controller');

var router = express.Router();

router.get('', controller.getListClientRankingReportByClientId);
router.get('/data-add-edit-client-ranking-report', controller.getDataForAddEditClientRankingReport);
router.post('/add-client-ranking-report', checkRole(config.claim.spotlightSeeNavigation, config.claim.spotlightClientEdit), controller.addNewClientRankingReport);
router.put('/edit-client-ranking-report', checkRole(config.claim.spotlightSeeNavigation, config.claim.spotlightClientEdit), controller.editClientRankingReport);
router.delete('/delete-client-ranking-report', checkRole(config.claim.spotlightSeeNavigation, config.claim.spotlightClientEdit), controller.deleteClientRankingReport);
router.get('/get-client-ranking-report-by-date', controller.getListClientRankingReportByClientIdAndDate);
router.get('/get-client-ranking-report-by-collection-id', controller.getListClientRankingReportByCollectionIdAndDate);
router.get('/export', controller.exportCsv);
router.put('/update-placement', checkRole(config.claim.spotlightSeeNavigation, config.claim.spotlightClientEdit), controller.updatePlacement);
router.post('/add-placement', checkRole(config.claim.spotlightSeeNavigation, config.claim.spotlightClientEdit), controller.addCustomPlacement);

module.exports = router;
