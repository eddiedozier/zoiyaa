// IMPORT BOTH EMAIL TEMPLATES
// INSTALL PACKAGE THAT ALLOWS YOU TO SEND EMAILS WITH PICTURES 

import express from 'express';
import passport from 'passport';
import MembersController from '../controllers/members.controller'
import routeHelpers from '../../helpers/routeHelpers';
import '../auth/passport';

const validateSignup = routeHelpers.validateBody(routeHelpers.schemas.signUpSchema);
const validateLogin = routeHelpers.validateBody(routeHelpers.schemas.loginSchema);
const validateEmail = routeHelpers.validateBody(routeHelpers.schemas.checkEmailSchema);
const validateRecoverPassword = routeHelpers.validateBody(routeHelpers.schemas.recoverPasswordSchema);
const validateUpdatePassword = routeHelpers.validateBody(routeHelpers.schemas.updatePasswordSchema);
const validateUpdateProfile = routeHelpers.validateBody(routeHelpers.schemas.updateProfileSchema);
const validateId = routeHelpers.validateBody(routeHelpers.schemas.getMemberSchema);
const validateVerifyEmail = routeHelpers.validateBody(routeHelpers.schemas.verifyEmailSchema);
const validateRecaptcha = routeHelpers.validateRecaptcha();

const passportLocal = passport.authenticate('local', { session: false, failureFlash: true, failureRedirect: '/api/members/failed'});
const passportGoogleToken = passport.authenticate('googleToken', { session: false, failureFlash: true, failureRedirect: '/api/members/failed' });
const passportGoogle = passport.authenticate('google', { session: false, scope:['https://www.googleapis.com/auth/userinfo.email', 'https://www.googleapis.com/auth/userinfo.profile'] });
const passportFacebookToken = passport.authenticate('facebookToken', { session: false, failureFlash: true, failureRedirect: '/api/members/failed'});
const passportFacebook = passport.authenticate('facebook', { session: false, failureFlash: true, failureRedirect: '/members/oauth/user-denied'});

const passportJWT = passport.authenticate('jwt', { session: false, failureFlash: true, failureRedirect: '/api/members/failed'});

export default () => {
    const router = express.Router();

    // Local Strategy
    router.route('/signup').post(validateSignup, validateRecaptcha, MembersController.signUp);

    // Google Strategy
    router.route('/oauth/google').get(passportGoogle);
    router.route('/google/redirect').get(passportGoogle, MembersController.googleRedirect);
    router.route('/oauth/google').post(passportGoogleToken, MembersController.generateOAuthToken);

    // Facebook Strategy
    router.route('/oauth/facebook').get(passportFacebook);
    router.route('/facebook/redirect').get(passportFacebook, MembersController.facebookRedirect);
    router.route('/oauth/facebook').post(passportFacebookToken, MembersController.generateOAuthToken);

    router.route('/login').post(validateLogin, passportLocal, MembersController.login);
    router.route('/dashboard').get(passportJWT, MembersController.dashboard);
    router.route('/validate').get(MembersController.validate);


    router.route('/avatar-upload').post(MembersController.avatarUpload);
    router.route('/get-avatar/:key').get(MembersController.getAvatar);
    router.route('/update-profile').post(validateUpdateProfile, MembersController.updateProfile);

    router.route('/check-email').post(validateEmail, MembersController.checkEmail);
    router.route('/verify-email').post(validateVerifyEmail, MembersController.verifyEmail);
    router.route('/recover-password').post(validateEmail, MembersController.recoverPassword);
    router.route('/reset-password').post(validateRecoverPassword, MembersController.resetPasswordToken);
    router.route('/update-password').post(validateUpdatePassword, MembersController.updatePassword);

    router.route('/get-member').post(validateId, MembersController.getMemberById);

    router.route('/failed').get(MembersController.failed);

    return router;
}