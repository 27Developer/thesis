'use strict';
import _ from 'lodash';
import asana from 'asana';
import json2Csv from 'json2csv';
import config from '../../config/environment';
import uuid from 'uuid';
import * as responseHelper from '../../components/helper/response-helper';
import * as changeLogHelper from '../../components/helper/change-log-helper';
import awsCognitoService from '../../components/aws-cognito/aws-cognito-register';
import { AnalystForCalendarDto } from '../../../server/api/dtos/analystForCalendarDto';
import {
  Analyst,
  Activity,
  TaskType,
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
  UserToken,
  Segment,
  SubSegment,
  SubSegmentAnalyst,
  sequelize,
  Insight,
  InsightAnalyst,
  CollectionClient,
  InsightClient,
} from '../../sqldb';
import { ListAnalystDto, ListClientAssocialAnalystDto } from '../dtos/analystDto';
import { ListAnalystInfoDto } from '../dtos/analystInfoDto';
import { ListAnalystAlignmentDto } from '../dtos/analystAlignmentDto';
import { TaskDto } from '../dtos/taskDto';
import { ListClientAnalystCalendarDto } from '../dtos/clientAnalystCalendarDto';
var jwt_decode = require('jwt-decode');
var Promise = require('bluebird');
var diff = require('deep-diff');

import log4Js from 'log4js';
log4Js.configure({
  appenders: [
    { type: 'file', filename: 'logs/analyst-controller.log', category: 'analyst-controller' }
  ]
});
var logger = log4Js.getLogger('analyst-controller');

var qTaskFuture = 'SELECT t.*, tt.desc FROM task t INNER JOIN task_interaction ti ON t.id = ti.task_id AND t.client_id = ? AND t.analyst_id = ? AND date > NOW() INNER JOIN interaction_type it ON ti.interaction_id = it.id AND ti.is_active = 1 INNER JOIN task_type tt ON it.task_type_id = tt.id ORDER BY t.date ASC;';

var qTaskRecent = 'SELECT t.*, tt.desc FROM task t INNER JOIN task_interaction ti ON t.id = ti.task_id AND t.client_id = ? AND t.analyst_id = ? AND date <= NOW() INNER JOIN interaction_type it ON ti.interaction_id = it.id AND ti.is_active = 1 INNER JOIN task_type tt ON it.task_type_id = tt.id ORDER BY t.date DESC;';
var projects = [];

export function GetAllAnalysts() {
  return new Promise((resolve, reject) => {
    AnalystHistory.findAll({
      include: [
        {
          model: Analyst,
          include: [
            { model: Research, through: { where: { is_active: true } } }
          ],
          where: { is_active: true }
        },
        ResearchType,
        Firm,
        VendorLeaning
      ],
      where: {
        is_active_record: true
      }
    }).then((data) => {
      return ListAnalystDto(data);
    })
      .then(res => {
        resolve(res);
      })
      .catch((err) => {
        reject(err);
      });
  });
}

export function GetDataToFilters() {
  return new Promise((resolve, reject) => {
    var dataCount = 0;
    var responseData = {
      firm: [],
      researchCategory: [],
      adOwner: []
    };
    return Promise.all([
        Firm.findAll({ attributes: [['id', 'value'], 'name'], where: { is_active: true }, order: [['name', 'ASC']] }),
        Research.findAll({
          attributes: [['id', 'value'], ['desc', 'desc']],
          where: { is_active: true },
          order: [['desc', 'ASC']]
        }),
        User.findAll({
          attributes: ['email', 'full_name'],
          where: { is_active: true },
          order: [['email', 'ASC']]
        }),
      ]
    ).spread(async(firm, research, users) => {
      responseData.firm = firm;
      responseData.researchCategory = research;
      responseData.adOwner = users;
      resolve(responseData);
    })
      .catch(function(err) {
        logger.error(err);
        console.log(err);
        reject(err);
      });
  });
}

