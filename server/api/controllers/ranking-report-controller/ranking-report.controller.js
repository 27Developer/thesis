'use strict';

import log4Js from 'log4js';
import uuid from 'uuid';
import moment from 'moment';
import json2Csv from 'json2csv';
import _ from 'lodash';
import * as responseHelper from '../../../components/helper/response-helper';
log4Js.configure({
  appenders: [
    { type: 'file', filename: 'logs/ranking-report-controller.log', category: 'ranking-report-controller' }
  ]
});
var logger = log4Js.getLogger('ranking-report-controller');
import {
  RankingReport,
  Research,
  RankingReportResearch,
  Firm,
  Analyst,
  RankingReportAnalyst,
  ClientRankingReport,
  AnalystHistory,
  FirmPlacement,
  sequelize
} from '../../../sqldb';
var RankingReportService = require('../../services/ranking-report.service');

export function getRankingReportsList(req, res) {
  try {
    let searchArray = req.query.searchArray;
    let whereStatement = getSearchArrayWhereStatement(searchArray);
    return processGetDataForRankingReportList(req, res, whereStatement);
  } catch (err) {
    logger.error(err);
  }
}

export function getRankingReportsSimpleList(req, res) {
  try {
    return processGetDataForRankingReportSimpleList(req, res);
  } catch (err) {
    logger.error(err);
  }
}


export function getRankingReportOptions(req, res) {
  try {
    return processGetDataForRankingReportOptions(req, res);
  } catch (err) {
    logger.error(err);
  }
}

export function getLength(req, res) {
  try {
    let searchArray = req.query.searchArray;
    let whereStatement = getSearchArrayWhereStatement(searchArray);
    return processGetLength(req, res, whereStatement);
  } catch (err) {
    logger.error(err);
  }
}


var getAnalystString = function(analysts) {
  var analystString = '';
  for (var i = 0; i < analysts.length; analysts++) {
    if (i === 0) {
      analystString = analysts[i].name;
    } else {
      analystString = `, ${analysts[i].name}`;
    }
  }
  return analystString;
};

var getResearcherString = function(researchers) {
  var researchString = '';
  for (var i = 0; i < researchers.length; researchers++) {
    if (i === 0) {
      researchString = researchers[i].desc;
    } else {
      researchString = `, ${researchers[i].desc}`;
    }
  }
  return researchString;
};

var processGetDataForRankingReport = async function(req, res) {
  var rankingReports = await RankingReport.findAll({
    include: [
      {
        model: Research,
        as: 'Researches',
        attributes: ['id', 'desc', 'is_active']
      },
      {
        model: Firm,
        attributes: ['id', 'name', 'is_active']
      },
      {
        model: Analyst,
        as: 'Analysts',
        attributes: ['id', 'name', 'is_active']
      }
    ],
    where: { is_active: true },
    attributes: [
      'id', 'name', 'analysis_year', 'anticipated_publish_date',
      'anticipated_kickoff_date', 'is_active'
    ]
  })
    .catch((err) => {
      console.log(err);
    });
  var firms = await Firm.findAll({
    where: { is_active: true },
    attributes: [
      'id', 'name', 'is_active'
    ]
  })
    .catch((err) => {
    });
  var researches = await Research.findAll({
    where: { is_active: true },
    attributes: [
      'id', 'desc', 'is_active'
    ]
  })
    .catch((err) => {
    });
  var analysts = await Analyst.findAll({
    where: { is_active: true },
    attributes: [
      'id', 'name', 'is_active'
    ]
  })
    .catch((err) => {
    });
  rankingReports = rankingReports.sort(function(a, b) {
    const descriptionA = a.name.toUpperCase();
    const descriptionB = b.name.toUpperCase();
    if (descriptionA < descriptionB) {
      return -1;
    }
    if (descriptionA > descriptionB) {
      return 1;
    }
    return 0;
  });
  firms = firms.sort(function(a, b) {
    const descriptionA = a.name.toUpperCase();
    const descriptionB = b.name.toUpperCase();
    if (descriptionA < descriptionB) {
      return -1;
    }
    if (descriptionA > descriptionB) {
      return 1;
    }
    return 0;
  });
  researches = researches.sort(function(a, b) {
    const descriptionA = a.desc.toUpperCase();
    const descriptionB = b.desc.toUpperCase();
    if (descriptionA < descriptionB) {
      return -1;
    }
    if (descriptionA > descriptionB) {
      return 1;
    }
    return 0;
  });
  analysts = analysts.sort(function(a, b) {
    const descriptionA = a.name.toUpperCase();
    const descriptionB = b.name.toUpperCase();
    if (descriptionA < descriptionB) {
      return -1;
    }
    if (descriptionA > descriptionB) {
      return 1;
    }
    return 0;
  });
  return res.status(200).json({
    RankingReports: rankingReports,
    Firms: firms,
    Researches: researches,
    Analysts: analysts
  });
};

