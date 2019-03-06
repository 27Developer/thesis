'use strict';
import log4Js from 'log4js/lib/log4js';
import {
  sequelize,
  TaskType,
  Client,
  Activity,
  Analyst,
  ActivityEvent,
  ActivityCategory,
  ActivityReport,
  ActivitySpeaker,
  OutcomeActivity,
  Research,
  RankingReport,
  ClientSpeaker,
  Event,
  Media,
  ClientSpeakerMedia,
  ActivityAnalyst,
  Note,
  ActivityItem,
  Task,
  InteractionType,
  CollectionClient,
  GlobalSetting,
  UserActivityColor,
  AnalystHistory,
  Firm
} from '../../sqldb';
import uuid from 'uuid';
import _ from 'lodash';
import config from '../../config/environment/shared';
import * as changeLogHelper from '../../components/helper/change-log-helper';

import {
  ListActivityForClient,
  TaskActivity,
  TaskActivityAnalyst,
  TaskActivityCategory,
  TaskActivityClient,
  TaskActivityEvent,
  TaskActivityReport,
  TaskActivitySpeaker
} from '../dtos/actitivyDto';
import { ListNoteForAnalyst, ListNoteForAnalystNew } from '../dtos/analystDto';
import { ListNoteForActivity } from '../dtos/actitivyDto';
import { ListNoteForClient, ListNoteForClientNew } from '../dtos/clientDto';
import { ListNoteForEvent } from '../dtos/eventDto';
import { ListNote } from '../dtos/noteDto';
var ClientService = require('./client.service');
var CommonService = require('./common.service');
var Promise = require('bluebird');
var moment = require('moment');

log4Js.configure({
  appenders: [
    { type: 'file', filename: 'logs/client-controller.log', category: 'client-controller' }
  ]
});

export function getActivityById(id, currentUserData) {
  return new Promise((resolve, reject) => {

    return Activity.findOne({
      include: [
        {
          model: TaskType,
          required: false
        },
        {
          model: Analyst,
          as: 'Analysts',
          required: false
        },
        {
          model: Client,
          required: false
        },
        {
          model: Event,
          as: 'Events',
          required: false
        },
        {
          model: ClientSpeaker,
          as: 'Speakers',
          required: false
        },
        {
          model: Research,
          as: 'Categories',
          required: false
        },
        {
          model: RankingReport,
          as: 'Reports',
          required: false
        },
        {
          model: Activity,
          as: 'Activities',
          required: false
        }
      ],
      where: {
        id: id
      }
    })
      .then((data) => {
        if (data != null) {
          var retData = data;

          if (currentUserData.role !== config.role.spotlightAdmin) {
            let clientIds = currentUserData.clientIds.split(',');
            let activityClientId = retData.Client ? retData.Client.id : null;

            if (clientIds.indexOf(activityClientId) > -1) {
              resolve(retData);
            } else {
              throw { code: 403, message: "Forbidden" };
            }
          } else {
            resolve(retData);
          }
        }
      })
      .catch(function (err) {
        console.log(err);
        reject(err);
      })
  });
}

export function getSoleActivityById(id) {
  return new Promise((resolve, reject) => {
    return Activity.findOne({
      include: [
        {
          model: TaskType,
          required: false
        }],
      where: {
        id: id
      }
    })
      .then((data) => {
        resolve(data);
      })
      .catch(function (err) {
        console.log(err);
        reject(err);
      })
  });
}

export function GetActivityAnalystByActivityId(id) {
  return new Promise((resolve, reject) => {
    return Activity.findAll({
      include: [

        {
          model: TaskType,
        },
        {
          model: ActivityAnalyst,
          include: [
            {
              model: Analyst,
              include: [
                {
                  model: Media,
                  as: "Media"
                }
              ]
            }
          ]
        }
      ],
      where: {
        id: id
      }
    })
      .then((data) => {
        if (data && data.length > 0) {
          var retData = data[0];
          resolve(retData);
          return;
        }
      })
      .catch(function (err) {
        console.log("Error: " + err);
        reject(err);
      })
  });
}

export function GetActivityClientByActivityId(id) {
  return new Promise((resolve, reject) => {
    return Activity.findAll({
      include: [
        {
          model: Client,
          include: [
            {
              model: Media,
              as: "Media"
            }
          ]
        }
      ],
      where: {
        id: id
      }
    })
      .then((data) => {
        if (data && data.length > 0) {
          var retData = data[0];
          resolve(retData);
          return;
        }
      })
      .catch(function (err) {
        console.log(err);
        reject(err);
      })
  });
}

export function getAnalystNameByActivityId(id) {
  return new Promise((resolve, reject) => {
    var query = `SELECT GROUP_CONCAT(analyst.name SEPARATOR ', ') as analyst_name 
    FROM activity_analyst 
    LEFT JOIN analyst 
    ON activity_analyst.analyst_id = analyst.id 
    WHERE activity_analyst.activity_id = ? ;`;

    return sequelize.query(query, { replacements: [id], type: sequelize.QueryTypes.SELECT })

      .then(data => {
        resolve(data);
      })
      .catch(err => {
        reject(err);
      });
  });
}

export function GetActivityCategoryByActivityId(id) {
  return new Promise((resolve, reject) => {
    return Activity.findAll({
      include: [
        {
          model: ActivityCategory,
          include: [
            {
              model: Research,
            }
          ]
        }
      ],
      where: {
        id: id
      }
    })
      .then((data) => {
        if (data && data.length > 0) {
          var retData = data[0];
          resolve(retData);
          return;
        }
      })
      .catch(function (err) {
        console.log(err);
        reject(err);
      })
  });
}

export function GetActivityEventByActivityId(id) {
  return new Promise((resolve, reject) => {
    return Activity.findAll({
      include: [
        {
          model: ActivityEvent,
          include: [
            {
              model: Event,
              as: 'Event'
            }
          ]
        }
      ],
      where: {
        id: id
      }
    })
      .then((data) => {
        if (data && data.length > 0) {
          var retData = data[0];
          resolve(retData);
          return;
        }
      })
      .catch(function (err) {
        console.log(err);
        reject(err);
      })
  });
}

export function GetActivityReportByActivityId(id) {
  return new Promise((resolve, reject) => {
    return Activity.findAll({
      include: [
        {
          model: ActivityReport,
          include: [
            {
              model: RankingReport,
            }
          ]
        }
      ],
      where: {
        id: id
      }
    })
      .then((data) => {
        if (data && data.length > 0) {
          var retData = data[0];
          resolve(retData);
          return;
        }
      })
      .catch(function (err) {
        console.log(err);
        reject(err);
      })
  });
}

export function GetActivitySpeakerByActivityId(id) {
  return new Promise((resolve, reject) => {
    return Activity.findAll({
      include: [
        {
          model: ActivitySpeaker,
          include: [
            {
              model: ClientSpeaker
            }
          ]
        }
      ],
      where: {
        id: id
      }
    })
      .then((data) => {
        if (data && data.length > 0) {
          var retData = data[0];
          resolve(retData);
          return;
        }
      })
      .catch(function (err) {
        console.log(err);
        reject(err);
      })
  });
}

export function getActivityByAnalystId(analyst_id) {
  return new Promise((resolve, reject) => {
    var query = `SELECT activity_analyst.activity_id as id, task_type.desc as type, task_type.kind as type_kind, activity.topic as topic, client.name as client ,
    client.id as client_id, activity.start_date as start_date, activity.due_date as due_date, activity.time as time, activity.due_date as date,
    activity.sentiment as sentiment, activity.is_set_time as is_set_time,
    GROUP_CONCAT(DISTINCT client_speaker.name SEPARATOR ', ') AS speaker
    FROM activity
    LEFT JOIN activity_analyst ON activity.id = activity_analyst.activity_id
    LEFT JOIN task_type ON activity.type_id = task_type.id
    LEFT JOIN client ON activity.client_id = client.id
    LEFT JOIN activity_speaker ON activity_speaker.activity_id = activity.id
    LEFT JOIN client_speaker ON client_speaker.id = activity_speaker.speaker_id
    WHERE activity_analyst.analyst_id = ?
    GROUP BY activity.id;`;

    return sequelize.query(query, { replacements: [analyst_id], type: sequelize.QueryTypes.SELECT })

      .then(data => {
        resolve(data);
      })
      .catch(err => {
        reject(err);
      });
  });
}


