'use strict';
import log4Js from 'log4js/lib/log4js';
import {
  sequelize,
  Insight,
  InsightAnalyst,
  InsightClient,
  InsightClientStatus,
  InsightEvent,
  InsightActivity,
  InsightCategory,
  InsightReport,
  MarketCategory,
  InsightFirm,
  Collection,
  Client,
  Analyst,
  Media
} from '../../sqldb';
import uuid from 'uuid';
import config from '../../config/environment/shared';
import _ from 'lodash';
var Promise = require('bluebird');
var sharp = require('sharp');
var fs = require('fs');
var CommonService = require('./common.service');

log4Js.configure({
  appenders: [
    { type: 'file', filename: 'logs/client-controller.log', category: 'client-controller' }
  ]
});
import {
  ListInsightForAnalyst,
  ListInsightForCollection
} from '../dtos/analystDto';


export function getListInsightByAnalystId(data, client) {
  let clientIds = data.clientIds;
  let role = data.role;
  let analystId = data.analystId;

  let selectedClient = client;
  let query = {};
  query.include = [{
    model: InsightAnalyst,
    as: 'InsightAnalyst',
    where: {
      analyst_id: analystId
    },
    required: true
  }, {
    model: InsightClientStatus,
    as: 'InsightClientStatus',
    required: false,
  }, {
    model: Client,
    as: 'Clients',
    required: false
  }]

  query.order = [['created_date', 'DESC']];
  //query.group = ['id']
  switch (role) {
    case config.role.spotlightAdmin:
      break;
    default:
      query.where = {
        sensitivity: { $ne: config.insightSensitivity[1].value }
      }

      query.include[1].where = {
        publish: true,
        client_id: selectedClient
      }

      query.include[1].required = true
      break;
  }

  return new Promise((resolve, reject) => {
    return Insight.findAll(query)
      .then((data) => {
        var dataReturn = ListInsightForAnalyst(data, selectedClient, role);
        resolve(dataReturn);
      })
      .catch(err => {
        reject(err)
      });
  });
}

export function editInsight(data) {
  var conflict = false;
  var last_updated_date;
  var last_updated_by;

  return new Promise((resolve, reject) => {
    var insightObject = {
      type: data.type,
      sensitivity: data.sensitivity,
      desc: data.desc,
      sentiment: data.sentiment,
      updated_date: data.updated_date,
      last_updated_by: data.last_updated_by
    }

    var insight_id = data.id;
    Insight.findOne({
      where: { id: insight_id }
    })
      .then(result => {
        if (result) {
          var comp1 = new Date(result.dataValues.updated_date);
          var comp2 = new Date(data.last_updated);
          console.log(comp1 + " : " + comp2);
          if (result.dataValues.last_updated_by != data.last_updated_by && comp1.toString() != comp2.toString()) {
            conflict = true;
            last_updated_date = result.dataValues.updated_date;
            last_updated_by = result.dataValues.last_updated_by;
            throw new Error('Unable to save, Item has been modified');
          }
        }
        last_updated_date = insightObject.updated_date;
        var clientOldIs = _.map(data.selectedClientOldData, client => {
          return client.id
        });
        var clientCurrentIds = _.map(data.selectedClients, client => {
          return client.id
        });
        var clientDelete = _.difference(clientOldIs, clientCurrentIds) || [];
        var clientAdd = _.difference(clientCurrentIds, clientOldIs) || [];
        Insight.update(insightObject, { where: { id: insight_id } }).then(rs => {
          var listFuncs = [];
          listFuncs.push(InsightAnalyst.destroy({ where: { insight_id: insight_id } }));
          listFuncs.push(InsightClient.destroy({
            where: {
              insight_id: insight_id,
              client_id: { $in: clientDelete }
            }
          }));
          listFuncs.push(InsightActivity.destroy({ where: { insight_id: insight_id } }));
          listFuncs.push(InsightReport.destroy({ where: { insight_id: insight_id } }));
          listFuncs.push(InsightCategory.destroy({ where: { insight_id: insight_id } }));
          listFuncs.push(InsightEvent.destroy({ where: { insight_id: insight_id } }));
          listFuncs.push(InsightFirm.destroy({ where: { insight_id: insight_id } }));

          return Promise.all(listFuncs);
        }).then(rs => {
          var listFuncs = [];
          clientAdd.forEach(client => {
            listFuncs.push(InsightClient.create({ insight_id: insight_id, client_id: client }))
          });

          data.selectedAnalysts.forEach(analyst => {
            listFuncs.push(InsightAnalyst.create({ insight_id: insight_id, analyst_id: analyst.id }))
          });

          data.selectedEvents.forEach(event => {
            listFuncs.push(InsightEvent.create({ insight_id: insight_id, event_id: event.id }))
          });

          data.selectedActivities.forEach(activity => {
            listFuncs.push(InsightActivity.create({ insight_id: insight_id, activity_id: activity.id }))
          });

          data.selectedReports.forEach(report => {
            listFuncs.push(InsightReport.create({ insight_id: insight_id, report_id: report.id }))
          });

          data.selectedCategories.forEach(category => {
            listFuncs.push(InsightCategory.create({ insight_id: insight_id, category_id: category.id }))
          });

          data.selectedFirm.forEach(firm => {
            listFuncs.push(InsightFirm.create({ insight_id: insight_id, firm_id: firm.id }))
          });

          if (data.sensitivity === config.insightSensitivityValue.CONFIDENTIAL) {
            listFuncs.push(InsightClientStatus.update({ publish: false }, { where: { insight_id: insight_id } }))
          }
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
          })
      })
      .catch(err => {
        err.conflict = conflict;
        err.last_updated = last_updated_date;
        err.last_updated_by = last_updated_by;
        console.log(err);
        reject(err);
      });
  });
}

