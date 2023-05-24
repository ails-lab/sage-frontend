import React, { Component } from "react";
import Container from "react-bootstrap/Container";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";

import { TIME_OPTIONS } from "../../constants/index.js"

export class LifecycleState extends Component {

  renderMapName(name) {
    return name.substring(Math.max(name.lastIndexOf("/"), name.lastIndexOf("#")) + 1);
  }
  render() {

    var time = null;
    var cz
    var ct
    var message = null;
    if (this.props.value.lifecycleState === 'RESUMING') {
      cz = 'executing'
      ct = 'Resuming'
      if (this.props.value.lifecycleStartedAt) {
        time = '(since ' + new Date(this.props.value.lifecycleStartedAt).toLocaleDateString('en-UK', TIME_OPTIONS) + ')';
      }
    } else if (this.props.value.lifecycleState === 'STARTED') {
      cz = 'executed'
      ct = 'Started'
      if (this.props.value.lifecycleStartedAt) {
        time = '(at ' + new Date(this.props.value.lifecycleStartedAt).toLocaleDateString('en-UK', TIME_OPTIONS) + ')'
      }
    } else if (this.props.value.lifecycleState === 'STOPPED') {
      cz = 'executed'
      ct = 'Stopped'
      if (this.props.value.lifecycleCompletedAt) {
        time = '(at ' + new Date(this.props.value.lifecycleCompletedAt).toLocaleDateString('en-UK', TIME_OPTIONS) + ')'
      }
    } else if (this.props.value.lifecycleState === 'RESUMING_FAILED') {
      cz = 'failed'
      ct = 'Resuming failed'
      message = this.props.value.message;
    // } else {
      // cz = 'not-executed'
      // ct = 'Stopped'
    }
     // console.log(this.props.value);

    return (
      <div>
        <div className={cz}>
          {ct}
        </div>
        <div>
          {time &&
            <Row className="executeinfo">
              <Col md="12">
                <span className='times'>{time}</span>
              </Col>
            </Row>}
          {message &&
            <Row className="executeinfo">
              <Col md="12">
                <span className='times'>{message}</span>
              </Col>
            </Row>}
        </div>
      </div>
    )
  }
}

export default LifecycleState;
