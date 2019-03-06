'use strict';

import log4Js from 'log4js';
import * as responseHelper from '../../../components/helper/response-helper';
import config from '../../../../server/config/environment/shared';
import * as changeLogHelper from '../../../components/helper/change-log-helper';
log4Js.configure({
  appenders: [
    { type: 'file', filename: 'logs/object-templates-controller.log', category: 'object-templates-controller' }
  ]
});
var logger = log4Js.getLogger('object-templates-controller');
import { ObjectTemplates, Groups, Items, AnalystItem, ClientItem, FirmItem, ReportItem, ResearchItem, sequelize } from '../../../sqldb';

var GlobalSettingsService = require('../../services/global-settings.service');

export function getAllGlobalSettings(req, res) {
  GlobalSettingsService.getAllGlobalSettings()
    .then(responseHelper.respondWithResult(res))
    .catch(responseHelper.handleError(res));
}
