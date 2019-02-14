import React from 'react';
import './Failure.css';

const RegistrationFailure = (props) => {
    return (
        <div className="text-center pb-lg-8 wrapper">
            <h1 className="display-4 text-muted mb-7">Registration Failed!</h1>
            <p className="lead">We've detected a registration failure! Please Try again!</p>
            <br/>
        </div>
    );
}

export default RegistrationFailure;