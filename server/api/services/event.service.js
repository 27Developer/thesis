'use strict';
import {
  sequelize,
  Event,
  Analyst,
  Client,
  Firm,
  EventAnalyst,
  EventClient,
  EventFirm,
  Groups,
  Items,
  Research,
  EventCategory,
  CollectionClient,
  ClientActivity,
  Media,
  AnalystHistory
} from '../../sqldb';

var Promise = require('bluebird')
import _ from 'lodash';

import log4Js from 'log4js';
import { ListEventForClient } from '../dtos/eventDto'
import config from '../../config/environment/shared';
log4Js.configure({
  appenders: [
    { type: 'file', filename: 'logs/event-controller.log', category: 'event-controller' }
  ]
});

export function getListEvent() {
  return new Promise((resolve, reject) => {
    let query = {};
    query.include = [{
      model: Analyst,
      as: 'Analysts',
      required: false
    }, {
      model: Client,
      as: 'Clients',
      required: false,
    },
      {
        model: Research,
        as: 'Researchs',
        required: false,
        where: { is_active: true }
      }, {
        model: Firm,
        as: 'Firms',
        required: false,
        where: { is_active: true }
      }];

    return Event.findAll(query)
      .then(data => {
        resolve(data);
      })
      .catch(error => {
        reject(error);
      })

  })
}