var getSearchArrayWhereStatement = function(searchArrays)
{
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
  searchArray.forEach(function(searchI) {
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
      case 'name':
        searchString += "name like '%" + searchItem.value + "%'";
        break;
      case 'short_name':
        searchString += "nickname like '%" + searchItem.value + "%'";
        break;
      case 'firm_id':
        searchString += "firm_id in ("
        searchItem.values.forEach(function(value) {
          searchString += "'" + value + "',";
        });
        searchString = searchString.substr(0, searchString.length - 1) + ")";
        break;
      case 'placement':
        searchString += "placement_name like '%" + searchItem.value + "%'";
        break;
      case 'analyst_id':
        searchString += "("  
        searchItem.values.forEach(function(value) {
          searchString += "all_analyst_id like '%" + value + "%' OR ";
        });
        searchString = searchString.substr(0, searchString.length - 4) + ")";
        break;
      case 'client_id':
        searchString += "("  
        searchItem.values.forEach(function(value) {
          searchString += "all_client_id like '%" + value + "%' OR ";
        });
        searchString = searchString.substr(0, searchString.length - 4) + ")";
        break;
      case 'research_id':
        searchString += "("  
        searchItem.values.forEach(function(value) {
          searchString += "all_research_id like '%" + value + "%' OR ";
        });
        searchString = searchString.substr(0, searchString.length - 4) + ")";
        break;
      case 'kickoff_date':
        var hasStartValue = false;
        if (searchItem.startValue) {
          hasStartValue = true;
          searchString += "(anticipated_kickoff_date >= '" + searchItem.startValue + "')";
        }
        if (searchItem.endValue) {
          if (hasStartValue) {
            searchString += " AND ";
          }
          searchString += "(anticipated_kickoff_date <= '" + searchItem.endValue + "')";
        }
        break;
      case 'publish_date':
        var hasStartValue = false;
        if (searchItem.startValue) {
          hasStartValue = true;
          searchString += "(anticipated_publish_date >= '" + searchItem.startValue + "')";
        }
        if (searchItem.endValue) {
          if (hasStartValue) {
            searchString += " AND ";
          }
          searchString += "(anticipated_publish_date <= '" + searchItem.endValue + "')";
        }
        break;
    }
  });
  return searchString;
};

