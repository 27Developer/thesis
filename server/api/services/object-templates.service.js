'use strict';

import log4Js from 'log4js/lib/log4js';
import * as responseHelper from '../../components/helper/response-helper';
import config from '../../config/environment/shared';
import * as changeLogHelper from '../../components/helper/change-log-helper';
log4Js.configure({
  appenders: [
    { type: 'file', filename: 'logs/object-templates-controller.log', category: 'object-templates-controller' }
  ]
});
var logger = log4Js.getLogger('object-templates-controller');
import {
  ObjectTemplates,
  Groups,
  Items,
  AnalystItem,
  ClientItem,
  FirmItem,
  ReportItem,
  ResearchItem,
  AnalystClientViewItem,
  EventItem,
  ActivityItem,
  sequelize,
  MarketItem,
  CollectionItem
} from '../../sqldb';
import _ from 'lodash';
var Promise = require('bluebird');


export function getListObjectTemplates() {
  return new Promise((resolve, reject) => {
    return ObjectTemplates.findAll({
      include: [{
        model: Groups,
        required: false,
        where: { client_id: null, firm_id: null, event_id: null, market_id: null, report_id: null, collection_id: null, is_active: true },
        order: [['index', 'ASC']],
      }],
      where: { is_active: true }
    })
      .then(rs => {
        resolve(rs);
      })
      .catch(err => {
        reject(err);
      });
  })
}

export function getListGroupByTemplateId(templateId) {
  return new Promise((resolve, reject) => {
    return Groups.findAll({
      include: [
        Items
      ],
      where: { template_id: templateId, is_active: true, client_id: null, firm_id: null, event_id: null },
      order: [['index', 'ASC']]
    })
      .then(rs => {
        resolve(rs);
      })
      .catch(err => {
        reject(err);
      });
  })
}

export function   getListGroupByTemplateIdAndClientId(templateId, clientId) {
  return new Promise((resolve, reject) => {
    return Groups.findAll({
      include: [{
        model: Items,
        required: false,
        where: {
          is_active: true,
        },
      }],
      where: {
        is_active: {
          $eq: true
        },
        template_id: {
          $eq: templateId
        },
        $or: [
          {
            client_id: {
              $eq: clientId
            }
          },
          {
            client_id: {
              $eq: null
            },
          }
        ]
      },
      order: [['index', 'ASC'],
      [{ model: Items }, 'index', 'ASC']]
    })
      .then(rs => {
        resolve(rs);
      })
      .catch(err => {
        reject(err);
      });
  })
}

export function addGroup(group) {
  // var group = {
  //   id: req.body.data.id,
  //   index: req.body.data.index == undefined ? 1 : req.body.data.index,
  //   group_name: req.body.data.name,
  //   visibility: req.body.data.status == '1',
  //   template_id: req.body.data.templateId,
  //   is_active: true,
  //   last_update: new Date()
  // };
  return new Promise((resolve, reject) => {
    var arrayPromise = [];
    var checkIdAddUpdate = group.id != null;
    var group_id = group.id;

    return sequelize.transaction(async function (t) {
      await ObjectTemplates.update({ last_update: new Date() }, { where: { id: group.template_id } })
      if (checkIdAddUpdate) {
        await Groups.update(group, {
          where: { id: group.id }
        }, { transaction: t })
          .then(data => {
          })
          .catch(err => {
            throw err;
          });
      } else {
        delete group.id;
        if (group.index !== 1) {
          await Groups.max('index', {
            where: { template_id: group.template_id, is_active: true }
          })
            .then(data => {
              group.index = Number(data) + 1;
            })
            .catch(err => {
              throw err;
            });
        }
        await Groups.create(group, { transaction: t })
          .then(data => {
            group_id = data.dataValues.id;
          })
          .catch(err => {
            throw err;
          });
      }

      await group.listItemInGroup.forEach(element => {
        let objTemp = {
          id: element.id ? element.id : null,
          group_id,
          index: element.index,
          item_name: element.item_name,
          item_type: element.item_type == 1,
          item_value: element.item_value,
          is_active: element.is_active === true ? 1 : 0,
          last_update: new Date(),
        };

        if (objTemp.id === null) {
          delete objTemp.id;
          arrayPromise.push(Items.create(objTemp, { transaction: t }));
        } else {
          arrayPromise.push(Items.update(objTemp,
            {
              where: { id: objTemp.id }
            }, { transaction: t }));
        }
      });
      return Promise.all(arrayPromise);
    })
      .then(rs => {
        resolve(rs);
      })
      .catch(err => {
        reject(err);
      });
  })
}

