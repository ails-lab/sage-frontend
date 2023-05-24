import React from "react";
import Container from "react-bootstrap/Container";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import Form from "react-bootstrap/Form";

import { d2rmlis } from "../../../utils/D2RMLUtils.js";

export class SPARQLService extends React.Component {
  render() {
    return (
      <Container>
        <Row>
          <Col md={10}>
          <Container className="border">
            <Row className="header">
              <Col>
                SPARQL Service
              </Col>
            </Row>
            <Row>
              <Col>
                <Form.Group as={Col}>
                  <Form.Label>Location</Form.Label>
                  <Form.Control value={this.props.value[d2rmlis('uri')]}
                                onChange={(event)=> this.props.onChange(event, d2rmlis('uri'), this.props.value)}/>
                </Form.Group>
              </Col>
            </Row>
          </Container>
          </Col>
        </Row>
      </Container>
    )
  }
}


export default SPARQLService;
