"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = require("lodash");
const player_1 = require("./player");
class PlayerV7 extends player_1.Player {
    load() {
        return __awaiter(this, void 0, void 0, function* () {
            yield player_1.Player.loadBitmovin('7.8.6');
            this.instance = bitmovin.player(this.opts.playerId);
            const config = this.fullConfig();
            config['source'] = yield this.buildDrmSource();
            return yield this.instance.setup(config);
        });
    }
    buildDrmHeaders(auth) {
        return [{ name: 'customdata', value: auth }];
    }
    fullConfig() {
        return lodash_1.merge(this.config(), {
            cast: {
                enable: true,
                receiverStylesheetUrl: 'https://netflix.buyer.mediapeers.biz/static/bitmovin-cast-customskin.css',
            },
            events: {
                onPaused: this.onStop.bind(this),
                onPlay: this.onPlay.bind(this),
                onPlaybackFinished: this.onStop.bind(this),
                onSegmentPlayback: this.onSegmentPlayback.bind(this),
                onError: this.onError.bind(this),
                onReady: this.onReady.bind(this),
            },
        });
    }
    onReady() {
        if (lodash_1.isEmpty(this.opts.subtitles))
            return;
        lodash_1.each(this.opts.subtitles, (subtitle) => this.instance.addSubtitle(subtitle));
    }
}
exports.PlayerV7 = PlayerV7;
