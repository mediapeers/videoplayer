import {get} from 'lodash'
import config from './config'

export interface IPlayerAnalyticsOpts {
  videoId: number
  playerId: string
  getCurrentTime?: Function
  title?: string
  parentTitle?: string
}

export class PlayerAnalytics {
  private opts: IPlayerAnalyticsOpts

  private interval
  private acEvent
  private plays = 0
  private timePlayed = 0

  constructor(opts: IPlayerAnalyticsOpts) {
    this.opts = opts

    this.acEvent = {
      asset_id: this.opts.videoId,
      playback_id: this.opts.playerId,
      tt: this.opts.getCurrentTime(),
      domain: window.location.hostname,
      dt: 10,
      visit_id: config.visitId,
    }
  }

  public playbackStarted() {
    clearInterval(this.interval)

    const userId = get(window['Analytics'], 'userId')

    if (this.plays === 0) {
      this.plays += 1

      this.acEvent.tt = this.opts.getCurrentTime()

      config.chipmunk.action('ac.virtual/video_ping', 'ping', {
        body: this.acEvent,
      })

      if (config.googleAnalytics) {
        config.googleAnalytics('set', {
          dimension1: this.opts.title,
          dimension2: this.opts.parentTitle,
          dimension3: userId,
        })

        config.googleAnalytics('event', {
          category: 'video',
          action: 'play',
          label: this.opts.title,
          nonInteraction: true,
        })
      }
    }

    this.interval = setInterval(() => {

      this.timePlayed = this.timePlayed + 10
      this.acEvent.tt = this.opts.getCurrentTime()

      config.chipmunk.action('ac.virtual/video_ping', 'ping', {
        body: this.acEvent,
      })

      if (this.timePlayed % 60)
        return

      if (config.googleAnalytics) {
        config.googleAnalytics('set', {
          dimension1: this.opts.title,
          dimension2: this.opts.parentTitle,
          dimension3: userId,
          metric1: 60,
        })

        config.googleAnalytics('event', {
          category: 'video',
          action: 'playing',
          label: `${this.opts.parentTitle}: ${this.opts.title}`,
          value: 60,
          nonInteraction: true,
        })
      }
    }, 10000)
  }

  public playbackStopped() {
    clearInterval(this.interval)
  }
}
