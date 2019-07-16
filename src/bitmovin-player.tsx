/**
 * The Video Player component.
 */
import React from 'react'
import cx from 'classnames'
import platform from 'platform'
import nanoid from 'nanoid'
import {startsWith, get} from 'lodash'

import {Player} from './player'
import {PlayerV8} from './player-v8'
import {getVideoUrl, getSubtitles} from './api'
import './bitmovin-player.scss'

declare var USE_SUBTITLES

export interface IBitmovinPlayerProps {
  video: any
  className?: string
  videoTitle?: string | null
  videoParentTitle?: string | null
  productId?: number | null // TODO: remove
  controlRef?: (player: Player) => {}
  autoplay?: boolean
  posterUrl?: string
  render?: Function // TODO: remove in favour of children
}

export const hasPropChanged = (prevProps, nextProps, propPath): boolean => {
  const prevValue = get(prevProps, propPath)
  const nextValue = get(nextProps, propPath)
  return (
    (prevValue && !nextValue) ||
    (!prevValue && nextValue) ||
    (prevValue !== nextValue)
  )
}

export default class extends React.PureComponent<IBitmovinPlayerProps, any> {
  public static defaultProps: IBitmovinPlayerProps | {} = {
    autoplay: false,
  }

  public state = {
    error: null,
  }

  private playerId
  private player: Player

  constructor(props) {
    super(props)
    this.playerId = nanoid()
  }

  public componentDidMount() {
    this.initialize()
  }

  public componentWillUnmount() {
    this.player && this.player.destroy()
  }

  public componentDidUpdate(prev) {
    if (hasPropChanged(prev, this.props, 'video.id')) this.initialize()
  }

  public render() {
    return (
      <div className={cx('bitmovin-player', this.props.className)}>
      {
        this.state.error
        ? <div className="player-error">{this.state.error}</div>
        : <div id={this.playerId}>{typeof this.props.render === "function" && this.props.render()}</div>
      }
      </div>
    )
  }

  private async initialize() {
    // we do not support IE if it's not on windows 10
    if (platform.name === 'IE' && startsWith(platform.os.family, 'Windows') && platform.os.version !== '10') {
      this.setState({
        error: 'Video playback is not supported using the Internet Explorer browser on your operating system. Please switch to the latest Chrome browser for optimal results.',
      })
      return
    }

    if (this.player) this.player.destroy()

    const videoId = get(this.props, 'video.id')
    if (!videoId) return

    let videoUrlObj = null
    let subtitles = []

    try {
      videoUrlObj = await getVideoUrl(videoId)

      if (typeof USE_SUBTITLES !== 'undefined' && USE_SUBTITLES){
        subtitles = await getSubtitles(videoId)
      }
    }
    catch (err) {
      this.setState({
        error: 'An error occured while initializing the video player. Please try again.',
      })
      return
    }

    // let impl
    // if (platform.name === 'IE' || platform.name === 'Microsoft Edge') {
    //   impl = PlayerV7
    // }
    // else {
    const impl = PlayerV8 // default
    // }

    this.player = new impl({
      videoId,
      subtitles,
      videoUrlObj,
      playerId: this.playerId,
      ... this.props
    })
    if (this.props.controlRef) this.props.controlRef(this.player)
    this.player.load()
  }
}
