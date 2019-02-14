import React, { Component } from 'react';
import { NavLink } from 'react-router-dom';
import './Error.css';

class Error extends Component {
  goBack = () =>{
    window.history.back();
  }
  
  render() {
    return (
      <main className="main-content text-center pb-lg-8 wrapper">
        <div className="container">

          <h1 className="display-1 text-muted mb-7">Page Not Found</h1>
          <p className="lead">Seems you're looking for something that doesn't exist.</p>
          <br/>
          <button className="btn btn-secondary w-150 mr-2" type="button" onClick={this.goBack}>Go back</button>
          <NavLink className="btn btn-secondary w-150" to="/">Return Home</NavLink>

        </div>
      </main>
    );
  }
}

export default Error;