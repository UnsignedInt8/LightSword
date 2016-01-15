//-----------------------------------
// Copyright(c) 2015 Neko
//-----------------------------------

'use strict'

import { App } from '../app';
import { LsServer } from '../server';
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

export function getServerOfPort(req: express.Request, res: express.Response, next: Function) {
  let server = kinq.toLinqable(App.Users.values()).singleOrDefault(s => s.port === Number(req.params.port), undefined);
  if (!server) {
    return res.status(404).json({ success: false, msg: 'User Not Found' });
  }
  
  req.user = server;
  next();
}

export function getBlacklistOfPort(req: express.Request, res: express.Response) {
  let server = <LsServer>req.user;
  res.json(server.blackIPs.toArray());
}

export function getBlacklistCountOfPort(req: express.Request, res: express.Response) {
  let server = <LsServer>req.user;
  res.json({ count: server.blackIPs.size });
}