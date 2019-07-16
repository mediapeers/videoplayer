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
const moment_1 = __importDefault(require("moment"));
const platform_1 = __importDefault(require("platform"));
const crypto_js_1 = __importDefault(require("crypto-js"));
const lodash_1 = require("lodash");
const config_1 = __importDefault(require("./config"));
exports.getVideoUrl = (videoId) => __awaiter(this, void 0, void 0, function* () {
    const timestamp = moment_1.default().utc().format('YYYYMMDDhhmmss');
    let params = { timestamp, video_url_id: videoId };
    if (platform_1.default.os.family === 'iOS' || platform_1.default.name === 'Safari' || platform_1.default.name === 'Firefox') {
        // fallback to CAS DRM
        const mode = '3';
        const secret = config_1.default.videoUrlSecret;
        const token = crypto_js_1.default.HmacSHA256(`${videoId}/${timestamp}/${mode}`, secret).toString();
        params = { video_url_id: videoId, timestamp, mode, token };
    }
    return (yield config_1.default.chipmunk.action('am.asset/video_url', 'get', {
        params,
    })).object;
});
exports.getSubtitles = (videoId) => __awaiter(this, void 0, void 0, function* () {
    const result = (yield config_1.default.chipmunk.action('am.asset/subtitle', 'query', {
        params: { asset_ids: videoId },
        schema: `id, asset_id, language_id, purpose, label, file_attachment, language {name}`,
    }));
    return lodash_1.map(result.objects, (subtitle, index) => {
        const lang = lodash_1.get(subtitle, 'language.name', 'Unknown');
        let label;
        if (!lodash_1.isEmpty(subtitle.label)) {
            label = subtitle.label;
        }
        else {
            label = subtitle.purpose === 'caption' ? `Closed Caption - ${lang}` : `Subtitle - ${lang}`;
        }
        return {
            enabled: false,
            label,
            lang,
            id: subtitle.id,
            kind: subtitle.purpose,
            url: subtitle.file_attachment,
        };
    });
});
