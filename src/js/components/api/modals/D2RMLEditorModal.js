import { API_BASE_URL } from '../../../constants/index.js';
import React, { Component } from "react";
import Modal from "react-bootstrap/Modal";
import Container from "react-bootstrap/Container";
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import Tabs from "react-bootstrap/Tabs";
import Tab from "react-bootstrap/Tab";
import Form from "react-bootstrap/Form";
import BarLoader from "react-spinners/BarLoader";

import YATE from "perfectkb-yate";
import "perfectkb-yate/dist/yate.min.css";

import { validateD2RML } from '../../../utils/D2RMLAPI';

export class D2RMLEditorModal extends Component {
  constructor(props) {
    super(props);

    this.handleSubmit = this.handleSubmit.bind(this);
  }

  componentDidMount() {
    //Initialize editor's value in localStorage with passed turtleText propery
    let turtleStorage = JSON.parse(localStorage.getItem("yate_editor_docVal"));
    localStorage.setItem("yate_editor_docVal", JSON.stringify({...turtleStorage, val: this.props.ttl}));
    // Initialize editor's object's value
    let settings = {...YATE.defaults, value: this.props.ttl};
    YATE(document.getElementById("editor"), settings);
    document.getElementById("editor").firstChild.firstChild.style.height = "600px"

    var buttons = document.getElementsByClassName("yate_buttons")[0];
    buttons.remove(buttons.firstChild);

  }

  componentWillReceiveProps(props) {
    if (document.getElementById("editor")) {
      let turtleStorage = JSON.parse(localStorage.getItem("yate_editor_docVal"));
      localStorage.setItem("yate_editor_docVal", JSON.stringify({...turtleStorage, val: props.ttl}));
      let settings = {...YATE.defaults, value: props.ttl};
      var element = document.getElementById("editor")
      while (element.firstChild) {
        element.removeChild(element.firstChild);
      }
      YATE(document.getElementById("editor"), settings);
      document.getElementById("editor").firstChild.firstChild.style.height = "600px"

      var buttons = document.getElementsByClassName("yate_buttons")[0];
      buttons.remove(buttons.firstChild);
}
  }

  handleSubmit(event) {
    event.preventDefault();

    var ttl = JSON.parse(localStorage.getItem("yate_editor_docVal")).val;
    // var textHasErrors = document.getElementsByClassName("parseErrorIcon").length > 0;
    //
    // if (textHasErrors) {
    //   alert("Your text has syntax errors. Please fix them before continuing.");
    //   return;
    // }

    var _this = this;

    validateD2RML(ttl)
      .then(response => {
         _this.props.onOK(ttl, response.parameters)
       })
      .catch(error => {
         alert( error.message )
      })
  }

  render() {
    return (
      <Modal size="xl" show={this.props.show} onHide={this.props.onClose} animation={false} backdrop="static">
        <Form onSubmit={this.handleSubmit}>
          <Modal.Header>
            <Modal.Title>D2RML Editor</Modal.Title>
          </Modal.Header>
          <Modal.Body>
          {this.props.state.loading &&
            <Col className="loader">
              <BarLoader
                css='spinner'
                height={6}
                width={200}
                color='orange'
                loading={true}/>
            </Col>}
            {this.props.state.failed &&
              <Col>
                <span className="error">Loading D2RML document failed.</span>
              </Col>
            }

            <div id='editor' />

          </Modal.Body>
          <Modal.Footer>
            <Button type="submit" variant="primary">
              Save
            </Button>
            <Button variant="secondary" onClick={this.props.onClose}>
              Cancel
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    );
  }
}



export default D2RMLEditorModal;