export function GetAnalystList(bearerToken) {
  // let bearerToken;
  // let bearerHeader = req.headers['authorization'];
  // let bearer = bearerHeader.split(' ');
  // bearerToken = bearer[1];
  return new Promise(async(resolve, reject) => {
    let listClientId = [];
    let role;
    let queryInClientId = '';
    await UserToken.findAll({ where: { access_token: bearerToken } })
      .then(resObj => {
        let data = resObj[0].dataValues;
        let decoded = jwt_decode(data.token_id);
        role = decoded['custom:role'];
        let clientIdStr = decoded['custom:client_id'] ? decoded['custom:client_id'] : '';
        if (role !== config.role.spotlightAdmin) {
          listClientId = clientIdStr.split(', ');
        }
      })
      .catch(err => {
        console.log(err);
        reject({ code: 403, message: 'Forbidden' });
      });
    if (role === config.role.spotlightAdmin) {
      queryInClientId = '';
    } else {
      let clientIds = '';
      for (let i = 0; i < listClientId.length; i++) {
        clientIds = `${clientIds}"${listClientId[i]}${i === listClientId.length - 1 ? '"' : '",'}`;
      }
      queryInClientId = ` AND \`caah\`.\`client_id\` IN (${clientIds})`;
    }

    var queryString = `SELECT 
      AnalystHistory.id AS analyst_history_id,
      AnalystHistory.title AS title,
      AnalystHistory.team AS team,
      AnalystHistory.insert_date AS insert_date,
      AnalystHistory.city AS city,
      AnalystHistory.country AS country,
      AnalystHistory.state AS state,
      AnalystHistory.region AS region,
      AnalystHistory.ad_owner AS ad_owner,
      CONVERT( AnalystHistory.is_access , UNSIGNED INTEGER) AS analyst_is_access,
      Analyst.id AS analyst_id,
      Analyst.name AS analyst_name,
      CONVERT( Analyst.is_active , UNSIGNED INTEGER) AS analyst_is_active,
      Firm.name AS firm_name,
      Firm.id AS firm_id,
      ResearchType.desc AS research_type,
      CONVERT( AnalystHistory.is_ranking_report_author , UNSIGNED INTEGER) AS is_ranking_report_author,
      VendorLeaning.desc AS vendor_leaning,
      Categories.categoryString AS categories,
      Categories.category_ids AS category_ids,
      Categories.category_names AS category_names,
      ClientAnalystAlignmentHistory.alignment_count AS client_alignment_count,
      ClientAnalystAlignmentHistory.analystName AS analystName,
      ClientAnalystAlignmentHistory.client_id,
      sentiment.sentiment_avg as sentiment,
      ad_activities.due_date as last_ad_inquiry,
      upcoming_activities.count as count_upcoming_activities,
      cl.last_updated as last_updated_change_log,
      al.last_updated as last_updated_activity_log
  FROM
      analyst_history AS AnalystHistory
          LEFT OUTER JOIN
      (SELECT 
          a.analyst_id,
              COUNT(distinct a.client_id, a.analyst_id) AS alignment_count,
              GROUP_CONCAT(distinct b.name
                  ORDER BY b.name ASC
                  SEPARATOR ', ') AS analystName,a.client_id
      FROM
          sub_segment_analyst AS a
      INNER JOIN client AS b ON a.client_id = b.id
          AND b.is_active = TRUE
      WHERE
          a.client_id IS NOT NULL
      GROUP BY a.analyst_id) AS ClientAnalystAlignmentHistory ON AnalystHistory.analyst_id = ClientAnalystAlignmentHistory.analyst_id
          LEFT OUTER JOIN
      analyst AS Analyst ON AnalystHistory.analyst_id = Analyst.id
          LEFT OUTER JOIN
      (SELECT 
          analyst_id,
          GROUP_CONCAT(r.desc ORDER BY r.desc DESC SEPARATOR ', ') AS categoryString,
          GROUP_CONCAT(r.desc ORDER BY r.desc ASC SEPARATOR '!!!') AS category_names,
          GROUP_CONCAT(r.id ORDER BY r.desc ASC SEPARATOR '!!!') AS category_ids
      FROM
          analyst_research_categories arc
      JOIN research r ON arc.research_id = r.id
      WHERE
          arc.is_active = TRUE
              AND r.is_active = TRUE
      GROUP BY analyst_id) AS Categories ON Categories.analyst_id = AnalystHistory.analyst_id
          LEFT OUTER JOIN
      research_type AS ResearchType ON AnalystHistory.research_type_id = ResearchType.id
          LEFT OUTER JOIN
      firm AS Firm ON AnalystHistory.firm_id = Firm.id
          AND Firm.is_active = TRUE
          LEFT OUTER JOIN
      vendor_leaning AS VendorLeaning ON AnalystHistory.vendor_leaning_id = VendorLeaning.id
          LEFT JOIN
      client_analyst_alignment_history AS caah ON caah.analyst_id = Analyst.id
          AND caah.is_active = TRUE
          LEFT JOIN
      client AS Client ON Client.id = caah.client_id
          AND Client.is_active = TRUE
      left join
          (SELECT 
            final.analyst_id, AVG(final.sentiment) as sentiment_avg
        FROM
            (SELECT 
            result.*,
                @rank:=CASE
                    WHEN @analyst_id <> analyst_id THEN 0
                    ELSE @rank + 1
                END AS rn,
                @analyst_id:=analyst_id AS clset
        FROM
            (SELECT @rank:=0) s, (SELECT @analyst_id:=0) c, (SELECT 
            insight.*, insight_analyst.analyst_id
        FROM
            insight
        INNER JOIN insight_analyst ON insight_analyst.insight_id = insight.id
        ORDER BY insight_analyst.analyst_id , created_date DESC) result) final
        WHERE
            final.rn < 10
        GROUP BY final.analyst_id) AS sentiment ON sentiment.analyst_id = Analyst.id

      LEFT JOIN (
        SELECT atv.id, atv.name, max(atv.due_date) as due_date, analyst.name as analyst_name, analyst.id as analyst_id, tt.desc
        FROM activity as atv
        LEFT JOIN task_type as tt ON atv.type_id = tt.id
        LEFT JOIN activity_analyst as aa ON atv.id = aa.activity_id
        LEFT JOIN analyst ON aa.analyst_id = analyst.id 

        WHERE (tt.desc = 'AD Inquiry' OR tt.desc = 'AD') AND atv.due_date < NOW()
        GROUP BY analyst.id
        ORDER BY atv.due_date DESC
      ) AS ad_activities ON Analyst.id = ad_activities.analyst_id

      LEFT JOIN (
        SELECT COUNT(atv.id) as count, analyst.name as analyst_name, analyst.id as analyst_id
        FROM activity as atv
        LEFT JOIN activity_analyst as aa ON atv.id = aa.activity_id
        LEFT JOIN analyst ON aa.analyst_id = analyst.id

        WHERE (atv.due_date > NOW()) AND (atv.due_date < NOW() + INTERVAL 45 DAY)
        GROUP BY analyst.id
      ) AS upcoming_activities ON Analyst.id = upcoming_activities.analyst_id
      
      LEFT JOIN (
        SELECT object_id, max(date) as last_updated
        FROM change_log
        WHERE page = 'analyst_profile'
        GROUP BY object_id
      ) AS cl ON Analyst.id = cl.object_id

      LEFT JOIN (
        SELECT object_id, max(update_date) as last_updated
        FROM activity_log
        WHERE page = 'analyst_profile'
        GROUP BY object_id
      ) AS al ON Analyst.id = al.object_id

  WHERE
      AnalystHistory.is_active_record = TRUE
          -- AND Analyst.is_active = TRUE 
          ${queryInClientId}
  GROUP BY Analyst.id
  ORDER BY AnalystHistory.id DESC;`;


    return await sequelize.query(queryString, { type: sequelize.QueryTypes.SELECT })
      .then(data => {

        return ListAnalystInfoDto(data);
      })
      .then(res => resolve(res))
      .catch(err => reject(res));
  });
}



export function GetAnalystById(analystId) {
  return new Promise((resolve, reject) => {
    return AnalystHistory.findAll({
      include: [
        {
          model: Analyst,
          include: [
            {
              model: Research,
              through: {
                attributes: ['insert_date'],
                where: { is_active: true }
              }
            }
          ]
        },
        ResearchType,
        Firm,
        VendorLeaning
      ],
      where: {
        id: analystId,
        is_active_record: true
      }
    }).then(function(data) {
      return ListAnalystDto(data);
    })
      .then(res => resolve(res))
      .catch(err => reject(err));
  });
}

export function CheckAnalyst(analystId, analystName) {
  return new Promise((resolve, reject) => {
    return Analyst.find({
      where: {
        id: analystId ? { $ne: analystId } : { $ne: '' },
        name: analystName
      }
    }).then(res => resolve(res))
      .catch(err => reject(err));
  });
}

export async function AddAnalyst(analystData) {
  return new Promise((resolve, reject) => {
    var data = analystData;
    var analystHistorydata = data.AnalystHistory || {};
    var analyst = {};
    analystHistorydata.firm_id = (data.Firm === undefined || data.Firm === null) ? null : data.Firm.value;
    analystHistorydata.is_access = (data.AnalystHistory.is_access === undefined || data.AnalystHistory.is_access === null) ? null : data.AnalystHistory.is_access;
    analystHistorydata.research_type_id = (data.ResearchType === undefined || data.ResearchType === null) ? null : data.ResearchType.id;
    analystHistorydata.ad_owner = (data.AnalystHistory.ad_owner === undefined || data.AnalystHistory.ad_owner === null) ? null : data.AnalystHistory.ad_owner.email;
    analystHistorydata.vendor_leaning_id = (data.VendorLeaning === undefined || data.VendorLeaning === null) ? null : data.VendorLeaning.id;
    analystHistorydata.is_active_record = true;

    return sequelize.transaction(async (t) => {
      analyst = await Analyst.create(data.Analyst, { transaction: t });
      analystHistorydata.analyst_id = analyst.id;
      if (data.Analyst && data.Analyst.Research) {
        data.Analyst.Research.map(async (item, index) => {
          await AnalystResearchCategories.create({
            analyst_id: analyst.id,
            research_id: item.value,
            is_active: item.is_active == undefined ? true : item.is_active,
            insert_date: +new Date() + (index * 10000)
          }, { transaction: t });
        });
      }
      await AnalystHistory.create(analystHistorydata, { transaction: t });
    }).then(() => {
      let logObj = {
        section: config.section.ANALYST_DETAILS,
        summary: `Analyst ${data.Analyst.name} was added`,
        user: data.user,
        page: config.pageTemplate.ANALYST_PROFILE,
        object_id: analyst.id,
      };
      changeLogHelper.createChangeLog(logObj);
      resolve(analyst);
    })
      .catch(err => reject(err));
  });
}