export function getListItemByGroupId(groupId) {
  //req.query.id
  return new Promise((resolve, reject) => {
    return Items.findAll({
      where: {
        group_id: groupId,
        is_active: true
      },
      order: [['index', 'ASC']]
    })
      .then(rs => {
        resolve(rs);
      })
      .catch(err => {
        reject(err);
      });
  })
}

export function saveChangeListGroup(listGroups) {
  //var listGroups = req.body.data;
  return new Promise((resolve, reject) => {
    var arrayPromise = [];

    return sequelize.transaction(function (t) {
      listGroups.forEach(group => {
        arrayPromise.push(Groups.update({
          index: group.index,
          template_id: group.template_id,
          group_name: group.group_name,
          visibility: group.visibility == '1',
          is_active: group.is_active,
          last_update: new Date()
        }, {
            where: { id: group.id }
          }, { transaction: t }));
      });
      arrayPromise.push(ObjectTemplates.update({ last_update: new Date() }, { where: { id: listGroups[0].template_id } }))
      return Promise.all(arrayPromise);
    })
      .then(rs => {
        resolve(rs);
      })
      .catch(err => {
        reject(err);
      });
  })
}

export function getListItemValueByAnalystId(analystId) {
  return new Promise((resolve, reject) => {
    return AnalystItem.findAll({
      where: {
        analyst_id: analystId,
      },
    })
      .then(rs => {
        resolve(rs);
      })
      .catch(err => {
        reject(err);
      });
  })
}

export function getListItemValueByClientId(clientId) {
  return new Promise((resolve, reject) => {
    return ClientItem.findAll({
      where: {
        client_id: clientId,
      },
    })
      .then(rs => {
        resolve(rs);
      })
      .catch(err => {
        reject(err);
      });
  })
}

export function getListItemValueByActivityId(activityId) {
  return new Promise((resolve, reject) => {
    return ActivityItem.findAll({
      where: {
        activity_id: activityId,
      },
    })
      .then(rs => {


        resolve(rs);
      })
      .catch(err => {
        reject(err);
      });
  })
}

export function getListItemValueByReportId(reportId) {
  //req.query.report_id
  return new Promise((resolve, reject) => {
    return ReportItem.findAll({
      where: {
        report_id: reportId,
      },
    })
      .then(rs => {
        resolve(rs);
      })
      .catch(err => {
        reject(err);
      });
  })
}

export function getListItemValueByFirmId(firmId) {
  //req.query.firm_id
  return new Promise((resolve, reject) => {
    return FirmItem.findAll({
      where: {
        firm_id: firmId,
      },
    })
      .then(rs => {
        resolve(rs);
      })
      .catch(err => {
        reject(err);
      });
  })
}

export function getListItemValueByResearchId(researchId) {
  //req.query.research_id
  return new Promise((resolve, reject) => {
    return ResearchItem.findAll({
      where: {
        research_id: researchId,
      },
    })
      .then(rs => {
        resolve(rs);
      })
      .catch(err => {
        reject(err);
      });
  })
}

export function getListItemValueByAnalystClientViewId(analystId, clientId) {
  return new Promise((resolve, reject) => {
    console.log("start get list item by analyst client view")
    return AnalystClientViewItem.findAll({
      where: {
        analyst_id: analystId,
        client_id: clientId
      },
    })
      .then(rs => {
        resolve(rs);
      })
      .catch(err => {
        console.log(err);
        reject(err);
      });
  })
}

export function updateActivityItemValue(activityItem) {
  var conflict = false;
  var detail;
  var last_updated_date;
  var last_updated_by;
  return new Promise((resolve, reject) => {

    return sequelize.transaction(async function (t) {
      return await ActivityItem.findOne({
        where: {
          item_id: activityItem.item_id,
          activity_id: activityItem.activity_id,
          detail: { $ne: '' }
        }
      })
        .then(result => {
          if (result) {
            activityItem.id = result.dataValues.id;

            var comp1 = new Date(result.dataValues.last_updated);
            var comp2 = new Date(activityItem.last_updated);
            if(result.dataValues.last_updated_by != activityItem.last_updated_by && comp1.toString() != comp2.toString()) {
              conflict = true;
              last_updated_date = result.dataValues.last_updated;
              last_updated_by = result.dataValues.last_updated_by;
              detail = result.dataValues.detail;
              throw new Error('Unable to save, Item has been modified');
            }

          }

          activityItem.last_updated = Date.now();
          last_updated_date = activityItem.last_updated;
          activityItem.last_updated_by = activityItem.last_updated_by;
          return ActivityItem.upsert(activityItem, { transaction: t });
        })
    })
      .then(data => {
        let logObj = {
          section: activityItem.group_name,
          summary: `${activityItem.item_name} was changed detail to ${activityItem.detail.replace(/!!!/g, ",")}`,
          user: activityItem.user,
          page: config.pageTemplate.ACTIVITY_PROFILE,
          object_id: activityItem.activity_id,
        };
        changeLogHelper.createChangeLog(logObj);
        resolve(last_updated_date);
      })
      .catch(err => {
          err.conflict = conflict;
          err.last_updated = last_updated_date;
          err.last_updated_by = last_updated_by;
          err.detail = detail;
          reject(err);

      });
  })
}

