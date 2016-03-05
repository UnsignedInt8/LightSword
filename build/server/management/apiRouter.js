//-----------------------------------
// Copyright(c) 2015 Neko
//-----------------------------------
'use strict';
const express = require('express');
const userController = require('./userController');
let router = express.Router();
router.get('/users/count', userController.getUserCount);
router.get('/users', userController.getUsers);
router.post('/users', userController.addUser);
router.put('/users/:port', userController.updateUser);
router.delete('/users/:port', userController.deleteUser);
router.get('/blacklist', userController.getBlacklist);
router.get('/blacklist/count', userController.getBlacklistCount);
router.get('/blacklist/:port', userController.getServerOfPort, userController.getBlacklistOfPort);
router.get('/blacklist/:port/count', userController.getServerOfPort, userController.getBlacklistCountOfPort);
module.exports = router;
