/**
 * IMPORTANT  IMPORTANT  IMPORTANT  IMPORTANT  IMPORTANT  IMPORTANT  IMPORTANT
 *
 * You should never commit this file to a public repository on GitHub!
 * All public code on GitHub can be searched, that means anyone can see your
 * uploaded secrets.js file.
 *
 * I did it for your convenience using "throw away" API keys and passwords so
 * that all features could work out of the box.
 *
 * Use config vars (environment variables) below for production API keys
 * and passwords. Each PaaS (e.g. Heroku, Nodejitsu, OpenShift, Azure) has a way
 * for you to set it up from the dashboard.
 *
 * Another added benefit of this approach is that you can use two different
 * sets of keys for local development and production mode without making any
 * changes to the code.
 * IMPORTANT  IMPORTANT  IMPORTANT  IMPORTANT  IMPORTANT  IMPORTANT  IMPORTANT
 */
 
var whitelist = ['http://localhost:8080'];

module.exports = {

    db: process.env.MONGODB || 'mongodb://localhost:27017/pigeon',

    sessionSecret: process.env.SESSION_SECRET || 'pigeon_ftw',

    redisDb: {host: 'redis://127.0.0.1/1'},

    corsOptions: {
        credentials: true,
        origin: function (origin, callback) {
            var originIsWhitelisted = whitelist.indexOf(origin) !== -1;
            callback(null, originIsWhitelisted);
        }
    },


    facebook: {
        clientID: process.env.FACEBOOK_ID || 'YOURID',
        clientSecret: process.env.FACEBOOK_SECRET || 'YOURSECRET',
        callbackURL: '/auth/facebook/callback',
        passReqToCallback: true
    },

    github: {
        clientID: process.env.GITHUB_ID || 'YOURID',
        clientSecret: process.env.GITHUB_SECRET || 'YOURSECRET',
        callbackURL: '/auth/github/callback',
        passReqToCallback: true
    },

    twitter: {
        consumerKey: process.env.TWITTER_KEY || 'YOURID',
        consumerSecret: process.env.TWITTER_SECRET || 'YOURSECRET',
        callbackURL: '/auth/twitter/callback',
        passReqToCallback: true
    },

    google: {
        clientID: process.env.GOOGLE_ID || 'YOURID',
        clientSecret: process.env.GOOGLE_SECRET || 'YOURSECRET',
        callbackURL: '/auth/google/callback',
        passReqToCallback: true
    }

};