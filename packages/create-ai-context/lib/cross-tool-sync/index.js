/**
 * Cross-Tool Sync Module
 *
 * Exports all synchronization functionality for automatic cross-tool
 * context synchronization.
 */

const SyncManager = require('./sync-manager');
const { FileWatcher, createToolContextWatcher } = require('./file-watcher');
const { SyncService, createSyncService, DEFAULT_CONFIG } = require('./sync-service');

module.exports = {
  // Sync Manager - Core sync logic
  ...SyncManager,

  // File Watcher - Change detection
  FileWatcher,
  createToolContextWatcher,

  // Sync Service - Background service
  SyncService,
  createSyncService,
  DEFAULT_CONFIG
};

// Also export individual functions for named imports
module.exports.detectChangedTool = SyncManager.detectChangedTool;
module.exports.propagateContextChange = SyncManager.propagateContextChange;
module.exports.checkSyncStatus = SyncManager.checkSyncStatus;
module.exports.syncAllFromCodebase = SyncManager.syncAllFromCodebase;
module.exports.resolveConflict = SyncManager.resolveConflict;
module.exports.getSyncHistory = SyncManager.getSyncHistory;
module.exports.initSyncState = SyncManager.initSyncState;
module.exports.loadSyncState = SyncManager.loadSyncState;
module.exports.saveSyncState = SyncManager.saveSyncState;
module.exports.calculateFileHash = SyncManager.calculateFileHash;
module.exports.getToolContextFiles = SyncManager.getToolContextFiles;
module.exports.formatSyncStatus = SyncManager.formatSyncStatus;
module.exports.CONFLICT_STRATEGY = SyncManager.CONFLICT_STRATEGY;
module.exports.TOOL_CONTEXT_FILES = SyncManager.TOOL_CONTEXT_FILES;
