import platform from 'platform'
import request from 'superagent'
import {merge, startsWith, toInteger} from 'lodash'

import config from './config'
import {PlayerAnalytics, IPlayerAnalyticsOpts } from './player-analytics'

declare var bitmovin

export interface IPlayerConfigOpts {
  playerId: string
  videoUrlObj: any
  subtitles?: any[]
  autoplay?: boolean
  posterUrl?: string | null
}

export interface IPlayerOpts extends IPlayerConfigOpts, IPlayerAnalyticsOpts {}

export abstract class Player {
  public static jsPromise

  public static loadBitmovin(version) {
    if (Player.jsPromise) return Player.jsPromise

    return Player.jsPromise = new Promise((resolve) => {
      if (typeof bitmovin !== 'undefined') return resolve()

      const script = document.createElement('script')
      script.onload = () => resolve()
      script['src'] = `https://cdn.bitmovin.com/player/web/${version}/bitmovinplayer.js`
      document.head.appendChild(script)
    })
  }

  protected opts: IPlayerOpts
  protected analytics: PlayerAnalytics
  protected instance
  protected segmentData

  private escapedError = 0

  constructor(opts: IPlayerOpts) {
    this.opts = opts
    this.analytics = new PlayerAnalytics({ getCurrentTime: this.getCurrentTime.bind(this), ... opts } as IPlayerAnalyticsOpts)
  }

  public async load() {
    throw new Error('not implemented')
  }

  public destroy() {
    this.analytics.playbackStopped()
    this.instance.destroy()

    this.analytics = null
    this.instance = null
  }

  public play() {
    this.instance && this.instance.play()
  }

  public pause() {
    this.instance && this.instance.pause()
  }

  public get playerId() {
    return this.opts.playerId
  }

  protected config() {
    return {
      key: config.playerKey,
      playback: {
        autoplay: !!this.opts.autoplay,
      },
    }
  }

  protected onStop() {
    this.analytics.playbackStopped()
  }

  protected onPlay() {
    this.analytics.playbackStarted()
  }

  protected async onError() {
    this.analytics.playbackStopped()

    if (this.escapedError > 5) return
    this.escapedError++

    const time = (this.segmentData && toInteger(this.segmentData.playbackTime + this.segmentData.duration + 1)) || 0
    const volume = this.instance.getVolume()
    const isMuted = this.instance.isMuted()

    console.log(
      '============================================================\n',
      `start playback at ${time} second(s) to skip corrupt segment \n`,
      '============================================================',
    )
    await this.instance.destroy()
    await this.load()
    this.instance.setVolume(volume)
    if (isMuted) this.instance.mute()

    this.instance.play()
    this.instance.seek(time)
  }

  protected canPlayHls(): boolean {
    return (platform.os.family === 'iOS') || (platform.name === 'Safari')
  }

  protected onSegmentPlayback(evt) {
    this.segmentData = evt
  }

  protected async buildDrmSource() {
    const {videoUrlObj, posterUrl} = this.opts

    const source = {
      poster: posterUrl,
    } as any

    if (videoUrlObj['dash']) source.dash = videoUrlObj['dash']
    if (videoUrlObj['hls']) source.hls = videoUrlObj['hls']

    // for CAS drm will look like base64 and start with 'BBB'
    if (videoUrlObj['drm'] && !startsWith(videoUrlObj['drm'], 'BBB')) {
      const drmRes = await request.get(videoUrlObj['drm'])
      const {auth, playready, fairplay, fairplay_cert, widevine} = drmRes.body
      const headers = this.buildDrmHeaders(auth)

      merge(source, {
        drm: {
          playready: { LA_URL: playready, customData: auth },
          widevine: { LA_URL: widevine, headers},
        },
      })

      if (!this.canPlayHls()) delete source.hls

      if (fairplay) {
        merge(source.drm, {
          fairplay: {
            headers,
            LA_URL: fairplay,
            certificateURL: fairplay_cert,
            prepareMessage: (event, session) => `spc=${event.messageBase64Encoded}&assetId=${session.contentId}`,
            prepareContentId: (contentId) => {
              if (contentId.indexOf('skd://') > -1)
                return contentId.split('skd://')[1].substr(0, 32)
              throw new Error('Invalid Content ID format. The format of the Content ID\
               must be the following: skd://xxx where xxx is the Key ID in hex format.')
            },
          },
        })
      }
    }

    return source
  }

  protected buildDrmHeaders(auth) {
    // this varies between versions, please add a concrete implementation
    throw new Error('not implemented')
  }

  private getCurrentTime() {
    return this.instance && this.instance.getCurrentTime() || 0
  }
}
