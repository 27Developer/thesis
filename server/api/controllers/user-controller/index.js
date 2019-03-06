'use strict';

import { checkRole } from '../../../permission';
import config from '../../../config/environment/shared';

var express = require('express');
var controller = require('./user.controller');

var router = express.Router();

router.get('/', controller.getAllUsersFromDb);

router.get('/get-user-from-aws', controller.getAllUsers);
router.get('/getListUserFilter', checkRole(config.claim.spotlightSeeNavigation), controller.getListUserFilter);

router.get('/getUserByEmail', checkRole(config.claim.spotlightSeeNavigation), controller.getUserByEmail);

router.post('/create', checkRole(config.claim.spotlightSeeNavigation), controller.createUserAdmin);

router.put('/update', checkRole(config.claim.spotlightSeeNavigation), controller.updateUser);

router.get('/getClientByUserId', checkRole(config.claim.spotlightSeeNavigation), controller.getClientByUserId);

router.get('/resendInvite', checkRole(config.claim.spotlightSeeNavigation), controller.resendInvite);

router.get('/updateUserStatus', checkRole(config.claim.spotlightSeeNavigation), controller.updateUserStatus);

module.exports = router;