export function addInsight(data, currentUserData) {
  return new Promise((resolve, reject) => {
    var insight_id = uuid.v1();

    var insightObject = {
      id: insight_id,
      type: data.type,
      sensitivity: data.sensitivity,
      desc: data.desc,
      sentiment: data.sentiment,
      is_active: true,
      created_by: data.created_by,
      created_date: data.created_date,
      updated_date: data.updated_date,
      published_date: data.published_date,
      last_updated_by: data.last_updated_by,
    }

    Insight.create(insightObject).then(rs => {
    }).then(rs => {
      var listFuncs = [];
      if (data.clientContextId) {
        if (currentUserData.role == config.role.spotlightAdmin) {
          listFuncs.push(InsightClientStatus.create({ insight_id: insight_id, client_id: data.clientContextId, publish: false, star: false }))
        } else {
          listFuncs.push(InsightClientStatus.create({ insight_id: insight_id, client_id: data.clientContextId, publish: true, star: false }))
        }
      }

      data.selectedClients ? data.selectedClients.forEach(client => {
        listFuncs.push(InsightClient.create({ insight_id: insight_id, client_id: client.id }))
      }) : {};

      data.selectedAnalysts ? data.selectedAnalysts.forEach(analyst => {
        listFuncs.push(InsightAnalyst.create({ insight_id: insight_id, analyst_id: analyst.id }))
      }) : {};

      data.selectedEvents ? data.selectedEvents.forEach(event => {
        listFuncs.push(InsightEvent.create({ insight_id: insight_id, event_id: event.id }))
      }) : {};

      data.selectedActivities ? data.selectedActivities.forEach(activity => {
        listFuncs.push(InsightActivity.create({ insight_id: insight_id, activity_id: activity.id }))
      }) : {};

      data.selectedReports ? data.selectedReports.forEach(report => {
        listFuncs.push(InsightReport.create({ insight_id: insight_id, report_id: report.id }))
      }) : {};

      data.selectedCategories ? data.selectedCategories.forEach(category => {
        listFuncs.push(InsightCategory.create({ insight_id: insight_id, category_id: category.id }))
      }) : {};

      data.selectedFirm ? data.selectedFirm.forEach(firm => {
        listFuncs.push(InsightFirm.create({ insight_id: insight_id, firm_id: firm.id }))
      }) : {};


      return Promise.all(listFuncs);
    })
      .then(rs => {
        resolve(rs);
      })
      .catch(err => {
        reject(err);
      });
  });
}

export function getAllInsight(currentPage, itemPerPage, sortKey, sortType) {
  let offset = 0;
  let limit = 100;
  if (itemPerPage) {
    limit = parseInt(itemPerPage);
  }

  if (currentPage) {
    offset = parseInt(currentPage - 1) * limit;
  }
  return new Promise((resolve, reject) => {
    return Insight.findAll({
      order: [
        ['updated_date', 'ASC'],
      ],
      include: [
        {
          model: Client,
          as: "Clients"
        },
        {
          model: Analyst,
          as: "Analysts"
        }
      ]
    }).then(function (data) {
      return data;
    })
      .then((data) => {
        resolve(data);
      })
      .catch(function (err) {
        reject(err);
      })
  });
}

