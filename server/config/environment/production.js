'use strict';
/*eslint no-process-env:0*/

// Production specific configuration
// =================================
module.exports = {
  // Server IP
  sequelize: {
    host: 'spotlight-prod.cgeahs4ir05v.us-west-2.rds.amazonaws.com',
    port: 3306,
    database: 'SpotlightBrain',
    username: 'Dev27',
    password: 'Tw3ntys3v3n',
    options: {
      logging: false,
      define: {
        timestamps: false
      }
    }
  },

  userEmailList: [
    'ozreports@spotlightar.com',
  ],
  // Seed database on startup
  seedDB: false,

  hostedDomain: 'spotlightar.com',

  UserPoolId: 'us-east-2_9KPq1uD6N',

  ClientId: '5jpk6p6dn4o01fergbk5k3gr3q',

  IdentityPoolId: 'us-east-2:32d2a9da-f560-48db-bfd6-2d797264ae6e',

  region: 'us-east-2',

  apiVersion: '2018-02-07',

  accessKeyId: "AKIAJDNQAMAMBND3PZCA",

  secretAccessKey: "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",

  logOptions: {
    isSupportGrayLog: true,
    grayLogOptions: {
      server: 'logs.27global.com',
      port: 12202,
      hostName: 'Spotlight Server',
      facility: 'Spotlight'
    }
  }

};
