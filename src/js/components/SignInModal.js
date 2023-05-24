import React, { Component } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import Tabs from "react-bootstrap/Tabs";
import Tab from "react-bootstrap/Tab";
import Spinner from "react-bootstrap/Spinner";

import { signin } from "../utils/APIUtils.js";
import { register, resetPassword } from "../utils/UsersAPI.js";
import { Localizer } from '../config/localizer.js';

import { ACCESS_TOKEN } from '../constants/index.js';

export class SignInModal extends Component {
  constructor(props) {
    super(props);

    this.state = {
      show: this.props.show,
      invalidForm: false,
      loginError: false,
      signupError: false,
      errorMessage: null,
      loading: false,
      mailSent: false,
      forgotPassword: false,
      logInState: props.user ? 'SELECT_ROLE' : 'BLANK',
      logInRoles: props.user ? props.user.roles : null,
      signupSubmitted: false
    }

    this.handleLoginSubmit = this.handleLoginSubmit.bind(this);
    this.handleSignupSubmit = this.handleSignupSubmit.bind(this);
    this.resetPass = this.resetPass.bind(this)
  }

  validateForm() {
    let pswd = this.registrationPassword;
    let pswdRepeat = this.registrationPasswordRepeat;
    if (typeof pswd.value !== "undefined" && typeof pswdRepeat.value !== "undefined" && pswd.value !== '' && pswdRepeat.value !== '') {
      if (pswd.value != pswdRepeat.value) {
        return false;
      }
      return true;
    }
    return false;
  }

  handleLoginSubmit(event) {
    event.preventDefault();

    if (this.state.logInState === 'BLANK') {
      signin({ email: this.email.value, password: this.password.value })
        .then(response => {
          if (response.accessToken) {
            localStorage.setItem(ACCESS_TOKEN, response.accessToken);
            this.props.actions('sign-in')
          } else if (response.roles) {
            this.setState({logInRoles : response.roles, logInState: 'SELECT_ROLE'})
          }
        })
        .catch(error => this.setState({ loginError: true }))
    } else if (this.state.logInState === 'SELECT_ROLE') {
      signin({ email: this.email.value, password: this.password.value, role: this.roleSelect.value })
        .then(response => {
            localStorage.setItem(ACCESS_TOKEN, response.accessToken);
            this.props.actions('sign-in')
        })
        .catch(error => this.setState({ loginError: true }))
        // this.props.actions('select-sign-in-role', { role: this.roleSelect.value })
    }
  }

  handleSignupSubmit(event) {
    event.preventDefault();
    this.setState({ signupSubmitted: true });

    if (this.validateForm()) {
      this.setState({ loading: true })
      register({
        email: this.emailAddress.value,
        password: this.registrationPassword.value,
        name: this.fullname.value
        // jobDescription: this.description.value
      })
        .then(() => {
          // When registration is succcessful, automatically login
          // This should change after making use of react-auth-module
          signin({ email: this.emailAddress.value, password: this.registrationPassword.value })
            .then(response => {
              localStorage.setItem(ACCESS_TOKEN, response.accessToken);
              this.props.actions('sign-in');
              this.setState({ loading: false })
            })
            .catch(error => this.setState({ loginError: true, loading: false }))
        })
        .catch(error => {
          console.error(error);
          this.setState({ signupError: true, loading: false })
        })
    }
  }

  resetPass(event) {
    event.preventDefault();
    this.setState({ loading: true })
    resetPassword(this.email.value)
      .then(res => {
        this.setState({ mailSent: true, loading: false })
      })
      .catch(err => {
        if (err.status == 404) {
          this.setState({ invalidForm: true, errorMessage: "resetPassWrongMail" })
        } else {
          this.setState({ invalidForm: true, errorMessage: "serverError" })
        }
        this.setState({ loading: false })
      })
  }

