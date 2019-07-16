import { Player } from './player';
export declare class PlayerV8 extends Player {
    load(): Promise<any>;
    protected buildDrmHeaders(auth: any): {
        customdata: any;
    };
    private fullConfig;
    private onReady;
}
