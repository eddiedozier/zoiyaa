import React, { Component } from 'react';
import Form from 'react-validation/build/form';
import Input from 'react-validation/build/input';
import './Reset-Password.css';

import * as formValidators from '../../helpers/form.validators';

// Services
import AccountService from '../../services/account.service';

class ResetPassword extends Component {
    constructor(props){
        super(props);
        this.state = {
            disableBtn: true,
            passwordReset: false,
            id: '',
            token: ''
        }
        this.accountService = new AccountService();
        this.state.id = this.props.match.params.id;
        this.state.token = this.props.match.params.token;
    } 

    onInputChange = (event) => {
        const inputs = document.querySelectorAll('input');
        
        const fields = Object.values(this.form.state.byId);
        const password = document.querySelector('input[name="password"]').value;
        const passwordConfirm = document.querySelector('input[name="password-confirm"]').value;
        let empty = 0;

        this.setState({disableLogin: false});

        for(let i = 0; i < inputs.length; i++){
            if(inputs[i].value === ''){
              empty++
            }
          }
      
        if(empty !== 0) {
            return this.setState({disableBtn: true});
        }

        fields.forEach(field => {
            if(field.error || event.target.value === ''){
                this.setState({disableBtn: true});
            }
        });

        if(password === passwordConfirm && password !== '' && passwordConfirm !== '' && password.length >= 8){
            return this.setState({disableBtn: false});
          } else {
            return this.setState({disableBtn: true});
          }
    }

    handleSubmit = (event) => {
        event.preventDefault();
        const fields = Object.values(this.form.state.byId);
        let errors = 0,
            payload;

        this.form.validateAll();

        fields.forEach(field => {
            if(field.error) errors++;
          });
      
        payload = {
            newPassword: fields[0].value,
            token: this.state.token,
            id: this.state.id
        }

        if(errors === 0){
            this.accountService.resetPassword(payload)
            .then(resp => {
                if(resp.passwordUpdate === 'success'){
                    this.setState({passwordReset: true});
                }
            })
        } else {
            this.setState({disableBtn: false});
        }
    }

    componentDidMount(){
        
    }

  render() {
      let body;

      if(!this.state.passwordReset){
          body = <Form className="input-line1" onSubmit={this.handleSubmit} ref={c => { this.form = c }}>
                    <div className="form-group">
                        <Input type="password" className="form-control" name="password" placeholder="Password" validations={[formValidators.required, formValidators.length]} onChange={this.onInputChange} onBlur={this.onInputChange}/>
                    </div>
                    <div className="form-group">
                        <Input type="password" className="form-control" name="password-confirm" placeholder="*Password (confirm)" validations={[formValidators.required, formValidators.password]} onChange={this.onInputChange} onBlur={this.onInputChange}/>
                    </div>

                    <button className="btn btn-lg btn-block btn-primary fw-400" type="submit" disabled={this.state.disableBtn ? true : ''}>Reset Password</button>
                 </Form>
      } else {
          body = <p>Password Reset! You can now log in with your new password!</p>
      }
      
    return (
        <main className="main-content wrapper">

            <div className="bg-white rounded app-border w-400 mw-100 p-6">
                <h5 className="mb-6">Reset your password</h5>
                {body}
            </div>

        </main>
    );
  }
}

export default ResetPassword;