//-----------------------------------
// Copyright(c) 2015 猫王子
//-----------------------------------

'use strict'

import * as express from 'express';
import * as userController from './userController';

let router = express.Router();

router.get('/users/count', userController.getUserCount);
router.get('/users', userController.getUsers);
router.post('/users', userController.addUser);
router.put('/users/:port', userController.updateUser);
router.delete('/users/:port', userController.deleteUser);
router.get('/blacklist', userController.getBlacklist);

module.exports = router;