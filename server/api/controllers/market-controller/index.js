
var express = require('express');
var controller = require('./market.controller');

var router = express.Router();
router.get('/', controller.getListMarket);
router.post('/', controller.addMarket);
router.put('/', controller.editMarket);
router.delete('/', controller.deleteMarket);
router.get('/profile/id', controller.getMarketById);
router.get('/profile/firm', controller.getFirmForMarket);
router.get('/profile/analyst', controller.getAnalystForMarket);
router.get('/profile/report', controller.getReportForMarket);
router.get('/profile/client', controller.getClientForMarket);
router.get('/profile/analyst-tag', controller.getAnalystByMarketId);
router.get('/profile/report-tag', controller.getReportByMarketId);
router.get('/profile/event-tag', controller.getEventByMarketId);
router.get('/profile/insight-tag', controller.getListInsightByMarketId);

module.exports = router;