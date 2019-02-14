import axios from 'axios';

export default class AccountService {
    constructor(jwtToken = ''){
        axios.defaults.headers.common['Authorization'] = jwtToken
    }

    // Retrieve loggedin Member From Passport
    registerMember (data) { 
        return axios.post(`/api/members/signup`, data)
            .then((resp) => resp.data)
            .catch((err) => err);
    }
    // Login Member
    login (data) { 
        return axios.post(`/api/members/login`, data)
            .then((resp) => resp.data)
            .catch((err) => err);
    }
    // Google Auth Token
    googleAuth (googleToken) { 
        return axios.post(`/api/members/oauth/google`, googleToken)
            .then((resp) => resp.data)
            .catch((err) => err);
    }
    // Facebook Auth Token
    facebookAuth (facebookToken) { 
        return axios.post(`/api/members/oauth/facebook`, facebookToken)
            .then((resp) => resp.data)
            .catch((err) => err);
    }
    // Check if Member Exsist
    checkEmail (email) { 
        return axios.post(`/api/members/check-email`, email)
            .then((resp) => resp.data)
            .catch((err) => err);
    }
    // Confirm Member Email
    verifyEmail (emailToken) {
        return axios.post(`/api/members/verify-email`, emailToken)
            .then((resp) => resp.data)
            .catch((err) => err);
    }
    // Check if Member Is Authorized view this route
    getDashboard () {
        return axios.get(`/api/members/dashboard`)
            .then((resp) => resp.data)
            .catch((err) => err);
    }

    // Check if Member Is Authorized view this route
    checkAuthorization () {
        return axios.get(`/api/members/validate`)
            .then((resp) => resp.data)
            .catch((err) => err);
    }
    // Send Member Recover Password Email
    recoverPasswordEmail (data) {
        return axios.post(`/api/members/recover-password`, data)
            .then((resp) => resp.data)
            .catch((err) => err);
    }
    // Send Member Recover Password Email
    resetPassword (data) { 
        return axios.post(`/api/members/reset-password`, data)
            .then((resp) => resp.data)
            .catch((err) => err);
    }
    // Upload Member Avatar to Digital Ocean Spaces
    uploadAvatar (file) {
        return axios.post(`/api/members/avatar-upload`, file, { headers: { 'Content-Type': 'multipart/form-data' }})
            .then((resp) => resp.data)
            .catch((err) => err);
    }
    // Get Member
    getAvatar (key) { 
        return axios.get(`/api/members/get-avatar/${key}`)
            .then((resp) => resp.data)
            .catch((err) => err);
    }
    // Update Member Profile
    updateProfile (user) { 
        return axios.post(`/api/members/update-profile`, user)
            .then((resp) => resp.data)
            .catch((err) => err);
    }
    // Get Member
    getMember (id) { 
        return axios.post(`/api/members/get-member`, id)
            .then((resp) => resp.data)
            .catch((err) => err);
    }
    // Update Member Password
    updatePassword (data) { 
        return axios.post(`/api/members/update-password`, data)
            .then((resp) => resp.data)
            .catch((err) => err);
    }
}