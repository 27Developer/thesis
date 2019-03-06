'use strict';
import log4Js from 'log4js/lib/log4js';
var jwt_decode = require('jwt-decode');
import {
  sequelize,
  Collection,
  CollectionClient,
  Client,
  Media,
  Analyst,
  SubSegmentAnalyst,
  InsightClient,
  InsightClientStatus,
  Event,
  EventClient,
  ClientSpeaker,
  Insight,
  Research,
  AnalystHistory,
  Firm,
  TaskType,
  Note,
  Segment,
  SubSegment,
  UserToken,
  Activity,
  ClientActivity,
  User
} from '../../sqldb';
import uuid from 'uuid';
import config from '../../config/environment/shared';
import _ from 'lodash';
import { ListNote } from '../dtos/noteDto';
import {
  ListInsightForCollection
} from '../dtos/analystDto';
import {
  ListAnalystAssocialCollectionDto,
  ListAnalystUnassignedDto
} from '../dtos/clientDto';

var ObjectTemplateService = require('../../api/services/object-templates.service');
var Promise = require('bluebird');


log4Js.configure({
  appenders: [
    { type: 'file', filename: 'logs/client-controller.log', category: 'client-controller' }
  ]
});
//var logger = log4Js.getLogger('client-controller');
export function getAllCollections(req) {
  let bearerToken;
  let bearerHeader = req.headers['authorization'];
  let bearer = bearerHeader.split(' ');
  bearerToken = bearer[1];
  let collectionIdStr = [];
  let strWhereClientId = "";
  let role;
  return UserToken.findAll({ where: { access_token: bearerToken } })
    .then(resObj => {
      let data = resObj[0].dataValues;
      let decoded = jwt_decode(data.token_id);
      role = decoded['custom:role'];
      let collectionIdStr = decoded['custom:collection_id'] ? decoded['custom:collection_id'] : '';
      if (role !== config.role.spotlightAdmin) {
        collectionIdStr = collectionIdStr.split(', ');
      }

      if (role === config.role.spotlightAdmin) {
        return new Promise((resolve, reject) => {
          return Collection.findAll({
            include: [{
              model: Client,
              as: 'Clients',
              required: false
            }]
          }).then((data) => {
            return data;
          })
            .then((data) => {
              resolve(data);
            })
            .catch(function (err) {
              reject(err);
            })
        });
      } else {
        return new Promise((resolve, reject) => {
          return Collection.findAll({
            include: [{
              model: Client,
              as: 'Clients',
              required: false
            }],
            where: {
              id: { in: collectionIdStr }
            }
          }).then((data) => {
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
    })
    .catch(err => {
      reject(err);
    });
}

export function getCollectionById(collectionId) {
  return new Promise((resolve, reject) => {
    return Collection.findOne({
      where: { id: collectionId },
      include: [{
        model: Client,
        as: 'Clients',
        required: false
      }]
    }).then((data) => {
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

export function addCollection(collection) {
  return new Promise(async (resolve, reject) => {
    var listFuncs = [];
    var listClients = collection.selectedClients || [];
    var collectionObj = { name: collection.name }
    let newCollection = await Collection.create(collectionObj);
    listClients.forEach(client => {
      listFuncs.push(CollectionClient.create({ collection_id: newCollection.id, client_id: client.id }));
    });
    await ObjectTemplateService.handleInfoGroup(collection.group, newCollection.id);
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

export function editCollection(collection) {
  return new Promise(async (resolve, reject) => {
    var currentCollectionId = collection.id
    var listClients = collection.selectedClients || [];
    var collectionObj = {
      id: collection.id,
      name: collection.name
    }
    await Collection.update(collectionObj, { where: { id: currentCollectionId } });
    await CollectionClient.destroy({ where: { collection_id: currentCollectionId } });
    var listFuncs = _.map(listClients, function (client) {
      return CollectionClient.create({ collection_id: currentCollectionId, client_id: client.id });
    })
    await ObjectTemplateService.handleInfoGroup(collection.group, currentCollectionId);
    return Promise.all(listFuncs)
      .then(rs => {
        resolve(rs);
      })
      .catch(err => {
        console.log(err);
        reject(err);
      });
  })
}

export function deleteCollectionSelected(collectionIds) {
  let arrayCollectionId = [];
  arrayCollectionId = Array.isArray(collectionIds) ? collectionIds : [collectionIds];
  return new Promise((resolve, reject) => {
    return sequelize.transaction(function (t) {
      let arrPromise = [];
      arrayCollectionId.forEach(collectionId => {
        arrPromise.push(CollectionClient.destroy({ where: { collection_id: collectionId } }, { transaction: t }));
        arrPromise.push(Collection.destroy({ where: { id: collectionId } }, { transaction: t }));
      })
      return Promise.all(arrPromise)
        .then(data => {
          resolve(data)
        })
        .catch(error => {
          reject(error);
        });
    })
  });
}

export function getOverviewByCollectionId(collectionId) {
  return new Promise((resolve, reject) => {
    var overview = {
      clients: [],
      recentActivities: [],
      upcomingActivities: [],
      categories: [],
      reports: []
    };

    var queryClients = `
      SELECT client.id, client.name, m.media_id
	    FROM collection 
      LEFT JOIN collection_client on collection.id = collection_client.collection_id
      LEFT JOIN client on collection_client.client_id = client.id
      LEFT JOIN client_media cm on client.id = cm.client_id and cm.media_type = 'avatar' and cm.is_active = 1
      LEFT JOIN media m on cm.media_id = m.media_id and m.is_active = 1
      WHERE collection.id = :collectionId
      ORDER BY client.name ASC`;

    var queryRecentActivities = ` 
      SELECT client.id as client_id, a.id, b.desc, a.due_date, b.kind as type_kind, a.start_date
	    FROM collection 
      LEFT JOIN collection_client on collection.id = collection_client.collection_id
      LEFT JOIN client on collection_client.client_id = client.id
      LEFT JOIN activity as a on client.id = a.client_id
      INNER JOIN task_type as b on a.type_id = b.id and b.is_active = true
      
      WHERE collection.id = :collectionId and a.due_date <= NOW()
      ORDER BY a.due_date DESC;
      `;

    var queryUpcomingActivities = `
      SELECT client.id as client_id, a.id, b.desc, a.due_date, b.kind as type_kind, a.start_date
	    FROM collection 
      LEFT JOIN collection_client on collection.id = collection_client.collection_id
      LEFT JOIN client on collection_client.client_id = client.id
      LEFT JOIN activity as a on client.id = a.client_id
      INNER JOIN task_type as b on a.type_id = b.id and b.is_active = true
      
      WHERE collection.id = :collectionId and a.due_date > NOW()
      ORDER BY a.due_date ASC;
      `;
    var queryCategories = `
      SELECT DISTINCT (rs.id), rs.desc
	    FROM collection 
      LEFT JOIN collection_client on collection.id = collection_client.collection_id
      LEFT JOIN client on collection_client.client_id = client.id
	    LEFT JOIN client_research_category as crc on client.id = crc.client_id
	    INNER JOIN research AS rs ON rs.id = crc.research_id
      
      WHERE collection.id = :collectionId and crc.is_active = TRUE
      ORDER BY rs.desc ASC;`;

    var queryCurrentReports = `
    SELECT rr.name, rr.nickname, rr.id, client.name as client_name, rr.anticipated_kickoff_date
	  FROM collection 
    LEFT JOIN collection_client on collection.id = collection_client.collection_id
    LEFT JOIN client on collection_client.client_id = client.id
	  LEFT JOIN client_ranking_report as crr on client.id = crr.client_id
	  INNER JOIN ranking_report AS rr ON crr.ranking_report_id = rr.id AND rr.is_active = true 
      
  	WHERE collection.id = :collectionId and
      rr.anticipated_kickoff_date <= NOW() and 
      (rr.anticipated_publish_date >=  NOW() or rr.anticipated_publish_date is null)
    ORDER BY rr.anticipated_kickoff_date DESC;
    `

    return Promise.all([
      sequelize.query(queryClients, {
        replacements: { collectionId: collectionId },
        type: sequelize.QueryTypes.SELECT
      }),
      sequelize.query(queryRecentActivities, {
        replacements: { collectionId: collectionId },
        type: sequelize.QueryTypes.SELECT
      }),
      sequelize.query(queryUpcomingActivities, {
        replacements: { collectionId: collectionId },
        type: sequelize.QueryTypes.SELECT
      }),
      sequelize.query(queryCategories, {
        replacements: { collectionId: collectionId },
        type: sequelize.QueryTypes.SELECT
      }),
      sequelize.query(queryCurrentReports, {
        replacements: { collectionId: collectionId },
        type: sequelize.QueryTypes.SELECT
      })
    ])
      .spread((clients, recentActivities, upcomingActivities, categories, reports) => {
        overview.clients = clients;
        overview.recentActivities = recentActivities;
        overview.upcomingActivities = upcomingActivities;
        overview.categories = categories;
        overview.reports = reports;
        resolve(overview);
      })
      .catch(err => {
        reject(err);
      })
  });
}

export function getListCollection() {
  return new Promise((resolve, reject) => {
    return Collection.findAll()
      .then(data => {
        resolve(data);
      })
      .catch(error => {
        reject(error);
      })
  })
}

export function getClientByCollectionId(collectionId) {
  return new Promise((resolve, reject) => {
    return CollectionClient.findAll({
      include: [{
        model: Client,
        as: 'Clients',
        attributes: ['id', 'name'],
        where: { is_active: true },
      }],
      where: {
        collection_id: collectionId,
      }
    })
      .then(data => {
        resolve(data);
      })
      .catch(error => {
        reject(error);
      })
  })
}

export function getAnalystByCollectionId(collectionId) {
  return new Promise(async (resolve, reject) => {
    let clients = await CollectionClient.findAll({ where: { collection_id: collectionId }, attributes: ['client_id'] });
    let clientIds = clients.map(x => {
      return x.client_id
    });
    let query = {};
    query.include = [{
      model: SubSegmentAnalyst,
      as: 'SubSegmentAnalyst',
      where: { client_id: { $in: clientIds } },
      include: [{
        model: SubSegment,
        as: 'SubSegment',
        where: { name: 'Core' },
        required: true
      }]
    }]
    query.where = { is_active: true };
    return Analyst.findAll(query)
      .then(data => {
        resolve(data);
      })
      .catch(error => {
        reject(error);
      })
  })
}

export function getListInsightsByCollectionId(collectionId, currentUserData) {
  return new Promise(async (resolve, reject) => {
    let data = await Collection.findOne({
      where: { id: collectionId },
      include: [{
        model: Client,
        as: 'Clients',
        attributes: ['id'],
        required: false
      }]
    })
    let clientIds = data.Clients ? data.Clients.map(client => {
      return client.id
    }) : [];
    console.log(clientIds);
    let query = {};
    query.include = [{
      model: InsightClient,
      as: 'InsightClient',
      where: { client_id: { $in: clientIds } },
      required: true,
    }, {
      model: Client,
      as: 'Clients',
      required: false
      //where: { is_active: true }
    }, {
      model: Analyst,
      as: 'Analysts',
      //where: { is_active: true },
      required: false
    }, {
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
    return Insight.findAll(query)
      .then(data => {

        resolve(ListInsightForCollection(data, currentUserData.role));
      })
      .catch(error => {
        console.log(error);
        reject(error);
      })
  })
}

export function getListEventByCollectionId(collectionId) {
  return new Promise(async (resolve, reject) => {
    let clients = await CollectionClient.findAll({ where: { collection_id: collectionId }, attributes: ['client_id'] });
    let clientIds = clients.map(x => {
      return x.client_id
    });
    let query = {};
    query.include = [{
      model: EventClient,
      as: 'EventClients',
      required: true,
      where: { client_id: { $in: clientIds } }
    }, {
      model: Client,
      as: 'Clients',
      required: false,
      where: { is_active: true, id: { $in: clientIds } }
    }, {
      model: Analyst,
      as: 'Analysts',
      required: false,
      where: { is_active: true }
    }, {
      model: Research,
      as: 'Researchs',
      required: false,
      where: { is_active: true }
    }]
    return Event.findAll(query)
      .then(data => {
        resolve(data);
      })
      .catch(err => {
        console.log(err);
      })
  })
}

export function getClientActivityByCollectionId(collectionId) {
  return new Promise(async (resolve, reject) => {
    let clients = await CollectionClient.findAll({ where: { collection_id: collectionId }, attributes: ['client_id'] });
    let clientIds = clients.map(x => {
      return x.client_id
    });
    let query = {};
    query.where = { client_id: { $in: clientIds } , is_active: true}
    return ClientActivity.findAll(query)
      .then(data => {
        resolve(data);
      })
      .catch(err => {
        console.log(err);
      })
  })
}

export function getListSpeakerByCollectionId(collectionId) {
  return new Promise(async (resolve, reject) => {
    let clients = await CollectionClient.findAll({ where: { collection_id: collectionId }, attributes: ['client_id'] });
    let clientIds = clients.map(x => {
      return x.client_id
    });
    let query = {};
    query.include = [{
      model: Client,
      required: false,
      where: { is_active: true }
    }]
    query.where = { client_id: { $in: clientIds } }
    return ClientSpeaker.findAll(query)
      .then(data => {
        resolve(data);
      })
      .catch(err => {
        console.log(err);
      })
  })
}

export function getListNoteByCollectionId(clientIds) {
  return new Promise(async (resolve, reject) => {
    let _clientIds = _.isArray(clientIds) ? clientIds : [clientIds];
    let query = {};
    query.include = [{
      model: Activity,
      where: { client_id: { $in: _clientIds } },
      required: true,
      include: [{
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
  }).catch(err => {
    console.log(err);
  })
}

export function getAnalystAssocialClientGlobalSegment(collectionId) {
  return CollectionClient.findAll({
    where: { collection_id: collectionId }
  }).then(clients => {
    let clientIds = _.map(clients, function (item) {
      return item.dataValues.client_id
    });

    let query = {};
    query.include = [{
      model: SubSegmentAnalyst,
      as: 'SubSegmentAnalyst',
      where: { client_id: { $in: clientIds } },
      required: true,
      include: [{
        model: SubSegment,
        as: 'SubSegment',
        required: true,
        include: [{
          model: Segment,
          as: 'Segment',
          where: { client_id: null },
          required: true
        }],
      }, {
        model: Client,
        as: 'Client',
        where: { is_active: true }
      }],
    }, {
      model: AnalystHistory,
      as: 'AnalystHistory',
      attributes: ['title'],
      where: { is_active_record: true },
      required: false,
      include: [{
        model: Firm,
        as: 'Firm',
        attributes: ['id', 'name'],
        where: { is_active: true },
        required: false,
      }]
    },
    {
      model: Activity,
      as: 'Activities',
      where: { client_id: { $in: clientIds } },
      required: false,
    }];

    query.order = [[{
      model: Activity,
      as: 'Activities'
    }, 'due_date', 'DESC']]

    query.where = {
      is_active: true
    }


    return new Promise((resolve, reject) => {
      return Analyst.findAll(query)
        .then((data) => {
          resolve(ListAnalystAssocialCollectionDto(data));
        })
        .catch(err => {
          console.log(err);
          reject(err)
        });
    });

  })


}

export function getClientGlobalSegment(clientId) {
  return new Promise((resolve, reject) => {
    var query = {};
    query.attributes = ['id', 'name', 'client_id'];
    query.include = [{
      model: SubSegment,
      attributes: ['id', 'name', 'detail'],
      as: 'SubSegment',
      order: 'name ASC',
      include: [{
        model: SubSegmentAnalyst,
        as: 'SubSegmentAnalyst',
        where: { client_id: clientId },
        required: false,
        include: [{
          model: Analyst,
          attributes: ['id', 'name'],
          as: 'Analyst',
          where: { is_active: true },
          required: false,
          include: [{
            model: Firm,
            attributes: ['id', 'name'],
            as: 'Firm',
            required: false,
            where: { is_active: true }
          }]
        }]
      }]
    }];
    query.where = { client_id: null };
    query.order = [
      ['client_id', 'ASC'],
      [{ model: SubSegment, as: 'SubSegment' }, 'name', 'ASC']
    ];

    return Segment.findAll(query)
      .then(data => {
        resolve(data);
      })
      .catch(err => {
        console.log(err);
        reject(err);
      })

  });
}


export function getAnalystUnassignedGlobalSegment(clientId) {
  return new Promise((resolve, reject) => {
    var query = { attributes: ['id', 'name'] };
    query.include = [{
      model: SubSegmentAnalyst,
      as: 'SubSegmentAnalyst',
      where: { client_id: clientId },
      required: true,
      include: [{
        model: SubSegment,
        attributes: ['id', 'name', 'segment_id'],
        as: 'SubSegment',
        required: true,
        include: [{
          model: Segment,
          as: 'Segment',
          where: { client_id: null },
          required: true
        }]
      }]
    }, {
      model: Firm,
      attributes: ['id', 'name'],
      as: 'Firm',
      where: { is_active: true },
      required: false,
    }];
    query.where = { is_active: true };
    query.order = [['name', 'ASC']];
    return Analyst.findAll(query)
      .then(data => {
        resolve(ListAnalystUnassignedDto(data));
      })
      .catch(err => {
        console.log(err);
        reject(err);
      });
  })
}


export function getAnalystAndSubSegmentForClient(clientId) {
  return new Promise((resolve, reject) => {
    var query = {};
    query.include = [{
      model: SubSegmentAnalyst,
      as: 'SubSegmentAnalyst',
      where: { client_id: clientId },
      required: false,
      include: [{
        model: SubSegment,
        as: 'SubSegment',
        required: false,
        include: [{
          model: Segment,
          as: 'Segment',
          required: false,
        }]
      }]
    },
    ];
    query.where = { is_active: true };
    query.order = [['name', 'ASC']];
    return Analyst.findAll(query)
      .then(data => {
        resolve(data);
      })
      .catch(err => {
        reject(err);
      });
  });
}

export function updateInsightStatusInCollection(collectionId, insightId, starValue) {
  return new Promise((resolve, reject) => {
    // let clients = await CollectionClient.findAll({ where: { collection_id: collectionId }});
    // let clientIds = clients.map(x => {
    //   return x.client_id
    // });
    // var listFuncs = [];
    // clientIds.forEach(clientId => {
    //   listFuncs.push(InsightClient.update({
    //     star: starValue
    //   },
    //   {
    //     where: {
    //       insight_id: insightId,
    //       client_id: clientId
    //     }
    //   }))
    // })

    return CollectionClient.findAll({ where: { collection_id: collectionId } })
      .then(clients => {
        let clientIds = clients.map(x => {
          return x.client_id
        });
        var listFuncs = [];
        clientIds.forEach(clientId => {
          listFuncs.push(InsightClientStatus.findOrCreate(
            {
              where: {
                insight_id: insightId,
                client_id: clientId
              }
            }).spread((data, isCreated) => {
              return InsightClientStatus.update({
                star: starValue
              },
                {
                  where: {
                    insight_id: insightId,
                    client_id: clientId
                  }
                })
            })

          )
        })

        return Promise.all(listFuncs);
      })
      .then(data => {
        resolve(data)
      })
      .catch(err => {
        console.log(err);
        reject(err);
      });


  })

}
export function getAvgSentimentForAnalystAndClient(clientId, analystIds) {
  return new Promise((resolve, reject) => {

    let calculatorSentimentQuery =
      `(SELECT 
      final.analyst_id, AVG(final.sentiment) as sentiment
        FROM
            (SELECT 
                result.*,
                    @rank:=CASE
                        WHEN @analyst_id <> analyst_id THEN 0
                        ELSE @rank + 1
                    END AS rn,
                    @analyst_id:=analyst_id AS clset
            FROM
                (SELECT @rank:=0) s, (SELECT @analyst_id:=0) c, (SELECT 
            insight.*, insight_analyst_client.analyst_id
        FROM
            (SELECT 
                insight_analyst.insight_id, insight_analyst.analyst_id
            FROM
                insight_analyst
            INNER JOIN insight_client ON insight_analyst.insight_id = insight_client.insight_id
            WHERE
                insight_client.client_id = ?) AS insight_analyst_client 
                
                INNER JOIN insight
                ON insight_analyst_client.insight_id = insight.id
            ORDER BY insight_analyst_client.analyst_id , created_date DESC) result) final
        WHERE
            final.rn < 10 and  final.analyst_id in (?)
        GROUP BY final.analyst_id);`;
    return sequelize.query(calculatorSentimentQuery, {
      replacements: [clientId, analystIds],
      type: sequelize.QueryTypes.SELECT
    }).then(data => {
      resolve(data);
    }).catch(err => {
      console.log(err);
      reject(err);
    })
  })
}

export function getAssignedCollections(email, role, collectionIdStr) {
  return new Promise((resolve, reject) => {
    return Collection.findAll({
      attributes: ['id', 'name'],
      where: {
        id: { in: collectionIdStr }
      }
    })
      .then((data) => {
        User.update({ collection_ids: data.map(collection => { return collection.id }).join(',') }, { where: { email: email } })
        resolve(data);
      })
      .catch(function (err) {
        reject(err);
      })
  });
}
