import { SyncStateConfig } from '../types'

const useSyncState = (config: SyncStateConfig): void => {
  console.log('useSyncState', config)
}

export { type SyncStateConfig, useSyncState }
