'use strict';

import uuid from 'uuid/v1';
import _ from 'lodash';
import log4Js from 'log4js';
import * as responseHelper from '../../components/helper/response-helper';

log4Js.configure({
  appenders: [
    { type: 'file', filename: 'logs/analyst-alignment-controller.log', category: 'analyst-alignment-controller' }
  ]
});
var logger = log4Js.getLogger('analyst-alignment-controller');
var Promise = require('bluebird');
import {
  AnalystHistory,
  Analyst,
  ImportanceByAnalystCd,
  MaturityByAnalyst,
  ClientAnalystAlignmentHistory,
  Client,
  sequelize,
  SubSegmentAnalyst
} from '../../sqldb';
import CONSTANTS from '../../config/environment/shared';
var ClientService = require('./client.service');

export function getListClientAnalystAlignmentHistoryByClientId(clientId) {
  return new Promise((resolve, reject) => {
    // var clientId = req.query.clientId;

    var dataCount = 0;
    var responseData = {
      ClientAnalystAlignmentHistory: [],
      analystHistory: [],
      importance: [],
      maturity: []
    };

    return Promise.all(
      [ClientAnalystAlignmentHistory.findAll({ where: { client_id: clientId, is_active: true } }),
      AnalystHistory.findAll({ include: [{ model: Analyst }], where: { is_active_record: true }, attributes: [] }),
      ImportanceByAnalystCd.findAll({ where: { is_active: true } }),
      MaturityByAnalyst.findAll({ where: { is_active: true } })]
    ).spread((clientHealthHistoryData, analystHistoryData, importanceData, maturityData) => {
      responseData.ClientAnalystAlignmentHistory = clientHealthHistoryData.filter(function (data) {
        return data.is_active;
      });
      responseData.analystHistory = analystHistoryData.filter(function (data) {
        return data.Analyst.is_active;
      });
      responseData.importance = importanceData;
      responseData.maturity = maturityData;
      resolve(responseData);
    })
      .catch(function (err) {
        logger.error(err);
        reject(err);
      });
  });
}

export function addNewClientAnalystAlignmentHistory(listNewClientAnalystHealthHistory) {
  return new Promise((resolve, reject) => {
    try {
      //var listNewClientAnalystHealthHistory = req.body.listNewClientAnalystHealthHistory;
      for (var i = 0; i < listNewClientAnalystHealthHistory.length; i++) {
        listNewClientAnalystHealthHistory[i].id = uuid();
        listNewClientAnalystHealthHistory[i].insert_date = new Date();
        listNewClientAnalystHealthHistory[i].is_active = true;
      }
      ClientAnalystAlignmentHistory
        .bulkCreate(listNewClientAnalystHealthHistory)
        .then(response => {
          // return res.status(201).json(response);
          resolve(response);
        })
        .catch(function (err) {
          logger.error(err);
          reject(err);
        });
    } catch (err) {
      logger.error(err);
      reject(err);
    }
  });
}

export function updateClientAnalystAlignmentHistory(listChangedClientAnalystHealthHistory) {
  return new Promise((resolve, reject) => {
    try {
      //var listChangedClientAnalystHealthHistory = req.body.listChangedClientAnalystHealthHistory;
      for (var i = 0; i < listChangedClientAnalystHealthHistory.length; i++) {
        ClientAnalystAlignmentHistory
          .update(listChangedClientAnalystHealthHistory[i], { where: { id: listChangedClientAnalystHealthHistory[i].id } });
      }
      // return res.status(200).json(null);
      resolve(null);
    } catch (err) {
      logger.error(err);
      reject(err);
    }
  });
}

