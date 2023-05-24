import React, { Component } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";
import ReactTooltip from "react-tooltip";
import Tooltip from 'react-bootstrap/Tooltip';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import { DropdownButton, Dropdown } from "react-bootstrap";
import { getApiKeys, getTemplate } from '../../../utils/TemplateAPI';

export class NewBindingModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      api_keys: [],

    }
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleSubmit(event) {
    event.preventDefault();

    this.props.onOK(this.props.mappingId, this.props.instance ? this.props.instance.id : null, this.props.parameters.map(param => { return { name: param, value: this[param].value } }));
  }

  getApiKeys() {
    getApiKeys().then(response => {
      this.setState({ api_keys: response })
    })
  }

  api_keySelected(api_key, param){
    this[param].value = api_key.templateString

  }

  api_keyHandler(param) {
    if (param === "API_KEY") {
      return (
        <React.Fragment>
          <OverlayTrigger
            key="overlay-info"
            placement="right"
            delay={150}
            overlay={<Tooltip id="tooltip-info"><span>Click here to get your own Europeana API key.<br/>Then store it in your profile for easy access.</span></Tooltip>}
          >
            <a className="green fa fa-info-circle ml-2" href="https://pro.europeana.eu/page/get-api" target="_blank" />
          </OverlayTrigger>
          <DropdownButton title="Load key" variant="outline-primary" className="float-right mb-2" size="sm" onClick={() => this.getApiKeys()}>
            {this.state.api_keys.map((el, index) => (
              <React.Fragment key={"api-key-" + index}>
                <Dropdown.Item data-tip={el.templateString} data-effect="solid" data-place="right" onClick={() => this.api_keySelected(el, param)}>
                  {el.name}
                </Dropdown.Item>
                <ReactTooltip delay={150} />
              </React.Fragment>
            ))
            }
          </DropdownButton>
        </React.Fragment>
      )
    }
    else return null

    return (
      <Form.Label>{param}</Form.Label>
    )
  }

  findValue(instance, parameter) {
    if (instance) {
      var r = instance.binding.filter(e => e.name === parameter)
      if (r.length > 0) {
        return r[0].value;
      }
    }
  }

  render() {
    return (
      <Modal show={this.props.show} onHide={this.props.onClose} animation={false} backdrop="static">
        <Form onSubmit={this.handleSubmit}>
          <Modal.Header>
            <Modal.Title>Define parameters</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {this.props.parameters.map((param, index) =>
              <Form.Group key={index}>
                <Form.Label>{param}</Form.Label>
                {this.api_keyHandler(param)}
                <Form.Control ref={node => (this[param] = node)}
                  defaultValue={this.findValue(this.props.instance, param)}
                  required/>
              </Form.Group>)}
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
    )
  }
}

export default NewBindingModal;
