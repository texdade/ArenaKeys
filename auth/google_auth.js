let Passport = require('passport').Passport;
let passportGoogle = new Passport();
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const {OAuth2Client} = require('google-auth-library');
const {Strategy} = require('passport-http-bearer');

/**
 * Function to register google authentication workflow.
 *
 * @param {Object} app
 */
exports.auth = app => {
    app.use(passportGoogle.initialize());

    registerGoogleAuth(app);
    registerGoogleBearerAuth();
};

/**
 * A tiny helper to make an endpoint protected.
 */
exports.protect = () => {
    return passportGoogle.authenticate('bearer', {session: false});
};

// for further reference
// http://www.passportjs.org/docs/google/
// https://github.com/jaredhanson/passport-google-oauth2
const registerGoogleAuth = app => {
    passportGoogle.serializeUser((user, done) => {
        done(null, user);
    });
    passportGoogle.deserializeUser((user, done) => {
        done(null, user);
    });

    // we register the google strategy
    passportGoogle.use(
        new GoogleStrategy(
            {
                clientID: process.env.CLIENT_ID,
                clientSecret: process.env.CLIENT_SECRET,
                callbackURL: process.env.CALLBACK_URL
            },
            (token, refreshToken, profile, done) => {
                return done(null, {
                    profile,
                    token
                });
            }
        )
    );

    // This is the endpoint for authentication using google
    app.get(
        '/auth/google',
        passportGoogle.authenticate('google', {
            scope: ['https://www.googleapis.com/auth/userinfo.profile',
                    'https://www.googleapis.com/auth/userinfo.email']
        })
    );

    // Google after successful login call this endpoint. We return
    // the token that should be used to invoke the rest of the API.
    app.get(
        '/auth/google/callback',
        passportGoogle.authenticate('google', {
            failureRedirect: '/auth/google'
        }),
        function(req, res) {
            res.json({
                user: {
                    googleUserId: req.user.profile.id,
                    steamUserId: undefined,
                    name: req.user.profile.displayName,
                    email: req.user.profile.emails[0].value,
                    imageLink: req.user.profile.photos[0].value,
                    steamProfileUrl: undefined,
                    lists: []
                },
                token: req.user.token
            });
        }
    );
};

/**
 * Registers the a bearer token strategy that we will use to protect our API.
 */
const registerGoogleBearerAuth = () => {
    // docs
    //    https://github.com/googleapis/google-auth-library-nodejs#oauth2
    //    https://github.com/jaredhanson/passport-http-bearer
    //    https://github.com/passport/express-4.x-http-bearer-example
    //    https://developers.google.com/identity/sign-in/web/backend-auth
    passportGoogle.use(
        new Strategy(async (token, cb) => {
            try {
                const client = new OAuth2Client(
                    process.env.CLIENT_ID,
                    process.env.CLIENT_SECRET,
                    ''
                );
                const tokenInfo = await client.getTokenInfo(token);

                return cb(null, {googleUserId: tokenInfo.sub, email: tokenInfo.email});//just identifier infos are necessary

            } catch (error) {
                console.error(error);
                return cb(null, false);
            }
        })
    );
};
