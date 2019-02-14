import React, { Component } from 'react';
import { NavLink } from 'react-router-dom';
import { withRouter } from 'react-router';
import Form from 'react-validation/build/form';
import Input from 'react-validation/build/input';

import * as formValidators from '../../helpers/form.validators'
import './Login.css';

// Services
import AccountService from '../../services/account.service';

class Login extends Component {
  constructor(props){
    super(props);
    this.state = {
      invalidPassword_Email_User: false,
      unconfirmedEmail: false,
      disableLogin: true,
      accountExist: false,
      accessDenied: false
    };
    this.accountService = new AccountService();
  }

  checkInput = (event) => {
    const fields = Object.values(this.form.state.byId);

    this.setState({invalidPassword_Email_User: false, unconfirmedEmail: false, disableLogin: false});

    fields.forEach(field => {
      if(field.error || event.target.value === ''){
        this.setState({disableLogin: true});
      }
    });
  }

  handleLogin = (event) => {
    event.preventDefault();
    const fields = Object.values(this.form.state.byId);
    let errors = 0,
        payload;

    this.setState({invalidPassword_Email_User: false, unconfirmedEmail: false});
    this.form.validateAll();
    
    fields.forEach(field => {
      if(field.error) errors++;
    });

    payload = {
      email: fields[0].value,
      password: fields[1].value
    }

    if(errors === 0){
      this.accountService.login(payload)
      .then(resp => 
        {
          if(resp && resp.token){
            localStorage.setItem('zoiyaa-token', resp.token);
            this.props.history.push('/member/dashboard');
          } else {
            switch(resp[0]) {
              case 'Invalid':
                  this.setState({invalidPassword_Email_User: true});
                  break;
              case 'ConfirmEmail':
                  this.setState({unconfirmedEmail: true});
                  break;
              default:
            }
          }
        }
    );
    } else {
      this.setState({disableLogin: true});
    }
    
  }

  componentDidMount() {
    const accountExist = this.props.location.search.includes('exist=true');
    const accessDenied = this.props.location.search.includes('denied=true');
    if(accountExist) this.setState({accountExist: true});
    if(accessDenied) this.setState({accessDenied: true});
  }

  render() {
    let errMsg,
        errMsg2;

    if (this.state.invalidPassword_Email_User) {
      errMsg = <div className="alert alert-danger" role="alert">Email and or Password Incorrect!</div>
    }

    if (this.state.unconfirmedEmail) {
      errMsg = <div className="alert alert-danger" role="alert">Please confirm your email to sign in!</div>
    }

    if(this.state.accountExist){
      errMsg2 = (
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
          <strong>Account already exist!</strong>
          <p>If you previously logged in with Facebook or Google, click the respective icon to access your Zoiyaa account.</p>
          <button type="button" className="close" data-dismiss="alert" aria-label="Close">
            <span aria-hidden="true">&times;</span>
          </button>
        </div>    
      );
    } else if(this.state.accessDenied){
      errMsg2 = (
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
          <strong>Access Denied!</strong>
          <p>You have denied Zoiyaa access to sign you in using this social provider, please allow access or use your email to register.</p>
          <button type="button" className="close" data-dismiss="alert" aria-label="Close">
            <span aria-hidden="true">&times;</span>
          </button>
        </div>    
      );
    } else {
      errMsg2 = '';
    }

    return (
        <main className="main-content wrapper login-page">
          <div className="bg-white rounded app-border w-400 mw-100 p-6">
            {errMsg2}
            <h5 className="mb-7">Login into your account with:</h5>
            <div className="text-center">
              <a className="btn btn-circle btn-sm btn-facebook mr-2" href="/api/members/oauth/facebook"><i className="fab fa-facebook-f"></i></a>
              <a className="btn btn-circle btn-sm btn-google mr-2" href="/api/members/oauth/google" ><i className="fab fa-google"></i></a>
            </div>
            <div className="divider">Or Login With Your Email</div>
            <Form onSubmit={this.handleLogin} ref={c => { this.form = c }}>
              <div className="form-group">
                <Input type="email" name="email" className="form-control form-control-lg" placeholder="*Email" validations={[formValidators.required, formValidators.email]} onChange={this.checkInput}/>
              </div>

              <div className="form-group">
                <Input type="password" name="password" className="form-control form-control-lg" placeholder="*Password" validations={[formValidators.required]} onChange={this.checkInput}/>
                {errMsg}
              </div>

              <div className="form-group flexbox py-3">
                <div className="custom-control custom-checkbox">
                  <input type="checkbox" className="custom-control-input" defaultChecked/>
                  <label className="custom-control-label">Remember me</label>
                </div>

                <NavLink className="text-muted small-2" to="/recover-password">Forgot password?</NavLink>
              </div>

              <div className="form-group">
                <button className="btn btn-xl btn-block btn-primary fw-400" type="submit" disabled={this.state.disableLogin ? this.state.disableLogin : ''}>Login</button>
              </div>
            </Form>

            <hr className="w-30" />

            <p className="text-center text-muted small-2">Don't have an account? <NavLink to="/signup">Signup here</NavLink></p>
          </div>

        </main>
    );
  }
}
export default withRouter(Login);