import config from '../../../config/environment';
import * as responseHelper from '../../../components/helper/response-helper';

import {
  sequelize,
} from '../../../sqldb';
var eventService = require('../../services/event.service');

export function getListEvent(req, res) {
  eventService.getListEvent()
    .then(data => {
      res.send(data);
    })
    .catch(
      err => {
        throw err;
      }
    );
}

export function addEvent(req, res) {
  var data = req.body.data;
  eventService.AddEvent(data).then(data => {
    res.send(data);
  })
    .catch(responseHelper.handleError(res));
}

export function deleteEvent(req, res) {
  var data = req.query.data;
  var type = req.query.type;
  eventService.DeleteEvent(data, type).then(data => {
    res.send(true);
  })
    .catch(responseHelper.handleError(res));
}

export function updateEvent(req, res) {
  var data = req.body.data;
  eventService.UpdateEvent(data).then(data => {
    res.send(true);
  })
    .catch(responseHelper.handleError(res));
}

export function assginEventToClient(req, res) {
  var events = req.body.events;
  var clientId = req.body.clientId;
  eventService.assginEventToClient(events, clientId).then(data => {
    res.send(true);
  })
    .catch(responseHelper.handleError(res));
}

export function updateEventColor(req, res) {
  var eventId = req.body.eventId;
  var color = req.body.color;
  eventService.updateEventColor(eventId, color).then(data => {
    res.send(true);
  })
    .catch(responseHelper.handleError(res));
}

export function updateClientEventColor(req, res) {
  var eventId = req.body.eventId;
  var color = req.body.color;
  eventService.updateClientEventColor(eventId, color).then(data => {
    res.send(true);
  })
    .catch(responseHelper.handleError(res));
}

export function getEvent(req, res) {
  var eventId = req.query.id;
  var currentUserData = req.userData;
  eventService.GetEvent(eventId, currentUserData).then(data => {
    res.send(data);
  })
    .catch(responseHelper.handleError(res));
}

export function getEventByClientId(req, res) {
  var clientId = req.query.clientId;
  eventService.getEventByClientId(clientId).then(data => {
    res.send(data);
  })
    .catch(responseHelper.handleError(res));
}

export function getAllEvent(req, res) {
  var clientId = req.query.clientId;
  eventService.getAllEvent(clientId).then(data => {
    res.send(data);
  })
    .catch(responseHelper.handleError(res));
}

export function getEventByCollectionId(req, res) {
  var collectionId = req.query.collectionId;
  eventService.getEventByCollectionId(collectionId).then(data => {
    res.send(data);
  })
    .catch(responseHelper.handleError(res));
}

export function getEventByAnalystId(req, res) {
  var analystId = req.query.analystId;
  eventService.GetEventByAnalystId(analystId).then(data => {
    res.send(data);
  })
    .catch(responseHelper.handleError(res));
}

export function getAnalystByEventId(req, res) {
  var eventId = req.query.eventId;
  eventService.getAnalystByEventId(eventId).then(data => {
    res.send(data);
  })
    .catch(responseHelper.handleError(res));
}