export function searchInsightObject(keyword, clientContextId, currentUserData) {
  return new Promise((resolve, reject) => {
    let keywordArray = _.filter(keyword.split(' '), item => {
      return item.length && item.length > 1;
    });

    var getQuery = (keyword, isAdmin) => {
      var additionQuery = !isAdmin ? `AND cate.id IN (:categoryIds)` : ``;
      return `select a.id as id, m.media_id as avatar, a.name as name, "Analyst" as type, null as addition_id, null as addition_name, null as addition_image
        from (SELECT a.id, a.name FROM analyst as a ` + CommonService.generateWhereAndQueryByKeyWordArray(keywordArray, 'a.name', true) + ` ORDER BY a.name LIMIT 10 offset 0) as a
        left join analyst_media am on a.id = am.analyst_id and am.media_type = 'avatar' and am.is_active = 1
        left join media m on am.media_id = m.media_id and m.is_active = 1

        union all

        select c.id as id, m.media_id as avatar, c.name as name, "Client" as type, null as addition_id, null as addition_name, null as addition_image
        from (SELECT c.id, c.name FROM client as c ` + CommonService.generateWhereAndQueryByKeyWordArray(keywordArray, 'c.name', true) + ` ORDER BY c.name LIMIT 10 offset 0) as c
        left join client_media cm on c.id = cm.client_id and cm.media_type = 'avatar' and cm.is_active = 1
        left join media m on cm.media_id = m.media_id and m.is_active = 1

        union all

        (select e.id as id, NULL as avatar, e.name as name, "Event" as type, null as addition_id, null as addition_name, null as addition_image
        FROM event as e ` + CommonService.generateWhereAndQueryByKeyWordArray(keywordArray, 'e.name', false) + ` ORDER BY name LIMIT 10 offset 0)

        union

        (select cate.id as id, NULL as avatar, cate.desc as name, "Category" as type, null as addition_id, null as addition_name, null as addition_image
        FROM research as cate `  + CommonService.generateWhereAndQueryByKeyWordArray(keywordArray, 'cate.desc', true) +
        `${additionQuery}
        ORDER BY cate.desc LIMIT 10 offset 0)

        union

        (select r.id as id, NULL as avatar, r.name as name, "Report" as type, null as addition_id, null as addition_name, null as addition_image
        FROM ranking_report as r ` + CommonService.generateWhereAndQueryByKeyWordArray(keywordArray, 'r.name', true) + ` ORDER BY r.name LIMIT 10 offset 0)

        union

        -- cannot tag task to insight
        (SELECT ac.id as id, NULL as avatar, ac.name as name , "Activity" as type, c.id as addition_id, c.name as addition_name, m.media_id as addition_image
        FROM activity as ac
        LEFT JOIN client as c ON ac.client_id = c.id
        LEFT JOIN client_media cm on c.id = cm.client_id and cm.media_type = 'avatar' and cm.is_active = 1
        LEFT JOIN media m on cm.media_id = m.media_id and m.is_active = 1 `
        + CommonService.generateWhereAndQueryByKeyWordArray(keywordArray, 'ac.name', false)
        + ` ORDER BY ac.name LIMIT 10 offset 0)

        union

        (select firm.id as id, NULL as avatar, firm.name as name , "Firm" as type, null as addition_id, null as addition_name, null as addition_image
        FROM firm ` + CommonService.generateWhereAndQueryByKeyWordArray(keywordArray, 'name', false) + ` ORDER BY name LIMIT 10 offset 0)`;
    }

    if (currentUserData.role == config.role.spotlightAdmin) {
      var query = getQuery(keyword, true);
      return sequelize.query(query, { type: sequelize.QueryTypes.SELECT })
        .then(data => {
          resolve(data);
        })
        .catch(err => {
          reject(err);
        });
    } else {
      var clientIds = clientContextId ? [clientContextId] : currentUserData.clientIds.split(',');
      return getListCategoryByListClient(clientIds)
        .then((categories) => {
          var categoryIds = categories && categories.length > 0 ? categories.map(category => { return category.id }) : [''];
          var query = `select cate.id as id, NULL as avatar, cate.desc as name, "Category" as type, 
            null as addition_id, null as addition_name, null as addition_image
            FROM research as cate `
            + CommonService.generateWhereAndQueryByKeyWordArray(keywordArray, 'cate.desc', true) +
            ` AND cate.id IN (:categoryIds)
            ORDER BY cate.desc LIMIT 10 offset 0`;
          return sequelize.query(query, { replacements: { categoryIds: categoryIds }, type: sequelize.QueryTypes.SELECT })
            .then(data => {
              resolve(data);
            })
            .catch(err => {
              reject(err);
            });
        })
    }

  });
}


export function getInsightObjectByInsightId(insightId) {
  let offset = 0;
  let limit = 10;
  /* if(itemPerPage) {
   limit = parseInt(itemPerPage);
   }

   if(currentPage)
   {
   offset =  parseInt(currentPage - 1) * limit;
   }*/

  return new Promise((resolve, reject) => {
    var query = `select oi.client_id as id, m.media_id as avatar, c.name as name, "Client" as type
    from (select * from insight_client oi where oi.insight_id = :insightId) oi
    inner join client c on c.id = oi.client_id
    left join client_media cm on oi.client_id = cm.client_id and cm.media_type = 'avatar' and cm.is_active = 1
    left join media m on cm.media_id = m.media_id and m.is_active = 1

    union

    select oi.analyst_id as id, m.media_id as avatar, a.name as name, "Analyst" as type
    from (select * from insight_analyst oi where oi.insight_id = :insightId) oi
    inner join analyst a on a.id = oi.analyst_id
    left join analyst_media cm on oi.analyst_id = cm.analyst_id and cm.media_type = 'avatar' and cm.is_active = 1
    left join media m on cm.media_id = m.media_id and m.is_active = 1

    union

    select oi.event_id as id, null as avatar, e.name as name, "Event" as type
    from (select * from insight_event oi where oi.insight_id = :insightId) oi
    inner join event e on e.id = oi.event_id

   union

    select oi.category_id as id, null as avatar, r.desc as name, "Category" as type
    from (select * from insight_category oi where oi.insight_id = :insightId) oi
    inner join research r on r.id = oi.category_id and r.is_active = 1

    union

    select oi.report_id as id, null as avatar, r.name as name, "Report" as type
    from (select * from insight_report oi where oi.insight_id = :insightId) oi
    inner join ranking_report r on r.id = oi.report_id and r.is_active = 1

    union

    select oi.activity_id as id, null as avatar, ac.name as name, "Activity" as type
    from (select * from insight_activity oi where oi.insight_id = :insightId) oi
    inner join activity ac on ac.id = oi.activity_id
    where ac.name is not null

    union

    select oi.activity_id as id, null as avatar, t.task_name as name, "Activity" as type
    from (select * from insight_activity oi where oi.insight_id = :insightId) oi
    inner join task t on t.id = oi.activity_id
    where t.task_name is not null

    union

    select oi.firm_id as id, null as avatar, f.name as name, "Firm" as type
    from (select * from insight_firm oi where oi.insight_id = :insightId) oi
    left join firm f on f.id = oi.firm_id

    `;

    return sequelize.query(query, { replacements: { insightId: insightId }, type: sequelize.QueryTypes.SELECT })
      .then(data => {
        resolve(data);
      })
      .catch(err => {
        reject(err);
      });
  });
}


