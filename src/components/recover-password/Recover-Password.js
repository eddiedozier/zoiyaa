import React, { Component } from 'react';
import Form from 'react-validation/build/form';
import Input from 'react-validation/build/input';
import './Recover-Password.css';

import * as formValidators from '../../helpers/form.validators';

// Services
import AccountService from '../../services/account.service';

class RecoverPassword extends Component {
    constructor(props){
        super(props);
        this.state = {
            disableBtn: true,
            emailSent: false
        }
        this.accountService = new AccountService();
    } 

    onInputChange = (event) => {
        const fields = Object.values(this.form.state.byId);
        this.setState({disableBtn: false});

        fields.forEach(field => {
            if(field.error || event.target.value === ''){
                this.setState({disableBtn: true});
            }
        });
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
            email: fields[0].value
        }

        if(errors === 0){
            this.accountService.recoverPasswordEmail(payload)
            .then(resp => {
                console.log(resp)
            })
            this.setState({emailSent: true});
        } else {
            this.setState({disableBtn: false});
        }
    }

    componentDidMount(){

    }

  render() {
      let body;
      if(!this.state.emailSent){
          body = <Form className="input-line1" onSubmit={this.handleSubmit} ref={c => { this.form = c }}>
                    <div className="form-group">
                        <Input type="email" className="form-control" name="email" placeholder="Email Address" validations={[formValidators.required, formValidators.email]} onChange={this.onInputChange} onBlur={this.onInputChange}/>
                    </div>

                    <button className="btn btn-lg btn-block btn-primary fw-400" type="submit" disabled={this.state.disableBtn ? true : ''}>Recover Password</button>
                 </Form>
      } else {
          body = <b>If we have this email in our records, we'll send you a link to create a new password!</b>
      }
      
    return (
        <main className="main-content wrapper">

            <div className="bg-white rounded app-border w-400 mw-100 p-6">
                <h5 className="mb-6">Recover your password</h5>
                {body}
            </div>

        </main>
    );
  }
}

export default RecoverPassword;