export function updateClientItemValue(clientItem) {
  var conflict = false;
  var detail;
  var last_updated_date;
  var last_updated_by;
  return new Promise((resolve, reject) => {
    return sequelize.transaction(async function (t) {
      return await ClientItem.findOne({
        where: {
          item_id: clientItem.item_id,
          client_id: clientItem.client_id,
          detail: { $ne: '' }
        }
      })
        .then(result => {
          if (result) {
            clientItem.id = result.dataValues.id;
            var comp1 = new Date(result.dataValues.last_updated);
            var comp2 = new Date(clientItem.last_updated);

            if(result.dataValues.last_updated_by != clientItem.last_updated_by && comp1.toString() != comp2.toString()) {
              conflict = true;
              last_updated_date = result.dataValues.last_updated;
              last_updated_by = result.dataValues.last_updated_by;
              detail = result.dataValues.detail;
              throw new Error('Unable to save, Item has been modified');
            }
          }
          clientItem.last_updated = Date.now();
          last_updated_date = clientItem.last_updated;
          clientItem.last_updated_by = clientItem.last_updated_by;
          return ClientItem.upsert(clientItem, { transaction: t });
        })
    })
      .then(data => {
        let logObj = {
          section: clientItem.group_name,
          summary: `${clientItem.item_name} was changed detail to ${clientItem.detail.replace(/!!!/g, ",")}`,
          user: clientItem.user,
          page: config.pageTemplate.CLIENT_PROFILE,
          object_id: clientItem.client_id,
        };
        changeLogHelper.createChangeLog(logObj);
        resolve(last_updated_date);
      })
      .catch(err => {
        err.conflict = conflict;
        err.last_updated = last_updated_date;
        err.last_updated_by = last_updated_by;
        err.detail = detail;
        reject(err);
      });
  })
}

export function updateAnalystItemValue(analystItem) {
  console.log(analystItem);
  var conflict = false;
  var detail;
  var last_updated_date;
  var last_updated_by;
  return new Promise((resolve, reject) => {
    return sequelize.transaction(async function (t) {
      return await AnalystItem.findOne({
        where: {
          item_id: analystItem.item_id,
          analyst_id: analystItem.analyst_id,
          detail: { $ne: '' }
        }
      })
        .then(result => {
          if (result) {
            analystItem.id = result.dataValues.id;
            var comp1 = new Date(result.dataValues.last_updated);
            var comp2 = new Date(analystItem.last_updated);

            if(analystItem.last_updated_by != result.dataValues.last_updated_by && comp1.toString()  != comp2.toString()) {
              conflict = true;
              last_updated_date = result.dataValues.last_updated;
              last_updated_by = result.dataValues.last_updated_by;
              detail = result.dataValues.detail;
              throw new Error('Unable to save, Item has been modified');
            }
          }
          analystItem.last_updated = Date.now();
          last_updated_date = analystItem.last_updated;
          last_updated_by = analystItem.last_updated_by;
          return AnalystItem.upsert(analystItem, { transaction: t });
        })
    })
      .then(data => {
        let logObj = {
          section: analystItem.group_name,
          summary: `${analystItem.item_name} was changed detail to ${analystItem.detail.replace(/!!!/g, ', ')}`,
          user: analystItem.user,
          page: config.pageTemplate.ANALYST_PROFILE,
          object_id: analystItem.analyst_id,
          group_id: analystItem.group_id,
          old_value: analystItem.oldDate,
        };
        changeLogHelper.createChangeLog(logObj);
        return resolve(last_updated_date);
      })
      .catch(err => {
        err.conflict = conflict;
        err.last_updated = last_updated_date;
        err.last_updated_by = last_updated_by;
        err.detail = detail;
        reject(err);
      });
  })
}

