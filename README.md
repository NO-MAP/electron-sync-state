# electron-sync-state

`electron-sync-state` 是一个用于在 Electron 应用中自动同步主进程和渲染进程之间状态的库。它提供了一种简单的方式来管理和共享状态，确保主进程和渲染进程之间的数据始终保持一致。

## 安装

你可以通过 npm 或 yarn 来安装 `electron-sync-state`：

```bash
npm install electron-sync-state
```

或者

```bash
yarn add electron-sync-state
```

## 使用

### 主进程

在主进程中，你可以使用 `createRefSyncState` 函数来创建一个状态对象。这个状态对象会自动同步到所有渲染进程中。

```javascript
const { createRefSyncState } = require('electron-sync-state');

const state = createRefSyncState(
  {
    count: 0,
    nested: {
      count: 0
    }
  },
  { channelPrefix: 'sync-state' }
);

// 你可以通过 state.value 来访问和修改状态
state.value.count = 1;
state.value.nested.count = 2;
```

### 渲染进程

在渲染进程中，你可以使用 `useSyncState` 钩子来获取和监听主进程中的状态。

```javascript
import { useSyncState } from 'electron-sync-state';

const state = useSyncState<{
  count: number;
  nested: {
    count: number;
  };
}>(
  {
    channelPrefix: 'sync-state'
  },
  window.electron.ipcRenderer
);

// 你可以通过 state.value 来访问和修改状态
state.value.count = 1;
state.value.nested.count = 2;

```

## API

### `createRefSyncState(initialState, options)`

- `initialState`: 初始状态对象。
- `options`: 配置选项。
  - `channelPrefix`: 用于通信的通道前缀。

返回一个包含 `value` 属性的对象，`value` 属性指向当前的状态对象。

### `useSyncState<T>(options, ipcRenderer)`

- `options`: 配置选项。
  - `channelPrefix`: 用于通信的通道前缀。
- `ipcRenderer`: Electron 的 `ipcRenderer` 对象。

返回一个包含 `value` 属性和 `onChange` 方法的对象。

- `value`: 当前的状态对象。

## 示例

你可以在 [examples](https://github.com/NO-MAP/electron-sync-state/tree/main/example) 目录中找到完整的示例代码。