export function getActivityByClientId(client_id) {
  /*  return new Promise((resolve, reject) => {
   let query = {};
   query.include = [{
   model: Analyst,
   as: 'Analysts',
   attributes: ['id', 'name'],
   where: { is_active: true },
   required: false
   }, {
   model: ClientSpeaker,
   as: 'Speakers',
   attributes: ['name'],
   required: false
   }, {
   model: TaskType,
   as: 'TaskType',
   attributes: ['desc'],
   required: false
   }];
   query.where = {
   client_id: client_id
   }


   return Activity.findAll(query)
   .then(data => {
   resolve(ListActivityForClient(data));
   })
   .catch(error => {
   console.log(error)
   reject(error);
   })
   })*/
  return new Promise((resolve, reject) => {
    let query = `SELECT
    activity.id,
    activity.start_date,
    activity.due_date,
    activity.time,
    activity.topic,
    activity.sentiment,
    activity.is_set_time,
    task_type.desc AS type_name,
    task_type.kind AS type_kind,
    cs.name AS speaker,
    GROUP_CONCAT(DISTINCT cs.name ORDER BY cs.name DESC SEPARATOR '&&&') as all_speakers,
    client.id AS client_id,
    client.name AS client_name,
    GROUP_CONCAT(DISTINCT analyst.name
        SEPARATOR ', ') AS analysts,
    GROUP_CONCAT(note.note_type
        SEPARATOR ', ') AS note_types,
    GROUP_CONCAT(export_set(note.note_status,'1','0','', 1)
        SEPARATOR ', ') AS note_status,
    GROUP_CONCAT(note.note_time
        SEPARATOR ', ') AS note_time,
    activity_item.detail,
    activity.debrief,
    GROUP_CONCAT(DISTINCT r.desc ORDER BY r.desc DESC SEPARATOR '&&&') as all_category,
    GROUP_CONCAT(DISTINCT r.id ORDER BY r.desc DESC SEPARATOR '&&&') as all_category_id,
    GROUP_CONCAT(DISTINCT rr.name ORDER BY rr.name DESC SEPARATOR '&&&') as all_report,
    GROUP_CONCAT(DISTINCT rr.id ORDER BY rr.name DESC SEPARATOR '&&&') as all_report_id,
    GROUP_CONCAT(DISTINCT afirm.firm_name ORDER BY afirm.firm_name DESC SEPARATOR '&&&') as all_firm,
    GROUP_CONCAT(DISTINCT afirm.firm_id ORDER BY afirm.firm_name DESC SEPARATOR '&&&') as all_firm_id
FROM
    activity
        LEFT JOIN
    client ON activity.client_id = client.id
        LEFT JOIN
    insight_activity ON activity.id = insight_activity.activity_id
        LEFT JOIN
    insight ON insight_activity.insight_id = insight.id
        LEFT JOIN
    activity_analyst ON activity.id = activity_analyst.activity_id
        LEFT JOIN
    analyst ON activity_analyst.analyst_id = analyst.id
        LEFT JOIN 
    (SELECT firm.name as firm_name, firm.id as firm_id, analyst_history.analyst_id as analyst_id 
      from analyst_history join firm on analyst_history.firm_id = firm.id 
      where analyst_history.is_active_record = true) afirm 
      on afirm.analyst_id = activity_analyst.analyst_id
        LEFT JOIN
    task_type ON activity.type_id = task_type.id
        LEFT JOIN
    note ON activity.id = note.activity_id
        LEFT JOIN
    activity_item ON activity.id = activity_item.activity_id
        LEFT JOIN
    activity_speaker AS acs ON acs.activity_id = activity.id
        LEFT JOIN
    client_speaker cs ON acs.speaker_id = cs.id
    Left Join activity_category acat on acat.activity_id = activity.id
    Left Join research r on r.id = acat.category_id
    Left Join activity_report ar on ar.activity_id = activity.id
    Left Join ranking_report rr on rr.id = ar.report_id
WHERE
    activity.client_id = ?
GROUP BY activity.id`;

    return sequelize.query(query, { replacements: [client_id], type: sequelize.QueryTypes.SELECT })
      .then(data => {
        resolve(data);
      })
      .catch(err => {
        reject(err);
      });
  });
}

export function getActivityByCollectionId(collectionId) {
  return new Promise((resolve, reject) => {

    return CollectionClient.findAll({
      where: {
        collection_id: collectionId,
      }
    }).then(res => {

      let clientIds = _.map(res, function (item) {
        return item.dataValues.client_id
      });

      let query = {};
      query.include = [{
        model: Analyst,
        as: 'Analysts',
        attributes: ['id', 'name'],
        where: { is_active: true },
        include: [{
          model: AnalystHistory,
          as: 'AnalystHistory',
          where: {is_active_record: true},
          include: [{
            model: Firm,
            attributes: ['name', 'id'],
            where: {is_active: true}
          }]
        }],
        required: false
      }, {
        model: ClientSpeaker,
        as: 'Speakers',
        attributes: ['name'],
        required: false
      }, {
        model: TaskType,
        as: 'TaskType',
        attributes: ['desc', 'kind'],
        required: false
      }, {
        model: Client,
        as: 'Client',
        attributes: ['id', 'name'],
        required: false
      }];
      query.where = {
        client_id: { $in: clientIds }
      }


      return Activity.findAll(query)
        .then(data => {
          resolve(ListActivityForClient(data));
        })
        .catch(error => {
          console.log(error)
          reject(error);
        })
    }).catch(err => {
      console.log(err);
    })
  })
}

export function getActivityProgressById(id) {
  return new Promise((resolve, reject) => {
    var query = `SELECT activity.id, activity.due_date, activity.is_set_time, activity.debrief as debrief,
    GROUP_CONCAT(note.note_type SEPARATOR ', ') as note_types,
    GROUP_CONCAT(export_set(note.note_status,'1','0','', 1) SEPARATOR ', ') as note_status,
    GROUP_CONCAT(note.note_time SEPARATOR ', ') as note_time
    FROM activity
    LEFT JOIN note ON activity.id = note.activity_id
    LEFT JOIN activity_item ON activity.id = activity_item.activity_id
    LEFT JOIN items ON activity_item.item_id = items.id
    LEFT JOIN groups ON items.group_id = groups.id
    WHERE activity.id = :activityId
    GROUP BY activity.id LIMIT 1`;

    // var queryDebrief = `SELECT activity.id, activity.due_date, activity_item.detail as debrief
    // FROM activity
    // LEFT JOIN activity_item ON activity.id = activity_item.activity_id
    // LEFT JOIN items ON activity_item.item_id = items.id
    // WHERE activity.id = :activityId
    // and items.item_name = 'Debrief' LIMIT 1`;

    var listFunc = [];
    listFunc.push(sequelize.query(query, { replacements: { activityId: id }, type: sequelize.QueryTypes.SELECT }));
    // listFunc.push(sequelize.query(queryDebrief, {
    //   replacements: { activityId: id },
    //   type: sequelize.QueryTypes.SELECT
    // }));
    return Promise.all(listFunc).spread((rs) => {
      var returnObj = rs ? rs[0] : {};
      // if (hasDebrief && hasDebrief.length > 0 && hasDebrief[0].debrief && hasDebrief[0].debrief != '<p></p>' && hasDebrief[0].debrief != '') {
      //   returnObj.has_debrief = true;
      // }
      if (returnObj.debrief && returnObj.debrief != '' && returnObj.debrief != '<p></p>') {
        returnObj.has_debrief = true;
      }
      resolve(returnObj);
    })
      .catch(err => {
        console.log(err);
        reject(err);
      });
  });
}

