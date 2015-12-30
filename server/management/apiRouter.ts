//-----------------------------------
// Copyright(c) 2015 猫王子
//-----------------------------------

'use strict'

import * as express from 'express';
import * as apiController from './apiController';

let router = express.Router();
router.get('/users/count', apiController.getUserCount);
router.get('/users', apiController.getUsers);
router.post('/users', apiController.addUser);
router.delete('/users/:port', apiController.deleteUser);

module.exports = router;