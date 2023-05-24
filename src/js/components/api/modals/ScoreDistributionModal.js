import React, { Component } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import ButtonGroup from "react-bootstrap/ButtonGroup";
import BarLoader from "react-spinners/BarLoader";
import { Localizer } from '../../../config/localizer.js'

export class ScoreDistibutionModal extends Component {
  render() {
     //console.log(this.props.distributions);
    return (
      <Modal size="s" show={this.props.show} onHide={this.props.onClose} animation={false} backdrop="static">
        <Modal.Header closeButton>
          <Modal.Title>Score Distribution Modal</Modal.Title>
        </Modal.Header>
        <Modal.Body>
        {this.props.state.loading &&
          <Col className="loader">
            <BarLoader
              css='spinner'
              height={6}
              width={200}
              color='crimson'
              loading={true}/>
          </Col>
        }
        {this.props.state.failed &&
          <Col>
            <span className="error">Loading values failed.</span>
          </Col>
        }
        {this.props.state.loaded &&
        <div className="scrollContainer">
        <div className="scroll">
        {this.props.distributions.map((el, index) =>
          <React.Fragment>
          <Row className="grouping">
            <Col md="auto" className="header red">
              {el.key}
            </Col>
          </Row>
          {el.distribution.map((el2, index) =>
          <Row className="grouping valuerow">
            <Col>
              {el2.lowerBoundIncluded ? '[' : '('}{el2.lowerBound}, {el2.upperBound}{el2.upperBoundIncluded ? ']' : ')'}
            </Col>
            <Col md="auto">
              {el2.count}
            </Col>
          </Row>)}
          </React.Fragment>
        )}
        </div>
        </div>}
        </Modal.Body>
        <Modal.Footer>
          <Button primary="secondary" onClick={this.props.onClose}>
            {Localizer.close[this.props.language]}
          </Button>
        </Modal.Footer>
      </Modal>
  )}
}

export default ScoreDistibutionModal;
