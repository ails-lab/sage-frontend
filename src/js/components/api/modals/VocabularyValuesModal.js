import React, { Component } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import Form from "react-bootstrap/Form";

export class VocabularyValuesModal extends Component {
  constructor(props) {
    super(props);

    this.state = {
      keys: new Map()
    }
    // this.setState(this.createState(props));
  }

  createState(props) {
      var state = {};
      //
      // var keys = [];
      // for (const i in props.value) {
      //   keys.push(i);
      //
      //   var details = [];
      //   for (const j in props.value[i].details) {
      //     var el = {...props.value[i].details[j]}
      //     if (el.state === 'ADD') {
      //       el = {...el, originalValue: el.value}
      //     }
      //     if (el.state) {
      //       el = {...el, originalState: el.state}
      //     }
      //
      //     details.push(el);
      //   }
      //
      //   var entry = { value: props.value[i].value,
      //                 details,
      //                 deleted: []
      //               }
      //
      //   state['element' + i] = entry;
      // }

      state.keys = props.value;

      return state;
  }


  componentWillReceiveProps(props) {
    this.setState(this.createState(props))
  }

  newAnnotation(event, index) {
    var obj = this.state['element' + index];
    obj = { ...obj, details : obj.details.concat({value:'', state:'ADD'})}

    this.setState({ ['element' + index]: obj })

    // console.log(obj)
  }

  editAnnotation(event, index, order) {
    var obj = this.state['element' + index]
    obj = { ...obj, details : obj.details.map((el,i) => {
       return i !== order ? el
                          : { ...el, value: event.target.value} })
       }

    this.setState({  ['element' + index]: obj  })

    // console.log(obj)
  }

  deleteAnnotation(index, order) {
    var obj = this.state['element' + index]

    var ann = obj.details[order];
    if (ann.state === 'ADD') {
      obj = { ...obj, details : obj.details.filter((el,i) => i !== order ), deleted: obj.deleted.concat(obj.details[order])}
    } else {
      obj = { ...obj, details : obj.details.map((el,i) => {
         return i !== order ? el
                            : el.state === 'DELETE' ? {...el, state: 'UNDELETE'} : {...el, state: 'DELETE'} })
         }
    }

    this.setState({  ['element' + index]: obj  })

    console.log(obj)
  }

  prepareCommit() {
    var edits = [];
    for (const i in this.state.keys) {
      var obj = this.state['element' + i];
      for (const j in obj.details) {
        if (obj.details[j].state === 'ADD') {
          if (obj.details[j].originalState === 'ADD' && obj.details[j].value !== obj.details[j].originalValue) {
            edits.push( {propertyValue: obj.value, id: obj.details[j].id, annotationValue: obj.details[j].value, editType:'ADD'} ) // change annotationEdit value
          } else if (!obj.details[j].originalState && obj.details[j].value.length > 0) {
            edits.push( {propertyValue: obj.value, annotationValue: obj.details[j].value, editType:'ADD'} ) // add annotationEdit
          }
        } else if (obj.details[j].state === 'UNDELETE') {
          if (obj.details[j].originalState === 'DELETE') {
            edits.push( {propertyValue: obj.value, id: obj.details[j].id}) //delete annotationEdit
          }
        } else if (obj.details[j].state === 'DELETE') {
          if (!obj.details[j].originalState) {
            edits.push( {propertyValue: obj.value, annotationValue: obj.details[j].value, editType:'DELETE'}) //change annotationEdit state
          }
        }
    }

    for (const j in obj.deleted) {
      edits.push( {propertyValue: obj.value, id: obj.deleted[j].id})      //delete annotationEdit
    }
  }

  return edits;
}

  render() {
    return (
      <Modal size="xl" show={this.props.show} onHide={this.props.onClose} animation={false} backdrop="static">
        <Modal.Header>
          <Modal.Title>Vocabulary</Modal.Title>
        </Modal.Header>
        <Modal.Body>
        {Array.from(this.state.keys.entries()).map(([key, value]) =>
          <Row className="grouping bottomrow"  key={key}>
            <Col>
              {/*<code><pre>{this.state['element' + el].value}</pre></code>*/}
              <Row className="grouping bottomrow">
              {value.map(el =>
                <Col>
                {el.text}
                </Col>
              )}
              </Row>
            </Col>
{/*}
            <Col>
              <Container>
              {this.state['element' + el].details.map((ann,index) =>
                <Row key={index}>
                  <Col md="auto">
                    <Button type="button" className="deleteeditbutton" aria-label="Delete" onClick={(event) => this.deleteAnnotation(el, index)}><span className="fa fa-times"></span></Button>
                  </Col>
                  {ann.state !== 'ADD' ?
                    <Col>
                      <a href={ann.value} rel='noreferrer noopener' target="_blank"><span className={ann.state === "DELETE" ? "td-deleted" : "td-normal"}>{ann.value}</span></a>
                    </Col>
                  :
                    <Col>
                      <Row>
                        <Col>
                          <Form.Control value={ann.value} onChange={(event) => this.editAnnotation(event, el, index)}/>
                        </Col>
                        <Col md="auto">
                          <a href={ann.value} rel='noreferrer noopener' target="_blank"><span className="fa fa-link"/></a>
                        </Col>
                      </Row>
                    </Col>
                  }
                </Row>
              )}
              <Row>
                <Col md="auto">
                  <Button type="button" className="deleteaddbutton" aria-label="New" onClick={(event) => this.newAnnotation(event,el)}><span className="fa fa-plus"></span></Button>
                </Col>
              </Row>
              </Container>
            </Col> */}
          </Row>
        )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={() => this.props.actions('commit-annotation-edits', { id: this.props.id, edits: this.prepareCommit()})}>
            Commit Changes
          </Button>
          <Button variant="secondary" onClick={this.props.onClose}>
            Discard Changes
          </Button>
        </Modal.Footer>
      </Modal>
  )}
}

export default VocabularyValuesModal;
