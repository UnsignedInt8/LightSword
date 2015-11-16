//-----------------------------------
// Copyright(c) 2015 猫王子
//-----------------------------------
'use strict';
class PluginPivot {
    constructor(plugin) {
        let _this = this;
        ['negotiate', 'transportStream'].forEach(n => _this[n] = require(`./${n}.${plugin}`));
    }
}
exports.PluginPivot = PluginPivot;
//# sourceMappingURL=main.js.map