'use strict';

import log4Js from 'log4js/lib/log4js';
import * as responseHelper from '../../../components/helper/response-helper';
log4Js.configure({
  appenders: [
    { type: 'file', filename: 'logs/object-templates-controller.log', category: 'object-templates-controller' }
  ]
});
var logger = log4Js.getLogger('object-templates-controller');
import config from '../../../config/environment/shared';
import {
  Groups,
  Items,
} from '../../../sqldb';

var ObjectTemplateService = require('../../services/object-templates.service');

export function getListObjectTemplates(req, res) {
  ObjectTemplateService.getListObjectTemplates()
    .then(responseHelper.respondWithResult(res))
    .catch(responseHelper.handleError(res));
}

export function getListGroupByTemplateId(req, res) {
  var templateId = req.query.id;
  ObjectTemplateService.getListGroupByTemplateId(templateId)
    .then(responseHelper.respondWithResult(res))
    .catch(responseHelper.handleError(res));
}

export function getListGroupByTemplateIdAndClientId(req, res) {
  var templateId = req.query.id;
  var clientId = req.query.client_id;
  ObjectTemplateService.getListGroupByTemplateIdAndClientId(templateId, clientId)
    .then(responseHelper.respondWithResult(res))
    .catch(responseHelper.handleError(res));
}

export function addGroup(req, res) {
  var group = {
    id: req.body.data.id,
    index: req.body.data.index == undefined ? 1 : req.body.data.index,
    group_name: req.body.data.name,
    visibility: req.body.data.status == '1',
    template_id: req.body.data.templateId,
    is_active: true,
    last_update: new Date(),
    listItemInGroup: req.body.data.listItemInGroup
  };
  ObjectTemplateService.addGroup(group)
    .then(responseHelper.respondWithResult(res))
    .catch(responseHelper.handleError(res));
}

export function getListItemByGroupId(req, res) {
  var group_id = req.query.id;

  ObjectTemplateService.getListItemByGroupId(group_id)
    .then(responseHelper.respondWithResult(res))
    .catch(responseHelper.handleError(res));
}

export function saveChangeListGroup(req, res) {
  var listGroups = req.body.data;
  ObjectTemplateService.saveChangeListGroup(listGroups)
    .then(responseHelper.respondWithResult(res))
    .catch(responseHelper.handleError(res));
}

export function getListItemValueByAnalystId(req, res) {
  var analystId = req.query.analyst_id;
  ObjectTemplateService.getListItemValueByAnalystId(analystId)
    .then(responseHelper.respondWithResult(res))
    .catch(responseHelper.handleError(res));
}

export function getListItemValueByClientId(req, res) {
  var clientId = req.query.client_id;
  ObjectTemplateService.getListItemValueByClientId(clientId)
    .then(responseHelper.respondWithResult(res))
    .catch(responseHelper.handleError(res));
}

export function getListItemValueByActivityId(req, res) {
  var activityId = req.query.activity_id;
  ObjectTemplateService.getListItemValueByActivityId(activityId)
    .then(responseHelper.respondWithResult(res))
    .catch(responseHelper.handleError(res));
}

export function getListItemValueByReportId(req, res) {
  var reportId = req.query.report_id;
  ObjectTemplateService.getListItemValueByReportId(reportId)
    .then(responseHelper.respondWithResult(res))
    .catch(responseHelper.handleError(res));
}

export function getListItemValueByFirmId(req, res) {
  var firmId = req.query.firm_id;
  ObjectTemplateService.getListItemValueByFirmId(firmId)
    .then(responseHelper.respondWithResult(res))
    .catch(responseHelper.handleError(res));
}

export function getListItemValueByResearchId(req, res) {
  var researchId = req.query.research_id;
  ObjectTemplateService.getListItemValueByResearchId(researchId)
    .then(responseHelper.respondWithResult(res))
    .catch(responseHelper.handleError(res));
}

export function updateActivityItemValue(req, res) {
  var clientItem = req.body.data;
  ObjectTemplateService.updateActivityItemValue(clientItem)
    //.then(rs => { res.send() })
    .then(responseHelper.respondWithResult(res))
    .catch(err => {
      res.status(400).json(err);
    });
}

export function updateClientItemValue(req, res) {
  var clientItem = req.body.data;
  ObjectTemplateService.updateClientItemValue(clientItem)
    .then(responseHelper.respondWithResult(res))
    .catch(err => { res.status(400).json(err); });
}

