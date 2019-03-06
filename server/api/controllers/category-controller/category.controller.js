'use strict';
import * as responseHelper from '../../../components/helper/response-helper';
import {
  Analyst,
  AnalystHistory,
  Research,
  ResearchType,
  AnalystResearchCategories,
  Firm,
  VendorLeaning,
  ClientAnalystAlignmentHistory,
  Task,
  AnalystMedia,
  Media,
  ClientAnalystObjective,
  Client,
  InteractionType,
  TaskInteraction,
  Tag,
  RequestBriefing,
  User,
  sequelize
} from '../../../sqldb';
var CategoryService = require('../../services/category.service');

export function getResearchCategories(req, res) {
  CategoryService.getResearchCategories()
    .then(responseHelper.respondWithResult(res))
    .catch(responseHelper.handleError(res));
}

export function getCategoryById(req, res) {
  var categoryId = req.params.categoryId;
  CategoryService.getCategoryById(categoryId)
    .then(responseHelper.respondWithResult(res))
    .catch(responseHelper.handleError(res));
}

export function addCategory(req, res) {
  var category = req.body.categoryData;
  var firms = category && category.firms ? category.firms : [];
  delete category.firms;
  CategoryService.addCategory(category, firms)
    .then(responseHelper.respondWithResult(res))
    .catch(responseHelper.handleError(res));
}

export function updateCategory(req, res) {
  var category = req.body.categoryData;
  var firms = category && category.firms ? category.firms : [];
  delete category.firms;
  CategoryService.updateCategory(category, firms)
    .then(responseHelper.respondWithResult(res))
    .catch(responseHelper.handleError(res));
}

export function deleteCategory(req, res) {
  var categoryIds = req.query.ids;
  if (typeof categoryIds === 'string') {
    categoryIds = [categoryIds];
  }
  CategoryService.deleteCategory(categoryIds)
    .then(responseHelper.respondWithResult(res))
    .catch(responseHelper.handleError(res));
}

export function getFirmByResearchId(req, res) {
  CategoryService.getFirmByResearchId(req.query.researchId)
    .then(responseHelper.respondWithResult(res))
    .catch(responseHelper.handleError(res));
}

export function getAnalystByResearchId(req, res) {
  CategoryService.getAnalystByResearchId(req.query.researchId)
    .then(responseHelper.respondWithResult(res))
    .catch(responseHelper.handleError(res));
}

export function getClientByResearchId(req, res) {
  CategoryService.getClientByResearchId(req.query.researchId)
    .then(responseHelper.respondWithResult(res))
    .catch(responseHelper.handleError(res));
}

export function getReportByResearchId(req, res) {
  CategoryService.getReportByResearchId(req.query.researchId)
    .then(responseHelper.respondWithResult(res))
    .catch(responseHelper.handleError(res));
}

export function getAnalystHistoryByResearchId(req, res) {
  CategoryService.getAnalystHistoryByResearchId(req.query.researchId)
    .then(responseHelper.respondWithResult(res))
    .catch(responseHelper.handleError(res));
}

export function getEventByReseachId(req, res) {
  CategoryService.getEventByReseachId(req.query.researchId)
    .then(responseHelper.respondWithResult(res))
    .catch(responseHelper.handleError(res));
} 

export function getReportTabByResearchId(req, res) {
  CategoryService.getReportTabByResearchId(req.query.researchId)
    .then(responseHelper.respondWithResult(res))
    .catch(responseHelper.handleError(res));
}

export function getListInsightByResearchId(req, res) {
  CategoryService.getListInsightByResearchId(req.query.researchId)
    .then(responseHelper.respondWithResult(res))
    .catch(responseHelper.handleError(res));
}


export function getListInsightByResearchIdTest(req, res) {
  CategoryService.getListInsightByResearchIdTest(req.query.researchId)
    .then(responseHelper.respondWithResult(res))
    .catch(responseHelper.handleError(res));
}
