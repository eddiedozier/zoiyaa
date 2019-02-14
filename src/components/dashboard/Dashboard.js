import React, { Component } from 'react';
import { withRouter } from 'react-router';
import { connect } from 'react-redux';
import './Dashboard.css';
import Page from 'react-page-loading'

// Services
import AccountService from '../../services/account.service';
class Dashboard extends Component {
  constructor(props){
    super(props);
    this.state = {
      user: {},
      alreadyLoaded: false
    };
    this.token = localStorage.getItem('zoiyaa-token') ? localStorage.getItem('zoiyaa-token') : '';
    this.accountService = new AccountService(this.token);
  }

  componentDidMount() {
    this.accountService.checkAuthorization()
        .then(resp => {
          if(resp.validated){
            this.setState({alreadyLoaded: true});
            if(this.props.user === undefined || Object.keys(this.props.user).length === 0) {
              this.accountService.getDashboard()
                .then(resp => {
                  if(resp[0] === 'No auth token' || resp[0] === 'jwt malformed'){
                    this.props.history.push('/login');
                  } else {
                    this.setState({user: resp});
                    const user = {
                      ...resp,
                      token: this.token,
                      isLoggedIn: true
                    }
                    this.props.dispatch({type: 'SAVEUSER', payload: user});
                    if(this.props.user && this.props.user.id){
                      this.accountService.getAvatar(this.props.user.id + '.jpg')
                        .then(resp => {
                          function base64String(arrayBuffer) {
                            return btoa(String.fromCharCode.apply(null, new Uint8Array(arrayBuffer)));
                          }
                          if(resp.ContentLength){
                            this.props.dispatch({type: 'UPDATEAVATAR', payload: {...this.props.user, avatar: `data:image/jpeg;base64,${base64String(resp.Body.data)}`}});
                          }
                        })
                    }
                  }
                });
            }
          } else {
            if(this.token){
              localStorage.removeItem('zoiyaa-token');
            }
            this.props.dispatch({type: 'REMOVEUSER'});
            this.props.history.push('/login');
          }
        })
  }

  render() {
    let user = {};
    if(this.state.alreadyLoaded){
      user = this.props.user;
    } else {
      user = this.state.user;
    }
    if(user === undefined || Object.keys(user).length === 0){
      return null;
    }

    return (
        <Page loader={"bubble-spin"} color={"#ee4a03"} size={7}>
          <div id="dashboard" className="container wrapper">
            You are now Logged in!
          </div>
        </Page>
    );
  }
}

const mapStateToProps = state => ({
  user: state.user
});

export default withRouter(connect(mapStateToProps)(Dashboard));