var processGetDataForRankingReportList = async function(req, res, whereStatement) {
  
  let currentPage = req.query.currentPage;
  let itemPerPage = req.query.itemPerPage;
  let sortKey = req.query.sortKey;
  let sortType = req.query.sortType;
  
  if (whereStatement && whereStatement != "") {
      whereStatement = " Where " + whereStatement;
    }   
  else {
    whereStatement = "";
  } 
  let offset = 0;
  let limit = 100;
  if (itemPerPage) {
    limit = parseInt(itemPerPage);
  }
  if (currentPage) {
    offset = parseInt(currentPage - 1) * limit;
  }
  
  var sortStr = sortKey + " IS NULL"
  if(sortKey.toLowerCase() === 'desc')
  {
    sortStr = sortKey + " IS NOT NULL"
  }


  var queryString = `
  Select * from (
  SELECT a.*,f.name as firm_name
  ,GROUP_CONCAT(DISTINCT c.name ORDER BY c.name DESC SEPARATOR '!!!') as all_analyst_name
  ,GROUP_CONCAT(DISTINCT e.name ORDER BY d.id DESC SEPARATOR '!!!') as all_client_name
  ,GROUP_CONCAT(DISTINCT e.name, '$$$', d.client_type ORDER BY d.id DESC SEPARATOR '!!!') as all_client_type
  ,GROUP_CONCAT(DISTINCT h.desc ORDER BY h.desc DESC SEPARATOR '!!!') as all_research_name
  ,GROUP_CONCAT(DISTINCT c.id ORDER BY c.name DESC SEPARATOR '!!!') as all_analyst_id
  ,GROUP_CONCAT(DISTINCT e.id ORDER BY d.id DESC SEPARATOR '!!!') as all_client_id
  ,GROUP_CONCAT(DISTINCT h.id ORDER BY h.desc DESC SEPARATOR '!!!') as all_research_id,
  p.placement_name
  FROM ranking_report as a
  left join ranking_report_analyst as b on a.id = b.ranking_report_id and b.is_active = true
  left join client_ranking_report as d on a.id = d.ranking_report_id and d.is_active = true
  left join ranking_report_research as g on a.id = g.ranking_report_id and g.is_active = true
  left join analyst as c on c.id = b.analyst_id
  left join client  as e on e.id = d.client_id
  left join research  as h on h.id = g.research_id and h.is_active = true
  left join firm as f on a.firm_id = f.id and f.is_active = true
  left join placement as p on p.id = a.placement
  where a.is_active = true
  group by id) as data
  ${whereStatement}
  ORDER BY ${sortStr}, ${sortKey} ${sortType}
  LIMIT  ${limit} offset ${offset}`;

  return sequelize.query(queryString, { type: sequelize.QueryTypes.SELECT })
    .then(data => {
      return res.status(200).json(data);
    })
    .catch(err => {
      responseHelper.handleError(res);
    });
};

var processGetDataForRankingReportSimpleList = async function(req, res) {
  var queryString = `
  SELECT a.id, a.name
  FROM ranking_report as a
  where a.is_active = true`;

  return sequelize.query(queryString, { type: sequelize.QueryTypes.SELECT })
    .then(data => {
      return res.status(200).json(data);
    })
    .catch(err => {
      responseHelper.handleError(res);
    });
};

var processGetLength = async function(req, res, whereStatement) {
  
  if (whereStatement && whereStatement != "") {
      whereStatement = " Where " + whereStatement;
    }   
  else {
    whereStatement = "";
  } 

  var queryString = `
  Select count(*) as report_count from (
  SELECT a.*,f.name as firm_name
  ,GROUP_CONCAT(DISTINCT c.name ORDER BY c.name DESC SEPARATOR '!!!') as all_analyst_name
  ,GROUP_CONCAT(DISTINCT e.name ORDER BY d.id DESC SEPARATOR '!!!') as all_client_name
  ,GROUP_CONCAT(DISTINCT e.name, '$$$', d.client_type ORDER BY d.id DESC SEPARATOR '!!!') as all_client_type
  ,GROUP_CONCAT(DISTINCT h.desc  ORDER BY h.desc DESC SEPARATOR '!!!') as all_research_name
  ,GROUP_CONCAT(DISTINCT c.id ORDER BY c.name DESC SEPARATOR '!!!') as all_analyst_id
  ,GROUP_CONCAT(DISTINCT e.id ORDER BY d.id DESC SEPARATOR '!!!') as all_client_id
  ,GROUP_CONCAT(DISTINCT h.id  ORDER BY h.desc DESC SEPARATOR '!!!') as all_research_id,
  p.placement_name
  FROM ranking_report as a
  left join ranking_report_analyst as b on a.id = b.ranking_report_id and b.is_active = true
  left join client_ranking_report as d on a.id = d.ranking_report_id and d.is_active = true
  left join ranking_report_research as g on a.id = g.ranking_report_id and g.is_active = true
  left join analyst as c on c.id = b.analyst_id and c.is_active = true
  left join client  as e on e.id = d.client_id and e.is_active = true
  left join research  as h on h.id = g.research_id and h.is_active = true
  left join firm as f on a.firm_id = f.id and f.is_active = true
  left join placement as p on p.id = a.placement
  where a.is_active = true
  group by id) as data ${whereStatement}`;

  return sequelize.query(queryString, { type: sequelize.QueryTypes.SELECT })
    .then(data => {
      return res.status(200).json("" + data[0].report_count);
    })
    .catch(err => {
      responseHelper.handleError(res);
    });
};


