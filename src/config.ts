import {IChipmunk} from 'chipmunk'

interface PlayerConfig {
  chipmunk(): IChipmunk
  visitId(): string
  playerKey: string
  videoUrlSecret: string
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
    return this.config && this.config.googleAnalytics
  }
  public get playerKey() {
    return this.config && this.config.playerKey
  }
  public get videoUrlSecret() {
    return this.config && this.config.videoUrlSecret
  }
}

const instance = new Config()
export = instance
