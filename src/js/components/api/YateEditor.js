import React, { Component } from "react";
import Button from "react-bootstrap/Button";
import YATE from "perfectkb-yate";
import "perfectkb-yate/dist/yate.min.css";

export class YateEditor extends Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    // Initialize editor's value in localStorage with passed turtleText propery
    let turtleStorage = JSON.parse(localStorage.getItem("yate_editor_docVal"));
    localStorage.setItem("yate_editor_docVal", JSON.stringify({...turtleStorage, val: this.props.turtleText}));
    // Initialize editor's object's value
    let settings = {...YATE.defaults, value: this.props.turtleText};
    YATE(document.getElementById("editor"), settings);
  }

  componentWillReceiveProps(props) {
    let turtleStorage = JSON.parse(localStorage.getItem("yate_editor_docVal"));
    localStorage.setItem("yate_editor_docVal", JSON.stringify({...turtleStorage, val: props.turtleText}));
    let settings = {...YATE.defaults, value: props.turtleText};
    var element = document.getElementById("editor")
    while (element.firstChild) {
      element.removeChild(element.firstChild);
    }
YATE(document.getElementById("editor"), settings);
  }

  saveTurtleText() {
    var text = JSON.parse(localStorage.getItem("yate_editor_docVal")).val;
    var textHasErrors = document.getElementsByClassName("parseErrorIcon").length > 0;

    if (textHasErrors) {
      alert("Your text has syntax errors. Please fix them before continuing.");
      return;
    }

    // TODO: call API to store  turtleText
    console.log(text);
  }

  render() {
    return (
      <div className="container">
        <div id='editor' />
        <div className="d-flex justify-content-end mt-3">
          <Button variant="primary" onClick={() => this.saveTurtleText()}>Save</Button>
        </div>
      </div>
    )
  }
}

export default YateEditor;