export function searchAnalystForInsight(keyword) {
  return new Promise((resolve, reject) => {
    var query = `select a.id as id, m.media_data as avatar, a.name as name, "Analyst" as type, "1" as priority
    from (SELECT a.id, a.name FROM analyst as a where a.name like '%${keyword}%' ORDER BY a.name DESC LIMIT 10 offset 0) as a
    left join analyst_media am on a.id = am.analyst_id and am.media_type = 'avatar' and am.is_active = 1
    left join media m on am.media_id = m.media_id and m.is_active = 1`;

    return sequelize.query(query, { type: sequelize.QueryTypes.SELECT })
      .then(data => {
        resolve(data);
      })
      .catch(err => {
        reject(err);
      });
  });
}

export function searchClientForInsight(keyword) {
  return new Promise((resolve, reject) => {
    var query = `select c.id as id, m.media_data as avatar, c.name as name, "Client" as type, "2" as priority
    from (SELECT c.id, c.name FROM client as c where c.name like '%${keyword}%' ORDER BY c.name DESC LIMIT 10 offset 0) as c
    left join client_media cm on c.id = cm.client_id and cm.media_type = 'avatar' and cm.is_active = 1
    left join media m on cm.media_id = m.media_id and m.is_active = 1`;

    return sequelize.query(query, { type: sequelize.QueryTypes.SELECT })
      .then(data => {
        resolve(data);
      })
      .catch(err => {
        reject(err);
      });
  });
}

export function searchEventForInsight(keyword) {
  return new Promise((resolve, reject) => {
    var query = `select e.id as id, NULL as avatar, e.name as name, "Event" as type, "3" as priority FROM event as e where e.name like '%${keyword}%' ORDER BY name DESC LIMIT 10 offset 0`;

    return sequelize.query(query, { type: sequelize.QueryTypes.SELECT })
      .then(data => {
        resolve(data);
      })
      .catch(err => {
        reject(err);
      });
  });
}

export function searchCategoryForInsight(keyword) {
  return new Promise((resolve, reject) => {
    var query = `select cate.id as id, NULL as avatar, cate.desc as name, "Category" as type, "4" as priority FROM research as cate where cate.desc like '%${keyword}%' ORDER BY cate.desc DESC LIMIT 10 offset 0`;

    return sequelize.query(query, { type: sequelize.QueryTypes.SELECT })
      .then(data => {
        resolve(data);
      })
      .catch(err => {
        reject(err);
      });
  });
}

export function searchReportForInsight(keyword) {
  return new Promise((resolve, reject) => {
    var query = `select r.id as id, NULL as avatar, r.name as name, "Report" as type , "5" as priority FROM ranking_report as r where r.name like '%${keyword}%' ORDER BY r.name DESC LIMIT 10 offset 0`;

    return sequelize.query(query, { type: sequelize.QueryTypes.SELECT })
      .then(data => {
        resolve(data);
      })
      .catch(err => {
        reject(err);
      });
  });
}

export function searchActivityForInsight(keyword) {
  return new Promise((resolve, reject) => {
    var query = `select ac.id as id, NULL as avatar, ac.name as name , "Activity" as type, "6" as priority FROM activity as ac where name like '%${keyword}%' ORDER BY name DESC LIMIT 10 offset 0`;

    return sequelize.query(query, { type: sequelize.QueryTypes.SELECT })
      .then(data => {
        resolve(data);
      })
      .catch(err => {
        reject(err);
      });
  });
}

export function convertBase64ImageToSmaller() {
  return new Promise((resolve, reject) => {
    return Media.findAll()
      .then(data => {
        data.forEach(media => {
          var query = {};
          query.where = { media_id: media.media_id };

          var imgBase64 = media.media_data.toString('utf8');
          imgBase64 = imgBase64.replace(/^data:image\/[a-z]+;base64,/, "");

          var inputBuffer = Buffer.from(imgBase64, 'base64');

          sharp(inputBuffer)
            .resize(40, 40, {
              kernel: sharp.kernel.nearest
            })
            .toBuffer((err, buffer) => {
              if (buffer) {
                var newImg = `data:image/png;base64, ` + buffer.toString('base64');
                var blob = new Buffer(newImg, 'utf8');
                return Media.update({ small_media_data: blob }, query);
              }

            });
        })
      }).then(data => {
        resolve(data);
      })
      .catch(err => {
        reject(err);
      });
  });
}


