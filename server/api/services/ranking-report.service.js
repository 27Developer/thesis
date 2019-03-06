'use strict';
import log4Js from 'log4js/lib/log4js';
import {
  sequelize,
  User,
  Media
} from '../../sqldb';
import config from '../../config/environment/shared';

var Promise = require('bluebird');

log4Js.configure({
  appenders: [
    { type: 'file', filename: 'logs/client-controller.log', category: 'client-controller' }
  ]
});
export function getRankingReportById(id, currentUserData) {
  return new Promise((resolve, reject) => {
    var queryString = `
    SELECT a.*,f.name as firm_name
    ,GROUP_CONCAT(DISTINCT c.name  ORDER BY c.name DESC SEPARATOR \'!!!\') as all_analyst_name
    ,GROUP_CONCAT(DISTINCT e.name  ORDER BY e.name DESC SEPARATOR \'!!!\') as all_client_name
    ,GROUP_CONCAT(DISTINCT e.name  ORDER BY e.name SEPARATOR \'!!!\') as all_client_name
    ,GROUP_CONCAT(DISTINCT e.name, \'$$$\', d.client_type ORDER BY e.name SEPARATOR \'!!!\') as all_client_type
    ,GROUP_CONCAT(DISTINCT h.desc  ORDER BY h.desc DESC SEPARATOR \'!!!\') as all_research_name
    ,GROUP_CONCAT(DISTINCT e.id SEPARATOR \',\') as all_client_ids

    FROM ranking_report as a
    left join ranking_report_analyst as b on a.id = b.ranking_report_id and b.is_active = true
    left join client_ranking_report as d on a.id = d.ranking_report_id and d.is_active = true
    left join ranking_report_research as g on a.id = g.ranking_report_id and g.is_active = true
    left join analyst as c on c.id = b.analyst_id and c.is_active = true
    left join client as e on e.id = d.client_id and e.is_active = true
    left join research as h on h.id = g.research_id and h.is_active = true
    left join firm as f on a.firm_id = f.id and f.is_active = true
    where a.id = ? AND a.is_active = true
    group by id;`;

    return sequelize.query(queryString, { replacements: [id], type: sequelize.QueryTypes.SELECT })
      .then(data => {
        var currentReport = data[0];
        if (currentUserData.role !== config.role.spotlightAdmin) {
          let clientIds = currentUserData.clientIds.split(',');
          let reportClientIds = currentReport.all_client_ids.split(',');
          var checkPermission = clientIds.filter(x => {
            return reportClientIds.includes(x)
          }).length > 0 ? true : false;
          if (checkPermission) {
            resolve(data);
          } else {
            throw { code: 403, message: "Forbidden" };
          }
        } else {
          resolve(data);
        }
      })
      .catch(err => {
        console.log(err);
        reject(err);
      });
  });
}
