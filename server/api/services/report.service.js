'use strict';
import {
  sequelize,
  RankingReport,
  ClientRankingReport,
  Client,
  Analyst,
  AnalystHistory,
  Research,
  Firm,
  FirmPlacement,
  Media,
  Activity,
  ActivityReport,
  ActivityClient,
  Note,
  TaskType,
} from '../../sqldb';

var Promise = require('bluebird');
import { ListNote } from '../dtos/noteDto';
import log4Js from 'log4js';
log4Js.configure({
  appenders: [
    { type: 'file', filename: 'logs/report-controller.log', category: 'report-controller' }
  ]
});

export function getAnalystByReportId(reportId) {
  return new Promise((resolve, reject) => {
    var query = `SELECT 
    a.id, c.name, d.media_id, c.id,GROUP_CONCAT(h.client_id) as clientIds
FROM
    ranking_report AS a
        INNER JOIN
    ranking_report_analyst AS b ON a.id = b.ranking_report_id
        AND b.is_active = TRUE
        INNER JOIN
    analyst AS c ON b.analyst_id = c.id
        LEFT JOIN
    analyst_media AS d ON c.id = d.analyst_id
        AND d.is_active = TRUE       
        LEFT JOIN
    sub_segment_analyst AS h ON h.analyst_id = c.id
WHERE
    a.id = ?
        AND a.is_active = TRUE
        GROUP BY c.id;`;

    sequelize.query(query, { replacements: [reportId], type: sequelize.QueryTypes.SELECT })
      .then(data => {
        resolve(data);
      })
      .catch((err) => {
        reject(err);
      });
  });
}

export function getCategoriesByReportId(reportId) {
  return new Promise((resolve, reject) => {
    var query = `SELECT 
    a.id, c.desc,GROUP_CONCAT(d.client_id) as clientIds, c.id as researchId
FROM
    ranking_report AS a
        INNER JOIN
    ranking_report_research AS b ON a.id = b.ranking_report_id and b.is_active = true
        INNER JOIN
    research AS c ON b.research_id = c.id and c.is_active = true
    LEFT JOIN
    client_research_category AS d ON d.research_id = c.id AND d.is_active = TRUE
WHERE
    a.id = ?
        AND a.is_active = TRUE
        GROUP BY  b.research_id;`;

    sequelize.query(query, { replacements: [reportId], type: sequelize.QueryTypes.SELECT })
      .then(data => {
        resolve(data);
      })
      .catch((err) => {
        reject(err);
      });
  });
}

export function getAnalystHistoryByReportId(reportId) {
  return new Promise((resolve, reject) => {
    var squery = {};
    squery.attributes = ['id', 'name'];
    squery.include = [{
      model: AnalystHistory,
      as: 'AnalystHistory',
      attributes: ['id', 'insert_date', 'title', 'team', 'city',
        'country', 'state', 'region', 'ad_owner'],
      where: { is_active_record: true },
      include: [{
        model: Firm,
        attributes: ['name']
      }]
    },
    {
      model: Research,
      attributes: ['desc']
    },
    {
      model: Client,
      as: 'Clients'
    },
    {
      model: RankingReport,
      as: 'RankingReports',
      where: { id: reportId },
      required: true
    }];
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

export function getClientByReportId(reportId) {
  return new Promise((resolve, reject) => {
    var squery = {};
    squery.where = { is_active: true };
    squery.attributes = ['id'];
    squery.include = [
      {
        model: RankingReport,
        attributes: ['id', 'anticipated_publish_date', 'anticipated_kickoff_date'],
        where: { id: reportId, is_active: true },

      },
      {
        model: Client,
        attributes: ['id', 'name'],
        include: [{
          model: Media,
          as: 'Media',
          attributes: ['media_id'],
          where: { is_active: true },
          required: false
        }]
      }
    ];

    return ClientRankingReport.findAll(squery)
      // sequelize.query(query, { replacements: [reportId], type: sequelize.QueryTypes.SELECT })
      .then(data => {
        resolve(data);
      })
      .catch((err) => {
        console.log(err);
        reject(err);
      });
  });
}

export function getFirmByReportId(reportId) {
  return new Promise((resolve, reject) => {
    var query = `
        SELECT 
        a.id,
        a.firm_id,
        b.name,
        b.id,
        b.media_id,
        GROUP_CONCAT(c.client_id) AS clientIds
        FROM
        ranking_report AS a
            LEFT JOIN
        firm AS b ON a.firm_id = b.id AND b.is_active = TRUE        
            LEFT JOIN
        client_history AS c ON c.firm_id = b.id
            AND c.is_active_record = TRUE
        WHERE
        a.id = ?
            AND a.is_active = TRUE
        GROUP BY b.id;`;

    sequelize.query(query, { replacements: [reportId], type: sequelize.QueryTypes.SELECT })
      .then(data => {
        resolve(data);
      })
      .catch((err) => {
        reject(err);
      });
  });
}

export function updatePlacement(reportItem) {
  return new Promise((resolve, reject) => {
    try {
      return sequelize.transaction(async function (t) {
        await ClientRankingReport.update({
          placement: reportItem.placement,
        }, {
            where: {
              id: reportItem.id,
            }
          }, { transaction: t });
      })
        .then(() => {
          resolve(true);
        });
    } catch (err) {
      reject(err);
    }
  });
}

export function getListNoteByReportId(reportId) {
  return new Promise(async (resolve, reject) => {
    let clients = await ClientRankingReport.findAll({ where: { ranking_report_id: reportId, is_active: true } });
    let clientIds = clients.map(x => { return x.client_id });
    let query = {};
    query.include = [{
      model: Activity,
      where: { client_id: { $in: clientIds } },
      required: true,
      include: [{
        model: ActivityReport,
        where: { report_id: reportId },
        required: true
      }, {
        model: Client,
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

export function getPlacementByMajorReport(data) {
  return new Promise(async (resolve, reject) => {
    let query = {};
    query.where = { is_active: true, firm_id: data };
    query.attributes = ['id', 'placement_name', 'firm_id'],
      query.include = [{
        model: Firm,
        attributes: ['id', 'name', 'is_active'],
        as: 'Firm',
        order: 'name ASC',
      }];
    return FirmPlacement.findAll(query)
      .then(data => {
        resolve(data);
      })
      .catch(err => {
        console.log(err);
        reject(err);
      });
  });
}

export function getClientTabByReportId(reportId) {
  return new Promise((resolve, reject) => {
    var squery = {};
    squery.where = { is_active: true };
    squery.attributes = ['id'];
    squery.include = [
      {
        model: RankingReport,
        attributes: ['id', 'anticipated_publish_date', 'anticipated_kickoff_date'],
        where: { id: reportId, is_active: true },

      },
      {
        model: Client,
        attributes: ['id', 'name'],
      },
      {
        model: FirmPlacement,
        where: { is_active: true },
        required: false
      }
    ];

    return ClientRankingReport.findAll(squery)
      .then(data => {
        resolve(data);
      })
      .catch((err) => {
        reject(err);
      });
  });
}

export function getRankingReportsByClient(clientId) {
  return new Promise((resolve, reject) => {
    var query = `
      SELECT rr.id, rr.name
      FROM 
        ranking_report as rr
      LEFT JOIN 
        client_ranking_report as crr ON rr.id = crr.ranking_report_id
      where rr.is_active = true
        AND crr.client_id = :clientId `;

    return sequelize.query(query, { replacements: { clientId: clientId }, type: sequelize.QueryTypes.SELECT })
      .then(data => {
        resolve(data);
      })
      .catch(err => {
        reject(res);
      });
  })
};