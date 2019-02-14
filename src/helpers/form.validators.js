import React from 'react';
import validator from 'validator';

export const required = (value) => {
  if (!value.toString().trim().length) {
    // We can return string or jsx as the 'error' prop for the validated Component
    return <div className="alert alert-danger" role="alert">Required</div>;
  }
};
 
export const email = (value) => {
  if (!validator.isEmail(value)) {
    return <div className="alert alert-danger" role="alert">{value} is not a valid email!</div>
  }
};
 
export const lt = (value, props) => {
  // get the maxLength from component's props
  if (!value.toString().trim().length > props.maxLength) {
    // Return jsx
    return <div className="alert alert-danger" role="alert">The value exceeded {props.maxLength} symbols.</div>
  }
};

export const length = (value, props) => {
  if(!validator.isLength(value,{min: 8})){
    return <div className="alert alert-danger" role="alert">Password must be at least 8 characters.</div>
  }
};
 
export const password = (value, props, components) => {
  // NOTE: Tricky place. The 'value' argument is always current component's value.
  // So in case we're 'changing' let's say 'password' component - we'll compare it's value with 'confirm' value.
  // But if we're changing 'confirm' component - the condition will always be true
  // If we need to always compare own values - replace 'value' with components.password[0].value and make some magic with error rendering.
  if (value !== components['password'][0].value) { // components['password'][0].value !== components['confirm'][0].value
    // 'confirm' - name of input
    // components['confirm'] - array of same-name components because of checkboxes and radios
    return <div className="alert alert-danger" role="alert">Passwords Don't Match.</div>
  }
};