export function UpdateAnalyst(analystData, oldAnalystData) {
  return new Promise((resolve, reject) => {
    var data = analystData;
    var analystHistorydata = data.AnalystHistory == null ? {} : _.clone(data.AnalystHistory);
    var tasks = [];
    var categoriesIds = [];
    delete analystHistorydata.id;
    analystHistorydata.firm_id = (data.Firm === undefined || data.Firm === null) ? null : data.Firm.value;
    analystHistorydata.is_access = (data.AnalystHistory.is_access === undefined || data.AnalystHistory.is_access === null) ? null : data.AnalystHistory.is_access;
    analystHistorydata.research_type_id = (data.ResearchType === undefined || data.ResearchType === null) ? null : data.ResearchType.id;
    analystHistorydata.ad_owner = (data.AnalystHistory.ad_owner === undefined || data.AnalystHistory.ad_owner === null) ? null : data.AnalystHistory.ad_owner.email;
    analystHistorydata.vendor_leaning_id = (data.VendorLeaning === undefined || data.VendorLeaning === null) ? null : data.VendorLeaning.id;
    analystHistorydata.analyst_id = data.Analyst.id;
    return sequelize.transaction(async function(t) {
      tasks.push(Analyst.upsert(data.Analyst, { transaction: t }));
      tasks.push(AnalystHistory.update({ is_active_record: false }, {
        where: { analyst_id: data.Analyst.id },
        transaction: t
      }));
      tasks.push(AnalystHistory.create(analystHistorydata, { transaction: t }));
      if (data.Analyst && data.Analyst.Research) {
        await AnalystResearchCategories.destroy({ where: { analyst_id: data.Analyst.id } });
        data.Analyst.Research.forEach(item => {
          if (item.id)
            categoriesIds.push(item.id);
          else if (item.id && (item.is_active || item.is_active == undefined))
            categoriesIds.push(item.id)
        })

        categoriesIds.forEach((categoryId, index) => {
          let category = {
            analyst_id: data.Analyst.id,
            research_id: categoryId,
            is_active: true,
            insert_date: +new Date() + (index * 10000)
          }
          tasks.push(AnalystResearchCategories.create(category, { transaction: t }));
        })
      }
      return Promise.all(tasks);
    }).then(() => {
      analystData.AnalystHistory.ad_owner = (data.AnalystHistory.ad_owner === undefined || data.AnalystHistory.ad_owner === null) ? null : data.AnalystHistory.ad_owner.email
      addLog(analystData, oldAnalystData);
      resolve();
    })
      .catch(err => {
        console.log(err);
        reject(err)
      });
  });
}

let addLog = function(analystData, oldAnalystData) {
  let listModelChange = getChangeLog(analystData, oldAnalystData);
  changeLogHelper.createActivityLog(listModelChange);
};

var compare = function(a, b) {
  if (a.name > b.name) {
    return -1;
  }
  if (a.name < b.name) {
    return 1;
  }
  return 0;
};


let handleRefCategories = function(analystData, oldAnalystData) {
  let newCategories = [];
  let newCategoryIds = [];
  let oldCategories = [];
  let oldCategoryIds = [];
  let listModelChange = [];

  if (analystData.Analyst.Research.length > 0) {
    newCategories = analystData.Analyst.Research.filter(function(item) {
      return item.id && (item.is_active || typeof (item.is_active) == "undefined")
    });
    newCategoryIds = newCategories.map(item => item.id);
  }
  if (oldAnalystData.Analyst.Research.length > 0) {
    oldCategories = oldAnalystData.Analyst.Research;
    oldCategoryIds = oldAnalystData.Analyst.Research.map(item => item.id);
  }

  let removedCategoryIds = _.difference(oldCategoryIds, newCategoryIds);
  let addedCategoryIds = _.difference(newCategoryIds, oldCategoryIds);

  let addedCategories = newCategories.filter(function(item) {
    return addedCategoryIds.indexOf(item.id) > -1;
  });

  let removedCategories = oldCategories.filter(function(item) {
    return removedCategoryIds.indexOf(item.id) > -1;
  });

  addedCategories.forEach((item) => {
    let modelTemp = {};
    modelTemp.user = analystData.user;
    modelTemp.page = config.pageTemplate.ANALYST_PROFILE;
    modelTemp.section = config.section.CATEGORIES;
    modelTemp.parent_object_model = item.desc;
    modelTemp.parent_object_id = item.id;
    modelTemp.object_id = analystData.Analyst.id;
    modelTemp.object_model = analystData.Analyst.name;
    modelTemp.data_model = `Added Category ${item.desc}`;
    modelTemp.new_value = item.desc;
    modelTemp.log_type = config.logType.REF_ADD;
    listModelChange.push(modelTemp);
  });

  removedCategories.forEach((item) => {
    let modelTemp = {};
    modelTemp.user = analystData.user;
    modelTemp.page = config.pageTemplate.ANALYST_PROFILE;
    modelTemp.section = config.section.CATEGORIES;
    modelTemp.parent_object_model = item.desc;
    modelTemp.parent_object_id = item.id;
    modelTemp.object_id = analystData.Analyst.id;
    modelTemp.object_model = analystData.Analyst.name;
    modelTemp.data_model = `Removed Category ${item.desc}`;
    modelTemp.new_value = item.desc;
    modelTemp.log_type = config.logType.REF_DELETE;
    listModelChange.push(modelTemp);
  });

  return listModelChange;
};

let refColumns = [['Firm', 'name'], ['Analyst', 'is_active'], ['Analyst', 'name'], ['AnalystHistory', 'ad_owner'], ['AnalystHistory', 'team'], ['AnalystHistory', 'title']];
let refColumnNames = ['Firm', 'Status', 'Name', 'AD Owner', 'Team', 'Title'];
let matchRefColumn = function(path) {
  for (let i = 0; i < refColumns.length; i++) {
    let pathRef = refColumns[i];
    if (_.difference(path, pathRef).length == 0) {
      return i;
    }
  }
  return -1;
};

let getChangeLog = function(analystData, oldAnalystData) {
  let listModelChange = []
  listModelChange = handleRefCategories(analystData, oldAnalystData);
  delete analystData.Analyst.Research;
  delete oldAnalystData.Analyst.Research;
  var differences = diff(oldAnalystData, analystData);
  if (differences) {
    differences.forEach((item) => {
      let modelTemp = {};
      if (item.kind == 'E' && item.rhs) {
        let number = matchRefColumn(item.path)
        if (number > -1) {
          modelTemp.user = analystData.user;
          modelTemp.page = config.pageTemplate.ANALYST_PROFILE;
          modelTemp.section = config.section.ANALYST_DETAILS;
          modelTemp.old_value = item.lhs;
          modelTemp.new_value = item.rhs;
          modelTemp.object_id = analystData.Analyst.id;
          modelTemp.object_model = analystData.Analyst.name;
          modelTemp.data_model = `Updated ${refColumnNames[number]} to ${item.rhs}`;
          modelTemp.log_type = config.logType.UPDATE;
          listModelChange.push(modelTemp);
        }
      }
    });
  }
  return listModelChange;
}

export async function checkAnalystForMasterById(analystId, clientId) {
  return new Promise((resolve, reject) => {
    var clientMaturity = {};
    clientMaturity.id = uuid() || '';
    clientMaturity.client_id = clientId;
    clientMaturity.analyst_id = analystId;
    clientMaturity.is_active = true;
    clientMaturity.insert_date = new Date();

    return sequelize.transaction(async function(t) {
      await ClientAnalystAlignmentHistory.findAll({
        where: {
          client_id: clientId,
          analyst_id: analystId
        }
      }).then((data) => {
        if (data.length > 0) {
          ClientAnalystAlignmentHistory.update({
            is_active: true,
          }, {
            where: {
              id: data[data.length - 1].dataValues.id,
            }
          }, { transaction: t });
        } else {
          ClientAnalystAlignmentHistory.create(clientMaturity, { transaction: t });
        }
      });
    }).then(() => {
      resolve();
    })
      .catch((err) => {
        console.log(err);
        reject(err);
      });
  });
}

