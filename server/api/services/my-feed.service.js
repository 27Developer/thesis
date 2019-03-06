'use strict';
import log4Js from 'log4js';
import {
  sequelize,
  Client,
  Activity,
  ActivityClient,
  ActivityAnalyst,
  Note,
} from '../../sqldb';
import uuid from 'uuid';

import config from '../../config/environment/shared';
var Promise = require('bluebird');

log4Js.configure({
  appenders: [
    { type: 'file', filename: 'logs/client-controller.log', category: 'client-controller' }
  ]
});

Date.prototype.addDays = function (days) {
  var date = new Date(this.valueOf());
  date.setDate(date.getDate() + days);
  return date;
}

export function getMyFeedClients(currentDate, numberOfDay, listClients, role) {
  return new Promise((resolve, reject) => {
    numberOfDay = numberOfDay || 1;
    var additionQuery = "";
    var listClientIds = [];

    if (role !== config.role.spotlightAdmin && (listClients && listClients.length === 0)) {
      return resolve([]);
    }
    if (listClients && listClients.length > 0) {

      additionQuery = 'AND client.id IN (:clientIds)';
      listClientIds = listClients.map(client => {
        return client.id;
      })
    }
    var query = `SELECT  client.id, client.name, count(activity.id) as activity_count, GROUP_CONCAT(DISTINCT insight.type SEPARATOR ', ') as insights
    FROM activity
    LEFT JOIN client ON activity.client_id = client.id
    LEFT JOIN insight_activity ON activity.id = insight_activity.activity_id
    LEFT JOIN insight ON insight_activity.insight_id = insight.id
    WHERE ((DATE(activity.start_date) <= DATE(:date) AND DATE(activity.due_date) >= DATE(:date)) OR (DATE(activity.due_date) = DATE(:date) AND activity.start_date IS NULL))
    AND client.is_active = 1 
    ${additionQuery}
	  GROUP BY client.id;`;

    var listFunc = [];
    for (let i = 0; i < numberOfDay; i++) {
      var thatDate = new Date(currentDate);
      listFunc.push(sequelize.query(query, { replacements: { date: thatDate.addDays(-i).toISOString(), clientIds: listClientIds }, type: sequelize.QueryTypes.SELECT }));
    }
    return Promise.all(listFunc).then(rs => {
      resolve(rs);
    })
      .catch(err => {
        console.log(err);
        reject(err);
      });
  });
}

export function getMyFeedActivities(currentDate, numberOfDay, timezone, clientIds, analystIds) {
  return new Promise((resolve, reject) => {
    numberOfDay = numberOfDay || 1;
    timezone = timezone >= 0 ? "+" + timezone : timezone;

    var additionalQuery = '';
    if (clientIds.length > 0) {
      additionalQuery += " AND client.id IN (:clientIds)";
    }
    if (analystIds.length > 0) {
      additionalQuery += " AND analyst.id IN (:analystIds)";
    }

    var query = `SELECT activity.id, activity.start_date, activity.due_date, activity.is_set_time, activity.debrief,
      task_type.desc as type_name, task_type.kind as type_kind, client.id as client_id, client.name as client_name, 
      GROUP_CONCAT(DISTINCT analyst.name SEPARATOR ', ') as analysts,
      GROUP_CONCAT(note.note_type SEPARATOR ', ') as note_types,
      GROUP_CONCAT(export_set(note.note_status,'1','0','', 1) SEPARATOR ', ') as note_status,
      GROUP_CONCAT(note.note_time SEPARATOR ', ') as note_time,
      items.item_name
    FROM activity
    LEFT JOIN client ON activity.client_id = client.id
    LEFT JOIN insight_activity ON activity.id = insight_activity.activity_id
    LEFT JOIN insight ON insight_activity.insight_id = insight.id
    INNER JOIN activity_analyst ON activity.id = activity_analyst.activity_id
    INNER JOIN analyst ON activity_analyst.analyst_id = analyst.id
    LEFT JOIN task_type ON activity.type_id = task_type.id
    LEFT JOIN note ON activity.id = note.activity_id

    LEFT JOIN activity_item ON activity.id = activity_item.activity_id
    LEFT JOIN items ON activity_item.item_id = items.id
    LEFT JOIN groups ON items.group_id = groups.id

    WHERE ((DATE(CONVERT_TZ(activity.start_date, @@global.time_zone, '${timezone}:00')) <= DATE(CONVERT_TZ(:date, @@global.time_zone, '${timezone}:00')) 
      AND DATE(CONVERT_TZ(activity.due_date,@@global.time_zone, '${timezone}:00')) >= DATE(CONVERT_TZ(:date, @@global.time_zone, '${timezone}:00')))
      OR (DATE(CONVERT_TZ(activity.due_date,@@global.time_zone, '${timezone}:00')) = DATE(CONVERT_TZ(:date, @@global.time_zone, '${timezone}:00')) AND activity.start_date IS NULL))
      AND task_type.kind = '${config.activityKind.STANDARD}'
      ${additionalQuery}

	  GROUP BY activity.id`;

    var listFunc = [];
    for (let i = 0; i < numberOfDay; i++) {
      var thatDate = new Date(currentDate);
      listFunc.push(sequelize.query(query, { replacements: { date: thatDate.addDays(i).toISOString(), clientIds: clientIds, analystIds: analystIds }, type: sequelize.QueryTypes.SELECT }));
    }
    return Promise.all(listFunc).then(rs => {
      resolve(rs);
    })
      .catch(err => {
        console.log(err);
        reject(err);
      });
  });
}

