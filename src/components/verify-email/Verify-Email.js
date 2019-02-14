import React, { Component } from 'react';
import './Verify-Email.css';

// Services
import AccountService from '../../services/account.service';

class VerifyEmail extends Component {
    constructor(props){
        super(props);
        this.state = {
            confirmed: false
        }
        this.accountService = new AccountService();
    } 

  render() {
    const token = this.props.match.params.token;
    let message;
    this.accountService.verifyEmail({token})
        .then(resp => {
            if(resp.emailConfirmUpdate){
                this.setState({confirmed: true});
            }
        });

    if(this.state.confirmed){
        message = <span>
                    <h1 className="display-4 text-muted mb-7">Email Confirmed!</h1>
                    <span className="lead">We've successfully confirmed your email! Your account is now activated.</span>
                 </span>
    } else {
        message = <span>
                    <h1 className="display-4 text-muted mb-7">Unable to confirm email!</h1>
                    <span className="lead">Something went wrong!</span>
                 </span>
    }
 
    return (
        <div className="text-center pb-lg-8 wrapper">
            {message}
            <br/>
        </div>
    );
  }
}

export default VerifyEmail;