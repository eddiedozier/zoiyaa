import passport from 'passport';
import JwT from 'passport-jwt';
import Local from 'passport-local';
import GoogleStrategy from 'passport-google-oauth20';
import FacebookStrategy from 'passport-facebook';
import { ExtractJwt } from 'passport-jwt';
import GooglePlusTokenStrategy from 'passport-google-plus-token';
import FacebookTokenStrategy from 'passport-facebook-token';
import usersDb from '../dbconnection/userdb';
import routeHelpers from '../../helpers/routeHelpers';

// JWT Stragery
passport.use(new JwT.Strategy({
    jwtFromRequest: ExtractJwt.fromHeader('authorization'),
    secretOrKey: process.env.RAZZLE_JWT_SECRET
}, async (payload, done) => {

    try {

        usersDb.pool.getConnection(async (err, conn) => {
            if (err) throw err; // not connected!


            conn.query('CALL Get_Member_ById(?)', [payload.sub], async (error, results, fields) => { 
                if (error) throw error;

                // If Member Doesn't exsist, handle it
                if(!results[0][0]){
                    conn.release();
                    return done(null,false, { message: 'Invalid' });
                }

                conn.release();
                // Return User
                done(null, results[0][0]);

              if (error) throw error;
            });

        });
        
    } catch (error) {
        done(error, false)
    }
}));

// GOOGLE OAUTH STRATEGY
passport.use('google', new GoogleStrategy({
    clientID: process.env.RAZZLE_GOOGLE_CLIENT_ID,
    clientSecret: process.env.RAZZLE_GOOGLE_CLIENT_SECRET,
    callbackURL: '/api/members/google/redirect'
}, (accessToken, refreshToken, profile, done) => {
    done(null,accessToken)
}));

// GOOGLE OAUTH TOKEN STRATEGY
passport.use('googleToken', new GooglePlusTokenStrategy({
    clientID: process.env.RAZZLE_GOOGLE_CLIENT_ID,
    clientSecret: process.env.RAZZLE_GOOGLE_CLIENT_SECRET
}, async(accessToken, refreshToken, profile, done) => {
    const email = profile.emails[0].value;
    const firstName = profile.name.givenName;
    const lastName = profile.name.familyName;
    const stratgeyId = 2;

    try {

        usersDb.pool.getConnection(async (err, conn) => {
            if (err) throw err; // not connected!

            conn.query('CALL Get_Member_ByEmail(?)', [email], async (error, results, fields) => { 
                if (error) throw error;

                // If Member exsist, handle it
                if(results[0][0] && results[0][0].StrategyId === 2){
                    conn.release();
                    return done(null, results[0][0]);
                }

                // Check if user exist via another Strategy
                if(results[0][0] && results[0][0].StrategyId !== 2){
                    conn.release();
                    return done(null, false, { message: 'Account already exists!' });
                }

                // Create New Member Via Google
                conn.query('CALL Insert_User_Member_OAuth(?,?,?,?,@id);select @id', [email,firstName,lastName,stratgeyId], async (error, results, fields) => { 
                    conn.release();

                    const newUser = {
                        email,
                        firstName,
                        AccountId: parseInt(results[1][0]['@id'])
                    }
                    return done(null, newUser);
                    if (error) throw error;
                });
                
                 // Handle error after the release.
              if (error) throw error;
           
              // Don't use the connection here, it has been returned to the pool.
            });

        });
        
    } catch (error) {
        done(error, false)
    }

}));

// FACEBOOK OAUTH STRATEGY
passport.use('facebook', new FacebookStrategy({
    clientID: process.env.RAZZLE_FACEBOOK_CLIENT_ID,
    clientSecret: process.env.RAZZLE_FACEBOOK_CLIENT_SECRET,
    callbackURL: '/api/members/facebook/redirect',
    enableProof: true
}, (accessToken, refreshToken, profile, done) => {
    done(null,accessToken)
}));

// FACEBOOK TOKEN STRATEGY
passport.use('facebookToken', new FacebookTokenStrategy({
    clientID: process.env.RAZZLE_FACEBOOK_CLIENT_ID,
    clientSecret: process.env.RAZZLE_FACEBOOK_CLIENT_SECRET
}, async(accessToken, refreshToken, profile, done) => {
    const email = profile.emails[0].value;
    const firstName = profile.name.givenName;
    const lastName = profile.name.familyName;
    const stratgeyId = 3;
  
    try {

        usersDb.pool.getConnection(async (err, conn) => {
            if (err) throw err; // not connected!

            conn.query('CALL Get_Member_ByEmail(?)', [email], async (error, results, fields) => { 
                if (error) throw error;

                // If Member exsist, handle it
                if(results[0][0] && results[0][0].StrategyId === 3){
                    conn.release();
                    return done(null, results[0][0]);
                }

                // Check if user exist via another Strategy
                if(results[0][0] && results[0][0].StrategyId !== 3){
                    conn.release();
                    return done(null, false, { message: 'Account already exists!' });
                }

                // Create New Member Via Google
                conn.query('CALL Insert_User_Member_OAuth(?,?,?,?,@id);select @id', [email,firstName,lastName,stratgeyId], async (error, results, fields) => { 
                    conn.release();

                    const newUser = {
                        email,
                        firstName,
                        AccountId: parseInt(results[1][0]['@id'])
                    }
                    return done(null, newUser);
                    if (error) throw error;
                });
                
                 // Handle error after the release.
              if (error) throw error;
           
              // Don't use the connection here, it has been returned to the pool.
            });

        });
        
    } catch (error) {
        done(error, false)
    }

}));

// Local Strategy
passport.use(new Local.Strategy({
    usernameField: 'email'
}, async (email, password, done) => {

    try {

        usersDb.pool.getConnection(async (err, conn) => {
            if (err) throw err; // not connected!

            conn.query('CALL Get_Member_ByEmail(?)', [email], async (error, results, fields) => { 
                if (error) throw error;
                let confirmed = '';

                if(results[0][0]){
                    confirmed = JSON.parse(JSON.stringify(results[0][0].EmailConfirmed)).data[0];
                }
                
                // If Member Doesn't exsist, handle it
                if(!results[0][0]){
                    conn.release();
                    return done(null, false, { message: 'Invalid' });
                } 
                const hash = results[0][0].PasswordHash;
                const isValid = await routeHelpers.isValidPassword(password, hash)

                // If password is incorrect
                if(!isValid){
                    // Return User
                    conn.release();
                    return done(null, false, { message: 'Invalid' });
                } 

                // If account is NOT confirmed
                if(!confirmed){
                    // Return User
                    conn.release();
                    return done(null, false, { message: 'ConfirmEmail' });
                } 
                
                conn.release();
                done(null, results[0][0]);
                
                 // Handle error after the release.
              if (error) throw error;
           
              // Don't use the connection here, it has been returned to the pool.
            });

        });
        
    } catch (error) {
        done(error, false)
    }

}));

passport.serializeUser((user, done) => done(null, user.AccountId));
passport.deserializeUser((user, done) => done(null, user.AccountId));