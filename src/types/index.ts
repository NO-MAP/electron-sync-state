export interface SyncStateConfig {
  channelPrefix: string
  debug?: boolean
}

// 主进程监听的key
export enum SyncStateMainChannelKey {
  GET = 'GET',
  SET = 'SET',
}

// 渲染进程监听的key
export enum SyncStateRendererChannelKey {
  SET = 'SET',
}

export interface SyncWatchHandle {
  pause: () => void;
  resume: () => void;
}