import { BrowserWindow, ipcMain } from "electron";
import { SyncStateConfig, SyncWatchHandle } from "../types";
import { ref, watch, WatchHandle, type Ref } from "@vue/reactivity";
import {
  deepClone,
  generateMainChannelKeyMap,
  generateRendererChannelKeyMap,
} from "../utils";

const createRefSyncState = <T>(
  initState: T,
  config: SyncStateConfig<T>
): {
  state: Ref<T>;
  syncWatchHandle: SyncWatchHandle;
} => {
  const debug = config.debug === undefined ? false : !!config.debug;
  const state = ref(initState) as Ref<T>;
  const mainChannels = generateMainChannelKeyMap(config.channelPrefix);
  const rendererChannels = generateRendererChannelKeyMap(config.channelPrefix);

  // 渲染进程初始化
  ipcMain.on(mainChannels.GET, (event) => {
    event.reply(rendererChannels.SET, deepClone(state.value));
  });

  // 监听变化反应给渲染进程
  let sendChangeToRendererWatch: WatchHandle | undefined = undefined;
  const initSendChangeToRendererWatch = () => {
    sendChangeToRendererWatch = watch(
      () => state.value,
      (value) => {
        if (debug) {
          console.log("send change to renderer", JSON.stringify(value));
        }
        BrowserWindow.getAllWindows().forEach((window) => {
          window.webContents.send(rendererChannels.SET, deepClone(value));
        });
      },
      {
        deep: true,
      }
    );
  };
  initSendChangeToRendererWatch();

  // 从渲染进程来的值变动
  ipcMain.on(mainChannels.SET, (_event, value: T) => {
    if (debug) {
      console.log("change from renderer", JSON.stringify(value));
    }
    if (sendChangeToRendererWatch) {
      sendChangeToRendererWatch.stop();
      sendChangeToRendererWatch = undefined;
    }
    state.value = value;
    initSendChangeToRendererWatch();
  });

  // 监听变化反应抛出 change
  watch(() => state.value, (value) => {
    if (config.onChange) {
      config.onChange(deepClone(value))
    }
  }, { deep: true })

  return {
    state,
    syncWatchHandle: {
      pause: () => {
        sendChangeToRendererWatch?.pause();
      },
      resume: () => {
        sendChangeToRendererWatch?.resume();
      },
    },
  };
};

export { type SyncStateConfig, createRefSyncState };