export function deleteInsight(insightId) {
  return new Promise((resolve, reject) => {
    var listFuncs = [];
    listFuncs.push(InsightClient.destroy({ where: { insight_id: insightId } }));
    listFuncs.push(InsightAnalyst.destroy({ where: { insight_id: insightId } }));
    listFuncs.push(InsightActivity.destroy({ where: { insight_id: insightId } }));
    listFuncs.push(InsightReport.destroy({ where: { insight_id: insightId } }));
    listFuncs.push(InsightCategory.destroy({ where: { insight_id: insightId } }));
    listFuncs.push(InsightEvent.destroy({ where: { insight_id: insightId } }));
    listFuncs.push(InsightFirm.destroy({ where: { insight_id: insightId } }));
    return Promise.all(listFuncs).then(rs => {
      return Insight.destroy({ where: { id: insightId } })
    })
      .then(rs => {
        resolve(rs);
      })
      .catch(err => {
        console.log(err);
        reject(err);
      });
  });
}

export function deleteClientInsight(insightId, clientId) {
  return new Promise((resolve, reject) => {
    return InsightClient.destroy({ where: { insight_id: insightId, client_id: clientId } })
      .then(rs => {
        resolve(rs);
      })
      .catch(err => {
        console.log(err);
        reject(err);
      });
  });
}

export function deleteObjectAssociatedToInsight(insightId, objectId, type) {
  return new Promise((resolve, reject) => {
    var func = []
    switch (type) {
      case config.insightObjectType.Analyst:
        func.push(InsightAnalyst.destroy({ where: { insight_id: insightId, analyst_id: objectId } }));
        break;
      case config.insightObjectType.Client:
        func.push(InsightClient.destroy({ where: { insight_id: insightId, client_id: objectId } }));
        break;
      case config.insightObjectType.Report:
        func.push(InsightReport.destroy({ where: { insight_id: insightId, report_id: objectId } }));
        break;
      case config.insightObjectType.Category:
        func.push(InsightCategory.destroy({ where: { insight_id: insightId, category_id: objectId } }));
        break;
      case config.insightObjectType.Event:
        func.push(InsightEvent.destroy({ where: { insight_id: insightId, event_id: objectId } }));
        break;
      case config.insightObjectType.Firm:
        func.push(InsightFirm.destroy({ where: { insight_id: insightId, firm_id: objectId } }));
        break;
      case config.insightObjectType.Activity:
        func.push(InsightActivity.destroy({ where: { insight_id: insightId, activity_id: objectId } }));
        break;
      default:
        break;
    }

    return Promise.all(func)
      .then(rs => {
        resolve(rs);
      })
      .catch(err => {
        console.log(err);
        reject(err);
      });
  });
}

export function getInsightByReportIdClientMode(data) {
  return new Promise((resolve, reject) => {
    var query = `SELECT
    insight.id, insight.sentiment, insight.desc, insight.sensitivity, insight.type
  FROM
  ranking_report
          LEFT JOIN
      insight_report ON insight_report.report_id = ranking_report.id
          LEFT JOIN
      insight ON insight_report.insight_id = insight.id
  WHERE
      ranking_report.is_active = TRUE
          AND insight.is_active = TRUE
          AND ranking_report.id = :data
          AND (insight.sensitivity = '1' OR insight.sensitivity = '3')
  ORDER BY insight.created_date DESC`
    return sequelize.query(query, { replacements: { data: data }, type: sequelize.QueryTypes.SELECT })
      .then(data => {
        resolve(data);
      })
      .catch(err => {
        reject(err);
      });
  })
}

export function getInsightByActivityId(activityId, clientId, currentUserData) {
  //var query = '';
  //var clientIds = [];
  // if (currentUserData.role == config.role.spotlightAdmin) {
  //   query = `SELECT
  //     insight.id, insight.sentiment, insight.desc, insight.sensitivity, insight.type
  //   FROM
  //       activity
  //           LEFT JOIN
  //       insight_activity ON insight_activity.activity_id = activity.id
  //           LEFT JOIN
  //       insight ON insight_activity.insight_id = insight.id
  //   WHERE
  //       insight.is_active = TRUE
  //           AND activity.id = :data
  //   ORDER BY insight.created_date DESC`
  // } else {
  //   clientIds = currentUserData.clientIds.split(',');

  //   query = `
  //     SELECT insight.id, insight.sentiment, insight.desc, insight.sensitivity, insight.type
  //     FROM activity
  //         LEFT JOIN insight_activity ON insight_activity.activity_id = activity.id
  //         LEFT JOIN insight ON insight_activity.insight_id = insight.id
  //         LEFT JOIN insight_client ON insight.id = insight_client.insight_id
  //     WHERE
  //         insight.is_active = TRUE
  //             AND activity.id = :data
  //             AND (insight.sensitivity = '1' OR insight.sensitivity = '3')
  //             AND insight_client.client_id IN (:clientIds)
  //     GROUP BY insight.id
  //     ORDER BY insight.created_date DESC`
  // }
  // return sequelize.query(query, { replacements: { data: data, clientIds: clientIds }, type: sequelize.QueryTypes.SELECT })
  //   .then(data => {
  //     ListInsightForAnalyst
  //     resolve(data);
  //   })
  //   .catch(err => {
  //     reject(err);
  //   });

  let role = currentUserData.role;
  let query = {};
  query.include = [{
    model: InsightActivity,
    as: 'InsightActivity',
    where: {
      activity_id: activityId
    },
    required: true
  },
  {
    model: InsightClientStatus,
    as: 'InsightClientStatus',
    required: false,
  }, {
    model: Client,
    as: 'Clients',
    required: false
  }
  ]

  query.order = [['created_date', 'DESC']];

  switch (role) {
    case config.role.spotlightAdmin:
      break;
    default:
      query.where = {
        sensitivity: { $ne: config.insightSensitivity[1].value }
      }

      query.include[1].where = {
        publish: true,
        client_id: clientId
      }

      query.include[1].required = true
      break;
  }

  return new Promise((resolve, reject) => {
    return Insight.findAll(query)
      .then((data) => {
        resolve(ListInsightForAnalyst(data, clientId, role));
      })
      .catch(err => {
        reject(err)
      });
  });
}