export function getAnalystForMasterById(analystId, clientId, currentUserData) {
  return new Promise((resolve, reject) => {

    var dataCount = 0;
    var responseData = {
      analystAlignment: {},
      taskRecent: [],
      taskFuture: [],
      analystHistory: [],
      clientName: []
    };

    var listFunctions = [];
    listFunctions.push(Client.findAll({
      include: [],
      where: {
        id: clientId,
        is_active: true
      }
    }));
    listFunctions.push(AnalystHistory.findAll({
      include: [
        {
          model: Analyst,
          include: [{
            model: Research,
            order: ['insert_date', 'ASC'],
            through: { where: { is_active: true } }
          }]
        },
        ResearchType,
        Firm,
      ],
      where: {
        analyst_id: analystId,
        is_active_record: true
      }
    }));
    listFunctions.push(sequelize.query(qTaskRecent, {
      replacements: [clientId, analystId],
      type: sequelize.QueryTypes.SELECT
    }));
    listFunctions.push(sequelize.query(qTaskFuture, {
      replacements: [clientId, analystId],
      type: sequelize.QueryTypes.SELECT
    }));

    var queryStringAnalystAlignment = 'SELECT '
      + 'a.id, '
      + 'b.desc, '
      + 'b.code, '
      + 'c.id AS maturityByAnalystId, '
      + 'c.desc AS maturityByAnalystDesc, '
      + 'a.client_id AS clientId, '
      + 'a.influence AS influence, '
      + 'c.detail AS maturityDetail, '
      + 'GROUP_CONCAT(DISTINCT f.desc '
      + 'ORDER BY f.desc DESC '
      + 'SEPARATOR \', \') AS researchCategory, '
      + 'GROUP_CONCAT(DISTINCT h.name '
      + 'ORDER BY h.name DESC '
      + 'SEPARATOR \', \') AS rankingReportName '
      + 'FROM '
      + 'client_analyst_alignment_history AS a '
      + 'LEFT JOIN '
      + 'importance_by_analyst_cd AS b ON a.importance_cd = b.code '
      + 'AND b.is_active = TRUE '
      + 'LEFT JOIN '
      + 'maturity_by_analyst AS c ON a.maturity_id = c.id '
      + 'AND c.is_active = TRUE '
      + 'LEFT JOIN '
      + 'analyst AS d ON d.id = a.analyst_id '
      + 'AND d.is_active = TRUE '
      + 'LEFT JOIN '
      + 'analyst_research_categories AS e ON a.analyst_id = e.analyst_id '
      + 'AND e.is_active = TRUE '
      + 'LEFT JOIN '
      + 'research AS f ON f.id = e.research_id '
      + 'AND f.is_active = TRUE '
      + 'LEFT JOIN '
      + 'ranking_report_analyst AS g ON g.analyst_id = a.analyst_id '
      + 'LEFT JOIN '
      + 'ranking_report AS h ON h.id = g.ranking_report_id '
      + 'WHERE '
      + 'a.analyst_id = ? '
      + 'AND a.client_id = ?; ';
    listFunctions.push(sequelize.query(queryStringAnalystAlignment, {
      replacements: [analystId, clientId],
      type: sequelize.QueryTypes.SELECT
    }));


    let query = `
    SELECT a.id
    FROM analyst as a
      LEFT JOIN activity_analyst AS aa ON a.id = aa.analyst_id
      LEFT JOIN activity ON aa.activity_id = activity.id
    WHERE
      activity.client_id = :clientIds
    GROUP BY a.id
    UNION
    SELECT a.id
    FROM analyst as a
      LEFT JOIN sub_segment_analyst AS ssa ON a.id = ssa.analyst_id
    WHERE
      ssa.client_id = :clientIds
    GROUP BY a.id;
    `;
    if (currentUserData.role !== config.role.spotlightAdmin) {
      if (currentUserData.clientIds.indexOf(clientId) > -1) {

        return sequelize.query(query, { replacements: { clientIds: clientId }, type: sequelize.QueryTypes.SELECT })
          .then(data => {
            let listAnalystIds = data.map(analyst => {
              return analyst.id
            });
            if (listAnalystIds.indexOf(analystId) == -1) {
              throw { code: 403, message: "Forbidden" };
            } else {
              return Promise.all(listFunctions).spread((clientName, analystHistory, taskRecent, taskFuture, analystAlignment) => {
                responseData.clientName = clientName;
                responseData.analystHistory = ListAnalystDto(analystHistory);
                responseData.taskRecent = TaskDto(taskRecent);
                responseData.taskFuture = TaskDto(taskFuture);
                responseData.analystAlignment = ListAnalystAlignmentDto(analystAlignment);
                resolve(responseData);
              })
            }
          })
          .catch(err => {
            console.log(err)
            reject(err);
          });
      } else {
        reject({ code: 403, message: "Forbidden" })
      }
    } else {
      return Promise.all(listFunctions).spread((clientName, analystHistory, taskRecent, taskFuture, analystAlignment) => {
        responseData.clientName = clientName;
        responseData.analystHistory = ListAnalystDto(analystHistory);
        responseData.taskRecent = TaskDto(taskRecent);
        responseData.taskFuture = TaskDto(taskFuture);
        responseData.analystAlignment = ListAnalystAlignmentDto(analystAlignment);
        resolve(responseData);
      }).catch(err => {
        console.log(err);
        reject(err)
      });
    }
  });
}

export function goToPageEngagement(analystId, clientId, order, orderType, engagement) {
  return new Promise((resolve, reject) => {
    var result = [];
    // const analystId = req.query.analystId;
    // const clientId = req.query.clientId;
    // const order = req.query.order !== null ? req.query.order : 'date';
    // const orderType = req.query.orderType !== null ? req.query.orderType : 'DESC';
    var searchEnTotal = '';
    var searchEn = '';
    if (engagement === 'recent') {
      searchEn = `SELECT t.*, tt.desc FROM task t INNER JOIN task_interaction ti ON t.id = ti.task_id AND t.client_id = ? AND t.analyst_id = ? AND date <= NOW() INNER JOIN interaction_type it ON ti.interaction_id = it.id AND ti.is_active = 1 INNER JOIN task_type tt ON it.task_type_id = tt.id ORDER BY ${order} ${orderType}`;
    } else {
      searchEn = `SELECT t.*, tt.desc FROM task t INNER JOIN task_interaction ti ON t.id = ti.task_id AND t.client_id = ? AND t.analyst_id = ? AND date > NOW() INNER JOIN interaction_type it ON ti.interaction_id = it.id AND ti.is_active = 1 INNER JOIN task_type tt ON it.task_type_id = tt.id ORDER BY  ${order} ${orderType}`;
    }
    sequelize.query(searchEn, { replacements: [clientId, analystId], type: sequelize.QueryTypes.SELECT })
      .then(data => {
        result = TaskDto(data);
        resolve(result);
      })
      .catch((err) => {
        reject(err);
      });
  });
}

export function getAnalystImage(analystId, mediaType) {
  return new Promise((resolve, reject) => {
    return AnalystMedia.findOne({
      include: [
        {
          model: Media,
          as: 'Media'
        }
      ],
      where: {
        analyst_id: analystId,
        is_active: true,
        media_type: mediaType
      }
    }).then(image => {
      if (image !== null) {
        resolve(image);
      } else {
        resolve('');
      }
    })
      .catch(err => reject(err));
  });
}

export function updateTask(taskDate, taskId, asanaId) {
  return new Promise((resolve, reject) => {
    // const taskDate = req.body.date;
    // const taskId = req.body.taskId;
    // const asanaId = req.body.asanaId;
    var sqlString = 'update task set date = ? where id = ?';
    return sequelize.query(sqlString, { replacements: [taskDate, taskId], type: sequelize.QueryTypes.UPDATE })
      .then(data => {
        updateDateTask(asanaId, taskDate);
      })
      .then(() => {
        res.send();
        resolve();
      })
      .catch(err => reject(err));
  });
}

export function createTask(task) {
  return new Promise((resolve, reject) => {
    const asanaClient = asana.Client.create().useAccessToken(config.asanaAccessToken);
    projects = [];
    //const task = req.body.task;
    return getProjects(null, asanaClient, task).then((resTask) => resolve(resTask))
      .catch(err => reject(err));
  });
}