export function getSearchStringFromSearchArray(searchArrays) {
  var empty = true;
  var searchString = "";
  var searchArray = [];

  if (!searchArrays || searchArrays.length < 1) {
    return '';
  }

  if (typeof searchArrays == 'string') {
    searchArray.push(JSON.parse(searchArrays));
  }
  else {
    searchArray = searchArrays;
  }

  if (!searchArray || searchArray.length < 1) {
    return '';
  }

  searchArray = _.flatMap(searchArray);
  searchArray.forEach(function (searchI) {
    var searchItem = {};

    if (typeof searchI == 'string') {
      searchItem = JSON.parse(searchI);
    }
    else {
      searchItem = searchI;
    }

    if (!empty) {
      searchString += ' AND ';
    }
    empty = false;
    switch (searchItem.field) {
      case 'client_id':
        searchString += "client_id in ("
        searchItem.values.forEach(function (value) {
          searchString += "'" + value + "',";
        });
        searchString = searchString.substr(0, searchString.length - 1) + ")";
        break;
      case 'all_speaker_id':
        searchString += "("
        searchItem.values.forEach(function (value) {
          searchString += "all_speaker_id like '%" + value + "%' OR ";
        });
        searchString = searchString.substr(0, searchString.length - 4) + ")";
        break;
      case 'sentiment':
        searchString += "sentiment in ("
        searchItem.values.forEach(function (value) {
          searchString += value + ",";
        });
        searchString = searchString.substr(0, searchString.length - 1) + ")";
        break;
      case 'type':
        searchString += "type in ("
        searchItem.values.forEach(function (value) {
          searchString += "'" + value + "',";
        });
        searchString = searchString.substr(0, searchString.length - 1) + ")";
        break;
      case 'all_analyst_id':
        searchString += "("
        searchItem.values.forEach(function (value) {
          searchString += "all_analyst_id like '%" + value + "%' OR ";
        });
        searchString = searchString.substr(0, searchString.length - 4) + ")";
        break;
      case 'all_firm':
      searchString += "("
      searchItem.values.forEach(function (value) {
        searchString += "all_firm like '%" + value + "%' OR ";
      });
      searchString = searchString.substr(0, searchString.length - 4) + ")";
      break;
      case 'all_report_id':
        searchString += "("
        searchItem.values.forEach(function (value) {
          searchString += "all_report_id like '%" + value + "%' OR ";
        });
        searchString = searchString.substr(0, searchString.length - 4) + ")";
        break;
      case 'all_category_id':
        searchString += "("
        searchItem.values.forEach(function (value) {
          searchString += "all_category_id like '%" + value + "%' OR ";
        });
        searchString = searchString.substr(0, searchString.length - 4) + ")";
        break;
      case 'topic':
        searchString += "topic like '%" + searchItem.value + "%'";
        break;
      case 'description':
        searchString += "description like '%" + searchItem.value + "%'";
        break;
      case 'start_date':
        var hasStartValue = false;
        if (searchItem.startValue) {
          hasStartValue = true;
          searchString += "(start_date >= '" + searchItem.startValue + "' OR due_date >= '" + searchItem.startValue + "')";
        }
        if (searchItem.endValue) {
          if (hasStartValue) {
            searchString += " AND ";
          }
          searchString += "(start_date <= '" + searchItem.endValue + "' OR due_date <= '" + searchItem.endValue + "')";
        }
        break;
    }
  });
  return searchString;
}

export function getAllActivity(currentPage, itemPerPage, sortKey, sortType, searchString) {
  let offset = 0;
  let limit = 100;
  if (itemPerPage) {
    limit = parseInt(itemPerPage);
  }

  if (currentPage) {
    offset = parseInt(currentPage - 1) * limit;
  }
  var sortStr = sortKey + " IS NULL"
  if (sortType.toLowerCase() === 'desc') {
    sortStr = "a." + sortKey + " IS NOT NULL"
  }

  return new Promise((resolve, reject) => {
    var query = `select *
 from (SELECT
		(CASE
      WHEN tt.kind = 'Standard' THEN a.debrief
      WHEN tt.kind = 'Outcome' THEN a.description
      END) AS description,
        'activity' as source,
        a.id AS id,
        a.name AS name,
        c.name AS client_name,
        a.client_id AS client_id,
        tt.desc AS type,
        tt.kind AS type_kind,
        a.start_date AS start_date,
        a.due_date AS due_date,
        a.topic AS topic,
        a.debrief AS debrief,
        a.description AS 'desc',
        a.sentiment AS sentiment
        ,GROUP_CONCAT(DISTINCT an.name ORDER BY an.name DESC SEPARATOR ', ') as all_analyst_name
	    ,GROUP_CONCAT(DISTINCT an.id ORDER BY an.name DESC SEPARATOR ', ') as all_analyst_id
        ,GROUP_CONCAT(DISTINCT cs.name ORDER BY cs.name DESC SEPARATOR ', ') as all_speaker
        ,GROUP_CONCAT(DISTINCT cs.id ORDER BY cs.name DESC SEPARATOR ', ') as all_speaker_id
        ,GROUP_CONCAT(DISTINCT r.desc ORDER BY r.desc DESC SEPARATOR ', ') as all_category
        ,GROUP_CONCAT(DISTINCT r.id ORDER BY r.desc DESC SEPARATOR ', ') as all_category_id
        ,GROUP_CONCAT(DISTINCT rr.name ORDER BY rr.name DESC SEPARATOR ', ') as all_report
        ,GROUP_CONCAT(DISTINCT rr.id ORDER BY rr.name DESC SEPARATOR ', ') as all_report_id
        ,GROUP_CONCAT(DISTINCT afirm.name ORDER BY afirm.name ASC SEPARATOR ', ') as all_firm,
        a.is_set_time AS is_set_time,
        a.time AS time,
        number_insight.count AS number_insight,
        number_insight_past.count AS number_past_insight
        From activity a
        Left Join activity_analyst aa on aa.activity_id = a.id
        Left Join analyst an on an.id = aa.analyst_id
        Left Join activity_speaker as acs on acs.activity_id = a.id
        Left Join client_speaker cs on acs.speaker_id = cs.id
        Left Join activity_category acat on acat.activity_id = a.id
        Left Join research r on r.id = acat.category_id
        Left Join activity_report ar on ar.activity_id = a.id
        Left Join ranking_report rr on rr.id = ar.report_id
        Left join client c on c.id = a.client_id
        Join task_type tt on a.type_id = tt.id
        LEFT JOIN (SELECT firm.name as name, analyst_history.analyst_id as analyst_id from analyst_history join firm on analyst_history.firm_id = firm.id where analyst_history.is_active_record = true) afirm on afirm.analyst_id = aa.analyst_id
        LEFT JOIN (SELECT ia.activity_id as id, count(ia.activity_id) as count From insight_activity ia Join insight i on ia.insight_id = i.id and i.is_active = 1 Group by ia.activity_id) number_insight ON a.id = number_insight.id
        LEFT JOIN (SELECT ia.activity_id as id, count(ia.activity_id) as count From insight_activity ia Join insight i on ia.insight_id = i.id and i.is_active = 1 and i.updated_date >= (NOW() - INTERVAL 90 DAY) Group by ia.activity_id) number_insight_past ON a.id = number_insight_past.id
        Group by a.id) a `;
    var order_string =
      `ORDER BY ${sortStr}, a.${sortKey} ${sortType}
      LIMIT  ${limit} offset ${offset}`;

    if (searchString && searchString != "") {
      query += " Where " + searchString;
    }
    query = query + " " + order_string;

    return sequelize.query(query, { type: sequelize.QueryTypes.SELECT })
      .then(data => {
        resolve(data);
      })
      .catch(err => {
        reject(err);
      });
  });
}

