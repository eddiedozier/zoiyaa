import sgMail from '@sendgrid/mail';
import Hashids from 'hashids';
import uuidv4 from 'uuid/v4';
import routeHelpers from '../../helpers/routeHelpers';
import usersDb from '../dbconnection/userdb';
import transactionEmail from '../../helpers/transactionEmails';
import AWS from 'aws-sdk';
import fs from 'fs';
import fileType from 'file-type';
import bluebird from 'bluebird';
import multiparty from 'multiparty';

const spacesEndpoint = new AWS.Endpoint('nyc3.digitaloceanspaces.com');

AWS.config.update({
    endpoint: spacesEndpoint,
    accessKeyId: process.env.RAZZLE_DO_SPACES_KEY,
    secretAccessKey: process.env.RAZZLE_DO_SPACES_SECRET
});

AWS.config.setPromisesDependency(bluebird);

const s3 = new AWS.S3();

// abstracts function to upload a file returning a promise
const uploadFile = (buffer, name, type) => {
    const params = {
      ACL: 'public-read',
      Body: buffer,
      Bucket: process.env.RAZZLE_DO_SPACES_BUCKET,
      ContentType: type.mime,
      Key: `${name}.${type.ext}`
    };

    // Set File Upload Size Restriction
    // const options = {
    //     partSize: 10 * 1024 * 1024, // 10 MB
    //     queueSize: 10
    // };

    // Upload with options param
    // s3.upload(params, options, function (err, data) {
    //     if (!err) {
    //         console.log(data); // successful response
    //     } else {
    //         console.log(err); // an error occurred
    //     }
    // });

    return s3.upload(params).promise();
};

const getFile = (key) => {
    const params = {
        Bucket: `${process.env.RAZZLE_DO_SPACES_BUCKET}/member-avatars`,
        Key: key
    }
    // userId=QYyXKKeX5Z+fileName=eddie_dozier.jpg
    return s3.getObject(params).promise();
}