export function getInsightByActivityIdClientMode(data) {
  return new Promise((resolve, reject) => {
    var query = `SELECT
    insight.id, insight.sentiment, insight.desc, insight.sensitivity, insight.type
  FROM
      activity
          LEFT JOIN
      insight_activity ON insight_activity.activity_id = activity.id
          LEFT JOIN
      insight ON insight_activity.insight_id = insight.id
  WHERE
      insight.is_active = TRUE
          AND activity.id = :data
          AND (insight.sensitivity = '1' OR insight.sensitivity = '3')
  ORDER BY insight.created_date DESC`
    return sequelize.query(query, { replacements: { data: data }, type: sequelize.QueryTypes.SELECT })
      .then(data => {
        resolve(data);
      })
      .catch(err => {
        reject(err);
      });
  })
}

export function getInsightByCategoryId(data) {
  return new Promise((resolve, reject) => {
    var query = `SELECT
    insight.id, insight.sentiment, insight.desc, insight.sensitivity, insight.type, insight.updated_date
FROM
    research
        LEFT JOIN
    insight_category ON insight_category.category_id = research.id
        LEFT JOIN
    insight ON insight_category.insight_id = insight.id
WHERE
    research.is_active = TRUE
        AND insight.is_active = TRUE
        AND research.id = '${data}'
        ORDER BY insight.created_date DESC`
    return sequelize.query(query, { type: sequelize.QueryTypes.SELECT })
      .then(data => {
        resolve(data);
      })
      .catch(err => {
        reject(err);
      });
  })
}

export function getInsightByEventId(eventId, currentUserData) {
  return new Promise((resolve, reject) => {
    var query;
    var clientIds = [];

    if (currentUserData.role == config.role.spotlightAdmin) {
      query = `SELECT
        insight.id,
        insight.sentiment,
        insight.desc,
        insight.sensitivity,
        insight.type,
        insight.updated_date
    FROM
        event
        LEFT JOIN insight_event ON insight_event.event_id = event.id
        LEFT JOIN insight ON insight_event.insight_id = insight.id
    WHERE
        insight.is_active = TRUE
        AND event.id = :eventId
    ORDER BY insight.created_date DESC`;
    } else {
      clientIds = currentUserData.clientIds.split(',');
      clientIds.length === 0 ? clientIds = [''] : {};
      query = `SELECT
        insight.id,
        insight.sentiment,
        insight.desc,
        insight.sensitivity,
        insight.type
      FROM
        event
        LEFT JOIN insight_event ON insight_event.event_id = event.id
        LEFT JOIN insight ON insight_event.insight_id = insight.id
        LEFT JOIN insight_client ON insight.id = insight_client.insight_id
      WHERE
          insight.is_active = TRUE
              AND event.id = :eventId
              AND insight_client.client_id IN (:clientIds)
      GROUP BY insight.id
      ORDER BY insight.created_date DESC`
    }
    return sequelize.query(query, {
      replacements: { eventId: eventId, clientIds: clientIds },
      type: sequelize.QueryTypes.SELECT
    })
      .then(data => {
        resolve(data);
      })
      .catch(err => {
        reject(err);
      });
  })
}