var executeUpdateGroup = function(group, event_id, template_id) {
  return new Promise(async(resolve, reject) => {
    let checkUpdateGroupItem = group.event_id != null;
    let checGroupkAddEdit = group.id != null;
    group.visibility = group.visibility != '0';
    const promis = await new Promise(async(resolve, reject) => {
      if (checGroupkAddEdit) {
        if (checkUpdateGroupItem) {
          resolve(group.id);
          await Groups.update(group, { where: { id: group.id, event_id: group.event_id } });
        }
      } else {
        group.template_id = template_id;
        group.event_id = event_id;
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

export function AddEvent(dataEvent) {
  return new Promise((resolve, reject) => {
    let event = dataEvent.event;
    let categorys = dataEvent.categorys;
    let clients = dataEvent.clients;
    let analysts = dataEvent.analysts;
    let firms = dataEvent.firms;
    let groups = dataEvent.groups;
    let func = [];

    return sequelize.transaction(async function(t) {
      let newEvent = await Event.create(event, { transaction: t })
      categorys.forEach(item => {
        let category = {
          research_id: item.id,
          event_id: newEvent.id
        }
        func.push(EventCategory.create(category, { transaction: t }));
      })
      analysts.forEach(item => {
        let analyst = {
          analyst_id: item.id,
          event_id: newEvent.id
        }
        func.push(EventAnalyst.create(analyst, { transaction: t }));
      });

      clients.forEach(item => {
        let client = {
          client_id: item.id,
          event_id: newEvent.id
        }
        func.push(EventClient.create(client, { transaction: t }));
      });

      firms.forEach(item => {
        let firm = {
          firm_id: item.id,
          event_id: newEvent.id
        }
        func.push(EventFirm.create(firm, { transaction: t }));
      });

      groups.forEach(async group => {
        await executeUpdateGroup(group, newEvent.id, dataEvent.templateId);
      });
      return Promise.all(func)
    })
      .then(data => {
        console.log(data);
        resolve(data);
      })
      .catch(error => {
        console.log(error);
        reject(error);
      })

  })
}

export function DeleteEvent(array, type) {
  return new Promise((resolve, reject) => {
    var _array = Array.isArray(array) ? array : [array];
    return sequelize.transaction(async function(t) {
      let listPromise = [];
      _array.forEach(id => {
        if (id === 0)
          return;
        switch (type) {
          case 'client': {
            let function3 = EventClient.destroy({
              where: {
                event_id: id
              }
            }, { transaction: t });

            console.log('0000000000000');
            listPromise.push(function3);
          }
            break;
          default: {
            let function1 = EventAnalyst.destroy({
              where: {
                event_id: id
              }
            }, { transaction: t });
            let function2 = EventCategory.destroy({
              where: {
                event_id: id
              }
            }, { transaction: t });
            let function3 = EventClient.destroy({
              where: {
                event_id: id
              }
            }, { transaction: t });
            let function4 = EventFirm.destroy({
              where: {
                event_id: id
              }
            }, { transaction: t });
            let function5 = Groups.update({
                is_active: false
              },
              { where: { event_id: id } },
              { transaction: t });

            let function6 = Event.destroy({
              where: {
                id: id
              }
            }, { transaction: t });
            listPromise.push(function1);
            listPromise.push(function2);
            listPromise.push(function3);
            listPromise.push(function4);
            listPromise.push(function5);
            listPromise.push(function6);
          }
        }
      });

      return Promise.all(listPromise)
        .then(data => {
          resolve(data);
        });
    })
      .then(data => {
        console.log(data);
        resolve(data);
      })
      .catch(error => {
        console.log(error);
        reject(error);
      })
  })
}


export function UpdateEvent(dataEvent) {
  let event = dataEvent.event;
  let categorys = dataEvent.categorys;
  let clients = dataEvent.clients;
  let analysts = dataEvent.analysts;
  let firms = dataEvent.firms;
  let groups = dataEvent.groups;
  let func = [];

  return new Promise((resolve, reject) => {
    return sequelize.transaction(async function(t) {
      await EventAnalyst.destroy({ where: { event_id: event.id } }, { transaction: t });
      await EventClient.destroy({ where: { event_id: event.id } }, { transaction: t });
      await EventCategory.destroy({ where: { event_id: event.id } }, { transaction: t });
      await EventFirm.destroy({ where: { event_id: event.id } }, { transaction: t });
      await Event.update(event, { where: { id: event.id } }, { transaction: t });

      categorys.forEach(item => {
        let category = {
          research_id: item.id,
          event_id: event.id
        }
        func.push(EventCategory.create(category, { transaction: t }));
      })
      analysts.forEach(item => {
        let analyst = {
          analyst_id: item.id,
          event_id: event.id
        }
        func.push(EventAnalyst.create(analyst, { transaction: t }));
      });
      clients.forEach(item => {
        let client = {
          client_id: item.id,
          event_id: event.id
        }
        func.push(EventClient.create(client, { transaction: t }));
      });
      firms.forEach(item => {
        let firm = {
          firm_id: item.id,
          event_id: event.id
        }
        func.push(EventFirm.create(firm, { transaction: t }));
      });
      groups.forEach(async group => {
        await executeUpdateGroup(group, event.id, dataEvent.templateId);
      });
      return Promise.all(func);
    })
      .then(data => {
        resolve(data);
      })
      .catch(error => {
        console.log(error);
        reject(error);
      })
  })
}

export function assginEventToClient(events, clientId) {
  return new Promise((resolve, reject) => {
    return sequelize.transaction(async function(t) {
      _.forEach(events, event => {
        EventClient.upsert({
          event_id: event.id,
          client_id: clientId,
        }, { transaction: t });
      })
    })
      .then(data => {
        resolve(data);
      })
      .catch(error => {
        console.log(error);
        reject(error);
      })
  })
}

export function updateEventColor(eventId, color) {
  return new Promise((resolve, reject) => {
    return sequelize.transaction(async function(t) {
      await Event.update({
        color: color
      }, { where: { id: eventId } }, { transaction: t });
    })
      .then(data => {
        resolve(data);
      })
      .catch(error => {
        console.log(error);
        reject(error);
      })
  })
}

export function updateClientEventColor(eventId, color) {
  return new Promise((resolve, reject) => {
    return sequelize.transaction(async function(t) {
      await ClientActivity.update({
        color: color
      }, { where: { id: eventId } }, { transaction: t });
    })
      .then(data => {
        resolve(data);
      })
      .catch(error => {
        console.log(error);
        reject(error);
      })
  })
}

export function GetEvent(eventId, currentUserData) {
  return new Promise((resolve, reject) => {
    let query = {};
    query.include = [{
      model: Analyst,
      as: 'Analysts',
      required: false,
      include: [{
        model: Media,
        as: 'Media',
        attributes: ['media_id'],
        required: false,
        where: { is_active: true },
        through: { where: { is_active: true } }
      }]
    }, {
      model: Client,
      as: 'Clients',
      required: false,
      include: [{
        model: Media,
        as: 'Media',
        attributes: ['media_id'],
        required: false,
        where: { is_active: true },
        through: { where: { is_active: true } }
      }]
    },
      {
        model: Research,
        as: 'Researchs',
        required: false,
        where: { is_active: true }
      }, {
        model: Firm,
        as: 'Firms',
        required: false,
        where: { is_active: true }
      }];

    query.where = {
      id: eventId
    }
    return Event.findOne(query)
      .then(data => {
        if (currentUserData.role == config.role.spotlightAdmin) {
          resolve(data);
        } else {
          let clientIds = currentUserData.clientIds.split(',');
          let eventClientIds = data.Clients;
          let listClientsAssignedToEvent = eventClientIds.filter(eventClient => {
            let result = false;
            clientIds.forEach(element => {
              if (element == eventClient.id) {
                result = true;
              }
            });
            return result;
          })
            
          let checkPermission = listClientsAssignedToEvent.length > 0 ? true : false;

          if (checkPermission) {
            data && data.dataValues ? data.dataValues.Clients = listClientsAssignedToEvent : {};
            resolve(data);
          } else {
            throw { code: 403, message: "Forbidden" };
          }
        }
      })
      .catch(err => {
        reject(err);
      });
  })
}

export function getEventByClientId(clientId) {
  return new Promise((resolve, reject) => {
    let query = {};
    query.include = [{
      model: Analyst,
      as: 'Analysts',
      attributes: ['id', 'name'],
      where: { is_active: true },
      required: false,
    }, {
      model: Research,
      as: 'Researchs',
      attributes: ['id', 'desc'],
      where: { is_active: true },
      required: false,
    },
      {
        model: Client,
        as: 'Clients',
        attributes: ['id', 'name'],
        where: { is_active: true },
        required: true,
      }, {
        model: EventClient,
        as: 'EventClients',
        attributes: [],
        where: { client_id: clientId },
        required: true,
      }];

    return Event.findAll(query)
      .then(data => {
        resolve(ListEventForClient(data));
      })
      .catch(error => {
        console.log(error);
        reject(error);
      })
  })
}

export function getAllEvent() {
  return new Promise((resolve, reject) => {
    let query = {};
    query.include = [{
      model: Analyst,
      as: 'Analysts',
      attributes: ['id', 'name'],
      where: { is_active: true },
      required: false,
    }, {
      model: Research,
      as: 'Researchs',
      attributes: ['id', 'desc'],
      where: { is_active: true },
      required: false,
    },
      {
        model: Client,
        as: 'Clients',
        attributes: ['id', 'name'],
        where: { is_active: true },
        required: false,
      }];

    return Event.findAll(query)
      .then(data => {
        resolve(ListEventForClient(data));
      })
      .catch(error => {
        console.log(error);
        reject(error);
      })
  })
}

export function getEventByCollectionId(collectionId) {
  return new Promise((resolve, reject) => {
    return CollectionClient.findAll({
      where: {
        collection_id: collectionId,
      }
    }).then(clients => {
      let clientIds = _.map(clients, function(item) {
        return item.dataValues.client_id
      });
      let query = {};
      query.include = [{
        model: Analyst,
        as: 'Analysts',
        attributes: ['id', 'name'],
        where: { is_active: true },
        required: false,
      }, {
        model: Research,
        as: 'Researchs',
        attributes: ['id', 'desc'],
        where: { is_active: true },
        required: false,
      },
        {
          model: Client,
          as: 'Clients',
          attributes: ['id', 'name'],
          where: { is_active: true },
          required: false,
        }, {
          model: EventClient,
          as: 'EventClients',
          attributes: [],
          where: { client_id: { $in: clientIds } },
          required: true,
        }]
      return Event.findAll(query)
        .then(data => {
          resolve(ListEventForClient(data));
        })
        .catch(error => {
          console.log(error);
          reject(error);
        })
    })
      .catch(err => {
        console.log(err);
      })
  })
}

export function GetEventByAnalystId(analystId) {
  return new Promise((resolve, reject) => {
    let query = {};
    query.include = [{
      model: Analyst,
      as: 'Analysts',
      attributes: ['id', 'name'],
      where: { is_active: true },
      required: false,
    }, {
      model: Research,
      as: 'Researchs',
      attributes: ['id', 'desc'],
      where: { is_active: true },
      required: false,
    },
      {
        model: Client,
        as: 'Clients',
        attributes: ['id', 'name'],
        where: { is_active: true },
        required: false,
      }, {
        model: EventAnalyst,
        as: 'EventAnalysts',
        attributes: [],
        where: { analyst_id: analystId },
        required: true,
      }]

    return Event.findAll(query)
      .then(data => {
        resolve(ListEventForClient(data));
      })
      .catch(error => {
        console.log(error);
        reject(error);
      })
  })

}

export function getAnalystByEventId(eventId) {
  return new Promise(async(resolve, reject) => {
    let analysts = await EventAnalyst.findAll({ where: { event_id: eventId } })
    let analystIds = analysts.map(x => {
      return x.analyst_id
    });
    let query = {};
    query.include = [{
      model: AnalystHistory,
      as: 'AnalystHistory',
      include: [{
        model: Firm,
        where: { is_active: true },
        required: false
      }],
      where: { is_active_record: true },
      required: true
    }, {
      model: Research,
      where: { is_active: true },
      required: false
    }, {
      model: Client,
      as: 'Clients',
      required: false
    }]
    query.where = { id: { $in: analystIds } };
    query.order = [['name', 'ASC']];
    return Analyst.findAll(query)
      .then(data => {
        resolve(data);
      })
      .catch(error => {
        console.log(error)
        reject(error);
      })
  })
}
