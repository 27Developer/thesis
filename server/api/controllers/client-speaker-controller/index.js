'use strict';

import { checkRole } from '../../../permission';
import config from '../../../config/environment/shared';

var express = require('express');
var controller = require('./client-speaker.controller');

var router = express.Router();

router.post('/add-new-client-speaker', controller.addNewClientSpeaker);

router.get('', controller.getAll);

router.get('/get-speaker-by-id',controller.getSpeakerById);

router.get('/get-speaker-by-client-id',controller.getListSpeakersByClientId);

router.post('/add-new-client-speaker', controller.addNewClientSpeaker);

router.post('/update-client-speaker', controller.updateClientSpeaker);

router.get('/delete-client-speaker', controller.deleteClientSpeaker)

module.exports = router;
