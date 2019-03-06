'use strict';

import { checkRole } from '../../../permission';
import config from '../../../config/environment/shared';

var express = require('express');
var controller = require('./upload-image.controller');

var router = express.Router();

router.post('', checkRole(config.claim.spotlightSeeNavigation, config.claim.spotlightClientEdit), controller.uploadImage);

router.post('/upload-analyst-image', checkRole(config.claim.spotlightSeeNavigation, config.claim.spotlightClientEdit), controller.uploadAnalystImage);

router.post('/upload-client-speaker-image', controller.uploadClientSpeakerImage);

module.exports = router;
