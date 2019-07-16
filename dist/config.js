"use strict";
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
        return this.config && this.config.googleAnalytics;
    }
    get playerKey() {
        return this.config && this.config.playerKey;
    }
    get videoUrlSecret() {
        return this.config && this.config.videoUrlSecret;
    }
}
const instance = new Config();
module.exports = instance;
