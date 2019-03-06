'use strict';
/*eslint no-process-env:0*/

// Development specific configuration
// ==================================
module.exports = {
  // Sequelize connection opions
  sequelize: {
    host: 'stage-sprint-12.cgeahs4ir05v.us-west-2.rds.amazonaws.com',
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

  // Seed database on startup
  seedDB: false,

  hostedDomain: 'spotlightar.com',

  UserPoolId: 'us-east-2_ISkf6tNmT',

  ClientId: 's8q19u6obsvhjb440evemc0cv',

  IdentityPoolId: 'us-east-2:086fb988-99db-4b86-993c-3e65ee123cb4',

  region: 'us-east-2',

  apiVersion: '2018-02-07',

  accessKeyId: "AKIAJDNQAMAMBND3PZCA",

  secretAccessKey: "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",

  logOptions: {
    isSupportGrayLog: false,
    grayLogOptions: {
      server: 'logs.27global.com',
      port: 12202,
      hostName: 'Spotlight QA Server',
      facility: 'Spotlight QA'
    }
  }
};
