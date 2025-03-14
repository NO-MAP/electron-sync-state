# Electron Sync State

`electron-sync-state` 是一个用于在 Electron 主进程和渲染进程之间自动同步状态的库。它利用了 Vue 的响应式系统，以及 Vue 3.5 版本提供的新 API，确保状态在进程间保持一致。该库适用于 Vue 以及 @vue/reactivity 3.5 及以上版本。

## 安装

使用 npm 或 yarn 安装：

```bash
npm install electron-sync-state
```

或

```bash
yarn add electron-sync-state
```

## 使用

### 主进程

在主进程中，使用 `createRefSyncState` 函数创建一个同步状态。

```typescript
import { createRefSyncState } from 'electron-sync-state/main';
import { Ref } from '@vue/reactivity';

interface AppState {
  count: number;
}

const { state, syncWatchHandle } = createRefSyncState<AppState>({ count: 0 }, {
  channelPrefix: 'app-state',
  debug: true,
  onChange: (newState) => {
    console.log('State changed:', newState);
  }
});

// 你可以通过 state.value 访问和修改状态
state.value.count += 1;

// 暂停同步
syncWatchHandle.pause();

// 恢复同步
syncWatchHandle.resume();
```

### 渲染进程

在渲染进程中，使用 `useSyncState` 钩子来获取和同步状态。

```typescript
import { useSyncState } from 'electron-sync-state/renderer';
import { IpcRenderer } from '@electron-toolkit/preload';

interface AppState {
  count: number;
}

const { result, syncWatchHandle } = useSyncState<AppState>({
  channelPrefix: 'app-state',
  debug: true,
  onChange: (newState) => {
    console.log('State changed:', newState);
  }
}, window.ipcRenderer as IpcRenderer);

// 访问状态
console.log(result.state.count);

// 暂停同步
syncWatchHandle.pause();

// 恢复同步
syncWatchHandle.resume();
```

## API

### `createRefSyncState<T>(initState: T, config: SyncStateConfig<T>)`

- `initState`: 初始状态。
- `config`: 配置对象，包含以下属性：
  - `channelPrefix`: 用于通信的通道前缀。
  - `debug`: 是否启用调试模式。
  - `onChange`: 状态变化时的回调函数。

返回一个包含 `state` 和 `syncWatchHandle` 的对象：
- `state`: 一个 Vue 的 `Ref` 对象，包含当前状态。
- `syncWatchHandle`: 包含 `pause` 和 `resume` 方法的对象，用于控制同步的暂停和恢复。

### `useSyncState<T>(config: SyncStateConfig<T>, ipcRenderer: IpcRenderer)`

- `config`: 配置对象，与 `createRefSyncState` 的 `config` 相同。
- `ipcRenderer`: Electron 的 `ipcRenderer` 实例。

返回一个包含 `result` 和 `syncWatchHandle` 的对象：
- `result`: 包含 `loading` 和 `state` 的对象。
  - `loading`: 是否正在加载状态。
  - `state`: 当前状态。
- `syncWatchHandle`: 包含 `pause` 和 `resume` 方法的对象，用于控制同步的暂停和恢复。

## 示例

你可以在 [GitHub 仓库](https://github.com/NO-MAP/electron-sync-state) 中找到完整的示例代码。

## 贡献

欢迎提交 Issue 和 PR。请在提交 PR 之前确保通过所有测试。

## 许可证

MIT