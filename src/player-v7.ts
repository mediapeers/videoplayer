import {merge, each, isEmpty} from 'lodash'
import {Player} from './player'

declare var bitmovin

export class PlayerV7 extends Player {
  public async load() {
    await Player.loadBitmovin('7.8.6')

    this.instance = bitmovin.player(this.opts.playerId)

    const config = this.fullConfig()
    config['source'] = await this.buildDrmSource()
    return await this.instance.setup(config)
  }

  protected buildDrmHeaders(auth) {
    return [{name: 'customdata', value: auth }]
  }

  private fullConfig() {
    return merge(this.config(), {
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
    })
  }

  private onReady() {
    if (isEmpty(this.opts.subtitles)) return
    each(this.opts.subtitles, (subtitle) => this.instance.addSubtitle(subtitle))
  }
}
