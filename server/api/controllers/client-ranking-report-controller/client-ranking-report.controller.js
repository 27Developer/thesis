'use strict';

import log4Js from 'log4js';
import _ from 'lodash';
import uuid from 'uuid';
import * as responseHelper from '../../../components/helper/response-helper';
import { ListClientRankingDto } from '../../dtos/clientRankingDto';
import config from '../../../config/environment/shared';
import json2Csv from 'json2csv';
import moment from 'moment';

log4Js.configure({
  appenders: [
    {
      type: 'file',
      filename: 'logs/client-ranking-report-controller.log',
      category: 'client-ranking-report-controller'
    }
  ]
});
var logger = log4Js.getLogger('client-ranking-report-controller');
import { ClientRankingReport, RankingReport, Client, Placement, CollectionClient, sequelize } from '../../../sqldb';

export function getListClientRankingReportByClientId(req, res) {
  try {
    const clientId = req.query.clientId;
    ClientRankingReport.findAll({
      include: [
        {
          model: RankingReport,
          attributes: ['id', 'name', 'analysis_year'],
          where: { is_active: true }
        },
        {
          model: Client,
          where: { id: clientId },
          attributes: ['id', 'name']
        }
      ],
      attributes: ['id', 'status_ranking', 'is_12month_feasible', 'is_active'],
      where: { is_active: true }
    })
      .then(responseHelper.respondWithResult(res))
      .catch((err) => {
      });
  } catch (err) {
    logger.error(err);
  }
}

export function getListClientRankingReportByClientIdAndDate(req, res) {
  const clientId = req.query.clientId;
  const time = req.query.time;
  const toDay = new Date();
  var queryTab = '';

  if (time === config.getStatusTabRankingReport.CURRENT) {
    queryTab = `and RankingReport.anticipated_kickoff_date <= '${toDay.toISOString()}' and (RankingReport.anticipated_publish_date >=  '${toDay.toISOString()}'  or RankingReport.anticipated_publish_date is null)`;
  } else if (time === config.getStatusTabRankingReport.FUTURE) {
    queryTab = `and RankingReport.anticipated_kickoff_date > '${toDay.toISOString()}'`;
  } else if (time === config.getStatusTabRankingReport.PAST) {
    queryTab = `and RankingReport.anticipated_publish_date <= '${toDay.toISOString()}'`;
  } else {
    queryTab = `and RankingReport.anticipated_publish_date >= '${toDay.toISOString()}'`;
  }

  var queryString = `SELECT 
    ClientRankingReport.id,
    ClientRankingReport.placement AS placement,
    ranking_report_placement.custom_name AS custom_name,
    ClientRankingReport.status_ranking,
    (ClientRankingReport.is_12month_feasible + 0) AS is_12month_feasible,
    RankingReport.id AS RankingReportId,
    RankingReport.name AS RankingReportName,
    RankingReport.nickname AS RankingReportNickName,
    RankingReport.analysis_year AS RankingReportAnalysisYear,
    RankingReport.anticipated_publish_date AS RankingReportAnticipatedPublishDate,
    RankingReport.anticipated_kickoff_date AS RankingReportAnticipatedKickoffDate,
    RankingReport.major_report As MajorReport,
    Client.id AS ClientId,
    Client.name AS ClientName,
    GROUP_CONCAT(Analyst.name
        SEPARATOR ', ') AS AnalystName
FROM
    client_ranking_report AS ClientRankingReport
        INNER JOIN
    ranking_report AS RankingReport ON ClientRankingReport.ranking_report_id = RankingReport.id
        AND RankingReport.is_active = TRUE
        AND (RankingReport.major_report = TRUE
        OR RankingReport.major_report IS NULL)
        INNER JOIN
    client AS Client ON ClientRankingReport.client_id = Client.id
        AND Client.id = '${clientId}'
        INNER JOIN
    ranking_report_analyst AS RankingReportAnalyst ON RankingReportAnalyst.ranking_report_id = RankingReport.id
        AND RankingReportAnalyst.is_active = TRUE
        INNER JOIN
    analyst AS Analyst ON RankingReportAnalyst.analyst_id = Analyst.id
        LEFT JOIN
    ranking_report_placement AS ranking_report_placement ON ranking_report_placement.id = ClientRankingReport.placement
WHERE
    ClientRankingReport.is_active = TRUE
    ${queryTab}
GROUP BY ClientRankingReport.id;`;
  return sequelize.query(queryString, { type: sequelize.QueryTypes.SELECT })
    .then(data => {
      let listData = ListClientRankingDto(data);
      return listData;
    })
    .then(responseHelper.respondWithResult(res))
    .catch(function(err) {
      responseHelper.handleError(res);
    });
}

