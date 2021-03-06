import { PlayerAnalytics, IPlayerAnalyticsOpts } from './player-analytics';
export interface IPlayerConfigOpts {
    playerId: string;
    videoUrlObj: any;
    subtitles?: any[];
    autoplay?: boolean;
    posterUrl?: string | null;
    onPlay?: Function;
    onPause?: Function;
    onStop?: Function;
    onError?: Function;
}
export interface IPlayerOpts extends IPlayerConfigOpts, IPlayerAnalyticsOpts {
}
export declare abstract class Player {
    static jsPromise: any;
    static loadBitmovin(version: any): any;
    protected opts: IPlayerOpts;
    protected analytics: PlayerAnalytics;
    protected instance: any;
    protected segmentData: any;
    private escapedError;
    constructor(opts: IPlayerOpts);
    load(): Promise<void>;
    destroy(): void;
    play(): void;
    pause(): void;
    readonly playerId: string;
    protected config(): {
        key: any;
        playback: {
            autoplay: boolean;
        };
    };
    protected onStop: (...args: any[]) => void;
    protected onPlay: (...args: any[]) => void;
    protected onPause: (...args: any[]) => void;
    protected onError: (...args: any[]) => Promise<void>;
    protected canPlayHls(): boolean;
    protected onSegmentPlayback(evt: any): void;
    protected buildDrmSource(): Promise<any>;
    protected buildDrmHeaders(auth: any): void;
    private getCurrentTime;
}
