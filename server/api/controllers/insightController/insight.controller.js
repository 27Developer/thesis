'use strict';
import config from '../../../config/environment';
import * as responseHelper from '../../../components/helper/response-helper';
import {
  Insight
} from '../../../sqldb';

var InsightService = require('../../services/insight.service');

export function addInsight(req, res) {
  let insight = req.body.insight;
  let currentUserData = req.userData;
  InsightService.addInsight(insight, currentUserData).then(data => {
    res.status(200).json(data);
  })
  .catch(responseHelper.handleError(res));
}

export function editInsight(req, res) {
  let insight = req.body.insight;
  InsightService.editInsight(insight)
    .then(responseHelper.respondWithResult(res))
    .catch(responseHelper.handleError(res));
}

export function deleteInsight(req, res) {
  let insightId = req.query.id;
  InsightService.deleteInsight(insightId).then(data => {
    res.status(200).json(data);
  })
  .catch(responseHelper.handleError(res));
}

export function deleteObjectAssociatedToInsight(req, res) {
  let insightId = req.query.id;
  let objectId = req.query.objectId;
  let type = req.query.type;
  InsightService.deleteObjectAssociatedToInsight(insightId, objectId, type).then(data => {
    res.status(200).json(data);
  })
  .catch(responseHelper.handleError(res));
}

export function getListInsightByAnalystId(req, res) {
  let data = req.body.data;
  let client = req.body.client
  InsightService.getListInsightByAnalystId(data, client).then(data => {
    res.send(data);
  }).catch(responseHelper.handleError(res));
}

export function getAllInsight(req, res) {
  let currentPage = req.query.currentPage;
  let itemPerPage = req.query.itemPerPage;
  let sortKey = req.query.sortKey;
  let sortType = req.query.sortType;

  InsightService.getAllInsight(currentPage, itemPerPage, sortKey, sortType)
    .then(data => {
      res.send(data);
    }).catch(responseHelper.handleError(res));
}

export function updateInsight(req, res) {

  var data = req.body.insight;

  return Insight.update({
    checked_by_users: data.checked_by_users,
  },
    {
      where: {
        id: data.id
      }
    })
    .then(function (response) {
      res.send(response);
    })
    .catch(err => {
    });
}

export function updateInsightDescription(req, res) {

  var data = req.body.insight;

  return Insight.update({
    desc: data.desc,
  },
    {
      where: {
        id: data.id
      }
    })
    .then(function (response) {
      res.send(response);
    })
    .catch(err => {
    });
}


export function getInsightById(req, res) {

  var id = req.query.id;

  return Insight.findOne({
    where: {
      id: id
    }
  })
    .then(function (response) {
      res.send(response);
    })
    .catch(err => {

    });
}

export function searchInsightObject(req, res) {
  let keyword = req.query.keyword;
  let clientContextId = req.query.clientContextId;
  let currentUserData = req.userData;

  InsightService.searchInsightObject(keyword, clientContextId, currentUserData)
    .then(data => {
      res.send(data);
    }).catch(responseHelper.handleError(res));
}

export function getInsightObjectByInsightId(req, res) {

  let insightId = req.query.insightId;

  InsightService.getInsightObjectByInsightId(insightId)
    .then(data => {
      res.send(data);
    }).catch(responseHelper.handleError(res));
}

export function searchAnalystForInsight(req, res) {

  let keyword = req.query.keyword;

  InsightService.searchAnalystForInsight(keyword)
    .then(data => {
      res.send(data);
    }).catch(responseHelper.handleError(res));
}

export function searchClientForInsight(req, res) {

  let keyword = req.query.keyword;

  InsightService.searchClientForInsight(keyword)
    .then(data => {
      res.send(data);
    }).catch(responseHelper.handleError(res));
}

export function searchEventForInsight(req, res) {

  let keyword = req.query.keyword;

  InsightService.searchEventForInsight(keyword)
    .then(data => {
      res.send(data);
    }).catch(responseHelper.handleError(res));
}

export function searchCategoryForInsight(req, res) {

  let keyword = req.query.keyword;

  InsightService.searchCategoryForInsight(keyword)
    .then(data => {
      res.send(data);
    }).catch(responseHelper.handleError(res));
}

export function searchReportForInsight(req, res) {

  let keyword = req.query.keyword;

  InsightService.searchAnalystForInsight(keyword)
    .then(data => {
      res.send(data);
    }).catch(responseHelper.handleError(res));
}

