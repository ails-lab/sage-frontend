import React, { Component } from "react";
import { filterByLanguage } from "../../utils/functions.js";

import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Container from "react-bootstrap/Container";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import InputGroup from "react-bootstrap/InputGroup";
import FormControl from "react-bootstrap/FormControl";
import FormGroup from "react-bootstrap/FormGroup";

import Datasets from "../Datasets.js";
import { Localizer } from '../../config/localizer.js'

export class SpaceVocabularies extends Component {
  constructor(props) {
    super(props);

    this.state = {
      selectedspace: null,
    }
  }

  getDatasetLabel(uri) {
    for (var i in this.props.datasets) {
      if (this.props.datasets[i].dataset['http://purl.org/dc/elements/1.1/identifier'][0]['@id'] === uri) {
        return this.props.datasets[i].dataset
      }
    }
  }

  select(type, entity) {
    this.setState({['selectedspace' + type]: entity});
  }

  render() {
    var sortedFrom = this.props.space.inside.sort(this.sortByGraph);
    var fromMap = new Map();
    sortedFrom.map(el => {var x = fromMap.get(el.graph); x !== undefined ? fromMap.set(el.graph, [...x, el]) : fromMap.set(el.graph, [ el ]) })

// console.log(sortedFrom);
    var fromArray = []
    fromMap.forEach((value,key) =>
      fromArray.push({ graph: key, value: value})
    )

    return (
      <Container className="grouping">
        <Row>
          <Col className="dataset-control">
            <Datasets datasets={this.props.datasets} public={true}
                      actions={(action, params) => this.props.actions(action, params)}/>
          </Col>

          <Col md={6}>
            <Form className="grouping">

              <FormGroup>
                <InputGroup className="mb-3">
                  <InputGroup.Prepend>
                    <InputGroup.Text>
                      {Localizer.location[this.props.language]}
                    </InputGroup.Text>
                  </InputGroup.Prepend>
                  <FormControl value={this.props.space.text}
                               onKeyPress={(e) => { if (e.key === 'Enter') { e.preventDefault(); this.props.actions('resolve-space') } }}
                               onChange={(event) => this.props.actions('change-space', { value: event.target.value})}/>
                   {this.props.space.info && this.props.space.info.map(el => (
                    <InputGroup.Append>
                      <InputGroup.Text>
                        <span className="title"><a target="_blank" rel="noreferrer noopener" href={el['@id']}>{filterByLanguage(el,'http://www.w3.org/2000/01/rdf-schema#label', 'el')}</a></span>
                      </InputGroup.Text>
                    </InputGroup.Append>))}
                  <InputGroup.Append>
                    <Button variant="outline-secondary" onClick={() => this.props.actions('resolve-space')}><span className='fa fa-search'></span></Button>
                  </InputGroup.Append>
                </InputGroup>
              </FormGroup>
{/*              {this.props.space.inside.map((el,index) => (
                <Container className="groupborder" key={index}>
                  <Row className="header">
                    <Col>
                      {filterByLanguage(this.getDatasetLabel(el.graph),'http://www.w3.org/2000/01/rdf-schema#label', 'el')}
                    </Col>
                    </Row>
                  <Row>
                  {el.resources.map((el2,index) => (
                      <Row key="index" className={"pointer vocabulary-result" + (this.state.selectedspace && this.state.selectedspace['@id'] === el2['@id'] ? " selected-value":"")} onClick={() => {this.select('', el2); this.props.actions('select-space', { entity: el2})}}>
                        <Col>
                          <span><a href={el2['@id']} target="_blank" rel="noreferrer noopener">{filterByLanguage(el2,'http://www.w3.org/2000/01/rdf-schema#label', 'el')}</a></span><br/>
                        </Col>
                      </Row>
                  ))}
                </Row>
                </Container>
              ))} */}
              {fromArray.map((entry, index) =>
                <Container className="groupborder" key={index}>
                  <Row className="header">
                    <Col>
                      {filterByLanguage(this.getDatasetLabel(entry.graph),'http://www.w3.org/2000/01/rdf-schema#label', 'el')}
                    </Col>
                  </Row>
                  {entry.value.map((el,index2) =>
                  <Row>
                  {index2 > 0 && <Row className="divider"><Col></Col></Row>}
                  {el.resources.map((el2,index) => (
                      <Row key="index" className={"pointer vocabulary-result" + (this.state.selectedspace && this.state.selectedspace['@id'] === el2['@id'] ? " selected-value":"")} onClick={() => {this.select('', el2); this.props.actions('select-space', { entity: el2})}}>
                        <Col>
                          <span><a href={el2['@id']} target="_blank" rel="noreferrer noopener">{filterByLanguage(el2,'http://www.w3.org/2000/01/rdf-schema#label', 'el')}</a></span><br/>
                          {(el2.start || el2.end) && <span className="subscript">{el2.start} - {el2.end}</span>}
                        </Col>
                      </Row>
                  ))}
                  </Row>)}
                </Container>)}

            </Form>

          </Col>
        </Row>
      </Container>
    );
  }
}

export default SpaceVocabularies;
