//-----------------------------------
// Copyright(c) 2015 猫王子
//-----------------------------------

'use strict'

import { App } from '../app';
import * as express from 'express';
import * as kinq from 'kinq';

export function getUserCount(req: express.Request, res: express.Response) {
  res.json({ count: App.Users.size });
}

export function getUsers(req: express.Request, res: express.Response) {
  let users = App.Users.select(item => { return { port: item[1].port, cipherAlgorithm: item[1].cipherAlgorithm, expireDate: item[1].expireDate } } ).toArray();
  res.json(users);
}

export function addUser(req: express.Request, res: express.Response) {
  var body = req.body;
  
  let success = Array.isArray(body) ? App.addUsers(body) : App.addUser(body);
  let statusCode = success ? 200 : 400;
  let data = {
    success,
    msg: success ? undefined : `Port number: ${body.port} is used or access denied`
  };
  
  res.status(statusCode).json(data);
}

export function updateUser(req: express.Request, res: express.Response) {
  var body = req.body;
  
  let success = App.updateUser(Number(req.params.port), body);
  let statusCode = success ? 200 : 404;
  let data = {
    success,
    msg: success ? undefined : 'User Not Found'
  };
  
  res.status(statusCode).json(data);
}

export function deleteUser(req: express.Request, res: express.Response) {
  var port = Number(req.params.port);
  
  let success = App.removeUser(port);
  let statusCode = success ? 200 : 404;
  let data = {
    success,
    msg: success ? undefined : 'User Not Found'
  };
  
  res.status(404).json(data);
}

export function getBlacklist(req: express.Request, res: express.Response) {
  let data = kinq.toLinqable(App.Users.values()).select(server => server.blackIPs).flatten(false).toArray();
  res.status(data.length > 0 ? 200 : 404).json(data);
}

export function getBlacklistCount(req: express.Request, res: express.Response) {
  let count = kinq.toLinqable(App.Users.values()).select(s => s.blackIPs.size).sum();
  res.json({ count });
}