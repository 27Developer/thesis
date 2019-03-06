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
var FirmService = require('../../services/firm.service');

export function getResearchByFirmId(req, res) {
  FirmService.getResearchByFirmId(req.query.firmId)
    .then(responseHelper.respondWithResult(res))
    .catch(responseHelper.handleError(res));
}

export function getAnalystByFirmId(req, res) {
  FirmService.getAnalystByFirmId(req.query.firmId)
    .then(responseHelper.respondWithResult(res))
    .catch(responseHelper.handleError(res));
}

export function getAvatarByFirmId(req, res) {
  FirmService.getAvatarByFirmId(req.query.media_id)
    .then(responseHelper.respondWithResult(res))
    .catch(responseHelper.handleError(res));
}
export function getFirmById(req, res) {
  FirmService.getFirmById(req.query.firmId)
    .then(responseHelper.respondWithResult(res))
    .catch(responseHelper.handleError(res));
}

export function getAllFirm(req, res) {
  FirmService.getAllFirm()
    .then(responseHelper.respondWithResult(res))
    .catch(responseHelper.handleError(res));
}

export function getInsightByFirmId(req, res) {
  var firmId = req.query.firmId;
  FirmService.getInsightByFirmId(firmId).then(data => {
    res.send(data);
  })
    .catch(responseHelper.handleError(res));
}

export function getAnalystInfoByFirmId(req, res) {
  var firmId = req.query.firmId;
  FirmService.getAnalystInfoByFirmId(firmId).then(data => {
    res.send(data);
  })
    .catch(responseHelper.handleError(res));
}

export function getInsightTabByFirmId(req, res) {
  var firmId = req.query.firmId;
  FirmService.getInsightTabByFirmId(firmId).then(data => {
    res.send(data);
  })
    .catch(responseHelper.handleError(res));
}

export function getClientByFirmId(req, res) {
  var firmId = req.query.firmId;
  FirmService.getClientByFirmId(firmId)
  .then(data => {
    res.send(data);
  })
    .catch(responseHelper.handleError(res));
}

export function getListClientForFirm(req, res) {
  var firmId = req.query.firmId;
  FirmService.getListClientForFirm(firmId)
  .then(data => {
    res.send(data);
  })
    .catch(responseHelper.handleError(res));
}

export function getEventByFirmId(req, res) {
  var firmId = req.query.firmId;
  FirmService.getEventByFirmId(firmId)
  .then(data => {
    res.send(data);
  })
    .catch(responseHelper.handleError(res));
}

export function getReportbyFirmId(req, res) {
  var firmId = req.query.firmId;
  FirmService.getReportbyFirmId(firmId)
  .then(data => {
    res.send(data);
  })
    .catch(responseHelper.handleError(res));
}

export function getFirmByIdByAnalysts(req, res) {
  var analystIds = req.query.analystIds;
  FirmService.getFirmByIdByAnalysts(analystIds)
  .then(data => {
    res.send(data);
  })
    .catch(responseHelper.handleError(res));
}