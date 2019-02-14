import React, { Component } from 'react';
import { connect } from 'react-redux';
import { NavLink } from 'react-router-dom';
import { withRouter } from 'react-router';
import './Navbar.css';

class Navbar extends Component {
  constructor(props){
      super(props);
      this.state = {
          user: this.props.user
      };
  }

  logout = () => {
      localStorage.removeItem('zoiyaa-token');
      this.props.dispatch({type: 'REMOVEUSER'});
  }

  handleMenuClick = () => {
    const body = document.querySelector('body');
    const dropdownItems = document.querySelectorAll('.nav-special');
    const navbar = document.querySelector('#main-nav');
    const backdrop = document.createElement('div');
    const container = navbar.querySelector('.container');
    backdrop.setAttribute('class', 'backdrop-navbar backdrop');
    navbar.insertBefore(backdrop, container);

    if(dropdownItems){
        const backdropLayer = document.querySelector('.backdrop-navbar');
        backdropLayer.addEventListener('click', () => {
            body.classList.remove('navbar-open');
            backdropLayer.remove();
        });
        for(let i = 0; i < dropdownItems.length; i++){
            dropdownItems[i].addEventListener('click', () => {
                body.classList.remove('navbar-open');
                backdropLayer.remove();
            });
        }
    }
 }

  render() {
    let navState,
        submenu = '';
    if(this.props.user && this.props.user.isLoggedIn){
        navState = <span className="dropdown-toggle" data-toggle="dropdown">
                        <img className="avatar avatar-sm" src={this.props.user.avatar || "../assets/img/avatar/1.jpg"} alt="avatar" />
                        <small className="name-space capitalize">Hi, {this.props.user.firstName}</small>
                   </span>
        submenu = <div className="dropdown-menu">
                    <NavLink className="dropdown-item nav-special fw-400" to="/member/dashboard">Dashboard</NavLink>
                    <NavLink className="dropdown-item nav-special fw-400" to="/member/account-settings">Manage Account</NavLink>
                    <div className="dropdown-divider"></div>
                    <NavLink className="dropdown-item fw-400" to="/" onClick={this.logout}>Logout</NavLink>
                  </div>
    } else {
        navState = <React.Fragment>
                        <NavLink className="btn btn-lg btn-outline-secondary fw-400" to="/login">Login</NavLink>
                        <NavLink className="btn btn-lg ml-lg-2 mr-2 btn-orange fw-400" to="/signup">Sign Up</NavLink>
                    </React.Fragment>
    }

    return (
        <nav id="main-nav" className="navbar navbar-expand-lg navbar-dark" data-navbar="fixed">
            <div className="container">
                <div className="navbar-left mr-4">
                    <button className="navbar-toggler" type="button" onClick={this.handleMenuClick}>&#9776;</button>
                    <NavLink className="navbar-brand" to="/">
                        <img className="logo-dark" src="/assets/img/zoiyaa-logo.png" alt="logo" />
                    </NavLink>
                </div>

                <section className="navbar-mobile">
                    <nav className="nav nav-navbar mr-auto">
                        <NavLink className="nav-link fw-500" to="/">Find Pros</NavLink>
                        <NavLink className="nav-link fw-500" to="/">Project Costs</NavLink>
                        <NavLink className="nav-link fw-500" to="/">Ideas</NavLink>
                    </nav>

                    <div className={submenu !== '' ? "dropdown open-on-hover ml-lg-5" : ''}>
                        {navState}
                        {submenu}
                    </div>
                </section>
            </div>
         </nav>
    );
  }
}

const mapStateToProps = state => ({
    user: state.user
});
  
export default withRouter(connect(mapStateToProps)(Navbar));