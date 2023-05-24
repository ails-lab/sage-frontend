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
import { getAllTemplates, createTemplate, deleteTemplate, getTemplate } from "../../../utils/TemplateAPI"
//import { getAllTemplates, createAnnotatorTemplate, deleteTemplate, getTemplate, getEditAnnotator } from "../../../utils/APIUtils"

import '../Profile.css'

import { filterByLanguage, copyReplaceAt } from '../../../utils/functions.js'

export class AnnotatorModal extends Component {
  constructor(props) {
    super(props);
    this.preprocess = [];
    // this.modifier = [];

    var selectedAnnotatorType
    var selectedRdfVocabulary
    var selectedProperty

    if (props.annotator) {
      for (var i in props.dataAnnotators) {
        if (props.dataAnnotators[i].identifier === props.annotator.annotator) {
          selectedAnnotatorType = props.dataAnnotators[i];
          break;
        }
      }

      if (props.annotator.defaultTarget) {
        for (var i in this.props.rdfVocabularies) {
          if (this.props.rdfVocabularies[i].namespace === props.annotator.defaultTarget.namespace) {
            selectedRdfVocabulary = this.props.rdfVocabularies[i];
            break;
          }
        }

        selectedProperty = props.annotator.defaultTarget.uri

      }
    } else {
      // console.log(props);

      for (var i in this.props.rdfVocabularies) {
        // TEMP SOLUTION
        if (props.onProperty.uri.startsWith(this.props.rdfVocabularies[i].namespace)) {
          selectedRdfVocabulary = this.props.rdfVocabularies[i];
          break;
        }
      }

      selectedProperty = props.onProperty.uri;
    }

    this.state = {
      annotator: props.annotator,
      selectedAnnotatorType,
      preprocess: [],
      preprocessSaved: [],
      savedAnnotators: [],
      loadedAnnotators: false,
      showSaveAsForm: false,
      saveAsName: '',

      selectedRdfVocabulary,
      selectedProperty,
    }

    this.handleSubmit = this.handleSubmit.bind(this);
  }

  componentDidMount() {
    if (this.props.annotator && this.props.annotator.preprocess) {
      // console.log(this.props.annotator.preprocess)
      this.completeFields(this.props.annotator)
      this.completePreprocesses(this.props.annotator.preprocess)
    }
    // if (this.props.edit) {
    //   // API CALL FOR RETRIEVING DATA FROM ANNOTATOR WITH ID this.props.editAnnotatorId Annotator
    //   this.getEditAnnotatorData(this.props.editAnnotatorId);
    // } else {
    //   var _this = this;
    //   prefixize(this.props.onProperty)
    //     .then(response => {
    //       if (response.namespace) {
    //         for (var i in _this.props.rdfVocabularies) {
    //           if (_this.props.rdfVocabularies[i].namespace === response.namespace) {
    //             _this.setState( { selectedRdfVocabulary: _this.props.rdfVocabularies[i] })
    //             this.rdfVocabularyPrefix.value = _this.props.rdfVocabularies[i].prefix
    //             break;
    //           }
    //         }
    //       }
    //     })
    // }
  }

//   componentWillReceiveProps(props) {
// this.prepareTarget()
// }
//
//   prepareTarget() {
//     var _this = this;
//     prefixize(this.props.onProperty)
//       .then(response => {
//         if (response.namespace) {
//           for (var i in _this.props.rdfVocabularies) {
//             if (_this.props.rdfVocabularies[i].namespace === response.namespace) {
//               _this.setState( { selectedRdfVocabulary: _this.props.rdfVocabularies[i] })
//               // this.rdfVocabularyPrefix.value = _this.props.rdfVocabularies[i].prefix
//               break;
//             }
//           }
//         }
//       })
//     }

  // getEditAnnotatorData(id) {
  //   getEditAnnotator(id).then(response => {
  //     this.completeFields(response)
  //     let preproc = response.preprocess != null ? response.preprocess : []
  //     this.setState({ preprocess: preproc })
  //     this.completePreprocesses(preproc)
  //     // document.getElementById('modal-title').innerHTML = 'Edit Annotator'
  //     document.getElementById('submit-btn').innerHTML = 'Update Changes'
  //
  //   })
  // }

