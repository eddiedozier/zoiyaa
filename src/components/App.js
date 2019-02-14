import React, { Component } from 'react';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';
// import { createLogger } from 'redux-logger';
import { persistStore, persistReducer } from 'redux-persist';
import { PersistGate } from 'redux-persist/integration/react'
import storage from 'redux-persist/lib/storage'
import { composeWithDevTools } from 'redux-devtools-extension';
import Route from 'react-router-dom/Route';
import Switch from 'react-router-dom/Switch';
import rootReducer from './redux/reducers';
import './App.css';

// Components
import Home from './home/Home';
import Error from './common/error/Error';
import Navbar from './common/navbar/Navbar';
import Footer from './common/footer/Footer';
import Login from './login/Login';
import Signup from './signup/Signup';
import RecoverPassword from './recover-password/Recover-Password';
import ResetPassword from './reset-password/Reset-Password';
import Dashboard from './dashboard/Dashboard';
import AccountSettings from './dashboard/account-settings/Account-Settings';
import VerifyEmail from './verify-email/Verify-Email';
import OAuthRedirect from './auth/OAuthRedirect';

const middlewares = [];
// Console log Redux
// middlewares.push(createLogger());

const persistConfig = {
  key: 'zoiyaa',
  storage
};
const persistedReducer = persistReducer(persistConfig,rootReducer);

const store = createStore(persistedReducer, undefined, composeWithDevTools(applyMiddleware( ...middlewares)));
const persistor = persistStore(store);
class App extends Component {
  render() {
    return (
        <Provider store={store}>
          <PersistGate persistor={persistor}>
            <div id="main-app">
              <Navbar/>
              <Switch>
                <Route exact path="/" render={props => <Home {...props}/>} />
                <Route exact path="/login" render={props => <Login {...props}/>} />
                <Route exact path="/signup" render={props => <Signup {...props}/>} />
                <Route exact path="/recover-password" render={props => <RecoverPassword {...props}/>} />
                <Route exact path="/reset-password/:id/:token" render={props => <ResetPassword {...props}/>} />
                <Route exact path="/member/dashboard" render={props => <Dashboard {...props}/>}/>
                <Route exact path="/member/account-settings" render={props => <AccountSettings {...props}/>}/>
                <Route exact path="/verify-email/:token" render={props => <VerifyEmail {...props}/>} />
                <Route exact path="/members/oauth/google/:token" render={props => <OAuthRedirect {...props}/>} />
                <Route exact path="/members/oauth/facebook/:token" render={props => <OAuthRedirect {...props}/>} />
                <Route exact path="/members/oauth/user-denied" render={props => <OAuthRedirect {...props}/>} />
                <Route render={props => <Error {...props}/>} />
              </Switch>
              <Footer/>
            </div>
          </PersistGate>
        </Provider>
    );
  }
} 

export default App;