export function updateFirmItemValue(firmItem) {
  var conflict = false;
  var detail;
  var last_updated_date;
  var last_updated_by;
  return new Promise((resolve, reject) => {
    return sequelize.transaction(async function (t) {
      await FirmItem.findOne({
        where: {
          item_id: firmItem.item_id,
          firm_id: firmItem.firm_id,
          detail: { $ne: '' }
        }
      })
        .then(result => {
          if (result) {
            firmItem.id = result.dataValues.id;
            var comp1 = new Date(result.dataValues.last_updated);
            var comp2 = new Date(firmItem.last_updated);

            if(result.dataValues.last_updated_by != firmItem.last_updated_by && comp1.toString() != comp2.toString()) {
              conflict = true;
              last_updated_date = result.dataValues.last_updated;
              last_updated_by = result.dataValues.last_updated_by;
              detail = result.dataValues.detail;
              throw new Error('Unable to save, Item has been modified');
            }
          }
          firmItem.last_updated = Date.now();
          last_updated_date = firmItem.last_updated;
          firmItem.last_updated_by = firmItem.last_updated_by;
          return FirmItem.upsert(firmItem, { transaction: t });
        })
    })
      .then(data => {
        let logObj = {
          section: firmItem.group_name,
          summary: `${firmItem.item_name} was changed detail to ${firmItem.detail}`,
          user: firmItem.user,
          page: config.pageTemplate.FIRM_PROFILE,
          object_id: firmItem.firm_id,
        };
        changeLogHelper.createChangeLog(logObj);
        resolve(last_updated_date);
      })
      .catch(err => {
        err.conflict = conflict;
        err.last_updated = last_updated_date;
        err.last_updated_by = last_updated_by;
        err.detail = detail;
        reject(err);
      });
  })
}

export function updateResearchItemValue(researchItem) {
  var conflict = false;
  var detail;
  var last_updated_date;
  var last_updated_by;
  return new Promise((resolve, reject) => {
    return sequelize.transaction(async function (t) {
      await ResearchItem.findOne({
        where: {
          item_id: researchItem.item_id,
          research_id: researchItem.research_id,
          detail: { $ne: '' }
        }
      })
        .then(result => {
          if (result) {
            researchItem.id = result.dataValues.id;
            var comp1 = new Date(result.dataValues.last_updated);
            var comp2 = new Date(researchItem.last_updated);

            if(result.dataValues.last_updated_by != researchItem.last_updated_by && comp1.toString() != comp2.toString()) {
              conflict = true;
              last_updated_date = result.dataValues.last_updated;
              last_updated_by = result.dataValues.last_updated_by;
              detail = result.dataValues.detail;
              throw new Error('Unable to save, Item has been modified');
            }
          }
          researchItem.last_updated = Date.now();
          last_updated_date = researchItem.last_updated;
          researchItem.last_updated_by = researchItem.last_updated_by;
          return ResearchItem.upsert(researchItem, { transaction: t });
        })
    })
      .then(data => {
        let logObj = {
          section: researchItem.group_name,
          summary: `${researchItem.item_name} was changed detail to ${researchItem.detail}`,
          user: researchItem.user,
          page: config.pageTemplate.RESEARCH,
          object_id: researchItem.research_id,
        };
        changeLogHelper.createChangeLog(logObj);
        resolve(last_updated_date);
      })
      .catch(err => {
        err.conflict = conflict;
        err.last_updated = last_updated_date;
        err.last_updated_by = last_updated_by;
        err.detail = detail;
        reject(err);
      });
  })
}

export function updateReportItemValue(reportItem) {
  var conflict = false;
  var detail;
  var last_updated_date;
  var last_updated_by;
  return new Promise((resolve, reject) => {
    return sequelize.transaction(async function (t) {
      await ReportItem.findOne({
        where: {
          item_id: reportItem.item_id,
          report_id: reportItem.report_id,
          detail: { $ne: '' }
        }
      })
        .then(result => {
          if (result) {
            reportItem.id = result.dataValues.id;
            var comp1 = new Date(result.dataValues.last_updated);
            var comp2 = new Date(reportItem.last_updated);

            if(result.dataValues.last_updated_by != reportItem.last_updated_by && comp1.toString() != comp2.toString()) {
              conflict = true;
              last_updated_date = result.dataValues.last_updated;
              last_updated_by = result.dataValues.last_updated_by;
              detail = result.dataValues.detail;
              throw new Error('Unable to save, Item has been modified');
            }
          }
          reportItem.last_updated = Date.now();
          last_updated_date = reportItem.last_updated;
          reportItem.last_updated_by = reportItem.last_updated_by;
          return ReportItem.upsert(reportItem, { transaction: t });
        })
    })
      .then(data => {
        let logObj = {
          section: reportItem.group_name,
          summary: `${reportItem.item_name} was changed detail to ${reportItem.detail}`,
          user: reportItem.user,
          page: config.pageTemplate.REPORT_PROFILE,
          object_id: reportItem.report_id,
        };
        changeLogHelper.createChangeLog(logObj);
        resolve(last_updated_date);
      })
      .catch(err => {
        err.conflict = conflict;
        err.last_updated = last_updated_date;
        err.last_updated_by = last_updated_by;
        err.detail = detail;
        reject(err);
      });
  })
}

