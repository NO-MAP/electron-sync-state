import { type IpcRenderer } from '@electron-toolkit/preload'
import { SyncStateConfig } from '../types'
import { reactive, toRaw, watch, type UnwrapRef, WatchHandle } from 'vue'
import { generateMainChannelKeyMap, generateRendererChannelKeyMap } from '../utils';

const useSyncState = <T>(config: SyncStateConfig, ipcRenderer: IpcRenderer): {
  loading: boolean;
  data: UnwrapRef<T>;
} => {
  const result = reactive<{
    loading: boolean,
    data: T
  }>({
    loading: true,
    data: undefined as unknown as T
  })
  const mainChannels = generateMainChannelKeyMap(config.channelPrefix);
  const rendererChannels = generateRendererChannelKeyMap(config.channelPrefix);

  let sendChangeToMainWatch: WatchHandle | undefined = undefined
  const initSendChnageToMainWatch = () => {
    sendChangeToMainWatch = watch(() => result.data, (value) => {
      ipcRenderer.send(mainChannels.SET, toRaw(value))
    }, {
      deep: true
    })
  }
  initSendChnageToMainWatch()
  ipcRenderer.on(rendererChannels.SET, async (_event, value: UnwrapRef<T>) => {
    if (sendChangeToMainWatch) {
      sendChangeToMainWatch.stop()
      sendChangeToMainWatch = undefined
    }
    console.log('ipcRenderer.on', value)
    result.data = value
    initSendChnageToMainWatch()
    result.loading = false
  })

  ipcRenderer.send(mainChannels.GET)

  return result
}

export { type SyncStateConfig, useSyncState }
