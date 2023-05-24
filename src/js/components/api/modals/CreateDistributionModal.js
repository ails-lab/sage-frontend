import React, { Component } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Dropdown from "react-bootstrap/Dropdown";
import DropdownButton from "react-bootstrap/DropdownButton";
import ReactTooltip from "react-tooltip";
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';
import { filterByLanguage } from "../../../utils/functions.js";
import { getDatasetSchemaClasses } from "../../../utils/DatasetAPI.js";
import BootstrapSwitchButton from 'bootstrap-switch-button-react'

export class CreateDistributionModal extends Component {
  constructor(props) {
    super(props);

    this.state = {
      show: this.props.show,
      state: false,
      error: false,

      validated: false
    }

    this.getSchema();

    this.handleSubmit = this.handleSubmit.bind(this);
  }

  formIsValid() {
    return (this.ttl.checked === true || this.nt.checked === true)
  }

  handleSubmit(event) {
    event.preventDefault();

    if (this.formIsValid()) {
      this.props.onOK(this.state.classes, this.ttl.checked, this.nt.checked, this.serializationVocabulary.value, 'ZIP', this.license.value)
    }
 }


//setValidated(true);

     //this.props.onOK(this.props.campaign ? this.props.campaign.id : null, this.name.value, this.state.state ? 'INACTIVE' : 'ACTIVE');


  getSchema() {
    getDatasetSchemaClasses(this.props.dataset.id)
       .then(response => {
          this.setState( { classes: response.map(e => e.class) })
       })
       .catch(error => {
         // this.throwToast('error', error.message)
       })
  }

  moveDown(i) {
    var newClasses = this.state.classes.slice();
    var element = newClasses[i];

    newClasses.splice(i, 1)
    newClasses.splice(i + 1, 0, element)

    this.setState({classes : newClasses})
  }

  moveUp(i) {
    var newClasses = this.state.classes.slice();
    var element = newClasses[i];

    newClasses.splice(i, 1)
    newClasses.splice(i - 1, 0, element)

    this.setState({classes : newClasses})
  }

  render() {


    return (
      <Modal show={this.props.show} onHide={this.props.onClose} animation={false} backdrop="static">
        <Form onSubmit={this.handleSubmit}>
          <Modal.Header>
            <Modal.Title>Create distribution</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group>
              <Form.Label>Classes export order in distribution</Form.Label>
              {this.state.classes && this.state.classes.map((clazz, index) => (
                <Row key={index}>
                  <Col md={10}>
                    {clazz}
                  </Col>
                  <Col md={1}>
                    {index > 0 &&
                      <span className="menu-icon fa fa-arrow-up mr-3" onClick={() =>  this.moveUp(index) }/>
                    }
                  </Col>
                  <Col md={1}>
                    {index < this.state.classes.length - 1 &&
                      <span className="menu-icon fa fa-arrow-down mr-3"  onClick={() =>  this.moveDown(index) } />
                    }
                  </Col>
                </Row>))}
            </Form.Group>

            <Form.Group>
              <Form.Label className="required">Serializations</Form.Label>
              <Form.Check label="Turtle" ref={node => (this.ttl = node)}/>
              <Form.Check label="N-Triples" ref={node => (this.nt = node)}/>
            </Form.Group>
            <Form.Control.Feedback type="invalid">
              Select a serialization
            </Form.Control.Feedback>

            <Form.Group>
              <Form.Label className="required">Serialization Vocabulary</Form.Label>
              <Form.Control as="select" ref={node => (this.serializationVocabulary = node)}>
                <option key="eu" value="eu_contolled_vocabularies">EU Controlled Vocabularies</option>)}
                <option key="w3c" value="w3c">W3C</option>)}
              </Form.Control>
            </Form.Group>

            <Form.Group>
              <Form.Label className="required">Compression format</Form.Label>
              <Form.Check type='radio' ref={node => (this.zip = node)}
                          label="ZIP" checked={true}/>
            </Form.Group>

            <Form.Group>
              <Form.Label>License</Form.Label>
              <Form.Control ref={node => (this.license = node)}/>
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

export default CreateDistributionModal;
