'use strict';
import * as responseHelper from '../../../components/helper/response-helper';
import config from '../../../config/environment';
var AnalystService = require('../../services/analyst.service');
var ClientService = require('../../services/client.service');
var AnalystAlignmentService = require('../../services/analyst-alignment.service');
var ActivityService = require('../../services/activity.service');
var ObjectTemplateService = require('../../services/object-templates.service');
var InsightService = require('../../services/insight.service');
var eventService = require('../../services/event.service');

export function getPublishAnalystImage(req, res) {
  var analystId = req.publishData.object_id;
  var mediaType = config.typeUploadImage.AVATAR;
  AnalystService.getAnalystImage(analystId, mediaType).then(image => {
    return res.status(200).json(image);
  })
    .catch(responseHelper.handleError(res));
}

export function getPublishClientImage(req, res) {
  var clientId = req.publishData.object_metadata;
  ClientService.getClientImage(clientId).then(image => {
    return res.status(200).json(image);
  })
    .catch(responseHelper.handleError(res));
}

export function getPublishAnalyst(req, res) {
  var analystId = req.publishData.object_id;
  AnalystService.getPublishAnalystById(analystId)
    .then(responseHelper.respondWithResult(res))
    .catch(responseHelper.handleError(res));
}

export function getPublishClientById(req, res) {
  var clientId = req.publishData.object_metadata;
  ClientService.getPublishClientById(clientId)
    .then(responseHelper.respondWithResult(res))
    .catch(responseHelper.handleError(res));
}

export function getPublishMarketActivity(req, res) {
  var analystId = req.publishData.object_id;
  AnalystAlignmentService.getAnalystOverviewInfoByAnalystId(analystId).then(data => {
    return res.send(data);
  })
    .catch(function(err) {
    });
}

export function getPublishNotes(req, res) {
  var analystId = req.publishData.object_id;
  ActivityService.getListNoteByAnalystId(analystId)
    .then(data => {
      res.send(data)
    })
    .catch(err => {
      res.status(400).json(err);
    });
}

export function getPublishAnalystList(req, res) {
  AnalystService.getAllAnalystInfo()
    .then(data => {
      res.send(data);
    })
    .catch(responseHelper.handleError(res));
}

export function getListPublishItemValueByAnalystId(req, res) {
  var analystId = req.publishData.object_id;
  ObjectTemplateService.getListItemValueByAnalystId(analystId)
    .then(responseHelper.respondWithResult(res))
    .catch(responseHelper.handleError(res));
}

export function getListPublishGroupByTemplateId(req, res) {
  var templateId = req.query.objectTemplateId;
  ObjectTemplateService.getListGroupByTemplateId(templateId)
    .then(responseHelper.respondWithResult(res))
    .catch(responseHelper.handleError(res));
}

export function getListPublishItemValueByAnalystClientViewId(req, res) {
  var analystId = req.publishData.object_id;
  var clientId = req.publishData.object_metadata;
  ObjectTemplateService.getListItemValueByAnalystClientViewId(analystId, clientId)
    .then(rs => {
      res.send(rs)
    })
    .catch(err => {
      res.status(400).json(err);
    });
}

export function getPublishInsightByAnalystId(req, res) {
  var analystId = req.publishData.object_id;
  InsightService.getInsightByAnalystId(analystId).then(data => {
    res.send(data);
  }).catch(responseHelper.handleError(res));
}

export function getMajorReport(req, res) {
  var analystId = req.publishData.object_id;
  AnalystService.getMajorReport(analystId).then(data => {
    res.send(data);
  })
    .catch(responseHelper.handleError(res));
}

export function getPublishActivityByAnalystId(req, res) {
  var analystId = req.publishData.object_id;
  ActivityService.getActivityByAnalystId(analystId)
    .then(data => { res.send(data) })
    .catch(err => {
      res.status(400).json(err); });
}

export function getPublishEventByAnalystId(req, res) {
  var analystId = req.publishData.object_id;
  eventService.GetEventByAnalystId(analystId).then(data => {
    res.send(data);
  })
    .catch(responseHelper.handleError(res));
}

export function getListInsightByAnalystId(req, res) {
  var analystId = req.publishData.object_id;
  let currentUserData = req.userData;
  let data = {
    analystId: analystId,
    role: currentUserData.role,
    clientIds: currentUserData.clientIds ? currentUserData.clientIds.split(',') : ['']
  }
  InsightService.getListInsightByAnalystId(data).then(data => {
    res.send(data);
  }).catch(responseHelper.handleError(res));
}

export function getPublishClientAssocialAnalyst(req, res) {
  var analystId = req.publishData.object_id;
  AnalystService.getClientAssocialAnalyst(analystId).then(data => {
    return res.status(200).json(data);
  })
    .catch(responseHelper.handleError(res));
}




