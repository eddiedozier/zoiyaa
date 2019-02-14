import React, { Component } from 'react';
import { withRouter } from 'react-router';
import FileBase64 from 'react-file-base64';
import resizeImage from 'resize-image';
import Form from 'react-validation/build/form';
import Input from 'react-validation/build/input';
import Select from 'react-validation/build/select';
import { connect } from 'react-redux';
import imgHelper from 'blueimp-load-image';
// import Toastify from 'toastify-js';

import './account-settings.css';

// Helpers
import PasswordChange from './password-change/PasswordChange';
import * as formValidators from '../../../helpers/form.validators';

// Services
import AccountService from '../../../services/account.service';

class AccountSettings extends Component {
  constructor(props){
    super(props);
    this.state = {
      user: {},
      disableSave: false,
      emailExist: false,
      avatar: '',
      avatarName: '',
      avatarCheck: false,
      avatarData: '',
      states: ['AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY']
    };
    this.token = localStorage.getItem('zoiyaa-token') ? localStorage.getItem('zoiyaa-token') : '';
    this.accountService = new AccountService(this.token);
  }

  handleFileUpload = (e) => {
    let self = this;
    let files = e.target.files;
    const formData = new FormData();
    self.setState = this.setState;

    function dataURItoBlob(dataURI) {
        var byteString = atob(dataURI.split(',')[1]);
        var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0]
        var ab = new ArrayBuffer(byteString.length);
        var ia = new Uint8Array(ab);

        for (var i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
        }
        var blob = new Blob([ab], {type: mimeString});
        return blob;
    }

    function blobToFile(blob, fileName){
        blob.lastModifiedDate = new Date();
        blob.lastModified = blob.lastModifiedDate.getTime();
        blob.name = fileName;
        return blob;
    }

    for (var i = 0; i < files.length; i++) {
      let file = files[i];
      const userId = this.props.user.id;

      imgHelper(
        file, // img or canvas element
        function (img) {
            self.setState({avatar: img.toDataURL()});

            const resizedImg = resizeImage.resize(img, img.width, img.height, resizeImage.JPEG);
            const convertToBlob = dataURItoBlob(resizedImg);

            formData.append('file', blobToFile(convertToBlob, file.name), `${userId}`);

            if (!file.type.includes('image')) {
                self.avatarCheck = true;
            } else {
                self.setState({avatarData: formData, avatarName: file.name, fileError: false});
            }
        },
        {maxWidth: 300, orientation: true}
    );
    }
  }

  checkInput = () => {
    const firstName = document.querySelector('input[name=first_name]').value;
    const lastName = document.querySelector('input[name=last_name]').value;
    
    if(document.querySelector(`input[name='email']`).classList.contains('is-invalid-input')){
        return this.setState({disableSave: true});
    }

    if(firstName === '' || lastName === '') {
      return this.setState({disableSave: true});
    } else {
        this.setState({disableSave: false});
    }
  }

  // This is feature will be implemented in future release
