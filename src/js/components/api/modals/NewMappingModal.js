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

export class NewMappingModal extends Component {
  constructor(props) {
    super(props);

    this.state = {
      show: this.props.show,
      error: false,
      identifierExists: false,
      class: null,
      privat: this.props.dataset ? !this.props.dataset.public : false,
      location: this.props.dataset && this.props.dataset.remoteTripleStore ? "REMOTE" : 'LOCAL'
    }

    this.handleSubmit = this.handleSubmit.bind(this);
  }

  existsDatasetIdentifier() {
    if (this.identifier.value) {
      checkDatasetIdentifier(this.identifier.value)
      .then(text => {
        if (text.exists) {
           this.setState( {identifierExists : true })
        } else
            this.setState( {identifierExists : false })
        })
      }
   }

   templateChanged() {
     this.setState({ template: this.props.templates.filter(el => el.id === this.template.value)[0] })
   }

  classChanged() {
    this.setState( { class : this.class.value })
  }

  locationChanged() {
    this.setState( { location : this.location.value })
  }

  formIsValid() {
    var ok = !(this.identifier && this.identifier.value && ((!this.props.dataset && this.state.identifierExists) || (this.props.dataset && this.state.identifierExists && this.props.dataset.identifier !== this.identifier.value)));
    if (!ok) {
      return ok;
    }

    if (this.state.location == 'REMOTE' && !this.sparqlEndpoint.value) {
      return false;
    }

    return ok;
  }

  handleSubmit(event) {
     event.preventDefault();

      if (this.formIsValid()) {

        var newTemplate = null;
        if (this.state.template) {
          var params = [];
          newTemplate = this.state.template;
          for (const i in this.state.template.parameters) {
            params.push({ name: this.state.template.parameters[i].name, value: this['template-parameter-' + this.state.template.parameters[i].name].value })
            newTemplate = {...this.state.template, parameters: params };
          }
        }

        this.props.onOK(this.props.dataset ? this.props.dataset.id : null,
                        newTemplate,
                        this.name.value,
                        this.identifier ? this.identifier.value : undefined,
                        this.props.visibility ? this.state.privat : false,
                        // this.tripleStore ? this.tripleStore.value : undefined,
                        this.type ? this.type.value : undefined,
                        this.property? this.property.value : undefined,
                        this.class ? this.class.value : undefined,
                        this.ontology ? this.ontology.value : undefined,
                        this.sparqlEndpoint ? this.sparqlEndpoint.value : undefined,
                        this.namedGraph ? this.namedGraph.value : undefined,
                      );
      }
  }

