'use strict';
import * as responseHelper from '../../../components/helper/response-helper';
import log4Js from 'log4js';
log4Js.configure({
  appenders: [
    {type: 'file', filename: 'logs/tag-controller.log', category: 'tag-controller'}
  ]
});
var logger = log4Js.getLogger('tag-controller');
import {Tag} from '../../../sqldb';
import interactionTypeUpdateProcess from '../../../components/asana-sync-data/interaction-type-update';

export function getAllTags(req, res) {
  try {
    return Tag.findAll({attributes: ['id', 'description', 'is_active']})
      .then(responseHelper.respondWithResult(res))
      .catch(responseHelper.handleError(res));
  } catch (err) {
    logger.error(err);
  }
}

export function updateInteractionTypeProcess(req, res) {
  try {
    var tags = req.body.tags;
    for (var i = 0; i < tags.length; i++) {
      Tag.upsert(tags[i]);
    }
    setTimeout(interactionTypeUpdateProcess.process, 10000);
    return res.status(202).json(null);
  } catch (err) {
    logger.error(err);
  }
}
