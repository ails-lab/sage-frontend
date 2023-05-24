import React, { Component } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";
import BootstrapSwitchButton from 'bootstrap-switch-button-react'

export class PublishModal extends Component {
  constructor(props) {
    super(props);

    this.state = {
      show: this.props.show,
      error: false,

      privat: this.props.value ? !this.props.value.public : true
    }

    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleSubmit(event) {
    event.preventDefault();
    this.props.onOK(this.props.visibility ? this.state.privat : false, this.tripleStore ? this.tripleStore.value : null);
  }

  render() {
    var button;
    if (this.props.allowPublic) {
      button = <BootstrapSwitchButton
        checked={this.props.value ? !this.props.value.public : this.state.privat}
        onlabel='Private'
        onstyle='danger'
        offlabel='Public'
        offstyle='success'
        style='w-100'
        onChange={(checked: boolean) => {
            this.setState({ privat: checked })
        }}/>
    } else {
      button = <BootstrapSwitchButton
        checked={this.state.privat}
        onlabel='Private'
        onstyle='danger'
        offlabel='Public'
        offstyle='success'
        style='w-100'
        disabled
        onChange={(checked: boolean) => {
            this.setState({ privat: checked })
        }}/>
    }

    return (
      <Modal show={this.props.show} onHide={this.props.onClose} animation={false} backdrop="static">
        <Form onSubmit={this.handleSubmit}>
          <Modal.Header>
            <Modal.Title>Publish Dataset</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group>
              <Form.Label>Dataset</Form.Label>
              <Form.Control disabled value={this.props.value.name}/>
            </Form.Group>
            {this.props.visibility && <Form.Group>
              <Form.Label>Visibility</Form.Label>
              {button}
            </Form.Group>}
            {this.props.tripleStores.length > 1 && <Form.Group>
              <Form.Label>Triple store</Form.Label>
              <Form.Control as="select" ref={node => (this.tripleStore = node)}
                defaultValue={this.props.value && this.props.value.tripleStore ? this.props.value.tripleStore : ""}>
                {this.props.tripleStores.map((entry, index) =>
                  <option key={index} value={entry}>{entry}</option>)}
              </Form.Control>
            </Form.Group>}
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

export default PublishModal;
