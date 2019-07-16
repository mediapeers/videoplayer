import moment from 'moment'
import platform from 'platform'
import CryptoJS from 'crypto-js'
import {map, get, isEmpty} from 'lodash'
import config from './config'

export const getVideoUrl = async (videoId: number) => {
  const timestamp = moment().utc().format('YYYYMMDDhhmmss')
  let params = { timestamp, video_url_id: videoId } as any

  if (platform.os.family === 'iOS' || platform.name === 'Safari' || platform.name === 'Firefox') {
    // fallback to CAS DRM
    const mode = '3'
    const secret = config.videoUrlSecret
    const token = CryptoJS.HmacSHA256(`${videoId}/${timestamp}/${mode}`, secret).toString()
    params = { video_url_id: videoId, timestamp, mode, token }
  }
  return (await config.chipmunk.action('am.asset/video_url', 'get', {
    params,
  })).object
}

export const getSubtitles = async (videoId: number): Promise<any[]> => {
  const result = (await config.chipmunk.action('am.asset/subtitle', 'query', {
    params: { asset_ids: videoId },
    schema: `id, asset_id, language_id, purpose, label, file_attachment, language {name}`,
  }))

  return map(result.objects, (subtitle, index) => {
    const lang = get(subtitle, 'language.name', 'Unknown')
    let label

    if (!isEmpty(subtitle.label)){
      label = subtitle.label
    }
    else {
      label = subtitle.purpose === 'caption' ? `Closed Caption - ${lang}` : `Subtitle - ${lang}`
    }

    return {
      enabled: false, // index === 0 would enable the first subtitle
      label,
      lang,
      id: subtitle.id,
      kind: subtitle.purpose,
      url: subtitle.file_attachment,
    }
  })
}