export async function updateInfluencing(data) {
  return new Promise((resolve, reject) => {
    return sequelize.transaction(async function(t) {
      await ClientAnalystAlignmentHistory.update({ influence: data.influencing }, { where: { id: data.id } }, { transaction: t });
    }).then((res) => {
      resolve(res);
    })
      .catch(err => reject(err));
  });
}

export function getAnalystForCalendar(clientId) {
  return new Promise((resolve, reject) => {
    // const clientId = req.query.clientId;
    var responseData = {
      coreAnalyst: [],
      nonCoreAnalyst: []
    };
    var itemsProcessed = 0;
    var itemsProcessedAnalyst = 0;
    var dataCount = 0;
    var queryString = `SELECT a.id, c.id as maturityByAnalystId, c.desc as maturityByAnalystDesc , d.id as analystId, d.name as analystName, f.name as firmName FROM client_analyst_alignment_history as a left join maturity_by_analyst as c on a.maturity_id = c.id and a.client_id ='${clientId}' inner join analyst as d on d.id = a.analyst_id left join analyst_history as e on e.analyst_id = a.analyst_id left join firm as f on f.id = e.firm_id and f.is_active = true where a.is_active = true and c.is_active = true and e.is_active_record = true and d.is_active = true order by d.name asc`;

    var queryTask = 'SELECT t.*, tt.desc FROM task t INNER JOIN task_interaction ti ON t.id = ti.task_id AND t.client_id = ? AND t.analyst_id = ? INNER JOIN interaction_type it ON ti.interaction_id = it.id AND ti.is_active = 1 INNER JOIN task_type tt ON it.task_type_id = tt.id';
    sequelize.query(queryString, { type: sequelize.QueryTypes.SELECT })
      .then(response => {
        if (response.length !== 0) {
          response.forEach(async function(item, index, array) {
            sequelize.query(queryTask, { replacements: [clientId, item.analystId], type: sequelize.QueryTypes.SELECT })
              .then(data => {
                itemsProcessed++;
                var task = TaskDto(data);
                responseData.coreAnalyst.push(ListClientAnalystCalendarDto(item, task));
                if (itemsProcessed === array.length) {
                  dataCount++;
                  if (dataCount === 2) {
                    // return res.status(200).json(responseData);
                    resolve(responseData);
                  }
                }
              });
          });
        } else {
          dataCount++;
          response.push('temp');
        }

        let conditionStr = '(';
        response.forEach(async function(item, index, array) {
          itemsProcessedAnalyst++;
          conditionStr = `${conditionStr + (conditionStr === '(' ? '\'' : ', \'') + item.analystId}'`;
          if (itemsProcessedAnalyst === array.length) {
            conditionStr = `${conditionStr})`;
            var queryGetNonCoreAnalyst = `SELECT distinct(a.id) as analystId, a.id, a.name as name , f.name as firmName FROM task t INNER JOIN analyst_history as ah on ah.analyst_id = t.analyst_id and ah.is_active_record = true INNER JOIN analyst as a on a.id = ah.analyst_id LEFT JOIN firm as f on f.id = ah.firm_id and f.is_active = true where t.client_id = ? and t.analyst_id is not null and t.analyst_id not in ${conditionStr} and a.is_active = true`;
            var queryTaskNonCoreAnalyst = `SELECT t.*, tt.desc FROM task t INNER JOIN task_interaction ti ON t.id = ti.task_id AND t.client_id = ? AND t.analyst_id is not null and t.analyst_id not in ${conditionStr} INNER JOIN interaction_type it ON ti.interaction_id = it.id AND ti.is_active = 1 INNER JOIN task_type tt ON it.task_type_id = tt.id`;

            sequelize.query(queryGetNonCoreAnalyst, { replacements: [clientId], type: sequelize.QueryTypes.SELECT })
              .then(dataAnalyst => {
                sequelize.query(queryTaskNonCoreAnalyst, {
                  replacements: [clientId],
                  type: sequelize.QueryTypes.SELECT
                })
                  .then(data => {
                    for (let i = 0; i < dataAnalyst.length; i++) {
                      let nonCoreAnalyst = {
                        analyst: dataAnalyst[i],
                        task: []
                      };
                      for (let j = 0; j < data.length; j++) {
                        if (dataAnalyst[i].analystId === data[j].analyst_id) {
                          nonCoreAnalyst.task.push(data[j]);
                        }
                      }
                      nonCoreAnalyst.task.sort(compare);
                      responseData.nonCoreAnalyst.push(nonCoreAnalyst);
                    }

                    dataCount++;
                    if (dataCount === 2) {
                      // return res.status(200).json(responseData);
                      resolve(responseData);
                    }
                  });
              });
          }
        });
      })
      // .then(responseHelper.respondWithResult(res))
      .catch(function(err) {
        //responseHelper.handleError(res);
        reject(err);
      });
  });
}

export function getAnalystActivityByClientId(clientId) {
  return new Promise((resolve, reject) => {
    var query = {};
    var responseData = {
      segment: [],
      activity: []
    };
    query.where = { $or: [{ client_id: clientId }, { client_id: null }] };
    query.attributes = ['id', 'name', 'client_id'],
      query.include = [{
        model: SubSegment,
        attributes: ['id', 'name', 'detail'],
        as: 'SubSegment',
        order: 'name ASC',
        include: [{
          model: SubSegmentAnalyst,
          as: 'SubSegmentAnalyst',
          where: { client_id: clientId },
          required: false,
          include: [{
            model: Analyst,
            attributes: ['id', 'name'],
            as: 'Analyst',
            where: {is_active: true},
            required: false,
            include: [{
              model: Firm,
              required: false,
              attributes: ['id', 'name'],
              as: 'Firm',
              where: { is_active: true }
            }, {
              model: AnalystHistory,
              required: true,
              attributes: ['id', 'analyst_id', 'firm_id', 'is_active_record'],
              as: 'AnalystHistory',
              where: { is_active_record: true }              
            }],
          }]
        }]
      }];
    query.order = [
      ['client_id', 'ASC'],
      [{ model: SubSegment, as: 'SubSegment' }, 'name', 'ASC']
    ];
    return Segment.findAll(query)
      .then(data => {
        let listSegments = AnalystForCalendarDto(data);

        let queryStr = `SELECT
    a.id, a.topic, a.debrief, a.due_date as end_date, a.start_date, a.id as activity_id, b.desc, c.analyst_id, b.kind
FROM
    activity AS a
        LEFT JOIN
    task_type AS b ON a.type_id = b.id
        LEFT JOIN
    activity_analyst AS c ON a.id = c.activity_id
WHERE
    a.client_id = ? OR b.desc = 'AD Inquiry' OR b.desc = 'AD'`;

        sequelize.query(queryStr, {
          replacements: [clientId],
          type: sequelize.QueryTypes.SELECT
        })
          .then(result => {
            responseData.segment = listSegments;
            responseData.activity = result;
            resolve(responseData);
          })
          .catch(err => {
            reject(err);
          })
      })
      .catch(err => {
        reject(err);
      });
  });
}

