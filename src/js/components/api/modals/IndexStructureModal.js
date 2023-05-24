import React, { Component } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Dropdown from "react-bootstrap/Dropdown";
import DropdownButton from "react-bootstrap/DropdownButton";
import InputGroup from "react-bootstrap/InputGroup";
import FormControl from "react-bootstrap/FormControl";
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';
import { ToastContainer, toast } from 'react-toastify';
import { getAllTemplates, createTemplate, deleteTemplate, getTemplate, getEditAnnotator } from "../../../utils/APIUtils"
import { getDatasetSchemaClass } from "../../../utils/APIUtils"
import '../Profile.css'

import { filterByLanguage, copyReplaceAt } from '../../../utils/functions.js'
import { throwToast, renderProperties } from '../../../utils/UIUtils';

export class IndexStructureModal extends Component {
  constructor(props) {
    super(props);
    this.preprocess = [];
    // this.modifier = [];

    var selectedEmbedderType
    // var selectedRdfVocabulary
    // var selectedProperty

    if (props.embedder) {
      for (var i in props.dataEmbedders) {
        if (props.dataEmbedders[i].identifier === props.embedder.embedder) {
          selectedEmbedderType = props.dataEmbedders[i];
          break;
        }
      }

    } else {
      // // console.log(props);
      //
      // for (var i in this.props.rdfVocabularies) {
      //   // TEMP SOLUTION
      //   if (props.onProperty.uri.startsWith(this.props.rdfVocabularies[i].namespace)) {
      //     selectedRdfVocabulary = this.props.rdfVocabularies[i];
      //     break;
      //   }
      // }
      //
      // selectedProperty = props.onProperty.uri;
    }

    this.state = {
      embedder: props.embedder,
      selectedEmbedderType,
    }

    // console.log(props);
    this.getSchema();

    this.handleSubmit = this.handleSubmit.bind(this);
  }


  getSchema() {
    getDatasetSchemaClass(this.props.datasetUri)
       .then(response => {
          this.setState( { classStructure: response })
       })
       .catch(error => {
         // this.throwToast('error', error.message)
       })
  }

  handleSubmit(event) {
    event.preventDefault();



    // var result = [ { clazz: this.state.classStructure.class } ];
    this.counter = 0;
    var structure = this.readProperties('property-', this.state.classStructure, 0)
    if (structure) {
      structure = { clazz: this.state.classStructure.class, ...structure }
    }

    // var result = [];
    // this.readProperties('property-', this.state.classStructure, ['http://www.w3.org/2000/01/rdf-schema#Class', this.state.classStructure.class], result)

    var keys = [];
    for (var i = 0; i < this.counter; i++) {
      keys.push("r" + i);
    }

    if (this.props.embedder && this.props.embedder.id) {
       // this.props.onUpdate(this.props.annotator.id, this.property.value, this.state.selectedAnnotatorType.identifier, this.thesaurus ? this.thesaurus.value : null, params, pp, this.variant ? this.variant.value : this.state.selectedAnnotatorType.variants[0].name, this.rdfVocabularyProperty ? this.rdfVocabularyProperty.value : null);
    } else {
       this.props.onOK(this.state.selectedEmbedderType.identifier, this.variant ? this.variant.value : this.state.selectedEmbedderType.variants[0].name, structure, keys);
    }

  }


  readProperties(root, classStructure, depth) {
    if (classStructure && classStructure.children) {
      var properties = [];
      for (var index in classStructure.children) {
        var ch = this.readProperties(root + '-'+ index, classStructure.children[index], depth + 1)


        if (this['p-' + root + '-'+ index].checked) {
          if (!ch) {
            ch = { property: classStructure.children[index].property }

            var language  = this['l-' + root + '-'+ index].value;
            if (language && language.length > 0) {
              ch = { ...ch, language: language.split(',') }
            }

            var target = this['t-' + root + '-'+ index].value;
            if (target.length > 0) {
              ch = { ...ch, target: target }
            }

          }

          // ch.checked = true;
          ch.index = this.counter++;
        }

        if (ch) {
          if (!ch.property) {
            ch = { ...ch, property: classStructure.children[index].property }
          }
          properties.push(ch);
        }
      }

      if (properties.length > 0) {

        if (depth == 0) {
          var res = { properties: properties };
        } else {
          var res = { element: { properties: properties } }
        }

        if (classStructure.class) {
          res = {...res, clazz: this.state.classStructure.class }
        }

        return res
      }

    }
  }

