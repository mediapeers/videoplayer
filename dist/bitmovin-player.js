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
/**
 * The Video Player component.
 */
const react_1 = __importDefault(require("react"));
const classnames_1 = __importDefault(require("classnames"));
const platform_1 = __importDefault(require("platform"));
const nanoid_1 = __importDefault(require("nanoid"));
const lodash_1 = require("lodash");
const player_v8_1 = require("./player-v8");
const api_1 = require("./api");
require("./bitmovin-player.scss");
exports.hasPropChanged = (prevProps, nextProps, propPath) => {
    const prevValue = lodash_1.get(prevProps, propPath);
    const nextValue = lodash_1.get(nextProps, propPath);
    return ((prevValue && !nextValue) ||
        (!prevValue && nextValue) ||
        (prevValue !== nextValue));
};
class default_1 extends react_1.default.PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            error: null,
        };
        this.playerId = nanoid_1.default();
    }
    componentDidMount() {
        this.initialize();
    }
    componentWillUnmount() {
        this.player && this.player.destroy();
    }
    componentDidUpdate(prev) {
        if (exports.hasPropChanged(prev, this.props, 'video.id'))
            this.initialize();
    }
    render() {
        return (react_1.default.createElement("div", { className: classnames_1.default('bitmovin-player', this.props.className) }, this.state.error
            ? react_1.default.createElement("div", { className: "player-error" }, this.state.error)
            : react_1.default.createElement("div", { id: this.playerId }, typeof this.props.render === "function" && this.props.render())));
    }
    initialize() {
        return __awaiter(this, void 0, void 0, function* () {
            // we do not support IE if it's not on windows 10
            if (platform_1.default.name === 'IE' && lodash_1.startsWith(platform_1.default.os.family, 'Windows') && platform_1.default.os.version !== '10') {
                this.setState({
                    error: 'Video playback is not supported using the Internet Explorer browser on your operating system. Please switch to the latest Chrome browser for optimal results.',
                });
                return;
            }
            if (this.player)
                this.player.destroy();
            const videoId = lodash_1.get(this.props, 'video.id');
            if (!videoId)
                return;
            let videoUrlObj = null;
            let subtitles = [];
            try {
                videoUrlObj = yield api_1.getVideoUrl(videoId);
                if (typeof USE_SUBTITLES !== 'undefined' && USE_SUBTITLES) {
                    subtitles = yield api_1.getSubtitles(videoId);
                }
            }
            catch (err) {
                this.setState({
                    error: 'An error occured while initializing the video player. Please try again.',
                });
                return;
            }
            // let impl
            // if (platform.name === 'IE' || platform.name === 'Microsoft Edge') {
            //   impl = PlayerV7
            // }
            // else {
            const impl = player_v8_1.PlayerV8; // default
            // }
            this.player = new impl(Object.assign({ videoId,
                subtitles,
                videoUrlObj, playerId: this.playerId }, this.props));
            if (this.props.controlRef)
                this.props.controlRef(this.player);
            this.player.load();
        });
    }
}
default_1.defaultProps = {
    autoplay: false,
};
exports.default = default_1;
