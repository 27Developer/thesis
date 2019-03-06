'use strict';

import uuid from 'uuid';
import log4Js from 'log4js';
log4Js.configure({
  appenders: [
    {type: 'file', filename: 'logs/interactionTypeUpdate.log', category: 'interactionTypeUpdate'}
  ]
});

var logger = log4Js.getLogger('interactionTypeUpdate');

import {Task, InteractionType, Tag, TaskInteraction} from '../../sqldb';

var interactionTypeUpdate = [];
var taskList = [];
var interactionTypeList = [];
var tagList = [];
var lastNotification = '';
var isRunning = false;
var taskInteractionList = [];
var socket = null;

interactionTypeUpdate.process = async function () {
  try {
    taskList = [];
    interactionTypeList = [];
    tagList = [];
    taskInteractionList = [];
    logger.info('Start ETL - Interaction Type Update process.');
    isRunning = true;

    await TaskInteraction.destroy({
      where: {
        id: {
          $ne: ''
        }
      }
    }).catch(handleException);

    logger.info('Get Task from database.');
    taskList = await Task.findAll({
      attributes: ['id'],
      include: [{
        model: Tag, as: 'Tags', attributes: ['id', 'description', 'is_active', 'asana_id']
      }]
    }).catch(handleException);

    logger.info('Get InteractionType from database.');
    interactionTypeList = await InteractionType.findAll({
      attributes: ['id', 'asana_tags']
    }).catch(handleException);

    await saveTaskInteraction();
    await TaskInteraction
      .bulkCreate(taskInteractionList)
      .catch(handleException);

    emitNotificationToClients();
  } catch (err) {
    handleException(err);
  }
};

var saveTaskInteraction = async function() {
  try {
    for (let i = 0; i < taskList.length; i++) {
      const interactionId = await getInteractionTypeIdByTags(taskList[i].Tags);
      if (interactionId !== null) {
        const newTaskInteraction = {
          id: uuid.v1(),
          task_id: taskList[i].id,
          interaction_id: interactionId,
          is_active: true
        };
        taskInteractionList.push(newTaskInteraction);
      }
    }
  } catch (err) {
    throw err;
  }
};

var emitNotificationToClients = function() {
  try {
    const date = new Date();
    lastNotification = {
      isSuccess: true,
      date: date,
      errorMessage: null
    };
    socket.emit('interaction_type_update_process_stoped', true);
    socket.emit('interaction_type_update_process_notify_message', lastNotification);
    socket.broadcast.emit('interaction_type_update_process_stoped', true);
    socket.broadcast.emit('interaction_type_update_process_notify_message', lastNotification);
    logger.info('Interaction Type Update Process completed.<br/>');
  } catch (err) {
    throw err;
  }
};

interactionTypeUpdate.getLastNotification = function() {
  return lastNotification;
};

interactionTypeUpdate.isProcessRunning = function() {
  return isRunning;
};

interactionTypeUpdate.registerSocket = function(socketSourcce) {
  socket = socketSourcce;
};

export default interactionTypeUpdate;

var getInteractionTypeIdByTags = function(tags) {
  try {
    const interactionType = correctHyphenOfString(correctWhiteSpaceOfString(getInteractionTypeByTags(tags)));
    if (interactionType === null) {
      return null;
    }
    for (let j = 0; j < interactionTypeList.length; j++) {
      if (correctHyphenOfString(correctWhiteSpaceOfString(interactionTypeList[j].asana_tags)) === interactionType) {
        return interactionTypeList[j].id;
      }
    }
    return null;
  } catch (err) {
    throw err;
  }
};

var getInteractionTypeByTags = function(tasktags) {
  try {
    tasktags = tasktags.filter(filterActiveTags);

    if (tasktags.length > 0) {
      let tagString = tasktags[0].description;
      for (let i = 1; i < tasktags.length; i++) {
        tagString = tagString.concat(', ', tasktags[i].description);
      }
      return tagString;
    }
    return null;
  } catch (err) {
    throw err;
  }
};

var filterActiveTags = function(tag) {
  return tag.is_active;
};

var correctWhiteSpaceOfString = function(source) {
  try {
    if (source === null || source === undefined) {
      return null;
    }
    return source.replace(/\u00a0/g, ' ');
  } catch (err) {
    throw err;
  }
};

var correctHyphenOfString = function(source) {
  try {
    if (source === null || source === undefined) {
      return null;
    }
    return source
      .replace(/\u1806/g, '-')
      .replace(/\u2010/g, '-')
      .replace(/\u2011/g, '-')
      .replace(/\u2012/g, '-')
      .replace(/\u2013/g, '-')
      .replace(/\u2014/g, '-')
      .replace(/\u2015/g, '-')
      .replace(/\u207b/g, '-')
      .replace(/\u208b/g, '-')
      .replace(/\u2122/g, '-')
      .replace(/\ufe58/g, '-')
      .replace(/\ufe63/g, '-')
      .replace(/\uff0d/g, '-');
  } catch (err) {
    throw err;
  }
};

var handleException = function(err) {
  logger.error(`${err}.`);
  const date = new Date();
  if (err.toString().startsWith('SequelizeDatabaseError')) {
    err = 'Unable to connect to database';
  } else if (err.toString().startsWith('Error: No Authorization')) {
    err = 'Unable to connect to Asana due to token expired';
  } else if (err.toString().startsWith('Error: Server Error')) {
    err = 'Unable to connect to Asana due to Asana server error';
  } else {
    err = 'Unspecified error occurred. Please check the logs for more detail';
  }
  lastNotification = {
    isSuccess: false,
    date: date,
    errorMessage: err
  };
  socket.emit('interaction_type_update_process_stoped', true);
  socket.emit('interaction_type_update_process_notify_message', lastNotification);
  socket.broadcast.emit('interaction_type_update_process_stoped', true);
  socket.broadcast.emit('interaction_type_update_process_notify_message', lastNotification);
  isRunning = false;
};
