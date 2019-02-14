import React from 'react';
import './Success.css';

const RegistrationSuccess = (props) => {
    return (
        <div className="text-center pb-lg-8 wrapper">
            <h1 className="display-4 text-muted mb-7">Registration Successful!</h1>
            <span className="lead"><b className="capitalize">{props.name}</b>, We've sent you an confirmation email to <b>{props.email}</b>.</span>
            <p className="lead">Please click on the link in the email to confirm your account!</p>
            <br/>
        </div>
    );
}

export default RegistrationSuccess;