import { BrowserWindow, ipcMain } from "electron";
import { SyncStateConfig, SyncWatchHandle } from "../types";
import { ref, toRaw, watch, WatchHandle, type Ref } from "@vue/reactivity";
import {
  generateMainChannelKeyMap,
  generateRendererChannelKeyMap,
} from "../utils";

const createRefSyncState = <T>(
  data: T,
  config: SyncStateConfig
): {
  result: Ref<T>;
  syncWatchHandle: SyncWatchHandle;
} => {
  const state = ref(data) as Ref<T>;
  const mainChannels = generateMainChannelKeyMap(config.channelPrefix);
  const rendererChannels = generateRendererChannelKeyMap(config.channelPrefix);

  let sendChangeToRendererWatch: WatchHandle | undefined = undefined;

  const initSendChangeToRendererWatch = () => {
    sendChangeToRendererWatch = watch(
      () => state.value,
      (value) => {
        BrowserWindow.getAllWindows().forEach((window) => {
          window.webContents.send(rendererChannels.SET, toRaw(value));
        });
      },
      {
        deep: true,
      }
    );
  };
  initSendChangeToRendererWatch();
  ipcMain.on(mainChannels.GET, (event) => {
    event.reply(rendererChannels.SET, toRaw(state.value));
  });

  // 从渲染进程来的值变动
  ipcMain.on(mainChannels.SET, (_event, value: T) => {
    if (sendChangeToRendererWatch) {
      sendChangeToRendererWatch.stop();
      sendChangeToRendererWatch = undefined;
    }
    state.value = value;
    initSendChangeToRendererWatch();
  });

  return {
    result: state,
    syncWatchHandle: {
      pause: () => {
        sendChangeToRendererWatch?.pause()
      },
      resume: () => {
        sendChangeToRendererWatch?.resume()
      }
    }
  };
};

export { type SyncStateConfig, createRefSyncState };
