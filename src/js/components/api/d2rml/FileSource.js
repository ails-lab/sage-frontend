import React from "react";
import Container from "react-bootstrap/Container";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import Form from "react-bootstrap/Form";
import InputGroup from "react-bootstrap/InputGroup";
import Button from "react-bootstrap/Button";

import { d2rmlis } from "../../../utils/D2RMLUtils.js";

export class FileSource extends React.Component {

  checkFileUploaded(location) {
    for (const i in this.props.files) {
      if (this.props.files[i].name === location) {
        return true;
      }
    }
    return false;
  }

  fileChange(event, index) {
    var files = event.target.files;

    this.props.onFileUpload(this.props.value[d2rmlis('path')][index], files[0].name, files[0]);
    this.props.onChange({ target: {value: files[0].name } }, undefined, [ { type:d2rmlis('path'), index:index } ], this.props.value)
  }

  containerFileChange(event, index) {
    var files = event.target.files;

    this.props.onFileUpload(this.props.value[d2rmlis('containerSource')][d2rmlis('path')][index], files[0].name, files[0]);
    this.props.onChange({ target: {value: files[0].name } }, undefined, [{ type:d2rmlis('containerSource') }, { type:d2rmlis('path'), index:index } ], this.props.value)
  }

  render() {
    // console.log(this.props.value);
    return (
      <Container className="border">
        <Row className="header">
          <Col>
            File Details
          </Col>
        </Row>
        <Row>
          <Col>
            <Container>
            {this.props.value[d2rmlis('path')].map((el, index) =>
              <div key={index}>
              <Row>
                <Col>
                  <InputGroup>
                  <Form.Group as={Col}>
                  <Form.Label>File</Form.Label>
                    <Form.Control disabled value={el}
                                onChange={(event) => this.props.onChange(event, undefined, [ { type:d2rmlis('path'), index:index } ], this.props.value)}
                                isInvalid={this.props.value[d2rmlis('containerSource')] === undefined ? !this.checkFileUploaded(this.props.value[d2rmlis('path')][index]) : false}/>
                    <Form.Control.Feedback type="invalid">
                      No file has been uploaded.
                    </Form.Control.Feedback>
                  </Form.Group>
                     {this.props.value[d2rmlis('path')].length > 1 &&
                     <InputGroup.Append>
                       <Button onClick={() => this.props.onChange(el, 'path-delete', [], this.props.value)}>Delete</Button>
                     </InputGroup.Append>}
                     </InputGroup>
                </Col>
              </Row>
             {this.props.value[d2rmlis('containerSource')] === undefined &&
              <Row>
                <Col md="1">
                </Col>
                <Col>
                  <Form.Group as={Col}>
                    <Form.Control type="file" onChange={(event)=> this.fileChange(event, index)}/>
                  </Form.Group>
                </Col>
              </Row>}
              </div>
            )}

            <Row>
              <Col>
              <Form.Group as={Col}>
                <Form.Label>Encoding</Form.Label>
                <Form.Control value={this.props.value[d2rmlis('encoding')]}
                              onChange={(event)=> this.props.onChange(event, d2rmlis('encoding'), [], this.props.value)}/>
              </Form.Group>
              </Col>
            </Row>

            {this.props.value[d2rmlis('containerSource')] !== undefined && this.props.value[d2rmlis('containerSource')]['@type'] === d2rmlis('FileSource') &&
            <div>
            <Row>
              <Col>
                <InputGroup>
                <Form.Group as={Col}>
                <Form.Label>Container File</Form.Label>
                  <Form.Control disabled value={this.props.value[d2rmlis('containerSource')][d2rmlis('path')]}
                              onChange={(event) => this.props.onChange(event, undefined, [ { type:d2rmlis('containerSource') }, { type:d2rmlis('path'), index:0 } ], this.props.value)}
                              isInvalid={!this.checkFileUploaded(this.props.value[d2rmlis('containerSource')][d2rmlis('path')][0])}/>
                  <Form.Control.Feedback type="invalid">
                    No file has been uploaded.
                  </Form.Control.Feedback>
                </Form.Group>
                   {/*{this.props.value[d2rmlis('path')].length > 1 &&
                   <InputGroup.Append>
                     <Button onClick={() => this.props.onChange(this.props.value[d2rmlis('containerSource')], 'path-delete', [], this.props.value)}>Delete</Button>
                   </InputGroup.Append>} */}
                   </InputGroup>
              </Col>
            </Row>
            <Row>
              <Col md="1">
              </Col>
              <Col>
                <Form.Group as={Col}>
                  <Form.Control type="file" onChange={(event)=> this.containerFileChange(event, 0)}/>
                </Form.Group>
              </Col>
            </Row>
            </div>
           }
            </Container>
          </Col>
        </Row>
      </Container>
    )
  }
}


export default FileSource;
