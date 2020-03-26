import platform from 'platform'
import {merge, each, isEmpty, last, get} from 'lodash'
import {Player} from './player'

declare var bitmovin

export class PlayerV8 extends Player {
  public async load() {
    await Player.loadBitmovin('8.31.0')

    const {playerId} = this.opts

    const domElement = window.document.getElementById(playerId)
    const config = this.fullConfig()
    this.instance = new bitmovin.player.Player(domElement, config)

    const source = await this.buildDrmSource()
    return await this.instance.load(source)
  }

  protected buildDrmHeaders(auth) {
    return { customdata: auth }
  }

  private fullConfig() {
    const result = {}

    merge(result, this.config(), {
      ui: {
        playbackSpeedSelectionEnabled: false,
      },
      remotecontrol: {
        type: 'googlecast',
        customReceiverConfig: {
          receiverStylesheetUrl: 'https://netflix.buyer.mediapeers.biz/static/bitmovin-cast-customskin.css',
        },
      },
      logs: {
        bitmovin: false,
        level: bitmovin.player.LogLevel.ERROR,
      },
      events: {
        [bitmovin.player.PlayerEvent.Paused]: this.onPause.bind(this),
        [bitmovin.player.PlayerEvent.Play]: this.onPlay.bind(this),
        [bitmovin.player.PlayerEvent.PlaybackFinished]: this.onStop.bind(this),
        [bitmovin.player.PlayerEvent.SegmentPlayback]: this.onSegmentPlayback.bind(this),
        [bitmovin.player.PlayerEvent.Error]: this.onError.bind(this),
        [bitmovin.player.PlayerEvent.Ready]: this.onReady.bind(this),
      },
    })

    if (platform.name === 'Firefox') {
      merge(result, {
        adaptation: {
          desktop: {
            bitrates: {
              minSelectableVideoBitrate: '3000kbps',
            },
            onVideoAdaptation: (data) => {
              // force to select best derivative on ABR
              const options = this.instance && this.instance.getAvailableVideoQualities()
              const best = last(options)
              return get(best, 'id', data.suggested)
            },
          },
          exclude: true,
        },
      })
    }

    return result
  }

  private onReady() {
    if (isEmpty(this.opts.subtitles)) return
    each(this.opts.subtitles, (subtitle) => this.instance.subtitles.add(subtitle))
  }
}
