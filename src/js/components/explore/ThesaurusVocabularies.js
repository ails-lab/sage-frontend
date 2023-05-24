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

export class ThesaurusVocabularies extends Component {
  constructor(props) {
    super(props);

    this.state = {
      selectedterm: null,
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
    this.setState({['selectedterm' + type]: entity});
  }

  render() {
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
                      {Localizer.term[this.props.language]}
                    </InputGroup.Text>
                  </InputGroup.Prepend>
                  <FormControl value={this.props.thesaurus.text}
                               onKeyPress={(e) => { if (e.key === 'Enter') { e.preventDefault(); this.props.actions('resolve-thesaurus-term') } }}
                               onChange={(event) => this.props.actions('change-thesaurus-term', { value: event.target.value})}/>
                   {this.props.thesaurus.info && this.props.thesaurus.info.map(el => (
                    <InputGroup.Append>
                      <InputGroup.Text>
                        <span className="title"><a target="_blank" rel="noreferrer noopener" href={el['@id']}>{filterByLanguage(el,'http://www.w3.org/2000/01/rdf-schema#label', 'el')}</a></span>
                      </InputGroup.Text>
                    </InputGroup.Append>))}
                  <InputGroup.Append>
                    <Button variant="outline-secondary" onClick={() => this.props.actions('resolve-thesaurus-term')}><span className='fa fa-search'></span></Button>
                  </InputGroup.Append>
                </InputGroup>
              </FormGroup>
              {this.props.thesaurus.inside.map((el,index) => (
                <Container className="groupborder" key={index}>
                  <Row className="header">
                    <Col>
                      {filterByLanguage(this.getDatasetLabel(el.graph),'http://www.w3.org/2000/01/rdf-schema#label', 'el')}
                    </Col>
                    </Row>
                  <Row>
                  {el.resources.map((el2,index) => (
                      <Row key="index" className={"pointer vocabulary-result" + (this.state.selectedterm && this.state.selectedterm['@id'] === el2['@id'] ? " selected-value":"")} onClick={() => {this.select('', el2); this.props.actions('select-thesaurus-term', { entity: el2})}}>
                        <Col>
                          <span><a href={el2['@id']} target="_blank" rel="noreferrer noopener">{filterByLanguage(el2,'http://www.w3.org/2000/01/rdf-schema#label', 'el')}</a></span><br/>
                        </Col>
                      </Row>
                  ))}
{/*                {el.resources.map((el2,index) => (
                  <InputGroup key={index}>
                    <InputGroup.Radio name="space-group" onChange={() => this.props.actions('select-thesaurus-term', { entity: el2 })}/>
                    <Row className="grouping">
                      <Col>
                        <span><a href={el2['@id']} target="_blank" rel="noreferrer noopener">{filterByLanguage(el2,'http://www.w3.org/2000/01/rdf-schema#label', 'el')}</a></span><br/>
                      </Col>
                    </Row>
                  </InputGroup>
                ))} */}
                </Row>
                </Container>
              ))}


            </Form>

          </Col>
        </Row>
      </Container>
    );
  }
}

export default ThesaurusVocabularies;
