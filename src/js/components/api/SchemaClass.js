import React, { Component } from "react";
import Container from "react-bootstrap/Container";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import Dropdown from "react-bootstrap/Dropdown";
import DropdownButton from "react-bootstrap/DropdownButton";
import Button from "react-bootstrap/Button";
import Collapse from "react-bootstrap/Collapse";
import { resolveJsonLdUri, objectToArray } from '../../utils/functions';
import SchemaProperty from "./SchemaProperty.js";
import EmbedderModal from "./modals/EmbedderModal.js";
import ExecutableState from "./ExecutableState.js";
import PublishableState from "./PublishableState.js";

import { actionsMenu, toggleBoxColumn, sortByField, pathEquals } from '../../utils/UIUtils';

import { Localizer } from '../../config/localizer.js'
import { filterByLanguage } from "../../utils/functions.js";
import BarLoader from "react-spinners/BarLoader";
import { API_BASE_URL  } from '../../constants/index.js';

export class SchemaClass extends Component {
  constructor(props) {
    super(props);

    this.state = {
      embedderModalOpen: false,
      embedderToEdit: null,
      embedderToEditMode: false,
    };
  }

  render() {

    let context = this.props.schema['@context'];

    var fullView = this.props.mode === 'EDITOR';
    var el = this.props.value;

    //path = {[{type:"CLASS", uri: resolveJsonLdUri(el[this.state.keys.classKey], context)}]}

    var propertyOrClass = el.hasOwnProperty(this.props.keys.propertyKey) ? resolveJsonLdUri(el[this.props.keys.propertyKey],context) : resolveJsonLdUri(el[this.props.keys.classKey], context);
    var embedders = this.props.embedders.filter(el => pathEquals(el.onClass, propertyOrClass));

    // console.log(propertyOrClass);

    return (
      <Row className="schema-content">
        <Col>
          <Container className={"grouping groupborder" + (((el.hasOwnProperty(this.props.keys.propertyPartitionKey) && el[this.props.keys.propertyPartitionKey].length > 0) || (el.hasOwnProperty(this.props.keys.classPartitionKey) && el[this.props.keys.classPartitionKey].length > 0))  ? "": "-empty-dataset")}>
            <Row  className={"red header" + (((el.hasOwnProperty(this.props.keys.propertyPartitionKey) && el[this.props.keys.propertyPartitionKey].length > 0) || (el.hasOwnProperty(this.props.keys.classPartitionKey) && el[this.props.keys.classPartitionKey].length > 0))  ? "": "-empty")}>
              <Col>
                <Container>
                  <Row>
                    <span title="Class">{propertyOrClass}</span>
                  </Row>
                  {el['http://www.w3.org/2000/01/rdf-schema#label'] &&
                  <Row>
                      <span className="thin label">{filterByLanguage(el,'http://www.w3.org/2000/01/rdf-schema#label', this.props.language)}</span>
                  </Row>}
                </Container>
              </Col>
              <Col className="thin" md="auto">
                <span title="Items count">{el[this.props.keys.entitiesKey]}</span>
              </Col>
              {this.props.mode === 'EDITOR' && el.hasOwnProperty(this.props.keys.classKey) &&
              <Col className="mybutton" md="auto">
                {actionsMenu(
                <div>
                  <Dropdown.Item className="py-2" onClick={() => this.props.valueActions('show-values', [{type:"CLASS", uri: resolveJsonLdUri(el[this.props.keys.classKey], context)}], "ALL", true)}>
                    <span className="menu-icon fa fa-eye fa-lg mr-3"></span>Browse items...
                  </Dropdown.Item>

                  <Dropdown.Divider/>

                  <Dropdown.Item className="py-2"
                        onClick={() => this.setState({ embedderModalOpen: true, embedderToEditClass: propertyOrClass } )}
                        disabled={!this.props.dataEmbedders}>
                    <span className="menu-icon fa fa-plus fa-lg mr-3"></span>Add embedder...
                  </Dropdown.Item>

                </div>)}
              </Col>}
            </Row>
            {el['http://www.w3.org/2000/01/rdf-schema#label'] &&
            <Row>
              <Col>
                <span className="label">{filterByLanguage(el,'http://www.w3.org/2000/01/rdf-schema#label', this.props.language)}</span>
              </Col>
            </Row>}

            {embedders.length > 0 &&
            <Container className="groupborder-empty">
              {fullView &&
              <Row className="header-empty">
                <Col>
                  <span>Embedders</span>
                </Col>

                {toggleBoxColumn('embeddersOpen', this)}

              </Row>}

              {fullView &&
              <Collapse in={this.state.embeddersOpen}>
                <Row className="annotatorRowGroup">
                  <Col className="annotatorRowGroupColumn">
                    {embedders.map((el, index) =>

                      <Row key={index}>
                        <Col>
                          <Container key={index} className="annotatorInstanceRow">
                            <Row className="mappingInstanceRowData">

                              {/* <Col md="auto px-0">
                                <Form.Check value={el.selected} onClick={() => this.props.actions('check-annotator', { id: el.id })} />
                              </Col> */}
                              <Col md="5" className="text-break">
                                <Row>
                                  <Col><span className="crimson-std text-bold">{this.props.dataEmbedders.filter((ann) => ann.identifier === el.embedder)[0].title}</span></Col>
                                </Row>
                                {/*el.parameters && el.parameters.length > 0 &&
                                  <div>
                                    <Row className="tableheader">
                                    </Row>
                                    <Row className="tableheader">
                                      <Col>{Localizer.parameters[this.props.language]}</Col>
                                    </Row>
                                  </div>*/}
                                {/*el.parameters && el.parameters.map((el2, index2) =>
                                  <Row key={index2}>
                                    <Col><span className="parameter">{el2.name}: </span><span className="parametervalue">{el2.value}</span></Col>
                                  </Row>
                                )*/}
                                {/*el.preprocess && el.preprocess.length > 0 &&
                                  <div>
                                    <Row className="tableheader">
                                    </Row>
                                    <Row className="tableheader">
                                      <Col>Preprocess</Col>
                                    </Row>
                                  </div>*/}
                                {/*el.preprocess && el.preprocess.map((el1, index1) =>
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
                                  </Row>)*/}
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
                                      onClick={() => this.setState({ embedderModalOpen: true, embedderToEditMode: true, embedderToEdit: el })}>
                                      <span className="menu-icon fa fa-edit fa-lg mr-3"></span>Edit
                                    </Dropdown.Item>

                                  <Dropdown.Item className="py-2"
                                                 disabled={el.publishState !== "UNPUBLISHED"}
                                                 onClick={() => this.props.actions('delete-embedder', { id: el.id })}>
                                    <span className="menu-icon fa fa-trash fa-lg mr-3"></span>Delete
                                  </Dropdown.Item>

                                  <Dropdown.Divider/>

                                  <Dropdown.Item className="py-2"
                                                 disabled={el.executeState === "EXECUTING"}
                                                 onClick={() => this.props.actions('execute-embedder', { id: el.id })}>
                                    <span className="menu-icon fa fa-play-circle fa-lg mr-3"></span>Execute
                                  </Dropdown.Item>

                                  <Dropdown.Item className="py-2"
                                                 disabled={el.executeState !== "EXECUTING"}
                                                 onClick={() => this.props.actions('stop-embedder', { id: el.id })}>
                                    <span className="menu-icon fa fa-stop fa-lg mr-3"></span>Stop Execution
                                  </Dropdown.Item>

                                  <Dropdown.Divider/>

                                  <Dropdown.Item className="py-2"
                                                 disabled={el.executeState !== 'EXECUTED' || el.publishState == 'PUBLISHED'}
                                                 onClick={() => this.props.actions('publish-embedder', { id: el.id })}>
                                    <span className="menu-icon fa fa-calendar-check-o fa-lg mr-3"></span>Publish
                                  </Dropdown.Item>

                                  <Dropdown.Item className="py-2"
                                                 onClick={() => this.props.actions('unpublish-embedder', { id: el.id })}>
                                    <span className="menu-icon fa fa-calendar-times-o fa-lg mr-3"></span>Unpublish
                                  </Dropdown.Item>

                                  <Dropdown.Divider />

                                  <Dropdown.Item className="py-2"
                                                 disabled={el.executeState !== 'EXECUTED' || (el.publishedFromCurrentFileSystem && el.publishState === 'PUBLISHED' && !el.newExecution)}
                                                 onClick={() => this.props.actions('preview-last-embedder-execution', { id: el.id })}>
                                    <span className="menu-icon fa fa-eye fa-lg mr-3"></span>Preview last execution
                                  </Dropdown.Item>

                                  <Dropdown.Item className="py-2"
                                                 disabled={el.executeState !== 'EXECUTED' || (el.publishedFromCurrentFileSystem && el.publishState === 'PUBLISHED' && !el.newExecution)}
                                                 onClick={() => this.props.actions('download-last-embedder-execution', { id: el.id })}>
                                    <span className="menu-icon fa fa-download fa-lg mr-3"></span>Download last execution
                                  </Dropdown.Item>

                                  <Dropdown.Item className="py-2"
                                                 disabled={el.executeState !== 'EXECUTED' || (el.publishedFromCurrentFileSystem && el.publishState === 'PUBLISHED' && !el.newExecution)}
                                                 onClick={() => this.props.actions('clear-embedder-execution', { id: el.id })}>
                                    <span className="menu-icon fa fa-times fa-lg mr-3"></span>Clear last execution
                                  </Dropdown.Item>

                                  <Dropdown.Divider />

                                  <Dropdown.Item className="py-2"
                                                 disabled={!el.publishedFromCurrentFileSystem}
                                                 onClick={() => this.props.actions('preview-published-embedder-execution', {id: el.id})}>
                                                 <span className="menu-icon fa fa-eye fa-lg mr-3"/>Preview published execution
                                  </Dropdown.Item>

                                  <Dropdown.Item className="py-2"
                                                 disabled={!el.publishedFromCurrentFileSystem}
                                                 onClick={() => this.props.actions('download-published-embedder-execution', {id: el.id})}>
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

            <Row className="schema-content-list">
              {el.hasOwnProperty(this.props.keys.propertyPartitionKey) &&  objectToArray(el[this.props.keys.propertyPartitionKey]).map(el3 => { return { obj: el3, property: resolveJsonLdUri(this.props.schema['@graph'].find(item => item['@id'] === el3).property, context) } })
                .sort((a,b) => sortByField('property', a, b)).map((el2,index2) =>
              <SchemaProperty key={index2} value={el2.obj}
                        path = {[{type:"CLASS", uri: resolveJsonLdUri(el[this.props.keys.classKey], context)}]}
                        schema={this.props.schema}
                        keys={this.props.keys}
                        mode={this.props.mode}
                        language={this.props.language}
                        annotators={this.props.annotators}
                        annotationEditGroups={this.props.annotationEditGroups}
                        validationProgress={this.props.validationProgress}
                        vocabularizers={this.props.vocabularizers}
                        // indexes={this.props.indexes}
                        actions={(action, params) => this.props.actions(action, params)}
                        queryProperties={this.props.queryProperties}
                        dataAnnotators={this.props.dataAnnotators}
                        preprocessFunctions={this.props.preprocessFunctions}
                        preprocessOperations={this.props.preprocessOperations}
                        vocabularies={this.props.vocabularies}
                        rdfVocabularies={this.props.rdfVocabularies}
                        validationModes={this.props.validationModes}
                        valueActions={(action, path, mode) => this.props.valueActions(action, path, mode)}/>)}

              {el.hasOwnProperty(this.props.keys.classPartitionKey) &&  objectToArray(el[this.props.keys.classPartitionKey]).map(el3 => { return { obj: el3, class: resolveJsonLdUri(this.props.schema['@graph'].find(item => item['@id'] === el3).class, context) } })
                .sort((a,b) => sortByField('class', a, b)).map((el2,index2) =>
              <SchemaProperty key={index2} value={el2.obj}
                        path = {[{type:"PROPERTY", uri: resolveJsonLdUri(el[this.state.keys.propertyKey], context)}]}
                        schema={this.props.schema}
                        keys={this.props.keys}
                        mode={this.props.mode}
                        language={this.props.language}
                        annotators={this.props.annotators}
                        annotationEditGroups={this.props.annotationEditGroups}
                        validationProgress={this.props.validationProgress}
                        vocabularizers={this.props.vocabularizers}
                        // indexes={this.props.indexes}
                        actions={(action, params) => this.props.actions(action, params)}
                        queryProperties={this.props.queryProperties}
                        dataAnnotators={this.props.dataAnnotators}
                        preprocessFunctions={this.props.preprocessFunctions}
                        preprocessOperations={this.props.preprocessOperations}
                        vocabularies={this.props.vocabularies}
                        rdfVocabularies={this.props.rdfVocabularies}
                        validationModes={this.props.validationModes}
                        valueActions={(action, path, mode) => this.props.valueActions(action, path, mode)}/>)}
            </Row>
          </Container>
        </Col>

        {this.state.embedderModalOpen &&
        <EmbedderModal show={this.state.embedderModalOpen}
          datasetUri={this.props.datasetUri}
          embedder={this.state.embedderToEdit}
          embedderClass={this.state.embedderToEditClass}
          // onProperty={path[path.length - 1]}
          //queryProperties={this.props.queryProperties}
          dataEmbedders={this.props.dataEmbedders}
          // preprocessFunctions={this.props.preprocessFunctions}
          // preprocessOperations={this.props.preprocessOperations}
          // vocabularies={this.props.vocabularies}
          // rdfVocabularies={this.props.rdfVocabularies}
          onOK={(embedder, variant, indexStructure, keys) => { this.props.actions('create-embedder', { embedder: embedder, variant: variant, indexStructure: indexStructure, onClass: this.state.embedderToEditClass, keys: keys }); this.setState({ embedderModalOpen: false }) }}
          // onUpdate={(id, property, annotator, thesaurus, params, preprocess, variant, defaultTarget) => { this.props.actions('edit-annotator', { id: id, asProperty: property, annotator: annotator, thesaurus: thesaurus, parameters: params, preprocess: preprocess, variant: variant, defaultTarget }); this.setState({ embedderModalOpen: false, editMode: false, editAnnotator: null }) }}
          onClose={() => this.setState({ embedderModalOpen: false, embedderToEditMode: false, embedderToEdit: null })}
          />}

      </Row>
    )

  }
}



export default SchemaClass;