export function updateInsightType() {
  return new Promise((resolve, reject) => {
    return Insight.findAll({
      attributes: ['id', 'type'],
      where: {
        type: 4
      }
    })
      .then(data => {
        var listFunc = [];
        data.forEach(insight => {
          listFunc.push(Insight.update({
            type: 1
          },
            {
              where: {
                id: insight.id
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

export function getInsightByAnalystId(data, currentUserData) {
  return new Promise((resolve, reject) => {
    var query;
    var clientIds = [];

    if (currentUserData.role == config.role.spotlightAdmin) {
      query = `SELECT
        insight.id,
        insight.sentiment,
        insight.desc,
        insight.sensitivity,
        insight.type
    FROM
        analyst
        LEFT JOIN insight_analyst ON insight_analyst.analyst_id = analyst.id
        LEFT JOIN insight ON insight_analyst.insight_id = insight.id
    WHERE
        insight.is_active = TRUE
        AND analyst.id = :analystId
    ORDER BY insight.created_date DESC`;
    } else {
      clientIds = currentUserData.clientIds.split(',');
      query = `SELECT
        insight.id,
        insight.sentiment,
        insight.desc,
        insight.sensitivity,
        insight.type,
        insight_client_status.publish,
        insight_client_status.star
      FROM
        analyst
        LEFT JOIN insight_analyst ON insight_analyst.analyst_id = analyst.id
        LEFT JOIN insight ON insight_analyst.insight_id = insight.id
        LEFT JOIN insight_client_status ON insight.id = insight_client_status.insight_id
      WHERE
          insight.is_active = TRUE
              AND analyst.id = :analystId
              AND insight_client_status.client_id IN (:clientIds)
              AND insight_client_status.publish = 1
              AND insight.sensitivity <> '2'
      GROUP BY insight.id
      ORDER BY insight.created_date DESC`
    }
    return sequelize.query(query, { replacements: { analystId: data, clientIds: clientIds }, type: sequelize.QueryTypes.SELECT })
      .then(data => {
        resolve(data);
      })
      .catch(err => {
        reject(err);
      });
  })
}

export function getInsightByAnalystIdClientMode(data) {
  return new Promise((resolve, reject) => {
    var query = `SELECT
    insight.id, insight.sentiment, insight.desc, insight.sensitivity, insight.type
  FROM
      analyst
          LEFT JOIN
      insight_analyst ON insight_analyst.analyst_id = analyst.id
          LEFT JOIN
      insight ON insight_analyst.insight_id = insight.id
  WHERE
      insight.is_active = TRUE
          AND analyst.id = :data
          AND (insight.sensitivity = '1' OR insight.sensitivity = '3')
  ORDER BY insight.created_date DESC`
    return sequelize.query(query, { replacements: { data: data }, type: sequelize.QueryTypes.SELECT })
      .then(data => {
        resolve(data);
      })
      .catch(err => {
        reject(err);
      });
  })
}


export function getInsightByClientId(clientId) {
  let query = {};
  query.include = [{
    model: InsightClient,
    as: 'InsightClient',
    where: { client_id: clientId },
    required: true
  },
  {
    model: InsightClientStatus,
    as: 'InsightClientStatus',
    where: { client_id: clientId },
    required: true
  }]
  query.order = [['created_date', 'DESC']];

  return new Promise((resolve, reject) => {
    return Insight.findAll(query)
      .then((data) => {
        resolve(data);
      })
      .catch(err => {
        console.log(err);
        reject(err)
      });
  });
}

export function getInsightByClientIdClientMode(data) {
  return new Promise((resolve, reject) => {
    var query = `SELECT
    insight.id, insight.sentiment, insight.desc, insight.sensitivity, insight.type
  FROM
  client
          LEFT JOIN
      insight_client ON insight_client.client_id = client.id
          LEFT JOIN
      insight ON insight_client.insight_id = insight.id
  WHERE
      insight.is_active = TRUE
          AND client.id = :data
          AND (insight.sensitivity = '1' OR insight.sensitivity = '3')
  ORDER BY insight.created_date DESC`
    return sequelize.query(query, { replacements: { data: data }, type: sequelize.QueryTypes.SELECT })
      .then(data => {
        resolve(data);
      })
      .catch(err => {
        reject(err);
      });
  })
}


export function updateInsightStatus(insight) {
  return new Promise((resolve, reject) => {

    InsightClientStatus.findAll({
      attributes: ['id'],
      where: {
        insight_id: insight.insight_id,
        client_id: insight.client_id
      }
    })
      .then(data => {
        if (data.length > 0) {
          let _publish = insight.publish ? 1 : 0;
          return InsightClientStatus.update({
            publish: _publish,
            star: insight.star
          },
            {
              where: {
                insight_id: insight.insight_id,
                client_id: insight.client_id
              }
            })
            .then(data => {
              resolve(data)
            })
            .catch(err => {
              console.log(err);
              reject(err);
            });
        } else {
          let _publish = insight.publish ? 1 : 0;
          return InsightClientStatus.create({
            id: uuid.v1(),
            publish: _publish,
            star: insight.star,
            insight_id: insight.insight_id,
            client_id: insight.client_id
          })
            .then(data => {
              resolve(data)
            })
            .catch(err => {
              console.log(err);
              reject(err);
            });
        }

      })
  })
}

export function getInsightByReportId(data, client) {
  let clientIds = data.clientIds;
  let role = data.role;
  let reportId = data.reportId;
  let selectedClient = client;
  let query = {};
  query.include = [{
    model: InsightReport,
    as: 'InsightReport',
    where: {
      report_id: reportId
    },
    required: true
  },
  {
    model: InsightClientStatus,
    as: 'InsightClientStatus',
    required: false,
  }, {
    model: Client,
    as: 'Clients',
    required: false
  }
  ]

  query.order = [['created_date', 'DESC']];
  //query.group = ['id']

  switch (role) {
    case config.role.spotlightAdmin:
      break;
    default:
      query.where = {
        sensitivity: { $ne: config.insightSensitivity[1].value }
      }

      query.include[1].where = {
        publish: true,
        client_id: selectedClient
      }

      query.include[1].required = true
      break;
  }

  return new Promise((resolve, reject) => {
    return Insight.findAll(query)
      .then((data) => {
        resolve(ListInsightForAnalyst(data, selectedClient, role));
      })
      .catch(err => {
        reject(err)
      });
  });
}

export function getInsightByMarketId(categoryIds) {
  let _categoryIds = Array.isArray(categoryIds) ? categoryIds : [categoryIds];
  let query = {};
  query.include = [{
    model: Client,
    as: 'Clients',
    required: false,
  }, {
    model: InsightCategory,
    as: 'InsightCategory',
    attributes: [],
    where: {
      category_id: { $in: _categoryIds }
    },
    required: true
  }]
  query.order = [['created_date', 'DESC']];

  return new Promise((resolve, reject) => {
    return Insight.findAll(query)
      .then((data) => {
        resolve(data);
      })
      .catch(err => {
        console.log(err);
        reject(err)
      });
  });
}


export function deleteInsightRelationship(insightId, objectId, Type) {
  return new Promise(async (resolve, reject) => {
    var listFuncs = [];
    // listFuncs.push(InsightClient.destroy({ where: { insight_id: insightId } }));
    // listFuncs.push(InsightAnalyst.destroy({ where: { insight_id: insightId } }));
    // listFuncs.push(InsightActivity.destroy({ where: { insight_id: insightId } }));
    // listFuncs.push(InsightReport.destroy({ where: { insight_id: insightId } }));
    // listFuncs.push(InsightEvent.destroy({ where: { insight_id: insightId } }));
    // listFuncs.push(InsightFirm.destroy({ where: { insight_id: insightId } }));
    switch (Type) {
      case config.insightObjectType.Category:
        listFuncs.push(InsightCategory.destroy({ where: { insight_id: insightId, category_id: objectId } }));
        break;
      case config.insightObjectType.Market:
        let categories = await MarketCategory.findAll({ where: { market_id: objectId }, attributes: ['category_id'] });
        let categoryIds = categories.map(x => {
          return x.category_id
        });
        listFuncs.push(InsightCategory.destroy({ where: { insight_id: insightId, category_id: { $in: categoryIds } } }))
        break;
      default:
        break;
    }
    return Promise.all(listFuncs)
      .then(rs => {
        resolve(rs);
      })
      .catch(err => {
        console.log(err);
        reject(err);
      });
  });
}

export function getInsightByCollectionId(collectionId, currentUserData) {
  return new Promise((resolve, reject) => {
    return Collection.findOne({
      where: { id: collectionId },
      include: [{
        model: Client,
        as: 'Clients',
        attributes: ['id'],
        required: false
      }]
    }).then((data) => {
      //return data;
      let clientIds = data.Clients ? data.Clients.map(client => {
        return client.id
      }) : [];
      let query = {};
      query.include = [{
        model: InsightClient,
        as: 'InsightClient',
        where: { client_id: { $in: clientIds } },
        required: true
      },
      {
        model: InsightClientStatus,
        as: 'InsightClientStatus',
        where: { client_id: { $in: clientIds } },
        required: false
      }]
      query.where = { is_active: true };
      query.order = [['created_date', 'DESC']];

      switch (currentUserData.role) {
        case config.role.spotlightAdmin:
          break;
        default:
          query.include[0].where = {
            client_id: { $in: clientIds }
          }
          query.where = {
            sensitivity: { $ne: config.insightSensitivity[1].value },
            is_active: true
          }
          break;
      }
      return Insight.findAll(query);

    })
      .then((data) => {
        resolve(ListInsightForCollection(data, currentUserData.role));
      })
      .catch(function (err) {
        reject(err);
      })
  })
}

export function convertTextFromEtherpadToCkeditorForInsight() {
  return new Promise((resolve, reject) => {
    let query =
      `UPDATE insight 
      SET insight.desc = REPLACE(REPLACE(insight.desc, '<!DOCTYPE HTML><html><body>', '<p>'), '</body></html>', '</p>')
      WHERE insight.desc like '<!DOCTYPE HTML><html><body>%</body></html>';`;

    return sequelize.query(query, { type: sequelize.QueryTypes.UPDATE })
      .then(data => {
        resolve(data);
      })
      .catch(err => {
        reject(err)
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

    return sequelize.query(query, { replacements: { clientIds: clientIds }, type: sequelize.QueryTypes.SELECT })
      .then(data => {
        resolve(data);
      })
      .catch(err => {
        reject(err);
      });
  });
}

export function getPublisherOfInsight(insightId) {
  let query = {};
  query.include = [{
    model: InsightClientStatus,
    as: 'InsightClientStatus',
    required: false,
    include: [{
      model: Client,
      as: 'Client',
      required: false
    }],
    where: { publish: true }
  }]
  query.where = { id: insightId };
  query.order = [['created_date', 'DESC']];

  return new Promise((resolve, reject) => {
    return Insight.findOne(query)
      .then((data) => {
        //var dataReturn = ListInsightForAnalyst(data, selectedClient, role);
        resolve(data);
      })
      .catch(err => {
        reject(err)
      });
  });
}