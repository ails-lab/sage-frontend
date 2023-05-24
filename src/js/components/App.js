import React, { Component } from "react";
import Header from "./Header.js";
import Container from "react-bootstrap/Container";
import { Switch, Route, Link, Redirect, withRouter, useParams } from 'react-router-dom';
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Spinner from "react-bootstrap/Spinner";
import { ToastContainer, toast } from 'react-toastify';

import Search from "./explore/Search.js";
import UserSpace from "./api/UserSpace.js";
import SignInModal from "./SignInModal.js";
import { Profile } from './api/Profile';
import { getCurrentDatabase } from '../utils/DatabaseAPI.js';
import { getCurrentUser, signin, logout, savePassword } from "../utils/UsersAPI.js"
import { ACCESS_TOKEN } from '../constants/index.js';
// import { filterByLanguage } from "../utils/functions.js";

import { isEqual } from 'lodash';

import { Localizer } from '../config/localizer.js'

export class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      language: "en",
      logInShow: false,

      currentUser: null,
      preUser: null,
      isAuthenticated: false,
      isLoading: false,

      database: "",

      invalidForm: false,
      wrongToken: false
    }

    this.resetPass = this.resetPass.bind(this);

  }

  validateForm() {
    let pswd = this.registrationPassword;
    let pswdRepeat = this.registrationPasswordRepeat;
    if (typeof pswd.value !== "undefined" && typeof pswdRepeat.value !== "undefined") {
      if (pswd.value !== '' && pswdRepeat.value !== '') {
        if (pswd.value != pswdRepeat.value) {
          return false;
        }
      }
    }
    return true;
  }

  componentDidMount() {
    document.title = Localizer.semantic_network[this.state.language]

    getCurrentDatabase()
      .then(response => {
        this.setState({ database: response });
        document.title = Localizer.semantic_network[this.state.language] + ": " + this.state.database.label;
      })

    // If user-token already exists in localStorage, automatically sign in the user
    this.handleSignIn();
  }

  handleSignIn() {
    this.setState({ isLoading: true });

    getCurrentUser()
      .then(response => {
          this.setState({
            currentUser: response,
            isAuthenticated: true,
            isLoading: false,
            logInShow: false,
          })
      })
      .catch((err) => {
        this.setState({
          currentUser: null,
          isAuthenticated: false,
          datasets: [],
          rootDataset: null,
        })
      })
      .finally(() => {
        this.setState({ isLoading: false });
      })
  }

  handleSignOut() {

    logout()
      .catch((err) => {
      })
      .finally(() => {
        localStorage.removeItem(ACCESS_TOKEN);
        this.setState({
          currentUser: null,
          isAuthenticated: false,
          datasets: [],
          rootDataset: null,
        });
        this.props.history.push('/');
      })
  }

  executeAction(action, params) {

    if (action === 'change-language') {
      this.changeLanguage(params.language);
    } else if (action === 'sign-button-action') {
      if (!this.state.isAuthenticated) {
        this.setState({ logInShow: true });
      } else {
        this.handleSignOut();
      }
    } else if (action === 'sign-in') {
      this.handleSignIn();
    } else if (action === 'switch-role') {
      this.setState({ logInShow: true });
    } else if (action === 'cancel-sign-in') {
      this.setState({ logInShow: false });
    // } else if (action === 'select-sign-in-role') {
    //   var user = { ...this.state.preUser }
    //   user.type = params.role;
    //   this.setState({ currentUser: user , logInShow: false, isAuthenticated: true, isLoading: false })

    } else if (action === 'set-root-dataset') {
      if (!this.state.rootDataset && !isEqual(this.state.rootDataset, params.dataset)) { // childern-parent loop is this condition is removed.
        this.setState({ rootDataset: params.dataset })
      }
    }
    else if (action ==='profile') {
      this.props.history.push('/profile');
    }
  }

  changeLanguage(language) {
    this.setState({ language });
  }

  resetPass(event) {
    event.preventDefault();
    this.setState({ isLoading: true })
    const token = new URLSearchParams(this.props.location.search).get("token")
    const newPassRequest = {
      token: token,
      newPassword: this.registrationPassword.value
    }
    // console.log(newPassRequest)
    savePassword(newPassRequest)
      .then(() => {
        toast.success(Localizer.passUpdateSuccess[this.state.language], {
          position: "top-right",
          autoClose: 4000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
        this.props.history.push('/')
        this.setState({ logInShow: true, isLoading: false })
      })
      .catch(err => {
        if ([400, 404].includes(err.status)) {
          this.setState({ wrongToken: true, isLoading: false })
        }
      })
  }

  renderManage() {
    return (
      this.state.isAuthenticated &&
      <UserSpace user={this.state.currentUser}
        language={this.state.language}
        database={this.state.database}/>
    )
  }

  renderWelcome() {
    return (
      <Container>
        <Row className="welcometable appheader">
          <Col />
          <Col md="3">
            <Link to="/search"><span className="welcome">> {Localizer.explore[this.state.language]}</span></Link>
          </Col>
          <Col md="3">
            <Link to="/manage"><span className="welcome">> {Localizer.manage[this.state.language]}</span></Link>
          </Col>
          <Col />
        </Row>
      </Container>
    )
  }

  renderProfile() {
    return (
      this.state.isAuthenticated &&
        <Profile user={this.state.currentUser}
                 language={this.state.language}/>
    )
  }

  renderResetPass() {
    return (
      <Container className="my-auto boxedContainer">
        <Form id="resetPass-form" onSubmit={this.resetPass}>
          <Form.Group controlId="newPassword">
            <Form.Label>
              {Localizer.newPass[this.state.language]}
            </Form.Label>
            <Form.Control
              type="password"
              ref={node => (this.registrationPassword = node)}
              onChange={() => this.setState({ invalidForm: !this.validateForm() })}
              isInvalid={!!this.state.invalidForm}
              required
            />
            <Form.Control.Feedback type="invalid">
              {Localizer.signInModal.invalidPasswordConfirmation[this.state.language]}
            </Form.Control.Feedback>
          </Form.Group>
          <Form.Group controlId="newPasswordRepeat">
            <Form.Label>
              {Localizer.reEnterNewPass[this.state.language]}
            </Form.Label>
            <Form.Control
              type="password"
              ref={node => (this.registrationPasswordRepeat = node)}
              onChange={() => this.setState({ invalidForm: !this.validateForm() })}
              isInvalid={!!this.state.invalidForm || !!this.state.wrongToken}
            />
            <Form.Control.Feedback type="invalid">
              {this.state.wrongToken ? Localizer.wrongToken[this.state.language] : Localizer.signInModal.invalidPasswordConfirmation[this.state.language]}
            </Form.Control.Feedback>
          </Form.Group>
          <Button type="submit" variant="primary" disabled={this.state.isLoading}>
            {this.state.isLoading && <Spinner
              as="span"
              animation="border"
              size="sm"
              role="status"
              aria-hidden="true"
            />}
            {Localizer.signInModal.resetPass[this.state.language].toUpperCase()}
          </Button>
        </Form>
      </Container>
    )
  }

  render() {

    return (
      <Container fluid>
        <Header language={this.state.language}
          database={this.state.database}
          root={this.state.rootDataset}
          user={this.state.currentUser}
          actions={(action, params) => this.executeAction(action, params)}
        />

        {this.state.logInShow &&
          <SignInModal show={this.state.logInShow}
            user={this.state.currentUser}
            actions={(action, params) => this.executeAction(action, params)}
            language={this.state.language} />
        }

        <Switch>
          <Route path="/search/:rootDataset" exactly
            render={props =>
              <Search {...props}
                user={this.state.currentUser}
                language={this.state.language}
                database={this.state.database}
                actions={(action, params) => this.executeAction(action, params)} />} />
          <Route path="/search" exactly
            render={props =>
              <Search {...props}
                user={this.state.currentUser}
                language={this.state.language}
                database={this.state.database}
                actions={(action, params) => this.executeAction(action, params)} />} />
          <Route path="/manage" exactly
            render={() => this.renderManage()} />
          <Route path="/resetPassword"
            render={() => this.state.isAuthenticated ? <Redirect to="/manage" /> : this.renderResetPass()}>
          </Route>
          <Route path="/profile" exactly
            render={() => this.renderProfile()}/>
          <Route path="/" exactly
            //render={() => this.state.isAuthenticated ? <Redirect to="/manage" /> : this.renderWelcome()}
            render={() => <Redirect to="/manage" />}
            >
          </Route>
        </Switch>

        <ToastContainer
          position="top-right"
          autoClose={4000}
          hideProgressBar
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
      </Container>
    )
  }
}

export default withRouter(App)
