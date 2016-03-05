//-----------------------------------
// Copyright(c) 2015 Neko
//-----------------------------------
'use strict';
const express = require('express');
const bodyParser = require('body-parser');
const apiRouter = require('./apiRouter');
let app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/api', apiRouter);
app.listen(5000, 'localhost');
