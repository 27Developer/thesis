'use strict';
import log4Js from 'log4js/lib/log4js';
import config from '../../../config/environment';
import * as responseHelper from '../../../components/helper/response-helper';
import {
  Client,
  Activity,
  Analyst,
  Task,
  User,
  TaskType,
  ActivityAnalyst,
} from '../../../sqldb';

import { ListClientDto } from '../../dtos/clientDto';
import { ToActivityListDto } from '../../dtos/actitivyDto';

var jwt_decode = require('jwt-decode');
var ActivityService = require('../../services/activity.service');
import constants from '../../../../server/config/environment/shared';

log4Js.configure({
  appenders: [
    { type: 'file', filename: 'logs/client-controller.log', category: 'client-controller' }
  ]
});
var logger = log4Js.getLogger('upload-image-controller');


export function getActivityById(req, res) {
  let id = req.query.id;
  let currentUserData = req.userData;
  ActivityService.getActivityById(id, currentUserData).then(data => {
    res.send(data);
  }).catch(responseHelper.handleError(res));
}

export function getSoleActivityById(req, res) {
  let id = req.query.id;
  ActivityService.getSoleActivityById(id).then(data => {
    res.send(data);
  }).catch(responseHelper.handleError(res));
}

export function getAnalystNameByActivityId(req, res) {
  let id = req.query.id;
  ActivityService.getAnalystNameByActivityId(id).then(data => {
    res.send(data);
  }).catch(responseHelper.handleError(res));
}

export function getActivityAnalystByActivityId(req, res) {
  let id = req.query.id;
  ActivityService.GetActivityAnalystByActivityId(id).then(data => {
    res.send(data);
  }).catch(responseHelper.handleError(res));
}

export function getAnalystByActivity(req, res) {
  let id = req.query.id;
  ActivityService.getAnalystByActivity(id).then(data => {
    res.send(data);
  }).catch(responseHelper.handleError(res));
}


export function getActivityCategoryByActivityId(req, res) {
  let id = req.query.id;
  ActivityService.GetActivityCategoryByActivityId(id).then(data => {
    res.send(data);
  }).catch(responseHelper.handleError(res));
}

export function getActivityClientByActivityId(req, res) {
  let id = req.query.id;
  ActivityService.GetActivityClientByActivityId(id).then(data => {
    res.send(data);
  }).catch(responseHelper.handleError(res));
}

export function getActivityEventByActivityId(req, res) {
  let id = req.query.id;
  ActivityService.GetActivityEventByActivityId(id).then(data => {
    res.send(data);
  }).catch(responseHelper.handleError(res));
}

export function getActivityReportByActivityId(req, res) {
  let id = req.query.id;
  ActivityService.GetActivityReportByActivityId(id).then(data => {
    res.send(data);
  }).catch(responseHelper.handleError(res));
}

export function getActivitySpeakerByActivityId(req, res) {
  let id = req.query.id;
  ActivityService.GetActivitySpeakerByActivityId(id).then(data => {
    res.send(data);
  }).catch(responseHelper.handleError(res));
}

export function getActivityProgressById(req, res) {
  let id = req.query.id;
  ActivityService.getActivityProgressById(id).then(data => {
    res.send(data);
  }).catch(responseHelper.handleError(res));
}

export function GetAllActivity(req, res) {
  let currentPage = req.query.currentPage;
  let itemPerPage = req.query.itemPerPage;
  let sortKey = req.query.sortKey;
  let sortType = req.query.sortType;
  let searchArray = req.query.searchArray;
  ActivityService.getAllActivity(currentPage, itemPerPage, sortKey, sortType, ActivityService.getSearchStringFromSearchArray(searchArray))
    .then(data => {
      res.send(data);
    }).catch(responseHelper.handleError(res));
}

export function getActivityForMonth(req, res) {
  let month = req.query.month;
  let year = req.query.year;
  let searchArray = req.query.searchArray;
  console.log(searchArray);
  ActivityService.getActivityForMonth(month, year, ActivityService.getSearchStringFromSearchArray(searchArray))
    .then(data => {
      res.send(data);
    }).catch(err => {
    responseHelper.handleError(res)
  });
}

