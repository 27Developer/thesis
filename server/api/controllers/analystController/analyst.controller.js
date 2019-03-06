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
var AnalystService = require('../../services/analyst.service');

export function GetAllAnalysts(req, res) {
  AnalystService.GetAllAnalysts()
    .then(responseHelper.respondWithResult(res))
    .catch(responseHelper.handleError(res));
}

export async function GetDataToFilters(req, res) {
  AnalystService.GetDataToFilters()
    .then(responseHelper.respondWithResult(res))
    .catch(responseHelper.handleError(res));
}

export async function GetAnalystList(req, res) {
  let bearerToken;
  let bearerHeader = req.headers['authorization'];
  let bearer = bearerHeader.split(' ');
  bearerToken = bearer[1];
  AnalystService.GetAnalystList(bearerToken)
    .then(responseHelper.respondWithResult(res))
    .catch(responseHelper.handleError(res));
}

export function GetAnalystById(req, res) {
  var analystId = req.params.id;
  AnalystService.GetAnalystById(analystId)
    .then(responseHelper.respondWithResult(res))
    .catch(responseHelper.handleError(res));
}

export function BuildCSV(req, res) {
  var csvData = req.body.data;
  AnalystService.GetAnalystById(analystId)
    .then(csv => {
      res.send(csv);
    })
    .catch(responseHelper.handleError(res));
}

export function CheckAnalyst(req, res) {
  var analystId = req.query.id;
  var analystName = req.query.name;
  AnalystService.CheckAnalyst(analystId, analystName)
    .then(responseHelper.checkIfAvailable(res))
    .catch(responseHelper.handleError(res));
}

export function AddAnalyst(req, res) {
  var data = req.body.analystData;
  AnalystService.AddAnalyst(data).then(analyst => {
    res.send(analyst);
  })
    .catch(responseHelper.handleError(res));
}

export function UpdateAnalyst(req, res) {
  var data = req.body.analystData;
  var oldData = req.body.oldAnalystData;
  AnalystService.UpdateAnalyst(data, oldData).then(analyst => {
    res.send();
  })
    .catch(responseHelper.handleError(res));
}

export function checkAnalystForMasterById(req, res) {
  const analystId = req.query.analystId;
  const clientId = req.query.clientId;
  AnalystService.checkAnalystForMasterById(analystId, clientId).then(() => {
    res.send();
  })
    .catch((err) => {
      console.log(err);
    });
}

export function getAnalystForMasterById(req, res) {
  const analystId = req.query.analystId;
  const clientId = req.query.clientId;
  var currentUserData = req.userData;
  AnalystService.getAnalystForMasterById(analystId, clientId, currentUserData).then(responseData => {
    return res.status(200).json(responseData);
  })
    .catch(responseHelper.handleError(res));
}

export function goToPageEngagement(req, res) {
  var result = [];
  const analystId = req.query.analystId;
  const clientId = req.query.clientId;
  const order = req.query.order !== null ? req.query.order : 'date';
  const orderType = req.query.orderType !== null ? req.query.orderType : 'DESC';
  const engagement = req.query.engagement;
  AnalystService.goToPageEngagement(analystId, clientId, order, orderType, engagement).then(result => {
    return res.status(200).json(result);
  })
    .catch(responseHelper.handleError(res));
}

export function getAnalystImage(req, res) {
  var analystId = req.params.id;
  var mediaType = req.params.type;
  AnalystService.getAnalystImage(analystId, mediaType).then(image => {
    return res.status(200).json(image);
  })
    .catch(responseHelper.handleError(res));
}

export function updateTask(req, res) {
  const taskDate = req.body.date;
  const taskId = req.body.taskId;
  const asanaId = req.body.asanaId;
  AnalystService.updateTask(taskDate, taskId, asanaId).then(() => {
    res.send();
  })
    .catch(responseHelper.handleError(res));
}

export function createTask(req, res) {
  const task = req.body.task;
  AnalystService.createTask(task).then(data => {
    res.send(200).json(data);
  })
    .catch(responseHelper.handleError(res));
}

