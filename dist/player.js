"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const platform_1 = __importDefault(require("platform"));
const superagent_1 = __importDefault(require("superagent"));
const lodash_1 = require("lodash");
const config_1 = __importDefault(require("./config"));
const player_analytics_1 = require("./player-analytics");
class Player {
    constructor(opts) {
        this.escapedError = 0;
        this.onStop = (...args) => {
            if (this.opts.onStop)
                this.opts.onStop(...args);
            this.analytics.playbackStopped();
        };
        this.onPlay = (...args) => {
            if (this.opts.onPlay)
                this.opts.onPlay(...args);
            this.analytics.playbackStarted();
        };
        this.onPause = (...args) => {
            if (this.opts.onPause)
                this.opts.onPause(...args);
            this.analytics.playbackStopped();
        };
        this.onError = (...args) => __awaiter(this, void 0, void 0, function* () {
            if (this.opts.onError)
                this.opts.onError(...args);
            this.analytics.playbackStopped();
            if (this.escapedError > 5)
                return;
            this.escapedError++;
            const time = (this.segmentData && lodash_1.toInteger(this.segmentData.playbackTime + this.segmentData.duration + 1)) || 0;
            const volume = this.instance.getVolume();
            const isMuted = this.instance.isMuted();
            console.log('============================================================\n', `start playback at ${time} second(s) to skip corrupt segment \n`, '============================================================');
            yield this.instance.destroy();
            yield this.load();
            this.instance.setVolume(volume);
            if (isMuted)
                this.instance.mute();
            this.instance.play();
            this.instance.seek(time);
        });
        this.opts = opts;
        this.analytics = new player_analytics_1.PlayerAnalytics(Object.assign({ getCurrentTime: this.getCurrentTime.bind(this) }, opts));
    }
    static loadBitmovin(version) {
        if (Player.jsPromise)
            return Player.jsPromise;
        return Player.jsPromise = new Promise((resolve) => {
            if (typeof bitmovin !== 'undefined')
                return resolve();
            const script = document.createElement('script');
            script.onload = () => resolve();
            script['src'] = `https://cdn.bitmovin.com/player/web/${version}/bitmovinplayer.js`;
            document.head.appendChild(script);
        });
    }
    load() {
        return __awaiter(this, void 0, void 0, function* () {
            throw new Error('not implemented');
        });
    }
    destroy() {
        this.analytics.playbackStopped();
        this.instance.destroy();
        this.analytics = null;
        this.instance = null;
    }
    play() {
        this.instance && this.instance.play();
    }
    pause() {
        this.instance && this.instance.pause();
    }
    get playerId() {
        return this.opts.playerId;
    }
    config() {
        return {
            key: config_1.default.playerKey,
            playback: {
                autoplay: !!this.opts.autoplay,
            },
        };
    }
    canPlayHls() {
        return (platform_1.default.os.family === 'iOS') || (platform_1.default.name === 'Safari');
    }
    onSegmentPlayback(evt) {
        this.segmentData = evt;
    }
    buildDrmSource() {
        return __awaiter(this, void 0, void 0, function* () {
            const { videoUrlObj, posterUrl } = this.opts;
            const source = {
                poster: posterUrl,
            };
            if (videoUrlObj['dash'])
                source.dash = videoUrlObj['dash'];
            if (videoUrlObj['hls'])
                source.hls = videoUrlObj['hls'];
            // for CAS drm will look like base64 and start with 'BBB'
            if (videoUrlObj['drm'] && !lodash_1.startsWith(videoUrlObj['drm'], 'BBB')) {
                const drmRes = yield superagent_1.default.get(videoUrlObj['drm']);
                const { auth, playready, fairplay, fairplay_cert, widevine } = drmRes.body;
                const headers = this.buildDrmHeaders(auth);
                lodash_1.merge(source, {
                    drm: {
                        playready: { LA_URL: playready, customData: auth },
                        widevine: { LA_URL: widevine, headers },
                    },
                });
                if (!this.canPlayHls())
                    delete source.hls;
                if (fairplay) {
                    lodash_1.merge(source.drm, {
                        fairplay: {
                            headers,
                            LA_URL: fairplay,
                            certificateURL: fairplay_cert,
                            prepareMessage: (event, session) => `spc=${event.messageBase64Encoded}&assetId=${session.contentId}`,
                            prepareContentId: (contentId) => {
                                if (contentId.indexOf('skd://') > -1)
                                    return contentId.split('skd://')[1].substr(0, 32);
                                throw new Error('Invalid Content ID format. The format of the Content ID\
               must be the following: skd://xxx where xxx is the Key ID in hex format.');
                            },
                        },
                    });
                }
            }
            return source;
        });
    }
    buildDrmHeaders(auth) {
        // this varies between versions, please add a concrete implementation
        throw new Error('not implemented');
    }
    getCurrentTime() {
        return this.instance && this.instance.getCurrentTime() || 0;
    }
}
exports.Player = Player;