var processGetDataForRankingReportOptions = async function(req, res) {
  var firms = await Firm.findAll({
    where: { is_active: true },
    attributes: [
      'id', 'name', 'is_active'
    ],
    order: [
      // Will escape username and validate DESC against a list of valid direction parameters
      ['name', 'ASC']
    ]

  })
    .catch((err) => {
    });
  var researches = await Research.findAll({
    where: { is_active: true },
    attributes: [
      'id', 'desc', 'is_active'
    ],
    order: [
      // Will escape username and validate DESC against a list of valid direction parameters
      ['desc', 'ASC']
    ]
  })
    .catch((err) => {
    });
  var analysts = await Analyst.findAll({
    where: { is_active: true },
    attributes: [
      'id', 'name', 'is_active'
    ],
    order: [
      // Will escape username and validate DESC against a list of valid direction parameters
      ['name', 'ASC']
    ]
  })
    .catch((err) => {
      console.log(err);
    });
  return res.status(200).json({
    Firms: firms,
    Researches: researches,
    Analysts: analysts
  });
};

export function addListRankingReport(req, res) {
  try {
    return processAddListRankingReport(req, res);
  } catch (err) {
    logger.error(err);
  }
}

var processAddListRankingReport = async function(req, res) {
  const newRankingReports = req.body.newRankingReports;
  for (let i = 0; i < newRankingReports.length; i++) {
    newRankingReports[i].id = uuid.v1();
    newRankingReports[i].update_date = new Date();
  }
  return sequelize.transaction(async function(t) {
    for (let i = 0; i < newRankingReports.length; i++) {
      let objTemp = await AnalystHistory.findOne({
        where: {
          analyst_id: newRankingReports[i].Analysts.length ? newRankingReports[i].Analysts[0] : '',
          is_active_record: true
        }
      });
      newRankingReports[i].firm_id = objTemp.firm_id;
      await RankingReport.create(newRankingReports[i], { transaction: t });
      if (newRankingReports[i].Researches.length > 0) {
        for (let j = 0; j < newRankingReports[i].Researches.length; j++) {
          await RankingReportResearch.create({
            id: uuid.v1(),
            ranking_report_id: newRankingReports[i].id,
            research_id: newRankingReports[i].Researches[j],
            is_active: true
          }, { transaction: t });
        }
      }
      if (newRankingReports[i].Analysts.length > 0) {
        for (let j = 0; j < newRankingReports[i].Analysts.length; j++) {
          await RankingReportAnalyst.create({
            id: uuid.v1(),
            ranking_report_id: newRankingReports[i].id,
            analyst_id: newRankingReports[i].Analysts[j],
            is_active: true
          }, { transaction: t });
        }
      }

      if (newRankingReports[i].clientCity.length > 0) {
        for (let j = 0; j < newRankingReports[i].clientCity.length; j++) {
          await ClientRankingReport.create({
            id: uuid.v1(),
            ranking_report_id: newRankingReports[i].id,
            client_id: newRankingReports[i].clientCity[j],
            is_active: true,
            client_type: 0
          }, { transaction: t });
        }
      }
      if (newRankingReports[i].clientShowcase.length > 0) {
        for (let j = 0; j < newRankingReports[i].clientShowcase.length; j++) {
          await ClientRankingReport.create({
            id: uuid.v1(),
            ranking_report_id: newRankingReports[i].id,
            client_id: newRankingReports[i].clientShowcase[j],
            is_active: true,
            client_type: 1
          }, { transaction: t });
        }
      }
    }
  })
    .then(() => {
      return res.status(201).json(newRankingReports);
    })
    .catch(responseHelper.handleError(res));
};

