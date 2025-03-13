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
  const debug = config.debug === undefined ? false : true;
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
  const initSendChangeToMainWatch = () => {
    sendChangeToMainWatch = watch(
      () => result.value,
      (value) => {
        if (debug) {
          console.log("send change to main", value);
        }
        ipcRenderer.send(mainChannels.SET, toRaw(value));
      },
      {
        deep: true,
      }
    );
  };
  initSendChangeToMainWatch();
  ipcRenderer.on(rendererChannels.SET, async (_event, value: UnwrapRef<T>) => {
    if (debug) {
      console.log("change from main", value);
    }
    if (sendChangeToMainWatch) {
      sendChangeToMainWatch.stop();
      sendChangeToMainWatch = undefined;
    }
    console.log("ipcRenderer.on", value);
    result.value = value;
    initSendChangeToMainWatch();
    result.loading = false;
  });

  ipcRenderer.send(mainChannels.GET);

  return {
    result,
    syncWatchHandle: {
      pause: () => {
        sendChangeToMainWatch?.pause();
      },
      resume: () => {
        sendChangeToMainWatch?.resume();
      },
    },
  };
};

export { type SyncStateConfig, useSyncState };
