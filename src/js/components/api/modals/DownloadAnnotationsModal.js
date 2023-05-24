import React, { Component } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";
import LoadingComponent from '../../LoadingComponent';

export class DownloadAnnotationsModal extends Component {
  constructor(props) {
    super(props);

    this.state = {
      show: this.props.show,
      error: false,

      onlyReviewed: false,
      onlyNonRejected: true,
      onlyFresh: true,
      created: true,
      creator: true,
      scope: true,
      score: true,
      selector: true,

      downloading: false
    }

    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleSubmit(event) {
    event.preventDefault();
    this.setState( { downloading: true} )

    this.props.actions('export-annotations', {id: this.props.id, format: this.format.value, archive: this.archive.value,
      onlyReviewed: this.state.onlyReviewed, onlyNonRejected: this.state.onlyNonRejected, onlyFresh: this.state.onlyFresh,
      created: this.state.created, creator: this.state.creator, scope:this.state.scope, score:this.state.score, selector: this.state.selector,
      // defaultScope: this.defaultScope.value
      });
  }

  render() {
    return (
      <Modal show={this.props.show} onHide={this.props.onClose} animation={false} backdrop="static">
        {this.state.downloading &&
          <div className="blur-layer">
            <LoadingComponent text="Exporting annotations" />
          </div>
        }

        <Form onSubmit={this.handleSubmit}>
          <Modal.Header>
            <Modal.Title>Download Annotations</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group>
              <Form.Label>Serialization</Form.Label>
              <Form.Control as="select" ref={node => (this.format = node)}>
                  <option value="JSON-LD">JSON-LD</option>
                  <option value="RDF/XML">RDF/XML</option>
                  <option value="TTL">Turtle</option>
              </Form.Control>
            </Form.Group>
            <Form.Group>
              <Form.Check  label="Include only reviewed annotations"  checked={this.state.onlyReviewed} onClick={() => this.setState({onlyReviewed: !this.state.onlyReviewed})}/>
            </Form.Group>
            <Form.Group>
              <Form.Check  label="Include only non-rejected annotations"  checked={this.state.onlyNonRejected} onClick={() => this.setState({onlyNonRejected: !this.state.onlyNonRejected})}/>
            </Form.Group>
            <Form.Group>
              <Form.Check  label="Include only fresh annotations"  checked={this.state.onlyFresh} onClick={() => this.setState({onlyFresh: !this.state.onlyFresh})}/>
            </Form.Group>
            <Form.Group>
              <Form.Check  label="Include creator"  checked={this.state.creator} onClick={() => this.setState({creator: !this.state.creator})}/>
            </Form.Group>
            <Form.Group>
              <Form.Check  label="Include creation date"  checked={this.state.created} onClick={() => this.setState({created: !this.state.created})}/>
            </Form.Group>
            <Form.Group>
              <Form.Check  label="Include scope"  checked={this.state.scope} onClick={() => this.setState({scope: !this.state.scope})}/>
            </Form.Group>
            <Form.Group>
              <Form.Check  label="Include score"  checked={this.state.score} onClick={() => this.setState({score: !this.state.score})}/>
            </Form.Group>
            <Form.Group>
              <Form.Check  label="Include selector"  checked={this.state.selector} onClick={() => this.setState({selector: !this.state.selector})}/>
            </Form.Group>
            {/*<Form.Group>
              <Form.Label>Default scope</Form.Label>
              <Form.Control ref={node => (this.defaultScope = node)}/>
            </Form.Group>*/}
            <Form.Group>
              <Form.Label>Archive format</Form.Label>
              <Form.Control as="select" ref={node => (this.archive = node)}>
                  <option value="TGZ">TGZ</option>
                  <option value="ZIP">ZIP</option>
              </Form.Control>
            </Form.Group>

          </Modal.Body>
          <Modal.Footer>
            <Button type="submit" variant="primary">
              OK
            </Button>
            <Button variant="secondary" onClick={this.props.onClose}>
              Cancel
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
  )}
}

export default DownloadAnnotationsModal;
