import React, { Component } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";
import Spinner from "react-bootstrap/Spinner";

export class RDFDataFileUploadModal extends Component {
  constructor(props) {
    super(props);

    this.state = {
      // show: this.props.show,
      error: false,
      loading: false,

      file: null,
    }

    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleSubmit(event) {
    event.preventDefault();
    this.setState({ loading: true });
    this.props.onOK(this.props.file ? this.props.file.id : null, this.name.value, this.state.file);
  }

  loadingCompleted() {
    this.setState({ loading: false, file: null });
    this.props.onClose();
  }


  fileChange(event) {
      this.setState({file : event.target.files[0]}); // FileList object
  }

  render() {
    return (
      <Modal show={this.props.show} onHide={this.props.onClose} animation={false} backdrop="static">
        <Form onSubmit={this.handleSubmit}>
          <Modal.Header>
            <Modal.Title>New Content File</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group>
              <Form.Label className="required">Name</Form.Label>
              <Form.Control ref={node => (this.name = node)}
                   onChange={() => this.setState({ error: false })}
                   pattern="\S.*"
                   defaultValue={this.props.file ? this.props.file.name : ""}
                   required/>
            </Form.Group>
            <Form.Control.Feedback type="invalid">
              Please provide a valid name.
            </Form.Control.Feedback>
            <Form.Group>
              <Form.Label>File</Form.Label>
              {this.props.file === null &&
              <Form.Control type="file"
                            onChange={(event) => this.fileChange(event)}
                            required/>}
              {this.props.mapping !== null &&
              <Form.Control type="file"
                            onChange={(event) => this.fileChange(event)}
                            />}
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            {this.state.loading &&
            <Spinner animation="border" role="status">
              <span className="sr-only">Uploading...</span>
            </Spinner>}

            <Button type="submit" variant="primary" disabled={this.state.loading}>
              OK
            </Button>
            <Button variant="secondary" onClick={this.props.onClose} disabled={this.state.loading}>
              Cancel
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
  )}
}

export default RDFDataFileUploadModal;
