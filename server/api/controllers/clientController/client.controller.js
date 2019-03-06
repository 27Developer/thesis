'use strict';
import _ from 'lodash';
import json2Csv from 'json2csv';
import moment from 'moment';
import log4Js from 'log4js';
import uuid from 'uuid';
import config from '../../../config/environment';
import * as responseHelper from '../../../components/helper/response-helper';
import CONSTANTS from '../../../config/environment/shared';
import {
  Client,
  ClientAssigned,
  ClientHistory,
  ClientHealthHistory,
  ClientHealthHistoryRecent,
  ClientMedia,
  AnalystFirmSubscriptionType,
  ClientType,
  Media,
  Cohort,
  ChurnReason,
  Effort,
  SegmentationType,
  Research,
  ClientResearchCategories,
  ClientActivity,
  User,
  UserToken,
  sequelize,
  Groups,
  Items,
  SubSegmentAnalyst,
  ClientAnalystFirmSubscription,
  Collection,
  Firm,
  Activity,
  FirmClient
} from '../../../sqldb';

import { ListClientDto, ResearchCategoriesDto, AssignedsDto, ListClientDtoAdv } from '../../dtos/clientDto';
import awsCognitoService from '../../../components/aws-cognito/aws-cognito-register';
var Promise = require('bluebird');
var jwt_decode = require('jwt-decode');
var ClientService = require('../../services/client.service');

log4Js.configure({
  appenders: [
    { type: 'file', filename: 'logs/client-controller.log', category: 'client-controller' }
  ]
});
var logger = log4Js.getLogger('upload-image-controller');

export async function GetAllClients(req, res) {
  let bearerToken;
  let bearerHeader = req.headers['authorization'];
  let bearer = bearerHeader.split(' ');
  bearerToken = bearer[1];
  let listClientId = [];
  let role;

  await UserToken.findAll({ where: { access_token: bearerToken } })
    .then(resObj => {
      let data = resObj[0].dataValues;
      let decoded = jwt_decode(data.token_id);
      console.log(data);
      role = decoded['custom:role'];
      let clientIdStr = decoded['custom:client_id'] ? decoded['custom:client_id'] : '';
      if (role !== config.role.spotlightAdmin) {
        listClientId = clientIdStr.split(', ');
      }
    })
    .catch(err => {
      console.log(err);
      res.status(403).json('Forbidden');
    });

  await ClientHistory.findAll({
    include: [
      {
        model: Client,
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
            model: SubSegmentAnalyst,
            as: 'SubSegmentAnalyst',
          }
        ],
        where: { is_active: true }
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
    },
  })
    .then(function (data) {
      let listClients = ListClientDto(data);
      if (role === config.role.spotlightAdmin) {
        return listClients;
      } else {
        return listClients.filter(e => listClientId.includes(e.Client.id));
      }
    })
    .then(responseHelper.respondWithResult(res))
    .catch(res => {
      console.log(res);
      responseHelper.handleError(res);
    });
}

