'use strict';

import log4Js from 'log4js';
log4Js.configure({
  appenders: [
    {type: 'file', filename: 'logs/etl-process-controller.log', category: 'etl-process-controller'}
  ]
});
var logger = log4Js.getLogger('etl-process-controller');
import interactionTypeUpdateProcess from '../../../components/asana-sync-data/interaction-type-update';

export function updateInteractionTypeProcess(req, res) {
  try {
    interactionTypeUpdateProcess.process();
    return res.status(202).json(null);
  } catch (err) {
    logger.error(err);
  }
}