export function getListClientRankingReportByCollectionIdAndDate(req, res) {
  const collectionId = req.query.collectionId;
  const toDay = new Date();
  var queryString = `SELECT 
    ClientRankingReport.id,
    ClientRankingReport.placement AS placement,
    ranking_report_placement.custom_name AS custom_name,
    ClientRankingReport.status_ranking,
    (ClientRankingReport.is_12month_feasible + 0) AS is_12month_feasible,
    RankingReport.id AS RankingReportId,
    RankingReport.name AS RankingReportName,
    RankingReport.nickname AS RankingReportNickName,
    RankingReport.analysis_year AS RankingReportAnalysisYear,
    RankingReport.anticipated_publish_date AS RankingReportAnticipatedPublishDate,
    RankingReport.anticipated_kickoff_date AS RankingReportAnticipatedKickoffDate,
    Client.id AS ClientId,
    Client.name AS ClientName,
    GROUP_CONCAT(Analyst.name
        SEPARATOR ', ') AS AnalystName
FROM
    client_ranking_report AS ClientRankingReport
        INNER JOIN
    ranking_report AS RankingReport ON ClientRankingReport.ranking_report_id = RankingReport.id
        AND RankingReport.is_active = TRUE
        AND (RankingReport.major_report = TRUE
        OR RankingReport.major_report IS NULL)
        INNER JOIN
    client AS Client ON ClientRankingReport.client_id = Client.id
        AND Client.id in (?)
        INNER JOIN
    ranking_report_analyst AS RankingReportAnalyst ON RankingReportAnalyst.ranking_report_id = RankingReport.id
        AND RankingReportAnalyst.is_active = TRUE
        INNER JOIN
    analyst AS Analyst ON RankingReportAnalyst.analyst_id = Analyst.id
        LEFT JOIN
    ranking_report_placement AS ranking_report_placement ON ranking_report_placement.id = ClientRankingReport.placement
WHERE
    ClientRankingReport.is_active = TRUE
    and RankingReport.anticipated_publish_date >= '${toDay.toISOString()}'
GROUP BY ClientRankingReport.id;`;

  return CollectionClient.findAll({
    where: {
      collection_id: collectionId,
    }
  }).then(clients => {

    let clientIds = _.map(clients, function(item) {
      return item.dataValues.client_id
    });

    return sequelize.query(queryString, { replacements: [clientIds], type: sequelize.QueryTypes.SELECT })
      .then(data => {
        return ListClientRankingDto(data);
      })
      .then(responseHelper.respondWithResult(res))
      .catch(function(err) {
        responseHelper.handleError(res);
      });
  })
    .catch(function(err) {
      responseHelper.handleError(res);
    });
}

