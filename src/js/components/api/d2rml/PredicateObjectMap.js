import React from "react";
import Container from "react-bootstrap/Container";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import Button from "react-bootstrap/Button";
import Collapse from "react-bootstrap/Collapse";
import Dropdown from "react-bootstrap/Dropdown";
import DropdownButton from "react-bootstrap/DropdownButton";

import TermMap from "./TermMap.js";
import TriplesMap from "./TriplesMap.js";

import { r2rml, getTermMapValue } from "../../../utils/D2RMLUtils.js";

class PredicateObjectMap extends React.Component {
  constructor(props) {
    super(props);

    this.state = { open: false }
  }


  toggle() {
    this.setState({ open: !this.state.open});
  }



  render() {
    return (
      <Container className="border">
        <Row className="header">
          <Col className="predicate-object">
            Predicate-Object Map
          </Col>
          {this.props.value.hasOwnProperty(r2rml('predicateMap')) &&
          <Col className="intitle">
            {getTermMapValue(this.props.value[r2rml('predicateMap')][0])}
          </Col>
        }
          <Col className="mybutton" md="auto">
            <DropdownButton size="sm" title="Actions" className="actions">
              <Dropdown.Item  onClick={(event) => this.props.onChange(event, 'add', [ { type: r2rml('predicateMap'), index: (this.props.value.hasOwnProperty(r2rml('predicateMap'))? this.props.value[r2rml('predicateMap')].length : 0) } ], { [r2rml('constant')]:''})}>Add Predicate Map</Dropdown.Item>
              <Dropdown.Item  onClick={(event) => this.props.onChange(event, 'add', [ { type: r2rml('objectMap'), index: (this.props.value.hasOwnProperty(r2rml('objectMap'))? this.props.value[r2rml('objectMap')].length : 0) } ], { [r2rml('constant')]:''})}>Add Object Map</Dropdown.Item>
            </DropdownButton>
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
              <Container>
                {this.props.value.hasOwnProperty(r2rml('predicateMap')) && this.props.value[r2rml('predicateMap')].map((pm, pmindex) =>
                <Row key={pmindex}>
                  <Col>
                    <TermMap value={pm} type="predicate-map" index={pmindex} size={this.props.value[r2rml('predicateMap')].length}
                             onChange={(event, attr, path, props, type) => this.props.onChange(event, attr, path, props, type)}/>
                  </Col>
                </Row>)}
                {this.props.value.hasOwnProperty(r2rml('objectMap')) && this.props.value[r2rml('objectMap')].map((om, omindex) =>
                om.hasOwnProperty(r2rml('parentTriplesMap')) ?
                <Row key={omindex}>
                  <Col>
                  <TriplesMap key={omindex} value={om[r2rml('parentTriplesMap')]} sources={this.props.sources} graphMap={false} index={omindex}
                           fixedSubject={false}
                           onChange={(event, attr, path, props, type) => this.props.onChange(event, attr, [ { type:r2rml('objectMap'), index:omindex }, { type:r2rml('parentTriplesMap') }].concat(path), props, type)}/>
                  </Col>
                </Row>
                :
                <Row key={omindex}>
                  <Col>
                    <TermMap value={om} type="object-map" index={omindex} size={this.props.value[r2rml('objectMap')].length}
                             onChange={(event, attr, path, props, type) => this.props.onChange(event, attr, path, props, type)}/>
                  </Col>
                </Row>)}
              </Container>
            </Collapse>
          </Col>
        </Row>
      </Container>
    )
  }

}


export default PredicateObjectMap;
