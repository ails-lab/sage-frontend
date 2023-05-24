import React, { Component } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";

import { filterByLanguage } from "../../../utils/functions.js";

export class NewAlignmentModal extends Component {
  constructor(props) {
    super(props);

    this.state = {
      show: this.props.show,
      error: false

    }
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleSubmit(event) {
    event.preventDefault();
    // console.log(this.name.value);
    // // console.log(this.type.value);
    // console.log(this.source.value);
    // console.log(this.target.value);

    this.props.onOK(null, this.name.value, 'http://sw.islab.ntua.gr/semaspace/model/Alignment', this.source.value, this.target.value);
  }

  render() {
    return (
      <Modal show={this.props.show} onHide={this.props.onClose} animation={false} backdrop="static">
        <Form onSubmit={this.handleSubmit}>
          <Modal.Header>
            <Modal.Title>New {this.props.type}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group>
              <Form.Label>Name</Form.Label>
              <Form.Control ref={node => (this.name = node)}
                   onChange={() => this.setState({ error: false })}
                   pattern="\S.*"
                   required/>
            </Form.Group>
            <Form.Control.Feedback type="invalid">
              Provide a valid name.
            </Form.Control.Feedback>
            {this.props.vocabularies &&
            <Form.Group>
              <Form.Label>Source</Form.Label>
              <Form.Control as="select" ref={node => (this.source = node)}
                   defaultValue='' required>
                   <option hidden disabled value=''> -- Select type -- </option>
                   {this.props.vocabularies.map((el, index) =>
                      <option key={index} value={el['@id']}>{filterByLanguage(el  ,'http://www.w3.org/2000/01/rdf-schema#label', 'el')}</option>)}
              </Form.Control>
            </Form.Group>}
            {this.props.vocabularies &&
            <Form.Group>
              <Form.Label>Target</Form.Label>
              <Form.Control as="select" ref={node => (this.target = node)}
                   defaultValue='' required>
                   <option hidden disabled value=''> -- Select type -- </option>
                   {this.props.vocabularies.map((el, index) =>
                      <option key={index} value={el['@id']}>{filterByLanguage(el  ,'http://www.w3.org/2000/01/rdf-schema#label', 'el')}</option>)}
              </Form.Control>
            </Form.Group>}


{/*            <Form.Group>
              <Form.Label>Type</Form.Label>
              <Form.Control as="select" ref={node => (this.type = node)}
                      onChange={() => this.setState({ error: false })}
                      isInvalid={false}>
                  <option hidden disabled value=''> -- Select a type -- </option>
                  <option value="data-collection">Data Collection Mapping</option>
              </Form.Control>
            </Form.Group> */}
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

export default NewAlignmentModal;
