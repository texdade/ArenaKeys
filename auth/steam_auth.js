let Passport = require('passport').Passport;
let passportSteam = new Passport();
const {Strategy} = require('passport-http-bearer');
const util = require('util');
const jwt = require('jsonwebtoken');
const SteamStrategy = require('passport-steam').Strategy;

//secret key to mount jwt over steam openID
const secretKeyForSteamAuthJWT = "DevisIsTheCodeMaster"; //I am very humble guy

/**
 * Function to register google authentication workflow.
 *
 * @param {Object} app
 */
exports.auth = app => {
    app.use(passportSteam.initialize());

    registerSteamAuth(app);
    registerSteamBearerAuth();
};

/**
 * A tiny helper to make an endpoint protected.
 */
exports.protect = () => {
    return passportSteam.authenticate('bearer', {session: false});
};

// for further reference
// http://www.passportjs.org/docs/steam
const registerSteamAuth = app => {
    passportSteam.serializeUser((user, done) => {
        done(null, user);
    });
    passportSteam.deserializeUser((user, done) => {
        done(null, user);
    });

    // we register the steam strategy
    // Use the SteamStrategy within Passport.
    //   Strategies in passport require a `validate` function, which accept
    //   credentials (in this case, an OpenID identifier and profile), and invoke a
    //   callback with a user object.
    passportSteam.use(new SteamStrategy({
            returnURL: 'http://localhost:3000/auth/steam/return',
            realm: 'http://localhost:3000/',
            apiKey: '64C32EE47A2E9D468A769A1567B6749C'
        },
        function(identifier, profile, done) {
            // asynchronous verification, for effect...
            process.nextTick(function () {

                // To keep the example simple, the user's Steam profile is returned to
                // represent the logged-in user.  In a typical application, you would want
                // to associate the Steam account with a user record in your database,
                // and return that user instead.
                profile.identifier = identifier;
                return done(null, profile);
            });
        }
    ));

    // GET /auth/steam
    //   Use passport.authenticate() as route middleware to authenticate the
    //   request.  The first step in Steam authentication will involve redirecting
    //   the user to steamcommunity.com.  After authenticating, Steam will redirect the
    //   user back to this application at /auth/steam/return
    app.get('/auth/steam',
        passportSteam.authenticate('steam', {session: false}));

    // GET /auth/steam/return
    //   Use passport.authenticate() as route middleware to authenticate the
    //   request.  If authentication fails, the user will be redirected back to the
    //   login page.  Otherwise, the primary route function function will be called,
    //   which, in this example, will redirect the user to the home page.
    app.get('/auth/steam/return',
        passportSteam.authenticate('steam', { failureRedirect: '/auth/steam' }),
        function(req, res) {
            const user = req.user;
            jwt.sign(
                { id: user.id },
                secretKeyForSteamAuthJWT, //NOTE for tex&Devis secret key you have to use below
                { expiresIn: '2h' },
                (err, token) => {
                    if (err) throw err;
                    res.json({
                        //decomment userFull in order to see all data returned from steam
                        //userFull: user,//TODO @texdade usa questo come oggetto di riferimento (questo rappresenta i dati completi... poi lo togliamo via e NON lo ritorniamo, per cui quando hai sistemato togli pure)
                        user: {
                            googleUserId: undefined,
                            steamUserId: user.id,
                            name: user.displayName,
                            email: undefined,
                            imageLink: user.photos[2].value, //TODO @texdade controlla se qui va bene il link dell'immagine (la vado a prendere da avatar???)
                            steamProfileUrl: user['_json'].profileurl,//TODO @texdade controlla se qui va bene il link al profilo, specie in rif a quello che mi spiegavi prima con le wishlist (devo prendere i dati da identifier)
                            lists: []
                        },
                        token,
                    });
                }
            );
        });
};

/**
 * Registers the a bearer token strategy that we will use to protect our API.
 */
const registerSteamBearerAuth = () => {
    // docs
    //    https://github.com/googleapis/google-auth-library-nodejs#oauth2
    //    https://github.com/jaredhanson/passport-http-bearer
    //    https://github.com/passport/express-4.x-http-bearer-example
    //    https://developers.google.com/identity/sign-in/web/backend-auth
    passportSteam.use(
        new Strategy(async (token, cb) => {
            try {

                const tokenInfo = await jwt.verify(token, secretKeyForSteamAuthJWT);

                return cb(null, {steamId: tokenInfo.id});

            } catch (error) {
                console.error(error);
                return cb(null, false);
            }
        })
    );
};