export function getActivityForMonth(month, year, searchString) {
  return new Promise((resolve, reject) => {

    let dateStr = `${year}-${month}-1`;
    let currentStartDate = moment.utc(dateStr);
    let currentEndDate = moment.utc(dateStr);
    let startDate = currentStartDate.add(1, 'M').format('YYYY-MM-DD');
    let endDate = currentEndDate.subtract(1, 'd').format('YYYY-MM-DD');

    var query = `select *
 from (SELECT
		(CASE
      WHEN tt.kind = 'Standard' THEN a.debrief
      WHEN tt.kind = 'Outcome' THEN a.description
      END) AS description,
        'activity' as source,
        a.id AS id,
        a.name AS name,
        c.name AS client_name,
        a.client_id AS client_id,
        tt.desc AS type,
        tt.kind AS type_kind,
        a.start_date AS start_date,
        a.due_date AS due_date,
        a.topic AS topic,
        a.debrief AS debrief,
        a.description AS 'desc',
        a.sentiment AS sentiment
        ,GROUP_CONCAT(DISTINCT an.name ORDER BY an.name DESC SEPARATOR ', ') as all_analyst_name
	      ,GROUP_CONCAT(DISTINCT an.id ORDER BY an.name DESC SEPARATOR ', ') as all_analyst_id
        ,GROUP_CONCAT(DISTINCT cs.name ORDER BY cs.name DESC SEPARATOR ', ') as all_speaker
        ,GROUP_CONCAT(DISTINCT cs.id ORDER BY cs.name DESC SEPARATOR ', ') as all_speaker_id
        ,GROUP_CONCAT(DISTINCT ar.report_id SEPARATOR ', ') as all_report_id
        ,GROUP_CONCAT(DISTINCT ac.category_id SEPARATOR ', ') as all_category_id,
        a.is_set_time AS is_set_time,
        a.time AS time,
        number_insight.count AS number_insight,
        number_insight_past.count AS number_past_insight
        From activity a
        Left Join activity_analyst aa on aa.activity_id = a.id
        Left Join analyst an on an.id = aa.analyst_id
        Left Join activity_speaker as acs on acs.activity_id = a.id
        Left Join client_speaker cs on acs.speaker_id = cs.id
        Left join client c on c.id = a.client_id
        Left join activity_report ar on a.id = ar.activity_id
        Left join activity_category ac on a.id = ac.activity_id
        Join task_type tt on a.type_id = tt.id
        LEFT JOIN (SELECT ia.activity_id as id, count(ia.activity_id) as count From insight_activity ia Join insight i on ia.insight_id = i.id and i.is_active = 1 Group by ia.activity_id) number_insight ON a.id = number_insight.id
        LEFT JOIN (SELECT ia.activity_id as id, count(ia.activity_id) as count From insight_activity ia Join insight i on ia.insight_id = i.id and i.is_active = 1 and i.updated_date >= (NOW() - INTERVAL 90 DAY) Group by ia.activity_id) number_insight_past ON a.id = number_insight_past.id
        Group by a.id) a
WHERE
    ((MONTH(a.start_date) = ?
        AND YEAR(a.start_date) = ?)
        OR (MONTH(a.due_date) = ?
        AND YEAR(a.due_date) = ?)
         OR (a.due_date > ?
        AND a.start_date < ? )) `;

    let order_string = ' ORDER BY a.is_set_time DESC , a.start_date';

    if (searchString && searchString != "") {
      query += ' AND ' + searchString;
    }

    query = query + " " + order_string;

    return sequelize.query(query, {
      replacements: [month, year, month, year, startDate, endDate],
      type: sequelize.QueryTypes.SELECT
    })
      .then(data => {
        resolve(data);
      })
      .catch(err => {
        console.log(err);
        reject(err);
      });
  });
}

export function getLength(searchString) {

  return new Promise((resolve, reject) => {
    var query = ` select count(*) as act_count from (SELECT
		(CASE
      WHEN tt.kind = 'Standard' THEN a.debrief
      WHEN tt.kind = 'Outcome' THEN a.description
      END) AS description,
        'activity' as source,
        a.id AS id,
        a.name AS name,
        c.name AS client_name,
        a.client_id AS client_id,
        tt.desc AS type,
        tt.kind AS type_kind,
        a.start_date AS start_date,
        a.due_date AS due_date,
        a.topic AS topic,
        a.debrief AS debrief,
        a.description AS 'desc',
        a.sentiment AS sentiment
        ,GROUP_CONCAT(DISTINCT an.name ORDER BY an.name DESC SEPARATOR ', ') as all_analyst_name
	    ,GROUP_CONCAT(DISTINCT an.id ORDER BY an.name DESC SEPARATOR ', ') as all_analyst_id
        ,GROUP_CONCAT(DISTINCT cs.name ORDER BY cs.name DESC SEPARATOR ', ') as all_speaker
        ,GROUP_CONCAT(DISTINCT cs.id ORDER BY cs.name DESC SEPARATOR ', ') as all_speaker_id
        ,GROUP_CONCAT(DISTINCT r.desc ORDER BY r.desc DESC SEPARATOR ', ') as all_category
        ,GROUP_CONCAT(DISTINCT r.id ORDER BY r.desc DESC SEPARATOR ', ') as all_category_id
        ,GROUP_CONCAT(DISTINCT rr.name ORDER BY rr.name DESC SEPARATOR ', ') as all_report
        ,GROUP_CONCAT(DISTINCT rr.id ORDER BY rr.name DESC SEPARATOR ', ') as all_report_id,
        a.is_set_time AS is_set_time,
        a.time AS time,
        number_insight.count AS number_insight,
        number_insight_past.count AS number_past_insight
        From activity a
        Left Join activity_analyst aa on aa.activity_id = a.id
        Left Join analyst an on an.id = aa.analyst_id
        Left Join activity_speaker as acs on acs.activity_id = a.id
        Left Join client_speaker cs on acs.speaker_id = cs.id
        Left Join activity_category acat on acat.activity_id = a.id
        Left Join research r on r.id = acat.category_id
        Left Join activity_report ar on ar.activity_id = a.id
        Left Join ranking_report rr on rr.id = ar.report_id
        Left join client c on c.id = a.client_id
        Join task_type tt on a.type_id = tt.id
        LEFT JOIN (SELECT ia.activity_id as id, count(ia.activity_id) as count From insight_activity ia Join insight i on ia.insight_id = i.id and i.is_active = 1 Group by ia.activity_id) number_insight ON a.id = number_insight.id
        LEFT JOIN (SELECT ia.activity_id as id, count(ia.activity_id) as count From insight_activity ia Join insight i on ia.insight_id = i.id and i.is_active = 1 and i.updated_date >= (NOW() - INTERVAL 90 DAY) Group by ia.activity_id) number_insight_past ON a.id = number_insight_past.id
        Group by a.id) a `;

    if (searchString && searchString != "") {
      query += " Where " + searchString;
    }
    ;

    return sequelize.query(query, { type: sequelize.QueryTypes.SELECT })
      .then(data => {
        resolve(data);
      })
      .catch(err => {
        reject(err);
      });
  });
}

export function getDataForNote(analystId, clientId) {
  return new Promise((resolve, reject) => {

    var whereClause = " WHERE b.analyst_id IN " + analystId + " AND a.due_date < NOW() ";
    if (clientId && clientId != '') {
      whereClause += "AND a.client_id = '" + clientId + "' ";
    }
    var query = `SELECT
    a.client_id, a.start_date as date, b.analyst_id, c.name AS analystName, e.name AS relationship,
    f.desc as taskType, a.id as activityId, client.name as clientName, n.note_time, f.kind as activity_kind
FROM
    activity AS a
        LEFT JOIN
    client as client ON client.id = a.client_id and client.is_active = true
        LEFT JOIN
    activity_analyst AS b ON a.id = b.activity_id
        LEFT JOIN
    analyst AS c ON c.id = b.analyst_id
        LEFT JOIN
    sub_segment_analyst AS d ON d.client_id = a.client_id AND d.analyst_id = b.analyst_id
        LEFT JOIN
    sub_segment AS e ON e.id = d.sub_segment_id
        LEFT JOIN
    task_type AS f ON f.id = a.type_id
        LEFT JOIN
    note AS n ON n.activity_id = a.id
    ${whereClause}
    ORDER BY a.start_date DESC, a.id DESC
    LIMIT 1`;

    return sequelize.query(query, { type: sequelize.QueryTypes.SELECT })
      .then(data => {
        resolve(data);
      })
      .catch(err => {
        console.log(err);
        reject(err);
      });
  });
}

