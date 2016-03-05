//-----------------------------------
// Copyright(c) 2015 Neko
//-----------------------------------
'use strict';
const os = require('os');
const cluster = require('cluster');
const app_1 = require('./app');
function runAsClusterMode(options, callback) {
    if (cluster.isMaster) {
        os.cpus().forEach(() => {
            cluster.fork();
        });
        cluster.on('exit', () => cluster.fork());
        return callback();
    }
    options.users.forEach(o => new app_1.App(o));
    if (options.management)
        require('./management/index');
    if (options.user)
        try {
            process.setuid(options.user);
        }
        catch (ex) {
            console.error(ex.message);
        }
}
exports.runAsClusterMode = runAsClusterMode;
