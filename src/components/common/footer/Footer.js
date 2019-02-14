import React, { Component } from 'react';
import './Footer.css';

class Footer extends Component {

  render() {
      
    return (
      <footer className="footer bg-img">
        <div className="container">
          <div className="row gap-y align-items-center">

            <div className="col-md-6 text-center text-md-left">
              <small>© 2018 Zoiyaa. All rights reserved.</small>
            </div>

            <div className="col-md-6 text-center text-md-right">
              <div className="social">
                <a className="social-facebook" href="https://www.zoiyaa.com"><i className="fab fa-facebook-f"></i></a>
                <a className="social-twitter" href="https://www.zoiyaa.com"><i className="fab fa-twitter"></i></a>
                <a className="social-instagram" href="https://www.zoiyaa.com"><i className="fab fa-instagram"></i></a>
              </div>
            </div>

          </div>
        </div>
      </footer>
    );
  }
}

export default Footer;