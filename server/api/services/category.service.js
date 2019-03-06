'use strict';
import {
  sequelize,
  Firm,
  Research,
  FirmResearch,
  Analyst,
  AnalystHistory,
  Client,
  AnalystResearchCategories,
  EventCategory,
  Event,
  Insight,
  InsightCategory
} from '../../sqldb';

var Promise = require('bluebird');

import log4Js from 'log4js';
log4Js.configure({
  appenders: [
    { type: 'file', filename: 'logs/category-controller.log', category: 'category-controller' }
  ]
});
import _ from 'lodash';

export function getResearchCategories(filterObject) {
  return new Promise((resolve, reject) => {
    let allCategoryQuery = `SELECT 
    r.id, r.desc
FROM
    research r
WHERE
    is_active = 1
ORDER BY r.desc ASC`;

    let analystTotalQuery = `SELECT 
    a.id, COUNT(b.id) AS analystTotal
FROM
    research AS a
        INNER JOIN
    analyst_research_categories AS b ON a.id = b.research_id
        AND b.is_active = TRUE
        INNER JOIN
    analyst AS c ON c.id = b.analyst_id
        AND c.is_active = TRUE
WHERE
    a.is_active = TRUE
GROUP BY a.id`;

    let clientTotalQuery = `SELECT 
    c.id, COUNT(d.id) AS clientTotal
FROM
    research AS c
        LEFT JOIN
    client_research_category AS d ON c.id = d.research_id
        AND d.is_active = TRUE
WHERE
    c.is_active = TRUE
GROUP BY c.id`

    return Promise.all([sequelize.query(allCategoryQuery, { type: sequelize.QueryTypes.SELECT }),
    sequelize.query(analystTotalQuery, { type: sequelize.QueryTypes.SELECT }),
    sequelize.query(clientTotalQuery, { type: sequelize.QueryTypes.SELECT })])
      .spread((allCategoryData, analystTotalData, clientTotalData) => {
        allCategoryData = _.map(allCategoryData, allCategoryItem => {
          let matchedAnalyst =  _.find(analystTotalData, { 'id': allCategoryItem.id })
          allCategoryItem.analystTotal = matchedAnalyst? matchedAnalyst.analystTotal: 0;
          let matchedClient = _.find(clientTotalData, { 'id': allCategoryItem.id });
          allCategoryItem.clientTotal = matchedClient? matchedClient.clientTotal: 0;
          return allCategoryItem;
        });
        resolve(allCategoryData);
      }).catch(err => {
        reject(err);
      });    
  });
}

export function getCategoryById(categoryId) {
  return new Promise((resolve, reject) => {
    var query = {};
    query.where = { id: categoryId, is_active: true };
    query.include = [{
      model: Firm,
      attributes: ['id', 'name'],
      order: 'name ASC'
    }];

    return Research.findOne(query)
      .then(data => {
        resolve(data);
      })
      .catch(err => {
        console.log(err);
        reject(err);
      });
  });
}

export function addCategory(category, firms) {
  return new Promise((resolve, reject) => {
    category.is_active = true;
    category.last_update = new Date();
    return sequelize.transaction(function (t) {
      return Research.find({
        where: {
          id: category.id == undefined ? { $ne: null } : { $ne: category.id },
          is_active: true,
          desc: category.desc
        }
      })
        .then(rs => {
          if (rs == null) {
            return Research.create(category, { transaction: t });
          } else {
            throw { message: 'This category was existed' };
          }
        })
        .then(rs => {
          var categoryId = rs.dataValues.id;
          var listFunc = [];
          firms.forEach(firm => {
            listFunc.push(FirmResearch.findOrCreate({
              transaction: t,
              defaults: true,
              where: { research_id: categoryId, firm_id: firm.id }
            }));
          });
          return Promise.all(listFunc);
        })
        .then(rs => {
          resolve(rs);
        });
    })
      .catch(err => {
        console.log(err);
        reject(err);
      });
  });
}

export function updateCategory(category, firms) {
  return new Promise((resolve, reject) => {
    category.is_active = true;
    category.last_update = new Date();
    return sequelize.transaction(function (t) {
      return Research.find({
        where: {
          id: category.id == undefined ? { $ne: null } : { $ne: category.id },
          is_active: true,
          desc: category.desc
        }
      })
        .then(rs => {
          if (rs == null) {
            return Research.update(category, { where: { id: category.id }, transaction: t });
          } else {
            throw { message: 'This category was existed' };
          }
        })
        .then(rs => {
          return FirmResearch.destroy({ transaction: t, where: { research_id: category.id } });
        })
        .then(rs => {
          var listFunc = [];
          firms.forEach(firm => {
            listFunc.push(FirmResearch.findOrCreate({
              transaction: t,
              defaults: true,
              where: { research_id: category.id, firm_id: firm.id }
            }));
          });
          return Promise.all(listFunc);
        })
        .then(rs => {
          resolve(rs);
        });
    })
      .catch(err => {
        console.log(err);
        reject(err);
      });
  });
}