export function getMyFeedInsights(currentDate, numberOfDay, timezone, clientIds) {
  return new Promise((resolve, reject) => {
    numberOfDay = numberOfDay || 1;
    timezone = timezone >= 0 ? "+" + timezone : timezone;
    var listFunc = [];
    for (let i = 0; i < numberOfDay; i++) {
      var thatDate = new Date(currentDate);
      listFunc.push(getMyFeedInsight(thatDate.addDays(-i), timezone, clientIds));
    }
    return Promise.all(listFunc).then(rs => {
      resolve(rs);
    })
      .catch(err => {
        console.log(err);
        reject(err);
      });
  });
}

function getMyFeedInsight(date, timezone, clientIds) {
  return new Promise((resolve, reject) => {

    var listFunc = [];
    listFunc.push(clientIds.length > 0 ? getListAnalystByListClient(clientIds): []);
    listFunc.push(clientIds);
    listFunc.push(clientIds.length > 0 ? getListEventByListClient(clientIds) : []);
    listFunc.push(clientIds.length > 0 ? getListReportByListClient(clientIds) : []);
    listFunc.push(clientIds.length > 0 ? getListActivityByListClient(clientIds) : []);
    listFunc.push(clientIds.length > 0 ? getListCategoryByListClient(clientIds) : []);
    return Promise.all(listFunc).spread((analysts, clientIds, events, reports, activities, categories) => {
      //convert to array
      var analystIds = analysts.map(analyst => { return analyst.id });
      var eventIds = events.map(event => { return event.id });
      var reportIds = reports.map(report => { return report.id });
      var activityIds = activities.map(activity => { return activity.id });
      var categoryIds = categories.map(category => { return category.id });

      var queryAnalysts = `
        SELECT analyst.id, analyst.name, GROUP_CONCAT(DISTINCT insight.type SEPARATOR ', ') as insights, count(DISTINCT insight.id) as insight_count
        FROM analyst
        INNER JOIN insight_analyst ON analyst.id = insight_analyst.analyst_id
        INNER JOIN insight ON insight_analyst.insight_id = insight.id
        WHERE (DATE(CONVERT_TZ(insight.created_date, @@global.time_zone, '${timezone}:00')) = DATE(CONVERT_TZ(:date, @@global.time_zone, '${timezone}:00')))
        AND analyst.is_active = true
        ${ clientIds.length > 0 ? ' AND analyst.id IN (:analystIds)' : '' }
        GROUP BY analyst.id;
      `;

      var queryClients = `
        SELECT client.id, client.name, GROUP_CONCAT(DISTINCT insight.type SEPARATOR ', ') as insights, count(DISTINCT insight.id) as insight_count
        FROM client
        INNER JOIN insight_client ON client.id = insight_client.client_id
        INNER JOIN insight ON insight_client.insight_id = insight.id
        
        WHERE (DATE(CONVERT_TZ(insight.created_date, @@global.time_zone, '${timezone}:00')) = DATE(CONVERT_TZ(:date, @@global.time_zone, '${timezone}:00')))
        AND client.is_active = true
        ${ clientIds.length > 0 ? ' AND client.id IN (:clientIds)' : '' }
        GROUP BY client.id;
      `;

      var queryEvents = `
        SELECT event.id, event.name, GROUP_CONCAT(DISTINCT insight.type SEPARATOR ', ') as insights, count(DISTINCT insight.id) as insight_count
        FROM event
        INNER JOIN insight_event ON event.id = insight_event.event_id
        INNER JOIN insight ON insight_event.insight_id = insight.id
        WHERE (DATE(CONVERT_TZ(insight.created_date, @@global.time_zone, '${timezone}:00')) = DATE(CONVERT_TZ(:date, @@global.time_zone, '${timezone}:00')))
        ${ clientIds.length > 0 ? ' AND event.id IN (:eventIds)' : '' }
        GROUP BY event.id;
      `;

      var queryReports = `
        SELECT ranking_report.id, ranking_report.name, GROUP_CONCAT(DISTINCT insight.type SEPARATOR ', ') as insights, count(DISTINCT insight.id) as insight_count
        FROM ranking_report
        INNER JOIN insight_report ON ranking_report.id = insight_report.report_id
        INNER JOIN insight ON insight_report.insight_id = insight.id
        WHERE (DATE(CONVERT_TZ(insight.created_date, @@global.time_zone, '${timezone}:00')) = DATE(CONVERT_TZ(:date, @@global.time_zone, '${timezone}:00')))
        ${ clientIds.length > 0 ? ' AND ranking_report.id IN (:reportIds)' : '' }
        GROUP BY ranking_report.id;
      `;
  
      var queryActivities = `
        SELECT activity.id, activity.due_date,
        task_type.desc as type_name, task_type.kind as type_kind,
        GROUP_CONCAT(DISTINCT analyst.name SEPARATOR ', ') as analysts,
        GROUP_CONCAT(DISTINCT insight.type SEPARATOR ', ') as insights, 
          count(DISTINCT insight.id) as insight_count
        FROM activity
        INNER JOIN insight_activity ON activity.id = insight_activity.activity_id
        INNER JOIN insight ON insight_activity.insight_id = insight.id
        INNER JOIN activity_analyst ON activity.id = activity_analyst.activity_id
        INNER JOIN analyst ON activity_analyst.analyst_id = analyst.id
        LEFT JOIN task_type ON activity.type_id = task_type.id
        LEFT JOIN insight_client ON insight.id = insight_client.insight_id
        LEFT JOIN client ON insight_client.client_id = client.id
  
        WHERE (DATE(CONVERT_TZ(insight.created_date, @@global.time_zone, '${timezone}:00')) = DATE(CONVERT_TZ(:date, @@global.time_zone, '${timezone}:00')))
        ${ clientIds.length > 0 ? ' AND activity.id IN (:activityIds)' : '' }
        GROUP BY activity.id;
      `;

      var queryMarkets =  `
        SELECT market.id, market.name as name, GROUP_CONCAT(DISTINCT insight.type SEPARATOR ', ') as insights, count(DISTINCT insight.id) as insight_count
        FROM 
          market
        LEFT JOIN
          market_category ON market.id = market_category.market_id
        LEFT JOIN
          research ON market_category.category_id = research.id
        LEFT JOIN
          insight_category ON research.id = insight_category.category_id
        LEFT JOIN
          insight ON insight_category.insight_id = insight.id
        WHERE (DATE(CONVERT_TZ(insight.created_date, @@global.time_zone, '${timezone}:00')) = DATE(CONVERT_TZ(:date, @@global.time_zone, '${timezone}:00')))
        ${ clientIds.length > 0 ? ' AND research.id IN (:categoryIds)' : '' }
        GROUP BY market.id;
      `;
      
      listFunc = [];
      listFunc.push(sequelize.query(queryAnalysts, { replacements: { date: date.toISOString(), analystIds: analystIds.length > 0 ? analystIds : [''] }, type: sequelize.QueryTypes.SELECT }));
      listFunc.push(sequelize.query(queryClients, { replacements: { date: date.toISOString(), clientIds: clientIds }, type: sequelize.QueryTypes.SELECT }));
      listFunc.push(sequelize.query(queryEvents, { replacements: { date: date.toISOString(), eventIds: eventIds.length > 0 ? eventIds : [''] }, type: sequelize.QueryTypes.SELECT }));
      listFunc.push(sequelize.query(queryReports, { replacements: { date: date.toISOString(), reportIds: reportIds.length > 0 ? reportIds : [''] }, type: sequelize.QueryTypes.SELECT }));
      listFunc.push(sequelize.query(queryActivities, { replacements: { date: date.toISOString(), activityIds: activityIds.length > 0 ? activityIds : [''] }, type: sequelize.QueryTypes.SELECT }));
      listFunc.push(sequelize.query(queryMarkets, { replacements: { date: date.toISOString(), categoryIds: categoryIds.length > 0 ? categoryIds : [''] }, type: sequelize.QueryTypes.SELECT }));
      return Promise.all(listFunc);
    })
      .spread((analysts, clients, events, reports, activities, markets) => {
        var returnObj = {
          date,
          analysts,
          clients,
          events,
          reports,
          activities,
          markets
        }
        resolve(returnObj);
      })
      .catch(err => {
        console.log(err);
        reject(err);
      });
  })
}