export async function GetAllClientsSingleHistory(req, res) {
  let bearerToken;
  let bearerHeader = req.headers['authorization'];
  let bearer = bearerHeader.split(' ');
  bearerToken = bearer[1];
  let listClientId = [];
  let strWhereClientId = "";
  let role;

  await UserToken.findAll({ where: { access_token: bearerToken } })
    .then(resObj => {
      let data = resObj[0].dataValues;
      let decoded = jwt_decode(data.token_id);
      role = decoded['custom:role'];
      let clientIdStr = decoded['custom:client_id'] ? decoded['custom:client_id'] : '';
      if (role !== config.role.spotlightAdmin) {
        listClientId = clientIdStr.split(', ');
      }

    })
    .catch(err => {
      console.log(err);
      res.status(403).json('Forbidden');
    });

  if (role === config.role.spotlightAdmin) {
    var listFunc = [];
    listFunc.push(ClientHistory.findAll({
      include: [
        {
          model: Client,
          include: [
            {
              model: ClientHealthHistoryRecent,
              as: 'ClientHealthHistoriesRecent'
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
        },
        {
          model: ClientType
        },
        {
          model: Cohort
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
      },
    }));

    listFunc.push(ClientResearchCategories.findAll({
      include: [
        {
          model: Research,
          as: "Research"
        },
      ],
      where: {
        is_active: true
      },
    }));

    listFunc.push(ClientAssigned.findAll({
      include: [
        {
          model: User,
          as: 'User'
        },
      ],
    }));
    await Promise.all(listFunc)
      .spread((clients, clientResearchCategories, clientUsers) => {
        let listClients = ListClientDtoAdv(clients, ResearchCategoriesDto(clientResearchCategories), AssignedsDto(clientUsers));
        if (role === config.role.spotlightAdmin) {
          return listClients;
        } else {
          return listClients.filter(e => listClientId.includes(e.Client.id));
        }
      })
      .then(responseHelper.respondWithResult(res))
      .catch(err => {
        console.log(err);
        responseHelper.handleError(res)(err);
      });
  } else {
    var listFunc = [];
    listFunc.push(ClientHistory.findAll({
      include: [
        {
          model: Client,
          include: [
            {
              model: ClientHealthHistoryRecent,
              as: 'ClientHealthHistoriesRecent'
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
        },
        {
          model: ClientType
        },
        {
          model: Cohort
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
        is_active_record: true,
        client_id: { in: listClientId }
      },
    }));

    listFunc.push(ClientResearchCategories.findAll({
      include: [
        {
          model: Research,
          as: "Research"
        },
      ],
      where: {
        is_active: true
      },
    }));

    listFunc.push(ClientAssigned.findAll({
      include: [
        {
          model: User,
          as: 'User'
        },
      ],
    }));
    await Promise.all(listFunc)
      .spread((clients, clientResearchCategories, clientUsers) => {
        let listClients = ListClientDtoAdv(clients, ResearchCategoriesDto(clientResearchCategories), AssignedsDto(clientUsers));
        if (role === config.role.spotlightAdmin) {
          return listClients;
        } else {
          return listClients.filter(e => listClientId.includes(e.Client.id));
        }
      })
      .then(responseHelper.respondWithResult(res))
      .catch(res => {
        console.log(res);
        responseHelper.handleError(res);
      });
  };
}

export function getClientById(req, res) {
  var clientId = req.params.id;
  var includeInactive = req.query.includeInactive;
  ClientService.getClientById(clientId, includeInactive).then(data => {
    res.send(data);
  })
    .catch(responseHelper.handleError(res));
}

export function checkNameClient(req, res) {
  var name = req.query.clientName;
  return ClientHistory.findAll({
    where: {
      is_active_record: true
    }
  })
    .then(function (data) {
      for (var i = 0; i < data.length; i++) {
        var item = data[i];
      }
      return res.status(200).json(false);
    })
    .catch(res => {
      responseHelper.handleError(res);
    });
}

export function CheckClient(req, res) {
  return Client.find({
    where: {
      id: req.query.id === undefined ? { $ne: '' } : { $ne: req.query.id },
      name: req.query.name,
      is_active: true
    }
  })
    .then(responseHelper.checkIfAvailable(res))
    .catch(responseHelper.handleError(res));
}


export function addClient(req, res) {
  var data = req.body.clientData;
  var groups = data.group || [];
  var clientHistorydata = data.ClientHistory || {};
  var assigned = data ? data.Assigned : [];

  clientHistorydata.collection_id = (data.Collection === undefined || data.Collection === null || data.Collection.id === '') ? null : data.Collection.id;
  clientHistorydata.effort_score_cd = (data.Effort === undefined || data.Effort === null || data.Effort.id === '') ? null : data.Effort.code;
  clientHistorydata.segmentation_type_id = (data.Segmentation === undefined || data.Segmentation === null || data.Segmentation.id === '') ? null : data.Segmentation.id;
  clientHistorydata.churn_reason_id = (data.ChurnReason === undefined || data.ChurnReason === null || data.ChurnReason.id === '') ? null : data.ChurnReason.id;
  clientHistorydata.client_type_id = (data.ClientType === undefined || data.ClientType === null || data.ClientType.id === '') ? null : data.ClientType.id;
  clientHistorydata.zip_code = (clientHistorydata.zipCode === null || clientHistorydata.zipCode === '') ? ' ' : clientHistorydata.zipCode;
  clientHistorydata.website_url = (clientHistorydata.websiteUrl === null || clientHistorydata.websiteUrl === '') ? ' ' : clientHistorydata.websiteUrl;
  clientHistorydata.profile_description = (clientHistorydata.profileDescription === null || clientHistorydata.profileDescription === '') ? ' ' : clientHistorydata.profileDescription;
  clientHistorydata.client_speakers = data ? data.Speakers : '';

  ClientService.addClient(data, groups, clientHistorydata, assigned).then(data => {
    res.send(data);
  })
    .catch(responseHelper.handleError(res));
}

export function AddListClient(req, res) {
  const clients = req.body.clients;
  const clientHistorydata = {};

  return sequelize.transaction(async function (t) {
    for (let j = 0; j < clients.length; j++) {
      clientHistorydata.cohort_id = null;
      clientHistorydata.effort_score_cd = null;
      clientHistorydata.segmentation_type_id = null;
      clientHistorydata.churn_reason_id = null;
      clientHistorydata.client_type_id = null;

      const newClient = {
        is_active: true,
        name: clients[j],
        origination_date: new Date()
      };

      const client = await Client.create(newClient, { transaction: t });

      clientHistorydata.client_id = client.id;

      await ClientHistory.create(clientHistorydata, { transaction: t });
    }
  })
    .then(() => {
      res.send();
    })
    .catch(responseHelper.handleError(res));
}

export function UpdateClient(req, res) {
  var data = req.body.clientData;
  var oldClient = req.body.oldClient;
  var groups = data.group || [];

  var clientHistorydata = data.ClientHistory === null ? {} : _.clone(data.ClientHistory);
  delete clientHistorydata.id;
  clientHistorydata.client_id = data.Client.id;
  clientHistorydata.collection_id = (data.Collection === undefined || data.Collection === null || data.Collection.id === '') ? null : data.Collection.id;
  clientHistorydata.effort_score_cd = (data.Effort === undefined || data.Effort === null || data.Effort.id === '') ? null : data.Effort.code;
  clientHistorydata.segmentation_type_id = (data.Segmentation === undefined || data.Segmentation === null || data.Segmentation.id === '') ? null : data.Segmentation.id;
  clientHistorydata.churn_reason_id = (data.ChurnReason === undefined || data.ChurnReason === null || data.ChurnReason.id === '') ? null : data.ChurnReason.id;
  clientHistorydata.client_type_id = (data.ClientType === undefined || data.ClientType === null || data.ClientType.id === '') ? null : data.ClientType.id;
  clientHistorydata.zip_code = (clientHistorydata.zipCode === null || clientHistorydata.zipCode === '') ? ' ' : clientHistorydata.zipCode;
  clientHistorydata.website_url = (clientHistorydata.websiteUrl === null || clientHistorydata.websiteUrl === '') ? ' ' : clientHistorydata.websiteUrl;
  clientHistorydata.profile_description = (clientHistorydata.profileDescription === null || clientHistorydata.profileDescription === '') ? ' ' : clientHistorydata.profileDescription;
  clientHistorydata.firm_id = data.Client.AnalystFirmSubscription ? data.Client.AnalystFirmSubscription.id : null;

  var assigned = data ? data.Assigned : [];

  ClientService.updateClient(data, groups, clientHistorydata, assigned, oldClient).then(data => {
    res.send(true);
  })
    .catch(responseHelper.handleError(res));
}

//Build CSV

export function getDataSearchClient(req, res) {
  try {
    var dataCount = 0;
    var responseData = {
      cohort: [],
      segmentation: [],
      clientType: []
    };

    Cohort.findAll({ where: { is_active: true }, order: [['name', 'ASC']] })
      .then(cohort => {
        responseData.cohort = cohort;
        dataCount++;
        if (dataCount === 3) {
          logger.info(responseData);
          return res.status(200).json(responseData);
        }
      })
      .catch(function (err) {
        logger.error(err);
        responseHelper.handleError(res)(err);
      });

    SegmentationType.findAll({ where: { is_active: true }, order: [['desc', 'ASC']] })
      .then(segmentation => {
        responseData.segmentation = segmentation;

        dataCount++;
        if (dataCount === 3) {
          logger.info(responseData);
          return res.status(200).json(responseData);
        }
      })
      .catch(function (err) {
        logger.error(err);
        responseHelper.handleError(res)(err);
      });

    ClientType.findAll({ where: { is_active: true }, order: [['desc', 'ASC']] })
      .then(clientType => {
        responseData.clientType = clientType;

        dataCount++;
        if (dataCount === 3) {
          logger.info(responseData);
          return res.status(200).json(responseData);
        }
      })
      .catch(function (err) {
        logger.error(err);
        responseHelper.handleError(res)(err);
      });
  } catch (err) {
    logger.error(err);
    responseHelper.handleError(res)(err);
  }
}

export function getClientAvatar(req, res) {
  return ClientMedia.findOne({
    include: [
      {
        model: Media,
        as: 'Media'
      }
    ],
    where: {
      client_id: req.params.id,
      is_active: true,
      media_type: 'avatar'
    }
  }).then(image => {
    if (image !== null) {
      return res.status(200).json(image);
    } else {
      return res.status(200).json('');
    }
  })
    .catch(err => {
      responseHelper.handleError(res);
    });
}

export function getClientNamebyId(req, res) {
  return Client.findOne({
    where: {
      id: req.query.id,
    }
  }).then(client => {
    return res.status(200).json(client);
  })
    .catch(responseHelper.handleError(res));
}

export function getClientActivityByClientId(req, res) {
  return ClientActivity.findAll({
    where: {
      client_id: req.query.id,
      is_active: true
    }
  }).then(client => {
    return res.status(200).json(client);
  })
    .catch(responseHelper.handleError(res));
}

export function addClientActivity(req, res) {
  var data = req.body.clientActivityData;
  return sequelize.transaction(async function (t) {
    ClientActivity.create(data, { transaction: t });
  })
    .then(() => {
      res.send();
    })
    .catch(responseHelper.handleError(res));
}

export function editClientActivity(req, res) {
  var data = req.body.clientActivityData;
  //data.date = data.date.slice(0, 10);
  return sequelize.transaction(async function (t) {
    ClientActivity.update(data, { where: { id: data.id } }, { transaction: t });
  })
    .then(() => {
      res.send();
    })
    .catch(responseHelper.handleError(res));
}

export function deleteClientActivity(req, res) {
  var id = req.query.clientActivityId;
  return sequelize.transaction(async function (t) {
    ClientActivity.update({ is_active: false }, { where: { id } }, { transaction: t });
  })
    .then(() => {
      res.send();
    })
    .catch(responseHelper.handleError(res));
}

export function getClientDetailById(req, res) {
  return ClientHistory.findOne({
    include: [
      {
        model: Client,
      }
    ],
    where: {
      client_id: req.query.id,
      is_active_record: true,
    }
  }).then(client => {
    return res.status(200).json(client);
  })
    .catch(responseHelper.handleError(res));
}


export function updateClientInfluence(req, res) {
  var _influence = req.body.influence;
  var _id = req.body.client_id;
  return sequelize.transaction(async function (t) {
    ClientHistory.update({ influence: _influence }, { where: { id: _id } }, { transaction: t });
  })
    .then(() => {
      res.send();
    })
    .catch(responseHelper.handleError(res));
}

export function getMajorReport(req, res) {
  var clientId = req.query.clientId;
  ClientService.getMajorReport(clientId).then(data => {
    res.send(data);
  })
    .catch(responseHelper.handleError(res));
}

export function getMajorReportByCollectionId(req, res) {
  var collectionId = req.query.collectionId;
  ClientService.getMajorReportByCollectionId(collectionId).then(data => {
    res.send(data);
  })
    .catch(responseHelper.handleError(res));
}

export function deleteClients(req, res) {
  let clients = req.body.data;
  let arrayPromise = [];
  return sequelize.transaction(async function (t) {
    clients.forEach(client => {
      client.is_active = false;
      arrayPromise.push(Client.update(client, {
        where: {
          id: client.id
        }
      }, { transaction: t }));
    });
    return Promise.all(arrayPromise);
  }).then(() => {
    res.send();
  })
    .catch(err => {
      console.log(err);
    });
}

export function updateAnalystSegment(req, res) {
  var data = req.body.data;
  ClientService.updateAnalystSegment(data).then(data => {
    res.send(data);
  })
    .catch(responseHelper.handleError(res));
}

export function getClientSegments(req, res) {
  var clientId = req.query.clientId ? req.query.clientId : null;
  ClientService.getClientSegments(clientId).then(data => {
    res.send(data);
  })
    .catch(responseHelper.handleError(res));
}

export function getClientInsightStatus(req, res) {
  var clientId = req.query.clientId ? req.query.clientId : null;
  ClientService.getClientInsightStatus(clientId).then(data => {
    res.send(data);
  })
    .catch(responseHelper.handleError(res));
}

export function getPlacement(req, res) {
  ClientService.getPlacement().then(data => {
    res.send(data);
  })
    .catch(responseHelper.handleError(res));
}


export function getAnalystAndSubSegment(req, res) {
  ClientService.getAnalystAndSubSegment().then(data => {
    res.send(data);
  })
    .catch(responseHelper.handleError(res));
}

export function getAnalysts(req, res) {
  ClientService.getAnalysts().then(data => {
    res.send(data);
  })
    .catch(responseHelper.handleError(res));
}

export function getClientHistoryByClientId(req, res) {
  return ClientHistory.findAll({
    where: {
      client_id: req.params.id,
      is_active_record: true
    }
  })
    .then(data => {
      res.send(data);
    });
}

export function addAnalystToSubSegment(req, res) {
  var data = req.body.data;
  ClientService.addAnalystToSubSegment(data).then(data => {
    res.send(data);
  })
    .catch(responseHelper.handleError(res));
}

export function saveClientSegments(req, res) {
  var clientId = req.body.clientId ? req.body.clientId : null;
  var segments = req.body.segments;
  ClientService.saveClientSegments(clientId, segments).then(data => {
    res.send(data);
  })
    .catch(responseHelper.handleError(res));
}

export function saveGlobalSegments(req, res) {
  var segments = req.body.segments;
  ClientService.saveGlobalSegments(segments).then(data => {
    res.send(data);
  })
    .catch(responseHelper.handleError(res));
}

export function saveGlobalPlacement(req, res) {
  var listPlacement = req.body.listPlacement;
  ClientService.saveGlobalPlacement(listPlacement).then(data => {
    res.send(data);
  })
    .catch(responseHelper.handleError(res));
}

export function deleteAnlystInSubSegment(req, res) {
  let id = req.query.id;
  let clientId = req.query.clientId;
  ClientService.deleteAnlystInSubSegment(id, clientId).then(data => {
    res.send(true);
  })
    .catch(responseHelper.handleError(res));
}

export function deleteAnlystInKanban(req, res) {
  let id = req.query.id;
  let clientId = req.query.clientId;
  let subSegmentId = req.query.subSegmentId;
  ClientService.deleteAnlystInKanban(id, subSegmentId, clientId).then(data => {
    res.send(true);
  })
    .catch(responseHelper.handleError(res));
}
export function deleteSubSegmentById(req, res) {
  let id = req.query.id;
  ClientService.deleteSubSegmentById(id).then(data => {
    res.send(true);
  })
    .catch(responseHelper.handleError(res));
}

export function updateLabelSegment(req, res) {
  var data = req.body.data;
  ClientService.updateLabelSegment(data).then(data => {
    res.send(data);
  })
    .catch(responseHelper.handleError(res));
}

export function addLabelSegment(req, res) {
  var data = req.body.data;
  ClientService.addLabelSegment(data).then(data => {
    res.send(data);
  })
    .catch(responseHelper.handleError(res));
}

export function migrateDataSegmentFromV13ToV20(req, res) {
  ClientService.migrateDataSegmentFromV13ToV20()
    .then(data => {
      res.send(data);
    })
    .catch(responseHelper.handleError(res));
}

export function getAnalystAssocialClient(req, res) {
  var clientId = req.query.clientId;
  ClientService.getAnalystAssocialClient(clientId).then(data => {
    res.send(data);
  })
    .catch(responseHelper.handleError(res));
}

export function getAnalystHasActivityForClientList(req, res) {
  var clientId = req.query.clientId;
  ClientService.getAnalystHasActivityForClientList(clientId).then(data => {
    res.send(data);
  })
    .catch(responseHelper.handleError(res));
}

export function getAnalystUnassigned(req, res) {
  var clientId = req.query.clientId ? req.query.clientId : null;
  ClientService.getAnalystUnassigned(clientId).then(data => {
    res.send(data);
  })
    .catch(responseHelper.handleError(res));
}

export function getAnalystHasActivityWithClient(req, res) {
  var clientId = req.query.clientId ? req.query.clientId : null;
  ClientService.getAnalystHasActivityWithClient(clientId).then(data => {
    res.send(data);
  })
    .catch(responseHelper.handleError(res));
}

export function getAnalystHasActivityWithCollection(req, res) {
  var collectionId = req.query.collectionId ? req.query.collectionId : null;
  ClientService.getAnalystHasActivityWithCollection(collectionId).then(data => {
    res.send(data);
  })
    .catch(responseHelper.handleError(res));
}

export function getAllSimpleClients(req, res) {
  var includeInactive = req.query.includeInactive ? req.query.includeInactive : null;
  ClientService.getAllSimpleClients(includeInactive).then(data => {
    res.send(data);
  })
    .catch(responseHelper.handleError(res));
}

export function getAnalystbyClientId(req, res) {
  var clientId = req.query.clientId;
  ClientService.getAnalystbyClientId(clientId).then(data => {
    res.send(data);
  })
    .catch(responseHelper.handleError(res));
}

export function getAnalystbyClientViaActivity(req, res) {
  var clientId = req.query.clientId;
  ClientService.getAnalystbyClientViaActivity(clientId).then(data => {
    res.send(data);
  })
    .catch(responseHelper.handleError(res));
}

export function countCoreSegment(req, res) {
  var clientId = req.query.clientId;
  ClientService.countCoreSegment(clientId).then(data => {
    res.send(data);
  })
    .catch(responseHelper.handleError(res));
}

export function getClientAssignedToCurrentUser(req, res) {
  let bearerToken;
  let bearerHeader = req.headers['authorization'];
  let bearer = bearerHeader.split(' ');
  bearerToken = bearer[1];
  let listClientId = [];
  let role;

  return UserToken.findAll({ where: { access_token: bearerToken } })
    .then(resObj => {
      let data = resObj[0].dataValues;
      let decoded = jwt_decode(data.token_id);
      console.log(data);
      role = decoded['custom:role'];
      let clientIdStr = decoded['custom:client_id'] ? decoded['custom:client_id'] : '';
      if (role !== config.role.spotlightAdmin) {
        listClientId = clientIdStr.split(', ');
      }

      return ClientService.getClientAssignedToCurrentUser(data.email, decoded.given_name + ' ' + decoded.name, role, listClientId).then(data => {
        res.send(data);
      })
    })
    .catch(responseHelper.handleError(res));

}


export function getSubSegmentIdForAnalyst(req, res) {
  ClientService.getSubSegmentIdForAnalyst(req.query.analystId, req.query.clientId)
    .then(data => {
      res.send(data);
    })
    .catch(responseHelper.handleError(res));
}

export function addAnalystToSegments(req, res) {
  let data = req.body.data;
  ClientService.addAnalystToSegments(data)
    .then(data => {
      res.send(data);
    })
    .catch(responseHelper.handleError(res));
}

export function getPermissionToPage(req, res) {
  let objectId = req.query.objectId;
  let objectType = req.query.objectType;
  let currentUserData = req.userData;
  let result = {
    isPassed: false,
    clientIds: []
  }

  if (currentUserData.role === CONSTANTS.role.spotlightAdmin) {
    result.isPassed = true;
    res.send(result);
  } else {
    let clientIds = _.split(currentUserData.clientIds, ',')
    if (clientIds.length === 0) {
      result.isPassed = false;
      res.send(result);
    } else {
      if (objectType === CONSTANTS.insightObjectType.Client) {
        if (_.indexOf(clientIds, objectId) === -1) {
          result.isPassed = false;
        } else {
          result.isPassed = true;
        }
        res.send(result);
      }
      else if (objectType == CONSTANTS.insightObjectType.Collection) {
        let collectionIds = _.split(currentUserData.collectionIds, ', ')
        if (_.indexOf(collectionIds, objectId) === -1) {
          result.isPassed = false;
        } else {
          result.isPassed = true;
        }
        res.send(result);
      }
      else {
        ClientService.getClientsByObjectId(objectId, objectType)
          .then(objectClientIds => {
            let crossClientIds = _.intersection(clientIds, objectClientIds)
            result.isPassed = crossClientIds.length > 0;
            result.clientIds = crossClientIds;
            res.send(result);
          })
          .catch(responseHelper.handleError(res));
      }
    }
  }
}

export function getCategoriesByClient(req, res) {
  let clientId = req.query.clientId;
  ClientService.getCategoriesByClient(clientId)
    .then(data => {
      res.send(data);
    })
    .catch(responseHelper.handleError(res));
}
