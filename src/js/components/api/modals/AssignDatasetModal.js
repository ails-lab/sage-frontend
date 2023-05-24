import React, { Component } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";
import Dropdown from "react-bootstrap/Dropdown";
import DropdownButton from "react-bootstrap/DropdownButton";
import ReactTooltip from "react-tooltip";
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';
import { filterByLanguage } from "../../../utils/functions.js";
import { checkDatasetIdentifier } from "../../../utils/DatasetAPI.js";
import BootstrapSwitchButton from 'bootstrap-switch-button-react'

export class AssignDatasetModal extends Component {
  constructor(props) {
    super(props);

    this.state = {
      show: this.props.show,
    }

    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleSubmit(event) {
     event.preventDefault();

    this.props.onOK(this.dataset.value)
 }

  render() {
    return (
      <Modal show={this.props.show} onHide={this.props.onClose} animation={false} backdrop="static">
        <Form onSubmit={this.handleSubmit}>
          <Modal.Header>
            <Modal.Title>Assign dataset</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group>
              <Form.Label>Dataset</Form.Label>
              <Form.Control as="select" ref={node => (this.dataset = node)}
                defaultValue=''
                required>
                <option hidden disabled value=''> -- Select a dataset -- </option>
                   <option key={0} value={'ALL'} className="crimson-std">All datasets</option>
                  {this.props.datasets.map((el, index) =>
                    <option key={index + 1} value={el.dataset['@id']}>{filterByLanguage(el.dataset, 'http://purl.org/dc/terms/title', 'el')}</option>
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

export default AssignDatasetModal;
