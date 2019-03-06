'use strict';
import {
  sequelize,
  Research,
  Market,
  MarketCategory,
  Firm,
  Media,
  FirmResearch,
  Analyst,
  AnalystResearchCategories,
  RankingReport,
  RankingReportResearch,
  Client,
  ClientResearchCategories,
  Groups,
  InsightCategory,
  Insight,
  Items,
  AnalystHistory,
  EventCategory,
  Event
} from '../../sqldb';
var Promise = require('bluebird');
import { ListMarketDto } from '../dtos/marketDto'
import config from '../../config/environment/shared';
import * as changeLogHelper from '../../components/helper/change-log-helper';
import _ from 'lodash';

export function getListMarket() {
  return new Promise((resolve, reject) => {
    let query = {};
    query.include = [{
      model: Research,
      as: 'Researchs',
      attributes: ['id', 'desc'],
      where: { is_active: true },
      required: false
    }];

    return Market.findAll(query)
      .then(data => {
        resolve(ListMarketDto(data));
      })
      .catch(error => {
        console.log(error);
        reject(error);
      })

  })
}

var executeUpdateGroup = function (group, market_id, template_id) {
  return new Promise(async (resolve, reject) => {
    let checkUpdateGroupItem = group.market_id != null;
    let checGroupkAddEdit = group.id != null;
    group.visibility = group.visibility != '0';
    const promis = await new Promise(async (resolve, reject) => {
      if (checGroupkAddEdit) {
        if (checkUpdateGroupItem) {
          resolve(group.id);
          await Groups.update(group, { where: { id: group.id, market_id: group.market_id } });
        }
      } else {
        group.template_id = template_id;
        group.market_id = market_id;
        await Groups.max('index', {
          where: { template_id, is_active: true }
        });
        var group_new = await Groups.create(group);
        resolve(group_new.id);
      }
    }).then(id => {
      if (checGroupkAddEdit && !checkUpdateGroupItem) {
        return;
      }
      var arrayPromise = [];
      var group_id = id;
      for (let i = 0; i < group.Items.length; i++) {
        let item = group.Items[i];
        item.is_active = item.is_active != '0';
        item.item_type = item.item_type != '0';
        item.group_id = group_id;
        item.last_update = new Date();

        if (item.id) {
          arrayPromise.push(Items.update(item, { where: { id: item.id } }));
        } else {
          arrayPromise.push(Items.create(item));
        }
      }
      return Promise.all(arrayPromise).then(res => {
        resolve(res);
      })
        .catch(err => {
          reject(err);
        });
    });
  });
};

export function addMarket(data) {
  let categories = Array.isArray(data.selectedCategories) ? data.selectedCategories : [data.selectedCategories];
  let groups = data.group;
  let arrayPromise = [];
  return new Promise((resolve, reject) => {
    var market = {
      name: data.name,
      created_at: new Date(),
      updated_at: new Date()
    };
    Market.create(market).then(rs => {
      categories.forEach(category => {
        let marketCategory = {
          market_id: rs.id,
          category_id: category.id
        }
        arrayPromise.push(MarketCategory.create(marketCategory));
      })
      groups.forEach(async group => {
        await executeUpdateGroup(group, rs.id, data.templateId);
      });
      return Promise.all(arrayPromise);
    })
      .then(data => {
        resolve(data);
      })
      .catch(error => {
        console.log(error)
        reject(error);
      })
  })
}

let addLog = function (newObject, oldObject, refColumns, refColumnNames, objectSaveLog) {
  let listModelChange = changeLogHelper.getChangeLog(refColumns, refColumnNames, newObject, oldObject, objectSaveLog);
  changeLogHelper.createActivityLog(listModelChange);
};