export function deleteCategory(categoryIds) {
  return new Promise((resolve, reject) => {
    return sequelize.transaction(function (t) {
      var listFunc = [];
      categoryIds.forEach(id => {
        listFunc.push(FirmResearch.destroy({ transaction: t, where: { research_id: id } }));
      });
      return Promise.all(listFunc).then(() => {
        var listFunc2 = [];
        categoryIds.forEach(id => {
          listFunc2.push(Research.update({ is_active: false }, { transaction: t, where: { id } }));
        });
        return Promise.all(listFunc2);
      })
        .then(rs => {
          resolve(rs);
        });
    }).catch(err => {
      console.log(err);
      reject(err);
    });
  });
}

export function getFirmByResearchId(researchId) {
  return new Promise((resolve, reject) => {
    var query = `SELECT 
    a.id, a.desc, c.name, c.id
FROM
    research AS a
        INNER JOIN
    firm_research AS b ON a.id = b.research_id
        INNER JOIN
    firm AS c ON b.firm_id = c.id AND c.is_active = TRUE
WHERE
    a.id = ?
        AND a.is_active = TRUE;`;

    return sequelize.query(query, { replacements: [researchId], type: sequelize.QueryTypes.SELECT })
      .then(data => {
        resolve(data);
      })
      .catch((err) => {
        reject(err);
      });
  });
}

export function getAnalystHistoryByResearchId(researchId) {
  return new Promise((resolve, reject) => {
    var query = {};
    query.include = [{
      model: AnalystResearchCategories,
      attributes: [],
      where: { research_id: researchId, is_active: true },
      include: [{
        model: Research,
        where: { is_active: true },
        required: true
      }],
      required: false
    }, {
      model: AnalystHistory,
      as: 'AnalystHistory',
      include: [{
        model: Firm,
        where: { is_active: true },
        required: false
      }],
      where: { is_active_record: true },
      required: false
    }, {
      model: Research,
      where: { is_active: true },
      required: false
    }, {
      model: Client,
      as: 'Clients',
      required: false
    }]
    query.order = [['name', 'ASC']];
    return Analyst.findAll(query)
      .then(data => {
        resolve(data);
      })
      .catch(err => {
        console.log(err);
        reject(err);
      });
  })
}

export function getAnalystByResearchId(researchId) {
  return new Promise((resolve, reject) => {
    var query = `SELECT 
    a.id, a.desc, c.name, e.media_data, c.id
FROM
    research AS a
        INNER JOIN
    analyst_research_categories AS b ON a.id = b.research_id
        AND b.is_active = TRUE
        INNER JOIN
    analyst AS c ON b.analyst_id = c.id
        LEFT JOIN
    analyst_media AS d ON c.id = d.analyst_id
        AND d.is_active = TRUE
        LEFT JOIN
    media AS e ON d.media_id = e.media_id
        AND e.is_active = TRUE
WHERE
    a.id = ?
        AND a.is_active = TRUE;`;

    return sequelize.query(query, { replacements: [researchId], type: sequelize.QueryTypes.SELECT })
      .then(data => {
        resolve(data);
      })
      .catch((err) => {
        reject(err);
      });
  });
}

export function getClientByResearchId(researchId) {
  return new Promise((resolve, reject) => {
    var query = `SELECT 
    a.id, a.desc, c.name, c.id, e.media_data
FROM
    research AS a
        INNER JOIN
    client_research_category AS b ON a.id = b.research_id
        AND b.is_active = TRUE
        INNER JOIN
    client AS c ON b.client_id = c.id
        LEFT JOIN
    client_media AS d ON c.id = d.client_id
        AND d.is_active = TRUE
        LEFT JOIN
    media AS e ON d.media_id = e.media_id
        AND e.is_active = TRUE
    
WHERE
    a.id = ?
        AND a.is_active = TRUE;`;

    return sequelize.query(query, { replacements: [researchId], type: sequelize.QueryTypes.SELECT })
      .then(data => {
        resolve(data);
      })
      .catch((err) => {
        reject(err);
      });
  });
}

