//-----------------------------------
// Copyright(c) 2015 猫王子
//-----------------------------------

'use strict'

import * as express from 'express';
import * as apiController from './apiController';

let router = express.Router();
router.get('/userCount', apiController.getUserCount);

module.exports = router;