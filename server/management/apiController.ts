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

export function addUser(req: express.Request, res: express.Response) {
  var body = req.body;
  
  let success = App.addUser(body);
  let data = {
    success
  };
  
  res.json(data);
}