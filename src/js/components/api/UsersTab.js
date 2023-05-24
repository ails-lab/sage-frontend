import React, { Component } from "react";
import Container from "react-bootstrap/Container";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import Button from "react-bootstrap/Button";
import Collapse from "react-bootstrap/Collapse";
import Form from "react-bootstrap/Form";

import { getUsers, getUserInfo, updateUserRoles } from '../../utils/UsersAPI.js';
import { throwToast, actionsMenu, toggleBoxColumn, sortByField } from '../../utils/UIUtils';

export class UsersTab extends Component {
  constructor(props) {
    super(props);
    this.state = {
      users: null,
      selectedUser: null,

      usersOpen: true,

      roleChanged: false,
    };
  }

  getUsers() {
    getUsers()
      .then(response => {
        this.setState({ users: response.sort((a,b) => sortByField('name', a, b)) });
      })
      .catch(error => {
        console.error(error);
      });
  }

  getUserInfo(user) {
    var _this = this;
    getUserInfo(user.id)
      .then(response => {
        this.setState({ selectedUser: response, roleChanged: false },
          () => {
            if (_this.state.selectedUser.roles) {
              _this.administrator.checked = _this.state.selectedUser.roles.includes('ADMINISTRATOR')
              _this.editor.checked = _this.state.selectedUser.roles.includes('EDITOR')
              _this.validator.checked = _this.state.selectedUser.roles.includes('VALIDATOR')
            } else {
              _this.administrator.checked = false
              _this.editor.checked = false
              _this.validator.checked = false
            }
          }
        );
      })
      .catch(error => {
        throwToast('error', error.message)
      });
  }

  saveSelectedUserRoles() {
    var newRoles = [];

    if (this.administrator.checked) {
      newRoles.push('ADMINISTRATOR')
    }
    if (this.editor.checked) {
      newRoles.push('EDITOR')
    }
    if (this.validator.checked) {
      newRoles.push('VALIDATOR')
    }

    updateUserRoles(this.state.selectedUser.id, newRoles)
      .then(response => {
         this.setState({ roleChanged: false })
         throwToast('success', response.message)
      })
      .catch(error => {
        throwToast('error', error.message)
      })
  }

  componentDidMount() {
    this.getUsers();
  }

  executeAction(action, params) {
    if (action === 'select-user') {
      // this.setState({ selectedUser: params.user })
      this.getUserInfo(params.user)
    }
  }

  roleChanged() {
    if (this.state.selectedUser.roles) {
      this.setState({ roleChanged: this.editor.checked != this.state.selectedUser.roles.includes('EDITOR') || this.administrator.checked != this.state.selectedUser.roles.includes('ADMINISTRATOR') || this.validator.checked != this.state.selectedUser.roles.includes('VALIDATOR') })
    } else {
      this.setState({ roleChanged: this.editor.checked || this.administrator.checked || this.validator.checked })
    }
  }

