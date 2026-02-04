/**
 * Watcher Module Exports
 * 
 * File watching and auto-sync functionality.
 */

export { FileWatcher, type FileChangeEvent, type WatcherConfig } from './file-watcher.js';
export { SyncService, createSyncService, type SyncServiceConfig, type SyncResult } from './sync-service.js';
