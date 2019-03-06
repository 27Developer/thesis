'use strict';

import { checkRole } from '../../../permission';
import config from '../../../config/environment/shared';

var express = require('express');
var controller = require('./image.controller');

var router = express.Router();

router.get('/:id', controller.getImageById);

module.exports = router;