function getListActivityByListClient(clientIds) {
  return new Promise((resolve, reject) => {
    let query = `SELECT
        activity.id
    FROM
        activity
            LEFT JOIN
        client ON activity.client_id = client.id
    WHERE
        activity.client_id in (:clientIds)
    GROUP BY activity.id`;

    return sequelize.query(query, { replacements: { clientIds: clientIds}, type: sequelize.QueryTypes.SELECT })
      .then(data => {
        resolve(data);
      })
      .catch(err => {
        reject(err);
      });
  });
}

function getListReportByListClient(clientIds) {
  return new Promise((resolve, reject) => {
    let query = `
    SELECT a.id, d.client_id
    FROM ranking_report as a
    LEFT JOIN client_ranking_report as d on a.id = d.ranking_report_id and d.is_active = true
    WHERE a.is_active = true and d.client_id in (:clientIds) and (a.major_report = true or a.major_report is null)
    GROUP BY a.id;`;

    return sequelize.query(query, { replacements: { clientIds: clientIds}, type: sequelize.QueryTypes.SELECT })
      .then(data => {
        resolve(data);
      })
      .catch(err => {
        reject(err);
      });
  });
}

function getListEventByListClient(clientIds) {
  return new Promise((resolve, reject) => {
    let query = `
    SELECT e.id
    FROM event as e
    LEFT JOIN event_client as ec on e.id = ec.event_id
    WHERE ec.client_id in (:clientIds)
    GROUP BY e.id;`;

    return sequelize.query(query, { replacements: { clientIds: clientIds}, type: sequelize.QueryTypes.SELECT })
      .then(data => {
        resolve(data);
      })
      .catch(err => {
        reject(err);
      });
  });
}

