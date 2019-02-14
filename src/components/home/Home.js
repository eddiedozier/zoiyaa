import React from 'react';
import './Home.css';

class Home extends React.Component {
  render() {
    return (
      <React.Fragment>
        <header className="header text-white h-fullscreen text-center text-lg-left pb-8 cover-img" data-overlay="8">
          <div className="container">

            <div className="row h-100">
              <div className="col-12 mx-auto align-self-center">

                <h1 id="headline-text" className="display-4 text-center fw-600">Home improvment the right way!</h1>

                <div className="row col-lg-9 col-xl-8 search-box">
                  <div className="col-md-6 service-input">
                    <input id="service-input" className="form-control form-control-lg main-search" type="text" placeholder="Service Needed?" />
                  </div>
                  <div className="col-md-3 zip-input">
                    <input id="zip-input" className="form-control form-control-lg main-search" type="text" placeholder="Zip" />
                  </div>
                  <div className="col-md-3 getting-started-container">
                    <button type="button" className="btn btn-lg btn-primary get-started-btn fw-500">Get Started!</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>
        <main className="main-content">
          <section className="section">
            <div className="container">
              <header className="section-header">
                <h2>How it Works</h2>
                <hr/>
                <p className="lead">We'll get you ready for your next home improvment project in just a few short steps:</p>
              </header>


              <div className="row gap-y">

                <div className="col-md-6 col-xl-4">
                  <div className="media">
                    <div className="mr-5">
                      <span className="iconbox iconbox-lg bg-pale-primary text-primary"><i className="far fa-file-alt"></i></span>
                    </div>
                    <div className="media-body">
                      <h6>Step One</h6>
                      <p>Tell us alittle bit about your project through a short questionnaire.</p>
                    </div>
                  </div>
                </div>

                <div className="col-md-6 col-xl-4">
                  <div className="media">
                    <div className="mr-5">
                      <span className="iconbox iconbox-lg bg-pale-danger text-danger"><i className="fa fa-bullhorn"></i></span>
                    </div>
                    <div className="media-body">
                      <h6>Step Two</h6>
                      <p>We'll match you with up to four Zoiyaa Service Professionals, which you'll be able to evaluate for your project.</p>
                    </div>
                  </div>
                </div>

                <div className="col-md-6 col-xl-4">
                  <div className="media">
                    <div className="mr-5">
                      <span className="iconbox iconbox-lg bg-pale-success text-success"><i className="far fa-handshake"></i></span>
                    </div>
                    <div className="media-body">
                      <h6>Step Three</h6>
                      <p>Zoiyaa helps you and your recommended service professional finalize the details for your home improvment project.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>
      </React.Fragment>
    );
  }
}

export default Home;
