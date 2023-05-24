import {useState} from 'react';
import React, { Component } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Multiselect from 'multiselect-react-dropdown';

import { validateCronExpression } from "../../../utils/UserTasksAPI"
import { throwToast } from '../../../utils/UIUtils';
import { copyReplaceAt } from '../../../utils/functions.js'

export class UserTaskModal extends Component {
  constructor(props) {
    super(props);

    this.state = {
      show: this.props.show,
      error: false,
      tasks: []
    }

    this.tasks = [];
    this.taskList = [ {label: 'Execute all mappings', value:'DATASET_MAPPINGS_EXECUTE'}, {label: 'Republish dataset', value:'DATASET_REPUBLISH'}, {label: 'Recreate all indices', value:'DATASET_RECREATE_INDEXES'} ]

    this.complete(props);

    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleSubmit(event) {
    event.preventDefault();

    if (!this.state.validCronExpression) {
      return false;
    }

    if (!this.name.value) {
      return false;
    }

    var t = [];

    for (var i in this.state.tasks) {
      t.push(this.state.tasks[i].type);
    }

    if (t.length == 0) {
      return null;
    }

    this.props.onOK(this.props.userTask ? this.props.userTask.id : null, this.name.value, t, this.cronExpression.value);
  }

  componentDidMount() {
    this.complete(this.props)
  }

  complete(props) {
    var tasks = props.userTask ? props.userTask.tasks : [];

    this.setState({ tasks: tasks,  validCronExpression: true }, () => {
      for (var i in tasks)  {
        this.tasks[i].value = tasks[i].type
      }
    })
  }

  addTask() {
    this.setState({ tasks: this.state.tasks.slice().concat('')});
  }

  deleteTask(index) {
    this.setState({ tasks: this.state.tasks.slice(0, index).concat(this.state.tasks.slice(index + 1)) },
      () => {
      for (var i in this.state.tasks)  {
        this.tasks[i].value = this.state.tasks[i].type
      }})
  }

  taskChanged(index, event) {
    this.setState(copyReplaceAt('tasks', this.state.tasks, index, { type: event.target.value}))
  }

  cronExpressionChanged(event) {
    validateCronExpression(event.target.value)
    .then(() => { this.setState( {validCronExpression : true } ) })
    .catch(() => { this.setState( {validCronExpression : false }) })
  }

  render() {

    return (
      <Modal show={this.props.show} onHide={this.props.onClose} animation={false} backdrop="static" size="m" >
        <Form onSubmit={this.handleSubmit}>
          <Modal.Header>
            <Modal.Title>User task</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group>
              <Form.Label>Name</Form.Label>
              <Form.Control ref={node => (this.name = node)}
                            defaultValue={this.props.userTask ? this.props.userTask.name : ""}/>
            </Form.Group>

            <Row className="tableheader mb-3" />

            <Form.Group className="mb-0">
              <Form.Label className="bold">Tasks</Form.Label>
              <Button type="button" className="deleteaddbutton" aria-label="New" onClick={(event) => this.addTask()}><span className="fa fa-plus"></span></Button>
            </Form.Group>

            {this.state.tasks.map((el, index) =>
              <Row key={index}>
              <Col md="auto">
                <span className="bold">{index + 1}</span>
              </Col>
                <Col>
                  <Form.Group>
                    <Form.Label className="required">Task</Form.Label>
                    <Form.Control as="select"
                      ref={node => (this.tasks[index] = node)}
                      onChange={(event) => this.taskChanged(index, event)}
                      defaultValue={el} required>
                      <option disabled value=''> -- Select a task -- </option>
                      {this.taskList.map((el2, index2) =>
                        <option key={index2} value={el2.value}>{el2.label}</option>
                      )}
                    </Form.Control>
                  </Form.Group>
                </Col>
                <Col md="auto">
                  <Button type="button" className="deleteeditbutton" aria-label="New" onClick={(event) => this.deleteTask(index)}><span className="fa fa-times"></span></Button>
                </Col>

              </Row>)}

              <Form.Group>
                <Form.Label>Schedule</Form.Label>
                <Form.Control ref={node => (this.cronExpression = node)}
                              onChange={(event) => this.cronExpressionChanged(event)}
                              isInvalid={this.cronExpression && this.cronExpression.value && !this.state.validCronExpression}
                              defaultValue={this.props.userTask ? this.props.userTask.cronExpression : ""}/>
              </Form.Group>



          </Modal.Body>
          <Modal.Footer>
            <Button type="submit" variant="primary">
              OK
            </Button>
            <Button variant="secondary" onClick={this.props.onClose}>
              Cancel
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
  )}
}


export default UserTaskModal;
