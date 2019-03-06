'use strict';

var express = require('express');
var controller = require('./firm.controller.js');

var router = express.Router();

router.get('/get-research-by-firm-id', controller.getResearchByFirmId);
router.get('/get-analyst-by-firm-id', controller.getAnalystByFirmId);
router.get('/get-avatar-by-media-id', controller.getAvatarByFirmId);
router.get('/get-firm-by-id', controller.getFirmById);
router.get('/get-all-firm', controller.getAllFirm);
router.get('/get-insight-by-firm-id', controller.getInsightByFirmId);
router.get('/get-analyst-info-by-firm-id', controller.getAnalystInfoByFirmId);
router.get('/get-insight-tab-by-firm-id', controller.getInsightTabByFirmId);
router.get('/get-client-by-firm-id', controller.getClientByFirmId);
router.get('/get-list-client-for-firm', controller.getListClientForFirm);
router.get('/get-list-event-for-firm', controller.getEventByFirmId);
router.get('/get-report-by-firm-id', controller.getReportbyFirmId);
router.get('/get-firm-id-by-analysts', controller.getFirmByIdByAnalysts);

module.exports = router;