export function updateAnalystClientViewItemValue(analystClientViewItem) {
  var conflict = false;
  var detail;
  var last_updated_date;
  var last_updated_by;
  return new Promise((resolve, reject) => {
    return sequelize.transaction(async function (t) {
      await AnalystClientViewItem.findOne({
        where: {
          item_id: analystClientViewItem.item_id,
          client_id: analystClientViewItem.client_id,
          analyst_id: analystClientViewItem.analyst_id,
          detail: { $ne: '' }
        }
      })
        .then(result => {
          if (result) {
            analystClientViewItem.id = result.dataValues.id;
            var comp1 = new Date(result.dataValues.last_updated);
            var comp2 = new Date(analystClientViewItem.last_updated);

            if(result.dataValues.last_updated_by != analystClientViewItem.last_updated_by && comp1.toString() != comp2.toString()) {
              conflict = true;
              last_updated_date = result.dataValues.last_updated;
              last_updated_by = result.dataValues.last_updated_by;
              detail = result.dataValues.detail;
              throw new Error('Unable to save, Item has been modified');
            }
          }
          analystClientViewItem.last_updated = Date.now();
          last_updated_date = analystClientViewItem.last_updated;
          analystClientViewItem.last_updated_by = analystClientViewItem.last_updated_by;
          return AnalystClientViewItem.upsert(analystClientViewItem, { transaction: t });
        })
    })
      .then(data => {
        let logObj = {
          section: analystClientViewItem.group_name,
          summary: `${analystClientViewItem.item_name} was changed detail to ${analystClientViewItem.detail}`,
          user: analystClientViewItem.user,
          page: config.pageTemplate.ANALYST_PROFILE,
          object_id: analystClientViewItem.analyst_id,
          group_id: analystClientViewItem.group_id,
          old_value: analystClientViewItem.oldDate,
        };
        changeLogHelper.createChangeLog(logObj);
        resolve(last_updated_date);
      })
      .catch(err => {
        err.conflict = conflict;
        err.last_updated = last_updated_date;
        err.last_updated_by = last_updated_by;
        err.detail = detail;
        reject(err);
      });
  })
}

export function updateEventItemValue(eventItem) {
  var conflict = false;
  var detail;
  var last_updated_date;
  var last_updated_by;
  return new Promise((resolve, reject) => {
    return sequelize.transaction(async function (t) {
      await EventItem.findOne({
        where: {
          item_id: eventItem.item_id,
          event_id: eventItem.event_id,
          detail: { $ne: '' }
        }
      })
        .then(result => {
          if (result) {
            eventItem.id = result.dataValues.id;
            var comp1 = new Date(result.dataValues.last_updated);
            var comp2 = new Date(eventItem.last_updated);

            if(result.dataValues.last_updated_by != eventItem.last_updated_by && comp1.toString() != comp2.toString()) {
              conflict = true;
              last_updated_date = result.dataValues.last_updated;
              last_updated_by = result.dataValues.last_updated_by;
              detail = result.dataValues.detail;
              throw new Error('Unable to save, Item has been modified');
            }
          }
          eventItem.last_updated = Date.now();
          last_updated_date = eventItem.last_updated;
          eventItem.last_updated_by = eventItem.last_updated_by;
          return EventItem.upsert(eventItem, { transaction: t });
        })
    })
      .then(data => {
        let logObj = {
          section: eventItem.group_name,
          summary: `${eventItem.item_name} was changed detail to ${eventItem.detail}`,
          user: eventItem.user,
          page: config.pageTemplate.EVENT_PROFILE,
          object_id: eventItem.event_id,
        };
        changeLogHelper.createChangeLog(logObj);
        resolve(last_updated_date);
      })
      .catch(err => {
        err.conflict = conflict;
        err.last_updated = last_updated_date;
        err.last_updated_by = last_updated_by;
        err.detail = detail;
        reject(err);
      });
  })
}

