import React from "react";
import Container from "react-bootstrap/Container";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Collapse from "react-bootstrap/Collapse";
import InputGroup from "react-bootstrap/InputGroup";
import DropdownButton from "react-bootstrap/DropdownButton";
import Dropdown from "react-bootstrap/Dropdown";

import { r2rml, d2rml, isSubjectMap, isObjectMap, isPredicateMap, isGraphMap, isLanguageMap } from "../../utils/D2RMLUtils.js";

class Condition extends React.Component {
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
      <Container>
        {(isSubjectMap(this.props.type) || isLanguageMap(this.props.type)) &&
        <Form.Row>
            <Form.Group as={Col}>
              <Form.Label>Term Type</Form.Label>
              <Form.Control as="select" value={this.state.type}
                                        onChange={(event) => this.props.onChange(event, 'term-type', [], this.props.value)}>
                <option value={r2rml('IRI')}>IRI</option>
                {isObjectMap(this.props.type) &&
                  <option value={r2rml('Literal')}>Literal</option>
                }
                {(isSubjectMap(this.props.type) || isObjectMap(this.props.type)) &&
                  <option value={r2rml('BlankNode')}>Blank node</option>
                }
              </Form.Control>
            </Form.Group>
        </Form.Row>}
        {(this.state.type === r2rml('IRI') || this.state.type === r2rml('Literal') || this.state.type === r2rml('BlankNode')) &&
        <Form.Row>
            <Form.Group as={Col} md="3">
              <Form.Label>Value Type</Form.Label>
              <Form.Control as="select" value={this.getValueType(this.props.value)}
                                        onChange={(event) => this.props.onChange(event, 'term-map-type', [], this.props.value, this.isIRI(this.props.value, this.state.type)? '@id' : '')}>
                  <option value={r2rml('constant')}>Constant</option>
                  <option value={r2rml('column')}>Column</option>
                  <option value={r2rml('template')}>Template</option>
              </Form.Control>
            </Form.Group>
            <Form.Group as={Col}>
              <Form.Label>Value</Form.Label>
              <Form.Control value={this.getValue(this.props.value, this.state.type)}
                            onChange={(event) => this.props.onChange(event, 'term-map-value', [], this.props.value, this.isIRI(this.props.value, this.state.type)? '@id' : '')}>
              </Form.Control>
            </Form.Group>
        </Form.Row>}
      </Container>
    )
  }

}


export default Condition;
