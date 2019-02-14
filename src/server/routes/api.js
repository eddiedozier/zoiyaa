import Members from './members';
const router = require('express-promise-router')();

// Routes
export default (app) => {
    
    router.use('/members', Members(app));

    return router;
}