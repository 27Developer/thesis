'use strict';
import log4Js from 'log4js/lib/log4js';
import {
  sequelize,
  Segment,
  SubSegment,
  Analyst,
  Firm,
  SubSegmentAnalyst,
  ClientAnalystAlignmentHistory,
  MaturityByAnalyst,
  Client,
  ClientHistory,
  GlobalSetting,
  AnalystHistory,
  Insight,
  InsightClient,
  ClientMedia,
  Activity,
  Media,
  CollectionClient,
  ClientResearchCategories,
  ClientAssigned,
  User,
  FirmClient,
  TaskType,
  Groups,
  Items,
  FirmPlacement,
  InsightClientStatus,
  ClientExecutive,
  SegmentationType,
  Effort,
  ChurnReason,
  Collection,
  ClientType,
  Research,
  ClientHealthHistory,
  EventClient,
  ClientRankingReport
} from '../../sqldb';

import uuid from 'uuid';
var Promise = require('bluebird');
var CONSTANTS = require('../../config/environment/shared');
import * as changeLogHelper from '../../components/helper/change-log-helper';
import _ from 'lodash';
import {
  ListClientDto,
  ListAnalystAssocialClientDto,
  ListAnalystUnassignedDto,
  ListAnalystHasActivityWithClientDto
} from '../dtos/clientDto';

log4Js.configure({
  appenders: [
    { type: 'file', filename: 'logs/client-controller.log', category: 'client-controller' }
  ]
});
//var logger = log4Js.getLogger('client-controller');

export function getMajorReport(clientId) {
  return new Promise((resolve, reject) => {
    var query = `
    SELECT a.*, d.client_id, d.status_ranking, d.is_12month_feasible, d.id as clientRankingReport, p.placement_name, p.id as placement_id
    ,GROUP_CONCAT(DISTINCT e.name ORDER BY e.name DESC SEPARATOR '!!!') as all_analyst_name
    ,GROUP_CONCAT(DISTINCT h.desc ORDER BY h.desc DESC SEPARATOR '!!!') as all_research_name
    ,GROUP_CONCAT(DISTINCT e.id ORDER BY e.name DESC SEPARATOR '!!!') as all_analyst_id
    ,GROUP_CONCAT(DISTINCT h.id ORDER BY h.desc DESC SEPARATOR '!!!') as all_research_id

    FROM ranking_report as a
    inner join ranking_report_analyst as b on a.id = b.ranking_report_id and b.is_active = true
    left join client_ranking_report as d on a.id = d.ranking_report_id and d.is_active = true
    left join ranking_report_research as g on a.id = g.ranking_report_id and g.is_active = true
    left join analyst as e on e.id = b.analyst_id and e.is_active = true
    left join research as h on h.id = g.research_id and h.is_active = true
    left join placement as p on p.id = d.placement and p.is_active = true
    where a.is_active = true and d.client_id = ? and (a.major_report = true or a.major_report is null)
    group by id;`;
    return sequelize.query(query, { replacements: [clientId], type: sequelize.QueryTypes.SELECT })
      .then(data => {
        resolve(data);
      })
      .catch(err => {
        reject(err);
      });
  });
}

export function getMajorReportByCollectionId(collectionId) {
  return new Promise((resolve, reject) => {
    var query = `
    SELECT a.*, d.client_id, d.status_ranking, d.is_12month_feasible, d.id as clientRankingReport,
    GROUP_CONCAT(DISTINCT e.name ORDER BY e.name DESC SEPARATOR '!!!') as all_analyst_name,
    GROUP_CONCAT(DISTINCT h.desc ORDER BY h.desc DESC SEPARATOR '!!!') as all_research_name,
    GROUP_CONCAT(DISTINCT l.name ORDER BY l.name DESC SEPARATOR '!!!') as all_client_name,

    GROUP_CONCAT(DISTINCT e.id ORDER BY e.name DESC SEPARATOR '!!!') as all_analyst_id,
    GROUP_CONCAT(DISTINCT l.id ORDER BY l.name DESC SEPARATOR '!!!') as all_client_id,
    GROUP_CONCAT(DISTINCT h.id ORDER BY h.desc DESC SEPARATOR '!!!') as all_research_id

    FROM ranking_report as a
    inner join ranking_report_analyst as b on a.id = b.ranking_report_id and b.is_active = true
    left join client_ranking_report as d on a.id = d.ranking_report_id and d.is_active = true
    left join ranking_report_research as g on a.id = g.ranking_report_id and g.is_active = true
    left join analyst as e on e.id = b.analyst_id and e.is_active = true
    left join research as h on h.id = g.research_id and h.is_active = true
    left join client as l on d.client_id = l.id and l.is_active = true
    where a.is_active = true and d.client_id in (?) and (a.major_report = true or a.major_report is null)
    group by id;`;

    return CollectionClient.findAll({
      where: {
        collection_id: collectionId,
      }
    }).then(res => {

      let clientIds = _.map(res, function (item) {
        return item.dataValues.client_id
      });

      return sequelize.query(query, { replacements: [clientIds], type: sequelize.QueryTypes.SELECT })
        .then(data => {
          resolve(data);
        })
        .catch(err => {
          console.log(err);
          reject(err);
        });

    })
      .catch(err => {
        console.log(err);
        reject(err);
      })

  });
}

export function getClientSegments(clientId) {
  return new Promise((resolve, reject) => {
    var query = {};
    query.where = { $or: [{ client_id: clientId }, { client_id: null }] };
    query.attributes = ['id', 'name', 'client_id'],
      query.include = [{
        model: SubSegment,
        attributes: ['id', 'name', 'detail'],
        as: 'SubSegment',
        order: 'name ASC',
        include: [
          {
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
                required: false,
                attributes: ['id', 'name'],
                as: 'Firm',
                where: { is_active: true }
              }]
            }]
          }]
      }];
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
      });
  });
}