export function searchActivityForInsight(req, res) {

  let keyword = req.query.keyword;

  InsightService.searchAnalystForInsight(keyword)
    .then(data => {
      res.send(data);
    }).catch(responseHelper.handleError(res));
}

export function convertBase64ImageToSmaller(req, res) {
  InsightService.convertBase64ImageToSmaller()
    .then(data => {
      res.send(true);
    }).catch(responseHelper.handleError(res));
}

export function getInsightByActivityId(req, res) {
  let activityId = req.query.activityId;
  let clientId = req.query.clientId;
  let currentUserData = req.userData;
  InsightService.getInsightByActivityId(activityId, clientId, currentUserData).then(data => {
    res.send(data);
  }).catch(responseHelper.handleError(res));
}

export function getInsightByActivityIdClientMode(req, res) {
  let activityId = req.query.activity;
  InsightService.getInsightByActivityIdClientMode(activityId).then(data => {
    res.send(data);
  }).catch(responseHelper.handleError(res));
}

export function getInsightByReportId(req, res) {
  let data = req.body.data;
  let client = req.body.client
  InsightService.getInsightByReportId(data, client).then(data => {
    res.send(data);
  }).catch(responseHelper.handleError(res));
}

export function getInsightByReportIdClientMode(req, res) {
  let data = req.query.report;
  InsightService.getInsightByReportIdClientMode(data).then(data => {
    res.send(data);
  }).catch(responseHelper.handleError(res));
}

export function getInsightByCategoryId(req, res) {
  let data = req.query.category;
  InsightService.getInsightByCategoryId(data).then(data => {
    res.send(data);
  }).catch(responseHelper.handleError(res));
}

export function getInsightByEventId(req, res) {
  let data = req.query.event;
  let currentUserData = req.userData;
  InsightService.getInsightByEventId(data, currentUserData).then(data => {
    res.send(data);
  }).catch(responseHelper.handleError(res));
}

export function updateInsightType(req, res) {
  InsightService.updateInsightType()
    .then(data => { res.send(data) })
    .catch(err => {
      console.log(err);
      res.status(400).json(err);
    });
}

export function getInsightByAnalystId(req, res) {
  let data = req.query.analyst;
  let currentUserData = req.userData;
  InsightService.getInsightByAnalystId(data, currentUserData).then(data => {
    res.send(data);
  }).catch(responseHelper.handleError(res));
}

export function getInsightByAnalystIdClientMode(req, res) {
  let data = req.query.analyst;
  InsightService.getInsightByAnalystIdClientMode(data).then(data => {
    res.send(data);
  }).catch(responseHelper.handleError(res));
}

export function getInsightByClientId(req, res) {
  let data = req.query.client;
  InsightService.getInsightByClientId(data).then(data => {
    res.send(data);
  }).catch(responseHelper.handleError(res));
}

export function getInsightByClientIdClientMode(req, res) {
  let data = req.query.client;
  InsightService.getInsightByClientIdClientMode(data).then(data => {
    res.send(data);
  }).catch(responseHelper.handleError(res));
}


export function updateInsightStatus(req, res) {
  let data = req.body.insight;
  InsightService.updateInsightStatus(data)
    .then(data => {
      res.send(data);
    }).catch(responseHelper.handleError(res));
}

export function getInsightByMarketId(req, res) {
  let data = req.query.arrayIds;
  InsightService.getInsightByMarketId(data).then(data => {
    res.send(data);
  }).catch(responseHelper.handleError(res));
}

export function getInsightByCollectionId(req, res) {
  let collectionId = req.query.id;
  let currentUserData = req.userData;
  InsightService.getInsightByCollectionId(collectionId, currentUserData).then(data => {
    res.send(data);
  }).catch(responseHelper.handleError(res));
}

export function deleteInsightRelationship(req, res) {
  let insightId = req.query.insightId;
  let objectId = req.query.objectId;
  let type = req.query.type;
  InsightService.deleteInsightRelationship(insightId, objectId, type).then(data => {
    res.send(data);
  }).catch(responseHelper.handleError(res));
}

export function convertTextFromEtherpadToCkeditorForInsight(req, res) {
  InsightService.convertTextFromEtherpadToCkeditorForInsight()
    .then(data => {
      return res.status(200).json(data);
    })
    .catch(responseHelper.handleError(res));
}

export function getPublisherOfInsight(req, res) {
  let insightId = req.query.insightId;
  InsightService.getPublisherOfInsight(insightId)
    .then(data => {
      return res.status(200).json(data);
    })
    .catch(responseHelper.handleError(res));
}
