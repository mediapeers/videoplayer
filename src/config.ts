import {IChipmunk} from 'chipmunk'
import {get} from 'lodash'

interface PlayerConfig {
  playerKey: string
  videoUrlSecret: string
  chipmunk(): IChipmunk
  visitId(): string
  googleAnalytics?(action: string, ...args): any
}

class Config {
  private config: PlayerConfig

  public configure(conf: PlayerConfig) {
    this.config = conf
  }
  public get chipmunk(): IChipmunk | null {
    return this.config && this.config.chipmunk()
  }
  public get visitId(): string | null {
    return this.config && this.config.visitId()
  }
  public get googleAnalytics() {
    return get(this, 'config.googleAnalytics')
  }
  public get playerKey() {
    return get(this, 'config.playerKey')
  }
  public get videoUrlSecret() {
    return get(this, 'config.videoUrlSecret')
  }
}

const instance = new Config()
export = instance
