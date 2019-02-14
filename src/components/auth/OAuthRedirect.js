import React, { Component } from 'react';
import { withRouter } from 'react-router';
import './OAuthRedirect.css';

// Services
import AccountService from '../../services/account.service';
class OAuthRedirect extends Component {

  constructor(props){
    super(props);
    this.state = {
      user: {}
    };
    this.accountService = new AccountService();
    // Fix Facebook redirect bug
    if(this.props.history.location.hash === '#_=_'){
      this.props.history.push(this.props.history.location.pathname);
    }
  }

  componentDidMount() {
    const token = this.props.match.params.token;
    const payload = {
      access_token: token
    }

    if(this.props.match.path.includes('user-denied')){
      this.props.history.push('/login?denied=true');
    }
    if(this.props.match.path.includes('facebook')){
      this.accountService.facebookAuth(payload)
        .then(resp => {
          if(resp.token){
            localStorage.setItem('zoiyaa-token', resp.token);
            this.props.history.push('/member/dashboard');
          } else {
            this.props.history.push('/login?exist=true');
          }
        });
    } 
    if(this.props.match.path.includes('google')){
      this.accountService.googleAuth(payload)
        .then(resp => {
          if(resp.token){
            localStorage.setItem('zoiyaa-token', resp.token);
            this.props.history.push('/member/dashboard');
          } else {
            this.props.history.push('/login?exist=true');
          }
        });
    }
  }

  render() {
    return (
        <div className="wrapper">
        </div>
    );
  }
}

export default withRouter(OAuthRedirect);