  // getAnnotatorTitle(id) {
  //   let annotator = this.props.dataAnnotators.find(a => a.identifier === id);
  //   if (annotator) {
  //     return annotator.title;
  //   }
  //   return '';
  // }

  // Fill all fields except for preprocess. Works for editing and saved annotators
   completeFields(response) {
  //   this.setState({ annotator: this.props.dataAnnotators.filter(el => el.identifier === response.annotator)[0] }, () => {
  //     this.property.value = this.state.annotator.asProperties && this.state.annotator.asProperties.length === 1 ? this.state.annotator.asProperties[0] : ''
  //   })
  //
  //   this.setState({ annotatorTitle: this.getAnnotatorTitle(response.annotator), annotatorIdentifier: response.annotator});
  //
  //   if (response.variant != null && response.variant !== 'default') {
  //     this.variant.value = response.variant
  //   }
  //
  //   this.property.value = response.asProperty
  //
  //   if (response.annotator.startsWith('inthesaurus')) {
  //     this.thesaurus.value = response.thesaurus
  //     this.setState({ thesaurus: this.props.vocabularies.filter(el => el['http://purl.org/dc/elements/1.1/identifier'][0]['@id'] === this.thesaurus.value || el['http://purl.org/dc/elements/1.1/identifier'][0]['@value'] === this.thesaurus.value)[0] })
  //   }
  //
  //   if (response.defaultTarget) {
  //     for (var i in this.props.rdfVocabularies) {
  //       if (response.defaultTarget.startsWith(this.props.rdfVocabularies[i].namespace)) {
  //         this.setState( { selectedRdfVocabulary: this.props.rdfVocabularies[i] })
  //         this.rdfVocabularyPrefix.value = this.props.rdfVocabularies[i].prefix
  //        this.rdfVocabularyProperty.value = response.defaultTarget
  //       }
  //     }
  //   }
  //

    let annotator = {
      annotator: response.annotator,
      variant: response.variant,
      asProperty: response.asProperty,
    }

    this.annotatorType.value = response.annotator;
    var selectedAnnotatorType = this.props.dataAnnotators.filter(el => el.identifier === this.annotatorType.value)[0]

    var selectedRdfVocabulary = null
    var selectedProperty = null

    if (response.defaultTarget) {
      for (var i in this.props.rdfVocabularies) {
        if (this.props.rdfVocabularies[i].namespace === response.defaultTarget.namespace) {
          selectedRdfVocabulary = this.props.rdfVocabularies[i];
          break;
        }
      }

      selectedProperty = response.defaultTarget.uri
    }

    var thesaurus = null
    if (response.thesaurus) {
      this.thesaurus.value = response.thesaurus;
      thesaurus = this.props.vocabularies.filter(el => el['http://purl.org/dc/elements/1.1/identifier'][0]['@id'] === this.thesaurus.value || el['http://purl.org/dc/elements/1.1/identifier'][0]['@value'] === this.thesaurus.value)[0];
    }

    this.setState({ annotator, selectedAnnotatorType, thesaurus, preprocess: [], preprocessSaved: [], selectedParameters:response.parameters, selectedRdfVocabulary, selectedProperty}, () => {
        this.property.value = response.asProperty ? response.asProperty : ''
        if (this.variant) {
          this.variant.value = response.variant
        }
        if (this.rdfVocabularyPrefix) {
          this.rdfVocabularyPrefix.value = selectedRdfVocabulary ? selectedRdfVocabulary.prefix : ''
        }
        if (this.rdfVocabularyProperty) {
          this.rdfVocabularyProperty.value = selectedProperty ? selectedProperty : ''
        }

        response.parameters.map(el => {
          this['param-' + el.name].value = el.value
        })
    })
   }

