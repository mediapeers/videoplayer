import { IChipmunk } from 'chipmunk';
interface PlayerConfig {
    playerKey: string;
    videoUrlSecret: string;
    chipmunk(): IChipmunk;
    visitId(): string;
    googleAnalytics?(action: string, ...args: any[]): any;
}
declare class Config {
    private config;
    configure(conf: PlayerConfig): void;
    readonly chipmunk: IChipmunk | null;
    readonly visitId: string | null;
    readonly googleAnalytics: any;
    readonly playerKey: any;
    readonly videoUrlSecret: any;
}
declare const instance: Config;
export = instance;
