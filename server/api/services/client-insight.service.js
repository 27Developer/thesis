'use strict';
var Promise = require('bluebird');
import {
  sequelize,
  Analyst,
  InsightClient,
  InsightAnalyst,
  InsightClientStatus,
  Insight
} from '../../sqldb';

import log4Js from 'log4js';
import { request } from 'http';
import config from '../../config/environment/shared';
log4Js.configure({
  appenders: [
    { type: 'file', filename: 'logs/client-health-controller.log', category: 'client-health-controller' }
  ]
});

export function getListInsightsByClientId(clientId, currentUserData) {
  let role = currentUserData.role;
  var query = '';

  switch (role) {
    case config.role.spotlightAdmin:
      query = `
        SELECT
          insight.id,
          insight.sentiment,
          insight.desc,
          insight.sensitivity,
          insight.type,
          insight.created_by,
          insight.updated_date,
          insight_client_status.publish,
          insight_client_status.star,
          GROUP_CONCAT(analyst.name SEPARATOR ',') AS analyst_names,
          GROUP_CONCAT(analyst.id SEPARATOR ',') AS analyst_ids
        FROM
          client
          LEFT JOIN insight_client ON insight_client.client_id = client.id
          LEFT JOIN insight ON insight_client.insight_id = insight.id
          LEFT JOIN insight_client_status ON insight.id = insight_client_status.insight_id AND client.id = insight_client_status.client_id
          LEFT JOIN insight_analyst ON insight.id = insight_analyst.insight_id
          LEFT JOIN analyst ON insight_analyst.analyst_id = analyst.id
        WHERE
            insight.is_active = TRUE
                AND client.id = :clientId
        GROUP BY insight.id
        ORDER BY insight.created_date DESC`
      break;
    default:
      query = `
        SELECT
          insight.id,
          insight.sentiment,
          insight.desc,
          insight.sensitivity,
          insight.type,
          insight.created_by,
          insight.updated_date,
          insight_client_status.publish,
          insight_client_status.star,
          GROUP_CONCAT(analyst.name SEPARATOR ',') AS analyst_names,
          GROUP_CONCAT(analyst.id SEPARATOR ',') AS analyst_ids
        FROM
          client
          LEFT JOIN insight_client ON insight_client.client_id = client.id
          LEFT JOIN insight ON insight_client.insight_id = insight.id
          LEFT JOIN insight_client_status ON insight.id = insight_client_status.insight_id AND client.id = insight_client_status.client_id
          LEFT JOIN insight_analyst ON insight.id = insight_analyst.insight_id
          LEFT JOIN analyst ON insight_analyst.analyst_id = analyst.id
        WHERE
            insight.is_active = TRUE
                AND client.id = :clientId
                AND insight_client_status.publish = 1
                AND insight.sensitivity <> '2'
        GROUP BY insight.id
        ORDER BY insight.created_date DESC`
      break;
  }

  return new Promise((resolve, reject) => {
    return sequelize.query(query, { replacements: { clientId: clientId }, type: sequelize.QueryTypes.SELECT })
      .then((data) => {
        data.forEach(insight => {
          insight.publish = insight.publish ? true : false;
          insight.star = insight.star ? true : false;
        });
        resolve(data);
      })
      .catch(err => {
        reject(err)
      });
  });
}