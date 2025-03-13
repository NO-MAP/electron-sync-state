import { SyncStateMainChannelKey, SyncStateRendererChannelKey } from "../types"

export function generateMainChannelKeyMap(prefix: string): Record<SyncStateMainChannelKey, string> {
  // 生成主进程监听的key
  return {
    [SyncStateMainChannelKey.GET]: `${prefix}-${SyncStateMainChannelKey.GET}`,
    [SyncStateMainChannelKey.SET]: `${prefix}-${SyncStateMainChannelKey.SET}`,
  }
}

// 渲染进程监听的key
export function generateRendererChannelKeyMap(prefix: string): Record<SyncStateRendererChannelKey, string> {
  // 生成渲染进程监听的key
  return {
    [SyncStateRendererChannelKey.SET]: `${prefix}-${SyncStateRendererChannelKey.SET}`,
  }
}