export function exportCsv(req, res) {
  const clientId = req.query.clientId;

  var queryString = `SELECT 
    ClientRankingReport.id,
    ClientRankingReport.placement AS placement,
    ranking_report_placement.custom_name AS custom_name,
    ClientRankingReport.status_ranking,
    (ClientRankingReport.is_12month_feasible + 0) AS is_12month_feasible,
    RankingReport.id AS RankingReportId,
    RankingReport.name AS RankingReportName,
    RankingReport.analysis_year AS RankingReportAnalysisYear,
    RankingReport.anticipated_publish_date AS RankingReportAnticipatedPublishDate,
    RankingReport.anticipated_kickoff_date AS RankingReportAnticipatedKickoffDate,
    Client.id AS ClientId,
    Client.name AS ClientName,
    GROUP_CONCAT(DISTINCT Analyst.name
        SEPARATOR ', ') AS AnalystName,
    GROUP_CONCAT(DISTINCT Research.desc
        SEPARATOR ', ') AS ResearchName
FROM
    client_ranking_report AS ClientRankingReport
        INNER JOIN
    ranking_report AS RankingReport ON ClientRankingReport.ranking_report_id = RankingReport.id
        AND RankingReport.is_active = TRUE
        INNER JOIN
    client AS Client ON ClientRankingReport.client_id = Client.id
        AND Client.id = '${clientId}'
        INNER JOIN
    ranking_report_analyst AS RankingReportAnalyst ON RankingReportAnalyst.ranking_report_id = RankingReport.id
        AND RankingReportAnalyst.is_active = TRUE
        INNER JOIN
    analyst AS Analyst ON RankingReportAnalyst.analyst_id = Analyst.id
        left JOIN
    ranking_report_research AS RankingReportResearch ON RankingReportResearch.ranking_report_id = RankingReport.id
        AND RankingReportResearch.is_active = TRUE
        left JOIN
    research AS Research ON RankingReportResearch.research_id = Research.id and Research.is_active = true
        LEFT JOIN
    ranking_report_placement AS ranking_report_placement ON ranking_report_placement.id = ClientRankingReport.placement
WHERE
    ClientRankingReport.is_active = TRUE
GROUP BY ClientRankingReport.id;`;

  return sequelize.query(queryString, { type: sequelize.QueryTypes.SELECT })
    .then(data => {
      const fields = [
        'name',
        'status',
        'analyst',
        'categories',
        'anticipated_kickoff_date',
        'anticipated_publish_date',
      ];

      const fieldNames = [
        'Ranking Report Name',
        'Status',
        'Analysts',
        'Categories',
        'Kickoff Date',
        'Publish Date ',
      ];

      let dataExport = [];
      let returnStatusRanking = function(kickoff, publish) {
        var date = new Date();
        var kickoff_ = new Date(kickoff);
        var publish_ = new Date(publish);
        if (date >= kickoff_ && date <= publish_ || publish === null)
          return 'Current';
        else if (publish_ < date)
          return 'Past';
        else if (kickoff_ > date)
          return 'Future';
      }
      for (let i = 0; i < data.length; i++) {
        let dataTemp = data[i];
        let temp = {};
        temp.name = dataTemp.RankingReportName;
        temp.status = returnStatusRanking(dataTemp.RankingReportAnticipatedKickoffDate, dataTemp.RankingReportAnticipatedPublishDate);
        temp.analyst = dataTemp.AnalystName;
        temp.categories = dataTemp.ResearchName;
        temp.anticipated_kickoff_date = dataTemp.RankingReportAnticipatedKickoffDate ? moment(dataTemp.RankingReportAnticipatedKickoffDate).format('MM/DD/YYYY') : '';
        temp.anticipated_publish_date = dataTemp.RankingReportAnticipatedPublishDate ? moment(dataTemp.RankingReportAnticipatedPublishDate).format('MM/DD/YYYY') : '';
        dataExport.push(temp);
      }
      json2Csv({ data: dataExport, fields, fieldNames }, function(err, csv) {
        if (err) {
        }
        res.send(csv);
      });
    })
    .then(responseHelper.respondWithResult(res))
    .catch(function(err) {
      responseHelper.handleError(res);
    });
}

export function getDataForAddEditClientRankingReport(req, res) {
  try {
    RankingReport.findAll({
      where: { is_active: true },
      attributes: ['id', 'name', 'analysis_year', 'major_report'],
      order: [['name', 'ASC']]
    })
      .then(responseHelper.respondWithResult(res))
      .catch((err) => {
      });
  } catch (err) {
    logger.error(err);
  }
}

