import React, { Component } from "react";
import Container from "react-bootstrap/Container";
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import Dropdown from "react-bootstrap/Dropdown";
import DropdownButton from "react-bootstrap/DropdownButton";
import Form from "react-bootstrap/Form";
import Collapse from "react-bootstrap/Collapse";
import ProgressBar from "react-bootstrap/ProgressBar";
import { Localizer } from '../../config/localizer.js'
import { filterByLanguage, qname } from "../../utils/functions.js";
import { resolveJsonLdUri, objectToArray } from '../../utils/functions';

import AnnotatorModal from "./modals/AnnotatorModal.js";
import VocabulizerModal from "./modals/VocabulizerModal.js";
import ValidationCreateModal from "./modals/ValidationCreateModal.js";
import ExecutableState from "./ExecutableState.js";
import PublishableState from "./PublishableState.js";
import LifecycleState from "./LifecycleState.js";
import IndexableState from "./IndexableState.js";

import { actionsMenu, toggleBoxColumn, pathEquals } from '../../utils/UIUtils';

export class SchemaProperty extends Component {
  constructor(props) {
    super(props);

    this.state = {
      annotatorsOpen: false,
      publishedAnnotationsOpen: this.props.mode === 'VALIDATOR',

      annotatorModalOpen: false,
      annotatorToEdit: null,
      annotatorToEditMode: false,

      vocabularizerModalOpen: false,

      validationProgress: {},
      createValidationModalOpen: false,
      selectedAegId: null,
      selectedValidation: {},
      validationType: '',

      chosenPartition: {},
    }

    this.prepareRender();
  }

  prepareRender() {
    this.setState({ chosenPartition: this.props.schema['@graph'].find(item => item['@id'] === this.props.value) })
  }

  prepareData() {
    this.prepareRender();
  }

  UNSAFE_componentWillReceiveProps(props) {
    this.prepareData();
  }

  componentDidMount() {
    this.prepareData();
  }

  toggleAnnotatorShow() {
    this.setState({ annotatorsOpen: !this.state.annotatorsOpen });
  }

  toggleAnnotationsShow() {
    this.setState({ publishedAnnotationsOpen: !this.state.publishedAnnotationsOpen });
  }

  // adjustOnProperty(params) {
  //   if (params.onProperty) {
  //     // [{ type: "PROPERTY", uri: this.state.chosenPartition.hasOwnProperty(this.props.keys.propertyKey) ? this.state.chosenPartition[this.props.keys.propertyKey] : this.state.chosenPartition[this.props.keys.classKey] }].concat(path)
  //     return { ...params, onProperty: [{ type: "PROPERTY", uri: this.state.chosenPartition.hasOwnProperty(this.props.keys.classKey) ? this.state.chosenPartition[this.props.keys.classKey] : this.state.chosenPartition[this.props.keys.propertyKey] }].concat(params.onProperty) }
  //   } else {
  //     return params;
  //   }
  // }

  openValidations(el, allowEdit) {
    var obj = {
      id: el.id,
      onProperty: this.state.chosenPartition.hasOwnProperty(this.props.keys.propertyKey) ? this.state.chosenPartition[this.props.keys.propertyKey] : this.state.chosenPartition[this.props.keys.classKey],
      currentPage: 0,
      requestedPage: null,
      // totalPages: el.annotatedPagesCount,
      mode: "ANNOTATED_ONLY_SERIAL",
      // annotators: annotators,
      serial: true,
      navigation: "RIGHT",
      edit: allowEdit,
      onPropertyPath: this.props.path.concat({ type: "PROPERTY", uri:  this.state.chosenPartition.hasOwnProperty(this.props.keys.propertyKey) ? this.state.chosenPartition[this.props.keys.propertyKey] : this.state.chosenPartition[this.props.keys.classKey]})
    };

    if (el.annotatedPagesCount === 0) {
      obj.mode = "UNANNOTATED_ONLY_SERIAL";
      // obj.totalPages = el.nonAnnotatedPagesCount;
    }

    this.props.actions('validate-annotations', obj);
  }

  openValidationCreate(aegid, validation, type) {
    this.setState({ createValidationModalOpen: true, selectedAegId: aegid, selectedValidation: validation, validationType: type });
  }

  setAutoexportable(annotationEditGroups, id) {
    return annotationEditGroups.map(el => el.id !== id ? el : {...el, autoexportable: !el.autoexportable })
  }

  disableStartValidation(id) {
    let b = document.getElementById(`start-validation-${id}`);

    if (b.disabled) {
      return;
    }

    b.setAttribute("disabled", true);
    b.classList.add("disabled");

  }

  printMode(mode) { // a strange hack...

    var modeCore = mode.substring(4);

    var mode1 = mode.replaceAll(':ASC','').replaceAll(':DESC','')
    var labelCore = this.props.validationModes.filter(el => el.code === mode1)[0].label;

    var parts = modeCore.split('-')
    var labels = labelCore.split('&')
    for (var i in parts) {
      var order = parts[i].substring(8)
      if (order === 'ASC') {
        labels[i] += ' [ascending] '
      } else {
        labels[i] += ' [descending] '
      }
    }

    return labels.join('&')
  }

