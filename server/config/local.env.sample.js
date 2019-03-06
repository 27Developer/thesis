'use strict';

// Use local.env.js for environment variables that will be set when the server starts locally.
// Use for your api keys, secrets, etc. This file should not be tracked by git.
//
// You will need to set these on the server you deploy to.

module.exports = {
    DOMAIN: 'http://oz.spotlightar.com',
    SESSION_SECRET: 'SpotlightOz',

    GOOGLE_ID: '669671909044-u2da90tecmdvcfjhk8eerb0micdaug33.apps.googleusercontent.com',
    GOOGLE_SECRET: 'yv90_ryjbv6dhMs-1duBoP1E',

    // Control debug level for modules using visionmedia/debug
    DEBUG: ''
};