export function editMarket(data) {
  var newMarket = data.market;
  var oldMarket = data.oldMarket;
  var categories = Array.isArray(newMarket.selectedCategories) ? newMarket.selectedCategories : [newMarket.selectedCategories];
  var groups = data.group;
  var objectSaveLog = {
    user: data.user,
    templatePage: config.pageTemplate.MARKET_PROFILE,
    section: config.section.MARKET_DETAILS,
    id: newMarket.id,
    name: newMarket.name
  }
  let arrayPromise = [];
  return new Promise((resolve, reject) => {
    var market = {
      name: newMarket.name,
      updated_at: new Date()
    };
    Market.update(market, {
      where: {
        id: newMarket.id
      }
    })
      .then(res => {
        return MarketCategory.destroy({ where: { market_id: newMarket.id } });
      })
      .then(res => {
        categories.forEach(category => {
          let marketCategory = {
            market_id: newMarket.id,
            category_id: category.id
          }
          arrayPromise.push(MarketCategory.create(marketCategory));
        })
        groups.forEach(async group => {
          await executeUpdateGroup(group, newMarket.id, data.templateId);
        });
        return Promise.all(arrayPromise);
      })
      .then(data => {
        let refColumns = [['name']];
        let refColumnNames = ['Name'];
        newMarket.Research = newMarket.selectedCategories;
        oldMarket.Research = oldMarket.selectedCategories;
        delete newMarket.selectedCategories;
        delete oldMarket.selectedCategories;
        addLog(newMarket, oldMarket, refColumns, refColumnNames, objectSaveLog);
        resolve(data);
      })
      .catch(error => {
        console.log(error)
        reject(error);
      })
  })
}

export function getMarketById(id) {
  return new Promise((resolve, reject) => {
    let query = {};
    query.include = [{
      model: Research,
      as: 'Researchs',
      attributes: ['id', 'desc']
    }];
    query.where = {
      id: id
    }
    return Market.findOne(query)
      .then(data => {
        resolve(data);
      })
      .catch(error => {
        reject(error);
      })
  })
}

export function deleteMarket(_arrayIds) {
  return new Promise((resolve, reject) => {
    let arrayIds = Array.isArray(_arrayIds) ? _arrayIds : [_arrayIds];
    let arrayPromise = [];
    return sequelize.transaction(function (t) {
      arrayIds.forEach(id => {
        arrayPromise.push(MarketCategory.destroy({ where: { market_id: id } }, { transaction: t }));
        arrayPromise.push(Market.destroy({ where: { id: id } }, { transaction: t }));
      })
      return Promise.all(arrayPromise)
        .then(data => {
          resolve(data)
        })
        .catch(error => {
          reject(error);
        });
    })
  })
}

export function getFirmForMarket(categoryIds) {
  let _categoryIds = Array.isArray(categoryIds) ? categoryIds : [categoryIds];
  return new Promise((resolve, reject) => {
    let query = {};
    query.include = [{
      model: FirmResearch,
      attributes: [],
      where: { research_id: { $in: _categoryIds } },
      required: true
    }, {
      model: Media,
      as: 'Media',
      attributes: ['media_id'],
      required: false
    }];
    query.where = {
      is_active: true
    }
    return Firm.findAll(query)
      .then(data => {
        resolve(data);
      })
      .catch(error => {
        reject(error);
      })
  })
}

export function getAnalystForMarket(categoryIds) {
  let _categoryIds = Array.isArray(categoryIds) ? categoryIds : [categoryIds];

  return new Promise((resolve, reject) => {
    let query = {};
    query.include = [{
      model: AnalystResearchCategories,
      attributes: [],
      where: { research_id: { $in: _categoryIds }, is_active: true },
      required: true
    }, {
      model: Media,
      as: 'Media',
      attributes: ['media_id'],
      required: false
    }];
    query.where = {
      is_active: true
    }
    return Analyst.findAll(query)
      .then(data => {
        resolve(data);
      })
      .catch(error => {
        console.log(error)
        reject(error);
      })
  })
}

