import React, { Component } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";

export class DeleteModal extends Component {
  constructor(props) {
    super(props);

    this.state = {
      show: this.props.show,
    }
  }

  render() {
    return (
      <Modal show={this.props.show} onHide={() => this.props.actions('cancel', this.props.command, this.props.params)} animation={false} backdrop="static">
        <Form onSubmit={this.handleSubmit}>
          <Modal.Header>
            <Modal.Title>Confirm Delete</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            Are you sure you want to delete this item?
          </Modal.Body>
          <Modal.Footer>
            <Button variant="primary" onClick={() => this.props.actions('ok', this.props.command, this.props.params)}>
              OK
            </Button>
            <Button variant="secondary" onClick={() => this.props.actions('cancel', this.props.command, this.props.params)}>
              Cancel
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
  )}
}

export default DeleteModal;