export function getAnalystForCalendarByCollectionId(collectionId) {
  return new Promise((resolve, reject) => {
    let queryGetClient = `SELECT 
    client.id, client.name
FROM
    collection_client
        INNER JOIN
    client ON client.id = collection_client.client_id
WHERE
    collection_id = ?`;

    return sequelize.query(queryGetClient, {
      replacements: [collectionId],
      type: sequelize.QueryTypes.SELECT
    }).then(clients => {
      let clientIds = _.map(clients, function(item) {
        return item.id
      });
      let lstFunc = [];
      var responseData = {
        activity: [],
        analystSegment: [],
        segment: [],
        clients: []
      };
      let queryGetAnalyst = `SELECT 
    sub_segment_analyst.*,
    analyst.name AS analyst_name,
    sub_segment.name AS sub_segment_name,
    sub_segment.segment_id AS segment_id,
    analyst_history.firm_id,
    analyst_history.name AS firm_name
FROM
    sub_segment_analyst
        INNER JOIN
    analyst ON sub_segment_analyst.analyst_id = analyst.id
        INNER JOIN
    sub_segment ON sub_segment_analyst.sub_segment_id = sub_segment.id
        LEFT JOIN
    (SELECT 
        analyst_history.analyst_id,
            analyst_history.firm_id,
            firm.name
    FROM
        analyst_history
    INNER JOIN firm ON analyst_history.firm_id = firm.id
    WHERE
        is_active_record IS TRUE) analyst_history ON analyst_history.analyst_id = analyst.id
WHERE
    client_id IN (?) AND analyst.is_active = true`;
      let getAnalystAndSegment = sequelize.query(queryGetAnalyst, {
        replacements: [clientIds],
        type: sequelize.QueryTypes.SELECT
      });
      lstFunc.push(getAnalystAndSegment);

      let queryStr = `(SELECT 
      a.id, a.topic, a.debrief, a.due_date, a.start_date, a.id as activity_id, b.desc, c.analyst_id, a.client_id as clientId, b.kind
FROM
    activity AS a
        LEFT JOIN
    task_type AS b ON a.type_id = b.id
        LEFT JOIN
    activity_analyst AS c ON a.id = c.activity_id
WHERE
    a.client_id in (?) OR b.desc = 'AD Inquiry' OR b.desc = 'AD')`;

      let getActivity = sequelize.query(queryStr, {
        replacements: [clientIds],
        type: sequelize.QueryTypes.SELECT
      });
      lstFunc.push(getActivity);

      let queryGetSegment = `SELECT * FROM segment`;
      let getGetSegment = sequelize.query(queryGetSegment, {
        type: sequelize.QueryTypes.SELECT
      });
      lstFunc.push(getGetSegment);

      Promise.all(lstFunc).spread((analystSegment, activity, segment) => {
        responseData.analystSegment = analystSegment;
        responseData.segment = segment;
        responseData.clients = clients;
        responseData.activity = activity;
        resolve(responseData);

      })
        .catch(function(err) {
          console.log(err);
          reject(err);
        });
    });
  });
}

var compare = function(a, b) {
  if (a.date > b.date) {
    return -1;
  }
  if (a.date < b.date) {
    return 1;
  }
  return 0;
};

var updateDateTask = function(taskId, taskDate) {
  try {
    const asanaClient = asana.Client.create().useAccessToken(config.asanaAccessToken);
    var data = {};
    data.due_on = taskDate;
    asanaClient.tasks
      .update(taskId, data)
      .then(function(response) {
      })
      .catch(function(err) {
      });
  } catch (err) {
    throw err;
  }
};

var createCustomfield = function(id, prjectId, asanaClient) {
  let customfieldTopic = {
    custom_field: id,
  };
  asanaClient.projects.addCustomFieldSetting(prjectId, customfieldTopic)
    .then(function(response) {
    })
    .catch(err => {
    });
};

export function getAnalystDetailById(analystId) {
  return new Promise((resolve, reject) => {
    return Analyst.findOne({
      where: {
        id: analystId,
      }
    }).then(client => {
      resolve(client);
    })
      .catch(err => reject(err));
  });
}

export async function createBriefingRequest(data) {
  //var data = req.body.data;
  return new Promise((resolve, reject) => {
    return sequelize.transaction(async function(t) {
      await RequestBriefing.create(data, { transaction: t });
    }).then(() => {
      resolve();
    })
      .catch(err => reject(err));
  });
}

export function getBriefingRequestByTaskId(taskId) {
  return new Promise((resolve, reject) => {
    return RequestBriefing.findOne({
      where: {
        task_id: taskId,
      },
      order: [['submit_time', 'DESC']]
    }).then(client => {
      resolve(client);
    })
      .catch(err => reject(err));
  });
}

export function deleteAnalyst(listSelectedAnalyst) {
  return new Promise((resolve, reject) => {
    var tasks = [];
    return sequelize.transaction(function(t) {
      //var listSelectedAnalyst = req.body.listSelectedAnalyst;
      //console.log(listSelectedAnalyst);
      if (listSelectedAnalyst.length > 0) {
        _.forEach(listSelectedAnalyst, function(item) {
          tasks.push(
            AnalystHistory.update(
              {
                is_active_record: false
              },
              {
                where: {
                  analyst_id: item.Analyst.id
                },
                transaction: t
              })
          );
          tasks.push(
            Analyst.update({
                is_active: false
              },
              {
                where: {
                  id: item.Analyst.id
                },
                transaction: t
              })
          );
        });
      }
      return Promise.all(tasks);
    }).then(() => {
      resolve();
    })
      .catch(err => reject(err));
  });
}


export function getClientAssocialAnalyst(analystId) {
  let query = {};
  query.include = [{
    model: SubSegmentAnalyst,
    as: 'SubSegmentAnalyst',
    where: {
      analyst_id: analystId
    },
    required: true,
    include: [{
      model: SubSegment,
      as: 'SubSegment',
      include: [{
        model: Segment,
        as: 'Segment'
      }]
    }],
  }]
  query.where = { is_active: true }

  return new Promise((resolve, reject) => {
    return Client.findAll(query)
      .then(data => {
        let clientIds = _.map(data, 'id');
        let setimentQueryStr = `SELECT 
        i.id, ic.client_id, i.sentiment, i.updated_date
    FROM
        insight_client ic
            INNER JOIN
        insight i ON i.id = ic.insight_id
    ORDER BY ic.client_id , i.updated_date DESC`;

        let lastActvitiesQueryStr = `SELECT 
        a.id, a.client_id, a.name, a.due_date
    FROM
        activity a
    WHERE
        a.due_date < NOW() AND a.client_id IN(:clientIds)
        ORDER BY a.client_id , a.due_date DESC`;

        clientIds = clientIds.length != 0 ? clientIds : [''];
        Promise.all([sequelize.query(setimentQueryStr, {
          replacements: { clientIds: clientIds },
          type: sequelize.QueryTypes.SELECT
        }), sequelize.query(lastActvitiesQueryStr, {
          replacements: { clientIds: clientIds },
          type: sequelize.QueryTypes.SELECT
        })]).spread((sentimentData, lastActivitiesData) => {
          sentimentData = _.groupBy(sentimentData, 'client_id');
          lastActivitiesData = _.groupBy(lastActivitiesData, 'client_id');
          data = _.map(data, item => {
              let clientSentiments = _.get(sentimentData, item.id);
              if(!clientSentiments){
                item.sentiment = 0;
              } else{
                let clientTop10Sentiments = _.slice(_.orderBy(clientSentiments, 'updated_date'), 0, 10);
                item.sentiment = _.meanBy(_.filter(clientTop10Sentiments, item => item.sentiment != null), 'sentiment') || 0;
              }
              let clientActivites = _.get(lastActivitiesData, item.id);
              if(!clientActivites){
                item.activity = "";
              }else{
                let clientLastActivity = _.slice(_.orderBy(clientActivites, 'due_date'), 0, 1);
                item.activity = clientLastActivity && clientLastActivity.length > 0 ? clientLastActivity[0].name : "";
              }
              return item;
          });
          resolve(ListClientAssocialAnalystDto(data));
        });
      })
      .catch(err => {
        console.log(err);
        reject(err)
      });
  });
}