export function getListItemValueByEventId(eventId) {
  //req.query.firm_id
  return new Promise((resolve, reject) => {
    return EventItem.findAll({
      where: {
        event_id: eventId,
      },
    })
      .then(rs => {
        resolve(rs);
      })
      .catch(err => {
        reject(err);
      });
  })
}

export function getListItemValueByMarketId(marketId) {
  return new Promise((resolve, reject) => {
    return MarketItem.findAll({
      where: {
        market_id: marketId,
      }
    })
      .then(rs => {
        resolve(rs);
      })
      .catch(err => {
        reject(err);
      });
  })
}

export function updateMarketItemValue(marketItem) {
  var conflict = false;
  var detail;
  var last_updated_date;
  var last_updated_by;
  return new Promise((resolve, reject) => {
    return sequelize.transaction(async function (t) {
      return await MarketItem.findOne({
        where: {
          item_id: marketItem.item_id,
          market_id: marketItem.market_id,
          detail: { $ne: '' }
        }
      })
        .then(result => {
          if (result) {
            marketItem.id = result.dataValues.id;
            var comp1 = new Date(result.dataValues.last_updated);
            var comp2 = new Date(marketItem.last_updated);

            if(result.dataValues.last_updated_by != marketItem.last_updated_by && comp1.toString() != comp2.toString()) {
              conflict = true;
              last_updated_date = result.dataValues.last_updated;
              last_updated_by = result.dataValues.last_updated_by;
              detail = result.dataValues.detail;
              throw new Error('Unable to save, Item has been modified');
            }
          }
          marketItem.last_updated = Date.now();
          last_updated_date = marketItem.last_updated;
          marketItem.last_updated_by = marketItem.last_updated_by;
          return MarketItem.upsert(marketItem, { transaction: t });
        })
    })
      .then(data => {
        let logObj = {
          section: marketItem.group_name,
          summary: `${marketItem.item_name} was changed detail to ${marketItem.detail}`,
          user: marketItem.user,
          page: config.pageTemplate.MARKET_PROFILE,
          object_id: marketItem.market_id,
          group_id: marketItem.group_id,
          old_value: marketItem.oldDate,
        };
        changeLogHelper.createChangeLog(logObj);
        return resolve(last_updated_date);
      })
      .catch(err => {
        err.conflict = conflict;
        err.last_updated = last_updated_date;
        err.last_updated_by = last_updated_by;
        err.detail = detail;
        reject(err);
      });
  })
}

export function getItemValueByAnalystId(analystId, itemId) {
  return new Promise((resolve, reject) => {
    return AnalystItem.findAll({
      where: {
        analyst_id: analystId,
        item_id: itemId,
      },
    })
      .then(rs => {
        resolve(rs);
      })
      .catch(err => {
        reject(err);
      });
  })
}

export function getItemValueByClientId(clientId, itemId) {
  return new Promise((resolve, reject) => {
    return ClientItem.findAll({
      where: {
        client_id: clientId,
        item_id: itemId,
      },
    })
      .then(rs => {
        resolve(rs);
      })
      .catch(err => {
        reject(err);
      });
  })
}

export function getListGroupByTemplateIdAndMarketId(templateId, marketId) {
  return new Promise((resolve, reject) => {
    return Groups.findAll({
      include: [{
        model: Items,
        required: false,
        where: {
          is_active: true,
        },
      }],
      where: {
        is_active: {
          $eq: true
        },
        template_id: {
          $eq: templateId
        },
        $or: [
          {
            market_id: {
              $eq: marketId
            }
          },
          {
            market_id: {
              $eq: null
            }
          }
        ]
      },
      order: [['index', 'ASC'],
      [{ model: Items }, 'index', 'ASC']]
    })
      .then(rs => {
        resolve(rs);
      })
      .catch(err => {
        console.log(err);
        reject(err);
      });
  })
}

export function getItemValueByActivityId(activityId, itemId) {
  return new Promise((resolve, reject) => {
    return ActivityItem.findAll({
      where: {
        activity_id: activityId,
        item_id: itemId,
      },
    })
      .then(rs => {


        resolve(rs);
      })
      .catch(err => {
        reject(err);
      });
  })
}

export function getItemValueByReportId(reportId, itemId) {
  //req.query.report_id
  return new Promise((resolve, reject) => {
    return ReportItem.findAll({
      where: {
        report_id: reportId,
        item_id: itemId,
      },
    })
      .then(rs => {
        resolve(rs);
      })
      .catch(err => {
        reject(err);
      });
  })
}

