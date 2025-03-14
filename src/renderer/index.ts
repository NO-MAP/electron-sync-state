import { type IpcRenderer } from "@electron-toolkit/preload";
import { SyncStateConfig, SyncWatchHandle } from "../types";
import { reactive, toRaw, watch, type UnwrapRef, WatchHandle } from "vue";
import {
  generateMainChannelKeyMap,
  generateRendererChannelKeyMap,
} from "../utils";

interface WrapperState<T> {
  loading: boolean;
  state: UnwrapRef<T>;
}

const useSyncState = <T>(
  config: SyncStateConfig<T>,
  ipcRenderer: IpcRenderer
): {
  wrapperState: WrapperState<T>;
  syncWatchHandle: SyncWatchHandle;
} => {
  const debug = config.debug === undefined ? false : true;
  const wrapperState = reactive<{
    loading: boolean;
    state: T;
  }>({
    loading: true,
    state: undefined as unknown as T,
  });
  const mainChannels = generateMainChannelKeyMap(config.channelPrefix);
  const rendererChannels = generateRendererChannelKeyMap(config.channelPrefix);

  let sendChangeToMainWatch: WatchHandle | undefined = undefined;
  const initSendChangeToMainWatch = () => {
    sendChangeToMainWatch = watch(
      () => wrapperState.state,
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
    wrapperState.state = value;
    initSendChangeToMainWatch();
    wrapperState.loading = false;
  });

  ipcRenderer.send(mainChannels.GET);

  return {
    wrapperState,
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