  render() {
    // console.log(this.props);
    // console.log(this.state.europeanaImportMethod)
    if (this.props.dataset) {
      var typeUri = '';
      if (this.props.types) {
        for (var i in this.props.types) {
           for (var j in this.props.dataset.typeUri) {
             if (this.props.types[i].uri === this.props.dataset.typeUri[j])  {
               typeUri = this.props.types[i].uri
             }
           }
         }
      }
    }

    var button = <BootstrapSwitchButton
        checked={this.props.dataset ? !this.props.dataset.public : this.state.privat}
        onlabel='Private'
        onstyle='danger'
        offlabel='Public'
        offstyle='success'
        style='w-100'
        onChange={(checked: boolean) => {
            this.setState({ privat: checked })
        }}/>

    var title = this.props.category ? this.props.category : this.props.type;

    return (
      <Modal show={this.props.show} onHide={this.props.onClose} animation={false} backdrop="static">
        <Form onSubmit={this.handleSubmit}>
          <Modal.Header>
            <Modal.Title>{!this.props.dataset ? 'New' : 'Edit'} {title.charAt(0).toUpperCase() + title.substr(1).toLowerCase()}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group>
              <Form.Label className="required">Name</Form.Label>
              <Form.Control ref={node => (this.name = node)}
                   onChange={() => this.setState({ error: false })}
                   pattern="\S.*"
                   defaultValue={this.props.dataset ? this.props.dataset.name : ""}
                   required/>
            </Form.Group>
            <Form.Control.Feedback type="invalid">
              Provide a valid name.
            </Form.Control.Feedback>

            <Form.Group>
              <Form.Label>Identifier</Form.Label>
              <Form.Control ref={node => (this.identifier = node)}
                   onChange={() => this.existsDatasetIdentifier()}
                   pattern="[0-9\-A-z]*"
                   isInvalid={this.identifier && this.identifier.value && ((!this.props.dataset && this.state.identifierExists) || (this.props.dataset && this.state.identifierExists && this.props.dataset.identifier !== this.identifier.value))}
                   defaultValue={this.props.dataset ? this.props.dataset.identifier : ""}/>
              <Form.Control.Feedback type="invalid">
                   Identifier already exists.
             </Form.Control.Feedback>
            </Form.Group>

            {this.props.visibility &&
            <Form.Group>
              <Form.Label className="required">Visibility</Form.Label>
              {button}
            </Form.Group>}

            {/*(this.props.type === "CATALOG" || this.props.type === "DATASET") && this.props.tripleStores.length > 1 &&
            <Form.Group>
              <Form.Label className="required">Triple store</Form.Label>
              <Form.Control as="select" ref={node => (this.tripleStore = node)}
                defaultValue={this.props.dataset && this.props.dataset.tripleStore ? this.props.dataset.tripleStore : ""}>
                {this.props.tripleStores.map((entry, index) =>
                  <option key={index} value={entry}>{entry}</option>)}
              </Form.Control>
            </Form.Group>*/}

            {(this.props.type === "CATALOG" || this.props.type === "DATASET") && !this.props.dataset && this.props.templates && this.props.templates.length > 0 &&
              <Form.Group>
                <Form.Label>Import template</Form.Label>
                <Form.Control as="select" ref={node => (this.template = node)}
                  defaultValue=''
                  onChange={() => this.templateChanged()}>
                  <option key='0' value=''>(no template)</option>
                  {this.props.templates.map((el, index) =>
                    <option key={index + 1} value={el.id}>{el.name}</option>
                  )}
                </Form.Control>
            </Form.Group>}

            {this.props.category && this.props.category == 'COLLECTION' &&
            <div>
              <Form.Group>
                <Form.Label className="required">Location</Form.Label>
                <Form.Control as="select" ref={node => (this.location = node)}
                              defaultValue={this.state.location}
                              onChange={() => this.locationChanged()}>
                              required>
                    <option value="LOCAL">Local</option>
                    <option value="REMOTE">Remote</option>
                  )}
                </Form.Control>
              </Form.Group>

              {this.state.location == 'REMOTE' &&
              <div>
                <Form.Group>
                  <Form.Label className="required">SPARQL Endpoint</Form.Label>
                  <Form.Control ref={node => (this.sparqlEndpoint = node)}
                       defaultValue={this.props.dataset.remoteTripleStore ? this.props.dataset.remoteTripleStore.sparqlEndpoint : ""}/>
                </Form.Group>

                <Form.Group>
                  <Form.Label>Named Graph</Form.Label>
                  <Form.Control ref={node => (this.namedGraph = node)}
                       defaultValue={this.props.dataset.remoteTripleStore && this.props.dataset.remoteTripleStore.namedGraph ? this.props.dataset.remoteTripleStore.namedGraph.join(", ") : ""}/>
                </Form.Group>
              </div>}
            </div>}

            {this.state.template && this.state.template.parameters && this.state.template.parameters.map((el, index) =>
              <Form.Group key={index}>
                <Form.Label className="required">{el.name} {el.label ? '(' + el.label + ')':''}</Form.Label>
                <Form.Control ref={node => (this['template-parameter-' + el.name] = node)}>
                </Form.Control>
              </Form.Group>
            )}

            {this.props.queryProperties &&
            <Form.Group>
              <Form.Label>View as</Form.Label>
              <Form.Control as="select" ref={node => (this.property = node)}
                            defaultValue=''
                            required>
                <option hidden disabled value=''> -- Select a property -- </option>
                {this.props.queryProperties.map((el, index) =>
                  <option key={index} value={el['@id']}>{el['@id']}</option>
                )}
              </Form.Control>
            </Form.Group>}
            {this.props.types &&
            <Form.Group>
              <Form.Label>Type</Form.Label>
              <Form.Control as="select" ref={node => (this.type = node)}
//                   onChange={() => this.typeChanged()}
                   defaultValue={typeUri} required>
                   <option hidden disabled value=''> -- Select type -- </option>
                   {this.props.types.map((el, index) =>
                      <option key={index} value={el.uri}>{el.label}</option>)}
              </Form.Control>
            </Form.Group>}
            {this.props.classes &&
            <Form.Group>
              <Form.Label>Class</Form.Label>
              <Form.Control as="select" ref={node => (this.class = node)}
                   onChange={() => this.classChanged()}
                   defaultValue='' required>
                   <option hidden disabled value=''> -- Select class -- </option>
                   {this.props.classes.map((el, index) =>
                      <option key={index} value={el.uri}>{el.label}</option>)}
              </Form.Control>
            </Form.Group>}
            {this.props.vocabularies && this.class && this.class.value && this.class.value === 'http://sw.islab.ntua.gr/semaspace/model/AssertionCollection' &&
            <Form.Group>
              <Form.Label>Thesaurus/Ontology</Form.Label>
              <Form.Control as="select" ref={node => (this.ontology = node)}
//                   defaultValue='' required>
                   defaultValue=''>
                   <option hidden disabled value=''> -- Select thesaurus/ontology -- </option>
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

export default NewMappingModal;