function getListAnalystByListClient(clientIds) {
  return new Promise((resolve, reject) => {
    let query = `
    SELECT a.id
    FROM analyst as a
      LEFT JOIN (sub_segment_analyst as ssa LEFT JOIN sub_segment as ss ON ssa.sub_segment_id = ss.id)  ON a.id = ssa.analyst_id
    WHERE
      ssa.client_id in (:clientIds) AND (ss.name = '${config.globalSegment.CORE}' OR ss.name = '${config.globalSegment.OPPORTUNISTIC}')
    GROUP BY a.id;
    `;

    return sequelize.query(query, { replacements: { clientIds: clientIds}, type: sequelize.QueryTypes.SELECT })
      .then(data => {
        resolve(data);
      })
      .catch(err => {
        reject(err);
      });
  });
}

function getListCategoryByListClient(clientIds) {
  return new Promise((resolve, reject) => {
    var query = `
    SELECT DISTINCT (b.id)
    FROM
      client_research_category AS a
      INNER JOIN
      research AS b ON b.id = a.research_id
          AND b.is_active = TRUE
    WHERE
      a.client_id IN (:clientIds)
      AND a.is_active = TRUE
    GROUP BY a.research_id`;

    return sequelize.query(query, { replacements: { clientIds: clientIds}, type: sequelize.QueryTypes.SELECT })
      .then(data => {
        resolve(data);
      })
      .catch(err => {
        reject(err);
      });
  });
}