  embedderTypeChanged() {
    var selectedEmbedderType = this.props.dataEmbedders.filter(el => el.identifier === this.embedderType.value)[0]

     this.setState({ selectedEmbedderType: selectedEmbedderType, preprocess: [], preprocessSaved: [] }, () => {
    //   this.property.value = selectedAnnotatorType.asProperties && selectedAnnotatorType.asProperties.length === 1 ? selectedAnnotatorType.asProperties[0] : ''
    //
    //   if (selectedAnnotatorType.variants.length > 1) {
    //     this.variant.value = '';
       // }
     })

  }

  propertyChanged(p) {
    this.forceUpdate()
  }


  render() {

//     console.log(this.props.annotator)
//     console.log(this.state)
   // console.log(this.preprocess)
    return (
      <Modal show={this.props.show} onHide={this.props.onClose} animation={false} backdrop="static" size="lg" >
        <Form onSubmit={this.handleSubmit} id="embedder-modal-form">
          <Modal.Header>
            <Modal.Title>{this.props.embedder && this.props.embedder.id ? 'Edit Embedder' : 'New Embedder'}</Modal.Title>
{/*            <Row className="mr-0">
              <DropdownButton title="Load Template" variant="outline-primary" onClick={() => this.getAllSavedAnnotators()}>
                <div className="dropdown-scroll-annotator">
                  {this.state.savedAnnotators.map((el, index) => (
                    <Dropdown.Item key={"annotator-" + index}>
                      <Row>
                        <Col className="col-10" onClick={() => this.onSavedTemplateClicked(el.id)}>
                          {el.name}
                        </Col>
                        <Col>
                          <i className="fa fa-trash float-right red" aria-hidden="true" onClick={() => this.onDeleteSavedAnnotator(el.id)}></i>
                        </Col>
                      </Row>
                    </Dropdown.Item>
                  ))}
                </div>
              </DropdownButton>
            </Row>*/}
          </Modal.Header>

          <Modal.Body>
            {/*<Form.Group>
              <Form.Label className="required">Embedder</Form.Label>
              <Form.Control as="select" ref={node => (this.embedderType = node)}
                defaultValue={this.state.embedder ? this.state.embedder.embedder : ''}
                onChange={() => this.embedderTypeChanged()}
                required>
                <option hidden disabled value=''> -- Select an embedder -- </option>
                {this.props.dataEmbedders.map((el, index) =>
                  <option key={index} value={el.identifier}>{el.title}</option>
                )}
              </Form.Control>
            </Form.Group>/*}

            {/*this.state.selectedEmbedderType && this.state.selectedEmbedderType.variants.length > 1 &&
            <Form.Group>
              <Form.Label className="required">Variant</Form.Label>
              <Form.Control as="select" ref={node => (this.variant = node)}
                defaultValue={this.state.embedder ? this.state.embedder.variant : ''}
                required>
                <option hidden disabled value=''> -- Select a variant -- </option>
                {this.state.selectedEmbedderType && this.state.selectedEmbedderType.variants.map((el, index) =>
                  <option key={index} value={el.name}>{el.name}</option>
                )}
              </Form.Control>
            </Form.Group>*/}

            {this.state.classStructure && this.state.classStructure.map((el, index) =>
            <Form.Group>
              <Form.Label className="bold">{el.class}</Form.Label>
              {renderProperties('property-', el, 1)}
            </Form.Group>)}

          </Modal.Body>
          <Modal.Footer>
            <Button type="submit" variant="primary">
              {this.props.embedder && this.props.embedder.id ? 'Update' : 'Create'}
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

export default IndexStructureModal;
