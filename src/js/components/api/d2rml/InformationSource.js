import React from "react";
import Container from "react-bootstrap/Container";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Collapse from "react-bootstrap/Collapse";

import { d2rmlis } from "../../../utils/D2RMLUtils.js";

import HTTPSource from "./HTTPSource.js";
import RDBMSSource from "./RDBMSSource.js";
import SPARQLService from "./SPARQLService.js";
import FileSource from "./FileSource.js";


class InformationSource extends React.Component {
  constructor(props) {
    super(props);

    this.state = { open: false }
  }

  toggle() {
    this.setState({ open: !this.state.open});
  }

  getPath() {
    // if (isSubjectMap(this.props.type)) {
      // return [ { type:r2rml('subjectMap'), index:this.props.index } ];
    // } else if (isPredicateMap(this.props.type)) {
    //   return [ { type:r2rml('predicateMap'), index:this.props.index } ];
    // } else if (isObjectMap(this.props.type)) {
    //   return [ { type:r2rml('objectMap'), index:this.props.index } ];
    // } else if (isGraphMap(this.props.type)) {
    //   return [ { type:r2rml('graphMap'), index:this.props.index } ];
    // }
  }

  render() {

    var p = this.props.value['@id'].lastIndexOf('/');
    var displayPrefix = this.props.value['@id'].substring(0, p + 1)
    var displayId = this.props.value['@id'].substring(p + 1);

    return (
      <Container className="border">
        <Row className="header">
          <Col className="mybutton"  md="auto">
            <span className='fa fa-bullseye close editbutton'></span>
          </Col>
          <Col>
            <Form.Control value={displayId} plaintext className="bold nospace2"
                          onChange={(event) => this.props.onChange(displayPrefix + event.target.value, 'controlled-id', [], this.props.value)}/>

          </Col>
          <Col className="mybutton" md="auto">
            <Button type="button" className="menubutton"  aria-label="Toggle"  onClick={() => this.toggle()}><span className={this.state.open ? 'fa fa-angle-double-up' : 'fa fa-angle-double-down'}></span></Button>
          </Col>
          <Col className="mybutton" md="auto">
            <Button type="button" className="menubutton" aria-label="Delete" onClick={(event) => this.props.onChange(event, 'delete', [], this.props.value)}><span className="fa fa-trash"></span></Button>
          </Col>
        </Row>
        <Row>
        <Col>
        <Collapse in={this.state.open}>
          <Container>
            <Row>
              <Col>
                <Form.Group as={Col}>
                  <Form.Label>Είδος</Form.Label>
                  <Form.Control as="select" value={this.props.value['@type']}
                                onChange={(event) => this.props.onChange(event, '@type', [], this.props.value)}>
                    <option value={d2rmlis('HTTPSource')}>HTTP Source</option>
                    <option value={d2rmlis('RDBMSSource')}>Relational Database</option>
                    <option value={d2rmlis('SPARQLService')}>SPARQL Service</option>
                    <option value={d2rmlis('FileSource')}>Local File(s)</option>
                  </Form.Control>
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col>
              {this.props.value['@type'] === d2rmlis('HTTPSource') &&
              <HTTPSource value={this.props.value}
                          onChange={(event, attr, path, props) => this.props.onChange(event, attr, path, props)}/>}
              {this.props.value['@type'] === d2rmlis('RDBMSSource') &&
              <RDBMSSource value={this.props.value} files={this.props.files}
                          onFileUpload={(oldname, newname, blob) => this.props.onFileUpload(oldname, newname, blob)}
                          onChange={(event, attr, props) => this.props.onChange(event, attr, [], props)}/>}
              {this.props.value['@type'] === d2rmlis('SPARQLService') &&
              <SPARQLService value={this.props.value}
                           onChange={(event, attr, props) => this.props.onChange(event, attr, [], props)}/>}
              {this.props.value['@type'] === d2rmlis('FileSource') &&
               <FileSource value={this.props.value} files={this.props.files}
                           onFileUpload={(oldname, newname, blob) => this.props.onFileUpload(oldname, newname, blob)}
                           onChange={(event, attr, path, props) => this.props.onChange(event, attr, path, props)}/>}
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


export default InformationSource;