  render() {
    var selectRole = this.state.logInState === 'SELECT_ROLE';
    var switchRole = selectRole && this.props.user;

    return (
      <Modal
        show={this.props.show}
        onHide={() => this.props.actions('cancel-sign-in')}
        animation={false} backdrop="static"
        centered
      >
        <Modal.Header closeButton/>

        <Modal.Body>
        {!this.state.forgotPassword ?
          <Tabs defaultActiveKey="login" id="signInModal-tabs">

            <Tab eventKey="login" title={switchRole ? 'Switch role' : Localizer.signInModal.login[this.props.language]}>
              <Form id="login-form" onSubmit={this.handleLoginSubmit}>
                <Form.Group controlId="loginForm">
                  <Form.Label>
                    Email
                  </Form.Label>
                  <Form.Control ref={node => (this.email = node)}
                    onChange={() => this.setState({ loginError: false })}
                    defaultValue={this.props.user ? this.props.user.email : ''}
                    isInvalid={!!this.state.loginError}
                    disabled={selectRole}
                  />
                </Form.Group>
                <Form.Group controlId="loginPassword">
                  <Form.Label>
                    {Localizer.signInModal.password[this.props.language]}
                  </Form.Label>
                  <Form.Control type="password" ref={node => (this.password = node)}
                    onChange={() => this.setState({ loginError: false })}
                    isInvalid={!!this.state.loginError}
                    disabled={selectRole && !this.props.user}
                  />
                  <Form.Control.Feedback type="invalid">
                    {Localizer.signInModal.invalidCredentials[this.props.language]}
                  </Form.Control.Feedback>
                </Form.Group>
                {!selectRole &&
                  <a href="#" onClick={() => { this.setState({ forgotPassword: true }) }}>
                    {Localizer.signInModal.forgotPassword[this.props.language]}
                  </a>}

                {selectRole &&
                  <Form.Group controlId="roleSelect">
                    <Form.Label>
                      Continue as
                    </Form.Label>
                    <Form.Control
                      as="select"
                      ref={node => (this.roleSelect = node)}
                      // onChange={() => this.setState({ loginError: false })}
                      required
                    >
                    {this.state.logInRoles.map((el, index) =>
                      <option value={el} key={index}>{el}</option>)}
                    </Form.Control>
                    <Form.Control.Feedback type="invalid">
                      {Localizer.signInModal.invalidCredentials[this.props.language]}
                    </Form.Control.Feedback>
                  </Form.Group>}

                <Row>
                  <Col md={7}/>
                  <Col md={3}>
                    {!selectRole && <Button type="submit" variant="primary">
                      {Localizer.signInModal.login[this.props.language]}
                    </Button>}
                    {selectRole && <Button type="submit" variant="primary">
                      Continue
                    </Button>}
                  </Col>
                  <Col md={2}>
                    <Button variant="secondary" onClick={() => this.props.actions('cancel-sign-in')}>
                      Cancel
                    </Button>
                  </Col>
                </Row>

              </Form>
            </Tab>

            {!switchRole &&
            <Tab eventKey="signup" title={Localizer.signInModal.signup[this.props.language]}>
              <Form id="signup-form" onSubmit={this.handleSignupSubmit}>
                <Form.Group controlId="fullname">
                  <Form.Label>
                    {Localizer.signInModal.fullname[this.props.language]}
                  </Form.Label>
                  <Form.Control
                    ref={node => (this.fullname = node)}
                  />
                </Form.Group>
                {/*<Form.Group controlId="description">
                  <Form.Label>
                    {Localizer.signInModal.description[this.props.language]}
                  </Form.Label>
                  <Form.Control
                    ref={node => (this.description = node)}
                  />
                </Form.Group>*/}
                <Form.Group controlId="signupEmail">
                  <Form.Label>
                    {Localizer.signInModal.emailAddress[this.props.language]}
                  </Form.Label>
                  <Form.Control
                    type="email"
                    ref={node => (this.emailAddress = node)}
                    onChange={() => this.setState({ signupError: false })}
                    isInvalid={!!this.state.signupError}
                    required
                  />
                  <Form.Control.Feedback type="invalid">
                    {Localizer.signInModal.existingEmailError[this.props.language]}
                  </Form.Control.Feedback>
                </Form.Group>
                <Form.Group controlId="signupPassword">
                  <Form.Label>
                    {Localizer.signInModal.password[this.props.language]}
                  </Form.Label>
                  <Form.Control
                    type="password"
                    ref={node => (this.registrationPassword = node)}
                    onChange={() => this.setState({ invalidForm: !this.validateForm() })}
                    isInvalid={!!this.state.invalidForm && this.state.signupSubmitted}
                    required
                  />
                  <Form.Control.Feedback type="invalid">
                    {Localizer.signInModal.invalidPasswordConfirmation[this.props.language]}
                  </Form.Control.Feedback>
                </Form.Group>
                <Form.Group controlId="signupPasswordRepeat">
                  <Form.Label>
                    {Localizer.signInModal.repeatPassword[this.props.language]}
                  </Form.Label>
                  <Form.Control
                    type="password"
                    ref={node => (this.registrationPasswordRepeat = node)}
                    onChange={() => this.setState({ invalidForm: !this.validateForm() })}
                    isInvalid={!!this.state.invalidForm && this.state.signupSubmitted}
                  />
                  <Form.Control.Feedback type="invalid">
                    {Localizer.signInModal.invalidPasswordConfirmation[this.props.language]}
                  </Form.Control.Feedback>
                </Form.Group>
                <Form.Group controlId="roleSelect">
                  <Form.Label>
                    Role
                  </Form.Label>
                  <Form.Control
                    as="select"
                     defaultValue='VALIDATOR'>
                    <option value='VALIDATOR'>VALIDATOR</option>)
                  </Form.Control>
                </Form.Group>

                <Row>
                  <Col md={7}/>
                  <Col md={3}>

                    <Button type="submit" variant="primary" disabled={this.state.loading}>
                      {this.state.loading && <Spinner
                        as="span"
                        animation="border"
                        size="sm"
                        role="status"
                        aria-hidden="true"
                        className="mr-2"
                      />}
                      {Localizer.signInModal.signup[this.props.language]}
                    </Button>
                  </Col>
                  <Col md={2}>
                    <Button variant="secondary" onClick={() => this.props.actions('cancel-sign-in')}>
                      Cancel
                    </Button>
                  </Col>
                </Row>
              </Form>
            </Tab>}

          </Tabs>
          :
          <div className="tab-content">
            <h4 className="modalTitle">{Localizer.signInModal.resetPass[this.props.language]}</h4>
            {this.state.mailSent ?
              <p> {Localizer.signInModal.checkYourMail[this.props.language]} </p>
              :
              <Form id="reset-pass" onSubmit={this.resetPass}>
                <Form.Group controlId="resetPass">
                  <Form.Label>
                    Email
                  </Form.Label>
                  <Form.Control
                    ref={node => (this.email = node)}
                    onChange={() => this.setState({ invalidForm: false })}
                    isInvalid={!!this.state.invalidForm}
                  />
                  <Form.Control.Feedback type="invalid">
                    {this.state.invalidForm && Localizer.signInModal[this.state.errorMessage][this.props.language]}
                  </Form.Control.Feedback>
                </Form.Group>
                <div className="mt-4 d-flex justify-content-between">
                  <Button variant="outline-primary" disabled={this.state.loading} onClick={() => { this.setState({ forgotPassword: false }) }}>
                    BACK
                  </Button>
                  <Button type="submit" variant="danger" disabled={this.state.loading}>
                    {this.state.loading && <Spinner
                      as="span"
                      animation="border"
                      size="sm"
                      role="status"
                      aria-hidden="true"
                      className="mr-2"
                    />}
                    {Localizer.signInModal.resetPass[this.props.language]}
                  </Button>
                </div>
              </Form>}
          </div>}
          </Modal.Body>
      </Modal>
    )
  }
}

export default SignInModal;
