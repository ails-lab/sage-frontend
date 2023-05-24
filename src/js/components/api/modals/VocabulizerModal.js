import React, { Component } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";


export class VocabulizerModal extends Component {
  constructor(props) {
    super(props);

    this.state = {
      annotator: null
    }

    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleSubmit(event) {
    event.preventDefault();
    // console.log(this.thesaurus.value);
    // console.log(this.state.annotator);

    this.props.onOK(this.name.value, this.separator.value);
  }



  render() {
    return (
      <Modal show={this.props.show} onHide={this.props.onClose} animation={false} backdrop="static">
        <Form onSubmit={this.handleSubmit}>
          <Modal.Header>
            <Modal.Title>New Vocabulzier</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group>
              <Form.Label>Name</Form.Label>
              <Form.Control ref={node => (this.name = node)}>
              </Form.Control>
            </Form.Group>
            <Form.Group>
              <Form.Label>Separator</Form.Label>
              <Form.Control ref={node => (this.separator = node)}>
              </Form.Control>
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

export default VocabulizerModal;
