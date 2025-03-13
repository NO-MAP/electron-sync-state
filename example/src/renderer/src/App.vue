<script setup lang="ts">
import Versions from './components/Versions.vue'
import { useSyncState } from '../../../../dist/renderer'

const ipcHandle = (): void => window.electron.ipcRenderer.send('ping')

const state = useSyncState<{
  count: number,
  nested: {
    count: number
  }
}>(
  {
    channelPrefix: 'sync-state'
  },
  window.electron.ipcRenderer
)

console.log('state', state)
const addHandle = (): void => {
  state.data.count++
  state.data.nested.count++
}
</script>

<template>
  <img alt="logo" class="logo" src="./assets/electron.svg" />
  <div class="creator">Powered by electron-vite</div>
  <div class="text">
    Build an Electron app with
    <span class="vue">Vue</span>
    and
    <span class="ts">TypeScript</span>
  </div>
  <p class="tip">Please try pressing <code>F12</code> to open the devTool</p>
  <div class="actions">
    <div class="action">
      <a href="https://electron-vite.org/" target="_blank" rel="noreferrer">Documentation</a>
    </div>
    <div class="action">
      <a target="_blank" rel="noreferrer" @click="ipcHandle">Send IPC</a>
    </div>
    <div>
      {{ state }}
    </div>
  </div>
  <button @click="() => addHandle()">ADD</button>
  <Versions />
</template>
