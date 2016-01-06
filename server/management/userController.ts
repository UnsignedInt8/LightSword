//-----------------------------------
// Copyright(c) 2015 猫王子
//-----------------------------------

'use strict'

import { App } from '../app';
import * as express from 'express';

export function getUserCount(req: express.Request, res: express.Response) {
  let data = {
    count: App.Users.size
  }
  
  res.json(data);
}

export function getUsers(req: express.Request, res: express.Response) {
  let users = App.Users.select(item => { return { port: item[1].port, cipher: item[1].cipherAlgorithm, password: item[1].password, expireDate: item[1].expireDate } } ).toArray();
  res.json(users);
}

export function addUser(req: express.Request, res: express.Response) {
  var body = req.body;
  
  let success = App.addUser(body);
  let data = {
    success
  };
  
  res.json(data);
}

export function deleteUser(req: express.Request, res: express.Response) {
  var port = req.params.port;
  
  let success = App.removeUser(port);
  if (!success) return res.status(404).json({ msg: 'User Not Found'});
  return res.json({ msg: 'ok' });
}