export function addNote(data, currentUserData) {
  return new Promise((resolve, reject) => {
    return sequelize.transaction(async function (t) {

      let obj = {
        id: uuid.v1(),
        note_type: data.noteType,
        update_at: new Date(),
        description: data.description,
        analyst_id: data.analystId,
        activity_id: data.activityId,
        note_status: currentUserData.role == config.role.spotlightClientEdit ? true : data.isPublish,
        activity_type: data.activityType,
        start_date: data.start_date,
        end_date: data.end_date,
        note_time: data.time
      }
      var res = await Note.create(obj, { transaction: t });
      return res;
    })
      .then((response) => {
        resolve(response);
      })
      .catch(err => {
        reject(err);
      });
  });
}

export function getActivityTypes(activityKind, currentUserData) {
  return new Promise((resolve, reject) => {
    var query = {
      where: { is_active: true, kind: activityKind },
      order: [['index', 'ASC']]
    }

    if (currentUserData.role !== config.role.spotlightAdmin) {
      query.where.desc = {
        $and: [{ $ne: 'AD' }, { $ne: 'AD Inquiry' }]
      }
    }
    return TaskType.findAll(query)
      .then(data => {
        resolve(data);
      })
      .catch(err => {
        reject(err);
      });
  });
}

export function addActivity(activity) {
  return new Promise((resolve, reject) => {
    var listAnalysts = activity.selectedAnalysts || [];
    var listSpeakers = activity.selectedSpeakers || [];
    var listEvents = activity.selectedEvents || [];
    var listCategories = activity.selectedCategories || [];
    var listReports = activity.selectedReports || [];
    var listActivities = activity.selectedActivities || [];

    var activityObj = {
      type_id: activity.type.id,
      start_date: activity.start_date ? new Date(activity.start_date) : null,
      due_date: new Date(activity.due_date),
      client_id: (activity.selectedClient && activity.selectedClient.Client) ? activity.selectedClient.Client.id : (activity.selectedClient ? activity.selectedClient.id : ""),
      name: activity.name,
      topic: activity.topic,
      description: activity.description,
      sentiment: activity.sentiment,
      last_updated_date: Date.now(),
      last_updated_by: activity.last_updated_by,
      is_set_time: activity.is_set_time,
      time: activity.time
    }

    var returnActivityId = '-1';
    console.log("Prepare data succeed");
    Activity.create(activityObj).then(rs => {
      var currentActivityId = rs.id;
      returnActivityId = currentActivityId;
      //add speakers, analysts, categories, reports, events
      var listFuncs = [];
      listAnalysts.forEach(analyst => {
        listFuncs.push(ActivityAnalyst.create({ activity_id: currentActivityId, analyst_id: analyst.id }));
      });

      listSpeakers.forEach(speaker => {
        listFuncs.push(ActivitySpeaker.create({ activity_id: currentActivityId, speaker_id: speaker.id }));
      });

      listEvents.forEach(event => {
        listFuncs.push(ActivityEvent.create({ activity_id: currentActivityId, event_id: event.id }));
      });

      listCategories.forEach(category => {
        listFuncs.push(ActivityCategory.create({ activity_id: currentActivityId, category_id: category.id }));
      });

      listReports.forEach(report => {
        listFuncs.push(ActivityReport.create({ activity_id: currentActivityId, report_id: report.id }));
      });

      //if outcome
      listActivities.forEach(activity => {
        listFuncs.push(OutcomeActivity.create({ outcome_id: currentActivityId, activity_id: activity.id }));
      });
      return Promise.all(listFuncs);
    })
      .then(rs => {
        //if(activityObj.client_id && activityObj.client_id != '') {
        //  assignAnalystToClient(activityObj.client_id, listAnalysts);
        //}
        resolve(returnActivityId);
      })
      .catch(err => {
        console.log(err);
        reject(err);
      });
  });
}

let assignAnalystToClient = function (clientId, listAnalyst) {

  return new Promise((resolve, reject) => {
    var query = `SELECT
    a.id AS segmentId, b.id AS subSegmentId
FROM
    segment AS a
        LEFT JOIN
    sub_segment AS b ON a.id = b.segment_id
WHERE
    a.name LIKE '%${config.globalSegment.CORE_OPPORTUNISTIC}%'
        AND b.name LIKE '%${config.globalSegment.OPPORTUNISTIC}%';`;
    return sequelize.query(query, { type: sequelize.QueryTypes.SELECT })
      .then(segmentData => {
        let data = segmentData.length ? segmentData[0] : {};

        var query = `SELECT b.analyst_id FROM sub_segment as a
        left join sub_segment_analyst as b on a.id = b.sub_segment_id
        where a.segment_id = :segmentId and b.client_id = :clientId`;
        return sequelize.query(query, {
          replacements: { clientId: clientId, segmentId: data.segmentId },
          type: sequelize.QueryTypes.SELECT
        })
          .then(analystIds => {
            listAnalyst.forEach(item => {
              if (analystIds.map(x => x.analyst_id).indexOf(item.id) == -1) {
                //add anaylyst to client
                let dataObj = {
                  analyst_id: item.id,
                  client_id: clientId,
                  sub_segment_id: data.subSegmentId
                };
                ClientService.addAnalystToSubSegment(dataObj);
              }
            });
          })
          .catch(err => {
            reject(err);
          });

      })
      .catch(err => {
        reject(err);
      });
  });

}

export function editActivity(activity) {
  console.log(activity)
  return new Promise((resolve, reject) => {
    var listAnalysts = activity.selectedAnalysts || [];
    var listSpeakers = activity.selectedSpeakers || [];
    var listEvents = activity.selectedEvents || [];
    var listCategories = activity.selectedCategories || [];
    var listReports = activity.selectedReports || [];
    var listActivities = activity.selectedActivities || [];
    var conflict = false;
    var detail;
    var last_updated_date;
    var last_updated_by;

    var activityObj = {
      id: activity.id,
      type_id: activity.type.id,
      start_date: new Date(activity.start_date),
      due_date: new Date(activity.due_date),
      client_id: (activity.selectedClient && activity.selectedClient.Client) ? activity.selectedClient.Client.id : (activity.selectedClient ? activity.selectedClient.id : ""),
      name: activity.name,
      topic: activity.topic,
      description: activity.description,
      sentiment: activity.sentiment,
      last_updated_date: Date.now(),
      last_updated_by: activity.last_updated_by,
      is_set_time: activity.is_set_time,
      time: activity.time
    }
    var currentActivityId = activity.id

    Activity.findOne({
      where: { id: activity.id }
    })
      .then(result => {
        if (result) {
          var comp1 = new Date(result.dataValues.last_updated);
          var comp2 = new Date(activity.last_updated);

          if (result.dataValues.last_updated_by != activity.last_updated_by && comp1.toString() != comp2.toString()) {
            conflict = true;
            last_updated_date = result.dataValues.last_updated;
            last_updated_by = result.dataValues.last_updated_by;
            detail = result.dataValues.detail;
            throw new Error('Unable to save, Item has been modified');
          }
        }
        last_updated_date = activityObj.last_updated;
        Activity.update(activityObj, { where: { id: activity.id } }).then(rs => {
          //delete all old relation ship
          var listFuncs = [];
          listFuncs.push(ActivityAnalyst.destroy({ where: { activity_id: currentActivityId } }));
          listFuncs.push(ActivitySpeaker.destroy({ where: { activity_id: currentActivityId } }));
          listFuncs.push(ActivityEvent.destroy({ where: { activity_id: currentActivityId } }));
          listFuncs.push(ActivityCategory.destroy({ where: { activity_id: currentActivityId } }));
          listFuncs.push(ActivityReport.destroy({ where: { activity_id: currentActivityId } }));
          listFuncs.push(OutcomeActivity.destroy({ where: { outcome_id: currentActivityId } }));
          return Promise.all(listFuncs);
        }).then(rs => {
          //add speakers, analysts, categories, reports, events
          var listFuncs = [];
          listAnalysts.forEach(analyst => {
            listFuncs.push(ActivityAnalyst.create({ activity_id: currentActivityId, analyst_id: analyst.id }));
          });

          listSpeakers.forEach(speaker => {
            listFuncs.push(ActivitySpeaker.create({ activity_id: currentActivityId, speaker_id: speaker.id }));
          });

          listEvents.forEach(event => {
            listFuncs.push(ActivityEvent.create({ activity_id: currentActivityId, event_id: event.id }));
          });

          listCategories.forEach(category => {
            listFuncs.push(ActivityCategory.create({ activity_id: currentActivityId, category_id: category.id }));
          });

          listReports.forEach(report => {
            listFuncs.push(ActivityReport.create({ activity_id: currentActivityId, report_id: report.id }));
          });

          listActivities.forEach(activity => {
            listFuncs.push(OutcomeActivity.create({ outcome_id: currentActivityId, activity_id: activity.id }));
          });
          return Promise.all(listFuncs);
        })
          .then(rs => {
            resolve(last_updated_date);
          })
          .catch(err => {
            console.log(err);
            err.conflict = conflict;
            err.last_updated = last_updated_date;
            err.last_updated_by = last_updated_by;
            reject(err);
          });
      })
      .catch(err => {
        err.conflict = conflict;
        err.last_updated = last_updated_date;
        err.last_updated_by = last_updated_by;
        err.detail = detail;
        reject(err);
      });
  });
}

