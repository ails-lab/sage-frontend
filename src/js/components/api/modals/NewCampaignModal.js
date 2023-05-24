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

export class NewCampaignModal extends Component {
  constructor(props) {
    super(props);

    this.state = {
      show: this.props.show,
      state: false,
      error: false,
    }

    this.handleSubmit = this.handleSubmit.bind(this);
  }


  handleSubmit(event) {
     event.preventDefault();

      this.props.onOK(this.props.campaign ? this.props.campaign.id : null, this.name.value, this.state.state ? 'INACTIVE' : 'ACTIVE');
  }

  render() {
    console.log(this.props.campaign)
    var button = <BootstrapSwitchButton
        checked={this.props.campaign && this.props.campaign.state ? (this.props.campaign.state === 'ACTIVE' ? false : true) : true}
        onlabel='Inactive'
        onstyle='danger'
        offlabel='Active'
        offstyle='success'
        style='w-100'
        onChange={(checked: boolean) => {
            this.setState({ state: checked })
        }}/>


    return (
      <Modal show={this.props.show} onHide={this.props.onClose} animation={false} backdrop="static">
        <Form onSubmit={this.handleSubmit}>
          <Modal.Header>
            <Modal.Title>{!this.props.dataset ? 'Create' : 'Edit'} {this.props.type}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group>
              <Form.Label className="required">Name</Form.Label>
              <Form.Control ref={node => (this.name = node)}
                   onChange={() => this.setState({ error: false })}
                   pattern="\S.*"
                   defaultValue={this.props.campaign ? this.props.campaign.name : ""}
                   required/>
            </Form.Group>
            <Form.Control.Feedback type="invalid">
              Provide a valid name.
            </Form.Control.Feedback>
            <Form.Group>
              <Form.Label>State</Form.Label>
              {button}
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={this.props.onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              OK
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
  )}
}

export default NewCampaignModal;