export function getItemValueByFirmId(firmId, itemId) {
  //req.query.firm_id
  return new Promise((resolve, reject) => {
    return FirmItem.findAll({
      where: {
        firm_id: firmId,
        item_id: itemId,
      },
    })
      .then(rs => {
        resolve(rs);
      })
      .catch(err => {
        reject(err);
      });
  })
}

export function getItemValueByResearchId(researchId, itemId) {
  //req.query.research_id
  return new Promise((resolve, reject) => {
    return ResearchItem.findAll({
      where: {
        research_id: researchId,
        item_id: itemId,
      },
    })
      .then(rs => {
        resolve(rs);
      })
      .catch(err => {
        reject(err);
      });
  })
}

export function getItemValueByAnalystClientViewId(analystId, clientId, itemId) {
  return new Promise((resolve, reject) => {
    console.log("start get list item by analyst client view")
    return AnalystClientViewItem.findAll({
      where: {
        analyst_id: analystId,
        client_id: clientId,
        item_id: itemId,
      },
    })
      .then(rs => {
        resolve(rs);
      })
      .catch(err => {
        console.log(err);
        reject(err);
      });
  })
}

var executeUpdateGroup = function (group, report_id, template_id, client_id) {
  return new Promise(async (resolve, reject) => {
    let checkUpdateGroupItem = group.report_id != null;
    let checGroupkAddEdit = group.id != null;
    group.visibility = group.visibility != '0';
    group.client_id = client_id;
    const promis = await new Promise(async (resolve, reject) => {
      if (checGroupkAddEdit) {
        if (checkUpdateGroupItem) {
          resolve(group.id);
          await Groups.update(group, { where: { id: group.id, report_id: group.report_id } });
        }
      } else {
        group.template_id = template_id;
        group.report_id = report_id;
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

export function saveGroupReport(data) {
  let groups = data.group;
  let report_id = data.report_id;
  let templateId = data.templateId;
  let client_id = data.client_id ? data.client_id : null;
  return new Promise((resolve, reject) => {
    try {
      groups.forEach(async group => { await executeUpdateGroup(group, report_id, templateId, client_id); });
    } catch (error) {
      console.log(error);
      reject(error)
    }
    resolve(true);
  })
}


export function getListGroupByTemplateIdAndReportId(templateId, reportId) {
  return new Promise((resolve, reject) => {
    return Groups.findAll({
      include: [{
        model: Items,
        required: false,
        where: {
          is_active: true,
        },
      }],
      where: {
        is_active: {
          $eq: true
        },
        template_id: {
          $eq: templateId
        },
        $or: [{
          report_id: {
            $eq: reportId
          }
        },
        {
          report_id: {
            $eq: null
          }
        }
        ]
      },
      order: [['index', 'ASC'],
      [{ model: Items }, 'index', 'ASC']]
    })
      .then(rs => {
        resolve(rs);
      })
      .catch(err => {
        console.log(err);
        reject(err);
      });
  })
}

export function getItemValueByMarketId(marketId, itemId) {
  return new Promise((resolve, reject) => {
    return MarketItem.findAll({
      where: {
        market_id: marketId,
        item_id: itemId,
      }
    })
      .then(rs => {
        resolve(rs);
      })
      .catch(err => {
        reject(err);
      });
  })
}

export function getItemValueByEventId(eventId, itemId) {
  return new Promise((resolve, reject) => {
    return EventItem.findAll({
      where: {
        event_id: eventId,
        item_id: itemId,
      },
    })
      .then(rs => {
        resolve(rs);
      })
      .catch(err => {
        reject(err);
      });
  })
}

export function getListGroupByTemplateIdAndReportIdAndClient(templateId, reportId, clientId) {
  return new Promise((resolve, reject) => {
    return Groups.findAll({
      include: [{
        model: Items,
        required: false,
        where: {
          is_active: true,
        },
      }],
      where: {
        is_active: {
          $eq: true
        },
        template_id: {
          $eq: templateId
        },
        $or: [{
          report_id: {
            $eq: reportId
          },
          client_id: {
            $eq: clientId
          }
        }, {
          report_id: {
            $eq: null
          }
        }]
      },
      order: [['index', 'ASC'],
      [{ model: Items }, 'index', 'ASC']]
    })
      .then(rs => {
        resolve(rs);
      })
      .catch(err => {
        console.log(err);
        reject(err);
      });
  })
}

export function getListGroupByCollectionId(templateId, collectionId) {
  return new Promise((resolve, reject) => {
    return Groups.findAll({
      include: [{
        model: Items,
        required: false,
        where: { is_active: true },
      }],
      where: {
        is_active: {
          $eq: true
        },
        template_id: {
          $eq: templateId
        },
        $or: [{
          collection_id: {
            $eq: collectionId
          }
        }, {
          collection_id: {
            $eq: null
          }
        }]
      },
      order: [['index', 'ASC'],
      [{ model: Items }, 'index', 'ASC']]
    })
      .then(rs => {
        resolve(rs);
      })
      .catch(err => {
        console.log(err);
        reject(err);
      });
  })
}

export function handleInfoGroup(groups, collection_id) {
  return new Promise(async (resolve, reject) => {
    let promises = [];
    let newGroup = _.filter(groups, function (group) { return _.isUndefined(group.id) }) || [];
    let updateGroup = _.reject(groups, function (group) { return _.isUndefined(group.id) }) || [];
    _.forEach(newGroup, async function (group) {
      let dataGroup = {
        group_name: group.group_name,
        index: group.index,
        is_active: true,
        last_update: group.last_update,
        template_id: group.template_id,
        visibility: _.parseInt(group.visibility),
        collection_id: collection_id
      };
      let _group = await Groups.create(dataGroup);
      _.forEach(group.Items, function (item) {
        item.group_id = _group.id;
        item.item_type = _.parseInt(item.item_type);
        promises.push(Items.create(item));
      });
    })
    _.forEach(updateGroup, async function (group) {
      let dataGroup = {
        group_name: group.group_name,
        index: group.index,
        is_active: group.is_active,
        last_update: group.last_update,
        template_id: group.template_id,
        visibility: _.parseInt(group.visibility),
        collection_id: collection_id
      };
      await Groups.update(dataGroup, { where: { id: group.id } });
      _.forEach(group.Items, function (item) {
        item.group_id = group.id;
        item.is_active = item.is_active;
        item.item_type = _.parseInt(item.item_type)
        promises.push(Items.upsert(item));
      });
    })
    return Promise.all(promises)
      .then(data => {
        resolve(data);
      })
      .catch(err => {
        console(err);
        reject(err);
      })
  })
}


export function updateCollectionItemValue(collectionItem) {
  var conflict = false;
  var detail;
  var last_updated_date;
  var last_updated_by;
  return new Promise((resolve, reject) => {
    return sequelize.transaction(async function (t) {
      return await CollectionItem.findOne({
        where: {
          item_id: collectionItem.item_id,
          collection_id: collectionItem.collection_id,
          detail: { $ne: '' }
        }
      })
        .then(result => {
          if (result) {
            collectionItem.id = result.dataValues.id;
            var comp1 = new Date(result.dataValues.last_updated);
            var comp2 = new Date(collectionItem.last_updated);

            if(result.dataValues.last_updated_by != collectionItem.last_updated_by && comp1.toString() != comp2.toString()) {
              conflict = true;
              last_updated_date = result.dataValues.last_updated;
              last_updated_by = result.dataValues.last_updated_by;
              detail = result.dataValues.detail;
              throw new Error('Unable to save, Item has been modified');
            }
          }
          collectionItem.last_updated = Date.now();
          last_updated_date = collectionItem.last_updated;
          collectionItem.last_updated_by = collectionItem.last_updated_by;
          return CollectionItem.upsert(collectionItem, { transaction: t });
        })
    })
      .then(data => {
        let logObj = {
          section: collectionItem.group_name,
          summary: `${collectionItem.item_name} was changed detail to ${collectionItem.detail}`,
          user: collectionItem.user,
          page: config.pageTemplate.COLLECTION_PROFILE,
          object_id: collectionItem.collection_id,
          group_id: collectionItem.group_id,
          old_value: collectionItem.oldDate,
        };
        changeLogHelper.createChangeLog(logObj);
        return resolve(last_updated_date);
      })
      .catch(err => {
        err.conflict = conflict;
        err.last_updated = last_updated_date;
        err.last_upodated_by = last_updated_by;
        err.detail = detail;
        reject(err);
      });
  })
}

export function getListItemValueByCollectionId(collectionId) {
  return new Promise((resolve, reject) => {
    return CollectionItem.findAll({
      where: {
        collection_id: collectionId,
      }
    })
      .then(rs => {
        resolve(rs);
      })
      .catch(err => {
        con
        reject(err);
      });
  })
}
