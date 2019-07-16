import { IChipmunk } from 'chipmunk';
interface PlayerConfig {
    chipmunk(): IChipmunk;
    visitId(): string;
    playerKey: string;
    videoUrlSecret: string;
    googleAnalytics?(action: string, ...args: any[]): any;
}
declare class Config {
    private config;
    configure(conf: PlayerConfig): void;
    readonly chipmunk: IChipmunk | null;
    readonly visitId: string | null;
    readonly googleAnalytics: (action: string, ...args: any[]) => any;
    readonly playerKey: string;
    readonly videoUrlSecret: string;
}
declare const instance: Config;
export = instance;
