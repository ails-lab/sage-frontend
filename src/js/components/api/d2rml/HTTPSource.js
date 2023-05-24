import React from "react";
import Container from "react-bootstrap/Container";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Collapse from "react-bootstrap/Collapse";

import { d2rml, d2rmlis, http } from "../../../utils/D2RMLUtils.js";

export class HTTPSource extends React.Component {
  constructor(props) {
    super(props);
    // console.log(props);

    this.state = {
      parametersOpen: false
    }
  }

  toggle() {
    this.setState({ parametersOpen: !this.state.parametersOpen});
  }

  d2rmlRequestCompatibility(object, field) {
    if (object[d2rmlis('request')] !== undefined) {
      return object[d2rmlis('request')][field]
    } else if (object[d2rmlis('httprequest')] !== undefined) {
      return object[d2rmlis('httpRequest')][field]
    } else {
      return null
    }
  }
  render() {
    return (
      <Container id="http-source-container">
      {(this.props.value[d2rmlis('request')] || this.props.value[d2rmlis('httprequest')]) &&
      <Container className="border">
        <Row className="header">
          <Col>
            HTTP Request Details
          </Col>
        </Row>
        <Form.Row>
          <Form.Group as={Col} md={2}>
            <Form.Label>Method</Form.Label>
            <Form.Control as="select" value={this.d2rmlRequestCompatibility(this.props.value, 'methodName')}
                                      onChange={(event) => this.props.onChange(event, http('methodName'), [], this.props.value)}>
              <option value="GET">GET</option>
              <option value="POST">POST</option>
            </Form.Control>
          </Form.Group>
          <Form.Group as={Col}>
            <Form.Label>Absolute URI</Form.Label>
            <Form.Control value={this.d2rmlRequestCompatibility(this.props.value, 'absoluteURI')}
                          onChange={(event) => this.props.onChange(event, http('absoluteURI'), [], this.props.value)}/>
          </Form.Group>
          </Form.Row>
        </Container>}
        {(this.props.value[d2rmlis('request')] || this.props.value[d2rmlis('httprequest')]) && this.props.value.hasOwnProperty(d2rmlis('parameter')) &&
        <Container className="border">
          <Row className="header">
            <Col>
              Parameters
            </Col>
            <Col className="mybutton" md="auto">
              <Button type="button" className="menubutton"  aria-label="Toggle"  onClick={() => this.toggle()}><span className={this.state.parametersOpen ? 'fa fa-angle-double-up' : 'fa fa-angle-double-down'}></span></Button>
            </Col>
          </Row>
          <Row>
            <Col>
              <Collapse in={this.state.parametersOpen}>
                <div>
                {this.props.value[d2rmlis('parameter')].map((param, index) =>
                <Row key={index}>
                  <Col md={3}>
                    <Form.Group as={Col}>
                      <Form.Label>Name</Form.Label>
                      <Form.Control value={param[d2rmlis('name')]} disabled/>
                    </Form.Group>
                  </Col>
                  <Col>
                    <Container>
                      <Form.Row>
                        <Form.Group as={Col}>
                          <Form.Label>Type</Form.Label>
                          <Form.Control as="select" value={param['@type']}
                                                    onChange={(event)=> this.props.onChange(event, 'http-source-parameter-type', [{ type: d2rmlis('parameter'), index:index }], param)}>
                            <option value={d2rmlis('SimpleCountRequestIterator')}>Count-based Pagination Variable</option>
                            <option value={d2rmlis('SimpleKeyRequestIterator')}>Next-based Pagination Variable</option>
                            <option value={d2rmlis('DataVariable')}>Data Variable</option>
                          </Form.Control>
                        </Form.Group>
                      </Form.Row>
                      <Row>
                        {param['@type'] === d2rmlis('SimpleCountRequestIterator') &&
                        <Container>
                          <Form.Row>
                              <Form.Group as={Col}>
                                <Form.Label>Initial Value</Form.Label>
                                <Form.Control value={param[d2rmlis('initialValue')]}
                                              onChange={(event)=> this.props.onChange(event, d2rmlis('initialValue'), [{ type: d2rmlis('parameter'), index:index }], param)}/>
                              </Form.Group>
                              <Form.Group as={Col}>
                                <Form.Label>Increment</Form.Label>
                                <Form.Control value={param[d2rmlis('increment')]}
                                              onChange={(event, pname)=> this.props.onChange(event, d2rmlis('increment'), [{ type: d2rmlis('parameter'), index:index }], param)}/>
                              </Form.Group>
                              <Form.Group as={Col}>
                                <Form.Label className="optional">Max value</Form.Label>
                                <Form.Control value={param[d2rmlis('maxValue')]}
                                              onChange={(event, pname)=> this.props.onChange(event, d2rmlis('maxValue'), [{ type: d2rmlis('parameter'), index:index }], param)}/>
                              </Form.Group>
                          </Form.Row>
                        </Container>}
                        {param['@type'] === d2rmlis('SimpleKeyRequestIterator') &&
                        <Container>
                        <Row>
                          <Col>
                            <Form.Group as={Col}>
                              <Form.Label>Initial Value</Form.Label>
                              <Form.Control value={param[d2rmlis('initialValue')]}
                                            onChange={(event, pname)=> this.props.onChange(event, d2rmlis('initialValue'), [{ type: d2rmlis('parameter'), index:index }], param)}/>
                            </Form.Group>
                          </Col>
                        </Row>
                        <Row>
                          <Col>
                            <Form.Group as={Col}>
                              <Form.Label>Reference</Form.Label>
                              <Form.Control value={param[d2rml('reference')]}
                                            onChange={(event, pname)=> this.props.onChange(event, d2rml('reference'), [{ type: d2rmlis('parameter'), index:index }], param)}/>
                            </Form.Group>
                          </Col>
                          </Row>
                          <Row>
                          <Col>
                            <Form.Group as={Col}>
                              <Form.Label>Separator</Form.Label>
                              <Form.Control value={param[d2rmlis('separator')]}
                                            onChange={(event, pname)=> this.props.onChange(event, d2rmlis('separator'), [{ type: d2rmlis('parameter'), index:index }], param)}/>
                            </Form.Group>
                          </Col>
                        </Row>
                        </Container>}
                      </Row>
                    </Container>
                  </Col>
                </Row>)}
                </div>
              </Collapse>
            </Col>
          </Row>
        </Container>}
      </Container>
    )
  }
}


export default HTTPSource;
