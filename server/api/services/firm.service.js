'use strict';
import {
  Media,
  Firm,
  sequelize,
  Analyst,
  Insight,
  Client,
  AnalystHistory,
  Research,
  InsightClient,
  InsightAnalyst,
  InsightFirm,
  ClientHistory,
  Event,
  EventFirm,
  RankingReport,
  FirmClient
} from '../../sqldb';

var Promise = require('bluebird');
import log4Js from 'log4js';
log4Js.configure({
  appenders: [
    { type: 'file', filename: 'logs/firm-controller.log', category: 'firm-controller' }
  ]
});

export function getResearchByFirmId(firmId) {
  return new Promise((resolve, reject) => {
    var query = `
SELECT 
    a.id, a.name, c.desc, b.research_id
FROM
    firm AS a
        INNER JOIN
    firm_research AS b ON a.id = b.firm_id 
        INNER JOIN
    research AS c ON b.research_id = c.id and c.is_active = true
WHERE
    a.id = '${firmId}' and a.is_active = true`;

    return sequelize.query(query, { type: sequelize.QueryTypes.SELECT })
      .then(data => {
        resolve(data);
      })
      .catch(err => {
        reject(err);
      });
  });
}

export function getAnalystByFirmId(firmId) {
  return new Promise((resolve, reject) => {
    var query = `
SELECT 
    a.id, c.name, e.media_id, b.analyst_id
FROM
    firm AS a
        INNER JOIN
    analyst_history AS b ON a.id = b.firm_id
        AND b.is_active_record = TRUE
        INNER JOIN
    analyst AS c ON b.analyst_id = c.id
        AND c.is_active = TRUE
        left join analyst_media as d on c.id = d.analyst_id and d.is_active = true
        left join media as e on e.media_id = d.media_id 
WHERE
    a.id = '${firmId}'
        AND c.is_active = TRUE;`;

    return sequelize.query(query, { type: sequelize.QueryTypes.SELECT })
      .then(data => {
        resolve(data);
      })
      .catch(err => {
        reject(err);
      });
  });
}

export function getAvatarByFirmId(media_id) {
  return new Promise((resolve, reject) => {
    return Media.findOne({
      where: {
        media_id: media_id
      }
    })
      .then(res => {
        resolve(res);
      })
      .catch(err => {
        reject(err);
      })
  })
}
export function getFirmById(firmId) {
  return new Promise((resolve, reject) => {
    var query = {};
    query.where = { id: firmId };
    query.include = [{
      model: Media,
      as: 'Media',
      required: false
    }];
    return Firm.findOne(query)
      .then(data => {
        resolve(data);
      })
      .catch(err => {
        reject(err);
      })
  })
}

export function getAllFirm() {
  return new Promise((resolve, reject) => {
    var query = {};
    query.attributes = ['id', 'name'];
    query.where = { is_active: true };
    return Firm.findAll(query)
      .then(data => {
        resolve(data);
      })
      .catch(err => {
        reject(err);
      })
  })
}

export function getInsightByFirmId(firmId) {
  return new Promise((resolve, reject) => {
    let query = {};
    query.where = { is_active: true };
    query.include = [{
      model: Firm,
      as: 'Firms',
      where: { is_active: true, id: firmId }
    }]
    return Insight.findAll(query)
      .then((data) => {
        resolve(data);
      })
      .catch(err => {
        console.log(err);
        reject(err);
      });
  });
}

export function getAnalystInfoByFirmId(firmId) {
  return new Promise((resolve, reject) => {
    var squery = {};
    squery.attributes = ['id', 'name', 'is_active'];
    squery.include = [{
      model: AnalystHistory,
      as: 'AnalystHistory',
      attributes: ['id', 'insert_date', 'title', 'team', 'city',
        'country', 'state', 'region', 'ad_owner'],
      where: { is_active_record: true },
      include: [{
        model: Firm,
        attributes: ['id', 'name'],
        where: { is_active: true, id: firmId }
      }]
    },
    {
      model: Research,
      attributes: ['desc']
    },
    {
      model: Client,
      as: 'Clients'
    }];
    //squery.where = { is_active: true }
    return Analyst.findAll(squery)
      .then(data => {
        resolve(data);
      })
      .catch(err => {
        console.log(err);
        reject(err);
      });
  })
}

