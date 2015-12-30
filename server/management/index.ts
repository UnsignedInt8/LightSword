//-----------------------------------
// Copyright(c) 2015 猫王子
//-----------------------------------

'use strict'

import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as apiRouter from './apiRouter';

let app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use('/api', <express.IRouter<express.Router>>apiRouter);

app.listen(3000, 'localhost');