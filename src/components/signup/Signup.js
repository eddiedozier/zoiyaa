import React, { Component } from 'react';
import Form from 'react-validation/build/form';
import Input from 'react-validation/build/input';
import { NavLink } from 'react-router-dom';
import Recaptcha from 'react-recaptcha';

import './Signup.css';

import RegistrationSuccess from './success/Success';
import RegistrationFailure from './failure/Failure';
import * as formValidators from '../../helpers/form.validators';

// Services
import AccountService from '../../services/account.service';

class Signup extends Component {
  constructor(props){
    super(props);
    this.state = {
      password: '',
      passwordConfirm: '',
      passwordLength: 0,
      disableLogin: true,
      emailExist: false,
      success: false,
      failed: false,
      name: '',
      email: '',
      googleRecapcha: ''
    };
    this.accountService = new AccountService();
  }

  checkInput = () => {
    const inputs = document.querySelectorAll('input');
    const password = document.querySelector('input[name="password"]').value;
    const passwordConfirm = document.querySelector('input[name="password-confirm"]').value;
    const fields = Object.values(this.form.state.byId);
    let empty = 0;

    if(document.querySelector(`input[name='email']`).classList.contains('is-invalid-input')){
      return this.setState({disableLogin: true});
    }

    for(let i = 0; i < inputs.length; i++){
      if(inputs[i].value === ''){
        empty++
      }
    }
    if(empty !== 0) {
      return this.setState({disableLogin: true});
    }
    
    fields.forEach(field => {
      if(field.error){
        return this.setState({disableLogin: true});
      }
    });

    if(password === passwordConfirm && password !== '' && passwordConfirm !== '' && password.length >= 8 && this.state.googleRecapcha !== ''){
      return this.setState({disableLogin: false});
    } else {
      return this.setState({disableLogin: true});
    }
    
  }

  checkEmail = (event) => {
    const data = {
      email: event.target.value
    }
    if(document.querySelector(`input[name='email']`).classList.contains('is-invalid-input')){
      return this.setState({disableLogin: true});
    }
    this.accountService.checkEmail(data)
      .then(resp => {
        if(resp.exist === true){
          this.setState({emailExist: true})
        } else {
          this.setState({emailExist: false})
        }
      })
  }
  
  googleVerify = (resp) =>{
    this.setState({googleRecapcha: resp}, () => {
      this.checkInput();
    });
  }

  handleSignup = (event) =>{
    event.preventDefault();
    let errors = 0,
        payload;
    const fields = Object.values(this.form.state.byId);

    this.form.validateAll();

    fields.forEach(field => {
      if(field.error) errors++;
    });

    payload = {
      firstName: fields[0].value,
      lastName: fields[1].value,
      email: fields[2].value,
      password: fields[3].value,
      googleRecapcha: this.state.googleRecapcha
    }

    if(errors === 0){
      this.accountService.registerMember(payload)
        .then(resp => {
          if(resp.registration === 'successful'){
            this.setState({success: true, name: payload.firstName, email: payload.email});
          } else {
            this.setState({failed: true});
          }
        })
    } else {
      this.setState({disableLogin: true});
    }

  }

  componentDidMount(){

  }

  render() {
    let errMsg;
    let content;

    if (this.state.emailExist) {
      errMsg = <div className="alert alert-danger" role="alert">Email already in use!</div>
    }

    if(this.state.success){
      content = <RegistrationSuccess name={this.state.name} email={this.state.email}/>;
    } else if (this.state.failed){
      content = <RegistrationFailure/>;
    } else {
      content = <div className="bg-white rounded app-border w-400 mw-100 p-6">
                  <h5 className="mb-7">Create a FREE account with:</h5>

                  <div className="text-center">
                    <a className="btn btn-circle btn-sm btn-facebook mr-2" href="/api/members/oauth/facebook"><i className="fab fa-facebook-f"></i></a>
                    <a className="btn btn-circle btn-sm btn-google mr-2" href="/api/members/oauth/google"><i className="fab fa-google"></i></a>
                  </div>
                  <div className="divider">Or Sign Up With Email</div>

                  <Form onSubmit={this.handleSignup} ref={c => { this.form = c }}>
                    <div className="form-group">
                      <Input type="text" className="form-control form-control-lg" name="first_name" placeholder="*First Name" validations={[formValidators.required]} onChange={this.checkInput}/>
                    </div>

                    <div className="form-group">
                      <Input type="text" className="form-control form-control-lg" name="last_name" placeholder="*Last Name"  validations={[formValidators.required]} onChange={this.checkInput}/>
                    </div>
                    
                    <div className="form-group">
                      <Input type="email" className="form-control form-control-lg" name="email" placeholder="*Email Address" validations={[formValidators.required, formValidators.email]} onChange={this.checkInput} onBlur={this.checkEmail}/>
                      {errMsg}
                    </div>

                    <div className="form-group">
                      <Input type="password" className="form-control form-control-lg" name="password" placeholder="*Password" validations={[formValidators.required, formValidators.length]} onChange={this.checkInput}/>
                    </div>

                    <div className="form-group">
                      <Input type="password" className="form-control form-control-lg" name="password-confirm" placeholder="*Password (confirm)" validations={[formValidators.required, formValidators.password]} onChange={this.checkInput}/>
                    </div>
                    <Recaptcha sitekey="6Lf2lGoUAAAAAO9Fs6HeKah2HX-gN8hw7qlCifE_" verifyCallback={this.googleVerify}/>

                    <div className="form-group sign-up">
                      <button className="btn btn-xl btn-block btn-primary fw-400" type="submit" disabled={this.state.disableLogin || this.state.emailExist ? true : ''} >Sign Up</button>
                    </div>
                    <p className="text-center text-muted small-6">By signing up, I agree to Zoiyaa's Terms of Service & Privacy Policy.</p>
                    <hr className="w-30" />
                  </Form>

                  <p className="text-center text-muted small-2">Already a member? <NavLink to="/login">Login here</NavLink></p>
                </div>
    }

    return (
      <main className="main-content wrapper signup-page">
        {content}        
      </main>
    );
  }
}

export default Signup;