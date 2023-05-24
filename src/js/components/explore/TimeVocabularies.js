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

import Datasets from "./../Datasets.js";
import { Localizer } from '../../config/localizer.js'

export class TimeVocabularies extends Component {
  constructor(props) {
    super(props);

    this.state = {
      selectedtimefrom: null,
      selectedtimeuntil: null
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
    this.setState({['selectedtime' + type]: entity});
  }

  sortByGraph(gr1, gr2) {
    // var g1 = this.getDatasetLabel(gr1.graph);
    // var g2 = this.getDatasetLabel(gr2.graph);
    var g1 = gr1.graph;
    var g2 = gr2.graph;
    var t1 = gr1.type;
    var t2 = gr2.type;

    if (g1 < g2 ) {
        return -1;
      } else if (g1 > g2) {
        return 1;
      } else {
        if (t1 === 'thesaurus') {
          return -1;
        } else {
          return 1;
        }
      }
  }



  render() {

    // console.log(this.props.times);
    var sortedFrom = this.props.times.from.inside.sort(this.sortByGraph);
    var fromMap = new Map();
    sortedFrom.map(el => {var x = fromMap.get(el.graph); x !== undefined ? fromMap.set(el.graph, [...x, el]) : fromMap.set(el.graph, [ el ]) })

// console.log(sortedFrom);
    var fromArray = []
    fromMap.forEach((value,key) =>
      fromArray.push({ graph: key, value: value})
    )

    var sortedUntil = this.props.times.until.inside.sort(this.sortByGraph);
    var untilMap = new Map();
    sortedUntil.map(el => {var x = untilMap.get(el.graph); x !== undefined ? untilMap.set(el.graph, [...x, el]) : untilMap.set(el.graph, [ el ]) })

// console.log(sortedFrom);
    var untilArray = []
    untilMap.forEach((value,key) =>
      untilArray.push({ graph: key, value: value})
    )

// console.log(fromArray);
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
                    <InputGroup.Text id="time-from">
                      {Localizer.from[this.props.language]}
                    </InputGroup.Text>
                  </InputGroup.Prepend>
                  <FormControl aria-describedby="time-from"
                               value={this.props.times.from.text}
                               onKeyPress={(e) => { if (e.key === 'Enter') { e.preventDefault(); this.props.actions('resolve-time', { name: 'from' }) } }}
                               onChange={(event) => this.props.actions('change-time', { name:'from', value: event.target.value})}/>
                   {this.props.times.from.info && this.props.times.from.info.map((el,index) => (
                    <InputGroup.Append key={index}>
                      <InputGroup.Text>
                        <span className="title"><a target="_blank" rel="noreferrer noopener" href={el['@id']}>{filterByLanguage(el,'http://www.w3.org/2000/01/rdf-schema#label', 'el')}</a></span>
                      </InputGroup.Text>
                    </InputGroup.Append>))}
                  <InputGroup.Append>
                    <Button variant="outline-secondary" onClick={() => this.props.actions('resolve-time', { name: 'from' })}><span className='fa fa-search'></span></Button>
                  </InputGroup.Append>
                </InputGroup>
              </FormGroup>
{/*              {this.props.times.from.inside.sort(this.sortByGraph).map((el, index) => (
                <Container className="groupborder" key={index}>
                  <Row className="header">
                    <Col>
                      {filterByLanguage(this.getDatasetLabel(el.graph),'http://www.w3.org/2000/01/rdf-schema#label', 'el')}
                    </Col>
                    </Row>
                  <Row>
                  {el.resources.map((el2,index) => (
                      <Row key="index" className={"pointer vocabulary-result" + (this.state.selectedtimefrom && this.state.selectedtimefrom['@id'] === el2['@id'] ? " selected-value":"")} onClick={() => {this.select('from', el2); this.props.actions('select-time', { name: 'from', entity: el2})}}>
                        <Col>
                          <span><a href={el2['@id']} target="_blank" rel="noreferrer noopener">{filterByLanguage(el2,'http://www.w3.org/2000/01/rdf-schema#label', 'el')}</a></span><br/>
                          {(el2.start || el2.end) && <span className="subscript">{el2.start} - {el2.end}</span>}
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
                      <Row key="index" className={"pointer vocabulary-result" + (this.state.selectedtimefrom && this.state.selectedtimefrom['@id'] === el2['@id'] ? " selected-value":"")} onClick={() => {this.select('from', el2); this.props.actions('select-time', { name: 'from', entity: el2})}}>
                        <Col>
                          <span><a href={el2['@id']} target="_blank" rel="noreferrer noopener">{filterByLanguage(el2,'http://www.w3.org/2000/01/rdf-schema#label', 'el')}</a></span><br/>
                          {(el2.start || el2.end) && <span className="subscript">{el2.start} - {el2.end}</span>}
                        </Col>
                      </Row>
                  ))}
                  </Row>)}
                </Container>)}
              <FormGroup>
                <InputGroup className="mb-3">
                  <InputGroup.Prepend>
                    <InputGroup.Text>
                      {Localizer.until[this.props.language]}
                    </InputGroup.Text>
                  </InputGroup.Prepend>
                  <FormControl aria-describedby="time-until"
                               value={this.props.times.until.text}
                               onKeyPress={(e) => { if (e.key === 'Enter') { e.preventDefault(); this.props.actions('resolve-time', { name: 'until' }) } }}
                               onChange={(event) => this.props.actions('change-time', { name:'until', value: event.target.value})}/>
                  {this.props.times.until.info && this.props.times.until.info.map(el => (
                  <InputGroup.Append>
                    <InputGroup.Text id="time-until-resolved">
                      <span className="title"><a target="_blank" rel="noreferrer noopener" href={el['@id']}>{filterByLanguage(el,'http://www.w3.org/2000/01/rdf-schema#label', 'el')}</a></span>
                    </InputGroup.Text>
                  </InputGroup.Append>))}
                  <InputGroup.Append>
                    <Button variant="outline-secondary"  onClick={() => this.props.actions('resolve-time', { name: 'until' })}><span className='fa fa-search'></span></Button>
                  </InputGroup.Append>
                </InputGroup>
              </FormGroup>
              {/*{this.props.times.until.inside.map(el => (
                <Container className="groupborder">
                  <Row className="header">
                    <Col>
                      {filterByLanguage(this.getDatasetLabel(el.graph),'http://www.w3.org/2000/01/rdf-schema#label', 'el')}
                    </Col>
                    </Row>
                  <Row>
                  {el.resources.map((el2,index) => (
                      <Row key="index" className={"pointer vocabulary-result" + (this.state.selectedtimeuntil && this.state.selectedtimeuntil['@id'] === el2['@id'] ? " selected-value":"")} name="time-until-group" onClick={() => {this.select('until', el2); this.props.actions('select-time', { name: 'until', entity: el2})}}>
                        <Col>
                          <span><a href={el2['@id']} target="_blank" rel="noreferrer noopener">{filterByLanguage(el2,'http://www.w3.org/2000/01/rdf-schema#label', 'el')}</a></span><br/>
                          {(el2.start || el2.end) && <span className="subscript">{el2.start} - {el2.end}</span>}
                        </Col>
                      </Row>
                  ))}
                </Row>
                </Container> */}
                {untilArray.map((entry, index) =>
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
                        <Row key="index" className={"pointer vocabulary-result" + (this.state.selectedtimeuntil && this.state.selectedtimeuntil['@id'] === el2['@id'] ? " selected-value":"")} onClick={() => {this.select('until', el2); this.props.actions('select-time', { name: 'until', entity: el2})}}>
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

export default TimeVocabularies;