  // Fiil preprocess fields
  completePreprocesses(preproc) {
    // var functions = [];
    // functions = functions.concat(this.props.preprocessFunctions);
    // functions = functions.concat(this.props.preprocessOperations);

    var preprocCopy = []
    var preprocessSaved = []
    for (let i = 0; i < preproc.length; i++) {
      var preproci = {...preproc[i]}

      var operator = this.props.preprocessOperations.filter(el => el.uri === preproci.function)[0];

      var f = preproci.function
      var fp = preproci.parameters

       var modifiers = [];

       if (preproci.modifier) {
          modifiers = [ {uri:'None'}, {uri:'http://islab.ntua.gr/ns/d2rml-op#logicalNot'} ].map(el => {return el.uri === preproc[i].modifier ? {...el, selected:true } : {...el, selected:false }})
          preproci = {...preproci, modifiers: [ {uri:'None'}, {uri:'http://islab.ntua.gr/ns/d2rml-op#logicalNot'} ].map(el => {return el.uri === preproc[i].modifier ? {...el, selected:true } : {...el, selected:false }}) }
          delete preproci.modifier;
       } else if (operator) {
         modifiers = [ {uri:'None', selected: true}, {uri:'http://islab.ntua.gr/ns/d2rml-op#logicalNot',  selected: false} ]
         preproci = {...preproci, modifiers: [ {uri:'None', selected:true}, {uri:'http://islab.ntua.gr/ns/d2rml-op#logicalNot', selected:false} ] }
       } else {
         modifiers = [ ]
         preproci = {...preproci, modifiers: [] }
       }

      preprocCopy = preprocCopy.concat({ function: f, parameters: fp, modifiers: modifiers });
      preprocessSaved = preprocessSaved.concat(true);

      // this.setState(copyReplaceAt('preprocess', preproc, i, { function: f, parameters: fp, modifiers: modifiers }))

      // this.setState({ preprocess: preproc, preprocessSaved: [] }, () => { this.preprocess[i].value = preproc[i].function })
      //
      // for (let i = 0; i < this.state.preprocess.length; i++) {
      //   this.setState({ preprocessSaved: this.state.preprocessSaved.slice().concat(true) });
      // }
    }

    this.setState({ preprocess: preprocCopy, preprocessSaved: [] }, () => {
      for (var i in preprocCopy)  {
        this.preprocess[i].value = preprocCopy[i].function
      }
    })
  }


  onSavedTemplateClicked(id) {
    getTemplate(id).then(response => {
      this.completeFields(response.templateJson)
      let preproc = response.templateJson.hasOwnProperty('preprocess') ? response.templateJson.preprocess : []
      this.setState({ preprocess: response.templateJson.hasOwnProperty('preprocess') ? response.templateJson.preprocess : [] })
      this.completePreprocesses(preproc)
      // document.getElementById('modal-title').innerHTML = response.name
    })
  }

  get saveAsCssClasses() {
    return this.state.showSaveAsForm ? 'showForm mt-2 mb-2' : 'hideForm mt-2 mb-2';
  }

  handleSubmit(event) {
    event.preventDefault();

    var params = [];
    for (const i in this.state.selectedAnnotatorType.parameters) {
      params.push({ name: this.state.selectedAnnotatorType.parameters[i].name, value: this['param-' + this.state.selectedAnnotatorType.parameters[i].name].value })
    }

    var pp = this.state.preprocess.map((el, index) => {
      var modifier = null;
      if (el.modifiers) {
        var mod = el.modifiers.filter(m => m.selected === true);
        if (mod.length > 0 && mod[0].uri !== 'None') {
          modifier = mod[0].uri;
        }
      }

      if (!modifier) {
        return { function: this.state.preprocessSaved[index] ? el.function : el.function, parameters: el.parameters }
      } else {
        return { function: this.state.preprocessSaved[index] ? el.function : el.function, parameters: el.parameters, modifier: modifier }
      }
    })

    if (this.props.annotator && this.props.annotator.id) {
      this.props.onUpdate(this.props.annotator.id, this.property.value, this.state.selectedAnnotatorType.identifier, this.thesaurus && this.state.selectedAnnotatorType.identifier.startsWith('inthesaurus') ? this.thesaurus.value : null, params, pp, this.variant ? this.variant.value : this.state.selectedAnnotatorType.variants[0].name, this.rdfVocabularyProperty ? this.rdfVocabularyProperty.value : null);
    } else {
      this.props.onOK(this.property.value, this.state.selectedAnnotatorType.identifier, this.thesaurus && this.state.selectedAnnotatorType.identifier.startsWith('inthesaurus') ? this.thesaurus.value : null, params, pp, this.variant ? this.variant.value : this.state.selectedAnnotatorType.variants[0].name, this.rdfVocabularyProperty ? this.rdfVocabularyProperty.value : null);
    }

  }