export function updateListRankingReport(req, res) {
  try {
    return processUpdateListRankingReport(req, res);
  } catch (err) {
    logger.error(err);
  }
}

export function updateReportPlacement(req, res) {
  try {
    return processUpdateReportPlacement(req, res);
  } catch (err) {
    logger.error(err);
  }
}

var processUpdateListRankingReport = async function(req, res) {
  const changedRankingReports = req.body.changedRankingReports;
  for (let i = 0; i < changedRankingReports.length; i++) {
    changedRankingReports[i].update_date = new Date();
  }
  return sequelize.transaction(async function(t) {
    for (let j = 0; j < changedRankingReports.length; j++) {
      await RankingReportResearch.destroy({
        where: {
          ranking_report_id: changedRankingReports[j].id
        },
        transaction: t
      });
      if (changedRankingReports[j].Researches.length > 0) {
        for (let k = 0; k < changedRankingReports[j].Researches.length; k++) {
          await RankingReportResearch.create({
            id: uuid.v1(),
            ranking_report_id: changedRankingReports[j].id,
            research_id: changedRankingReports[j].Researches[k],
            is_active: true
          }, { transaction: t });
        }
      }
      await RankingReportAnalyst.destroy({
        where: {
          ranking_report_id: changedRankingReports[j].id
        },
        transaction: t
      });
      if (changedRankingReports[j].Analysts.length > 0) {
        for (let k = 0; k < changedRankingReports[j].Analysts.length; k++) {
          await RankingReportAnalyst.create({
            id: uuid.v1(),
            ranking_report_id: changedRankingReports[j].id,
            analyst_id: changedRankingReports[j].Analysts[k],
            is_active: true
          }, { transaction: t });
        }
      }
      delete changedRankingReports[j].analystName;
      delete changedRankingReports[j].researchCategory;
      delete changedRankingReports[j].firmName;
      changedRankingReports[j].is_active = true;

      let objTemp = await AnalystHistory.findOne({
        where: {
          analyst_id: changedRankingReports[j].Analysts.length ? changedRankingReports[j].Analysts[0] : '',
          is_active_record: true
        }
      });
      changedRankingReports[j].firm_id = objTemp.firm_id;

      await RankingReport.upsert(changedRankingReports[j], { transaction: t });

      if (changedRankingReports[j].clientCity.length > 0 || changedRankingReports[j].clientShowcase.length > 0) {
        await ClientRankingReport.destroy({
          where: {
            ranking_report_id: changedRankingReports[j].id
          },
          transaction: t
        });
      }
      if (changedRankingReports[j].clientCity.length > 0) {
        for (let h = 0; h < changedRankingReports[j].clientCity.length; h++) {
          await ClientRankingReport.create({
            id: uuid.v1(),
            ranking_report_id: changedRankingReports[j].id,
            client_id: changedRankingReports[j].clientCity[h],
            is_active: true,
            client_type: 0
          }, { transaction: t });
        }
      }
      if (changedRankingReports[j].clientShowcase.length > 0) {
        for (let h = 0; h < changedRankingReports[j].clientShowcase.length; h++) {
          await ClientRankingReport.create({
            id: uuid.v1(),
            ranking_report_id: changedRankingReports[j].id,
            client_id: changedRankingReports[j].clientShowcase[h],
            is_active: true,
            client_type: 1
          }, { transaction: t });
        }
      }


    }
  })
    .then(() => {
      return res.status(200).json(changedRankingReports);
    })
    .catch(responseHelper.handleError(res));
};

var processUpdateReportPlacement = async function(req, res) {
  let placement = req.body.placement;
  let reportId = req.body.reportId;
  return sequelize.transaction(async function(t) {
    if (placement.id) {
      await FirmPlacement.update({
          placement_name: placement.placement_name,
        },
        {
          where: {
            id: placement.id
          },
          transaction: t
        });

      await RankingReport.update({
          placement: placement.id,
        },
        {
          where: {
            id: reportId
          },
          transaction: t
        });
    } else {
      let placementNew = await FirmPlacement.create(placement, { transaction: t })
      await RankingReport.update({
          placement: placementNew.id,
        },
        {
          where: {
            id: reportId
          },
          transaction: t
        });
    }
  })
    .then(() => {
      return res.status(200).json(true);
    })
    .catch(responseHelper.handleError(res));

};

