import { defineConfig } from 'vite'
import { resolve } from 'path'
import dts from 'vite-plugin-dts'

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, '../src/main/index.ts'),
      name: 'ElectronMain',
      fileName: 'index',
      formats: ['es']
    },
    outDir: resolve(__dirname, '../dist/main'),
    rollupOptions:{
      external: ['@vue/reactivity', 'electron']
    }
  },
  plugins: [
    dts({
      rollupTypes: true,
      tsconfigPath: 'tsconfig.node.json'
    })
  ]
})