//   checkEmail = (event) => {
//     const data = {
//       email: event.target.value
//     }
//     if(document.querySelector(`input[name='email']`).classList.contains('is-invalid-input')){
//       return this.setState({disableLogin: true});
//     }
//     this.accountService.checkEmail(data)
//       .then(resp => {
//         if(resp.exist === true){
//           this.setState({emailExist: true})
//         } else {
//           this.setState({emailExist: false})
//         }
//       })
//   }

  handleSave = (event) => {
    event.preventDefault();
    let errors = 0,
        payload;
    const fields = Object.values(this.form.state.byId);
    const gender = document.querySelector(`input[name=gender]:checked`) ? document.querySelector(`input[name=gender]:checked`).value : '';

    this.form.validateAll();

    fields.forEach(field => {
      if(field.error) errors++;
    });

    payload = {
      id: this.props.user.id,
      firstName: fields[1].value,
      lastName: fields[3].value,
      email: fields[2].value,
      phoneNumber: fields[4].value,
      address: fields[5].value,
      city: fields[6].value,
      zip: fields[7].value,
      state: fields[8].value,
      gender: gender,
    }

    if(errors === 0){
        // Save Avatar
        if(this.state.avatarData){
            this.accountService.uploadAvatar(this.state.avatarData).then(resp => {
                if(resp.ETag){
                    this.props.dispatch({type: 'UPDATEAVATAR', payload: {...this.props.user, avatar: this.state.avatar}});
                }
            });
        }

        const loader = document.createElement('i');
        loader.setAttribute('class','fas fa-spinner fa-spin')
        let button = document.getElementById('saveBtn');
        button.appendChild(loader)
        this.setState({disableSave: true})

        this.accountService.updateProfile(payload)
        .then(resp => {
            if(resp.accountUpdated){
                button.innerHTML = 'Save';
                this.setState({disableSave: false});

                // Toastify({
                //     text: "Profile Updated!",
                //     duration: 2000,
                //     close: true,
                //     gravity: "top",
                //     positionLeft: false,
                //     backgroundColor: "#ff7451",
                //   }).showToast();
            }
        })
    } else {
      this.setState({disableSave: true});
    }
  }

  componentDidMount() {

    this.accountService.checkAuthorization()
    .then(resp => {
        if(resp.validated){ 
            const payload = {
                id: this.props.user.id
            }
            this.accountService.getMember(payload)
                .then(resp => {
                    if(resp.response && resp.response.status === 401){
                        if(this.token){
                            localStorage.removeItem('zoiyaa-token');
                        }
                        this.props.dispatch({type: 'REMOVEUSER'});
                        this.props.history.push('/login');
                    } else {
                        this.setState({user: resp.user});
                    }
                });
        } else {
            if(this.token){
                localStorage.removeItem('zoiyaa-token');
            }
            this.props.dispatch({type: 'REMOVEUSER'});
            this.props.history.push('/login');
        }
    });
  }

  render() {
    let user = {},
        errMsg,
        resetPassword;
    user = this.state.user;
    if(this.props.user.strategyId === 1){
        resetPassword = <div className="form-group">
                            <div className="col-6">
                                <button type="button" className="btn btn-xl bg-pale-dark text-muted fw-400" data-toggle="modal" data-target="#modal-minimal">Reset Password</button>
                            </div>
                        </div>
    }

    if(Object.keys(user).length === 0){
        return null;
    }
    if (this.state.emailExist) {
        errMsg = <div className="alert alert-danger" role="alert">Email already in use!</div>
    }
   
    return (
        <main className="main-content wrapper account-settings">
            <div className="bg-white rounded app-border w-800 mw-100 p-6">
                <h5 className="mb-7">Account Settings</h5>
                <Form onSubmit={this.handleSave} ref={a => { this.form = a }}>
                    <div className="row">
                        <div className="col-3">
                            <div>
                                <p>Change Avatar</p>
                            </div>
                            <img className="rounded-circle" src={this.state.avatar || this.props.user.avatar || "../assets/img/avatar/1.jpg"} alt="avatar"/>
                        </div>
                        <div className="custom-file col-9 col-md-5 upload">
                            <Input type="file" className="custom-file-input" onChange={this.handleFileUpload}/>
                            <label className="custom-file-label">{this.state.avatarName ? this.state.avatarName : 'Upload'}</label>
                        </div>
                    </div>

                    <div className="divider">Profile</div>

                    <div className="row">
                        <div className="col-md-6">
                            <div className="form-group">
                                <label>First Name</label>
                                <Input type="text" name="first_name" value={user.FirstName} className="form-control form-control-lg" placeholder="*First Name" autoComplete="off" validations={[formValidators.required]} onChange={this.checkInput}/>
                            </div>

                            <div className="form-group">
                                <label>Email</label>
                                <Input type="email" name="email" value={user.Email} className="form-control form-control-lg" placeholder="Email" autoComplete={'off'} disabled/>
                                {errMsg}
                            </div>
                        </div>

                        <div className="col-md-6">
                            <div className="form-group">
                                <label>Last Name</label>
                                <Input type="text" name="last_name" value={user.LastName} className="form-control form-control-lg" autoComplete="off" placeholder="*Last Name" validations={[formValidators.required]} onChange={this.checkInput}/>
                            </div>
                            <div className="form-group">
                                <label>Phone Number</label>
                                <Input type="text" name="phone_number" value={user.PhoneNumber || ''} className="form-control form-control-lg" placeholder="Primary Number"  autoComplete="off"/>
                            </div>
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Address</label>
                        <Input type="text" name="address" value={user.Address || ''} className="form-control form-control-lg" placeholder="Address"  autoComplete="off"/>
                    </div>

                    <div className="row">
                        <div className="col-md-4">
                            <div className="form-group">
                                <label>City</label>
                                <Input type="text" name="city" value={user.City || ''} className="form-control form-control-lg" placeholder="City" autoComplete="off"/>
                            </div>
                        </div>

                        <div className="col-md-4">
                            <div className="form-group">
                                <label>Zip</label>
                                <Input type="number" name="zip" value={user.Zip || ''} className="form-control form-control-lg" placeholder="Zip" autoComplete="off"/>
                            </div>
                        </div>

                        <div className="col-md-4">
                            <div className="form-group">
                                <label>State</label>
                                <Select className="form-control form-control-lg" value={this.state.user.State || ''}>
                                    <option value="">Choose your State</option>
                                    {this.state.states.map((state,idx) => <option key={idx}>{state}</option>)}
                                </Select>
                            </div>
                        </div>
                    </div>

                    <div id="gender" className="custom-controls-stacked">
                        <label>Gender</label>
                        <div className="custom-control custom-radio">
                            <input type="radio" className="custom-control-input" name="gender" value="Male" defaultChecked={this.state.user.Gender === 'Male'}/>
                            <label className="custom-control-label">Male</label>
                        </div>

                        <div className="custom-control custom-radio">
                            <input type="radio" className="custom-control-input" name="gender" value="Female" defaultChecked={this.state.user.Gender === 'Female'}/>
                            <label className="custom-control-label">Female</label>
                        </div>
                    </div>

                    <div className="row">
                        {resetPassword}
                        <div className="form-group">
                            <div className="col-6">
                                <button id="saveBtn" className="btn btn-xl btn-primary fw-400" type="submit" disabled={this.state.disableSave ? this.state.disableSave : ''}>Save 
                                </button>
                            </div>
                        </div>
                    </div>
                </Form>
            </div>
            <PasswordChange/>
        </main>
    );
  }
}

FileBase64.defaultProps = {
    multiple: false,
};

const mapStateToProps = state => ({
  user: state.user
});

export default withRouter(connect(mapStateToProps)(AccountSettings));