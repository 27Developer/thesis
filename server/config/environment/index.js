'use strict';
/*eslint no-process-env:0*/

import path from 'path';
import _ from 'lodash';

/*function requiredProcessEnv(name) {
 if(!process.env[name]) {
 throw new Error('You must set the ' + name + ' environment variable');
 }
 return process.env[name];
 }*/

// All configurations will extend these options
// ============================================
var all = {
  env: process.env.NODE_ENV,

  // Root path of server
  root: path.normalize(`${__dirname}/../../..`),

  // Browser-sync port
  browserSyncPort: process.env.BROWSER_SYNC_PORT || 3000,

  // Server port
  port: process.env.PORT || 9000,

  // Server IP
  ip: process.env.IP || '0.0.0.0',

  // Should we populate the DB with sample data?
  seedDB: false,

  // Secret for session, you will want to change this and make it an environment variable
  secrets: {
    session: 'spotlight-brain-secret'
  },

  // MongoDB connection options
  mongo: {
    options: {
      db: {
        safe: true
      }
    }
  },

  google: {
    clientID: process.env.GOOGLE_ID || '',
    clientSecret: process.env.GOOGLE_SECRET || '',
    callbackURL: `${process.env.DOMAIN || ''}/auth/google/callback`
  },

  hostedDomain: 'spotlightar.com',

  asanaAccessToken: '0/bb323414dc02817c76fca4d9ef1355d5',

  asanaWorkspaceId: '1299020221403',

  asanaTeamId: '2525769372878',

  asanaCustomFieldTopic: 261387216651030,

  asanaCustomFieldTopicGe: 256410568744794,

  emailService: 'gmail',

  emailServiceAccount: 'oz@spotlightar.com',

  emailServicePassword: 'spotlight',

  asanaUrlApi: 'https://app.asana.com/api/1.0',

  userEmailList: [
    'thanh.nguyen@tpssoft.com',
    'marc.kleinschmidt@27global.com'
  ],

  tasksFileName: 'dataTasks.json',

  errorsFileName: 'errors.txt',

  errorNullDateHasComments: 'Task with NULL Date and Comments - ',

  errorIncorrectSyntaxTaskNameField: 'Incorrect Task Name Syntax - ',

  errorAnalystNameMismatch: 'Analyst Name Mismatch - "AnalystName" does not exist on the Analysts table  (See Task Name "TaskName")',

  errorInteractionTypeMismatch: 'Interaction Type Mismatch - "InteractionType" does not exist on the Interaction Types table',

  spaceSizeLimit: 2048,

  noErrorMessage: 'No error founded!',

  passwordDefault: 'j22$@%^klhH12ili@Ki9eJA><r1bgv402f',

};

// Export the config object based on the NODE_ENV
// ==============================================
module.exports = _.merge(
  all,
  require('./shared'),
  require(`./${process.env.NODE_ENV}.js`) || {});
