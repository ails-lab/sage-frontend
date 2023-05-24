import React, { Component } from "react";
import Container from "react-bootstrap/Container";
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import Dropdown from "react-bootstrap/Dropdown";
import DropdownButton from "react-bootstrap/DropdownButton";
import { filterByLanguage } from "../utils/functions.js";
//import { Localizer } from '../config/localizer.js'

export class Header extends Component {
  get selectedLanguage() {
    if (this.props.language === 'en') {
      //return (<img src="/flags/en.png" alt="English" className="language-flag" />);
      return (<span className="languagetitle">EN</span>);
    }
    else if (this.props.language === 'el') {
      //return (<img src="/flags/el.png" alt="Greek" className="language-flag" />);
      return (<span className="languagetitle">EL</span>);
    }
  }

  render() {
    return (
      <Container className="appheader">
        <Row>
          <Col>
            <a href="/manage">
              <img src="/sage-logo2.png" className="sageLogo" alt="SAGE"/>
            </a>
            {/*<span className="mainTitle">{Localizer.semantic_network[this.props.language]}{this.props.database && ": "}</span>*/}
            <div className="projectTitle">{this.props.database.label}
            {this.props.root &&
              <span className="mainTitle databaseSubTitle"> &#62; {filterByLanguage(this.props.root, 'http://www.w3.org/2000/01/rdf-schema#label', this.props.language)}</span>
            }</div>
          </Col>
          <Col className="align-self-center mr-n3" md="auto">
            <Row>
              <Col className="">
                <Button type="button" variant="light" className="username" aria-label="Docs" title="Documentation" href="https://ails-lab.github.io/SAGE_Documentation" target="_blank" rel="noopener noreferrer">
                  <i className="fa fa-book fa-lg mr-2"></i>
                </Button>
              </Col>
            </Row>
          </Col>
          {/*
          {this.props.user && this.props.user.type === "EDITOR" &&
            <React.Fragment>
              <Col className="mybutton align-self-center" md="auto">
                <Row>
                  <Col className="px-2">
                    <Button type="button" variant="light" className="username" aria-label="Manage" href="/manage">
                      <div>MANAGE</div>
                    </Button>
                  </Col>
                </Row>
              </Col>
              <Col className="mybutton align-self-center mr-3" md="auto">
                <Row>
                  <Col className="px-2">
                    <Button type="button" variant="light" className="username" aria-label="Manage" href="/search">
                      <div>SEARCH</div>
                    </Button>
                  </Col>
                </Row>
              </Col>
            </React.Fragment>
          }*/}
          {/*<Col md="auto" className="align-self-center pr-2">
            <DropdownButton id="language-selector" variant="text" title={this.selectedLanguage} alignRight>
              <Dropdown.Item onClick={() => this.props.actions('change-language', { language: 'en' })}>
                English
              </Dropdown.Item>
              <Dropdown.Item onClick={() => this.props.actions('change-language', { language: 'el' })}>
                Ελληνικά
              </Dropdown.Item>
            </DropdownButton>
          </Col>*/}
          {this.props.user &&
            <Dropdown className="align-self-center mr-2">
              <Dropdown.Toggle variant="light" id="user-button" className="py-0">
                <div className="username align-self-center row">
                  <i className="user-icon fa fa-user-circle" aria-hidden="true"></i>
                  {this.props.user.email}
                </div>
              </Dropdown.Toggle>
              <Dropdown.Menu bsPrefix="dropdown-menu ml-n1">
                <Dropdown.Item className="py-2">
                  <div>
                    <i className="fa fa-user fa-lg mr-2" aria-hidden="true"></i>
                    <span className="ml-1"  onClick={() => this.props.actions('profile')}>Profile</span>
                  </div>
                </Dropdown.Item>

                {this.props.user.roles && this.props.user.roles.length > 1 &&
                  <Dropdown.Item className="py-2" onClick={() => this.props.actions('switch-role')}>
                  <div>
                    <i className="fa fa-repeat fa-lg mr-2" aria-hidden="true"></i>
                    <span>Switch role</span>
                  </div>
                </Dropdown.Item>}

                <Dropdown.Item className="py-2" onClick={() => this.props.actions('sign-button-action')}>
                  <div>
                    <i className="fa fa-sign-out fa-lg mr-2" aria-hidden="true"></i>
                    <span>Logout</span>
                  </div>
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          }
          {!this.props.user &&
            <Col className="mybutton align-self-center" md="auto">
              <Row>
                <Col className="px-0">
                  <Button type="button" variant="light" className="username" aria-label="Sign In" onClick={() => this.props.actions('sign-button-action')}>
                    <div>
                      <i className="fa fa-sign-in fa-lg mr-2" aria-hidden="true"></i>
                      Login
                    </div>
                  </Button>
                </Col>
              </Row>
            </Col>
          }
        </Row>
      </Container>
    )
  }
}

export default Header
