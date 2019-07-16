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
const lodash_1 = require("lodash");
const player_1 = require("./player");
class PlayerV8 extends player_1.Player {
    load() {
        return __awaiter(this, void 0, void 0, function* () {
            yield player_1.Player.loadBitmovin('8.9.0');
            const { playerId } = this.opts;
            const domElement = window.document.getElementById(playerId);
            const config = this.fullConfig();
            this.instance = new bitmovin.player.Player(domElement, config);
            const source = yield this.buildDrmSource();
            return yield this.instance.load(source);
        });
    }
    buildDrmHeaders(auth) {
        return { customdata: auth };
    }
    fullConfig() {
        const result = {};
        lodash_1.merge(result, this.config(), {
            ui: {
                playbackSpeedSelectionEnabled: false,
            },
            remotecontrol: {
                type: 'googlecast',
                customReceiverConfig: {
                    receiverStylesheetUrl: 'https://netflix.buyer.mediapeers.biz/static/bitmovin-cast-customskin.css',
                },
            },
            logs: {
                bitmovin: false,
                level: bitmovin.player.LogLevel.ERROR,
            },
            events: {
                [bitmovin.player.PlayerEvent.Paused]: this.onStop.bind(this),
                [bitmovin.player.PlayerEvent.Play]: this.onPlay.bind(this),
                [bitmovin.player.PlayerEvent.PlaybackFinished]: this.onStop.bind(this),
                [bitmovin.player.PlayerEvent.SegmentPlayback]: this.onSegmentPlayback.bind(this),
                [bitmovin.player.PlayerEvent.Error]: this.onError.bind(this),
                [bitmovin.player.PlayerEvent.Ready]: this.onReady.bind(this),
            },
        });
        if (platform_1.default.name === 'Firefox') {
            lodash_1.merge(result, {
                adaptation: {
                    desktop: {
                        bitrates: {
                            minSelectableVideoBitrate: '3000kbps',
                        },
                        onVideoAdaptation: (data) => {
                            // force to select best derivative on ABR
                            const options = this.instance && this.instance.getAvailableVideoQualities();
                            const best = lodash_1.last(options);
                            return lodash_1.get(best, 'id', data.suggested);
                        },
                    },
                    exclude: true,
                },
            });
        }
        return result;
    }
    onReady() {
        if (lodash_1.isEmpty(this.opts.subtitles))
            return;
        lodash_1.each(this.opts.subtitles, (subtitle) => this.instance.subtitles.add(subtitle));
    }
}
exports.PlayerV8 = PlayerV8;
