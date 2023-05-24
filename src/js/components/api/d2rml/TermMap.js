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

import { r2rml, d2rml, isSubjectMap, isObjectMap, isPredicateMap, isGraphMap, isDefinedColumn } from "../../../utils/D2RMLUtils.js";

import ValueReference from "./ValueReference.js";

class TermMap extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      // type: this.computeTermType(this.props.value),
      open: false }

// console.log('STATE');
//       console.log(this.state.type);
  }


  // computeTermType(tm) {
  //   if (isSubjectMap(this.props.type)) {
  //     if (tm.hasOwnProperty(r2rml('constant')) || tm.hasOwnProperty(r2rml('column')) || tm.hasOwnProperty(r2rml('template')) ) {
  //       return r2rml('IRI')
  //     } else {
  //       return r2rml('BlankNode')
  //     }
  //   } else if (isPredicateMap(this.props.type) || isGraphMap(this.props.type)) {
  //     return r2rml('IRI')
  //   } else if (isObjectMap(this.props.type)) {
  //     if (tm.hasOwnProperty(r2rml('termType'))) {
  //       return tm[r2rml('termType')];
  //     } else if (tm.hasOwnProperty(r2rml('constant')) && tm[[r2rml('constant')]].hasOwnProperty('@id')) {
  //       return r2rml('IRI')
  //     } else {
  //       if (tm.hasOwnProperty(r2rml('language'))) {
  //         return r2rml('Literal')
  //       }
  //     }
  //   }
  //
  //   return r2rml('Literal')
  // }

  toggle() {
    this.setState({ open: !this.state.open});
  }

  getPath() {
    if (isSubjectMap(this.props.type)) {
      return [ { type:r2rml('subjectMap') } ];
    } else if (isPredicateMap(this.props.type)) {
      return [ { type:r2rml('predicateMap'), index:this.props.index } ];
    } else if (isObjectMap(this.props.type)) {
      return [ { type:r2rml('objectMap'), index:this.props.index } ];
    } else if (isGraphMap(this.props.type)) {
      return [ { type:r2rml('graphMap'), index:this.props.index } ];
    } else if (isDefinedColumn(this.props.type)) {
      return [ { type:d2rml('parameterBinding'), index: this.props.index }];
    }
  }

  render() {
    return (
      <Container className="border">
      {!isDefinedColumn(this.props.type) &&
        <Row className="header">
          <Col>
            {isSubjectMap(this.props.type) &&
            <span className="subject">Subject Map</span>}
            {isPredicateMap(this.props.type) &&
            "Predicate Map"}
            {isObjectMap(this.props.type) &&
            "Object Map"}
            {isGraphMap(this.props.type) &&
            "Graph Map"}
          </Col>
          <Col className="mybutton" md="auto">
            <DropdownButton size="sm" title="Actions" className="actions">
            {isSubjectMap(this.props.type) &&
              <Dropdown.Item  onClick={(event) => this.props.onChange(event, 'term-map-class-add', this.getPath(), this.props.value)}>Add Class</Dropdown.Item>}
              {!this.props.fixedSubject && <Dropdown.Item  onClick={(event) => this.props.onChange(event, 'term-map-defined-column-add', this.getPath(), this.props.value)}>Add Defined Column</Dropdown.Item>}
            </DropdownButton>
          </Col>
          <Col className="mybutton" md="auto">
            <Button type="button" className="menubutton"  aria-label="Toggle"  onClick={() => this.toggle()}><span className={this.state.open ? 'fa fa-angle-double-up' : 'fa fa-angle-double-down'}></span></Button>
          </Col>
          {(isGraphMap(this.props.type) || ((isPredicateMap(this.props.type) || isObjectMap(this.props.type)) && this.props.size > 1)) &&
          <Col className="mybutton" md="auto">
            <Button type="button" className="menubutton" aria-label="Close" onClick={(event) => this.props.onChange(event, 'delete', this.getPath(), this.props.value)}><span className="fa fa-trash"></span></Button>
          </Col>}
        </Row>}
        <Row>
        <Col>
          <Collapse in={this.state.open}>
            <Container>
              <ValueReference value={this.props.value} type={this.props.type}
                              fixedSubject={this.props.fixedSubject}
                              onChange={(event, attr, path, props, type) => this.props.onChange(event, attr, this.getPath().concat(path), props, type)}/>
              {(isSubjectMap(this.props.type) && this.props.value.hasOwnProperty(r2rml('class'))) &&
              <Row>
                <Col>
                  <Container className="border">
                    <Row className="header">
                      <Col>
                        Classes
                      </Col>
                    </Row>
                  <Row>
                    <Col>
                      {this.props.value[r2rml('class')].map((el,index) =>
                      <Container key={index}>
                        <Row className="grouping">
                          <Col>
                            <InputGroup>
                              <Form.Control value={el['@id']}
                                          onChange={(event) => this.props.onChange(event, r2rml('class'), this.getPath(), this.props.value, '@id')}>
                              </Form.Control>
                              <InputGroup.Append>
                                 <Button onClick={() => this.props.onChange(el['@id'], 'term-map-class-delete', this.getPath(), this.props.value)}>Delete</Button>
                              </InputGroup.Append>
                              </InputGroup>
                          </Col>
                        </Row>
                      </Container>)}
                    </Col>
                  </Row>
                  </Container>
                </Col>
              </Row>}
            </Container>
          </Collapse>
        </Col>
        </Row>
      </Container>
    )
  }

}


export default TermMap;