export async function getLength(req, res) {
    let searchArray = req.query.searchArray;
  ActivityService.getLength(ActivityService.getSearchStringFromSearchArray(searchArray)).then(data => {
    console.log(JSON.stringify(data));
    console.log(data.length);
    if (data && data.length > 0) {
      console.log(JSON.stringify(data[0]));
      res.send("" + data[0].act_count);
    }
    else {
      console.log(JSON.stringify("ret 0"));
      res.send("0");
    }
  }).catch(responseHelper.handleError(res));
}

export function getDataForNote(req, res) {
  let analystId = req.query.analystId;
  let clientId = req.query.clientId;
  console.log("analyst: " + analystId);
  console.log("client: " + clientId);
  ActivityService.getDataForNote(analystId, clientId).then(data => {
    res.send(data);
  })
    .catch(err => {
      console.log(err);
      responseHelper.handleError(res)
    });
  //.catch(responseHelper.handleError(res));
}

export function getListNote(req, res) {
  let activityId = req.query.activityId;
  ActivityService.getListNote(activityId).then(data => {
    res.send(data);
  })
    .catch(responseHelper.handleError(res));
}

export function addNote(req, res) {
  let data = req.body.data;
  let currentUserData = req.userData;
  ActivityService.addNote(data, currentUserData).then(dataRes => {
    res.send(dataRes);
  })
    .catch(err => {
      console.log(err);
    });
}

export function getActivityTypes(req, res) {
  var activityKind = req.query.kind || constants.activityKind.STANDARD;
  var currentUserData = req.userData;
  ActivityService.getActivityTypes(activityKind, currentUserData)
    .then(rs => { res.send(rs) })
    .catch(err => { res.status(400).json(err); });
}

export function addActivity(req, res) {
  var activity = req.body;
  ActivityService.addActivity(activity)
    .then(rs => { res.send(rs) })
    .catch(err => {
      res.status(400).json(err);
    });
}

export function editActivity(req, res) {
  var activity = req.body;
  ActivityService.editActivity(activity)
    .then(rs => { res.send(rs) })
    .catch(err => { res.status(400).json(err); });
}

export function getListNoteByClientId(req, res) {
  let clientId = req.query.client_id;
  ActivityService.getListNoteByClientId(clientId)
    .then(data => { res.send(data) })
    .catch(err => {
      console.log(err);
      res.status(400).json(err);
    });
}

export function getActivityByAnalystId(req, res) {
  let analystId = req.query.analyst_id;
  ActivityService.getActivityByAnalystId(analystId)
    .then(data => { res.send(data) })
    .catch(err => {
      console.log(err);
      res.status(400).json(err);
    });
}

export function getActivityByClientId(req, res) {
  let clientId = req.query.client_id;
  ActivityService.getActivityByClientId(clientId)
    .then(data => { res.send(data) })
    .catch(err => {
      console.log(err);
      res.status(400).json(err);
    });
}

export function getActivityByCollectionId(req, res) {
  let collectionId = req.query.collection_id;
  ActivityService.getActivityByCollectionId(collectionId)
    .then(data => { res.send(data) })
    .catch(err => {
      console.log(err);
      res.status(400).json(err);
    });
}

export function updateNote(req, res) {
  let data = req.body.data;
  ActivityService.updateNote(data).then(result => {
    res.send(result);
  })
    .catch(err => {
      console.log(err);
    });
}

export function deleteNote(req, res) {
  let data = req.body.data;
  ActivityService.deleteNote(data).then(result => {
    res.send(result);
  })
    .catch(err => {
      console.log(err);
    });
}

export function updateActivityColor(req, res) {
  let data = req.body.data;
  ActivityService.updateActivityColor(data).then(result => {
    res.send(result);
  })
    .catch(err => {
      console.log(err);
    });
}

export function getActivityColor(req, res) {
  let clientIds = req.body.clientIds;
  ActivityService.getActivityColor(clientIds).then(result => {
    res.send(result);
  })
    .catch(err => {
      console.log(err);
    });
}

export function getNote(req, res) {
  let noteId = req.query.note_id;
  ActivityService.getNote(noteId).then(result => {
    res.send(result);
  })
    .catch(err => {
      console.log(err);
    });
}

