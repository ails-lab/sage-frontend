import React from "react";
import Container from "react-bootstrap/Container";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import Form from "react-bootstrap/Form";

import { d2rmlis } from "../../../utils/D2RMLUtils.js";

export class RDBMSSource extends React.Component {
  constructor(props) {
    super(props);

    this.checkFileUploaded = this.checkFileUploaded.bind(this);
  }

  checkFileUploaded(location) {
    for (const i in this.props.files) {
      if (this.props.files[i].name === location) {
        return true;
      }
    }
    return false;
  }

  fileChange(event, name) {
    var files = event.target.files;

    this.props.onFileUpload(this.props.value[d2rmlis('location')], files[0].name, files[0]);
    this.props.onChange({ target: {value: files[0].name } }, d2rmlis('location'), this.props.value)
  }

  render() {
    return (
      <Container className="border">
        <Row className="header">
          <Col>
            Relational Database Details
          </Col>
        </Row>
        <Form.Row>
          <Form.Group as={Col}>
            <Form.Label>Type</Form.Label>
            <Form.Control as="select" value={this.props.value[d2rmlis('rdbms')]['@id']}
                                      onChange={(event) => this.props.onChange(event, d2rmlis('rdbms'), this.props.value)}>
              <option value={d2rmlis('MySQL')}>MySQL</option>
              <option value={d2rmlis('PostgreSQL')}>PostgreSQL</option>
              <option value={d2rmlis('MicrosoftAccess')}>Microsoft Access</option>
            </Form.Control>
          </Form.Group>
        </Form.Row>
        {this.props.value[d2rmlis('rdbms')]['@id'] !== d2rmlis('MicrosoftAccess') &&
        <Form.Row>
          <Form.Group as={Col}>
            <Form.Label>Location</Form.Label>
            <Form.Control value={this.props.value[d2rmlis('location')]}
                          onChange={(event)=> this.props.onChange(event, d2rmlis('location'), this.props.value)}/>
          </Form.Group>
        </Form.Row>}
        {this.props.value[d2rmlis('rdbms')]['@id'] === d2rmlis('MicrosoftAccess') &&
        <div>
        <Form.Row>
          <Form.Group as={Col}>
            <Form.Label>File</Form.Label>
            <Form.Control disabled value={this.props.value[d2rmlis('location')]}
                          onChange={(event)=> this.props.onChange(event, d2rmlis('location'), this.props.value)}
                          isInvalid={!this.checkFileUploaded(this.props.value[d2rmlis('location')])}/>
            <Form.Control.Feedback type="invalid">
              No file has been uploaded.
            </Form.Control.Feedback>
          </Form.Group>
        </Form.Row>
        <Form.Row>
          <Col md="1">
          </Col>
          <Form.Group as={Col}>
{/*              <Form.Label>Change File</Form.Label>*/}
            <Form.Control type="file"
                          onChange={(event)=> this.fileChange(event, this.props.value[d2rmlis('location')])}/>
          </Form.Group>
        </Form.Row>
        </div>}
        <Form.Row>
          <Form.Group as={Col}>
            <Form.Label>Username</Form.Label>
            <Form.Control value={this.props.value[d2rmlis('username')]}
                          onChange={(event)=> this.props.onChange(event, d2rmlis('username'), this.props.value)}/>
          </Form.Group>
          <Form.Group as={Col}>
            <Form.Label>Password</Form.Label>
            <Form.Control value={this.props.value[d2rmlis('password')]}
                          onChange={(event)=> this.props.onChange(event, d2rmlis('password'), this.props.value)}/>
          </Form.Group>
        </Form.Row>
        {this.props.value[d2rmlis('rdbms')]['@id'] !== d2rmlis('MicrosoftAccess') &&
        <Form.Row>
          <Form.Group as={Col}>
            <Form.Label>Database</Form.Label>
            <Form.Control value={this.props.value[d2rmlis('database')]}
                          onChange={(event)=> this.props.onChange(event, d2rmlis('database'), this.props.value)}/>
          </Form.Group>
        </Form.Row>}
      </Container>
    )
  }
}


export default RDBMSSource;
