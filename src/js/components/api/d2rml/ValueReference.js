import React from "react";
import Container from "react-bootstrap/Container";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import Form from "react-bootstrap/Form";

import { r2rml, d2rml, isSubjectMap, isObjectMap, isPredicateMap, isGraphMap } from "../../../utils/D2RMLUtils.js";

import DefinedColumn from "./DefinedColumn.js";

class ValueReference extends React.Component {


  computeTermType(tm) {
    if (isSubjectMap(this.props.type)) {
      if (tm.hasOwnProperty(r2rml('constant')) || tm.hasOwnProperty(r2rml('column')) || tm.hasOwnProperty(r2rml('template')) ) {
        return r2rml('IRI')
      } else {
        return r2rml('BlankNode')
      }
    } else if (isPredicateMap(this.props.type) || isGraphMap(this.props.type)) {
      return r2rml('IRI')
    } else if (isObjectMap(this.props.type)) {
      if (tm.hasOwnProperty(r2rml('termType'))) {
        return tm[r2rml('termType')]['@id'];
      } else if (tm.hasOwnProperty(r2rml('constant')) && tm[[r2rml('constant')]].hasOwnProperty('@id')) {
        return r2rml('IRI')
      } else {
        if (tm.hasOwnProperty(r2rml('language'))) {
          return r2rml('Literal')
        }
      }
    }

    return r2rml('Literal')
  }


  getValueType(value) {
    return value.hasOwnProperty(r2rml('constant'))? r2rml('constant') :
            (value.hasOwnProperty(r2rml('column'))? r2rml('column') :r2rml('template'))
  }

  getValue(value, type) {
    return value.hasOwnProperty(r2rml('constant')) ?
        (type === r2rml('IRI') ? value[r2rml('constant')]['@id'] : value[r2rml('constant')]) :
              (value.hasOwnProperty(r2rml('column')) ? value[r2rml('column')] : value[r2rml('template')])
  }

  isIRI(value, type) {
    return value.hasOwnProperty(r2rml('constant')) && type === r2rml('IRI');
  }

  render() {
    const termType = this.computeTermType(this.props.value)

    return (
      <Container>
        {(isSubjectMap(this.props.type) || isObjectMap(this.props.type)) &&
        <Form.Row>
            <Form.Group as={Col}>
              <Form.Label>Term Type</Form.Label>
              <Form.Control as="select" disabled={this.props.fixedSubject?true:false}
                                        value={termType}
                                        onChange={(event) => this.props.onChange(event, 'term-type', [], this.props.value, '@id')}>
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
        {(termType === r2rml('IRI') || termType === r2rml('Literal') || termType === r2rml('BlankNode')) &&
        <Form.Row>
            <Form.Group as={Col} md="3">
              <Form.Label>Value Type</Form.Label>
              <Form.Control as="select" disabled={this.props.fixedSubject?true:false}
                                        value={this.getValueType(this.props.value)}
                                        onChange={(event) => this.props.onChange(event, 'term-map-type', [], this.props.value, this.isIRI(this.props.value, termType)? '@id' : '')}>
                  <option value={r2rml('constant')}>Constant</option>
                  <option value={r2rml('column')}>Column</option>
                  <option value={r2rml('template')}>Template</option>
              </Form.Control>
            </Form.Group>
            <Form.Group as={Col}>
              <Form.Label>Value</Form.Label>
              <Form.Control disabled={this.props.fixedSubject?true:false}
                            value={this.getValue(this.props.value, termType)}
                            onChange={(event) => this.props.onChange(event, 'term-map-value', [], this.props.value, this.isIRI(this.props.value, termType)? '@id' : '')}>
              </Form.Control>
            </Form.Group>
        </Form.Row>}
        {this.props.value.hasOwnProperty(d2rml('definedColumns')) &&
        <Row>
          <Col>
            {this.props.value[d2rml('definedColumns')]['@list'].map((el, dindex) =>
            <DefinedColumn key={dindex} value={el}
                           onChange={(event, attr, path, props, type) => this.props.onChange(event, attr, [ { type: d2rml('definedColumns') }, { type: '@list', index:dindex }].concat(path), props, type)}/>
            )}
          </Col>
        </Row>}
      </Container>
    )
  }

}


export default ValueReference;