export function addNewClientRankingReport(req, res) {
  try {
    let clientRankingReportNew = req.body.clientRankingReportNew;
    clientRankingReportNew.id = uuid.v1();
    clientRankingReportNew.ranking_report_id = clientRankingReportNew.RankingReport.id;
    clientRankingReportNew.status_ranking = clientRankingReportNew.status_ranking.value;
    clientRankingReportNew.is_12month_feasible = clientRankingReportNew.is_12month_feasible ? clientRankingReportNew.is_12month_feasible.value : '';
    var result = 'Error';
    return sequelize.transaction(async function(t) {
      var checkExists = await ClientRankingReport.findAll({
        where: {
          ranking_report_id: clientRankingReportNew.ranking_report_id,
          client_id: clientRankingReportNew.client_id,
          is_active: 1
        },
        attributes: [
          'client_id'
        ]
      })
        .catch((err) => {
        });
      if (checkExists.length === 0) {
        await ClientRankingReport.create(clientRankingReportNew, { transaction: t });
        result = clientRankingReportNew;
      }
    })
      .then(() => {
        return res.status(201).json(result);
      })
      .catch(responseHelper.handleError(res));
  } catch (err) {
    logger.error(err);
  }
}

export function editClientRankingReport(req, res) {
  try {
    let clientRankingReport = req.body.clientRankingReport;
    clientRankingReport.ranking_report_id = clientRankingReport.id;
    return sequelize.transaction(async function(t) {
      await ClientRankingReport.update({
        ranking_report_id: clientRankingReport.RankingReport.id,
        status_ranking: clientRankingReport.status_ranking.value,
        is_12month_feasible: clientRankingReport.is_12month_feasible ? clientRankingReport.is_12month_feasible.value : ''
      }, {
        where: {
          id: clientRankingReport.id,
          client_id: clientRankingReport.clientId
        }
      }, { transaction: t });
    })
      .then(() => {
        return res.status(201).json(clientRankingReport);
      })
      .catch(err => {
        console.log(err);
      });
  } catch (err) {
    console.log(err);
    logger.error(err);
  }
}

export function updatePlacement(req, res) {
  try {
    let clientRankingReport = req.body.clientRankingReport;
    return sequelize.transaction(async function(t) {
      await ClientRankingReport.update({
        placement: clientRankingReport.ClientRankingReport.placement,
      }, {
        where: {
          id: clientRankingReport.ClientRankingReport.id,
        }
      }, { transaction: t });
    })
      .then(() => {
        return res.status(200).json(clientRankingReport);
      })
      .catch(responseHelper.handleError(res));
  } catch (err) {
    logger.error(err);
  }
}

export function deleteClientRankingReport(req, res) {
  try {
    return sequelize.transaction(function(t) {
      let tasks = [];
      let clientRankingReportId = [];
      let listData = [];
      clientRankingReportId = req.query.clientRankingReportId;
      if (Array.isArray(clientRankingReportId)) {
        listData = clientRankingReportId;
      } else {
        let arraytemp = [];
        arraytemp.push(clientRankingReportId);
        listData = arraytemp;
      }
      _.forEach(listData, function(reportId) {
        tasks.push(
          ClientRankingReport.update(
            {
              is_active: false
            },
            {
              where: {
                id: reportId
              },
              transaction: t
            })
        );
      });

      return Promise.all(tasks);
    })
      .then(() => {
        res.send();
      })
      .catch(responseHelper.handleError(res));
  } catch (err) {
    logger.error(err);
  }
}

export function addCustomPlacement(req, res) {
  var data = req.body.placement;
  data.create_at = new Date();
  return sequelize.transaction(async function(t) {
    let placement = await Placement.create(data, { transaction: t });
    await ClientRankingReport.update({
      placement: placement.id,
    }, {
      where: {
        id: data.rankingReports,
      }
    }, { transaction: t });
  })
    .then(() => {
      res.send();
    })
    .catch(responseHelper.handleError(res));
}