export function getReportForMarket(categoryIds) {
  let _categoryIds = Array.isArray(categoryIds) ? categoryIds : [categoryIds];
  return new Promise((resolve, reject) => {
    let query = {};
    query.include = [{
      model: RankingReportResearch,
      attributes: [],
      where: { research_id: { $in: _categoryIds } },
      required: true
    }];
    query.where = {
      is_active: true
    }
    return RankingReport.findAll(query)
      .then(data => {
        resolve(data);
      })
      .catch(error => {
        console.log(error)
        reject(error);
      })
  })
}

export function getClientForMarket(categoryIds) {
  let _categoryIds = Array.isArray(categoryIds) ? categoryIds : [categoryIds];
  return new Promise((resolve, reject) => {
    let query = {};
    query.include = [{
      model: ClientResearchCategories,
      attributes: [],
      where: { research_id: { $in: _categoryIds }, is_active: true },
      required: true
    }, {
      model: Media,
      as: 'Media',
      attributes: ['media_id'],
      required: false
    }];
    query.where = {
      is_active: true
    }
    return Client.findAll(query)
      .then(data => {
        resolve(data);
      })
      .catch(error => {
        console.log(error)
        reject(error);
      })
  })
}

export function getAnalystByMarketId(marketId) {
  return new Promise(async (resolve, reject) => {
    let categories = await MarketCategory.findAll({ where: { market_id: marketId }, attributes: ['category_id'] });
    let categoryIds = categories.map(x => { return x.category_id });

    let query = {};
    query.include = [{
      model: AnalystResearchCategories,
      attributes: [],
      where: { research_id: { $in: categoryIds }, is_active: true },
      include: [{
        model: Research,
        where: { is_active: true },
        required: true
      }],
      require: true
    }, {
      model: AnalystHistory,
      as: 'AnalystHistory',
      include: [{
        model: Firm,
        where: { is_active: true },
        required: false
      }],
      where: { is_active_record: true },
      required: true
    }, {
      model: Research,
      where: { is_active: true },
      required: false
    }, {
      model: Client,
      as: 'Clients',
      where: { is_active: true },
      required: false
    }]
    query.order = [['name', 'ASC']];
    return Analyst.findAll(query)
      .then(data => {
        resolve(data);
      })
      .catch(error => {
        console.log(error)
        reject(error);
      })
  })
}

export function getReportByMarketId(marketId) {
  return new Promise(async (resolve, reject) => {
    let categories = await MarketCategory.findAll({ where: { market_id: marketId }, attributes: ['category_id'] });
    let categoryIds = categories.map(x => { return x.category_id });

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
      group by id) as report;`;

    return sequelize.query(query, { type: sequelize.QueryTypes.SELECT })
      .then(data => {
        let result = _.filter(data, (item) => {
          for (let i = 0; i < categoryIds.length; i++) {
            if (item.all_research_id && item.all_research_id.indexOf(categoryIds[i]) > -1) {
              return true;
            }
          }
          return false;
        });
        resolve(result);
      })
      .catch((err) => {
        console.log(err);
        reject(err);
      });
  });
}

export function getEventByMarketId(marketId) {
  return new Promise(async (resolve, reject) => {
    let queryResearch = `SELECT 
                          ec.event_id
                          FROM
                          market_category AS mc
                              INNER JOIN
                          event_category as ec on ec.research_id = mc.category_id
                          WHERE
                          mc.market_id = :marketId
                          GROUP BY ec.event_id;`
    let events = await sequelize.query(queryResearch, { replacements: { marketId: marketId }, type: sequelize.QueryTypes.SELECT })
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
    query.where = { id: { $in: eventIds } }
    return Event.findAll(query)
      .then(data => {
        resolve(data);
      })
      .catch(error => {
        reject(error);
      })

  })
}

export function getListInsightByMarketId(marketId) {
  return new Promise(async (resolve, reject) => {
    let categories = await MarketCategory.findAll({ where: { market_id: marketId }, attributes: ['category_id'] });
    let categoryIds = categories.map(x => { return x.category_id });
    
    let insights = await InsightCategory.findAll({ where: { category_id: { $in: categoryIds} } });
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