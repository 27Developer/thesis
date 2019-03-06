'use strict';
import log4Js from 'log4js/lib/log4js';
import config from '../../../config/environment';
import * as responseHelper from '../../../components/helper/response-helper';
import {
  UserToken
} from '../../../sqldb';

import { ListClientDto } from '../../dtos/clientDto';
import { ToActivityListDto } from '../../dtos/actitivyDto';

var jwt_decode = require('jwt-decode');
var CollectionService = require('../../services/collection.service');

log4Js.configure({
  appenders: [
    { type: 'file', filename: 'logs/client-controller.log', category: 'client-controller' }
  ]
});
var logger = log4Js.getLogger('upload-image-controller');


export function getAllCollections(req, res) {
  CollectionService.getAllCollections(req).then(data => {
    res.status(200).json(data);
  }).catch(responseHelper.handleError(res));
}

export function getCollectionById(req, res) {
  var collectionId = req.query.id;
  CollectionService.getCollectionById(collectionId).then(data => {
    res.status(200).json(data);
  }).catch(responseHelper.handleError(res));
}



export function addCollection(req, res) {
  var collection = req.body;
  CollectionService.addCollection(collection)
    .then(rs => { res.send(rs) })
    .catch(responseHelper.handleError(res));
}

export function editCollection(req, res) {
  var collection = req.body;
  CollectionService.editCollection(collection)
    .then(rs => { res.send(rs) })
    .catch(responseHelper.handleError(res));
}

export function deleteCollectionSelected(req, res) {
  let collectionIds = req.query.collectionIds;
  CollectionService.deleteCollectionSelected(collectionIds)
    .then(data => { res.status(200).json(data) })
    .catch(responseHelper.handleError(res));
}

export function getOverviewByCollectionId(req, res) {
  let collectionId = req.query.collectionId;
  CollectionService.getOverviewByCollectionId(collectionId)
    .then(data => { res.status(200).json(data) })
    .catch(responseHelper.handleError(res));
}

export function getClientByCollectionId(req, res) {
  let collectionId = req.query.collectionId;
  CollectionService.getClientByCollectionId(collectionId)
    .then(data => { res.status(200).json(data) })
    .catch(err => {
      console.log(err);
      res.status(400).json(err);
    });
}

export function getListCollection(req, res) {
  CollectionService.getListCollection()
    .then(data => { res.status(200).json(data) })
    .catch(responseHelper.handleError(res));
}

export function getAnalystByCollectionId(req, res) {
  let collectionId = req.query.collection_id
  CollectionService.getAnalystByCollectionId(collectionId)
    .then(data => { res.status(200).json(data) })
    .catch(responseHelper.handleError(res));
}

export function getListInsightsByCollectionId(req, res) {
  let collectionId = req.query.collection_id;
  let currentUserData = req.userData;
  CollectionService.getListInsightsByCollectionId(collectionId, currentUserData)
    .then(data => { res.status(200).json(data) })
    .catch(responseHelper.handleError(res));
}

export function getListSpeakerByCollectionId(req, res) {
  let collectionId = req.query.collection_id
  CollectionService.getListSpeakerByCollectionId(collectionId)
    .then(data => { res.status(200).json(data) })
    .catch(responseHelper.handleError(res));
}

export function getListEventByCollectionId(req, res) {
  let collectionId = req.query.collection_id
  CollectionService.getListEventByCollectionId(collectionId)
    .then(data => { res.status(200).json(data) })
    .catch(responseHelper.handleError(res));
}

export function getClientActivityByCollectionId(req, res) {
  let collectionId = req.query.collection_id
  CollectionService.getClientActivityByCollectionId(collectionId)
    .then(data => { res.status(200).json(data) })
    .catch(responseHelper.handleError(res));
}

export function getListNoteByCollectionId(req, res) {
  let clientIds = req.query.clientIds;
  CollectionService.getListNoteByCollectionId(clientIds)
    .then(data => { res.status(200).json(data) })
    .catch(responseHelper.handleError(res));
}
export function getAnalystAssocialClientGlobalSegment(req, res) {
  let collectionId = req.query.collection_id
  CollectionService.getAnalystAssocialClientGlobalSegment(collectionId)
    .then(data => { res.status(200).json(data) })
    .catch(responseHelper.handleError(res));
}

export function getClientGlobalSegment(req, res) {
  let clientId = req.query.client_id
  CollectionService.getClientGlobalSegment(clientId)
    .then(data => { res.status(200).json(data) })
    .catch(responseHelper.handleError(res));
}

export function getAnalystUnassignedGlobalSegment(req, res) {
  let clientId = req.query.client_id
  CollectionService.getAnalystUnassignedGlobalSegment(clientId)
    .then(data => { res.status(200).json(data) })
    .catch(responseHelper.handleError(res));
}

export function getAnalystAndSubSegmentForClient(req, res) {
  let clientId = req.query.client_id
  CollectionService.getAnalystAndSubSegmentForClient(clientId)
    .then(data => { res.status(200).json(data) })
    .catch(responseHelper.handleError(res));
}

export function getAvgSentimentForAnalystAndClient(req, res) {
  let clientId = req.body.clientId
  let analystIds = req.body.analystIds;
  CollectionService.getAvgSentimentForAnalystAndClient(clientId, analystIds)
    .then(data => { res.status(200).json(data) })
    .catch(responseHelper.handleError(res));
}

export function updateInsightStatusInCollection(req, res) {
  let collectionId = req.body.collection_id || null;
  let insightId = req.body.insight_id || null;
  let starValue = req.body.star_value || false;
  CollectionService.updateInsightStatusInCollection(collectionId, insightId, starValue)
    .then(data => { res.status(200).json(data) })
    .catch(responseHelper.handleError(res));
}

export function getAssignedCollections(req, res) {
  let bearerToken;
  let bearerHeader = req.headers['authorization'];
  let bearer = bearerHeader.split(' ');
  bearerToken = bearer[1];
  let collectionIdStr = [];
  let role;
  return UserToken.findOne({ where: { access_token: bearerToken } })
    .then(resObj => {
      let data = resObj.dataValues;
      let decoded = jwt_decode(data.token_id);
      role = decoded['custom:role'];
      let collectionIdStr = decoded['custom:collection_id'] ? decoded['custom:collection_id'] : '';
      if (role !== config.role.spotlightAdmin) {
        collectionIdStr = collectionIdStr.split(', ');
      }
      return CollectionService.getAssignedCollections(data.email, role, collectionIdStr).then(data => {
        res.status(200).json(data);
      }).catch(responseHelper.handleError(res));
    })
    .catch(responseHelper.handleError(res));
}