export function getListClientByAnalystId(analystId, currentUserData) {
  return new Promise(async (resolve, reject) => {
    var result = {
      info: []
    };

    var queryClient = ` (SELECT 
    b.id,
    b.name,
    d.media_id,
    f.name AS sub_segment_name,
    f.detail AS sub_segment_detail
FROM
    sub_segment_analyst AS a
        LEFT JOIN
    client AS b ON a.client_id = b.id
        LEFT JOIN
    client_media c ON a.client_id = c.client_id
        AND c.is_active = TRUE
        LEFT JOIN
    media d ON d.media_id = c.media_id
        AND d.is_active = TRUE
        LEFT JOIN
    analyst AS e ON e.is_active = TRUE
        AND e.id = a.analyst_id
        LEFT JOIN
    sub_segment AS f ON f.id = a.sub_segment_id
WHERE
    (a.analyst_id = :analystId
        OR b.id IN (SELECT DISTINCT
            (c.id)
        FROM
            activity_analyst AS a
                INNER JOIN
            activity AS b ON a.activity_id = b.id
                INNER JOIN
            client AS c ON b.client_id = c.id
        WHERE
            analyst_id = :analystId))
      AND b.is_active = true
GROUP BY a.client_id)

UNION 

(SELECT DISTINCT
    b.id,
    b.name,
    d.media_id,
    NULL AS sub_segment_name,
    NULL AS sub_segment_detail
FROM
    client AS b
        LEFT JOIN
    client_media c ON b.id = c.client_id
        AND c.is_active = TRUE
        LEFT JOIN
    media d ON d.media_id = c.media_id
        AND d.is_active = TRUE
WHERE
    b.id IN (SELECT DISTINCT
            (c.id)
        FROM
            activity_analyst AS a
                INNER JOIN
            activity AS b ON a.activity_id = b.id
                INNER JOIN
            client AS c ON b.client_id = c.id
        WHERE
            analyst_id = :analystId)
    AND b.is_active = true
    GROUP BY b.id)`;
   
    return Promise.all([sequelize.query(queryClient, { replacements: { analystId: analystId }, type: sequelize.QueryTypes.SELECT })]
    ).spread((info) => {
      result.info = _.uniqBy(info, 'id');
      resolve(result);
    })
      .catch(err => {
        console.log(err);
        reject(err);
      });
  });
}

export function getAnalystOverviewInfoByAnalystId(analystId, currentUserData) {
  return new Promise(async (resolve, reject) => {
    var result = {
      research: [],
      activitiesUpComing: [],
      activitiesRecent: []
    };

    let clientIds = await ClientService.getClientIdsByAnalystId(analystId);
    //James: when is not an admin, just show the client which User and Anaylyst belong to
    if (currentUserData.role != CONSTANTS.role.spotlightAdmin) {
      let clientIdsOfUser = _.split(currentUserData.clientIds, ', ')
      clientIds = _.intersection(clientIds, clientIdsOfUser)
    }
   
    var queryGetTaskRecent = `
    SELECT a.id, a.client_id, b.desc, b.kind as type_kind, a.due_date, a.start_date
    FROM activity as a
    INNER JOIN task_type as b on a.type_id = b.id and b.is_active = true
    LEFT JOIN activity_analyst as c on a.id = c.activity_id
    INNER JOIN analyst as d on d.id = c.analyst_id and d.is_active = true
    where c.analyst_id = :analystId AND a.due_date <= CURDATE() 
    GROUP BY a.id;`;
    var queryGetTaskUpcoming = `
    SELECT a.id, a.client_id, b.desc, b.kind as type_kind, a.due_date, a.start_date
    FROM activity as a
    INNER JOIN task_type as b on a.type_id = b.id and b.is_active = true
    LEFT JOIN activity_analyst as c on a.id = c.activity_id
    INNER JOIN analyst as d on d.id = c.analyst_id and d.is_active = true
    where c.analyst_id = :analystId AND a.due_date > CURDATE() 
    GROUP BY a.id;`;

    var queryResearch = `
    SELECT a.id, a.desc, c.name as market, c.id as marketId
    FROM
      research as a
    LEFT JOIN
      analyst_research_categories as b on a.id = b.research_id
    LEFT JOIN 
      market_category as d on a.id = d.category_id
    INNER JOIN
      market as c on d.market_id = c.id
    where 
    b.analyst_id=:analystId AND
    a.is_active = true AND
    b.is_active = true
    group by c.id`;

    return Promise.all([sequelize.query(queryResearch, { replacements: { analystId: analystId, clientIds: clientIds }, type: sequelize.QueryTypes.SELECT }),   
    sequelize.query(queryGetTaskRecent, { replacements: { analystId: analystId }, type: sequelize.QueryTypes.SELECT }),
    sequelize.query(queryGetTaskUpcoming, { replacements: { analystId: analystId }, type: sequelize.QueryTypes.SELECT })]
    ).spread((research, activitiesRecent, activitiesUpComing) => {
      result.research = research;
      result.activitiesRecent = activitiesRecent;
      result.activitiesUpComing = activitiesUpComing;
      resolve(result);
    })
      .catch(err => {
        console.log(err);
        reject(err);
      });
  });
}
