/**
 * Spinner utilities for create-universal-ai-context
 *
 * Provides consistent progress indicators using ora
 */

const ora = require('ora');
const chalk = require('chalk');

/**
 * Create a spinner instance with consistent styling
 */
function createSpinner(text = '') {
  return ora({
    text,
    color: 'cyan',
    spinner: 'dots'
  });
}

/**
 * Run a task with spinner feedback
 * @param {string} text - Text to display while running
 * @param {Function} task - Async function to run
 * @returns {Promise<any>} - Result of the task
 */
async function withSpinner(text, task) {
  const spinner = createSpinner(text);
  spinner.start();

  try {
    const result = await task();
    spinner.succeed();
    return result;
  } catch (error) {
    spinner.fail(chalk.red(error.message));
    throw error;
  }
}

/**
 * Display a progress list
 * @param {Array<{text: string, task: Function}>} items - List of tasks
 */
async function progressList(items) {
  const results = [];

  for (const item of items) {
    const result = await withSpinner(item.text, item.task);
    results.push(result);
  }

  return results;
}

module.exports = {
  createSpinner,
  withSpinner,
  progressList
};
