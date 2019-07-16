import { Player } from './player';
export declare class PlayerV7 extends Player {
    load(): Promise<any>;
    protected buildDrmHeaders(auth: any): {
        name: string;
        value: any;
    }[];
    private fullConfig;
    private onReady;
}
