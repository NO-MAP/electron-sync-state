import { type IpcRenderer } from "@electron-toolkit/preload";
import { SyncStateConfig, SyncWatchHandle } from "../types";
import { reactive, toRaw, watch, type UnwrapRef, WatchHandle } from "vue";
import {
  generateMainChannelKeyMap,
  generateRendererChannelKeyMap,
} from "../utils";

interface Result<T> {
  loading: boolean;
  value: UnwrapRef<T>;
}

const useSyncState = <T>(
  config: SyncStateConfig,
  ipcRenderer: IpcRenderer
): {
  result: Result<T>;
  syncWatchHandle: SyncWatchHandle;
} => {
  const result = reactive<{
    loading: boolean;
    value: T;
  }>({
    loading: true,
    value: undefined as unknown as T,
  });
  const mainChannels = generateMainChannelKeyMap(config.channelPrefix);
  const rendererChannels = generateRendererChannelKeyMap(config.channelPrefix);

  let sendChangeToMainWatch: WatchHandle | undefined = undefined;
  const initSendChnageToMainWatch = () => {
    sendChangeToMainWatch = watch(
      () => result.value,
      (value) => {
        ipcRenderer.send(mainChannels.SET, toRaw(value));
      },
      {
        deep: true,
      }
    );
  };
  initSendChnageToMainWatch();
  ipcRenderer.on(rendererChannels.SET, async (_event, value: UnwrapRef<T>) => {
    if (sendChangeToMainWatch) {
      sendChangeToMainWatch.stop();
      sendChangeToMainWatch = undefined;
    }
    console.log("ipcRenderer.on", value);
    result.value = value;
    initSendChnageToMainWatch();
    result.loading = false;
  });

  ipcRenderer.send(mainChannels.GET);

  return {
    result,
    syncWatchHandle: {
      pause: () => {
        sendChangeToMainWatch?.pause()
      },
      resume: () => {
        sendChangeToMainWatch?.resume()
      }
    }
  };
};

export { type SyncStateConfig, useSyncState };