  annotatorTypeChanged() {
    var selectedAnnotatorType = this.props.dataAnnotators.filter(el => el.identifier === this.annotatorType.value)[0]

    this.setState({ selectedAnnotatorType: selectedAnnotatorType, preprocess: [], preprocessSaved: [] }, () => {
      this.property.value = selectedAnnotatorType.asProperties && selectedAnnotatorType.asProperties.length === 1 ? selectedAnnotatorType.asProperties[0] : ''

      if (selectedAnnotatorType.variants.length > 1) {
        this.variant.value = '';
      }
    })

  }

  rdfVocabularyPrefixChanged() {
    if (this.rdfVocabularyProperty) {
      this.rdfVocabularyProperty.value = '';
    }

    this.setState({ selectedRdfVocabulary: this.props.rdfVocabularies.filter(el => el.prefix === this.rdfVocabularyPrefix.value )[0] })
  }

  functionChanged(index, event) {

    var functions = [];
    functions = functions.concat(this.props.preprocessFunctions);
    functions = functions.concat(this.props.preprocessOperations);

    // var f = this.props.preprocessFunctions.filter(el => el.uri === event.target.value)[0];
    var f = functions.filter(el => el.uri === event.target.value)[0];
    var fp = [];
    for (var i in f.parameters) {
      if (f.parameters[i] !== "input") {
        fp.push({ name: f.parameters[i] })
      }


    }

    var op = this.props.preprocessOperations.filter(el => el.uri === event.target.value)[0];

    if (op != null) {
      //hack to clear old parameter values from form
      this.setState(copyReplaceAt('preprocess', this.state.preprocess, index, { function: f.uri, parameters: [],  modifiers: []}),
      () => { this.setState(copyReplaceAt('preprocess', this.state.preprocess, index, { function: f.uri, parameters: fp,  modifiers: [ {uri:'None', selected:true}, {uri:'http://islab.ntua.gr/ns/d2rml-op#logicalNot', selected:false}]})) } )
    } else {
      //hack to clear old parameter values from form
      this.setState(copyReplaceAt('preprocess', this.state.preprocess, index, { function: f.uri, parameters: [],  modifiers: []}),
      () =>  { this.setState(copyReplaceAt('preprocess', this.state.preprocess, index, { function: f.uri, parameters: fp,  modifiers: []}))}  )
    }
    let ppSavedtmp = this.state.preprocessSaved;
    ppSavedtmp[index] = false;
    this.setState({ preprocessSaved: ppSavedtmp })
  }

  thesaurusChanged() {
    this.setState({ thesaurus: this.props.vocabularies.filter(el => el['http://purl.org/dc/elements/1.1/identifier'][0]['@id'] === this.thesaurus.value || el['http://purl.org/dc/elements/1.1/identifier'][0]['@value'] === this.thesaurus.value)[0] })
  }

  addPreprocess() {
    this.setState({ preprocess: this.state.preprocess.slice().concat({ function: '', parameters: [] }) });
    this.setState({ preprocessSaved: this.state.preprocessSaved.slice().concat(false) });
  }

  deletePreprocess(index) {
    this.setState({ preprocess: this.state.preprocess.slice(0, index).concat(this.state.preprocess.slice(index + 1)) })
    this.setState({ preprocessSaved: this.state.preprocessSaved.slice(0, index).concat(this.state.preprocessSaved.slice(index + 1)) })
  }

  functionParameterChanged(index, parameter, event) {

    var obj = this.state.preprocess[index];
    var pindex = obj.parameters.findIndex(el => el.name === parameter.name);

    var np = obj.parameters.slice(0, pindex).concat({ name: parameter.name, value: event.target.value }).concat(obj.parameters.slice(pindex + 1));
    this.setState(copyReplaceAt('preprocess', this.state.preprocess, index, { function: obj.function, parameters: np, modifiers: obj.modifiers }))
  }

  functionModifierChanged(index, event) {

    var obj = this.state.preprocess[index];

    var np = obj.modifiers.map(el => { return (el.uri === event.target.value) ? { ...el, selected:true } : { ...el, selected:false } } );

    this.setState(copyReplaceAt('preprocess', this.state.preprocess, index, { function: obj.function, parameters: obj.parameters, modifiers: np }))
  }

