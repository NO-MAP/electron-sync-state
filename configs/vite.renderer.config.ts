import { defineConfig } from 'vite'
import { resolve } from 'path'
import dts from 'vite-plugin-dts'

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, '../src/renderer/index.ts'),
      name: 'ElectronRenderer',
      fileName: 'index.js',
      formats: ['es']
    },
    outDir: resolve(__dirname, '../dist/renderer'),
  },
  plugins: [
    dts({
      rollupTypes: true,
      tsconfigPath: 'tsconfig.web.json'
    })
  ]
})