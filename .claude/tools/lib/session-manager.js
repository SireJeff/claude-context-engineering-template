/**
 * Session Manager - Handles session state persistence and resumption
 *
 * Enables self-sustaining session tracking across Claude Code sessions.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { logger } = require('./logger');

const SESSION_DIR = path.join(__dirname, '..', '..', 'session');
const CURRENT_STATE_PATH = path.join(SESSION_DIR, 'current', 'state.json');
const HISTORY_DIR = path.join(SESSION_DIR, 'history');
const CHECKPOINTS_DIR = path.join(SESSION_DIR, 'checkpoints');

/**
 * Generate a unique session ID
 */
function generateSessionId() {
  return crypto.randomUUID();
}

/**
 * Get current timestamp in ISO format
 */
function now() {
  return new Date().toISOString();
}

/**
 * Load current session state
 */
function loadSession() {
  try {
    if (fs.existsSync(CURRENT_STATE_PATH)) {
      const content = fs.readFileSync(CURRENT_STATE_PATH, 'utf-8');
      return JSON.parse(content);
    }
  } catch (error) {
    logger.warn('Failed to load session state:', error.message);
  }
  return null;
}

/**
 * Save current session state
 */
function saveSession(state) {
  try {
    // Ensure directory exists
    const dir = path.dirname(CURRENT_STATE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Update last activity
    state.lastActivity = now();

    fs.writeFileSync(CURRENT_STATE_PATH, JSON.stringify(state, null, 2));
    logger.info('Session state saved');
    return true;
  } catch (error) {
    logger.error('Failed to save session state:', error.message);
    return false;
  }
}

/**
 * Start a new session
 */
function startSession(taskName = null, taskDescription = null) {
  const session = {
    sessionId: generateSessionId(),
    started: now(),
    lastActivity: now(),
    phase: 'idle',
    task: {
      name: taskName,
      description: taskDescription,
      artifacts: []
    },
    context: {
      tokensUsed: 0,
      filesLoaded: [],
      workflowsActive: []
    },
    pendingUpdates: [],
    checkpoints: []
  };

  saveSession(session);
  logger.info(`New session started: ${session.sessionId}`);
  return session;
}

/**
 * Update session phase
 */
function updatePhase(phase) {
  const session = loadSession();
  if (!session) {
    logger.warn('No active session to update');
    return null;
  }

  const validPhases = ['idle', 'research', 'plan', 'implement'];
  if (!validPhases.includes(phase)) {
    logger.error(`Invalid phase: ${phase}`);
    return null;
  }

  session.phase = phase;
  saveSession(session);
  return session;
}

/**
 * Add file to loaded files list
 */
function trackFileLoad(filePath) {
  const session = loadSession();
  if (!session) return;

  if (!session.context.filesLoaded.includes(filePath)) {
    session.context.filesLoaded.push(filePath);
    saveSession(session);
  }
}

/**
 * Add artifact to current task
 */
function addArtifact(artifactPath) {
  const session = loadSession();
  if (!session) return;

  if (!session.task.artifacts.includes(artifactPath)) {
    session.task.artifacts.push(artifactPath);
    saveSession(session);
  }
}

/**
 * Add pending documentation update
 */
function addPendingUpdate(workflowPath, reason) {
  const session = loadSession();
  if (!session) return;

  session.pendingUpdates.push({
    workflow: workflowPath,
    reason: reason,
    addedAt: now()
  });
  saveSession(session);
}

/**
 * Create a checkpoint for resumption
 */
function createCheckpoint(description) {
  const session = loadSession();
  if (!session) return null;

  const checkpoint = {
    id: crypto.randomUUID(),
    timestamp: now(),
    description: description,
    phase: session.phase,
    filesLoaded: [...session.context.filesLoaded],
    pendingUpdates: [...session.pendingUpdates]
  };

  session.checkpoints.push(checkpoint);
  saveSession(session);

  // Also save to checkpoints directory
  const checkpointPath = path.join(CHECKPOINTS_DIR, `${checkpoint.id}.json`);
  if (!fs.existsSync(CHECKPOINTS_DIR)) {
    fs.mkdirSync(CHECKPOINTS_DIR, { recursive: true });
  }
  fs.writeFileSync(checkpointPath, JSON.stringify(checkpoint, null, 2));

  logger.info(`Checkpoint created: ${checkpoint.id}`);
  return checkpoint;
}

/**
 * Archive current session to history
 */
function archiveSession() {
  const session = loadSession();
  if (!session || !session.sessionId) {
    logger.warn('No active session to archive');
    return false;
  }

  try {
    // Create history directory for today
    const today = new Date().toISOString().split('T')[0];
    const todayDir = path.join(HISTORY_DIR, today);
    if (!fs.existsSync(todayDir)) {
      fs.mkdirSync(todayDir, { recursive: true });
    }

    // Save to history
    const historyPath = path.join(todayDir, `${session.sessionId}.json`);
    fs.writeFileSync(historyPath, JSON.stringify(session, null, 2));

    // Clear current state
    const emptyState = {
      sessionId: null,
      started: null,
      lastActivity: null,
      phase: 'idle',
      task: { name: null, description: null, artifacts: [] },
      context: { tokensUsed: 0, filesLoaded: [], workflowsActive: [] },
      pendingUpdates: [],
      checkpoints: []
    };
    fs.writeFileSync(CURRENT_STATE_PATH, JSON.stringify(emptyState, null, 2));

    logger.info(`Session archived: ${session.sessionId}`);
    return true;
  } catch (error) {
    logger.error('Failed to archive session:', error.message);
    return false;
  }
}

/**
 * List available sessions from history
 */
function listSessions(limit = 10) {
  const sessions = [];

  try {
    if (!fs.existsSync(HISTORY_DIR)) {
      return sessions;
    }

    // Get all date directories
    const dateDirs = fs.readdirSync(HISTORY_DIR)
      .filter(d => /^\d{4}-\d{2}-\d{2}$/.test(d))
      .sort()
      .reverse();

    for (const dateDir of dateDirs) {
      if (sessions.length >= limit) break;

      const dirPath = path.join(HISTORY_DIR, dateDir);
      const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.json'));

      for (const file of files) {
        if (sessions.length >= limit) break;

        try {
          const content = fs.readFileSync(path.join(dirPath, file), 'utf-8');
          const session = JSON.parse(content);
          sessions.push({
            sessionId: session.sessionId,
            date: dateDir,
            started: session.started,
            phase: session.phase,
            taskName: session.task?.name
          });
        } catch (e) {
          // Skip invalid files
        }
      }
    }
  } catch (error) {
    logger.error('Failed to list sessions:', error.message);
  }

  return sessions;
}

/**
 * Resume a session from history
 */
function resumeSession(sessionId) {
  try {
    // Search in history
    if (!fs.existsSync(HISTORY_DIR)) {
      logger.error('No session history found');
      return null;
    }

    const dateDirs = fs.readdirSync(HISTORY_DIR)
      .filter(d => /^\d{4}-\d{2}-\d{2}$/.test(d));

    for (const dateDir of dateDirs) {
      const filePath = path.join(HISTORY_DIR, dateDir, `${sessionId}.json`);
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf-8');
        const session = JSON.parse(content);

        // Update timestamps
        session.lastActivity = now();

        // Save as current
        saveSession(session);
        logger.info(`Session resumed: ${sessionId}`);
        return session;
      }
    }

    logger.error(`Session not found: ${sessionId}`);
    return null;
  } catch (error) {
    logger.error('Failed to resume session:', error.message);
    return null;
  }
}

/**
 * Get session summary for display
 */
function getSessionSummary() {
  const session = loadSession();
  if (!session || !session.sessionId) {
    return null;
  }

  return {
    sessionId: session.sessionId,
    started: session.started,
    duration: session.started
      ? Math.round((Date.now() - new Date(session.started).getTime()) / 60000)
      : 0,
    phase: session.phase,
    task: session.task?.name || '(none)',
    filesLoaded: session.context.filesLoaded.length,
    pendingUpdates: session.pendingUpdates.length,
    checkpoints: session.checkpoints.length
  };
}

module.exports = {
  loadSession,
  saveSession,
  startSession,
  updatePhase,
  trackFileLoad,
  addArtifact,
  addPendingUpdate,
  createCheckpoint,
  archiveSession,
  listSessions,
  resumeSession,
  getSessionSummary
};