export function updateAnalystItemValue(req, res) {
  var analystItem = req.body.data;
  ObjectTemplateService.updateAnalystItemValue(analystItem)
    .then(responseHelper.respondWithResult(res))
    .catch(err => { res.status(400).json(err); });
}

export function updateFirmItemValue(req, res) {
  var firmItem = req.body.data;
  ObjectTemplateService.updateFirmItemValue(firmItem)
    .then(responseHelper.respondWithResult(res))
    .catch(err => { res.status(400).json(err); });
}

export function updateResearchItemValue(req, res) {
  var researchItem = req.body.data;
  ObjectTemplateService.updateResearchItemValue(researchItem)
    .then(responseHelper.respondWithResult(res))
    .catch(err => { res.status(400).json(err); });
}

export function updateReportItemValue(req, res) {
  var reportItem = req.body.data;
  ObjectTemplateService.updateReportItemValue(reportItem)
    .then(responseHelper.respondWithResult(res))
    .catch(err => { res.status(400).json(err); });
}

export function updateAnalystClientViewItemValue(req, res) {
  var analystClientViewItem = req.body.data;
  ObjectTemplateService.updateAnalystClientViewItemValue(analystClientViewItem)
    .then(responseHelper.respondWithResult(res))
    .catch(err => { res.status(400).json(err); });
}

export function getListItemValueByAnalystClientViewId(req, res) {
  var analystId = req.query.analyst_id;
  var clientId = req.query.client_id;
  ObjectTemplateService.getListItemValueByAnalystClientViewId(analystId, clientId)
    .then(rs => { res.send(rs) })
    .catch(err => { res.status(400).json(err); });
}

export function getListGroupByTemplateIdAndFirmId(req, res) {
  try {
    let templateId = config.objectTemplate.RESEARCH_FIRM;
    return Groups.findAll({
      include: [
        Items
      ],
      where: {
        is_active: {
          $eq: true
        },
        template_id: {
          $eq: templateId
        },
        $or: [{
          firm_id: {
            $eq: req.query.firm_id
          }
        },
        {
          firm_id: {
            $eq: null
          }
        }]
      },
      order: [['index', 'ASC'],
      [{ model: Items }, 'index', 'ASC']]
    }
    )
      .then(responseHelper.respondWithResult(res))
      .catch(err => {
        console.log(err);
        throw err;
      });
  } catch (err) {
    console.log(err);
    logger.error(err);
  }
}

export function getListGroupByTemplateIdAndEventId(req, res) {
  try {
    let templateId = config.objectTemplate.EVENT;
    return Groups.findAll({
      include: [{
        model: Items,
        where: { is_active: true },
        required: false
      }
      ],
      where: {
        is_active: {
          $eq: true
        },
        template_id: {
          $eq: templateId
        },
        $or: [
          {
            event_id: {
              $eq: req.query.event_id
            }
          },
          {
            event_id: {
              $eq: null
            }
          }
        ]
      },
      order: [['index', 'ASC'],
      [{ model: Items }, 'index', 'ASC']]
    }
    )
      .then(responseHelper.respondWithResult(res))
      .catch(err => {
        console.log(err);
        throw err;
      });
  } catch (err) {
    console.log(err);
    logger.error(err);
  }
}

export function updateEventItemValue(req, res) {
  var eventItem = req.body.data;
  ObjectTemplateService.updateEventItemValue(eventItem)
    .then(responseHelper.respondWithResult(res))
    .catch(err => { res.status(400).json(err); });
}

export function getListItemValueByEventId(req, res) {
  var eventId = req.query.event_id;
  ObjectTemplateService.getListItemValueByEventId(eventId)
    .then(responseHelper.respondWithResult(res))
    .catch(responseHelper.handleError(res));
}

export function getListItemValueByMarketId(req, res) {
  var eventId = req.query.marketId;
  ObjectTemplateService.getListItemValueByMarketId(eventId)
    .then(responseHelper.respondWithResult(res))
    .catch(responseHelper.handleError(res));
}

export function updateMarketItemValue(req, res) {
  var marketItem = req.body.data;
  ObjectTemplateService.updateMarketItemValue(marketItem)
    .then(responseHelper.respondWithResult(res))
    .catch(err => { res.status(400).json(err); });
}


export function getItemValueByAnalystId(req, res) {
  var analystId = req.query.analyst_id;
  var itemId = req.query.item_id;
  ObjectTemplateService.getItemValueByAnalystId(analystId, itemId)
    .then(responseHelper.respondWithResult(res))
    .catch(responseHelper.handleError(res));
}