export function getInsightTabByFirmId(firmId) {
  return new Promise((resolve, reject) => {
    let query = {};
    query.where = { is_active: true };
    query.include = [{
      model: InsightFirm,
      as: 'InsightFirm',
      required: true,
      where: { firm_id: firmId }
    }, {
      model: InsightAnalyst,
      as: 'InsightAnalyst',
      include: [{
        model: Analyst,
        required: false,
        where: { is_active: true }
      }]
    }, {
      model: InsightClient,
      as: 'InsightClient',
      include: [{
        model: Client,
        as: 'Client',
        required: false,
        where: { is_active: true }
      }]
    }]
    return Insight.findAll(query)
      .then((data) => {
        resolve(data);
      })
      .catch(err => {
        console.log(err);
        reject(err);
      });
  });
}

export function getClientByFirmId(firmId) {
  return new Promise((resolve, reject) => {
    var query = {};
    query.where = { is_active_record: true };
    query.include = [{
      model: Client,
      where: { is_active: true },
      include: [{
        model: Media,
        as: 'Media',
        attributes: ['media_id'],
        where: { is_active: true },
        order: ['created_date', 'DESC'],
        required: false
      }, {
        model: FirmClient,
        as: 'FirmClients',
        where: { firm_id: firmId }
      }]
    }];
    return ClientHistory.findAll(query)
      .then(data => {
        resolve(data);
      })
      .catch(err => {
        reject(err);
      })
  })
}


export function getListClientForFirm(firmId) {
  return new Promise(async (resolve, reject) => {
    let clients = await FirmClient.findAll({ where: { firm_id: firmId } });
    let clientIds = clients.map(x => { return x.client_id });
    let query = {};
    query.where = { is_active: true, id: { $in: clientIds } };
    return Client.findAll(query)
      .then(data => {
        resolve(data);
      })
      .catch(err => {
        console.log(err);
        reject(err);
      })
  })
}

export function getEventByFirmId(firmId) {
  return new Promise(async (resolve, reject) => {
    let events = await EventFirm.findAll({ where: { firm_id: firmId } })
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
      required: false,
      model: Research,
      as: 'Researchs',
      where: { is_active: true }
    }, {
      model: Firm,
      as: 'Firms',
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

export function getReportbyFirmId(firmId) {
  return new Promise((resolve, reject) => {
    var squery = {};
    squery.attributes = ['id', 'name', 'anticipated_publish_date', 'anticipated_kickoff_date', 'is_active', 'nickname', 'major_report'];
    squery.include = [{
      model: Analyst,
      as: 'Analysts',
      where: { is_active: true },
      include: [{
        model: Firm,
        as: 'Firm',
        attributes: [],
        where: { is_active: true, id: firmId },
      }]
    },
    {
      model: Client,
      as: 'Clients',
      required: false,
      attributes: ['id', 'name'],
      where: { is_active: true }
    },
    {
      model: Research,
      as: 'Researches',
      attributes: ['id', 'desc'],
      required: false,
      where: { is_active: true }
    }];
    squery.where = { is_active: true, major_report: { $ne: false } }
    return RankingReport.findAll(squery)
      .then(data => {
        resolve(data);
      })
      .catch(err => {
        console.log(err);
        reject(err);
      });
  })
}


export function getFirmByIdByAnalysts(analystIds) {
  let _analystIds = Array.isArray(analystIds) ? analystIds : [analystIds];
  return new Promise((resolve, reject) => {
    return AnalystHistory.findAll({ where: { analyst_id: { $in: _analystIds }, is_active_record: true }, attributes: ['firm_id'] })
      .then(data => {
        resolve(data);
      })
      .catch(error => {
        reject(error);
      })
  })
}  