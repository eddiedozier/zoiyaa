import React, { Component } from 'react';
import { withRouter } from 'react-router';
import Form from 'react-validation/build/form';
import Input from 'react-validation/build/input';
import { connect } from 'react-redux';

import * as formValidators from '../../../../helpers/form.validators'

// Services
import AccountService from '../../../../services/account.service';
class PasswordChange extends Component {
  constructor(props){
    super(props);
    this.state = {
      disableSavePassword: true,
      invalidPassword: false,
      passwordUpated: false
    };
    this.accountService = new AccountService();
  }

  checkInput = () => {
    const oldPassword = document.querySelector(`input[name='old-password']`).value;
    const password = document.querySelector(`input[name='password']`).value;
    const passwordConfirm = document.querySelector(`input[name='password-confirm']`).value;
    this.setState({invalidPassword: false})

    if(password === passwordConfirm && password !== '' && passwordConfirm !== '' && password.length >= 8 && oldPassword.length >= 8){
      return this.setState({disableSavePassword: false});
    } else {
      return this.setState({disableSavePassword: true});
    }
  }

  handlePasswordChange = (event) => {
    event.preventDefault();
    let errors = 0,
        payload;

    const fields = Object.values(this.form.state.byId);
    this.form.validateAll();

    fields.forEach(field => {
      if(field.error) errors++;
    });

    payload = {
        id: this.props.user.id,
        oldPassword: fields[0].value,
        newPassword: fields[1].value
    }

    const loader = document.createElement('i');
    loader.setAttribute('class','fas fa-spinner fa-spin');
    let button = document.getElementById('save-changes');
    button.appendChild(loader);

    if(errors === 0){
      // Update Password
      this.accountService.updatePassword(payload)
        .then(resp => {
          if(resp.message === 'Invalid'){
            button.innerHTML = 'Save Changes';
            this.setState({invalidPassword: true})
            this.clearInput();
          }
          if(resp.passwordUpdate){
            button.innerHTML = 'Save Changes';
            this.setState({passwordUpated: true});
            this.clearInput();
          }
        });
    } else {
      this.setState({disableSavePassword: true});
    }
  }

  clearInput = () => {
    const fields = Object.values(this.form.state.byId);
    fields.forEach(input => {
      input.value = '';
      input.isChanged = false;
      input.isUsed = false
    })
    document.querySelector(`input[name='old-password']`).value = '';
    document.querySelector(`input[name='password']`).value = '';
    document.querySelector(`input[name='password-confirm']`).value = '';
  }

  render() {
    let errMsg,
        successMsg;

    if (this.state.invalidPassword) {
      errMsg = <div className="alert alert-danger" role="alert">Password Invalid!</div>
    }

    if(this.state.passwordUpated){
      successMsg = <div className="alert alert-success" role="alert">Password Updated!</div>
    }
   
    return (
        <div className="modal" id="modal-minimal" tabIndex="-1" role="dialog" data-position="top-center">
            <div className="modal-dialog" role="document">
              <div className="modal-content">

                <div className="modal-body">
                  <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                  </button>
                  <h4 className="resetpw">Reset Your Password</h4>
                  {successMsg}
                  <Form id="passwordReset" ref={b => { this.form = b }}>
                    <div className="form-group">
                      <Input type="password" className="form-control form-control-lg" name="old-password" placeholder="*Old Password" validations={[formValidators.required, formValidators.length]} onChange={this.checkInput}/>
                      {errMsg}
                    </div>

                    <div className="form-group">
                      <Input type="password" className="form-control form-control-lg" name="password" placeholder="*Password" validations={[formValidators.required, formValidators.length]} onChange={this.checkInput}/>
                    </div>

                    <div className="form-group">
                      <Input type="password" className="form-control form-control-lg" name="password-confirm" placeholder="*Password (confirm)" validations={[formValidators.required, formValidators.password]} onChange={this.checkInput}/>
                    </div>
                    <small>By clicking “Save Changes, you agree to Zoiyaa's Terms of Service & Privacy Policy.</small>
                    <button id="save-changes" type="button" className="btn btn-xl btn-primary float-right fw-400" disabled={this.state.disableSavePassword ? true : ''} onClick={this.handlePasswordChange}>Save Changes</button>
                  </Form>
                </div>
              </div>
            </div>
        </div>
    );
  }
}

const mapStateToProps = state => ({
  user: state.user
});

export default withRouter(connect(mapStateToProps)(PasswordChange));