export function deleteListRankingReport(req, res) {
  try {
    return processDeleteListRankingReport(req, res);
  } catch (err) {
    logger.error(err);
  }
}

var processDeleteListRankingReport = async function(req, res) {
  const deletedRankingReports = req.body.deletedRankingReports;
  return sequelize.transaction(async function(t) {
    for (let j = 0; j < deletedRankingReports.length; j++) {
      await RankingReportResearch.destroy({
        where: {
          ranking_report_id: deletedRankingReports[j].id
        },
        transaction: t
      });
      await RankingReportAnalyst.destroy({
        where: {
          ranking_report_id: deletedRankingReports[j].id
        },
        transaction: t
      });
      await RankingReport.update(
        {
          is_active: false
        },
        {
          where: {
            id: deletedRankingReports[j].id
          },
          transaction: t
        });
    }
  })
    .then(() => {
      return res.status(200).json(deletedRankingReports);
    })
    .catch(responseHelper.handleError(res));
};

export function exportRankingReportToCsv(req, res) {
  try {
    return processexportRankingReportToCsv(req, res);
  } catch (err) {
    logger.error(err);
  }
}

var processexportRankingReportToCsv = async function(req, res) {
  const fields = [
    'name',
    'count',
    'analysis_year',
    'firmName',
    'analystName',
    'researchCategory',
    {
      label: 'anticipated_publish_date',
      value (row) {
        if (row.anticipated_publish_date !== null && row.anticipated_publish_date !== '') {
          return moment.utc(row.anticipated_publish_date).utcOffset(req.body.exportRankingReports.timezone * (-1))
            .format('MM/DD/YYYY');
        } else {
          return null;
        }
      }
    },
    {
      label: 'anticipated_kickoff_date',
      value (row) {
        if (row.anticipated_kickoff_date !== null && row.anticipated_kickoff_date !== '') {
          return moment.utc(row.anticipated_kickoff_date).utcOffset(req.body.exportRankingReports.timezone * (-1))
            .format('MM/DD/YYYY');
        } else {
          return null;
        }
      }
    }
  ];

  const fieldNames = [
    'Ranking Report Name',
    'Client Count',
    'Year of Analysis',
    'Analyst Firm',
    'Anticipated Author(s)',
    'Research Categories',
    'Anticipated Publish Date',
    'Anticipated Kickoff Date'
  ];

  try {
    json2Csv({ data: req.body.exportRankingReports.data, fields, fieldNames }, function(err, csv) {
      if (err) {
      }
      res.send(csv);
    });
  } catch (err) {
  }
};

export function getRankingReportById(req, res) {
  var id = req.query.reportId;
  var currentUserData = req.userData;
  RankingReportService.getRankingReportById(id, currentUserData)
    .then(responseHelper.respondWithResult(res))
    .catch(responseHelper.handleError(res));
}

export function updateReportClientPlacement(req, res) {
  try {
    return processUpdateReportClientPlacement(req, res);
  } catch (err) {
    logger.error(err);
  }
}

var processUpdateReportClientPlacement = async function(req, res) {
  let placement = req.body.placement;
  let clientId = req.body.clientId;
  let reportId = req.body.reportId;
  return sequelize.transaction(async function(t) {
    if (placement.id) {
      await FirmPlacement.update({
        placement_name: placement.placement_name,
        },
        {
          where: {
            id: placement.id
          },
          transaction: t
        });

      await ClientRankingReport.update({
          placement: placement.id,
        },
        {
          where: {
            client_id: clientId,
            ranking_report_id: reportId
          },
          transaction: t
        });
    } else {
      let placementNew = await FirmPlacement.create(placement, { transaction: t })
      await ClientRankingReport.update({
        placement: placementNew.id,
        },
        {
          where: {
            client_id: clientId,
            ranking_report_id: reportId
          },
          transaction: t
        });
    }
  })
    .then(() => {
      return res.status(200).json(true);
    })
    .catch(responseHelper.handleError(res));

};