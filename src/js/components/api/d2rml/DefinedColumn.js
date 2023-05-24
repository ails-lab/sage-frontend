import React from "react";
import Container from "react-bootstrap/Container";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Collapse from "react-bootstrap/Collapse";

import { r2rml, d2rml, getD2RMLFunctions } from "../../../utils/D2RMLUtils.js";

import TermMap from "./TermMap.js";

export class DefinedColumn extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      open: true }
  }

  toggle() {
    this.setState({ open: !this.state.open});
  }

  render() {
    return (
      <Container className="border">
        <Row className="header">
          <Col>
            Defined Column
          </Col>
          <Col className="mybutton" md="auto">
            <Button type="button" className="menubutton"  aria-label="Toggle"  onClick={() => this.toggle()}><span className={this.state.open ? 'fa fa-angle-double-up' : 'fa fa-angle-double-down'}></span></Button>
          </Col>
          <Col className="mybutton" md="auto">
            <Button type="button" className="menubutton" aria-label="Close" onClick={(event) => this.props.onChange(event, 'delete', [], this.props.value)}><span className="fa fa-trash"></span></Button>
          </Col>
        </Row>
        <Collapse in={this.state.open}>
        <Container>
        <Row>
          <Col>
            <Form.Group as={Col}>
              <Form.Label>Name</Form.Label>
              <Form.Control value={this.props.value[d2rml('name')]}
                            onChange={(event) => this.props.onChange(event, d2rml('name'), [], this.props.value)}/>
            </Form.Group>
          </Col>
        </Row>
        <Row>
          <Col>
            <Form.Group as={Col}>
              <Form.Label>Function</Form.Label>
              <Form.Control as="select" value={this.props.value.hasOwnProperty(d2rml('function')) ? this.props.value[d2rml('function')]['@id'] : ''}
                            onChange={(event) => this.props.onChange(event, d2rml('function'), [], this.props.value, '@id')}>
                  <option hidden disabled value=''> -- Select a function -- </option>
                  {getD2RMLFunctions().map((el, index) =>
                  <option key={index} value={el.value}>{el.label}</option>)}
              </Form.Control>
            </Form.Group>
              {this.props.value.hasOwnProperty(d2rml('parameterBinding')) &&
              this.props.value[d2rml('parameterBinding')].map((el, index) => {
                return el[d2rml('parameter')] !== "input" ?
                  <Form.Group key={index} as={Col}>
                    <Form.Label>{el[d2rml('parameter')]}</Form.Label>
                    <Form.Control value={el[r2rml('constant')]}
                                  onChange={(event) => this.props.onChange(event, r2rml('constant'), [{ type:d2rml('parameterBinding'), index:index }], el)}/>

                    </Form.Group>
                : <Form.Group key={index} as={Col}>
                    <Form.Label>{el[d2rml('parameter')]}</Form.Label>
                    <TermMap value={el} type='defined-column'
                         index={index}
                         onChange={(event, attr, path, props, type) => {this.props.onChange(event, attr, path, props, type)}}/>
                  </Form.Group>
              })}

          </Col>
        </Row>
        </Container>
        </Collapse>
      </Container>
    )
  }
}


export default DefinedColumn;
