export interface SyncStateConfig<T> {
  channelPrefix: string
  debug?: boolean
  onChange: (value: T) => void
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