import React, { Component } from "react";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import ClipLoader from "react-spinners/ClipLoader";
import DropdownButton from "react-bootstrap/DropdownButton";
import Container from "react-bootstrap/Container";
import Button from "react-bootstrap/Button";


import { TIME_OPTIONS } from "../../constants/index.js"

export class RunnableState extends Component {

  renderMapName(name) {
    return name.substring(Math.max(name.lastIndexOf("/"), name.lastIndexOf("#")) + 1);
  }

  render() {
    // console.log(this.props.value)

    var time = null
    var cz
    var ct
    var message = null;
    if (this.props.value.runMessages && this.props.value.runMessages.length > 0) {
        message = this.props.value.runMessages[0].message
    }

    if (this.props.value.runState === 'NOT_RUN') {
      cz = 'not-executed'
      ct = 'Not run'
    } else if (this.props.value.runState === 'RUNNING') {
      cz = 'executing'
      ct = 'Running'
      time = '(since ' + new Date(this.props.value.runStartedAt).toLocaleDateString('en-UK', TIME_OPTIONS) + ')';
    } else if (this.props.value.runState === 'RUN') {
      cz = 'executed'
      ct = 'Run'
      time = '(at ' + new Date(this.props.value.runCompletedAt).toLocaleDateString('en-UK', TIME_OPTIONS) + ')'
    } else if (this.props.value.runState === 'RUNNING_FAILED') {
      cz = 'failed'
      ct = 'Running failed'
      time = '(at ' + new Date(this.props.value.runCompletedAt).toLocaleDateString('en-UK', TIME_OPTIONS) + ')';
    } else {
      cz = 'not-executed'
      ct = 'Not run'
    }

    return (
      <div>
        <Row className={cz}>

          <Col md="12">
            {ct}
          </Col>
        </Row>
        {(time || (this.props.value.runMessages && this.props.value.runMessages.length > 0)) &&
        <div className="executeinfo">
          {this.props.value.runMessages && this.props.value.runMessages.map((msg, run) =>
          <Row key={run}>
            <Col md="12">
              {msg.type === 'ERROR' ? <span className='times crimson-std'>{msg.message}</span> : <span className='times blueviolet-std'>{msg.message}</span>}
            </Col>
          </Row>)}
          {time &&
          <Row>
            <Col md="12">
              <span className='times'>{time}</span>
              {/*this.props.value.elasticConfiguration !== null && this.props.value.elasticConfiguration !== undefined &&
              <span className='times pl-2'>@{this.props.value.elasticConfiguration}</span>*/}
            </Col>
          </Row>}
        </div>}
      </div>)
  }
}

export default RunnableState;