export function getListNoteByAnalystId(req, res) {
  let analystId = req.query.analyst_id;
  ActivityService.getListNoteByAnalystId(analystId)
    .then(data => { res.send(data) })
    .catch(err => {
      console.log(err);
      res.status(400).json(err);
    });
}

export function deleteActivitySelected(req, res) {
  let activityIds = req.query.activityIds;
  ActivityService.deleteActivitySelected(activityIds)
    .then(data => { res.send(data) })
    .catch(err => {
      console.log(err);
      res.status(400).json(err);
    });
}

export function countUpcomingAcitivity(req, res) {
    let searchArray = req.query.searchArray;
  ActivityService.countUpcomingAcitivity(ActivityService.getSearchStringFromSearchArray(searchArray)).then(data => {
    console.log(JSON.stringify(data));
    console.log(data.length);
    if (data && data.length > 0) {
      console.log(JSON.stringify(data[0]));
      res.send({ count: data[0].act_count });
    }
    else {
      console.log(JSON.stringify("ret 0"));
      res.send("0");
    }
  }).catch(responseHelper.handleError(res));
}

export function fixActivityDateTimeData(req, res) {
  ActivityService.fixActivityDateTimeData()
    .then(data => { res.send(data) })
    .catch(err => {
      console.log(err);
      res.status(400).json(err);
    });
}

export function updateAttributeActivity(req, res) {
  var activity = req.body;
  ActivityService.updateAttributeActivity(activity)
    .then(responseHelper.respondWithResult(res))
    .catch(err => { res.status(400).json(err); });
}

export function updateActivityNameData(req, res) {
  var limit = req.query.limit ? +req.query.limit : 5000;
  var offset = req.query.offset ? +req.query.offset : 0;
  ActivityService.updateActivityNameData(limit, offset)
    .then(data => { res.send(data) })
    .catch(err => {
      console.log(err);
      res.status(400).json(err);
    });
}

export function getListNoteByEventId(req, res) {
  let eventId = req.query.event_id;
  let currentUserData = req.userData;
  ActivityService.getListNoteByEventId(eventId, currentUserData)
    .then(data => { res.send(data) })
    .catch(err => {
      console.log(err);
      res.status(400).json(err);
    });
}

export function searchOutcomeObject(req, res) {
  var keyword = req.query.keyword || '';
  var clientId = req.query.clientId || null;
  var selfId = req.query.selfId || null;
  ActivityService.searchOutcomeObject(keyword, clientId, selfId)
    .then(data => { res.send(data) })
    .catch(err => {
      console.log(err);
      res.status(400).json(err);
    });
}

export function modifyActivityTypes(req, res) {
  var activityTypeList = req.body || {};
  ActivityService.modifyActivityTypes(activityTypeList)
    .then(data => { res.send(data) })
    .catch(err => {
      console.log(err);
      res.status(400).json(err);
    });
}

export function getActivityByEventId(req, res) {
  let eventId = req.query.eventId;
  ActivityService.getActivityByEventId(eventId)
    .then(data => { res.send(data) })
    .catch(responseHelper.handleError(res));
}

export function countInsightForActivityList(req, res) {
  var activityId = req.body.activityId;
  ActivityService.countInsightForActivityList(activityId)
    .then(data => {
      return res.status(200).json(data);
    })
    .catch(responseHelper.handleError(res));
}

export function countPastInsightForActivityList(req, res) {
  var activityId = req.body.activityId;
  ActivityService.countPastInsightForActivityList(activityId)
    .then(data => {
      return res.status(200).json(data);
    })
    .catch(responseHelper.handleError(res));
}

export function convertTextFromEtherpadToCkeditorForNote(req, res) {
  ActivityService.convertTextFromEtherpadToCkeditorForNote()
    .then(data => {
      return res.status(200).json(data);
    })
    .catch(responseHelper.handleError(res));
}

export function getTypeByActivityId(req, res) {
  let id = req.query.id;
  ActivityService.getTypeByActivityId(id).then(data => {
    res.send(data);
  }).catch(responseHelper.handleError(res));
}