export default {
    signUp: async (req, res, next) => {

        usersDb.pool.getConnection(async (err, conn) => {
            if (err) throw err; // not connected!
            
            const { email, password, firstName, lastName } = req.value.body;
            const salt = await routeHelpers.salt(10);
            const hash = await routeHelpers.hash(password, salt);
            const tempToken = uuidv4();
            const strategyId = 1;

            // Check if the Member Exists 
            conn.query('CALL Get_Member_ByEmail(?)',[email], (error, results, fields) => {
              // When done with t he connection, release it.

              // Prepare to create new account
              if(results[0][0]) {
                conn.release();
                return res.status(403).send({ error: 'Account Exists'});
              } else {
                // Create new account
                conn.query('CALL Insert_User_Member(?,?,?,?,?,?,?,@id);select @id',[email,hash,salt,firstName,lastName,tempToken,strategyId], (error, results, fields) => {
                    // SEND VERIFICATION EMAIL
                    sgMail.setApiKey(process.env.RAZZLE_SENDGRID_API_KEY);
                    const msg = {
                        to: email,
                        from: 'support@zoiyaa.com',
                        subject: 'Welcome to Zoiyaa! Confirm Your Email',
                        text: `You're on your way! Let's confirm your email address. By clicking on the following link, you are confirming your email address.`,
                        html: transactionEmail.verifyEmail(firstName, tempToken)
                    }
                    sgMail.send(msg);
                    
                    conn.release();
                    res.status(200).send({registration: "successful"})

                    if (error) throw error;
                });
              }
           
              // Handle error after the release.
              if (error) throw error;
           
              // Don't use the connection here, it has been returned to the pool.
            });
        });
    },

    login: async (req, res, next) => {
        const token = routeHelpers.signJWTToken(req.user.AccountId);
        res.status(200).send({token})
    },

    checkEmail: async (req, res, next) => {
        const email = req.value.body.email;
        try {

            usersDb.pool.getConnection(async (err, conn) => {
                if (err) throw err; // not connected!
    
                conn.query('CALL Get_Member_ByEmail(?)', [email], async (error, results, fields) => { 
                    if (error) throw error;
        
                    // If Member Doesn't exsist, handle it
                    if(!results[0][0]){
                        conn.release();
                        return res.status(200).send({exist: false});
                    } 
                    
                    conn.release();
                    res.status(200).send({exist: true});
                    
                     // Handle error after the release.
                  if (error) throw error;
               
                  // Don't use the connection here, it has been returned to the pool.
                });
    
            });
            
        } catch (error) {
            res.status(500).send(error)
        }
    },

    verifyEmail: async (req, res, next) => {
        const token = req.value.body.token;
        try {

            usersDb.pool.getConnection(async (err, conn) => {
                if (err) throw err; // not connected!
    
                conn.query('CALL Update_Member_ByToken(?)', [token], async (error, results, fields) => { 
                    if (error) throw error;
    
                    // If token Doesn't exsist, handle it
                    if(results.affectedRows === 0){
                        conn.release();
                        return res.status(200).send({emailConfirmUpdate: false});
                    } 
                    
                    conn.release();
                    res.status(200).send({emailConfirmUpdate: true});
                    
                     // Handle error after the release.
                  if (error) throw error;
               
                  // Don't use the connection here, it has been returned to the pool.
                });
    
            });
            
        } catch (error) {
            res.status(500).send(error)
        }
    },

    recoverPassword: async (req, res, next) => {
        const email = req.value.body.email;
        const isValid = await routeHelpers.validateJWT(req,res);
        if(isValid !== 'validated') return res.status(401).send({error: 'Unauthorized'});
        
        try {

            usersDb.pool.getConnection(async (err, conn) => {
                if (err) throw err; // not connected!
    
                conn.query('CALL Get_Member_ByEmail(?)', [email], async (error, results, fields) => { 
                    if (error) throw error;

                    // If Email Doesn't exsist, handle it
                    if(!results[0][0]){
                        conn.release();
                        return res.status(200).send({recoverEmail: 'complete'});
                    } 

                    if(results[0][0].StrategyId !== 1){
                        conn.release();
                        return res.status(200).send({recoverEmail: 'complete', strategy: results[0][0].StrategyId});
                    }
                    const firstName = results[0][0].FirstName;
                    const accountId = results[0][0].AccountId;
                    const hashid = new Hashids(process.env.RAZZLE_HASH_ID_TOKEN, 10);
                    const id =  hashid.encode(accountId); 
                    const tempToken = uuidv4();

                    conn.query('CALL Insert_Token_Password_Recover(?,?)', [email,tempToken], async (error, results, fields) => { 

                        if(results.affectedRows === 1){

                             // SEND VERIFICATION EMAIL
                            sgMail.setApiKey(process.env.RAZZLE_SENDGRID_API_KEY);
                            const msg = {
                                to: email,
                                from: 'support@zoiyaa.com',
                                subject: 'Zoiyaa - Recover Password',
                                text: `${firstName} we know it's tough to remember your password Recover your password with the link below.`,
                                html: transactionEmail.recoverPassword(firstName,id,tempToken)
                            }
                            sgMail.send(msg);
                            conn.release();
                            res.status(200).send({recoverEmail: 'complete'})
                        }                    
                        if (error) throw error;
                    });

                  if (error) throw error;
                });
    
            });
            
        } catch (error) {
            res.status(500).send(error)
        }
    },

    resetPasswordToken: async (req, res, next) => {
        const token = req.value.body.token;
        const id = req.value.body.id;
        const password = req.value.body.newPassword;
        try {

            usersDb.pool.getConnection(async (err, conn) => {
                if (err) throw err; // not connected!

                const salt = await routeHelpers.salt(10);
                const hash = await routeHelpers.hash(password, salt);
                const hashid = new Hashids(process.env.RAZZLE_HASH_ID_TOKEN, 10);
                const accountId = hashid.decode(id)[0];

                conn.query('CALL Update_Member_Password(?,?,?,?)', [accountId,salt,hash,token], async (error, results, fields) => { 
                    if (error) throw error;
    
                    // If Password Didn't update, handle it
                    if(results.affectedRows === 0){
                        conn.release();
                        return res.status(200).send({passwordUpdate: 'failed'});
                    } 
                    
                    conn.release();
                    res.status(200).send({passwordUpdate: 'success'});
                    
                  if (error) throw error;
                });
            });
            
        } catch (error) {
            res.status(500).send(error)
        }
    },

    updatePassword: async (req, res, next) => {
        const {id, oldPassword, newPassword} = req.value.body;
        const salt = await routeHelpers.salt(10);
        const hash = await routeHelpers.hash(newPassword, salt);
        const hashid = new Hashids(process.env.RAZZLE_HASH_ID_TOKEN, 10);
        const accountId = hashid.decode(id)[0];
        
        try {

            usersDb.pool.getConnection(async (err, conn) => {
                if (err) throw err; // not connected!

                conn.query('CALL Get_Member_ById(?)', [accountId], async (error, results, fields) => { 
                    if (error) throw error;
                    
                    // If Member Doesn't exsist, handle it
                    if(!results[0][0]){
                        conn.release();
                        return res.status(200).send({message: 'Invalid'});
                    } 
                    const hashCheck = results[0][0].PasswordHash;
                    const isValid = await routeHelpers.isValidPassword(oldPassword, hashCheck)
    
                    // If oldPassword is incorrect
                    if(!isValid){
                        conn.release();
                        return res.status(200).send({message: 'Invalid'});
                    } 
                    
                    conn.query('CALL Update_Member_Password_WithoutToken(?,?,?)', [accountId, salt, hash], async (error, results, fields) => { 
                        if (error) throw error;
        
                        // If Password Didn't update, handle it
                        if(results.affectedRows === 0){
                            conn.release();
                            return res.status(200).send({passwordUpdate: 'failed'});
                        } 
                        
                        conn.release();
                        res.status(200).send({passwordUpdate: 'success'});
                        
                    if (error) throw error;
                    });

                     // Handle error after the release.
                  if (error) throw error;
               
                  // Don't use the connection here, it has been returned to the pool.
                });
                
            });
            
        } catch (error) {
            res.status(500).send(error)
        }
    },

    updateProfile: async (req, res, next) => {

        usersDb.pool.getConnection(async (err, conn) => {
            if (err) throw err; // not connected!
            
            const { id, email, firstName, lastName, address, city, state, zip, gender, phoneNumber } = req.value.body;

            const hashid = new Hashids(process.env.RAZZLE_HASH_ID_TOKEN, 10);
            const accountId = parseInt(hashid.decode(id)[0]);
            
            // Check if the Member Exists 
            conn.query('CALL Update_MemberProfile_ByEmail(?,?,?,?,?,?,?,?,?,?)',[accountId, email, firstName, lastName, address, city, state, zip, gender, phoneNumber], (error, results, fields) => {
              // When done with t he connection, release it.

                if(results.affectedRows === 1){
                    conn.release();
                    res.status(200).send({accountUpdated: true})

                }  else {
                    conn.release();
                    res.status(200).send({accountUpdated: false})
                }
              // Handle error after the release.
              if (error) throw error;
            });
        });
    },

    getMemberById: async (req, res, next) => {

        usersDb.pool.getConnection(async (err, conn) => {
            if (err) throw err; // not connected!
            
            const id = req.value.body.id;

            const hashid = new Hashids(process.env.RAZZLE_HASH_ID_TOKEN, 10);
            const accountId = parseInt(hashid.decode(id)[0]);
            
            // Check if the Member Exists 
            conn.query('CALL Get_Member_ById(?)',[accountId], (error, results, fields) => {
              // When done with t he connection, release it.
                if(results[0][0]){
                    const profile = {
                        FirstName: results[0][0].FirstName,
                        LastName: results[0][0].LastName,
                        Email: results[0][0].Email,
                        PhoneNumber: results[0][0].PhoneNumber,
                        Address: results[0][0].Address,
                        City: results[0][0].City,
                        State: results[0][0].State,
                        Zip: results[0][0].Zip,
                        Gender: results[0][0].Gender
                    }
                    conn.release();
                    res.status(200).send({user: profile})
                }  else {
                    conn.release();
                    res.status(200).send({accountDoesNotExist: true})
                }
                
              // Handle error after the release.
              if (error) throw error;
            });
        });
    },

    generateOAuthToken: async (req, res, next) => {
        // Generate Token
        const token = routeHelpers.signJWTToken(req.user.AccountId);
        res.status(200).send({token});
    },

    googleRedirect: async (req, res, next) => {
        res.redirect(`/members/oauth/google/${req.user}`);
    },

    facebookRedirect: async (req, res, next) => {
        res.redirect(`/members/oauth/facebook/${req.user}`);
    },

    dashboard: async (req, res, next) => {
        const user = {
            id: routeHelpers.hashId(req.user.AccountId),
            firstName: req.user.FirstName,
            lastName: req.user.LastName,
            strategyId: req.user.StrategyId
        }
        res.status(200).send(user)
    },

    validate: async (req, res, next) => {
        const isValid = await routeHelpers.validateJWT(req,res);
        if(isValid !== 'validated') return res.status(401).send({error: 'Unauthorized'});

        res.status(200).send({validated: true})
    },

    avatarUpload: (req, res, next) => {
        const form = new multiparty.Form();
        form.parse(req, async (error, fields, files) => {
            if (error) throw Error(error);
            const name = files.file[0].originalFilename.split('.')[0];
            try {
                const path = files.file[0].path;
                const buffer = fs.readFileSync(path);
                const type = fileType(buffer);
                const timestamp = Date.now().toString();
                const fileName = `member-avatars/${name}`;
                const data = await uploadFile(buffer, fileName, type);
                return res.status(200).send(data);
            } catch (error) {
                return res.status(400).send(error);
            }
        });
    },

    getAvatar: async (req, res, next) => {
        try {
            const data = await getFile(req.params.key);
            return res.status(200).send(data);
        } catch (error) {
            return res.status(200).send(error);
        }
    },

    failed: async (req, res, next) => {
        res.status(200).send(req.flash('error'))
    }
}