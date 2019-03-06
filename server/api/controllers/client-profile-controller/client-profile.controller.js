'use strict';

import log4Js from 'log4js';
import * as responseHelper from '../../../components/helper/response-helper';
import config from '../../../../server/config/environment/shared';
import * as changeLogHelper from '../../../components/helper/change-log-helper';
var Promise = require('bluebird');

log4Js.configure({
  appenders: [
    { type: 'file', filename: 'logs/client-profile-controller.log', category: 'client-profile.controller.js' }
  ]
});
var logger = log4Js.getLogger('client-profile-controller');
import { sequelize } from '../../../sqldb';

export function getListActivitiByClientId(req, res) {
  var activities = {
    recent: [],
    upcoming: [],
    research: []
  };

  var queryRecentActivities = ` 
   Select a.id, tt.desc, tt.kind as type_kind, a.due_date, a.start_date, a.topic, a.client_id
  from activity a
  LEFT JOIN task_type tt ON tt.id = a.type_id
  where a.client_id = '${req.query.id}' and
  a.due_date <= CURDATE();`;

  var queryUpcomingActivities = `
    Select a.id, tt.desc, tt.kind as type_kind, a.due_date, a.start_date, a.topic, a.client_id
  from activity a
  LEFT JOIN task_type tt ON tt.id = a.type_id
  where a.client_id = '${req.query.id}' and
  a.due_date > CURDATE();`;

  var queryResearch = `
  SELECT DISTINCT (b.id), b.desc, a.id as ClientResearchCategoriesId
FROM
  client_research_category AS a
  INNER JOIN
  research AS b ON b.id = a.research_id
      AND b.is_active = TRUE
WHERE
  a.client_id = '${req.query.id}'
  AND a.is_active = TRUE
  group by a.research_id
ORDER BY a.last_update ASC;`;

  return sequelize.transaction(async function (t) {
    /*   return Promise.all(sequelize.query(queryRecentActivities, { type: sequelize.QueryTypes.SELECT }),
         sequelize.query(queryUpcomingActivities, { type: sequelize.QueryTypes.SELECT }),
         sequelize.query(queryResearch, { type: sequelize.QueryTypes.SELECT })
       ).then(data => {
         activities.recent = data[0];
         activities.upcoming = data[1];
         activities.research = data[2];
       })*/
    await sequelize.query(queryRecentActivities, { type: sequelize.QueryTypes.SELECT })
      .then(data => {
        activities.recent = data;
      })
      .catch(err => {
        throw err;
      });

    await sequelize.query(queryUpcomingActivities, { type: sequelize.QueryTypes.SELECT })
      .then(data => {
        activities.upcoming = data;
      })
      .catch(err => {
        throw err;
      });

    await sequelize.query(queryResearch, { type: sequelize.QueryTypes.SELECT })
      .then(data => {
        activities.research = data;
      })
      .catch(err => {
        throw err;
      });
  }).then(() => {
    res.send(activities);
  })
    .catch(responseHelper.handleError(res));
}


