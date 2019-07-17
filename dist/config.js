"use strict";
const lodash_1 = require("lodash");
class Config {
    configure(conf) {
        this.config = conf;
    }
    get chipmunk() {
        return this.config && this.config.chipmunk();
    }
    get visitId() {
        return this.config && this.config.visitId();
    }
    get googleAnalytics() {
        return lodash_1.get(this, 'config.googleAnalytics');
    }
    get playerKey() {
        return lodash_1.get(this, 'config.playerKey');
    }
    get videoUrlSecret() {
        return lodash_1.get(this, 'config.videoUrlSecret');
    }
}
const instance = new Config();
module.exports = instance;
