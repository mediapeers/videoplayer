"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = require("lodash");
const config_1 = __importDefault(require("./config"));
class PlayerAnalytics {
    constructor(opts) {
        this.plays = 0;
        this.timePlayed = 0;
        this.opts = opts;
        this.acEvent = {
            asset_id: this.opts.videoId,
            playback_id: this.opts.playerId,
            tt: this.opts.getCurrentTime(),
            domain: window.location.hostname,
            dt: 10,
            visit_id: config_1.default.visitId,
        };
    }
    playbackStarted() {
        clearInterval(this.interval);
        const userId = lodash_1.get(window['Analytics'], 'userId');
        if (this.plays === 0) {
            this.plays += 1;
            this.acEvent.tt = this.opts.getCurrentTime();
            config_1.default.chipmunk.action('ac.virtual/video_ping', 'ping', {
                body: this.acEvent,
            });
            if (config_1.default.googleAnalytics) {
                config_1.default.googleAnalytics('set', {
                    dimension1: this.opts.videoTitle,
                    dimension2: this.opts.videoParentTitle,
                    dimension3: userId,
                });
                config_1.default.googleAnalytics('event', {
                    category: 'video',
                    action: 'play',
                    label: this.opts.videoTitle,
                    nonInteraction: true,
                });
            }
        }
        this.interval = setInterval(() => {
            this.timePlayed = this.timePlayed + 10;
            this.acEvent.tt = this.opts.getCurrentTime();
            config_1.default.chipmunk.action('ac.virtual/video_ping', 'ping', {
                body: this.acEvent,
            });
            if (this.timePlayed % 60)
                return;
            if (config_1.default.googleAnalytics) {
                config_1.default.googleAnalytics('set', {
                    dimension1: this.opts.videoTitle,
                    dimension2: this.opts.videoParentTitle,
                    dimension3: userId,
                    metric1: 60,
                });
                config_1.default.googleAnalytics('event', {
                    category: 'video',
                    action: 'playing',
                    label: `${this.opts.videoParentTitle}: ${this.opts.videoTitle}`,
                    value: 60,
                    nonInteraction: true,
                });
            }
        }, 10000);
    }
    playbackStopped() {
        clearInterval(this.interval);
    }
}
exports.PlayerAnalytics = PlayerAnalytics;
