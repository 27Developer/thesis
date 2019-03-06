'use strict';

import schedule from 'node-schedule';
import asanaSyncData from '../components/asana-sync-data/asana-sync-data';
import interactionTypeUpdateProcess from '../components/asana-sync-data/interaction-type-update';
import log4Js from 'log4js';
log4Js.configure({
  appenders: [
    {type: 'file', filename: 'logs/etlProcess.log', maxLogSize: 102400, category: 'etlProcess'}
  ]
});
var logger = log4Js.getLogger('etlProcess');
var thisSocket = null;

export function register(socket) {
  thisSocket = socket;
  interactionTypeUpdateProcess.registerSocket(socket);
  thisSocket.on('start_etl_process', startEtlProcess);

  thisSocket.on('is_etl_process_running', function() {
    if (asanaSyncData.isProcessRunning()) {
      thisSocket.emit('etl_process_started', true);
    } else {
      thisSocket.emit('etl_process_stoped', false);
    }
  });

  thisSocket.on('get_etl_process_notify_message', function() {
    if (typeof (asanaSyncData.getLastNotification()) !== 'undefined' && asanaSyncData.getLastNotification() !== '') {
      thisSocket.emit('etl_process_notify_message', asanaSyncData.getLastNotification());
    }
  });

  thisSocket.on('is_interaction_type_update_process_running', function() {
    if (interactionTypeUpdateProcess.isProcessRunning()) {
      thisSocket.emit('interaction_type_update_process_started', true);
    } else {
      thisSocket.emit('interaction_type_update_process_stoped', false);
    }
  });

  thisSocket.on('get_interaction_type_update_process_notify_message', function() {
    if (typeof (interactionTypeUpdateProcess.getLastNotification()) !== 'undefined' && interactionTypeUpdateProcess.getLastNotification() !== '') {
      thisSocket.emit('interaction_type_update_process_notify_message', interactionTypeUpdateProcess.getLastNotification());
    }
  });

  //schedule.scheduleJob('00 00 07 * * *', startEtlProcess);
}

var startEtlProcess = function() {
  if (!asanaSyncData.isProcessRunning()) {
    try {
      thisSocket.emit('etl_process_started', true);
      thisSocket.broadcast.emit('etl_process_started', true);
      asanaSyncData.process(thisSocket);
    } catch (err) {
      logger.error(err.toString());
      thisSocket.emit('etl_process_stoped', false);
      thisSocket.broadcast.emit('etl_process_stoped', false);
    }
  }
};
