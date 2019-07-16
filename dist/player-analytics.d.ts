export interface IPlayerAnalyticsOpts {
    videoId: number;
    playerId: string;
    getCurrentTime?: Function;
    title?: string;
    parentTitle?: string;
}
export declare class PlayerAnalytics {
    private opts;
    private interval;
    private acEvent;
    private plays;
    private timePlayed;
    constructor(opts: IPlayerAnalyticsOpts);
    playbackStarted(): void;
    playbackStopped(): void;
}
