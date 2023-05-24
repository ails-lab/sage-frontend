import { API_BASE_URL } from '../../../constants/index.js';
import React, { Component } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";

import { convert, adjustSchemaMapping, adjustContentMapping, d2rml, d2rmlop } from '../../../utils/D2RMLUtils';
import { validateD2RML } from '../../../utils/D2RMLAPI';

export class NewMappingUploadModal extends Component {
  constructor(props) {
    super(props);

    var p = [];

    if (props.templates && props.mapping && props.mapping.templateId) {
      var template = props.templates.find(el => el.id == props.mapping.templateId)
      if (template.parameters) {
        p = template.parameters.map(e => e.name)
      }
    }


    this.state = {
      error: false,
      invalidFile: false,
      invalidFileMessage: null,

      file: null,
      json: null,
      templateId: props.mapping ? props.mapping.templateId : null,

      parameters: p,
    }

    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleSubmit(event) {
    event.preventDefault();

    if (!this.state.invalidFile) {
      this.props.onOK(this.props.mapping ? this.props.mapping.id : null, this.name.value, this.state.json, this.state.file, this.state.parameters, this.template && this.template.value.length > 0 ? this.template.value : null);
    }
  }

  // addParameter() {
  //   var parameters = this.state.parameters.slice();
  //   parameters.push('')
  //   this.setState({parameters})
  // }

  // parameterChange(event, index) {
  //   var parameters = this.state.parameters.slice(0,index).concat([event.target.value]).concat(this.state.parameters.slice(index+1))
  //   this.setState({parameters})
  // }

  fileChange(event) {
      var files = event.target.files; // FileList object
      this.setState({file : event.target.files[0]});

      var _this = this;
      var reader = new FileReader();
      reader.onload = function(event) {
        var ttl = event.target.result;

        validateD2RML(ttl)
          .then(response => {
             _this.setState({ parameters: response.parameters ? response.parameters : [], invalidFile: false, invalidFileMessage: null })
           })
          .catch(error => {
             _this.setState({ invalidFile: true, invalidFileMessage: error.message })
          })
      }

    reader.readAsText(files[0]);

    if (this.template) {
      this.template.value = '';
    }
  }

  templateChanged() {
    var p = [];

    if (this.template.value && this.props.templates) {
      var template = this.props.templates.find(el => el.id == this.template.value)
      if (template.parameters) {
        p = template.parameters.map(e => e.name)
      }
    }

    this.setState({ file: null, invalidFile: false, invalidFileMessage:null, parameters: p, templateId: this.template.value == '' ? null : this.template.value })
    if (this.fileInput) {
      this.fileInput.value = "";
    }
  }

  render() {

    return (
      <Modal show={this.props.show} onHide={this.props.onClose} animation={false} backdrop="static">
        <Form onSubmit={this.handleSubmit}>
          <Modal.Header>
            <Modal.Title>{this.props.mapping ? 'Edit' : 'New'} {this.props.type === 'CONTENT'? 'data mapping' : (this.props.type === 'HEADER' ? 'metadata mapping' : 'Prefix File')}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group>
              <Form.Label className="required">Name</Form.Label>
              <Form.Control placeholder="Name" ref={node => (this.name = node)}
                   onChange={() => this.setState({ error: false })}
                   pattern="\S.*"
                   defaultValue={this.props.mapping ? this.props.mapping.name : ""}
                   required/>
            </Form.Group>
            <Form.Control.Feedback type="invalid">
              Please provide a valid name.
            </Form.Control.Feedback>

            {this.props.templates && this.props.templates.length > 0 &&
              <Form.Group>
                <Form.Label>Template mapping</Form.Label>
                <Form.Control as="select" ref={node => (this.template = node)}
                  defaultValue={this.state.templateId ? this.state.templateId : null}
                  disabled={this.props.mapping}
                  onChange={() => this.templateChanged()}>
                  <option key='0' value=''>(upload D2RML document)</option>
                  {this.props.templates.map((el, index) =>
                    <option key={index + 1} value={el.id}>{el.name}</option>
                  )}
                </Form.Control>
            </Form.Group>}
            {!this.state.templateId &&
            <Form.Group>
              <Form.Label>D2RML document</Form.Label>
              <Form.Control type="file" ref={node => (this.fileInput = node)}
                            onChange={(event) => this.fileChange(event)}
                            isInvalid={this.state.invalidFile}/>
              <Form.Control.Feedback type="invalid">
                {this.state.invalidFileMessage}
              </Form.Control.Feedback>
            </Form.Group>}

            {this.props.type !== 'PREFIX' && this.state.parameters && this.state.parameters.length > 0 &&
              <Form.Group className={"mt-4 " + (this.state.parameters && this.state.parameters.length > 0 ? "groupborder" : "groupborder-empty")}>
                <Row className={"m-0 " + (this.state.parameters && this.state.parameters.length > 0 ? "header" : "header-empty")}>
                  <Col>Parameters</Col>
                  {/*<Col md="auto">
                    <Button type="button" className="menubutton" onClick={()=> this.addParameter()}><span className='fa fa-plus'></span></Button>}
                  </Col>*/}
                </Row>
                {this.state.parameters.map((el,index) =>
                  <Row className="grouping" key={index}>
                    <Col>
                      {/*<Form.Control value={el} disabled={true} onChange={(event) => this.parameterChange(event, index)}/>*/}
                      <Form.Control value={el} disabled={true}/>
                    </Col>
                  </Row>)}
              </Form.Group>}
          </Modal.Body>
          <Modal.Footer>
            <Button type="submit" variant="primary">
              OK
            </Button>
            <Button variant="secondary" onClick={() => {this.setState({error: false, invalidFile: false, invalidFileMessage: null, json: null, parameters: []}); this.props.onClose()}}>
              Cancel
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
  )}
}

export default NewMappingUploadModal;