/*export function getListNote(activityId) {
 return new Promise((resolve, reject) => {
 console.log(activityId + " : for get List note");
 return Note.findAll({
 where: { activity_id: activityId }
 })
 .then((data) => {
 resolve(data);
 })
 .catch(err => reject(err));
 });
 } */

// export function getListNote(activityId) {
//   return new Promise((resolve, reject) => {
//     return Activity.findAll({
//       include: [{
//         model: Note,
//         as: 'Notes',
//         required: true,
//         include: [{
//           model: TaskType,
//           as: 'TaskType',
//           required: false,
//           where: { is_active: true }
//         }]
//       }, {
//         model: Client,
//         as: 'Client',
//         required: false
//       }],
//       where: { id: activityId },
//       attributes: ['client_id', 'start_date'],
//     })
//       .then(data => {
//         resolve(ListNoteForActivity(data));
//       })
//       .catch(err => {
//         console.log(err);
//         reject(err);
//       });
//   });
// }

export function getListNote(activityId) {
  return new Promise((resolve, reject) => {
    let query = {};
    query.where = { activity_id: activityId };
    query.include = [{
      model: Activity,
      required: false,

      include: [{
        model: Client,
        required: false,
        where: { is_active: true }
      }, {
        model: TaskType,
        as: 'TaskType',
        required: false,
        where: { is_active: true }
      }]
    }]
    return Note.findAll(query)
      .then(data => {
        resolve(ListNote(data));
      })
      .catch(err => {
        console.log(err);
        reject(err);
      })
  })
}

export function getListNoteByClientId(clientId) {
  return new Promise((resolve, reject) => {
    var listFunctions = [];
    listFunctions.push(Activity.findAll({
      include: [{
        model: Note,
        as: 'Notes',
        required: true,
        include: [{
          model: TaskType,
          as: 'TaskType',
          required: false,
          where: { is_active: true }
        }]
      }, {
        model: Client,
        as: 'Client',
        required: true
      }],
      attributes: ['client_id', 'due_date', 'start_date'],
      where: { client_id: clientId }
    }));
    Promise.all(listFunctions).spread((activities) => {
      resolve(ListNoteForClientNew(activities, []));
    })
      .catch(err => {
        reject(err);
        console.log(err);
      });
  });
}

export function updateNote(data) {
  console.log(data);
  return new Promise((resolve, reject) => {
    let note = {
      note_type: parseInt(data.noteType),
      update_at: new Date(), // data.noteDate,
      description: data.description,
      analyst_id: data.analystId,
      note_status: data.isPublish,
      start_date: data.start_date,
      end_date: data.end_date ? data.end_date : null,
      note_time: data.time
    };
    return Note.update(note, {
      where: {
        id: data.id,
      }
    })
      .then(() => {
        resolve(true);
      })
      .catch(err => {
        console.log(err);
        reject(err);
      });
  });
}

export function updateActivityColor(data) {
  return new Promise((resolve, reject) => {
    return UserActivityColor.findOne({ where: { activity_id: data.activity_id, client_id: data.client_id } })
      .then(response => {
        if (!response) {
          return sequelize.transaction(function (t) {
            return UserActivityColor.create(data, { transaction: t });
          })
            .then(() => {
              resolve(true);
            })
            .catch(err => {
              reject(err);
            });
        } else {
          return sequelize.transaction(function (t) {
            return UserActivityColor.update({
              color: data.color
            }, {
                where: {                  
                  activity_id: data.activity_id,
                  client_id: data.client_id
                },

                transaction: t
              });
          })
            .then(() => {
              resolve(true);
            })
            .catch(err => {
              reject(err);
            });
        }
      })
      .catch(err => {
        reject(err);
      });
  });
}

export function getNote(noteId) {
  return new Promise((resolve, reject) => {
    return Note.findAll({
      where: {
        id: noteId,
      }
    })
      .then((data) => {
        resolve(data);
      })
      .catch(err => {
        reject(err);
        console.log(err);
      });
  });
}

export function getActivityColor(clientIds) {
  return new Promise((resolve, reject) => {
    return UserActivityColor.findAll({
      where: {
        client_id: {
          $in : clientIds
        }
      }
    })
      .then((data) => {
        resolve(data);
      })
      .catch(err => {
        reject(err);
        console.log(err);
      });
  });
}

export function getListNoteByAnalystId(analystId) {
  return new Promise((resolve, reject) => {
    var listFunctions = [];
    listFunctions.push(Activity.findAll({
      include: [{
        model: ActivityAnalyst,
        as: 'ActivityAnalysts',
        attributes: [],
        required: true,
        where: { analyst_id: analystId }
      }, {
        model: Note,
        as: 'Notes',
        required: true,
        include: [{
          model: TaskType,
          as: 'TaskType',
          required: false,
          where: { is_active: true }
        }]
      }, {
        model: Client,
        as: 'Client',
        required: false
      }],
      attributes: ['client_id', 'due_date', 'start_date'],
    }));
    Promise.all(listFunctions).spread((activities) => {
      resolve(ListNoteForAnalystNew(activities, []));
    })
      .catch(err => {
        console.log(err);
        reject(err);
      });
  });
}

export function deleteActivitySelected(activityIds) {
  let arrayActivityId = [];
  arrayActivityId = Array.isArray(activityIds) ? activityIds : [activityIds];
  return new Promise((resolve, reject) => {
    return sequelize.transaction(function (t) {
      let arrPromise = [];
      arrayActivityId.forEach(activityId => {
        arrPromise.push(ActivityAnalyst.destroy({ where: { activity_id: activityId } }, { transaction: t }));
        arrPromise.push(ActivityCategory.destroy({ where: { activity_id: activityId } }, { transaction: t }));
        arrPromise.push(ActivityEvent.destroy({ where: { activity_id: activityId } }, { transaction: t }));
        arrPromise.push(ActivitySpeaker.destroy({ where: { activity_id: activityId } }, { transaction: t }));
        arrPromise.push(ActivityReport.destroy({ where: { activity_id: activityId } }, { transaction: t }));
        arrPromise.push(ActivityItem.destroy({ where: { activity_id: activityId } }, { transaction: t }));
        arrPromise.push(Activity.destroy({ where: { id: activityId } }, { transaction: t }));
      })
      return Promise.all(arrPromise)
        .then(data => {
          resolve(data)
        })
        .catch(error => {
          reject(error);
        });
    })
  });
}