export function getItemValueByClientId(req, res) {
  var clientId = req.query.client_id;
  var itemId = req.query.item_id;
  ObjectTemplateService.getItemValueByClientId(clientId, itemId)
    .then(responseHelper.respondWithResult(res))
    .catch(responseHelper.handleError(res));
}


export function getListGroupByTemplateIdAndMarketId(req, res) {
  var templateId = req.query.id;
  var marketId = req.query.market_id;
  ObjectTemplateService.getListGroupByTemplateIdAndMarketId(templateId, marketId)
    .then(responseHelper.respondWithResult(res))
    .catch(responseHelper.handleError(res));
}

export function getItemValueByActivityId(req, res) {
  var activityId = req.query.activity_id;
  var itemId = req.query.item_id;
  ObjectTemplateService.getItemValueByActivityId(activityId, itemId)
    .then(responseHelper.respondWithResult(res))
    .catch(responseHelper.handleError(res));
}

export function saveGroupReport(req, res) {
  ObjectTemplateService.saveGroupReport(req.body.data)
    .then(responseHelper.respondWithResult(res))
    .catch(responseHelper.handleError(res));
}

export function getItemValueByReportId(req, res) {
  var reportId = req.query.report_id;
  var itemId = req.query.item_id;
  ObjectTemplateService.getItemValueByReportId(reportId, itemId)
    .then(responseHelper.respondWithResult(res))
    .catch(responseHelper.handleError(res));
}

export function getItemValueByFirmId(req, res) {
  var firmId = req.query.firm_id;
  var itemId = req.query.item_id;
  ObjectTemplateService.getItemValueByFirmId(firmId, itemId)
    .then(responseHelper.respondWithResult(res))
    .catch(responseHelper.handleError(res));
}

export function getItemValueByResearchId(req, res) {
  var researchId = req.query.research_id;
  var itemId = req.query.item_id;
  ObjectTemplateService.getItemValueByResearchId(researchId, itemId)
    .then(responseHelper.respondWithResult(res))
    .catch(responseHelper.handleError(res));
}
export function getListGroupByTemplateIdAndReportId(req, res) {
  var templateId = req.query.id;
  var reportId = req.query.report_id;
  ObjectTemplateService.getListGroupByTemplateIdAndReportId(templateId, reportId)
    .then(responseHelper.respondWithResult(res))
    .catch(responseHelper.handleError(res));
}

export function getItemValueByAnalystClientViewId(req, res) {
  var analystId = req.query.analyst_id;
  var clientId = req.query.client_id;
  var itemId = req.query.item_id;
  ObjectTemplateService.getItemValueByAnalystClientViewId(analystId, clientId, itemId)
    .then(rs => { res.send(rs) })
    .catch(err => { res.status(400).json(err); });
}

export function getItemValueByEventId(req, res) {
  var eventId = req.query.event_id;
  var itemId = req.query.item_id;
  ObjectTemplateService.getItemValueByEventId(eventId, itemId)
    .then(responseHelper.respondWithResult(res))
    .catch(responseHelper.handleError(res));
}

export function getItemValueByMarketId(req, res) {
  var eventId = req.query.marketId;
  var itemId = req.query.item_id;
  ObjectTemplateService.getItemValueByMarketId(eventId, itemId)
    .then(responseHelper.respondWithResult(res))
    .catch(responseHelper.handleError(res));
}
export function getListGroupByTemplateIdAndReportIdAndClient(req, res) {
  var templateId = req.query.id;
  var reportId = req.query.report_id;
  var clientId = req.query.client_id;
  ObjectTemplateService.getListGroupByTemplateIdAndReportIdAndClient(templateId, reportId, clientId)
    .then(responseHelper.respondWithResult(res))
    .catch(responseHelper.handleError(res));
}
export function getListGroupByCollectionId(req, res) {
  var templateId = req.query.template_id;
  var collectionId = req.query.collection_id;
  ObjectTemplateService.getListGroupByCollectionId(templateId, collectionId)
    .then(responseHelper.respondWithResult(res))
    .catch(responseHelper.handleError(res));
}

export function updateCollectionItemValue(req, res) {
  var collectionItem = req.body.data;
  ObjectTemplateService.updateCollectionItemValue(collectionItem)
    .then(responseHelper.respondWithResult(res))
    .catch(err => { res.status(400).json(err); });
}

export function getListItemValueByCollectionId(req, res) {
  var collectionId = req.query.collectionId;
  ObjectTemplateService.getListItemValueByCollectionId(collectionId)
    .then(responseHelper.respondWithResult(res))
    .catch(responseHelper.handleError(res));
}
