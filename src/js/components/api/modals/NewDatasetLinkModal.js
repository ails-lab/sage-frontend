import React, { Component } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";

export class NewDatasetLinkModal extends Component {
  constructor(props) {
    super(props);

    this.state = {
      show: this.props.show,
      error: false,

      selected: ''
    }

    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleSubmit(event) {
    event.preventDefault();
    this.props.onOK(this.state.selected);
  }

  render() {
    return (
      <Modal show={this.props.show} onHide={this.props.onClose} animation={false} backdrop="static">
        <Form onSubmit={this.handleSubmit}>
          <Modal.Header>
            <Modal.Title>Add Dataset</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group>
              <Form.Label>Datasets</Form.Label>
              <Form.Control as="select" value={this.state.selected}
                            onChange={(event) => this.setState({ selected: event.target.value})}>
                <option disabled value=''> -- Select a dataset -- </option>
                {this.props.datasets.map((el,index) =>
                  <option key={index} value={el.id} on>{el.name}</option>
                )}
                <option disabled value=''> -- Select a vocabulary -- </option>
                {this.props.vocabularies.map((el,index) =>
                  <option key={index} value={el.id} on>{el.name}</option>
                )}

                <option disabled value=''> -- Select an alignment -- </option>
                {this.props.alignments.map((el,index) =>
                  <option key={index} value={el.id} on>{el.name}</option>
                )}
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

export default NewDatasetLinkModal;