export function getClientAssocialAnalystViaActivity(analystId) {
  return new Promise((resolve, reject) => {
    var query = `
    SELECT DISTINCT
        (c.id), c.name, b.name AS activity
    FROM
        activity_analyst AS a
            INNER JOIN
        activity AS b ON a.activity_id = b.id
            INNER JOIN
        client AS c ON b.client_id = c.id
    WHERE
        a.analyst_id = ?
        and c.is_active = true
        group by c.id
    ORDER BY b.due_date`;

    return sequelize.query(query, {
      replacements: [analystId],
      type: sequelize.QueryTypes.SELECT
    })
      .then(clientData => {

        let listClientId = _.map(clientData, item => {
          return item.id;
        });
        listClientId = listClientId.length == 0 ? [''] : listClientId;

        var query = `SELECT 
    a.id, b.client_id, c.sentiment
FROM
    insight_analyst AS a
        INNER JOIN
    insight_client AS b ON a.insight_id = b.insight_id
        INNER JOIN
    insight AS c ON a.insight_id = c.id
WHERE
    a.analyst_id = ?
        AND b.client_id IN (?)`;
        return sequelize.query(query, {
          replacements: [analystId, listClientId],
          type: sequelize.QueryTypes.SELECT
        })
          .then(data => {
            let groupObject = _.groupBy(data, 'client_id');
            let resualt = {};
            _.forEach(groupObject, (item, key) => {

              let listInsight = _.filter(item, obj => {
                  return obj.sentiment;
                })

                if(listInsight.length > 0 )
                {
                  resualt[key] = Number((listInsight.map(x => { return Number(x.sentiment) }).reduce((a, b) => { return (a + b) }) / listInsight.length).toFixed(1));
                }
            });

            _.forEach(clientData, item => {
              item.sentiment = resualt[item.id] ? resualt[item.id] : 0;
            })
            resolve(clientData);
          })
          .catch(err => {
            console.log(err)
            reject(err);
          });

      })
      .catch(err => {
        reject(err);
      });
  });
}

export function getMajorReport(analystId) {
  return new Promise((resolve, reject) => {
    var query = `SELECT a.*, b.analyst_id
    ,GROUP_CONCAT(DISTINCT e.name ORDER BY e.name ASC SEPARATOR '!!!') as all_client_name
    ,GROUP_CONCAT(DISTINCT e.id ORDER BY e.name ASC SEPARATOR '!!!') as all_client_id
    ,GROUP_CONCAT(DISTINCT h.desc ORDER BY h.desc ASC SEPARATOR '!!!') as all_research_name
    ,GROUP_CONCAT(DISTINCT h.id ORDER BY h.desc ASC SEPARATOR '!!!') as all_research_id

    FROM ranking_report as a
    inner join ranking_report_analyst as b on a.id = b.ranking_report_id and b.is_active = true
    left join client_ranking_report as d on a.id = d.ranking_report_id and d.is_active = true
    left join ranking_report_research as g on a.id = g.ranking_report_id and g.is_active = true
    left join client  as e on e.id = d.client_id and e.is_active = true
    left join research  as h on h.id = g.research_id and h.is_active = true
    where a.is_active = true and b.analyst_id = '${analystId}' and a.major_report <> '0'
    group by id;`;

    return sequelize.query(query, { type: sequelize.QueryTypes.SELECT })
      .then(data => {
        resolve(data);
      })
      .catch(err => {
        reject(err);
      });
  });
}

//-------------------------private functions-------------------

var getProjects = function(prevResponse, asanaClient, task, res) {
  return new Promise((resolve, reject) => {
    if (!prevResponse) {
      asanaClient.projects
        .findByWorkspace(config.asanaWorkspaceId, { limit: 100 })
        .then(function(response) {
          return handleProjectResponse(asanaClient, response, task);
        })
        .then((resTask) => resolve(resTask))
        .catch(err => reject(err));
    } else {
      prevResponse.nextPage()
        .then(function(response) {
          return handleProjectResponse(asanaClient, response, task);
        })
        .then((resTask) => resolve(resTask))
        .catch(err => reject(err));
    }
  });
};

var handleProjectResponse = function(asanaClient, response, task) {
  return new Promise((resolve, reject) => {
    projects = projects.concat(response.data);
    if (response._response.next_page) {
      return getProjects(response, asanaClient, task).then((resTask) => resolve(resTask))
        .catch(err => reject(err));
    } else {
      var data = {};
      data.name = `${task.analystName} – ${task.taskType.desc}`;
      data.projectName = `${task.clientName}: Planning`;
      data.due_on = task.date;
      return checkTag(asanaClient, projects, task, data).then((resTask) => resolve(resTask))
        .catch(err => {
          console.log(err);
          reject(err);
        });
    }
  });
};

var checkTag = async function(asanaClient, projects, task, data) {
  return new Promise((resolve, reject) => {
    if (task.taskType.desc === 'Inquiry') {
      task.tag = 'Client Inquiry';
    } else {
      task.tag = task.taskType.desc;
    }
    Tag.findAll({ where: { description: task.tag } }).then(reponse => {
      let tag = {};
      if (reponse.length !== 0) {
        tag = reponse[0].dataValues;
      } else {
        let data = {
          name: task.tag
        };
        asanaClient.tags.createInWorkspace(config.asanaWorkspaceId, data).then((response) => {
          tag.asana_id = response.id;
          const newTag = {
            id: uuid.v1(),
            description: task.tag,
            is_active: true,
            asana_id: tag.asana_id
          };
          sequelize.transaction(async function(t) {
            let tagType = await Tag.create(newTag, { transaction: t });
            await InteractionType.create({
              id: uuid.v1(),
              asana_tags: task.tag,
              is_active: true,
              task_type_id: task.taskType.id
            }, { transaction: t });
          });
        });
      }
      return createTaskInAsana(asanaClient, projects, task, data, tag);
    })
      .then((resTask) => resolve(resTask))
      .catch(err => {
        console.log(err);
        reject(err);
      });
  });
};

var createTaskInAsana = function(asanaClient, projects, task, data, tag) {
  return new Promise((resolve, reject) => {
    let check = null;
    for (let i = 0; i < projects.length; i++) {
      if (correctHyphenOfString(correctWhiteSpaceOfString(projects[i].name.normalize('NFKD'))).trim() === correctHyphenOfString(correctWhiteSpaceOfString(data.projectName.normalize('NFKD'))).trim()) {
        check = projects[i];
        break;
      }
    }
    if (check) {
      data.projects = check.id.toString();
      createCustomfield(config.asanaCustomFieldTopic, data.projects, asanaClient);
      data.custom_fields = {
        [config.asanaCustomFieldTopic]: task.topic,
      };

      data.tags = [Number(tag.asana_id)];
      asanaClient.tasks.createInWorkspace(config.asanaWorkspaceId, data)
        .then(function(response) {
          let taskObj = {};
          taskObj.id = uuid.v1();
          taskObj.asana_id = response.id;
          taskObj.client_id = task.clientId;
          taskObj.analyst_id = task.analystId;
          taskObj.task_name = data.name;
          taskObj.date = task.date;
          taskObj.topic = task.topic;
          taskObj.asana_name = data.projectName;
          taskObj.planning_designation = 'P';
          taskObj.asana_project_id = data.projects;
          taskObj.quarter = Math.ceil(((new Date(task.date)).getMonth() + 1) / 3);
          return createTaskDb(taskObj, task.tag);
        })
        .then((resTask) => resolve(resTask))
        .catch(err => {
          console.log(err);
          reject(err);
        });
    } else {
      let projectObj = {};
      projectObj.name = data.projectName;
      asanaClient.projects.createInTeam(config.asanaTeamId, projectObj)
        .then((response) => {
          data.projects = response.id.toString();
          createCustomfield(config.asanaCustomFieldTopic, data.projects, asanaClient);
          data.custom_fields = {
            [config.asanaCustomFieldTopic]: task.topic,
          };
          data.tags = [Number(tag.asana_id)];
          return asanaClient.tasks.createInWorkspace(config.asanaWorkspaceId, data);
        })
        .then((response) => {
          let taskObj = {};
          taskObj.id = uuid.v1();
          taskObj.asana_id = response.id;
          taskObj.client_id = task.clientId;
          taskObj.analyst_id = task.analystId;
          taskObj.task_name = data.name;
          taskObj.date = task.date;
          taskObj.topic = task.topic;
          taskObj.asana_name = data.projectName;
          taskObj.planning_designation = 'P';
          taskObj.asana_project_id = data.projects;
          taskObj.quarter = Math.ceil(((new Date(task.date)).getMonth() + 1) / 3);
          return createTaskDb(taskObj, task.taskType.desc);
        })
        .then((resTask) => resolve(resTask))
        .catch(err => reject(err));
    }
  });
};

