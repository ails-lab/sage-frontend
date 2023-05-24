import React, { Component } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Col from "react-bootstrap/Col";
import BarLoader from "react-spinners/BarLoader";

export class ResultsModal extends Component {
  render() {
    return (
      <Modal size="xl" show={this.props.show} onHide={this.props.onClose} animation={false} backdrop="static">
        <Modal.Header>
          {/*<Modal.Title>{this.props.state.title}</Modal.Title>*/}
          <Modal.Title>Execution result</Modal.Title>
        </Modal.Header>
        <Modal.Body className="scrollContainer">
        {this.props.state.loading &&
          <Col className="loader">
            <BarLoader
              css='spinner'
              height={6}
              width={200}
              color='orange'
              loading={true}/>
          </Col>
        }
        {this.props.state.failed &&
          <Col>
            <span className="error">Loading values failed.</span>
          </Col>
        }
        {this.props.state.loaded && this.props.execution && this.props.execution.text &&
          <code className="scroll">
            <pre>{this.props.execution.text}</pre>
          </code>}
        </Modal.Body>
        <Modal.Footer>
          <Button primary="secondary" onClick={this.props.onClose}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
  )}
}

export default ResultsModal;
