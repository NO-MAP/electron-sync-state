import { SyncStateConfig } from '../types'

const createSyncState = (data: object, config: SyncStateConfig): void => {
  console.log('createSyncState', data, config)
}

export { type SyncStateConfig, createSyncState }
