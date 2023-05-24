import React, { Component } from "react";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";

import { TIME_OPTIONS } from "../../constants/index.js"

export class PublishableState extends Component {

  render() {
    var time = null;
    var cz
    var ct
    if (this.props.value.createDistributionState === 'NOT_EXECUTED') {
      cz = 'not-executed'
      ct = 'No distribution created'
    } else if (this.props.value.createDistributionState === 'PREPARING_EXECUTION') {
      cz = 'preparing'
      ct = 'Preparing distribution creation'
      time = '(since ' + new Date(this.props.value.createDistributionStartedAt).toLocaleDateString('en-UK', TIME_OPTIONS) + ')';
    } else if (this.props.value.createDistributionState === 'EXECUTING') {
      cz = 'executing'
      ct = 'Creating distribution';
      time = '(since ' + new Date(this.props.value.createDistributionStartedAt).toLocaleDateString('en-UK', TIME_OPTIONS) + ')';
    } else if (this.props.value.createDistributionState === 'EXECUTED') {
      cz = 'executed'
      ct = 'Distribution created'
      time = '(at ' + new Date(this.props.value.createDistributionCompletedAt).toLocaleDateString('en-UK', TIME_OPTIONS) + ')'
    } else if (this.props.value.createDistributionState === 'EXECUTION_FAILED') {
      cz = 'failed'
      ct = 'Creating distribution failed'
      time = '(at ' + new Date(this.props.value.createDistributionCompletedAt).toLocaleDateString('en-UK', TIME_OPTIONS) + ')'
    } else {
      cz = 'not-executed'
      ct = 'No distribition created'
    }

    return (
      <div>
        <div className={cz}>
          {ct}
        </div>
        {(time || (this.props.value.createDistributionMessages && this.props.value.createDistributionMessages.length > 0)) &&
        <div className="executeinfo">
          {this.props.value.createDistributionMessages && this.props.value.createDistributionMessages.map((msg, index) =>
          <Row key={index}>
            <Col md="12">
              {msg.type === 'ERROR' ? <span className='times crimson-std'>{msg.message}</span> : <span className='times blueviolet-std'>{msg.message}</span>}
            </Col>
          </Row>)}
          {time &&
          <Row>
            <Col md="12">
              <span className='times'>{time}</span>
            </Col>
          </Row>}
        </div>}
      </div>
    )
  }
}

export default PublishableState;
