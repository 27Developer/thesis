'use strict';

var express = require('express');
var controller = require('./category.controller.js');

var router = express.Router();

router.get('/get-research-categories', controller.getResearchCategories);
router.get('/get-firm-by-research-id', controller.getFirmByResearchId);
router.get('/get-analyst-by-research-id', controller.getAnalystByResearchId);
router.get('/get-client-by-research-id', controller.getClientByResearchId);
router.get('/get-report-by-research-id', controller.getReportByResearchId);
router.post('/add-category', controller.addCategory);
router.put('/update-category', controller.updateCategory);
router.delete('/delete-category', controller.deleteCategory);
router.get('/get-analyst-history-by-research-id', controller.getAnalystHistoryByResearchId);
router.get('/get-event-by-research-id', controller.getEventByReseachId);
router.get('/get-report-tab-by-research-id', controller.getReportTabByResearchId);
router.get('/get-list-insight-by-research-id', controller.getListInsightByResearchId);
router.get('/get-list-insight-by-research-id-test', controller.getListInsightByResearchIdTest);
router.get('/:categoryId', controller.getCategoryById);


module.exports = router;
