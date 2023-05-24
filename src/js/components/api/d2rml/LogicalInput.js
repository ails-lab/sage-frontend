import React from "react";
import Container from "react-bootstrap/Container";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Collapse from "react-bootstrap/Collapse";
import Select from 'react-select';

import { r2rml, d2rml, d2rmlis} from "../../../utils/D2RMLUtils.js";

class LogicalInput extends React.Component {
  constructor(props) {
    super(props);

// console.log('A2');
// console.log(this.props.sources);
// console.log(this.props.value);
// console.log(this.props.type);
    this.state = {
      open: false
    }
  }

  toggle() {
    this.setState({ open: !this.state.open});
  }

  RDMBSSourceType(props) {
    return props.hasOwnProperty(r2rml('tableName')) ? r2rml('BaseTableOrView') : r2rml('R2RMLView')
  }

  render() {
    return (
      <Container className="border">
        <Row className="header">
          <Col>
            <span className="logical-input">Logical Input</span>
          </Col>
          <Col className="mybutton" md="auto">
            <Button type="button" className="menubutton"  aria-label="Toggle"  onClick={() => this.toggle()}><span className={this.state.open ? 'fa fa-angle-double-up' : 'fa fa-angle-double-down'}></span></Button>
          </Col>
          <Col className="mybutton" md="auto">
            <Button type="button" className="menubutton" aria-label="Close" onClick={(event) => this.props.onChange(event, 'delete', [], this.props.value)}><span className="fa fa-trash"></span></Button>
          </Col>
        </Row>
        <Row>
        <Col>
          <Collapse in={this.state.open}>
            <Container className="nospace">
              <Row>
                <Col>
                <Form.Group as={Col}>
                  <Form.Label>source</Form.Label>
                    <Select
                        value={this.props.value.hasOwnProperty(d2rml('source')) ? this.props.value[d2rml('source')].map(el => { return { value: el['@id'], label:el['@id'] }}) : []}
                        onChange={(event) => this.props.onChange(event, d2rml('source'), [], this.props.value)}
                        options={this.props.sources.map(el => { return {value: el['@id'], label:el['@id'] }})}
                        isMulti
                      />
                  </Form.Group>

                </Col>
                <Col>
                  {this.props.type === d2rmlis('RDBMSSource') &&
                  <Container>
                    <Row>
                      <Col>
                      <Form.Control as="select" value={this.RDMBSSourceType(this.props.value)}
                                    onChange={(event) => this.props.onChange(event, 'rdbms-source-type', [], this.props.value, '@type')}>
                         <option value={r2rml('BaseTableOrView')}>Base Table or View</option>
                         <option value={r2rml('R2RMLView')}>SQL Query</option>
                      </Form.Control>
                      </Col>
                    </Row>
                  </Container>
                }
                  {this.props.type !== d2rmlis('RDBMSSource') &&
                  <Container>
                    <Row>
                      <Col>
                        <Form.Group as={Col}>
                          <Form.Label>Iterator</Form.Label>
                          <Form.Control value={this.props.value[d2rml('iterator')]}
                                        onChange={(event) => this.props.onChange(event, d2rml('iterator'), [], this.props.value)}/>
                        </Form.Group>
                      </Col>
                    </Row>
                    <Row>
                      <Col>
                        <Form.Group as={Col}>
                          <Form.Label>Expression Language</Form.Label>
                          <Form.Control as="select" value={this.props.value.hasOwnProperty(d2rml('referenceFormulation')) ? this.props.value[d2rml('referenceFormulation')]['@id'] : ''}
                                        onChange={(event) => this.props.onChange(event, d2rml('referenceFormulation'), [], this.props.value, '@id')}>
                             <option value={d2rmlis('XPath')}>XPath</option>
                             <option value={d2rmlis('JSONPath')}>JSONPath</option>
                             <option value={d2rmlis('SQL')}>SQL</option>
                             <option value={d2rmlis('RegEx')}>Regular Expression</option>
                          </Form.Control>
                        </Form.Group>
                      </Col>
                    </Row>
                  </Container>}
                </Col>
              </Row>
              <Row>
                <Col>
                  <Form.Group as={Col}>
                    <Form.Label>Maximum Items</Form.Label>
                    <Form.Control value={this.props.value[d2rml('maxItems')]}
                                  onChange={(event) => this.props.onChange(event, d2rml('maxItems'), [], this.props.value)}/>
                  </Form.Group>
                </Col>
              </Row>
            </Container>
          </Collapse>
        </Col>
        </Row>
      </Container>
    )
  }

}


export default LogicalInput;