export function countUpcomingAcitivity(searchString) {
  return new Promise((resolve, reject) => {
    var query = ` select count(*) as act_count from (SELECT
		(CASE
      WHEN tt.kind = 'Standard' THEN a.debrief
      WHEN tt.kind = 'Outcome' THEN a.description
      END) AS description,
        'activity' as source,
        a.id AS id,
        a.name AS name,
        c.name AS client_name,
        a.client_id AS client_id,
        tt.desc AS type,
        tt.kind AS type_kind,
        a.start_date AS start_date,
        a.due_date AS due_date,
        a.topic AS topic,
        a.debrief AS debrief,
        a.description AS 'desc',
        a.sentiment AS sentiment
        ,GROUP_CONCAT(DISTINCT an.name ORDER BY an.name DESC SEPARATOR ', ') as all_analyst_name
	    ,GROUP_CONCAT(DISTINCT an.id ORDER BY an.name DESC SEPARATOR ', ') as all_analyst_id
        ,GROUP_CONCAT(DISTINCT cs.name ORDER BY cs.name DESC SEPARATOR ', ') as all_speaker
        ,GROUP_CONCAT(DISTINCT cs.id ORDER BY cs.name DESC SEPARATOR ', ') as all_speaker_id
        ,GROUP_CONCAT(DISTINCT r.desc ORDER BY r.desc DESC SEPARATOR ', ') as all_category
        ,GROUP_CONCAT(DISTINCT r.id ORDER BY r.desc DESC SEPARATOR ', ') as all_category_id
        ,GROUP_CONCAT(DISTINCT rr.name ORDER BY rr.name DESC SEPARATOR ', ') as all_report
        ,GROUP_CONCAT(DISTINCT rr.id ORDER BY rr.name DESC SEPARATOR ', ') as all_report_id,
        a.is_set_time AS is_set_time,
        a.time AS time,
        number_insight.count AS number_insight,
        number_insight_past.count AS number_past_insight
        From activity a
        Left Join activity_analyst aa on aa.activity_id = a.id
        Left Join analyst an on an.id = aa.analyst_id
        Left Join activity_speaker as acs on acs.activity_id = a.id
        Left Join client_speaker cs on acs.speaker_id = cs.id
        Left Join activity_category acat on acat.activity_id = a.id
        Left Join research r on r.id = acat.category_id
        Left Join activity_report ar on ar.activity_id = a.id
        Left Join ranking_report rr on rr.id = ar.report_id
        Left join client c on c.id = a.client_id
        Join task_type tt on a.type_id = tt.id
        LEFT JOIN (SELECT ia.activity_id as id, count(ia.activity_id) as count From insight_activity ia Join insight i on ia.insight_id = i.id and i.is_active = 1 Group by ia.activity_id) number_insight ON a.id = number_insight.id
        LEFT JOIN (SELECT ia.activity_id as id, count(ia.activity_id) as count From insight_activity ia Join insight i on ia.insight_id = i.id and i.is_active = 1 and i.updated_date >= (NOW() - INTERVAL 90 DAY) Group by ia.activity_id) number_insight_past ON a.id = number_insight_past.id
        Group by a.id) a `;

    query += ` where due_date > NOW()`;

    if (searchString && searchString != "") {
      query += " And " + searchString;
    }

    return sequelize.query(query, { type: sequelize.QueryTypes.SELECT })
      .then(data => {
        resolve(data);
      })
      .catch(err => {
        reject(err);
      });
  });
}

export function fixActivityDateTimeData() {
  return new Promise((resolve, reject) => {
    return Activity.findAll({
      attributes: ['id', 'due_date']
    })
      .then(data => {
        var listFunc = [];
        data.forEach(activity => {
          listFunc.push(Activity.update({
            due_date: new Date(activity.due_date).setHours(12)
          },
            {
              where: {
                id: activity.id
              }
            }
          ))
        })
        return Promise.all(listFunc);

      }).then(() => {
        resolve(true);
      })
      .catch(error => {
        console.log(error);
        reject(error);
      });
  })
}

export function updateAttributeActivity(data) {
  var conflict = false;
  var detail;
  var last_updated_date;
  var last_updated_by;
  return new Promise((resolve, reject) => {    
    return sequelize.transaction(async function (t) {
      return await Activity.findOne({
        where: {
          id: data.id
        }
      })
        .then(result => {
          let old_data = ""
          if (result) {
            if (data.item_name === 'How\'d it go?') {
              old_data = result.dataValues.sentiment;
            } else {
              old_data = (data.item_name === 'Topic' ? result.dataValues.topic : result.dataValues.debrief) || "";
            }

            if (result.dataValues.last_updated_by != data.last_updated_by && data.old_data != old_data) {
              conflict = true;
              last_updated_date = result.dataValues.last_updated;
              last_updated_by = result.dataValues.last_updated_by;
              detail = result.dataValues.detail;
              throw new Error('Unable to save, Item has been modified');
            }
          }

          data.last_updated = Date.now();
          last_updated_date = data.last_updated;
          data.last_updated_by = data.last_updated_by;
          Activity.update(data, {
            where: {
              id: data.id,
            }
          }, { transaction: t });
        })
    })
      .then(() => {
        let logObj = {
          section: config.activityDetailConstant,
          summary: `${data.item_name} was changed detail to ${data.detail.replace(/!!!/g, ",")}`,
          user: data.user,
          page: config.pageTemplate.ACTIVITY_PROFILE,
          object_id: data.id,
        };
        changeLogHelper.createChangeLog(logObj);
        resolve(last_updated_date);
      })
      .catch(err => {
        err.conflict = conflict;
        err.last_updated = last_updated_date;
        err.last_updated_by = last_updated_by;
        err.detail = detail;
        reject(err);
      });
  });
}

export function updateActivityNameData(limit, offset) {
  return new Promise((resolve, reject) => {
    return Activity.findAll({
      attributes: ['id', 'name', 'start_date', 'due_date', 'client_id', 'type_id'],
      include: [{
        model: Client,
        attributes: ['name'],
        required: false
      }, {
        model: Analyst,
        as: "Analysts",
        attributes: ['name'],
        required: false
      }, {
        model: RankingReport,
        as: "Reports",
        attributes: ['name'],
        required: false
      }, {
        model: TaskType,
        as: 'TaskType',
        attributes: ['desc', 'kind'],
        required: false
      }],
      limit: limit,
      offset: offset
    })
      .then(data => {
        var listFunc = [];
        data.forEach(activity => {
          var activityName = generateActivityName(activity.TaskType, activity.Client, activity.Analysts, activity.start_date, activity.due_date, activity.Reports);
          listFunc.push(Activity.update({
            name: activityName
          },
            {
              where: {
                id: activity.id
              }
            }
          ))

        })
        return Promise.all(listFunc);

      }).then(() => {
        resolve(true);
      })
      .catch(error => {
        console.log(error);
        reject(error);
      });
  })
}

export function getListNoteByEventId(eventId, currentUserData) {
  return new Promise((resolve, reject) => {
    var query = {
      include: [{
        model: ActivityEvent,
        as: 'ActivityEvents',
        attributes: [],
        required: true,
        where: { event_id: eventId }
      }, {
        model: Note,
        as: 'Notes',
        required: true,
        include: [{
          model: TaskType,
          as: 'TaskType',
          required: false,
          where: { is_active: true }
        }]
      }, {
        model: Client,
        as: 'Client',
        required: false
      }],
      attributes: ['client_id', 'start_date', 'due_date'],
    };

    if (currentUserData.role !== config.role.spotlightAdmin) {
      let clientIds = currentUserData.clientIds.split(',');
      query.include[2].required = true;
      query.include[2].where = {
        id: { $in: clientIds }
      };
      query.include[1].where = {
        note_status: true
      };
    }

    return Activity.findAll(query)
      .then((data) => {
        resolve(ListNoteForEvent(data));
      })
      .catch(err => {
        reject(err);
        console.log(err);
      });
  });
}

function generateActivityName(type, client, analysts, startDate, dueDate, reports) {
  var name = "";
  name = client ? client.name : '';
  name += type ? ` ${type.desc}` : '';

  if (reports && type && type.kind === config.activityKind.OUTCOME_REPORT) {
    reports.forEach((report, index) => {
      name += `${index == 0 ? ' in' : ','} ${report.name}`;
    })
    if (analysts) {
      analysts.forEach((analyst, index) => {
        name += `${index == 0 ? ' by' : ','} ${analyst.name}`;
      })
    }
  } else if (analysts) {
    analysts.forEach((analyst, index) => {
      name += `${index == 0 ? ' with' : ','} ${analyst.name}`;
    })
  }

  if (startDate && dueDate && (moment(startDate).format("YYYY-MM-DD") != moment(dueDate).format("YYYY-MM-DD"))) {
    name += ` from ${moment(startDate).format("YYYY-MM-DD")} to ${moment(dueDate).format("YYYY-MM-DD")}`;
  } else {
    name += ` on ${moment(dueDate).format("YYYY-MM-DD")}`;
  }

  return name;
}