export function updateInfluencing(req, res) {
  const data = req.body.influencing;
  AnalystService.updateInfluencing(data).then(() => {
    res.send();
  })
    .catch(responseHelper.handleError(res));
}

export function getAnalystForCalendar(req, res) {
  const clientId = req.query.clientId;
  AnalystService.getAnalystActivityByClientId(clientId)
    .then(responseHelper.respondWithResult(res))
    .catch(responseHelper.handleError(res));
}

export function getAnalystForCalendarByCollectionId(req, res) {
  const collectionId = req.query.collectionId;
  AnalystService.getAnalystForCalendarByCollectionId(collectionId)
    .then(responseHelper.respondWithResult(res))
    .catch(responseHelper.handleError(res));
}

export function getAnalystDetailById(req, res) {
  var analystId = req.query.id;
  AnalystService.getAnalystDetailById(analystId).then(client => {
    return res.status(200).json(client);
  })
    .catch(responseHelper.handleError(res));
}

export function createBriefingRequest(req, res) {
  var data = req.body.data;
  AnalystService.createBriefingRequest(data).then(() => {
    res.send();
  })
    .catch(responseHelper.handleError(res));
}

export function getBriefingRequestByTaskId(req, res) {
  var taskId = req.query.id;
  AnalystService.getBriefingRequestByTaskId(taskId).then(client => {
    return res.status(200).json(client);
  })
    .catch(responseHelper.handleError(res));
}

export function deleteAnalyst(req, res) {
  var listSelectedAnalyst = req.body.listSelectedAnalyst;
  AnalystService.deleteAnalyst(listSelectedAnalyst).then(() => {
    res.send();
  })
    .catch(responseHelper.handleError(res));
}

export function getClientAssocialAnalyst(req, res) {
  const analystId = req.query.analystId;
  AnalystService.getClientAssocialAnalyst(analystId).then(data => {
    return res.status(200).json(data);
  })
    .catch(responseHelper.handleError(res));
}

export function getClientAssocialAnalystViaActivity(req, res) {
  const analystId = req.query.analystId;
  AnalystService.getClientAssocialAnalystViaActivity(analystId).then(data => {
    return res.status(200).json(data);
  })
    .catch(responseHelper.handleError(res));
}

export function getMajorReport(req, res) {
  var analystId = req.query.analystId;
  AnalystService.getMajorReport(analystId).then(data => {
    res.send(data);
  })
    .catch(responseHelper.handleError(res));
}

export function getAllAnalystInfo(req, res) {
  AnalystService.getAllAnalystInfo()
    .then(data => {
      res.send(data);
    })
    .catch(responseHelper.handleError(res));
}

export function getSubSegmentByAnalystSegment(req, res) {
  const analystId = req.query.analystId;
  const clientId = req.query.clientId;
  const segmentId = req.query.segmentId;
  AnalystService.getSubSegmentByAnalystSegment(analystId, clientId, segmentId)
    .then(data => {
      return res.status(200).json(data);
    })
    .catch(responseHelper.handleError(res));
}

export function getAvgSentimentForAnalysts(req, res) {
  AnalystService.getAvgSentimentForAnalysts()
    .then(data => {
      return res.status(200).json(data);
    })
    .catch(responseHelper.handleError(res));
}

export function getGlobalSegment(req, res) {
  AnalystService.getGlobalSegment()
    .then(data => {
      return res.status(200).json(data);
    })
    .catch(responseHelper.handleError(res));
}

export function countInsightForAnalystList(req, res) {
  var analystId = req.body.analystId;
  AnalystService.countInsightForAnalystList(analystId)
    .then(data => {
      return res.status(200).json(data);
    })
    .catch(responseHelper.handleError(res));
}

export function countPastInsightForAnalystList(req, res) {
  var analystId = req.body.analystId;
  AnalystService.countPastInsightForAnalystList(analystId)
    .then(data => {
      return res.status(200).json(data);
    })
    .catch(responseHelper.handleError(res));
}

export function getAnalystsByClient(req, res) {
  var clientId = req.query.clientId;
  AnalystService.getAnalystsByClient(clientId)
    .then(data => {
      return res.status(200).json(data);
    })
    .catch(responseHelper.handleError(res));
}