  parameterChanged(){

  }

  jsonldsort(a, b) {
    if (a['@value'] !== undefined && b['@value'] !== undefined) {
      if (a['@value'] < b['@value']) {
        return -1;
      } else if (a['@value'] > b['@value']) {
        return 1;
      } else {
        return 0;
      }
    } else if (a['@id'] !== undefined && b['@id'] !== undefined) {
      if (a['@id'] < b['@id']) {
        return -1;
      } else if (a['@id'] > b['@id']) {
        return 1;
      } else {
        return 0;
      }
    }
  }

  getAllSavedAnnotators() {
    if (this.state.loadedAnnotators) {
      return
    }
    getAllTemplates('ANNOTATOR')
      .then(response => {
        response.sort((a,b) => (a.name > b.name) ? 1 : -1);
        this.setState({ savedAnnotators: response, loadedAnnotators: true });
      });

  }

  nameChanged(evt) {
    this.setState({ saveAsName: evt.target.value })
  }

  onSave() {
    if (!this.state.selectedAnnotatorType) {
      this.throwToast('error', 'You have to select an annotator from the list.');
      return;
    }
    if (this.state.saveAsName.length === 0) {
      this.throwToast('error', 'Annotator name cannot be blank. Please enter a name.');
      return;
    }

    var params = [];
    for (const i in this.state.selectedAnnotatorType.parameters) {
      params.push({ name: this.state.selectedAnnotatorType.parameters[i].name, value: this['param-' + this.state.selectedAnnotatorType.parameters[i].name].value })
    }

    var pp = this.state.preprocess.map((el, index) => {
      var modifier = null;
      if (el.modifiers) {
        var mod = el.modifiers.filter(m => m.selected === true);
        if (mod.length > 0 && mod[0].uri !== 'None') {
          modifier = mod[0].uri;
        }
      }

      if (!modifier) {
        return { function: this.state.preprocessSaved[index] ? el.function : el.function, parameters: el.parameters }
      } else {
        return { function: this.state.preprocessSaved[index] ? el.function : el.function, parameters: el.parameters, modifier: modifier }
      }
    })

   // var params = [];
    // for (const i in this.state.selectedAnnotatorType.parameters) {
    //   params.push({ name: this.state.selectedAnnotatorType.parameters[i].name, value: this['param-' + this.state.selectedAnnotatorType.parameters[i].name].value })
    // }
    // var pp = this.state.preprocess.map((el, index) => {
    //   return { function: this.state.preprocessSaved[index] ? el.function : el.function.uri, parameters: el.parameters }
    // })

                                                       // this.property.value, this.state.selectedAnnotatorType.identifier, this.thesaurus ? this.thesaurus.value : null, params, pp, this.variant ? this.variant.value : this.state.selectedAnnotatorType.variants[0].name, this.rdfVocabularyProperty ? this.rdfVocabularyProperty.value : null);

    var defaultTarget = null
    if (this.rdfVocabularyPrefix && this.rdfVocabularyProperty) {
       var voc = this.props.rdfVocabularies.filter(el => el.prefix === this.rdfVocabularyPrefix.value)[0]
       defaultTarget = { 'uri': this.rdfVocabularyProperty.value, 'prefix':this.rdfVocabularyPrefix.value, 'namespace': voc.namespace, 'localName': this.rdfVocabularyProperty.value.substring(voc.namespace.length)}
    }

    // createTemplate(this.state.saveAsName, 'ANNOTATOR', this.property.value, this.state.selectedAnnotatorType.identifier, this.thesaurus ? this.thesaurus.value : null, params, pp, this.variant ? this.variant.value : this.state.selectedAnnotatorType.variants[0].name, this.rdfVocabularyProperty ? this.rdfVocabularyProperty.value : null)
    createTemplate(this.state.saveAsName, 'ANNOTATOR', this.property.value, this.state.selectedAnnotatorType.identifier, this.thesaurus && this.state.selectedAnnotatorType.identifier.startsWith('inthesaurus') ? this.thesaurus.value : null, params, pp, this.variant ? this.variant.value : this.state.selectedAnnotatorType.variants[0].name, defaultTarget)
      .then(response => {
        this.throwToast('success', 'Annotator saved successfully!')
      })
      .catch(error => {
        console.error(error);
        this.throwToast('error', 'Annotator was not saved. Please try again.')
      });

    // document.getElementById('modal-title').innerHTML = this.state.saveAsName
    this.setState({ saveAsName: '', showSaveAsForm: false, loadedAnnotators: false })
  }

