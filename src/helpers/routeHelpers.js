import Joi from 'joi';
import JWT from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import Hashids from 'hashids';
import axios from 'axios';
import queryString from 'query-string';

export default {
    validateBody: (schema) => {
        return (req, res, next) =>{
            const result = Joi.validate(req.body, schema);

            // Handle Errors
            if(result.error) return res.status(400).send(result.error);

            if(!req.value) { req.value = {}; }
            req.value.body = result.value;
            next();
        }
    },

    schemas: {
        signUpSchema: Joi.object().keys({
            email: Joi.string().email().required(),
            password: Joi.string().required().min(8),
            firstName: Joi.string().required(),
            lastName: Joi.string().required(),
            googleRecapcha: Joi.string().required()
        }),
        loginSchema: Joi.object().keys({
            email: Joi.string().email().required(),
            password: Joi.string().required().min(8)
        }),
        checkEmailSchema: Joi.object().keys({
            email: Joi.string().email().required()
        }),
        verifyEmailSchema: Joi.object().keys({
            token: Joi.string().required()
        }),
        getMemberSchema: Joi.object().keys({
            id: Joi.string().required()
        }),
        recoverPasswordSchema: Joi.object().keys({
            id: Joi.string().required(),
            token: Joi.string().required(),
            newPassword: Joi.string().required().min(8)
        }),
        updatePasswordSchema: Joi.object().keys({
            id: Joi.string().required(),
            oldPassword: Joi.string().required().min(8),
            newPassword: Joi.string().required().min(8)
        }),
        updateProfileSchema: Joi.object().keys({
            id: Joi.string().required(),
            email: Joi.string().email().required(),
            firstName: Joi.string().required(),
            lastName: Joi.string().required(),
            address: Joi.string().allow(''),
            city: Joi.string().allow(''),
            state: Joi.string().allow(''),
            zip: Joi.string().allow(''),
            gender: Joi.string().allow(''),
            phoneNumber: Joi.string().allow('')
        })
    },

    signJWTToken: (id) => {
        return JWT.sign({
            iss: 'Zoiyaa',
            sub: id,
            iat: Math.floor(Date.now() / 1000),
            exp: Math.floor(Date.now() / 1000) + (60 * 60)
        }, process.env.RAZZLE_JWT_SECRET);
    },

    validateJWT: async (req,res) => {
        try {
            const decoded = JWT.verify(req.get('Authorization'), process.env.RAZZLE_JWT_SECRET);
            return 'validated';
        } catch(err) {
            return 'invalid'
        }
    },

    salt: async (length) => {
        try {
            return await bcrypt.genSaltSync(length);
        } catch (error) {
            throw new error;
        }
    },

    hash: async (password, salt) => {
        try {
            return await bcrypt.hashSync(password, salt);
        } catch (error) {
            throw new error;
        }
    },

    isValidPassword: async (password, hash) => {
        try {
           return await bcrypt.compareSync(password, hash);
        } catch (error) {
            throw new error;
        }
    },

    hashId: (id) => {
        const hashid = new Hashids(process.env.RAZZLE_HASH_ID_TOKEN, 10);
        const newId =  hashid.encode(id); 
        return newId;
    },

    validateRecaptcha: () => {
        return (req, res, next) => {
            const recaptchaResponse = req.value.body.googleRecapcha;
            const data = {
                response: recaptchaResponse,
                secret: process.env.RAZZLE_GOOGLE_RECAPTCHA
            }
          
           axios.post('https://www.google.com/recaptcha/api/siteverify', queryString.stringify(data))
                .then(resp => {
                    if(resp.data.success){
                      next()
                    } else{
                      res.status(200).send(resp.data);
                    }
                })
                .catch(err => err)
        }
    }
}