var createTaskDb = async function(task, taskType) {
  return new Promise((resolve, reject) => {
    var taskRes = {};
    return sequelize.transaction(async function(t) {
      taskRes = await Task.create(task, { transaction: t });
      var taskId = taskRes.dataValues.id;
      await InteractionType.findAll({ where: { asana_tags: taskType, is_active: true } })
        .then(response => {
          if (response.length !== 0) {
            const newTaskInteraction = {
              id: uuid.v1(),
              task_id: taskId,
              interaction_id: response[0].id,
              is_active: true
            };
            TaskInteraction.create(newTaskInteraction, { transaction: t });
          }
        });
    }).then(() => {
      resolve(taskRes);
    })
      .catch(err => reject(err));
  });
};

var correctWhiteSpaceOfString = function(source) {
  try {
    if (source === null || source === undefined) {
      return null;
    }
    return source.replace(/\u00a0/g, ' ');
  } catch (err) {
    throw err;
  }
};

var correctHyphenOfString = function(source) {
  try {
    if (source === null || source === undefined) {
      return null;
    }
    return source
      .replace(/\u1806/g, '-')
      .replace(/\u2010/g, '-')
      .replace(/\u2011/g, '-')
      .replace(/\u2012/g, '-')
      .replace(/\u2013/g, '-')
      .replace(/\u2014/g, '-')
      .replace(/\u2015/g, '-')
      .replace(/\u207b/g, '-')
      .replace(/\u208b/g, '-')
      .replace(/\u2122/g, '-')
      .replace(/\ufe58/g, '-')
      .replace(/\ufe63/g, '-')
      .replace(/\uff0d/g, '-')
      .replace(/–/g, '-');
  } catch (err) {
    throw err;
  }
};

export function getAllAnalystInfo() {
  return new Promise((resolve, reject) => {
    return Analyst.findAll({
      where: { is_active: true }
    })
      .then((data) => {
        resolve(data);
      })
      .catch(err => reject(err));
  });
}


export function getSubSegmentByAnalystSegment(analystId, clientId) {
  var query = {};
  query.include = [{
    model: SubSegment,
    as: 'SubSegment',
    attributes: ['id'],
    include: [{
      model: SubSegmentAnalyst,
      as: 'SubSegmentAnalyst',
      where: [{ analyst_id: analystId }, { client_id: clientId }],
      required: true
    }]
  }];
  return new Promise((resolve, reject) => {
    return Segment.findAll(query)
      .then(data => {
        resolve(data);
      })
      .catch(err => {
        console.log(err);
        reject(err)
      });
  }).catch(err => {
    console.log(err)
  });
}

export function getPublishAnalystById(analystId) {
  return new Promise((resolve, reject) => {
    return AnalystHistory.findAll({
      include: [
        {
          model: Analyst,
          include: [
            { model: Research, through: { where: { is_active: true } } }
          ],
          where: {
            id: analystId,
          }
        },
        ResearchType,
        Firm,
        VendorLeaning
      ],
      where: {
        is_active_record: true
      }
    }).then(function(data) {
      return ListAnalystDto(data);
    })
      .then(res => resolve(res))
      .catch(err => reject(err));
  });
}

export function getAvgSentimentForAnalysts() {
  return new Promise((resolve, reject) => {
    let query =
      `SELECT final.analyst_id, AVG(final.sentiment) as avg_sentiment FROM        
      (SELECT result.*,
        @rank:=CASE WHEN @analyst_id <> analyst_id THEN 0 ELSE @rank+1 END AS rn, 
        @analyst_id:=analyst_id AS clset
      FROM
        (SELECT @rank:= 0) s,  
        (SELECT @analyst_id:= 0) c,
        (SELECT insight.*,insight_analyst.analyst_id             
                  FROM insight
              INNER JOIN insight_analyst 
              ON insight_analyst.insight_id = insight.id					
              ORDER BY insight_analyst.analyst_id, created_date DESC                    
              ) result) final
    WHERE final.rn < 10                 
    GROUP BY final.analyst_id`;
    return sequelize.query(query, {
      type: sequelize.QueryTypes.SELECT
    })
      .then(data => {
        resolve(data)
      })
      .catch(err => reject(err));
  });
}

export function getGlobalSegment() {
  return new Promise((resolve, reject) => {
    let query =
      `SELECT 
    id, name, client_id
FROM
    segment
WHERE
    client_id IS NULL;`;
    return sequelize.query(query, {
      type: sequelize.QueryTypes.SELECT
    })
      .then(data => {
        resolve(data)
      })
      .catch(err => reject(err));
  })
}

export function countInsightForAnalystList(analystId) {
  return new Promise((resolve, reject) => {
    let query =
      `SELECT a.analyst_id ,count(a.analyst_id) as count FROM insight_analyst as a
       inner join insight as b on a.insight_id = b.id and b.is_active = true
       where a.analyst_id in (?) group by a.analyst_id;`;
    sequelize.query(query, {
      replacements: [analystId],
      type: sequelize.QueryTypes.SELECT
    })
      .then(data => {
        resolve(data)
      })
      .catch(err => reject(err));
  });
}

export function countPastInsightForAnalystList(analystId) {
  return new Promise((resolve, reject) => {
    let query =
      `SELECT a.analyst_id ,count(a.analyst_id) as count FROM insight_analyst as a
      inner join insight as b on a.insight_id = b.id and b.is_active = true and b.updated_date >= DATE_SUB(NOW(), INTERVAL 90 DAY)
      where a.analyst_id in (?) group by a.analyst_id;`;
    sequelize.query(query, {
      replacements: [analystId],
      type: sequelize.QueryTypes.SELECT
    })
      .then(data => {
        resolve(data)
      })
      .catch(err => reject(err));
  });
}

export function getAnalystsAssignedToUser(userData) {
  return new Promise((resolve, reject) => {
    let query = {
      include: [{
        model: AnalystHistory,
        as: 'AnalystHistory',
        required: true,
        where: {
          is_active_record: true,
          ad_owner: userData.email
        }
      }]
    }

    return Analyst.findAll(query)
      .then(data => {
        resolve(data)
      })
      .catch(err => {
        reject(err)
      });
  });
}

export function getAnalystsByClient(clientId) {
  return new Promise((resolve, reject) => {
    var query = `
    SELECT a.id, a.name
    FROM analyst as a
      LEFT JOIN activity_analyst AS aa ON a.id = aa.analyst_id
      LEFT JOIN activity ON aa.activity_id = activity.id
    WHERE
      activity.client_id = :clientId
    GROUP BY a.id
    UNION
    SELECT a.id, a.name
    FROM analyst as a
      LEFT JOIN sub_segment_analyst AS ssa ON a.id = ssa.analyst_id
    WHERE
      ssa.client_id = :clientId
    GROUP BY a.id;
    `;

    return sequelize.query(query, { replacements: { clientId: clientId }, type: sequelize.QueryTypes.SELECT })
      .then(data => {
        let listAnalysts = _.uniqBy(data, 'id');
        resolve(listAnalysts);
      })
      .catch(err => {
        reject(err)
      });
  })
}