  throwToast(type, message) {
    if (type === 'error') {
      toast.error(message, {
        position: "top-right",
        autoClose: 4000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    }
    else if (type === 'success') {
      toast.success(message, {
        position: "top-right",
        autoClose: 4000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    }
  }

  onDeleteSavedAnnotator(id) {
    deleteTemplate(id).then(response => {
      this.setState({ loadedAnnotators: false })
      this.getAllSavedAnnotators()
      this.throwToast('success', 'Saved Annotator deleted successfully!')
    })
      .catch(error => {
        console.error(error)
        this.throwToast('error', 'Saved Annotator deletion failed')
      })
  }

  getDefaultParameter(name) {
    if (!this.state.selectedParameters) {
      return null
    }
    var obj = this.state.selectedParameters.find(p => p.name === name);
    if (obj == null) {
      return null;
    } else {
      return obj.value;
    }

  }

  render() {

    return (
      <Modal show={this.props.show} onHide={this.props.onClose} animation={false} backdrop="static">
        <Form onSubmit={this.handleSubmit} id="annotator-modal-form">
          <Modal.Header>
            <Modal.Title>{this.props.annotator && this.props.annotator.id ? 'Edit Annotator' : 'New Annotator'}</Modal.Title>
            <Row className="mr-0">
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
            </Row>
          </Modal.Header>

          <Modal.Body>
          <Form.Group>
            <Form.Label className="required">Annotator</Form.Label>
            <Form.Control as="select" ref={node => (this.annotatorType = node)}
              defaultValue={this.state.annotator ? this.state.annotator.annotator : ''}
              onChange={() => this.annotatorTypeChanged()}
              required>
              <option hidden disabled value=''> -- Select an annotator -- </option>
              {this.props.dataAnnotators.map((el, index) =>
                <option key={index} value={el.identifier}>{el.title}</option>
              )}
            </Form.Control>
          </Form.Group>

            {/*<Form.Group id="annotator-selector">
              <Form.Label className="required">Annotator</Form.Label>
              <DropdownButton
                id="annotator-selector"
                title={this.state.annotatorTitle}
                variant="light"
                bsPrefix="form-control w-100"
              >
                {this.props.dataAnnotators.map((el, index) =>
                  <OverlayTrigger key={`overlay-${index}`} placement="top" delay={150} overlay={<Tooltip className="annotator-tooltip" id={`tooltip-${index}`}>{el.description !== null ? el.description : el.title}</Tooltip>}>
                    <Dropdown.Item as="button" className="py-1" key={`annotator-${index}`} onClick={e => this.annotatorChanged(e, el)}>
                      {el.title}
                    </Dropdown.Item>
                  </OverlayTrigger>
                )}
              </DropdownButton>
            </Form.Group>*/}

            {this.state.selectedAnnotatorType && this.state.selectedAnnotatorType.variants.length > 1 &&
              <Form.Group>
                <Form.Label className="required">Variant</Form.Label>
                <Form.Control as="select" ref={node => (this.variant = node)}
                  defaultValue={this.state.annotator ? this.state.annotator.variant : ''}
                  required>
                  <option hidden disabled value=''> -- Select a variant -- </option>
                  {this.state.selectedAnnotatorType && this.state.selectedAnnotatorType.variants.map((el, index) =>
                    <option key={index} value={el.name}>{el.name}</option>
                  )}
                </Form.Control>
              </Form.Group>}

            <Form.Group>
              <Form.Label className="required">Annotations type</Form.Label>
              <Form.Control as="select" ref={node => (this.property = node)}
                defaultValue={this.state.annotator ? this.state.annotator.asProperty : ''}
                required>
                <option hidden disabled value=''> -- Select a property -- </option>
                {this.state.selectedAnnotatorType && this.state.selectedAnnotatorType.asProperties && this.state.selectedAnnotatorType.asProperties.map((el, index) =>
                  <option key={index} value={el}>{el}</option>
                )}
              </Form.Control>
            </Form.Group>

            {this.props.rdfVocabularies &&
            <Form.Group>
              <Form.Label className="">Default target property</Form.Label>
              <Row>
                <Col md={4}>
                  <Form.Control as="select" ref={node => {this.rdfVocabularyPrefix = node}}
                     defaultValue={this.state.selectedRdfVocabulary ? this.state.selectedRdfVocabulary.prefix : ''}
                     onChange={() => this.rdfVocabularyPrefixChanged()}>
                     <option disabled value=''> -- Prefix -- </option>
                     {this.props.rdfVocabularies.map((el, index) =>
                        <option key={index} value={el.prefix}>{el.prefix}</option>
                     )}
                  </Form.Control>
                </Col>
                {this.state.selectedRdfVocabulary &&
                  <React.Fragment>
                    <Col md={1}>:</Col>

                    <Col>
                      <Form.Control as="select" ref={node => {this.rdfVocabularyProperty = node}}
                      defaultValue={this.state.selectedProperty ? this.state.selectedProperty : ''}>
                      <option disabled value=''> -- Property -- </option>
                      {this.state.selectedRdfVocabulary.properties.map((el, index) =>
                         <option key={index} value={el}>{el.substr(this.state.selectedRdfVocabulary.namespace.length)}</option>
                      )}
                      </Form.Control>
                    </Col>
                  </React.Fragment>
                }
              </Row>
            </Form.Group>}

            {this.state.selectedAnnotatorType && this.state.selectedAnnotatorType.identifier.startsWith('inthesaurus') &&
              <Form.Group>
                <Form.Label className="required">Thesaurus</Form.Label>
                <Form.Control as="select" ref={node => (this.thesaurus = node)}
                  onChange={() => this.thesaurusChanged()}
                  defaultValue={this.state.annotator ? this.state.annotator.thesaurus : ''}
                  required>
                  <option hidden disabled value=''> -- Select a thesaurus -- </option>
                  {this.props.vocabularies.map((el, index) =>
                    <option key={index} value={el['http://purl.org/dc/elements/1.1/identifier'][0]['@id'] ? el['http://purl.org/dc/elements/1.1/identifier'][0]['@id'] : el['http://purl.org/dc/elements/1.1/identifier'][0]['@value']}>{filterByLanguage(el, 'http://purl.org/dc/terms/title', 'el')}</option>)}
                </Form.Control>
              </Form.Group>}

            {this.state.selectedAnnotatorType && this.state.selectedAnnotatorType.parameters && this.state.selectedAnnotatorType.parameters.map((el, index) =>
              <Form.Group key={index}>
                <Form.Label className={"" + (el.required? " required":"")}>[{this.state.selectedAnnotatorType.title}] : {el.name}</Form.Label>
                {(!el.values || el.values.length === 0) && (el.type === "text" ?
                  <Form.Control required={el.required} as="textarea" ref={node => (this['param-' + el.name] = node)} /> :
                  <Form.Control required={el.required} ref={node => (this['param-' + el.name] = node)} />)
                }
                {el.values && el.values.length > 0 &&
                  <Form.Control as="select" ref={node => (this['param-' + el.name] = node)}
                    onChange={() => this.parameterChanged()}
                    defaultValue={el.defaultValue}
                    required={el.required}
                    >
                    {el.values.map((v, index) => {
                      var matches = v.match("^\\{(.*)\\}$")
                      if (matches) {
                        if (this.state.thesaurus && this.state.thesaurus[matches[1]]) {
                           return this.state.thesaurus[matches[1]].sort(this.jsonldsort).map((t, id) => { return <option key={index + "_" + id} value={t['@value'] ? t['@value'] : t['@id']}>{t['@value'] ? t['@value'] : t['@id']}</option> })
                         } else {
                           return '';
                        }
                      } else {
                        return <option key={index} value={v}>{v}</option>
                      }
                     })
                  }
                  </Form.Control>}
              </Form.Group>
            )}
            <Row className="tableheader mb-3" />

            <Form.Group className="mb-0">
              <Form.Label className="bold">Preprocess / Filter</Form.Label>
              <Button type="button" className="deleteaddbutton" aria-label="New" onClick={(event) => this.addPreprocess(event)}><span className="fa fa-plus"></span></Button>
            </Form.Group>

            {this.state.preprocess.map((el, index) =>
              <Row key={index}>
              <Col md="auto">
                <span className="bold">{index + 1}</span>
              </Col>
                <Col>
                  <Form.Group>
                    <Form.Label className="required">Function / Boolean Operation</Form.Label>
                    <Form.Control as="select"
                      ref={node => (this.preprocess[index] = node)}
                      onChange={(event) => this.functionChanged(index, event)}
                      defaultValue={el.function} required>
                      <option disabled value=''> -- Select a function -- </option>
                      {this.props.preprocessFunctions.map((el2, index2) =>
                        <option key={index2} value={el2.uri}>{el2.uri}</option>
                        // el2.uri === this.state.preprocess[index].function.uri ?
                        //   <option key={index2} value={el2.uri} >{el2.uri}</option> : <option key={index2} value={el2.uri} >{el2.uri}</option>
                      )}
                      <option disabled value=''> -- Select an operation -- </option>
                      {this.props.preprocessOperations.map((el2, index2) =>
                        <option key={index2} value={el2.uri}>{el2.uri}</option>
                        // el2.uri === this.state.preprocess[index].function.uri ?
                        //   <option key={index2} value={el2.uri} >{el2.uri}</option> : <option key={index2} value={el2.uri} >{el2.uri}</option>
                      )}
                    </Form.Control>
                  </Form.Group>

                  {el.parameters && el.parameters.filter(el2 => el2 !== "input").map((el2, index2) =>
                    <Form.Group key={index2}>
                      <Form.Label>{el2.name}</Form.Label>
                      <Form.Control onChange={(v) => this.functionParameterChanged(index, el2, v)}
                        defaultValue={el2.value}
                        required>
                      </Form.Control>
                    </Form.Group>)}

                    {el.modifiers && el.modifiers.length > 0 &&
                      <Form.Group>
                        <Form.Label>Modifier</Form.Label>
                        <Form.Control as="select" defaultValue={el.modifiers.filter(x => x.selected === true)[0].uri} onChange={(event) => this.functionModifierChanged(index, event)}>
                          {el.modifiers.map((el2, index2) =>
                            <option key={index2}>{el2.uri}</option>
                          )}
                        </Form.Control>
                      </Form.Group>}
                </Col>
                <Col md="auto">
                  <Button type="button" className="deleteeditbutton" aria-label="New" onClick={(event) => this.deletePreprocess(index)}><span className="fa fa-times"></span></Button>
                </Col>

              </Row>
            )}
          </Modal.Body>
          <Modal.Footer className="justify-content-between">
            {this.state.showSaveAsForm ?
              <InputGroup className={this.saveAsCssClasses}>
                <InputGroup.Prepend>
                  <InputGroup.Text>
                    Save as:
                  </InputGroup.Text>
                </InputGroup.Prepend>
                <FormControl
                  onChange={(event) => this.nameChanged(event)}
                  defaultValue={this.state.saveAsName}>
                </FormControl>
                <Button variant="outline-danger" className="ml-3" onClick={() => this.setState({ showSaveAsForm: false, saveAsName: '' })}>Cancel</Button>
                <Button variant="primary" className="ml-3" onClick={() => this.onSave()}>Save</Button>
              </InputGroup> :

              <React.Fragment>
                <Button onClick={() => this.setState(prevState => ({ showSaveAsForm: !prevState.showSaveAsForm }))} variant="outline-primary" className="float-left">
                  Save Template
                </Button>
                <div>
                  <Button type="submit" variant="primary" id="submit-btn" className="mr-2">
                    {this.props.annotator && this.props.annotator.id ? 'Update' : 'Create'}
                  </Button>
                  <Button variant="secondary" onClick={this.props.onClose}>
                    Cancel
                  </Button>
                </div>
              </React.Fragment>}
          </Modal.Footer>
        </Form>
        {/* <ToastContainer
          position="top-right"
          autoClose={4000}
          hideProgressBar
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        /> */}
      </Modal>

    )
  }
}

export default AnnotatorModal;
