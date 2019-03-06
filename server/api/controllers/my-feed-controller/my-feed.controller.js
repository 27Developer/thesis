'use strict';

var MyFeedService = require('../../services/my-feed.service');
var ClientService = require('../../services/client.service');
var AnalystService = require('../../services/analyst.service');
import {
  UserToken
} from '../../../sqldb';
var jwt_decode = require('jwt-decode');
var CONSTANTS = require('../../../config/environment/shared');

export function getMyFeedClients(req, res) {
  var date = req.query.date;
  var numberOfDay = req.query.numberOfDay;

  let bearerToken;
  let bearerHeader = req.headers['authorization'];
  let bearer = bearerHeader.split(' ');
  bearerToken = bearer[1];
  let listClientId = [];

  return UserToken.findOne({ where: { access_token: bearerToken } })
    .then(resObj => {
      let data = resObj.dataValues;
      let decoded = jwt_decode(data.token_id);
      console.log(data);
      var role = decoded['custom:role'];
      let clientIdStr = decoded['custom:client_id'] ? decoded['custom:client_id'] : '';
      if (role !== CONSTANTS.role.spotlightAdmin) {
        listClientId = clientIdStr.split(', ');
      }
      return ClientService.getClientAssignedToCurrentUser(data.email, decoded.given_name + ' ' + decoded.name, role, listClientId).then(data => {
        //res.send(data);
        var listClients = data;
        return MyFeedService.getMyFeedClients(date, numberOfDay, listClients, role);
      })
        .then(rs => { res.send(rs) })
    })
    .catch(err => {
      res.status(400).json(err);
    });
}

export function getMyFeedActivities(req, res) {
  var date = req.query.date;
  var numberOfDay = req.query.numberOfDay;
  var timezone = req.query.timezone;
  var currentUserData = req.userData;
  var listClientId13 = currentUserData.clientIds !== '' ? currentUserData.clientIds.split(',') : [];
  var analystIds = [];

  AnalystService.getAnalystsAssignedToUser(currentUserData).then(analysts => {
    analystIds = analysts.map(analyst => { return analyst.id });
    return ClientService.getClientAssignedToCurrentUser(currentUserData.email, currentUserData.given_name + ' ' + currentUserData.name, currentUserData.role, listClientId13)
  }).then(data => {
    //res.send(data);
    var clientIds = data.map(client => { return client.id });;
    return MyFeedService.getMyFeedActivities(date, numberOfDay, timezone, clientIds, analystIds);
  })
    .then(rs => { res.send(rs) })
    .catch(err => {
      res.status(400).json(err);
    });
}

export function getMyFeedInsights(req, res) {
  var date = req.query.date;
  var numberOfDay = req.query.numberOfDay;
  var timezone = req.query.timezone || 0;
  var currentUserData = req.userData;
  var listClientId13 = currentUserData.clientIds !== '' ? currentUserData.clientIds.split(',') : [];
  ClientService.getClientAssignedToCurrentUser(currentUserData.email, currentUserData.given_name + ' ' + currentUserData.name, currentUserData.role, listClientId13)
  .then(data => {
    var clientIds = data.map(client => { return client.id });;
    return MyFeedService.getMyFeedInsights(date, numberOfDay, timezone, clientIds);
  })
    .then(rs => { res.send(rs) })
    .catch(err => { res.status(400).json(err); });
}