export function getPlacement(clientId) {
  return new Promise((resolve, reject) => {
    var query = {};
    query.where = { is_active: true };
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

export function getClientInsightStatus(clientId) {
  return new Promise((resolve, reject) => {
    var query = {};
    query.where = { client_id: clientId };
    query.attributes = ['id', 'client_id', 'insight_id', 'publish', 'star']

    return InsightClientStatus.findAll(query)
      .then(data => {
        resolve(data);
      })
      .catch(err => {
        console.log(err);
        reject(err);
      });
  });
}

export function updateAnalystSegment(data) {
  let analyst_id_old = data.analyst_id_old;
  let sub_segment_id_old = data.sub_segment_id_old;
  let client_id_old = data.client_id_old;

  delete data.analyst_id_old;
  delete data.sub_segment_id_old;
  delete data.client_id_old;

  return new Promise(async (resolve, reject) => {
    const check = await SubSegmentAnalyst.find({
      where: {
        analyst_id: analyst_id_old,
        sub_segment_id: sub_segment_id_old,
        client_id: client_id_old
      }
    });
    console.log(check);

    return SubSegmentAnalyst.update(data, {
      where: {
        analyst_id: analyst_id_old,
        sub_segment_id: sub_segment_id_old,
        client_id: client_id_old
      }
    })
      .then(data => {
        resolve(data);
      })
      .catch(err => {
        console.log(err);
        reject(err);
      });
  });
}

export function getAnalystAndSubSegment() {
  return new Promise((resolve, reject) => {
    var query = {};
    query.where = { is_active: true };
    query.include = [{
      model: SubSegment,
      attributes: ['id', 'name'],
      as: 'SubSegment',
      include: [{
        model: Segment,
        attributes: ['id', 'name', 'client_id'],
        as: 'Segment'
      }]

    },
    {
      model: SubSegmentAnalyst,
      as: 'SubSegmentAnalyst',
      //where: { client_id: clientId },
      //required: false
    }];

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

export function getAnalysts() {
  return new Promise((resolve, reject) => {
    var query = {};
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

export function addAnalystToSubSegment(data) {
  return new Promise((resolve, reject) => {
    return SubSegmentAnalyst.create(data)
      .then(data => {
        resolve(data);
      })
      .catch(err => {
        throw err;
        reject(err);
      });
  });
}

export function saveClientSegments(clientId, segments) {
  return new Promise((resolve, reject) => {
    return sequelize.transaction(function (t) {
      return Segment.findAll({
        where: {
          client_id: clientId
        }
      })
        .then(rs => {
          if (rs == null) {
            return null;
          } else {
            //check and delete old segment
            var currentSegments = rs;
            currentSegments.forEach(currentSegment => {
              currentSegment.isDelete = true;
              segments.forEach(updateSegment => {
                if (currentSegment.id == updateSegment.id) {
                  currentSegment.isDelete = false;
                }
              });
            });
            var listFunc = [];
            currentSegments.forEach(currentSegment => {
              if (currentSegment.isDelete == true) {
                listFunc.push(destroySegment(currentSegment.id, t));
              }
            });
            return Promise.all(listFunc);
          }
        })
        .then((rs) => {
          var listFunc = [];
          segments.forEach(segment => {
            if (segment.client_id != null) {
              listFunc.push(createSegment(segment, clientId, t));
            }
          });
          return Promise.all(listFunc);
        })
        .then(rs => {
          resolve(true);
        })
        .catch(err => {
          reject(err);
        });
    })
      .catch(err => {
        console.log(err);
        reject(err);
      });
  });
}

export function deleteAnlystInSubSegment(id, clientId) {
  return new Promise((resolve, reject) => {
    return SubSegmentAnalyst.destroy({ where: { analyst_id: id, client_id: clientId } })
      .then(data => {
        resolve(data);
      })
      .catch(err => {
        reject(err);
      });
  });
}

export function deleteAnlystInKanban(id, subSegmentId, clientId) {
  return new Promise((resolve, reject) => {
    return SubSegmentAnalyst.destroy({ where: { analyst_id: id, sub_segment_id: subSegmentId, client_id: clientId } })
      .then(data => {
        resolve(data);
      })
      .catch(err => {
        reject(err);
      });
  });
}

export function deleteSubSegmentById(id) {
  return new Promise((resolve, reject) => {
    return SubSegment.destroy({ where: { id } })
      .then(data => {
        resolve(data);
      })
      .catch(err => {
        reject(err);
      });
  });
}


export function updateLabelSegment(data) {
  return new Promise((resolve, reject) => {
    return SubSegment.update(data, { where: { id: data.id } })
      .then(data => {
        resolve(data);
      })
      .catch(err => {
        throw err;
        reject(err);
      });
  });
}

export function addLabelSegment(data) {
  return new Promise((resolve, reject) => {
    return SubSegment.create(data)
      .then(data => {
        resolve(data);
      })
      .catch(err => {
        throw err;
        reject(err);
      });
  });
}

export function saveGlobalSegments(segments) {
  return new Promise((resolve, reject) => {
    return sequelize.transaction(function (t) {
      return Segment.findAll({
        where: {
          client_id: null
        }
      })
        .then(rs => {
          if (rs == null) {
            return null;
          } else {
            //check and delete old segment
            var currentSegments = rs;
            currentSegments.forEach(currentSegment => {
              currentSegment.isDelete = true;
              segments.forEach(updateSegment => {
                if (currentSegment.id == updateSegment.id) {
                  currentSegment.isDelete = false;
                }
              });
            });
            var listFunc = [];
            currentSegments.forEach(currentSegment => {
              if (currentSegment.isDelete == true) {
                listFunc.push(destroySegment(currentSegment.id, t));
              }
            });
            return Promise.all(listFunc);
          }
        })
        .then((rs) => {
          var listFunc = [];
          segments.forEach(segment => {
            listFunc.push(createSegment(segment, null, t));
          });
          return Promise.all(listFunc);
        })
        .then(rs => {
          return GlobalSetting.update({ last_updated: new Date() }, { where: { action: 'segment' } });
        })
        .then(rs => {
          resolve(true);
        })
    })
      .catch(err => {
        console.log(err);
        reject(err);
      });
  });
}


export function saveGlobalPlacement(updatePlacement) {
  return new Promise((resolve, reject) => {
    let placements = _.flatMap(updatePlacement, item => {
      return _.map(item.placement, placementItem => {
        let result = {};
        result.id = placementItem.id <= 0 || placementItem.id == null ? guid() : placementItem.id;
        result.placement_name = placementItem.placementName;
        result.firm_id = item.firm.id
        return result;
      });
    });
    return sequelize.transaction(function (t) {
      return FirmPlacement.findAll({
        where: {
          firm_id: {
            $ne: null
          }
        }
      })
        .then(rs => {
          if (rs == null) {
            return null;
          } else {
            //check and delete old segment
            var currentPlacements = rs;
            currentPlacements.forEach(currentPlacement => {
              currentPlacement.isDelete = true;
              placements.forEach(item => {
                if (item.id == currentPlacement.id) {
                  currentPlacement.isDelete = false;
                }
              });
            });
            var listFunc = [];
            currentPlacements.forEach(currentPlacement => {
              if (currentPlacement.isDelete) {
                listFunc.push(destroyPlacement(currentPlacement.id, t));
              }
            });
            return Promise.all(listFunc);
          }
        })
        .then((rs) => {
          var listFunc = [];
          placements.forEach(placement => {
            listFunc.push(createPlacemnt(placement, t));
          });
          return Promise.all(listFunc);
        })
        .then(rs => {
          return GlobalSetting.update({ last_updated: new Date() }, { where: { action: 'placement' } });
        })
        .then(rs => {
          resolve(true);
        })
    })
      .catch(err => {
        console.log(err);
        reject(err);
      });
  });

}

//
//--------------------------------------------- Private functions -----------------------------------------------------
//

function createSegment(segment, clientId, transaction) {
  return new Promise((resolve, reject) => {
    segment.id = segment.id <= 0 || segment.id == null ? guid() : segment.id;
    Segment.findOrCreate({
      where: { id: segment.id, client_id: clientId },
      defaults: { name: segment.name },
      transaction,
    })
      .spread((currentSegment, created) => {
        if (created) {
          segment.SubSegment.forEach(subSegment => {
            subSegment.id = guid();
            subSegment.segment_id = currentSegment.id;
          });
          return SubSegment.bulkCreate(segment.SubSegment, { transaction }).then(rs => {
            resolve(rs);
          });
        } else { //update segment
          return Segment.update({ name: segment.name }, {
            transaction,
            where: { id: segment.id, client_id: clientId }
          }).then(rs => {
            //create update & delete sub segment 😒
            return SubSegment.findAll({
              where: {
                segment_id: segment.id
              }
            })
              .then(rs => {
                //check and delete old sub segment
                var currentSubSegments = rs;
                currentSubSegments.forEach(currentSubSegment => {
                  currentSubSegment.isDelete = true;
                  segment.SubSegment.forEach(updateSubSegment => {
                    if (currentSubSegment.id == updateSubSegment.id) {
                      currentSubSegment.isDelete = false;
                    }
                  });
                });
                var listFunc = [];
                currentSubSegments.forEach(currentSubSegment => {
                  if (currentSubSegment.isDelete == true) {
                    listFunc.push(destroySubSegment(currentSubSegment.id, transaction));
                  }
                });
                return listFunc.length == 0 ? true : Promise.all(listFunc);
              })
              .then((rs) => {
                console.log('After delete all sub segment');
                var listFunc = [];
                segment.SubSegment.forEach(subSegment => {
                  listFunc.push(createOrUpdateSubSegment(subSegment, segment.id, transaction));
                });
                return listFunc.length == 0 ? true : Promise.all(listFunc);
              })
              .then(rs => {
                resolve(true);
              })
              .catch(err => {
                reject(err);
              });
          });
        }
      });
  });
}

function createPlacemnt(placemnt, t) {
  return new Promise((resolve, reject) => {
    return FirmPlacement.upsert(placemnt, { transaction: t })
      .then(rs => {
        resolve(true);
      })
      .catch(err => {
        reject(err);
      });
  });
}

function createOrUpdateSubSegment(subSegment, segmentId, transaction) {
  return new Promise((resolve, reject) => {
    console.log(subSegment.id);
    subSegment.id = (subSegment.id <= 0 || subSegment.id == null) ? guid() : subSegment.id;
    SubSegment.findOrCreate({
      where: { id: subSegment.id },
      defaults: { name: subSegment.name, segment_id: segmentId },
      transaction,
    })
      .spread((currentSubSegment, created) => {
        if (!created) {
          return SubSegment.update({ name: subSegment.name }, {
            transaction,
            where: { id: subSegment.id, segment_id: segmentId }
          })
            .then(rs => resolve(true))
            .catch(err => {
              throw err;
            });
        } else {
          resolve(true);
        }
      })
      .catch(err => {
        reject(err);
      });
  });
}

function destroySegment(segmentId, transaction) {
  return new Promise((resolve, reject) => {
    var listSubSegments = [];
    SubSegment.findAll({
      where: { segment_id: segmentId }
    })
      .then(rs => {
        var listFunc = [];
        listSubSegments = rs;
        listSubSegments.forEach(subSegment => {
          listFunc.push(SubSegmentAnalyst.destroy({
            transaction,
            where: { sub_segment_id: subSegment.id }
          }));
        });
        return Promise.all(listFunc);
      })
      .then(rs => {
        var listFunc = [];
        listSubSegments.forEach(subSegment => {
          listFunc.push(SubSegment.destroy({
            transaction,
            where: { id: subSegment.id }
          }));
        });
        return Promise.all(listFunc);
      })
      .then(rs => {
        return Segment.destroy({
          transaction,
          where: { id: segmentId }
        });
      })
      .then(rs => {
        resolve(rs);
      })
      .catch(err => {
        reject(err);
      });
  });
}

function destroyPlacement(placementId, transaction) {
  return new Promise((resolve, reject) => {
    return FirmPlacement.update({
      is_active: false,
    }, {
        where: { id: placementId },
        transaction
      })
      .then(rs => {
        resolve(rs);
      })
      .catch(err => {
        reject(err);
      });
  });
}

function destroySubSegment(subSegmentId, transaction) {
  return new Promise((resolve, reject) => {
    return SubSegmentAnalyst.destroy({
      transaction,
      where: { sub_segment_id: subSegmentId }
    }).then(rs => {
      return SubSegment.destroy({
        transaction,
        where: { id: subSegmentId }
      });
    })
      .then(rs => {
        resolve(rs);
      })
      .catch(err => {
        reject(err);
      });
  });
}

function guid() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }

  return `${s4() + s4()}-${s4()}-${s4()}-${s4()}-${s4()}${s4()}${s4()}`;
}

function createClientGlobalSegment(clientId, globalSegment) {
  return new Promise((resolve, reject) => {
    return Segment.create({
      id: guid(),
      client_id: clientId,
      name: globalSegment.name,
      clone_from: globalSegment.id
    })
      .then((currentSegment) => {
        var listFunc = [];
        globalSegment.SubSegment.forEach(subSegment => {
          subSegment.dataValues.id = guid();
          subSegment.dataValues.segment_id = currentSegment.id;
          listFunc.push(SubSegment.create(subSegment.dataValues));
        });
        return Promise.all(listFunc);
      })
      .then(() => {
        resolve(true);
      })
      .catch(err => {
        reject(err)
      })
  });
}

// ----------------------------- Migrate data for Segment feature from v1.3 to v2.0 ---------------------------
export function migrateDataSegmentFromV13ToV20() {
  return new Promise((resolve, reject) => {
    var maturitySegment = JSON.parse(JSON.stringify(CONSTANTS.maturitySegment));
    var listMaturitySubSegmentNames = maturitySegment.subSegments.map(subSegment => {
      return subSegment.name
    });
    var query = {};
    query.where = { is_active: true };
    query.include = [{
      model: MaturityByAnalyst,
      as: 'MaturityByAnalyst'
    }, {
      model: Client,
      as: 'Client'
    }, {
      model: Analyst,
      as: 'Analyst'
    }];
    ClientAnalystAlignmentHistory.findAll(query)
      .then(rs => {
        var listMaturityFunctions = [];
        var listCustomFunctions = [];
        rs.forEach(record => {
          var index = -1;
          listMaturitySubSegmentNames.forEach((maturitySubSegmentName, i) => {
            if (record.MaturityByAnalyst && record.MaturityByAnalyst.desc.indexOf(maturitySubSegmentName) > -1) {
              index = i;
            }
          })
          if (index > -1) {
            //Add to global maturity segment
            var subSegmentAnalystObj = {
              sub_segment_id: maturitySegment.subSegments[index].id,
              analyst_id: record.analyst_id,
              client_id: record.client_id
            }
            listMaturityFunctions.push(SubSegmentAnalyst.create(subSegmentAnalystObj));
          } else {
            //If it is not a maturity segment, add to custom segment
            listCustomFunctions.push(createCustomSegment(record));
          }
        })
        return Promise.all(listMaturityFunctions).then(rs => {
          return Promise.all(listCustomFunctions);
        });
      })
      .then(rs => {
        resolve(rs);
      })
      .catch(err => {
        console.log(err);
        reject(err);
      })
  })
}

function createCustomSegment(record) {
  return new Promise((resolve, reject) => {
    Segment.findOrCreate({
      where: { client_id: record.client_id, name: 'Maturity custom' }
    })
      .spread((currentSegment, created) => {
        if (created) {
          var subSegment = {};
          subSegment.id = guid();
          subSegment.name = record.MaturityByAnalyst ? record.MaturityByAnalyst.desc : "Unassigned";
          subSegment.segment_id = currentSegment.id;
          return SubSegment.create(subSegment).then(rs => {
            var subSegmentAnalystObj = {};
            subSegmentAnalystObj.sub_segment_id = rs.id;
            subSegmentAnalystObj.client_id = record.client_id;
            subSegmentAnalystObj.analyst_id = record.analyst_id;
            return SubSegmentAnalyst.findOrCreate({
              where: {
                sub_segment_id: subSegmentAnalystObj.sub_segment_id,
                client_id: subSegmentAnalystObj.client_id,
                analyst_id: subSegmentAnalystObj.analyst_id
              },
            });
          }).spread((currentSubSegmentAnalyst, created) => {
            resolve(currentSubSegmentAnalyst);
          }).catch(err => {
            console.log(err);
            reject(err);
          });
        } else {
          return SubSegment.findOrCreate({
            where: {
              name: record.MaturityByAnalyst ? record.MaturityByAnalyst.desc : "Unassigned",
              segment_id: currentSegment.id
            },
            defaults: { id: guid() }
          }).spread((currentSubSegment, created) => {
            var subSegmentAnalystObj = {};
            subSegmentAnalystObj.sub_segment_id = currentSubSegment.id;
            subSegmentAnalystObj.client_id = record.client_id;
            subSegmentAnalystObj.analyst_id = record.analyst_id;
            return SubSegmentAnalyst.findOrCreate({
              where: {
                sub_segment_id: subSegmentAnalystObj.sub_segment_id,
                client_id: subSegmentAnalystObj.client_id,
                analyst_id: subSegmentAnalystObj.analyst_id
              },
            });
          }).spread((currentSubSegmentAnalyst, created) => {
            resolve(currentSubSegmentAnalyst);
          }).catch(err => {
            console.log(err);
            reject(err);
          });
        }
      }).catch(err => {
        console.log(err);
        reject(err);
      });
  })
}


export function getAnalystAssocialClient(clientId) {
  let query = {}
  query.attributes = ['id', 'name'];
  query.include = [{
    model: SubSegmentAnalyst,
    as: 'SubSegmentAnalyst',
    where: {
      client_id: clientId
    },
    include: [{
      model: SubSegment,
      as: 'SubSegment',
      include: [{
        model: Segment,
        as: 'Segment',
        required: true
      }],
      required: true
    }],
    required: true,
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
  }, {
    model: Insight,
    as: 'Insights',
    attributes: ['id', 'sentiment', 'created_date'],
    required: false,
    include: [{
      model: InsightClient,
      as: 'InsightClient',
      where: { client_id: clientId },
      required: false
    }],
  },
  {
    model: Activity,
    as: 'Activities',
    required: false,
    where: {
      client_id: clientId,
      due_date: { lte: new Date() }
    },
    attributes: ['due_date', 'start_date', 'id'],
    include: [{
      model: Analyst,
      as: 'Analysts',
      required: false,
      attributes: ['name'],
      where: { is_active: true }
    }, {
      model: TaskType,
      required: false,
      attributes: ['desc'],
      where: { is_active: true }
    }]
  }];
  query.order = [[{
    model: Insight,
    as: 'Insights'
  }, 'created_date', 'DESC'],
  [{
    model: Activity,
    as: 'Activities'
  }, 'due_date', 'DESC', 'id', 'DESC']]
  query.where = {
    is_active: true
  }

  return new Promise((resolve, reject) => {
    return Analyst.findAll(query)
      .then((data) => {
        resolve(ListAnalystAssocialClientDto(data));
      })
      .catch(err => {
        console.log(err);
        reject(err)
      });
  });
}

export function getAnalystHasActivityForClientList(clientId) {
  return new Promise((resolve, reject) => {
    let query = `
    SELECT 
      activity_analysts.id AS activity_id,
      activity_analysts.task_name,
      activity_analysts.analyst_id AS activity_analyst_id,
      activity_analysts.desc AS activity_type,
      activity_analysts.date AS due_date,
      activity_analysts.start_date AS start_date,
      a.name AS analyst_name,
      f.name AS firm_name,
      f.id AS firmId,
      ah.title,
      GROUP_CONCAT(DISTINCT analyst.name ORDER BY analyst.name DESC SEPARATOR ', ') as all_analyst_name
    FROM
      (SELECT DISTINCT
        analyst_id
      FROM
        sub_segment_analyst
      WHERE
        client_id = :clientId ) AS segment_analyst
        RIGHT JOIN
      (SELECT DISTINCT
        ata.analyst_id AS analyst_id,
            ata.task_name,
            ata.id,
            ata.desc,
            ata.date,
            ata.date as start_date
      FROM
        all_task_activity AS ata
      WHERE
        client_id = :clientId
        AND ata.date > DATE_SUB((DATE_SUB(CURDATE(), INTERVAL 6 MONTH)), INTERVAL 0 DAY)
        ORDER BY ata.date DESC) AS activity_analysts ON activity_analysts.analyst_id = segment_analyst.analyst_id
        LEFT JOIN
      analyst_history AS ah ON ah.analyst_id = activity_analysts.analyst_id
        AND ah.is_active_record
        LEFT JOIN
      firm AS f ON ah.firm_id = f.id
        INNER JOIN
      analyst AS a ON a.id = ah.analyst_id
        LEFT JOIN
      activity_analyst AS aa ON aa.activity_id = activity_analysts.id
      left join analyst as analyst on aa.analyst_id = analyst.id and analyst.is_active = true
    WHERE
      segment_analyst.analyst_id IS NULL
      group by a.name`;

    let calculatorSentimentQuery = `
    (SELECT 
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
          insight_client.client_id = :clientId) AS insight_analyst_client 
        
        INNER JOIN insight
          ON insight_analyst_client.insight_id = insight.id
        ORDER BY insight_analyst_client.analyst_id , created_date DESC) result) final
      WHERE
          final.rn < 10 and  final.analyst_id in (:listAnalystId)
      GROUP BY final.analyst_id);`;

    return sequelize.query(query, {
      replacements: { clientId: clientId },
      type: sequelize.QueryTypes.SELECT
    })
      .then(data => {
        let listAnalystActivity = data;

        let listAnalystId = _.map(listAnalystActivity, item => {
          return item.activity_analyst_id;
        });
        if (listAnalystId.length === 0) {
          resolve(listAnalystActivity);
        } else {
          return sequelize.query(calculatorSentimentQuery, {
            replacements: {clientId : clientId, listAnalystId: listAnalystId },
            type: sequelize.QueryTypes.SELECT
          })
            .then(data => {
              _.forEach(listAnalystActivity, item => {
                let temp = _.find(data, analyst => {
                  return analyst.analyst_id == item.activity_analyst_id;
                });
                item.sentiment = temp ? temp.sentiment : 0;
              })
              let result = _.uniqBy(listAnalystActivity, 'activity_analyst_id');
              resolve(result);
            })
            .catch(err => {
              console.log(err);
              reject(err);
            });
        }
      })
      .catch(err => {
        console.log(err);
        reject(err);
      });
  })
}

export function getAnalystUnassigned(clientId) {
  return new Promise((resolve, reject) => {
    var query = { attributes: ['id', 'name'] };
    query.where = { is_active: true };
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
      }]
    }, {
      model: Firm,
      required: false,
      attributes: ['id', 'name'],
      as: 'Firm',
      where: { is_active: true }
    }];
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

export function getAnalystHasActivityWithClient(clientId) {
  return new Promise((resolve, reject) => {
    let query = `SELECT 
      a.id AS analystId,
      a.name AS analystName,
      ata.client_id AS clientId,
      f.name AS firmName
  FROM
      all_task_activity AS ata
          INNER JOIN
      analyst AS a ON ata.analyst_id = a.id
          LEFT JOIN
      analyst_history AS ah ON ah.analyst_id = a.id
          AND ah.is_active_record = TRUE
          LEFT JOIN
      firm AS f ON ah.firm_id = f.id AND f.is_active = TRUE
  WHERE
      ata.client_id = ? AND a.is_active = true
  GROUP BY ata.analyst_id;`;
    return sequelize.query(query, { replacements: [clientId], type: sequelize.QueryTypes.SELECT })
      .then(data => {
        resolve(ListAnalystHasActivityWithClientDto(data));
      })
      .catch(err => {
        reject(err);
      });
  })
}

export function getAnalystHasActivityWithCollection(collectionId) {
  return new Promise((resolve, reject) => {
    let query = `SELECT 
    a.id AS analystId,
    a.name AS analystName,
    ata.client_id AS clientId,
    f.name AS firmName,
    c.name AS clientName,
    c.id AS clientId
FROM
    all_task_activity AS ata
        INNER JOIN
    analyst AS a ON ata.analyst_id = a.id
        LEFT JOIN
    analyst_history AS ah ON ah.analyst_id = a.id
        AND ah.is_active_record = TRUE
        LEFT JOIN
    firm AS f ON ah.firm_id = f.id AND f.is_active = TRUE
        LEFT JOIN
    client AS c ON ata.client_id = c.id
        AND c.is_active = TRUE
WHERE
    ata.client_id IN (?) AND a.is_active = true
GROUP BY ata.analyst_id;`;

    return CollectionClient.findAll({
      where: {
        collection_id: collectionId,
      }
    }).then(clients => {
      let clientIds = _.map(clients, function (item) {
        return item.dataValues.client_id
      });

      return sequelize.query(query, { replacements: [clientIds], type: sequelize.QueryTypes.SELECT })
        .then(data => {
          resolve(ListAnalystHasActivityWithClientDto(data));
        })
        .catch(err => {
          reject(err);
        });
    });
  })
}

export function getAllSimpleClients(includeInactive) {
  var clientObject = {
    model: Client,
    where: {}
  }
  if (includeInactive) {
    clientObject = {
      model: Client
    }
  }
  return new Promise((resolve, reject) => {
    return ClientHistory.findAll({
      include: [
        clientObject,
      ],
      where: {
        is_active_record: true
      },
    })
      .then(function (data) {
        resolve(data);
      })
      .catch(err => {
        console.log(err);
        reject(err)
      });
  });
}

export function getAnalystbyClientId(clientId) {
  return new Promise((resolve, reject) => {
    return Analyst.findAll({
      attributes: ['id', 'name'],
      include: [{
        model: SubSegmentAnalyst,
        as: 'SubSegmentAnalyst',
        attributes: [],
        include:[{
          model: SubSegment,
          as: 'SubSegment',
          attributes: ['name'],
          where: { name: 'Core'},
          require: true
        }],
        where: { client_id: clientId },
        require: true
      }],
      where: { is_active: true
      },
    })
      .then(function (data) {
        resolve(data);
      })
      .catch(err => {
        console.log(err);
        reject(err)
      })
  })
}

export function getClientImage(id) {
  return new Promise((resolve, reject) => {
    return ClientMedia.findOne({
      include: [
        {
          model: Media,
          as: 'Media'
        }
      ],
      where: {
        client_id: id,
        is_active: true,
        media_type: 'avatar'
      }
    }).then(image => {
      if (image !== null) {
        resolve(image);
      } else {
        resolve('');
      }
    })
      .catch(err => {
        reject(err);
      });
  });
}

export function getPublishClientById(id) {
  return new Promise((resolve, reject) => {
    return Client.findOne({ where: { id } })
      .then(data => {
        resolve(data);
      })
      .catch(err => {
        reject(err);
      });
  });
}

export function countCoreSegment(clientId) {
  return new Promise((resolve, reject) => {
    var query = `SELECT 
    *
FROM
    sub_segment_analyst as a
    LEFT JOIN sub_segment as b on b.id = a.sub_segment_id
WHERE
		b.name = 'Core'
        AND client_id = ? ;`
    return sequelize.query(query, { replacements: [clientId], type: sequelize.QueryTypes.SELECT })
      .then(data => {
        resolve(data);
      })
      .catch(err => {
        reject(err);
      });
  });
}

export function addClient(data, groups, clientHistorydata, assigned) {
  return new Promise((resolve, reject) => {
    let client = null;
    let firmClients = data.Client.AnalystFirmSubscription;
    return sequelize.transaction(async function (t) {
      var listFunction = [];
      client = await Client.create(data.Client, { transaction: t });
      clientHistorydata.client_id = client.id;
      await ClientHistory.create(clientHistorydata, { transaction: t });
      for (let i = 0; i < data.Research.length; i++) {
        let item = data.Research[i];
        let date = new Date();
        date.setSeconds(date.getSeconds() + i * 10);
        await ClientResearchCategories.create({
          id: uuid() || '',
          client_id: client.id,
          research_id: item.id == undefined ? item : item.id,
          is_active: item.is_active == undefined ? true : item.is_active,
          last_update: date
        }, { transaction: t });
      }
      assigned.forEach(userId => {
        listFunction.push(ClientAssigned.create({ user_id: userId.id, client_id: client.id }));
      })
      firmClients.forEach(firm => {
        listFunction.push(FirmClient.create({ client_id: client.id, firm_id: firm.id, last_update: new Date() }));
      })
      groups.forEach(group => {
        listFunction.push(executeUpdateGroup(group, client.id, data.templateID));
      });
      Promise.all(listFunction);
    })
      .then(data => {
        resolve(client);
      })
      .catch(err => {
        console.log(err);
        reject(err)
      });
  });
}

export function updateClient(data, groups, clientHistorydata, assigned, oldClient) {
  return new Promise((resolve, reject) => {
    let client = data.Client;
    let firmClients = data.Client.AnalystFirmSubscription;
    return sequelize.transaction(async (t) => {
      return Client.update(data.Client, { where: { id: data.Client.id } }, { transaction: t }).then(rs => {
        return ClientHistory.update({ is_active_record: false }, { where: { client_id: data.Client.id } }, { transaction: t });
      }).then(rs => {
        return ClientHistory.create(clientHistorydata, { transaction: t });
      }).then(rs => {
        var listFunctions = [];
        //update firm

        //update research categories
        if (data.Research.length > 0) {
          for (let i = 0; i < data.Research.length; i++) {
            let item = data.Research[i];
            let date = new Date();
            date.setSeconds(date.getSeconds() + i * 10);
            listFunctions.push(ClientResearchCategories.upsert({
              id: item.ClientResearchCategoriesId,
              client_id: data.Client.id,
              research_id: item.id == undefined ? item : item.id,
              is_active: item.is_active == undefined ? true : item.is_active,
              last_update: date
            }, { transaction: t }));
          }
        }

        listFunctions.push(ClientAssigned.destroy({ where: { client_id: client.id } }));
        listFunctions.push(FirmClient.destroy({ where: { client_id: client.id } }));
        return Promise.all(listFunctions);
      })
        .then(() => {
          var listFunctions = [];
          assigned.forEach(userId => {
            listFunctions.push(ClientAssigned.create({ user_id: userId.id, client_id: client.id }));
          })
          firmClients.forEach(firm => {
            listFunctions.push(FirmClient.create({ client_id: client.id, firm_id: firm.id, last_update: new Date() }));
          })
          groups.forEach(group => {
            listFunctions.push(executeUpdateGroup(group, client.id, data.templateID));
          });
          return Promise.all(listFunctions);
        })
        .then(() => {
          var objectSaveLog = {
            user: data.user,
            templatePage: CONSTANTS.pageTemplate.CLIENT_PROFILE,
            section: CONSTANTS.section.CLIENT_DETAILS,
            id: data.Client.id,
            name: data.Client.name
          }

          data.Client.origination_date = data.Client.origination_date ? data.Client.origination_date.slice(0, 10) : new Date();
          oldClient.Client.origination_date = oldClient.Client.origination_date ? oldClient.Client.origination_date.slice(0, 10) : new Date();
          let refColumns = [['Client', 'name'], ['Client', 'is_active'], ['ClientHistory', 'monthly_recurring_revenue'], ['ClientHistory', 'analyst_plan'], ['Client', 'origination_date'], ['ClientHistory', 'team_email'], ['ClientHistory', 'address'], ['ClientHistory', 'countryName'], ['ClientHistory', 'city'], ['ClientHistory', 'phone'], ['ClientHistory', 'stateName'], ['ClientHistory', 'zipCode'], ['ClientHistory', 'websiteUrl'], ['ClientHistory', 'profileDescription'], ['ClientHistory', 'churn_date'], ['ChurnReason'], ['Client', 'AnalystFirmSubscription', 'name']];
          let refColumnNames = ['Name', 'Status', 'MRR', 'Analyst Plan', 'Origination Date', 'Team Email', 'Address', 'Country', 'City', 'Phone', 'State', 'Zip code', 'Website URL', 'Profile Description', 'Churn Date', 'Churn Reason', 'Research Firm Subscription'];

          addLog(data, oldClient, refColumns, refColumnNames, objectSaveLog);
          resolve();
        })
        .catch((err) => {
          console.log(err);
          reject(err);
        });
    });
  });
}

let addLog = function (newObject, oldObject, refColumns, refColumnNames, objectSaveLog) {
  newObject.Research = newObject.Research.filter(function (item) {
    return item.is_active == true;
  });
  delete newObject.group;
  delete oldObject.group;
  if (newObject.ClientHistory.country !== oldObject.ClientHistory.country) {
    let query = `SELECT * FROM country where code = ? or code = ?`;
    let queryState = `SELECT * FROM state where code = ? or code = ?`;
    return sequelize.query(query, {
      replacements: [newObject.ClientHistory.country, oldObject.ClientHistory.country],
      type: sequelize.QueryTypes.SELECT
    })
      .then(resData => {
        newObject.ClientHistory.countryName = '';
        oldObject.ClientHistory.countryName = '';
        _.forEach(resData, item => {
          if (item.code == newObject.ClientHistory.country) {
            newObject.ClientHistory.countryName = item.country_name;
          }
          if (item.code == oldObject.ClientHistory.country) {
            oldObject.ClientHistory.countryName = item.country_name;
          }
        });

        return sequelize.query(queryState, {
          replacements: [newObject.ClientHistory.state, oldObject.ClientHistory.state],
          type: sequelize.QueryTypes.SELECT
        })
          .then(resData => {
            newObject.ClientHistory.stateName = '';
            oldObject.ClientHistory.stateName = '';
            _.forEach(resData, item => {
              if (item.code == newObject.ClientHistory.state) {
                newObject.ClientHistory.stateName = item.state_name;
              }
              if (item.code == oldObject.ClientHistory.state) {
                oldObject.ClientHistory.stateName = item.state_name;
              }
            });

            let listModelChange = changeLogHelper.getChangeLog(refColumns, refColumnNames, newObject, oldObject, objectSaveLog);
            changeLogHelper.createActivityLog(listModelChange);
          });
      });
  } else {
    let listModelChange = changeLogHelper.getChangeLog(refColumns, refColumnNames, newObject, oldObject, objectSaveLog);
    changeLogHelper.createActivityLog(listModelChange);
  }
};

var executeUpdateGroup = function (group, client_id, template_id) {
  return new Promise(async (resolve, reject) => {
    let checkUpdateGroupItem = group.client_id != null;
    let checGroupkAddEdit = group.id != null;
    group.visibility = group.visibility != '0';
    var currentId = -1;

    if (checGroupkAddEdit) {
      if (checkUpdateGroupItem) {
        await Groups.update(group, { where: { id: group.id, client_id: group.client_id } });
        currentId = group.id;
      }
    } else {
      group.template_id = template_id;
      group.client_id = client_id;
      await Groups.max('index', {
        where: { template_id, is_active: true }
      });
      var group_new = await Groups.create(group);
      currentId = group_new.id;
    }

    if (checGroupkAddEdit && !checkUpdateGroupItem) {
      resolve(null);
    }
    var arrayPromise = [];
    var group_id = currentId;
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
        console.log(err);
        resolve(null);
      });
  });
};

export async function getClientAssignedToCurrentUser(email, name, role, listClientId13) {
  return new Promise((resolve, reject) => {
    var listResult = [];
    var currentUser = {};
    return User.findOne({ where: { email: email } })
      .then(user => {
        currentUser = user;
        return Client.findAll({
          where: { is_active: true },
          include: [{
            model: User,
            as: 'Assigneds',
            attributes: ['id', 'full_name'],
            required: true,
            where: { id: user.id }
          }]
        });
      })
      .then(data => {
        listResult = _.map(data, function (item) {
          return item.dataValues
        });
        if (role !== CONSTANTS.role.spotlightAdmin) {
          if (listClientId13 && listClientId13.length > 0) {
            let query = `SELECT DISTINCT client.id, client.name
                          FROM client_history AS ch
                          LEFT JOIN client ON ch.client_id = client.id
                          WHERE client.id IN (:clientIds13) AND ch.is_active_record = 1 AND client.is_active = 1`;

            let clientIds = _.map(data, function (item) {
              return item.dataValues.id
            });
            if (clientIds && clientIds.length > 0) {
              query += ` AND client.id NOT IN (:clientIds)`;
            }

            return sequelize.query(query, {
              replacements: { clientIds: clientIds, clientIds13: listClientId13 },
              type: sequelize.QueryTypes.SELECT
            });
          } else {
            return new Promise(resolve => {
              resolve([]);
            });
          }
        } else {
          return new Promise(resolve => {
            resolve([]);
          });
        }       
      })
      .then(data => {
        listResult = [...listResult, ...data];
        User.update({ client_ids: listResult.map(client => { return client.id }).join(',') }, { where: { email: email } })
        resolve(listResult);
      })
      .catch(err => {
        reject(err);
      });
  });
}

export function getSubSegmentIdForAnalyst(analystId, clientId) {
  return new Promise(async (resolve, reject) => {
    let query = {};
    query.include = [{
      model: SubSegmentAnalyst,
      as: 'SubSegmentAnalyst',
      attributes: [],
      where: { analyst_id: analystId, client_id: clientId },
      required: true
    }]
    return SubSegment.findAll(query)
      .then(data => {
        resolve(data);
      })
      .catch(error => {
        console.log(error);
        reject(error);
      })
  })
}

export function addAnalystToSegments(data) {
  let clientId = data.clientId;
  let analystId = data.analystId;
  let subSegments = data.subSegments;
  return new Promise(async (resolve, reject) => {
    let Promises = [];
    await SubSegmentAnalyst.destroy({ where: { analyst_id: analystId, client_id: clientId } })
    subSegments.forEach(subSegment => {
      let data = {
        analyst_id: analystId,
        client_id: clientId,
        sub_segment_id: subSegment.id
      }
      Promises.push(SubSegmentAnalyst.create(data));
    })
    return Promise.all(Promises)
      .then(data => {
        resolve(data);
      })
      .catch(error => {
        console.log(error);
        reject(error);
      })
  })
}

export function getClientById(clientId, includeInactive) {
  return new Promise(async (resolve, reject) => {
    var query = {
      include: [
        {
          model: Client,
          where: {
            id: clientId,
            //is_active: true
          },
          required: true,
          include: [
            {
              model: ClientHealthHistory,
              as: 'ClientHealthHistories'
            },
            {
              model: Research,
              through: { where: { is_active: true } }
            },
            {
              model: User,
              as: 'Assigneds',
              required: false
            },
            {
              model: FirmClient,
              as: 'FirmClients',
              required: false,
              include: [{
                model: Firm,
                where: { is_active: true },
                required: false,
              }]
            }
          ],
          order: [['name', 'ASC']]
        },
        {
          model: ClientType
        },
        {
          model: Collection
        },
        {
          model: ChurnReason
        },
        {
          model: Effort
        },
        {
          model: SegmentationType
        }
      ],
      where: {
        is_active_record: true
      }
    }

    if (!includeInactive) {
      query.include[0].where.is_active = true;
    }
    return ClientHistory.findAll(query)
      .then(function (data) {
        resolve(ListClientDto(data));
      })
      .catch(error => {
        console.log(error);
        reject(error);
      })
  })
}

export function getClientsByObjectId(objectId, objectType) {
  switch (objectType) {
    case CONSTANTS.insightObjectType.Activity:
      return getClientIdsByActivityId(objectId);
    case CONSTANTS.insightObjectType.Analyst:
      return getClientIdsByAnalystId(objectId);
    case CONSTANTS.insightObjectType.Event:
      return getClientIdsByEventId(objectId);
    case CONSTANTS.insightObjectType.Report:
      return getClientIdsByReportId(objectId);
    default:
      return new Promise((resolve, reject) => { resolve([]) });
  }
}

function getClientIdsByActivityId(activityId) {
  return new Promise((resolve, reject) => {
    var query = {};
    query.attributes = ['client_id']
    query.where = { id: activityId };

    return Activity.findOne(query)
      .then((data) => {
        data && data.client_id ? resolve([data.client_id]) : resolve([]);
      })
      .catch(function (err) {
        console.log(err);
        reject(err);
      })
  });
}

export function getClientIdsByAnalystId(analystId) {
  return new Promise((resolve, reject) => {
    let join = Promise.join
    join(getClientIdsAssocialAnalyst(analystId), getClientIdsAssocialAnalystViaActivity(analystId), (clientsAssocialAnalyst, clientsAssocialAnalystViaActivity) => {
      let joinedClientData = _.concat(clientsAssocialAnalyst, clientsAssocialAnalystViaActivity);
      resolve(_.uniq(joinedClientData));
    })
  });
}

function getClientIdsByEventId(eventId) {
  return new Promise((resolve, reject) => {
    let query = {};
    query.attributes = ['client_id']
    query.where = {
      event_id: eventId
    }

    return EventClient.findAll(query)
      .then(data => {
        if (data != null) {
          let clientIds = _.map(data, client => {
            return client.client_id;
          })
          resolve(clientIds);
        } else {
          resolve([]);
        }
      })
      .catch(err => {
        reject(err);
      });
  })
}

function getClientIdsByReportId(reportId) {
  return new Promise((resolve, reject) => {
    var query = {};
    query.attributes = ['client_id'];
    query.where = { ranking_report_id: reportId, is_active: true };

    return ClientRankingReport.findAll(query)
      .then(clientData => {
        if (clientData != null) {
          let ClientIds = _.map(clientData, clientRankingReport => {
            return clientRankingReport.client_id;
          })
          resolve(ClientIds);
        } else {
          resolve([])
        }
      })
      .catch((err) => {
        console.log(err);
        reject(err);
      });
  });
}

function getClientIdsAssocialAnalyst(analystId) {
  let query = {};
  query.attributes = ['client_id']
  query.where = {
    analyst_id: analystId
  }

  return new Promise((resolve, reject) => {
    return SubSegmentAnalyst.findAll(query)
      .then(data => {
        if (data != null) {
          let clientIds = _.map(data, subSegmentAnalyst => {
            return subSegmentAnalyst.client_id;
          })
          resolve(clientIds);
        } else {
          resolve([]);
        }
      })
      .catch(err => {
        console.log(err);
        reject(err)
      });
  });
}

function getClientIdsAssocialAnalystViaActivity(analystId) {
  return new Promise((resolve, reject) => {
    var query = `
    SELECT DISTINCT
        (c.id)
    FROM
        activity_analyst AS a
            INNER JOIN
        activity AS b ON a.activity_id = b.id
            INNER JOIN
        client AS c ON b.client_id = c.id
    WHERE
        a.analyst_id = ?
        group by c.id`;

    return sequelize.query(query, {
      replacements: [analystId],
      type: sequelize.QueryTypes.SELECT
    })
      .then(clientData => {
        if (clientData != null) {
          let listClientId = _.map(clientData, client => {
            return client.id;
          })
          resolve(listClientId);
        } else {
          resolve([])
        }
      })
      .catch(err => {
        console.log(err)
        reject(err);
      });

  })
}

export function getCategoriesByClient(clientId) {
  return new Promise((resolve, reject) => {
    var query = `
      SELECT DISTINCT (b.id), b.desc
      FROM
        client_research_category AS a
        INNER JOIN
        research AS b ON b.id = a.research_id
            AND b.is_active = TRUE
      WHERE
        a.client_id = :clientId
        AND a.is_active = TRUE
        group by a.research_id
      ORDER BY a.last_update ASC;`;
    return sequelize.query(query, {
      replacements: { clientId: clientId },
      type: sequelize.QueryTypes.SELECT
    })
      .then(data => {
        resolve(data);
      })
      .catch(err => {
        console.log(err)
        reject(err);
      });
  })
}