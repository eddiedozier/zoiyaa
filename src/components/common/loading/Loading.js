import React, { Component } from 'react';
import './Loading.css';

class Loading extends Component {
    constructor(props){
        super(props);
        this.state = {}
    }
    render() {
        const mainApp = document.querySelector('.offcanvas');
        if(mainApp) this.props.isLoading ?  mainApp.classList.add('pre-load') :  mainApp.classList.add('fadeOut');
        return (
            <div className="offcanvas">
                <svg version="1.1" id="L4" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
                viewBox="0 0 100 100" xmlSpace="preserve">
                <circle fill="#ee4a03" stroke="none" cx="6" cy="50" r="6">
                    <animate
                    attributeName="opacity"
                    dur="1s"
                    values="0;1;0"
                    repeatCount="indefinite"
                    begin="0.1"/>    
                </circle>
                <circle fill="#ee4a03" stroke="none" cx="26" cy="50" r="6">
                    <animate
                    attributeName="opacity"
                    dur="1s"
                    values="0;1;0"
                    repeatCount="indefinite" 
                    begin="0.2"/>       
                </circle>
                <circle fill="#ee4a03" stroke="none" cx="46" cy="50" r="6">
                    <animate
                    attributeName="opacity"
                    dur="1s"
                    values="0;1;0"
                    repeatCount="indefinite" 
                    begin="0.3"/>     
                </circle>
                </svg>
            </div>
        );
    }
}

export default Loading;