export function getReportByResearchId(researchId) {
  return new Promise((resolve, reject) => {
    var query = `SELECT 
    a.id, a.desc, c.name, c.id, c.nickname, c.major_report
FROM
    research AS a
        INNER JOIN
    ranking_report_research AS b ON a.id = b.research_id
        AND b.is_active = TRUE
        INNER JOIN
    ranking_report AS c ON b.ranking_report_id = c.id
        AND c.is_active = TRUE
WHERE
    a.id = ?
        AND a.is_active = TRUE;`;

    return sequelize.query(query, { replacements: [researchId], type: sequelize.QueryTypes.SELECT })
      .then(data => {
        resolve(data);
      })
      .catch((err) => {
        reject(err);
      });
  });
}


export function getEventByReseachId(categoryId) {
  return new Promise(async (resolve, reject) => {
    let events = await EventCategory.findAll({ where: { research_id: categoryId } });
    let eventIds = events.map(x => { return x.event_id });
    let query = {};
    query.include = [{
      model: Analyst,
      as: 'Analysts',
      where: { is_active: true },
      required: false
    }, {
      model: Client,
      as: 'Clients',
      required: false,
      where: { is_active: true }
    },
    {
      model: Research,
      as: 'Researchs',
      where: { is_active: true }
    }];
    query.where = { id: { $in: eventIds } };
    return Event.findAll(query)
      .then(data => {
        resolve(data);
      })
      .catch(error => {
        reject(error);
      })
  })
}

export function getReportTabByResearchId(researchId) {
  return new Promise((resolve, reject) => {
    var query = `
    select report.* from (SELECT a.*,f.name as firm_name
      ,GROUP_CONCAT(DISTINCT c.name ORDER BY c.name ASC SEPARATOR '!!!') as all_analyst_name
      ,GROUP_CONCAT(DISTINCT c.id ORDER BY c.name ASC SEPARATOR '!!!') as all_analyst_id
      ,GROUP_CONCAT(DISTINCT e.name ORDER BY e.name ASC SEPARATOR '!!!') as all_client_name
      ,GROUP_CONCAT(DISTINCT e.id ORDER BY e.name ASC SEPARATOR '!!!') as all_client_id
      ,GROUP_CONCAT(DISTINCT h.desc ORDER BY h.desc ASC SEPARATOR '!!!') as all_research_name
      ,GROUP_CONCAT(DISTINCT h.id ORDER BY h.desc ASC SEPARATOR '!!!') as all_research_id
      FROM ranking_report as a
      left join ranking_report_analyst as b on a.id = b.ranking_report_id and b.is_active = true
      left join client_ranking_report as d on a.id = d.ranking_report_id and d.is_active = true
      inner join ranking_report_research as g on a.id = g.ranking_report_id and g.is_active = true
      left join analyst as c on c.id = b.analyst_id and c.is_active = true
      left join client  as e on e.id = d.client_id and e.is_active = true
      left join research  as h on h.id = g.research_id and h.is_active = true
      left join firm as f on a.firm_id = f.id and f.is_active = true
      where a.is_active = true 
      group by id) as report where report.all_research_id like '%${researchId}%';`;

    return sequelize.query(query, { type: sequelize.QueryTypes.SELECT })
      .then(data => {
        resolve(data);
      })
      .catch((err) => {
        console.log(err);
        reject(err);
      });
  });
}

export function getListInsightByResearchId(researchId) {
  return new Promise(async (resolve, reject) => {
    let insights = await InsightCategory.findAll({ where: { category_id: researchId } });
    let insightIds = insights.map(x => { return x.insight_id });
    let query = {};
    query.include = [{
      model: Client,
      as: "Clients",
      where: { is_active: true },
      required: false
    },
    {
      model: Analyst,
      as: "Analysts",
      where: { is_active: true },
      required: false
    }]
    query.where = { id: { $in: insightIds } };
    query.order = [['updated_date', 'ASC']]
    return Insight.findAll(query)
      .then(data => {
        resolve(data);
      })
      .catch(error => {
        console.log(error);
        reject(error);
      })
  })
}

export function getListInsightByResearchIdTest(researchId) {
  return new Promise(async (resolve, reject) => {
   // let insights = await insightCategory.findAll({ where: { category_id: researchId } });
    //let insightIds = insights.map(x => { return x.insight_id });
    let query = {};
    query.include = [{
      model: Client,
      as: "Clients",
      where: { is_active: true },
      required: false
    },
    {
      model: Analyst,
      as: "Analysts",
      where: { is_active: true },
      required: false
    },{
      model: InsightCategory,
      as: "InsightCategory",
      where: { category_id : researchId },
      required: true
    }]
    // query.where = { id: { $in: insightIds } };
    query.order = [['updated_date', 'ASC']]
    return Insight.findAll(query)
      .then(data => {
        resolve(data);
      })
      .catch(error => {
        console.log(error);
        reject(error);
      })
  })
}