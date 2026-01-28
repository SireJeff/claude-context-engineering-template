/**
 * Claude Context CLI - Main exports
 */

const { validate } = require('./validate');
const { sync } = require('./sync');
const { hooks } = require('./hooks');
const { diagnose } = require('./diagnose');
const { generate } = require('./generate');

module.exports = {
  validate,
  sync,
  hooks,
  diagnose,
  generate
};
