'use strict';

var express = require('express');
var controller = require('./defaultData.controller');

var router = express.Router();

router.get('/cohort', controller.GetAllCohort);
router.get('/segmentation', controller.GetAllSegmentationType);
router.get('/clientType', controller.GetAllClientType);
router.get('/churnReason', controller.GetAllChurnReason);
router.get('/effort', controller.GetAllEffort);
router.get('/analystFirmSubscription', controller.GetAllAnalystFirmSubscriptionType);

////Firm
router.get('/firm', controller.GetAllFirm);
router.get('/firm/checkFirm', controller.CheckFirm);
router.post('/firm/addFirm', controller.AddFirm);
router.put('/firm/updateFirm', controller.UpdateFirm);
router.get('/firm/deleteFirm', controller.DeleteFirm);
router.get('/firm/getCategoryFirm', controller.GetCategoryFirm);

router.get('/researchType', controller.GetAllResearchType);
router.get('/vendorLeaning', controller.GetAllVendorLeaning);
router.get('/research', controller.GetAllResearch);
router.get('/research/checkResearch', controller.CheckResearch);
router.post('/research/addResearch', controller.AddResearch);
router.put('/research/updateResearch', controller.UpdateResearch);
router.get('/research/deleteResearch', controller.DeleteResearch);
//router.get('/getClientAnalystCount', controller.getClientAnalystCount);


////Interaction Types
router.get('/interactionType', controller.GetAllInteractionType);
router.get('/interactionType/checkInteractionType', controller.CheckInteractionType);
router.post('/interactionType/addInteractionType', controller.AddInteractionType);
router.put('/interactionType/updateInteractionType', controller.UpdateInteractionType);
router.get('/interactionType/deleteInteractionType', controller.DeleteInteractionType);

router.get('/taskType', controller.GetAllTaskType);
router.get('/taskDesignation', controller.GetAllTaskDesignation);

router.get('/GetAllTopicGe', controller.GetAllTopicGe);

router.get('/client', controller.GetAllClient);
router.get('/role', controller.getAllRole);
router.get('/country', controller.getAllCountries);
router.get('/state', controller.getStatesByCountryCode);
router.get('/region', controller.getRegions);

router.get('/getClientHistoryByClientId', controller.getClientHistoryByClientId);

router.get('/getTimeUserLogin', controller.getTimeUserLogin);
router.put('/updateFirstLogin', controller.updateFirstLogin);

router.post('/updateTableConfig', controller.updateTableConfig);
router.get('/getTableConfig', controller.getTableConfig);
router.get('/getChangeLog', controller.getChangeLog);
router.get('/get-activity-log', controller.getActivityLog);
router.get('/migrate-data-aws', controller.migrateDataAws);
router.post('/create-publish-link', controller.createPublishLink);
router.get('/search-global', controller.searchGlobal);

module.exports = router;