export function searchOutcomeObject(keyword, clientId, selfId) {
  return new Promise((resolve, reject) => {
    let keywordArray = _.filter(keyword.split(' '), item => {
      return item.length && item.length > 1;
    });


    var query = `
    SELECT a.id as id, a.name as name, "Analyst" as type
    FROM (SELECT a.id, a.name FROM analyst as a ` + CommonService.generateWhereAndQueryByKeyWordArray(keywordArray, 'a.name', true) + ` ORDER BY a.name LIMIT 10 offset 0) as a

    union all

    (SELECT cs.id as id, cs.name as name, "Speaker" as type
    FROM client_speaker as cs ` + CommonService.generateWhereAndQueryByKeyWordArray(keywordArray, 'cs.name', false) + ` and cs.client_id = :clientId ORDER BY name LIMIT 10 offset 0)

    union

    (SELECT e.id as id, e.name as name, "Event" as type
    FROM event as e ` + CommonService.generateWhereAndQueryByKeyWordArray(keywordArray, 'e.name', false) +
      ` ORDER BY name LIMIT 10 offset 0)

    union

    (SELECT cate.id as id, cate.desc as name, "Category" as type
    FROM research as cate ` + CommonService.generateWhereAndQueryByKeyWordArray(keywordArray, 'cate.desc', true) +
      ` ORDER BY cate.desc LIMIT 10 offset 0)

    union

    (SELECT r.id as id, r.name as name, "Report" as type
    FROM ranking_report as r `  + CommonService.generateWhereAndQueryByKeyWordArray(keywordArray, 'r.name', true) +
      ` ORDER BY r.name LIMIT 10 offset 0)

    union

    (SELECT ac.id as id, ac.name as name , "Activity" as type
    FROM activity as ac
    LEFT JOIN task_type as tt on ac.type_id = tt.id ` + CommonService.generateWhereAndQueryByKeyWordArray(keywordArray, 'ac.name', false) +
      ` AND tt.kind != 'Outcome'
    AND tt.kind != 'Outcome Report'
    
    ${ selfId ? 'AND (ac.id != :selfId)' : ''}
    ORDER BY name LIMIT 10 offset 0)

    `;

    return sequelize.query(query, { replacements: { selfId: selfId, clientId: clientId }, type: sequelize.QueryTypes.SELECT })
      .then(data => {
        resolve(data);
      })
      .catch(err => {
        reject(err);
      });
  });
}

export function modifyActivityTypes(activityTypeList) {
  return new Promise((resolve, reject) => {
    return TaskType.findAll({ where: { is_active: true, kind: config.activityKind.STANDARD } })
      .then(data => {
        var currentListIds = data.map(type => {
          return type.id
        });
        var newUpdateList = activityTypeList.map(type => {
          return type.id
        });

        var listTypesUpdateIds = currentListIds.filter(x => {
          return newUpdateList.includes(x)
        });
        var listTypesDeleteIds = currentListIds.filter(x => {
          return !newUpdateList.includes(x)
        })

        var listTypesCreate = activityTypeList.filter((type) => {
          return type.id < 0
        });
        var listTypesUpdate = activityTypeList.filter((type) => {
          return listTypesUpdateIds.indexOf(type.id) > -1
        });

        var listFunc = [];

        listTypesDeleteIds.forEach(typeId => {
          listFunc.push(TaskType.update({ is_active: false }, { where: { id: typeId } }));
        })

        listTypesCreate.forEach(type => {
          type.id = uuid();
          type.is_active = true;
          listFunc.push(TaskType.create(type));
        })

        listTypesUpdate.forEach(type => {
          listFunc.push(TaskType.update(type, { where: { id: type.id } }));
        })

        return Promise.all(listFunc);
      })
      .then(rs => {
        return GlobalSetting.update({ last_updated: new Date() }, { where: { action: 'activity_type' } });
      })
      .then(rs => {
        resolve(rs);
      })
      .catch(err => {
        reject(err);
      });
  });
}
export function getActivityByEventId(eventId) {
  return new Promise((resolve, reject) => {
    var query = {};
    query.include = [{
      model: Event,
      as: 'Events',
      attributes: [],
      where: { id: eventId }
    },
    {
      model: Analyst,
      as: 'Analysts',
      attributes: ['id', 'name'],
      where: { is_active: true },
      include: [{
        model: AnalystHistory,
        as: 'AnalystHistory',
        where: {is_active_record: true},
        include: [{
          model: Firm,
          attributes: ['name', 'id'],
          where: {is_active: true}
        }]
      }]
    },
    {
      model: Client,
      attributes: ['id', 'name'],
      where: { is_active: true }
    },
    {
      model: TaskType,
      attributes: ['desc', 'kind'],
      where: { is_active: true }
    },
    {
      model: ClientSpeaker,
      as: 'Speakers',
      attributes: ['id', 'name']
    }];
    return Activity.findAll(query)
      .then(data => {
        resolve(data);
      })
      .catch(err => {
        console.log(err);
        reject(err);
      });
  })
}

export function getAnalystByActivity(activityId) {
  return new Promise((resolve, reject) => {
    var query = {};
    query.include = [{
      model: Analyst,
      as: 'Analysts',
      required: false,
      attributes: ['id', 'name'],
      include: [
        {
          model: Media,
          as: "Media",
          attributes: ['media_id'],
          required: false,
          where: { is_active: true }
        }
      ],
      where: { is_active: true }
    }]
    query.where = { id: activityId };

    return Activity.findOne(query)
      .then(data => {
        resolve(data.dataValues.Analysts);
      })
      .catch(err => {
        console.log(err);
        reject(err);
      });
  })
}

export function countInsightForActivityList(activityId) {
  return new Promise((resolve, reject) => {
    let query =
      `SELECT a.activity_id ,count(a.activity_id) as count FROM insight_activity as a
       inner join insight as b on a.insight_id = b.id and b.is_active = true
       where a.activity_id in (?) group by a.activity_id;`;
    sequelize.query(query, {
      replacements: [activityId],
      type: sequelize.QueryTypes.SELECT
    })
      .then(data => {
        resolve(data)
      })
      .catch(err => reject(err));
  });
}

export function countPastInsightForActivityList(activityId) {
  return new Promise((resolve, reject) => {
    let query =
      `SELECT a.activity_id ,count(a.activity_id) as count FROM insight_activity as a
      inner join insight as b on a.insight_id = b.id and b.is_active = true and b.updated_date >= DATE_SUB(NOW(), INTERVAL 90 DAY)
      where a.activity_id in (?) group by a.activity_id;`;
    sequelize.query(query, {
      replacements: [activityId],
      type: sequelize.QueryTypes.SELECT
    })
      .then(data => {
        resolve(data)
      })
      .catch(err => reject(err));
  });
}

export function deleteNote(data) {
  return new Promise((resolve, reject) => {
    return Note.destroy({
      where: {
        id: data
      }
    }
    )
      .then(() => {
        resolve(true);
      })
      .catch(err => {
        reject(err);
      })
  })
}

export function convertTextFromEtherpadToCkeditorForNote() {
  return new Promise((resolve, reject) => {
    let query =
      `UPDATE note 
      SET note.description = REPLACE(REPLACE(insight.desc, '<!DOCTYPE HTML><html><body>', '<p>'), '</body></html>', '</p>')
      WHERE note.description like '<!DOCTYPE HTML><html><body>%</body></html>';`;
    return sequelize.query(query, { type: sequelize.QueryTypes.UPDATE })
      .then(data => {
        resolve(data);
      })
      .catch(err => {
        reject(err)
      });
  });
}

export function getTypeByActivityId(id) {
  return new Promise((resolve, reject) => {
    let query = `
      SELECT activity.id, task_type.id as task_id, task_type.kind as type_kind, task_type.desc as type_name 
      FROM activity
      LEFT JOIN task_type ON activity.type_id = task_type.id
      WHERE activity.id = :activityId
      `
  return sequelize.query(query, { replacements: { activityId: id }, type: sequelize.QueryTypes.SELECT })
    .then(data => {
      var result = data ? data[0] : null;
      resolve(result);
    })
    .catch(err => {
      reject(err)
    });
  });
}