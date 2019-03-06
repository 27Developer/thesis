'use strict';

var express = require('express');
var controller = require('./report.controller.js');

var router = express.Router();

router.get('/get-analyst-by-report-id', controller.getAnalystByReportId);
router.get('/get-categories-by-report-id', controller.getCategoriesByReportId);
router.get('/get-client-by-report-id', controller.getClientByReportId);
router.get('/get-client-tab-by-report-id', controller.getClientTabByReportId);
router.get('/get-firm-by-report-id', controller.getFirmByReportId);
router.put('/update-placement', controller.updatePlacement);
router.get('/get-analyst-history-by-report-id', controller.getAnalystHistoryByReportId);
router.get('/get-note-by-report-id', controller.getListNoteByReportId);
router.get('/get-placement-by-report', controller.getPlacementByMajorReport);
router.get('/get-ranking-report-by-client', controller.getRankingReportsByClient);

module.exports = router;
