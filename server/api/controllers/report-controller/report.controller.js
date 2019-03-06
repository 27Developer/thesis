'use strict';
import * as responseHelper from '../../../components/helper/response-helper';
var ReportService = require('../../services/report.service');

export function getAnalystByReportId(req, res) {
  ReportService.getAnalystByReportId(req.query.reportId)
    .then(responseHelper.respondWithResult(res))
    .catch(responseHelper.handleError(res));
}

export function getCategoriesByReportId(req, res) {
  ReportService.getCategoriesByReportId(req.query.reportId)
    .then(responseHelper.respondWithResult(res))
    .catch(responseHelper.handleError(res));
}

export function getClientByReportId(req, res) {
  ReportService.getClientByReportId(req.query.reportId)
    .then(responseHelper.respondWithResult(res))
    .catch(responseHelper.handleError(res));
}

export function getFirmByReportId(req, res) {
  ReportService.getFirmByReportId(req.query.reportId)
    .then(responseHelper.respondWithResult(res))
    .catch(responseHelper.handleError(res));
}

export function updatePlacement(req, res) {
  let reportItem = req.body.reportItem;
  ReportService.updatePlacement(reportItem)
    .then(responseHelper.respondWithResult(res))
    .catch(responseHelper.handleError(res));
}

export function getAnalystHistoryByReportId(req, res) {
  ReportService.getAnalystHistoryByReportId(req.query.reportId)
    .then(responseHelper.respondWithResult(res))
    .catch(responseHelper.handleError(res));
}

export function getListNoteByReportId(req, res) {
  ReportService.getListNoteByReportId(req.query.reportId)
    .then(responseHelper.respondWithResult(res))
    .catch(responseHelper.handleError(res));
}

export function getPlacementByMajorReport(req, res) {
  ReportService.getPlacementByMajorReport(req.query.data)
    .then(responseHelper.respondWithResult(res))
    .catch(responseHelper.handleError(res));
}

export function getClientTabByReportId(req, res) {
  ReportService.getClientTabByReportId(req.query.reportId)
    .then(responseHelper.respondWithResult(res))
    .catch(responseHelper.handleError(res));
}

export function getRankingReportsByClient(req, res) {
  var clientId = req.query.clientId;
  ReportService.getRankingReportsByClient(clientId)
  .then(responseHelper.respondWithResult(res))
  .catch(responseHelper.handleError(res));
}
