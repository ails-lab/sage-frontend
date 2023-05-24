import React from "react";
import Container from "react-bootstrap/Container";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Collapse from "react-bootstrap/Collapse";
import Dropdown from "react-bootstrap/Dropdown";
import DropdownButton from "react-bootstrap/DropdownButton";

import { r2rml, d2rml, lookupSource, } from "../../../utils/D2RMLUtils.js";

import TermMap from "./TermMap.js";
import PredicateObjectMap from "./PredicateObjectMap.js";
import LogicalInput from "./LogicalInput.js";

class TriplesMap extends React.Component {
  constructor(props) {
    super(props);

    this.state = { open: false }
  }

  toggle() {
    this.setState({ open: !this.state.open});
  }

  getLogicalInput(value) {
    // console.log('T');
    // console.log(value.hasOwnProperty(d2rml('logicalSource')) ? value[d2rml('logicalSource')] : value[r2rml('logicalTable')]);
    var source = value.hasOwnProperty(d2rml('logicalSource')) ? value[d2rml('logicalSource')] : value[r2rml('logicalTable')];
    if (source !== null && source.length > 0) {
      // console.log('T1');
      // console.log(source[d2rml('source')][0]['@id']);
      return source[d2rml('source')][0]['@id'];
    } else {
      // console.log('T2');
      return null;
    }
  }

  render() {
    var primary = false;
    if (this.props.value['@type']) {
      for (const i in this.props.value['@type']) {
        if (this.props.value['@type'][i] === d2rml('PrimaryTriplesMap')) {
          primary = true;
          break;
        }
      }
    }

    if (this.props.value['@id']) {
      var p = this.props.value['@id'].lastIndexOf('/');
      var displayPrefix = this.props.value['@id'].substring(0, p + 1)
      var displayId = this.props.value['@id'].substring(p + 1);
    }

    return (
      <Container className="border">
        <Row className="header">
          {displayId &&
          <Col className="mybutton"  md="auto">
            <Button type="button" className="menubutton"  aria-label="Set Primary Mapping" onClick={() => this.props.onChange(null, 'primary-map-change', [], this.props.value)}><span className={primary?'fa fa-bullseye red':'fa fa-bullseye'}></span></Button>
          </Col>}
          <Col>
           {displayId &&
            <Form.Control value={displayId} plaintext className="bold nospace2"
                          onChange={(event) => this.props.onChange(displayPrefix + event.target.value, 'controlled-id', [], this.props.value)}/>}
           {!displayId &&
             "Triples Map" }
          </Col>
          <Col className="mybutton" md="auto">
            <DropdownButton size="sm" title="Actions" className="actions">
              {this.props.graphMap && <Dropdown.Item  onClick={(event) => this.props.onChange(event, 'add', [ { type: r2rml('graphMap'), index: (this.props.value.hasOwnProperty(r2rml('graphMap'))? this.props.value[r2rml('graphMap')].length : 0) } ], { [r2rml('constant')]: '' })}>Add Graph Map</Dropdown.Item>}
              <Dropdown.Item  onClick={(event) => this.props.onChange(event, 'add', [ { type: r2rml('predicateObjectMap'), index: (this.props.value.hasOwnProperty(r2rml('predicateObjectMap'))? this.props.value[r2rml('predicateObjectMap')].length : 0) } ], { })}>Add Predicate-Object Map</Dropdown.Item>
            </DropdownButton>
          </Col>
          <Col className="mybutton" md="auto">
            <Button type="button" className="menubutton"  aria-label="Move Up" onClick={() => this.props.move('up', this.props.value['@id'])}><span className='fa fa-arrow-up'></span></Button>
            <Button type="button" className="menubutton"  aria-label="Move Down"  onClick={() => this.props.move('down', this.props.value['@id'])}><span className='fa fa-arrow-down'></span></Button>
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
{/*            <Row>
              <Col>
                <Form.Group as={Col}>
                  <Form.Label>ID</Form.Label>
                  <Form.Control value={this.props.value['@id']}
                                onChange={(event) => this.props.onChange(event, '@id', [], this.props.value)}/>
                </Form.Group>
              </Col>
            </Row> */}
            {this.props.graphMap && this.props.value.hasOwnProperty(r2rml('graphMap')) && this.props.value[r2rml('graphMap')].map((gm, gmindex) =>
            <Row key={gmindex}>
              <Col>
                <TermMap value={gm} type="graph-map" index={gmindex}
                         onChange={(event, attr, path, props, type) => this.props.onChange(event, attr, path, props, type)}/>
              </Col>
            </Row>)}
            {this.props.value.hasOwnProperty(d2rml('logicalSource')) &&
            <Row>
              <Col>
                  <LogicalInput value={this.props.value[d2rml('logicalSource')]}
                                type={lookupSource(this.props.sources, this.getLogicalInput(this.props.value))}
                                sources={this.props.sources}
                           onChange={(event, attr, path, props, type) => attr === d2rml('source') ? this.props.onChange(event, attr, [], this.props.value, type) :
                                                                                                    this.props.onChange(event, attr, [ { type:d2rml('logicalSource') } ], props, type)}/>
              </Col>
            </Row>}
            {this.props.value.hasOwnProperty(d2rml('logicalTable')) &&
            <Row>
              <Col>
                  <LogicalInput value={this.props.value[d2rml('logicalTable')]} sources={this.props.sources}
                           onChange={(event, attr, path, props, type) => attr === d2rml('source') ? this.props.onChange(event, attr, [], this.props.value, type) :
                                                                                                    this.props.onChange(event, attr, [ { type:d2rml('logicalTable'), index:0 } ], props, type)}/>
              </Col>
            </Row>}
            {this.props.value.hasOwnProperty(d2rml('logicalGraph')) &&
            <Row>
              <Col>
                  <LogicalInput value={this.props.value[d2rml('logicalGraph')]} sources={this.props.sources}
                           onChange={(event, attr, path, props, type) => attr === d2rml('source') ? this.props.onChange(event, attr, [], this.props.value, type) :
                                                                                                    this.props.onChange(event, attr, [ { type:d2rml('logicalTable'), index:0 } ], props, type)}/>
              </Col>
            </Row>}
            {this.props.value.hasOwnProperty(r2rml('subjectMap')) &&
            <Row>
              <Col>
                  <TermMap value={this.props.value[r2rml('subjectMap')]} type="subject-map" index={-1}
                           fixedSubject={this.props.fixedSubject}
                           onChange={(event, attr, path, props, type) => this.props.onChange(event, attr, path, props, type)}/>
              </Col>
            </Row>}
            {this.props.value.hasOwnProperty(r2rml('predicateObjectMap')) && this.props.value[r2rml('predicateObjectMap')].map((po, poindex) =>
            <Row key={poindex}>
              <Col>
                <PredicateObjectMap value={po} index={poindex}
                       onChange={(event, attr, path, props, type) => this.props.onChange(event, attr, [ { type:r2rml('predicateObjectMap'), index:poindex } ].concat(path), props, type)}/>
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


export default TriplesMap;