  render() {

    let context = this.props.schema['@context'];
    // var uri = this.state.chosenPartition.hasOwnProperty(this.props.keys.propertyKey) ? resolveJsonLdUri(this.state.chosenPartition[this.props.keys.propertyKey], context) : this.state.chosenPartition[this.props.keys.classKey];

    var path = this.props.path;
    if (this.state.chosenPartition.hasOwnProperty(this.props.keys.propertyKey)) {
      path = path.concat({"type":"PROPERTY", "uri":resolveJsonLdUri(this.state.chosenPartition[this.props.keys.propertyKey], context) })
    } else if (this.state.chosenPartition.hasOwnProperty(this.props.keys.classKey)) {
      path = path.concat({"type":"CLASS", "uri":resolveJsonLdUri(this.state.chosenPartition[this.props.keys.classKey], context)})
    }

    // console.log(path);
    // console.log("CLASS " + this.state.chosenPartition.hasOwnProperty(this.props.keys.classKey) ? resolveJsonLdUri(this.state.chosenPartition[this.props.keys.classKey], context) : "");

    // return (<div></div>);
    const annotators = this.props.annotators.filter(el => pathEquals(el.onProperty, path));
    // const annotationEditGroups = this.props.annotationEditGroups.filter(el => el.onProperty[0] === this.props.value['@id']);

    // console.log(annotators)
    // const annotationEditGroups = [];
    const asProperties = new Set();
    for (const i in annotators) {
      if (!asProperties.has(annotators[i].asProperty)) {
        asProperties.add(annotators[i].asProperty)
        // annotationEditGroups.push(annotators[i].editGroup);
      }
    }

    var pagedValidationOpen = false;
    const annotationEditGroups = this.props.annotationEditGroups.filter(el => pathEquals(el.onProperty, path));
    for (const i in annotationEditGroups) {
      if (annotationEditGroups[i].pagedAnnotationValidations && annotationEditGroups[i].pagedAnnotationValidations.length > 0 && annotationEditGroups[i].pagedAnnotationValidations[0].lifecycleState === 'STARTED') {
        pagedValidationOpen = true;
      }
    }

    var vocabularizer = this.props.vocabularizers.filter(el => pathEquals(el.onProperty, path));
    if (vocabularizer.length > 0) {
      vocabularizer = vocabularizer[0]
    } else {
      vocabularizer = null
    }

    // var index = this.props.indexes.filter(el => el.onProperty[0] === this.props.value['@id']);
    // if (index.length > 0) {
    //   index = index[0]
    // } else {
    //   index = null
    // }

    // console.log(editGroups);
    // console.log(this.props.queryProperties);

    var fullView = this.props.mode === 'EDITOR';


    let hasPropertyPartition = this.state.chosenPartition.hasOwnProperty(this.props.keys.propertyPartitionKey);
    let hasClassPartition = this.state.chosenPartition.hasOwnProperty(this.props.keys.classPartitionKey);

    if (fullView || annotators.length > 0) {

      var ranges = [];
      if (this.state.chosenPartition.hasOwnProperty(this.props.keys.rangeIncludesKey)) {
        ranges = objectToArray(this.state.chosenPartition[this.props.keys.rangeIncludesKey]).filter(el => !el.startsWith("http://www.w3.org/2001/XMLSchema#") && !el.startsWith("xsd:") && !el.startsWith("http://www.w3.org/1999/02/22-rdf-syntax-ns#") && !el.startsWith("rdf:"));
      }

      return (
        <Container>
        <Container className={"mt-0 mb-3 py-0 grouping groupborder" + (vocabularizer || annotators.length > 0 || (hasPropertyPartition && objectToArray(this.state.chosenPartition[this.props.keys.propertyPartitionKey]).length > 0) || (hasClassPartition && objectToArray(this.state.chosenPartition[this.props.keys.classPartitionKey]).length > 0) ? "" : "short")}>
          {<Row className={"mb-0 header schema-prop-bg-col " + (vocabularizer || annotators.length > 0 || (hasPropertyPartition && objectToArray(this.state.chosenPartition[this.props.keys.propertyPartitionKey]).length > 0) || (hasClassPartition && objectToArray(this.state.chosenPartition[this.props.keys.classPartitionKey]).length > 0) ? "" : "short")}>
            <Col>
              <Container>
                <Row>
                  <span title="Property">{this.state.chosenPartition.hasOwnProperty(this.props.keys.propertyKey) ? resolveJsonLdUri(this.state.chosenPartition[this.props.keys.propertyKey], context) : ''}</span>
                </Row>
                {ranges &&
                  <Row className="rangeIncludes">
                    {ranges.map((el, index) =>
                     <span key={index}>{resolveJsonLdUri(el, context)}</span>)}
                  </Row>
                }
                {/*this.state.chosenPartition.hasOwnProperty(this.props.keys.rangeIncludesKey) &&
                  <Row className="rangeIncludes">
                    {objectToArray(this.state.chosenPartition[this.props.keys.rangeIncludesKey]).map((el, index) =>
                     <span key={index}>{resolveJsonLdUri(el, context)}</span>)}
                  </Row>
                /*}
                {/* {this.state.chosenPartition.hasOwnProperty('property') ? this.state.chosenPartition.property : this.state.chosenPartition.class &&
                  <Row>
                    <span className="thin label">{filterByLanguage(this.props.value.info,'http://www.w3.org/2000/01/rdf-schema#label', this.props.language)}</span>
                    <span className="thin label">{this.state.chosenPartition.hasOwnProperty('property') ? this.state.chosenPartition.property : this.state.chosenPartition.class}</span>

                  </Row>} */}
              </Container>
            </Col>
            <Col className="thin" md="auto">
              {this.state.chosenPartition[this.props.keys.distinctObjectsKey] ? <span><span title="Distinct values count" className="highlight">{this.state.chosenPartition[this.props.keys.distinctObjectsKey]}</span> / </span> : <span></span>} <span title="Total values count">{this.state.chosenPartition[this.props.keys.triplesKey]}</span>
            </Col>
            {fullView &&
              <Col className="mybutton" md="auto">
                <DropdownButton size="sm" title={<span title="Actions" className='fa fa-bars'></span>} className="actions">
                  <Dropdown.Item className="py-2" onClick={() => this.props.valueActions('show-values', path, "ALL")}>
                    <span className="menu-icon fa fa-eye fa-lg mr-3"></span>View values
                  </Dropdown.Item>

                  <Dropdown.Item className="py-2" onClick={() => this.props.valueActions('download-values', path, "ALL")}>
                    <span className="menu-icon fa fa-download fa-lg mr-3"></span>Download values
                  </Dropdown.Item>

                  <Dropdown.Divider />

                  <Dropdown.Item className="py-2"
                                 onClick={() => this.setState({ annotatorModalOpen: true })}
                                 disabled={!this.props.dataAnnotators}>
                    <span className="menu-icon fa fa-plus fa-lg mr-3"></span>Add Annotator
                  </Dropdown.Item>

                  {/*{!vocabularizer &&
                    <Dropdown.Item className="py-2" onClick={() => this.setState({ vocabularizerModalOpen: true })}>
                      <span className="menu-icon fa fa-th-list fa-lg mr-3"></span>Vocabularize
                    </Dropdown.Item>
                  }*/}
                  {/*{!index &&
                    <Dropdown.Item  onClick={() => this.props.actions('index', { onProperty: [this.props.value['@id']] })}>Index</Dropdown.Item>
                  }
                  <Dropdown.Item  onClick={() => this.props.actions('unindex', { onProperty: [this.props.value['@id']] })}>Unindex</Dropdown.Item>
                  <Dropdown.Item  onClick={() => this.props.actions('unpublish-annotators', { uri: this.props.value['@id']})}>Unpublish Annotators</Dropdown.Item>
                  */}
                  {/*annotators.length > 0 &&
                    <React.Fragment>
                      <Dropdown.Divider />
                      <Dropdown.Item className="py-2" disabled={pagedValidationOpen} onClick={(event) => this.props.actions('publish-checked-annotators', { onProperty: path })}>
                        <span className="menu-icon fa fa-calendar-check-o fa-lg mr-3"></span>Publish Selected Annotators
                      </Dropdown.Item>
                      <Dropdown.Item className="py-2" disabled={pagedValidationOpen} onClick={(event) => this.props.actions('unpublish-checked-annotators', { onProperty: path })}>
                        <span className="menu-icon fa fa-calendar-times-o fa-lg mr-3"></span>Unpublish Selected Annotators
                      </Dropdown.Item>
                    </React.Fragment>
                  */}
                </DropdownButton>

                {this.state.annotatorModalOpen &&
                <AnnotatorModal show={this.state.annotatorModalOpen}
                  annotator={this.state.annotatorToEdit}
                  onProperty={path[path.length - 1]}
                  //queryProperties={this.props.queryProperties}
                  dataAnnotators={this.props.dataAnnotators}
                  preprocessFunctions={this.props.preprocessFunctions}
                  preprocessOperations={this.props.preprocessOperations}
                  vocabularies={this.props.vocabularies}
                  rdfVocabularies={this.props.rdfVocabularies}
                  onOK={(property, annotator, thesaurus, params, preprocess, variant, defaultTarget) => { this.props.actions('create-annotator', { onProperty: path, asProperty: property, annotator: annotator, thesaurus: thesaurus, parameters: params, preprocess, variant, defaultTarget }); this.setState({ annotatorModalOpen: false }) }}
                  onUpdate={(id, property, annotator, thesaurus, params, preprocess, variant, defaultTarget) => { this.props.actions('edit-annotator', { id: id, asProperty: property, annotator: annotator, thesaurus: thesaurus, parameters: params, preprocess: preprocess, variant: variant, defaultTarget }); this.setState({ annotatorModalOpen: false, annotatorToEditMode: false, annotatorToEdit: null }) }}
                  onClose={() => this.setState({ annotatorModalOpen: false, annotatorToEditMode: false, annotatorToEdit: null })} />}

                {this.state.vocabularizerModalOpen &&
                <VocabulizerModal show={this.state.vocabularizerModalOpen}
                  onOK={(name, separator) => { this.props.actions('create-vocabularizer', { onProperty: path, name: name, separator: separator }); this.setState({ vocabularizerModalOpen: false }) }}
                  onClose={() => this.setState({ vocabularizerModalOpen: false })} />}

              </Col>}
          </Row>}

          {/*        <Row>
              <Col>
                {Localizer.count[this.props.language]}: <span>{this.state.chosenPartition[this.state.triplesKey]}</span>
              </Col>
            </Row> */}
          {/*        {index &&
            <div>
              <Row className="tableheader">
              </Row>
              <Row className="tableheader">
                <Col>
                  <span>Index</span>
                </Col>
                <Col md="4" className="tablecenter">
                    <Row>
                      <Col>
                        <IndexableState value={index}/>
                      </Col>
                    </Row>
                </Col>
                <Col className="mybutton" md="auto">
                    <Button type="button" className="menubutton" aria-label="Unindex" onClick={() => this.props.actions('unindex', { onProperty: [this.props.value['@id']] })}><span className="fa fa-trash"></span></Button>
                </Col>
              </Row>
            </div>} */}
          {fullView && vocabularizer &&
            <div>
              <Row className="tableheader">
              </Row>
              <Row className="tableheader">
                <Col>
                  <Row>
                    <Col>
                      <span>Vocabularizer</span>
                    </Col>
                  </Row>
                  <Row>
                    <Col>
                      <span><b>{vocabularizer.name}</b></span>
                    </Col>
                  </Row>
                </Col>
                <Col md="4" className="tablecenter">
                  <div>
                    <Row>
                      <Col>
                        <ExecutableState value={vocabularizer} />
                      </Col>
                    </Row>
                    <Row>
                      <Col>
                        <PublishableState value={vocabularizer} />
                      </Col>
                    </Row>
                    <Row>
                      <Col>
                        <IndexableState value={vocabularizer} />
                      </Col>
                    </Row>
                  </div>
                </Col>
                <Col className="mybutton" md="auto">
                  <Button type="button" className="menubutton" aria-label="Execute" onClick={() => this.props.actions('execute-vocabularizer', { id: vocabularizer.id })}><span className="fa fa-play-circle"></span></Button>
                </Col>
                <Col className="mybutton" md="auto">
                  <Button type="button" className="menubutton" aria-label="View Last Execution" onClick={() => this.props.actions('view-vocabularizer-execution', { id: vocabularizer.id })}><span className="fa fa-eye"></span></Button>
                </Col>
                <Col className="mybutton" md="auto">
                  <Button type="button" className="menubutton" aria-label="Delete" onClick={() => this.props.actions('delete-vocabularizer', { id: vocabularizer.id })}><span className="fa fa-trash"></span></Button>
                </Col>
                <Col className="mybutton" md="auto">
                  <Button type="button" className="menubutton" aria-label="Publish" onClick={() => this.props.actions('publish-vocabularizer', { id: vocabularizer.id })}><span className="punp">P</span></Button>
                </Col>
                <Col className="mybutton" md="auto">
                  <Button type="button" className="menubutton" aria-label="Unpublish" onClick={() => this.props.actions('unpublish-vocabularizer', { id: vocabularizer.id })}><span className="punp">U</span></Button>
                </Col>
                <Col className="mybutton" md="auto">
                  <Button type="button" className="menubutton" aria-label="Index" onClick={() => this.props.actions('index-vocabularizer', { id: vocabularizer.id })}><span className="punp">X</span></Button>
                </Col>
                <Col className="mybutton" md="auto">
                  <Button type="button" className="menubutton" aria-label="Unindex" onClick={() => this.props.actions('unindex-vocabularizer', { id: vocabularizer.id })}><span className="punp">U</span></Button>
                </Col>

              </Row>
            </div>}
          {fullView && vocabularizer &&
            <Row>
              <Col>
                Clean up
              </Col>
              <Col md="4" className="tablecenter">
                {/*              <div>
                    <Row>
                      <Col>
                        <ExecutableState value={el.editGroup}/>
                      </Col>
                    </Row>
                    <Row>
                      <Col>
                        <PublishableState value={el.editGroup}/>
                      </Col>
                    </Row>
                  </div>*/}
              </Col>
              <Col className="mybutton" md="auto">
                <Button type="button" className="menubutton" aria-label="Execute" onClick={() => this.props.actions('execute-cleanup-vocabularizer', { id: vocabularizer.id })}><span className="fa fa-edit"></span></Button>
              </Col>
              {/*            <Col className="mybutton" md="auto">
                    <Button type="button" className="menubutton" aria-label="Execute" onClick={() => this.props.actions('execute-validation', {id: el.editGroup.id})}><span className="fa fa-play-circle"></span></Button>
                </Col> */}
              <Col className="mybutton" md="auto">
                <Button type="button" className="menubutton" aria-label="View" onClick={() => this.props.actions('view-cleanup-vocabularizer', {})}><span className="fa fa-eye"></span></Button>
              </Col>
              {/*            <Col className="mybutton" md="auto">
                    <Button type="button" className="menubutton" aria-label="Publish" onClick={() => this.props.actions('publish-validation', {id: el.editGroup.id})}><span className="punp">P</span></Button>
                </Col>
                <Col className="mybutton" md="auto">
                    <Button type="button" className="menubutton" aria-label="Unpublish" onClick={() => this.props.actions('unpublish-validation', {id: el.editGroup.id})}><span className="punp">U</span></Button>
                </Col>*/}
            </Row>}
          {fullView && vocabularizer &&
            <Row className="tableheader">
            </Row>}

          {annotators.length > 0 &&
          <Container className="groupborder-empty">
            {fullView &&
            <Row className="header-empty">
              <Col>
                <span>{Localizer.annotators[this.props.language]}</span>
              </Col>

              {toggleBoxColumn('annotatorsOpen', this)}

            </Row>}

            {fullView &&
            <Collapse in={this.state.annotatorsOpen}>
              <Row className="annotatorRowGroup">
                <Col className="annotatorRowGroupColumn">
                  {annotators.map((el, index) =>

                    <Row key={index}>
                      <Col>
                        <Container key={index} className="annotatorInstanceRow">
                          <Row className="mappingInstanceRowData">

                            {/* <Col md="auto px-0">
                              <Form.Check value={el.selected} onClick={() => this.props.actions('check-annotator', { id: el.id })} />
                            </Col> */}
                            <Col md="5" className="text-break">
                              <Row>
                                <Col><span className="crimson-std text-bold">{this.props.dataAnnotators.filter((ann) => ann.identifier === el.annotator)[0].title}</span></Col>
                              </Row>
                                <Row>
                                  <Col>as <span className="blueviolet-std">{qname(el.asProperty)}</span></Col>
                                </Row>
                              {el.variant &&
                              <Row>
                                <Col><span className="parameter">execution mode: </span><span className="parametervalue">{el.variant}</span></Col>
                              </Row>}
                              {el.defaultTarget &&
                              <Row>
                                <Col><span className="parameter">default target: </span><span className="parametervalue">{el.defaultTarget.uri}</span></Col>
                              </Row>}
                              {el.parameters && el.parameters.length > 0 &&
                                <div>
                                  <Row className="tableheader">
                                  </Row>
                                  <Row className="tableheader">
                                    <Col>{Localizer.parameters[this.props.language]}</Col>
                                  </Row>
                                </div>
                              }
                              {el.thesaurus &&
                                <Row>
                                  <Col><span className="parameter">thesaurus: </span><span className="parametervalue">{this.props.vocabularies.find(v => v['http://purl.org/dc/elements/1.1/identifier'][0]['@id'] === el.thesaurus) ? filterByLanguage(this.props.vocabularies.find(v => v['http://purl.org/dc/elements/1.1/identifier'][0]['@id'] === el.thesaurus), 'http://www.w3.org/2000/01/rdf-schema#label', this.props.language) : el.thesaurus}</span></Col>
                                </Row>
                              }
                              {el.parameters && el.parameters.map((el2, index2) =>
                                <Row key={index2}>
                                  <Col><span className="parameter">{el2.name}: </span><span className="parametervalue">{el2.value}</span></Col>
                                </Row>
                              )}
                              {el.preprocess && el.preprocess.length > 0 &&
                                <div>
                                  <Row className="tableheader">
                                  </Row>
                                  <Row className="tableheader">
                                    <Col>Preprocess</Col>
                                  </Row>
                                </div>}
                              {el.preprocess && el.preprocess.map((el1, index1) =>
                                <Row key={"function-" + index1}>
                                  <Col md="auto">{index1 + 1}</Col>
                                  <Col>
                                    <Row key={index1}>
                                      <Col><span className="parameter">function: </span><span className="parametervalue">{qname(el1.function)}</span></Col>
                                    </Row>
                                    {el1.parameters.map((el2, index2) =>
                                      <Row key={index2}>
                                        <Col><span className="parameter">{el2.name}: </span><span className="parametervalue">{el2.value}</span></Col>
                                      </Row>
                                    )}
                                    {el1.modifier &&
                                      <Row>
                                        <Col><span className="parameter">modifier: </span><span className="parametervalue">{qname(el1.modifier)}</span></Col>
                                      </Row>
                                    }
                                  </Col>
                                </Row>)}
                            </Col>

                            <Col md={6} className="tablecenter">
                              <Row className="stategroup">
                                <Col>
                                  <Row>
                                    <Col>
                                      <ExecutableState value={el}/>
                                    </Col>
                                  </Row>
                                  <Row>
                                    <Col>
                                      <PublishableState value={el}/>
                                    </Col>
                                  </Row>
                                </Col>
                              </Row>
                            </Col>

                            <Col md="1" className="">
                              <DropdownButton size="sm" title={<span title="Actions" className='fa fa-bars'></span>} className="actions">
                                  <Dropdown.Item className="py-2"
                                    onClick={() => this.setState({ annotatorToEditMode: true, annotatorModalOpen: true, annotatorToEdit: el })}>
                                    <span className="menu-icon fa fa-edit fa-lg mr-3"></span>Edit
                                  </Dropdown.Item>

                                <Dropdown.Item className="py-2"
                                               disabled={el.executeState == "EXECUTING" || el.publishState == "PUBLISHED" || el.publishState == "PUBLISHING" || el.publishState == "UNPUBLISHING"}
                                               onClick={() => this.props.actions('delete-annotator', { id: el.id })}>
                                  <span className="menu-icon fa fa-trash fa-lg mr-3"></span>Delete
                                </Dropdown.Item>

                                <Dropdown.Divider/>

                                <Dropdown.Item className="py-2"
                                               disabled={el.executeState === "EXECUTING"}
                                               onClick={() => this.props.actions('prepare-annotator', { id: el.id })}>
                                  <span className="menu-icon fa fa-spinner fa-lg mr-3"></span>Prepare
                                </Dropdown.Item>

                                <Dropdown.Item className="py-2"
                                               disabled={el.executeState === "EXECUTING"}
                                               onClick={() => this.props.actions('execute-annotator', { id: el.id })}>
                                  <span className="menu-icon fa fa-play-circle fa-lg mr-3"></span>Execute
                                </Dropdown.Item>

                                <Dropdown.Item className="py-2"
                                               disabled={el.executeState !== "EXECUTING"}
                                               onClick={() => this.props.actions('stop-annotator', { id: el.id })}>
                                  <span className="menu-icon fa fa-stop fa-lg mr-3"></span>Stop Execution
                                </Dropdown.Item>

                                <Dropdown.Divider/>

                                <Dropdown.Item className="py-2"
                                               disabled={el.executeState !== 'EXECUTED'}
                                               onClick={() => this.props.actions('preview-annotator-execution', { id: el.id, page: 1 })}>
                                  <span className="menu-icon fa fa-list-alt fa-lg mr-3"></span>Preview annotations
                                </Dropdown.Item>

                                <Dropdown.Divider/>

                                <Dropdown.Item className="py-2"
                                    disabled={pagedValidationOpen || el.executeState !== 'EXECUTED' || el.publishState == 'PUBLISHED' || el.publishState == 'PUBLISHING' || el.publishState == 'UNPUBLISHING'}
                                    onClick={() => this.props.actions('publish-annotator', { id: el.id })}>
                                    <span className="menu-icon fa fa-calendar-check-o fa-lg mr-3"></span>Publish
                                </Dropdown.Item>

                                <Dropdown.Item className="py-2"
                                    disabled={pagedValidationOpen}
                                    onClick={() => this.props.actions('unpublish-annotator', { id: el.id })}>
                                    <span className="menu-icon fa fa-calendar-times-o fa-lg mr-3"></span>Unpublish
                                </Dropdown.Item>

                                <Dropdown.Divider />

                                <Dropdown.Item className="py-2"
                                               disabled={el.executeState !== 'EXECUTED' || (el.publishedFromCurrentFileSystem && el.publishState === 'PUBLISHED' && !el.newExecution)}
                                               onClick={() => this.props.actions('preview-last-annotator-execution', { id: el.id })}>
                                  <span className="menu-icon fa fa-eye fa-lg mr-3"></span>Preview last execution
                                </Dropdown.Item>

                                <Dropdown.Item className="py-2"
                                               disabled={el.executeState !== 'EXECUTED' || (el.publishedFromCurrentFileSystem && el.publishState === 'PUBLISHED' && !el.newExecution)}
                                               onClick={() => this.props.actions('download-last-annotator-execution', { id: el.id })}>
                                  <span className="menu-icon fa fa-download fa-lg mr-3"></span>Download last execution
                                </Dropdown.Item>

                                <Dropdown.Item className="py-2"
                                               disabled={el.executeState !== 'EXECUTED' || (el.publishedFromCurrentFileSystem && el.publishState === 'PUBLISHED' && !el.newExecution)}
                                               onClick={() => this.props.actions('clear-annotator-execution', { id: el.id })}>
                                  <span className="menu-icon fa fa-times fa-lg mr-3"></span>Clear last execution
                                </Dropdown.Item>

                                <Dropdown.Divider />

                                <Dropdown.Item className="py-2"
                                               disabled={!el.publishedFromCurrentFileSystem}
                                               onClick={() => this.props.actions('preview-published-annotator-execution', {id: el.id})}>
                                               <span className="menu-icon fa fa-eye fa-lg mr-3"/>Preview published execution
                                </Dropdown.Item>

                                <Dropdown.Item className="py-2"
                                               disabled={!el.publishedFromCurrentFileSystem}
                                               onClick={() => this.props.actions('download-published-annotator-execution', {id: el.id})}>
                                  <span className="menu-icon fa fa-download fa-lg mr-3"/>Download published execution
                                </Dropdown.Item>


                              </DropdownButton>
                            </Col>
                          </Row>
                        </Container>
                      </Col>
                    </Row>)}
                </Col>
              </Row>
            </Collapse>}
          </Container>}

          {annotators.length > 0 && fullView &&
            <Container className="groupborder-empty">
              <Row className="header-empty">
                <Col>
                  <span>Published Annotations</span>
                </Col>

                {toggleBoxColumn('publishedAnnotationsOpen', this)}
              </Row>

              <Collapse in={this.state.publishedAnnotationsOpen}>
                <Row className="annotatorRowGroup">
                  <Col className="annotatorRowGroupColumn">
                    {annotationEditGroups.map((el, index) =>
                      <div key={"annotationEditGroup-" + index} className="bottomrow-bold">
                        <Row className="grouping bottomrow mx-0">
                          {fullView &&
                            <React.Fragment>
                              <Col className="my-2 pl-0" md={8}>
                                <span className="crimson-std text-bold">{el.asProperty}</span>
                              </Col>
                              <Col className="align-self-center text-break" md={3}>
                                <Form.Check  label="Auto-exportable" checked={el.autoexportable} onClick={() => this.props.actions('check-annotation-edit-group', { id: el.id })}/>
                              </Col>
                              <Col className="align-self-center" md={1}>
                                <DropdownButton size="sm" title={<span title="Actions" className='fa fa-bars'></span>} className="actions">
                                  <Dropdown.Item className="py-2" onClick={() => this.props.actions('view-annotations', { id: el.id, page: 1, mode: "ALL", annotators: annotators })}>
                                    <span className="menu-icon fa fa-list-alt fa-lg mr-3"></span>View annotations...
                                  </Dropdown.Item>
                                  <Dropdown.Divider />
                                  <Dropdown.Item disabled={el.pagedAnnotationValidations && el.pagedAnnotationValidations.length > 0} className="py-2" id={'prepare-paged-validation-' + el.id} onClick={() => this.openValidationCreate(el.id, null, 'paged')}>
                                    <span className="menu-icon fa fa-file-text-o fa-lg mr-3"></span>New paged validation...
                                  </Dropdown.Item>
                                  <Dropdown.Item className="py-2" id={'prepare-filtered-validation-' + el.id} onClick={() => this.openValidationCreate(el.id, null, 'filter')}>
                                    <span className="menu-icon fa fa-filter fa-lg mr-3"></span>New filter validation...
                                  </Dropdown.Item>
                                  <Dropdown.Divider />
  {/*                                <Dropdown.Item className="py-2" onClick={() => this.props.actions('download-annotation-values', { id: el.id, mode: 'ALL' })}>
                                    <span className="menu-icon fa fa-download fa-lg mr-3"></span>Download annotations and validations
                                  </Dropdown.Item> */}
                                  <Dropdown.Item className="py-2" onClick={() => this.props.actions('export-annotations-modal', {id: el.id})}>
                                    <span className="menu-icon fa fa-download fa-lg mr-3"></span>Export annotations and validations...
                                  </Dropdown.Item>

  {/*                                <Dropdown.Item className="py-2" onClick={() => this.props.actions('download-annotation-values', { id: el.id, mode: 'NON_DELETED' })}>
                                    <span className="menu-icon fa fa-download fa-lg mr-3"></span>Download values after validation
                                  </Dropdown.Item> */}
                                  <Dropdown.Divider />
                                  <Dropdown.Item className="py-2" onClick={() => this.props.actions('score-validation-distribution', { id: el.id, accuracy: 10 })}>
                                    <span className="menu-icon fa fa-download fa-lg mr-3"></span>View score - validation distribution...
                                  </Dropdown.Item>
                                </DropdownButton>
                              </Col>
                            </React.Fragment>
                          }
                          {!fullView && el.pagedAnnotationValidations && el.pagedAnnotationValidations.length > 0 &&
                            <Col className="pl-0 text-center">
                              <Row className="px-3">
                                <Col className="text-left px-0">
                                  {el.asProperty}
                                </Col>
                                <Col className="text-right px-0">
                                  Validated: <strong>{this.props.validationProgress[el.pagedAnnotationValidations[0].id]}%</strong>
                                </Col>
                              </Row>
                              <Row className="px-3">
                                <ProgressBar
                                  animated
                                  className="mt-2 mb-1 w-100"
                                  now={this.props.validationProgress[el.pagedAnnotationValidations[0].id]}
                                />
                              </Row>
                            </Col>
                          }
                          {(!fullView && el.pagedAnnotationValidations.length > 0) &&
                            <Col className="mybutton align-self-center" md="auto">
                              <Button type="button" className="menubutton" aria-label="Validate" title="Validate" disabled={el.pagedAnnotationValidations[0].lifecycleState !== 'STARTED' || el.pagedAnnotationValidations[0].publishState === 'PUBLISHED'} onClick={() => this.openValidations(el.pagedAnnotationValidations[0], el.pagedAnnotationValidations[0].lifecycleState === 'STARTED' && el.pagedAnnotationValidations[0].publishState !== 'PUBLISHED')}>
                                <span className="fa fa-list-alt"></span>
                              </Button>
                            </Col>
                          }
                        </Row>

                        {fullView && el.pagedAnnotationValidations.length > 0 &&
                        <div className="bottomrow mb-2">
                          <Row className="align-self-center font-weight-bold mx-0 mb-2">
                            Paged Validations:
                          </Row>
                          <Row className="annotatorRowGroup mr-0">
                            <Col className="annotatorRowGroupColumn">
                              {el.pagedAnnotationValidations.map((pav, index) =>
                              <Row key={"pav-" + pav.id}>
                                <Col>
                                  <Container key={index} className="annotatorInstanceRow">
                                    <Row className="mappingInstanceRowData">
                                      <Col md={5} className="">
                                        <Row>
                                          {(pav.name && pav.name !== '') ? pav.name : pav.uuid}
                                        </Row>
                                        <Row>
                                          <span title="Paged validation item sort order" className="pavMode">
                                          {(pav.mode && pav.mode !== '') ? this.printMode(pav.mode) : this.printMode('PAV-VAL:CNT:DESC')}
                                          </span>
                                        </Row>
                                      </Col>

                                      <Col md={6} className="tablecenter">
                                        <Row className="stategroup">
                                          <Col>
                                            <Row>
                                              {/*<Col id={'validation-status-' + pav.id} className="executed">
                                                {pav.complete ? "Validation finished" : "Validation started"}
                                                </Col>*/}
                                                <Col>
                                                  <LifecycleState value={pav} />
                                                </Col>
                                            </Row>
                                            <Row>
                                              <Col>
                                                <ExecutableState value={pav} />
                                              </Col>
                                            </Row>
                                            <Row>
                                              <Col>
                                                <PublishableState value={pav} />
                                              </Col>
                                            </Row>
                                          </Col>
                                        </Row>
                                      </Col>

                                      <Col md={1} className="last-action-column">
                                        {actionsMenu(
                                        <div>
                                          <Dropdown.Item className="py-2"
                                                         onClick={() => this.openValidationCreate(el.id, pav, 'paged')}>
                                            <span className="menu-icon fa fa-pencil fa-lg mr-3"></span>Edit...
                                          </Dropdown.Item>

                                          <Dropdown.Divider />

                                          <Dropdown.Item className="py-2" onClick={() => this.openValidations(pav, pav.lifecycleState === 'STARTED' && pav.publishState !== 'PUBLISHED')}>
                                            <span className="menu-icon fa fa-edit fa-lg mr-3"></span>Validations Editor...
                                          </Dropdown.Item>

                                          <Dropdown.Divider />

                                          <Dropdown.Item className="py-2" id={'start-validation-' + pav.id}
                                                         disabled={pav.lifecycleState === 'STARTED' || pav.publishState === 'PUBLISHED'}
                                                         onClick={() => this.props.actions('resume-paged-annotation-validation', { id: pav.id, aegId: el.id })}>
                                            <span className="menu-icon fa fa-unlock fa-lg mr-3"></span>Start validation
                                          </Dropdown.Item>

                                          <Dropdown.Item className="py-2" id={'stop-validation-' + pav.id}
                                                         disabled={pav.lifecycleState !== 'STARTED'}
                                                         onClick={() => this.props.actions('stop-paged-annotation-validation', { id: pav.id, aegId: el.id })}>
                                            <span className="menu-icon fa fa-lock fa-lg mr-3"></span>Stop validation
                                          </Dropdown.Item>

                                          <Dropdown.Divider />

                                          <Dropdown.Item className="py-2"
                                                         disabled={pav.lifecycleState !== 'STOPPED'}
                                                         onClick={() => this.props.actions('execute-paged-annotation-validation', { id: pav.id })}>
                                            <span className="menu-icon fa fa-play-circle fa-lg mr-3"></span>Execute
                                          </Dropdown.Item>

                                          <Dropdown.Divider />

                                          <Dropdown.Item className="py-2"
                                                         disabled={pav.executeState !== 'EXECUTED' || pav.lifecycleState !== 'STOPPED' || pav.publishState === 'PUBLISHED'}
                                                         onClick={() => this.props.actions('publish-paged-annotation-validation', { id: pav.id })}>
                                            <span className="menu-icon fa fa fa-calendar-check-o fa-lg mr-3"></span>Publish
                                          </Dropdown.Item>

                                          <Dropdown.Item className="py-2"
                                                         disabled={pav.publishState !== 'PUBLISHED'}
                                                         onClick={() => this.props.actions('unpublish-paged-annotation-validation', { id: pav.id })}>
                                            <span className="menu-icon fa fa-calendar-times-o fa-lg mr-3"></span>Unpublish
                                          </Dropdown.Item>

                                          <Dropdown.Divider />

                                          <Dropdown.Item className="py-2"
                                                         disabled={pav.executeState !== 'EXECUTED' || (pav.publishedFromCurrentFileSystem && pav.publishState === 'PUBLISHED' && !pav.newExecution)}
                                                         onClick={() => this.props.actions('preview-paged-annotation-validation-execution', { id: pav.id })}>
                                            <span className="menu-icon fa fa-eye fa-lg mr-3"></span>Preview last execution
                                          </Dropdown.Item>

                                          <Dropdown.Item className="py-2"
                                                         disabled={pav.executeState !== 'EXECUTED' || (pav.publishedFromCurrentFileSystem && pav.publishState === 'PUBLISHED' && !pav.newExecution)}
                                                         onClick={() => this.props.actions('download-paged-annotation-validation-execution', { id: pav.id })}>
                                            <span className="menu-icon fa fa-download fa-lg mr-3"></span>Download last execution
                                          </Dropdown.Item>

                                          <Dropdown.Item className="py-2"
                                                         disabled={pav.executeState !== 'EXECUTED' || (pav.publishedFromCurrentFileSystem && pav.publishState === 'PUBLISHED' && !pav.newExecution)}
                                                         onClick={() => this.props.actions('clear-paged-annotation-validation-execution', { id: pav.id, aegId: el.id })}>
                                            <span className="menu-icon fa fa-times fa-lg mr-3"></span>Clear last execution
                                          </Dropdown.Item>

                                          <Dropdown.Divider />

                                          <Dropdown.Item className="py-2"
                                                         disabled={!pav.publishedFromCurrentFileSystem}
                                                         onClick={() => this.props.actions('preview-published-paged-annotation-validation-execution', {id: pav.id})}>
                                                         <span className="menu-icon fa fa-eye fa-lg mr-3"/>Preview published execution
                                          </Dropdown.Item>

                                          <Dropdown.Item className="py-2"
                                                         disabled={!pav.publishedFromCurrentFileSystem}
                                                         onClick={() => this.props.actions('download-published-paged-annotation-validation-execution', {id: pav.id})}>
                                            <span className="menu-icon fa fa-download fa-lg mr-3"/>Download published execution
                                          </Dropdown.Item>

                                        </div>)}
                                      </Col>
                                    </Row>
                                  </Container>
                                </Col>
                              </Row>)}
                            </Col>
                          </Row>
                        </div>}

                        {fullView && el.filterAnnotationValidations.length > 0 &&
                        <div>
                          <Row className="align-self-center font-weight-bold mx-0 mb-2">
                            Filter Validations:
                          </Row>
                          <Row className="annotatorRowGroup mr-0">
                            <Col className="annotatorRowGroupColumn">
                              {el.filterAnnotationValidations.map((fav, index) =>
                              <Row key={"fav-" + fav.id} className="grouping mx-0">
                                <Col md={5} className="">
                                  {(fav.name && fav.name !== '') ? fav.name : fav.uuid}
                                </Col>

                                <Col md={6} className="tablecenter">
                                  <Row className="stategroup">
                                    <Col>
                                      <Row>
                                        <Col>
                                          <ExecutableState value={fav} />
                                        </Col>
                                      </Row>
                                      <Row>
                                        <Col>
                                          <PublishableState value={fav} />
                                        </Col>
                                      </Row>
                                    </Col>
                                  </Row>
                                </Col>

                                <Col md={1} className="last-action-column">
                                  {actionsMenu(
                                  <div>
                                    <Dropdown.Item className="py-2" onClick={() => this.openValidationCreate(el.id, fav, 'filter')}>
                                      <span className="menu-icon fa fa-pencil fa-lg mr-3"></span>Edit
                                    </Dropdown.Item>

                                    <Dropdown.Item className="py-2"
                                                   disabled={fav.executeState == "EXECUTING" || fav.publishState == "PUBLISHED" || fav.publishState == "PUBLISHING" || fav.publishState == "UNPUBLISHING"}
                                                   onClick={() => this.props.actions('delete-filter-annotation-validation', { id: fav.id, aegId: el.id })}>
                                      <span className="menu-icon fa fa-trash fa-lg mr-3"></span>Delete
                                    </Dropdown.Item>

                                    <Dropdown.Divider />

                                    <Dropdown.Item className="py-2"
                                                   disabled={fav.publishState === 'PUBLISHED'}
                                                   onClick={() => this.props.actions('execute-filter-annotation-validation', { id: fav.id })}>
                                      <span className="menu-icon fa fa-play-circle fa-lg mr-3"></span>Execute
                                    </Dropdown.Item>

                                    <Dropdown.Divider />

                                    <Dropdown.Item className="py-2"
                                                   disabled={fav.executeState !== 'EXECUTED' || fav.publishState === 'PUBLISHED'}
                                                   onClick={() => this.props.actions('publish-filter-annotation-validation', { id: fav.id })}>
                                      <span className="menu-icon fa fa fa-calendar-check-o fa-lg mr-3"></span>Publish
                                    </Dropdown.Item>

                                    <Dropdown.Item className="py-2"
                                                   disabled={fav.publishState !== 'PUBLISHED'}
                                                   onClick={() => this.props.actions('unpublish-filter-annotation-validation', { id: fav.id })}>
                                      <span className="menu-icon fa fa-calendar-times-o fa-lg mr-3"></span>Unpublish
                                    </Dropdown.Item>

                                    <Dropdown.Divider />

                                    <Dropdown.Item className="py-2"
                                                   disabled={fav.executeState !== 'EXECUTED' || (fav.publishedFromCurrentFileSystem && fav.publishState === 'PUBLISHED' && !fav.newExecution)}
                                                   onClick={() => this.props.actions('preview-filter-annotation-validation-execution', { id: fav.id })}>
                                      <span className="menu-icon fa fa-eye fa-lg mr-3"></span>Preview last execution
                                    </Dropdown.Item>

                                    <Dropdown.Item className="py-2"
                                                   disabled={fav.executeState !== 'EXECUTED' || (fav.publishedFromCurrentFileSystem && fav.publishState === 'PUBLISHED' && !fav.newExecution)}
                                                   onClick={() => this.props.actions('download-filter-annotation-validation-execution', { id: fav.id })}>
                                      <span className="menu-icon fa fa-download fa-lg mr-3"></span>Download last execution
                                    </Dropdown.Item>

                                    <Dropdown.Item className="py-2"
                                                   disabled={fav.executeState !== 'EXECUTED' || (fav.publishedFromCurrentFileSystem && fav.publishState === 'PUBLISHED' && !fav.newExecution)}
                                                   onClick={() => this.props.actions('clear-filter-annotation-validation-execution', { id: fav.id, aegId: el.id })}>
                                      <span className="menu-icon fa fa-times fa-lg mr-3"></span>Clear last execution
                                    </Dropdown.Item>

                                    <Dropdown.Divider />

                                    <Dropdown.Item className="py-2"
                                                   disabled={!fav.publishedFromCurrentFileSystem}
                                                   onClick={() => this.props.actions('preview-published-filter-annotation-validation-execution', {id: fav.id})}>
                                                   <span className="menu-icon fa fa-eye fa-lg mr-3"/>Preview published execution
                                    </Dropdown.Item>

                                    <Dropdown.Item className="py-2"
                                                   disabled={!fav.publishedFromCurrentFileSystem}
                                                   onClick={() => this.props.actions('download-published-filter-annotation-validation-execution', {id: fav.id})}>
                                      <span className="menu-icon fa fa-download fa-lg mr-3"/>Download published execution
                                    </Dropdown.Item>

                                  </div>)}
                                </Col>
                              </Row>)}
                            </Col>
                          </Row>
                        </div>}
                      </div>)
                    }
                  </Col>
                </Row>
              </Collapse>
            </Container>}
          {hasPropertyPartition &&
            <Row>
              {objectToArray(this.state.chosenPartition[this.props.keys.propertyPartitionKey]).map((el, index) =>
                <SchemaProperty key={index} value={el}
                  schema={this.props.schema}
                  keys={this.props.keys}
                  mode={this.props.mode}
                  annotators={this.props.annotators}
                  annotationEditGroups={this.props.annotationEditGroups}
                  vocabularizers={this.props.vocabularizers}
                  // indexes={this.state.indexes}
                  path = {this.props.path.concat([{ type: "PROPERTY", uri: el}])}
                  queryProperties={this.props.queryProperties}
                  dataAnnotators={this.props.dataAnnotators}
                  vocabularies={this.props.vocabularies}
                  preprocessFunctions={this.props.preprocessFunctions}
                  preprocessOperations={this.props.preprocessOperations}
                  language={this.props.language}
                  actions={(action, params) => this.props.actions(action, params)}
                  valueActions={(action, path, mode) => this.props.valueActions(action, path, mode)} />
              )}
            </Row>}
          {hasClassPartition &&
            <Row>
              {objectToArray(this.state.chosenPartition[this.props.keys.classPartitionKey]).map((el, index) =>
                <SchemaProperty key={index} value={el}
                  keys={this.props.keys}
                  mode={this.props.mode}
                  annotators={this.props.annotators}
                  annotationEditGroups={this.props.annotationEditGroups}
                  vocabularizers={this.props.vocabularizers}
                  // indexes={this.state.indexes}
                  path = {this.props.path.concat([{ type: "PROPERTY", uri: el}])}
                  queryProperties={this.props.queryProperties}
                  dataAnnotators={this.props.dataAnnotators}
                  vocabularies={this.props.vocabularies}
                  preprocessFunctions={this.props.preprocessFunctions}
                  preprocessOperations={this.props.preprocessOperations}
                  language={this.props.language}
                  actions={(action, params) => this.props.actions(action, params)}
                  valueActions={(action, path, mode) => this.props.valueActions(action, path, mode)} />
              )}
            </Row>}

          {this.state.createValidationModalOpen &&
          <ValidationCreateModal
              show={this.state.createValidationModalOpen}
              aegId={this.state.selectedAegId}
              validation={this.state.selectedValidation}
              type={this.state.validationType}
              validationModes={this.props.validationModes}
              onOK={(action, params) => { this.props.actions(action, params); this.setState({ createValidationModalOpen: false }) }}
              onClose={() => this.setState({ createValidationModalOpen: false })}
            />
          }
        </Container>
        </Container>
      );
    } else {
      return (<div />);
    }
  }
}


export default SchemaProperty;
