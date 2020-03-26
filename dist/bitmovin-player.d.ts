/**
 * The Video Player component.
 */
import React from 'react';
import { Player } from './player';
import './bitmovin-player.scss';
export interface IBitmovinPlayerProps {
    video: any;
    className?: string;
    videoTitle?: string | null;
    videoParentTitle?: string | null;
    productId?: number | null;
    controlRef?: (player: Player) => {};
    autoplay?: boolean;
    posterUrl?: string;
    render?: Function;
    onPlay?: Function;
    onPause?: Function;
    onStop?: Function;
    onError?: Function;
}
export declare const hasPropChanged: (prevProps: any, nextProps: any, propPath: any) => boolean;
export default class extends React.PureComponent<IBitmovinPlayerProps, any> {
    static defaultProps: IBitmovinPlayerProps | {};
    state: {
        error: any;
    };
    private playerId;
    private player;
    constructor(props: any);
    componentDidMount(): void;
    componentWillUnmount(): void;
    componentDidUpdate(prev: any): void;
    render(): JSX.Element;
    private initialize;
}