  render() {

    return (
      <Container className="pl-2">
        <Row>

          <Col md={3}>
            <Container className={this.state.users && this.state.users.length > 0 ? "groupborder" : "groupborder-empty"}>
              <Row className={this.state.users && this.state.users.length > 0 ? "header" : "header-empty"}>
                <Col>
                  Users
                </Col>

                {toggleBoxColumn('usersOpen', this, 'users')}
              </Row>

              <Collapse in={this.state.usersOpen}>
                <div>
                  {this.state.users && this.state.users.map((user, index) => (
                  <Row key={"user-" + index}>
                    <Col md={12} className={this.state.selectedUser && this.state.selectedUser === user.email? " selected-item" : ""}>
                      <span className="lbutton alink" onClick={() => this.executeAction('select-user', { user: user })}>
                      {user.name}
                      </span>
                    </Col>
                  </Row>))}
                </div>
              </Collapse>

            </Container>
          </Col>

          <Col md={9}>
            <Container className="userspace-right">
              <Row className="userspace-right-inner">
                <Col>

                  {this.state.selectedUser &&
                  <Container className="groupborder">
                    <Row className="header">
                      <Col>
                        <span className="crimson-std">User:</span> {this.state.selectedUser.name}
                      </Col>
                    </Row>

                    <Row className="object-field-row">
                      <Col md={3}>
                        Name
                      </Col>
                      <Col md={9}>
                        {this.state.selectedUser.name}
                      </Col>
                    </Row>

                    <Row className="object-field-row">
                      <Col md={3}>
                        Email
                      </Col>
                      <Col md={9}>
                        {this.state.selectedUser.email}
                      </Col>
                    </Row>

                    <Row className="object-field-row">
                      <Col md={3}>&nbsp;</Col>
                    </Row>

                    <Row className="object-field-row">
                      <Col md={3}>
                        Roles
                      </Col>
                      <Col md={9}>
                        <Row className="ml-1">
                          <Form.Check label="Administrator" ref={node => (this.administrator = node)}
                                      disabled={true}
                                      />
                        </Row>
                        <Row className="ml-1">
                          <Form.Check label="Editor" ref={node => (this.editor = node)}
                                      onClick={() => this.roleChanged()}
                                      />
                        </Row>
                        <Row className="ml-1">
                          <Form.Check label="Validator" ref={node => (this.validator = node)}
                                      onClick={() => this.roleChanged()}
                                      />
                        </Row>

                        {/*this.state.selectedUser.roles ? this.state.selectedUser.roles.join(", ") : ""*/}
                      </Col>
                    </Row>

                    <Row className="object-field-row">
                      <Col md={3}>&nbsp;</Col>
                    </Row>

                    {this.state.selectedUser.roles && this.state.selectedUser.roles.includes('EDITOR') &&
                    <Row className="object-field-row">
                      <Col md={3}>
                        Dataset count
                      </Col>
                      <Col md={9}>
                        {this.state.selectedUser.datasetCount}
                      </Col>
                    </Row>}

                    {this.state.selectedUser.roles && this.state.selectedUser.roles.includes('VALIDATOR') &&
                    <Row className="object-field-row">
                      <Col md={3}>
                        Accepted annotations count
                      </Col>
                      <Col md={9}>
                        {this.state.selectedUser.annotationEditAcceptCount}
                      </Col>
                    </Row>}

                    {this.state.selectedUser.roles && this.state.selectedUser.roles.includes('VALIDATOR') &&
                    <Row className="object-field-row">
                      <Col md={3}>
                        Rejected annotations count
                      </Col>
                      <Col md={9}>
                        {this.state.selectedUser.annotationEditRejectCount}
                      </Col>
                    </Row>}

                    {this.state.selectedUser.roles && this.state.selectedUser.roles.includes('VALIDATOR') &&
                    <Row className="object-field-row">
                      <Col md={3}>
                        Added annotations count
                      </Col>
                      <Col md={9}>
                        {this.state.selectedUser.annotationEditAddCount}
                      </Col>
                    </Row>}

                    <Row className="object-field-row">
                      <Col md={3}>&nbsp;</Col>
                    </Row>

                    <Row className="object-field-row">
                      <Col md={3}>
                        Member in other databases
                      </Col>
                      <Col md={9}>
                        {this.state.selectedUser.inOtherDatabases + ''}
                      </Col>
                    </Row>

                    <Row className="object-field-row">
                      <Col md={3}>&nbsp;</Col>
                    </Row>

                    <Row className="object-field-row">
                      <Col md={12}>
                        <Button type="submit" variant="primary"
                                disabled={!this.state.roleChanged}
                                onClick={() => this.saveSelectedUserRoles()}>
                          Save
                        </Button>
                      </Col>
                    </Row>
                  </Container>}

                </Col>

              </Row>
            </Container>
          </Col>

        </Row>
    </Container>
    );
  }
}

export default UsersTab;
