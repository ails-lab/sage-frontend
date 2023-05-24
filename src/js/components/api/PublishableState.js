import React, { Component } from "react";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";

import { TIME_OPTIONS } from "../../constants/index.js"

export class PublishableState extends Component {

  render() {
    var time = null;
    var cz
    var ct

     // console.log(this.props.value);

    if (this.props.value.publishState === 'UNPUBLISHED') {
      cz = 'not-executed'
      ct = 'Not published'
    } else if (this.props.value.publishState === 'PUBLISHING') {
      cz = 'executing'
      ct = 'Publishing';
      time = '(since ' + new Date(this.props.value.publishStartedAt).toLocaleDateString('en-UK', TIME_OPTIONS) + ')';
    } else if (this.props.value.publishState === 'UNPUBLISHING') {
      cz = 'executing'
      ct = 'Unpublishing';
      time = '(since ' + new Date(this.props.value.publishStartedAt).toLocaleDateString('en-UK', TIME_OPTIONS) + ')'
    } else if (this.props.value.publishState === 'PUBLISHED_PRIVATE') {
      cz = 'executed'
      ct = 'Published private'
      time = '(at ' + new Date(this.props.value.publishCompletedAt).toLocaleDateString('en-UK', TIME_OPTIONS) + ')'
    } else if (this.props.value.publishState === 'PUBLISHED_PUBLIC') {
      cz = 'executed'
      ct = 'Published public'
      time = '(at ' + new Date(this.props.value.publishCompletedAt).toLocaleDateString('en-UK', TIME_OPTIONS) + ')'
    } else if (this.props.value.publishState === 'PUBLISHED') {
      cz = 'executed'
      ct = 'Published'
      time = '(at ' + new Date(this.props.value.publishCompletedAt).toLocaleDateString('en-UK', TIME_OPTIONS) + ')'
    } else if (this.props.value.publishState === 'PUBLISHING_FAILED') {
      cz = 'failed'
      ct = 'Publishing failed'
      time = '(at ' + new Date(this.props.value.publishCompletedAt).toLocaleDateString('en-UK', TIME_OPTIONS) + ')';
    } else if (this.props.value.publishState === 'WAITING_TO_PUBLISH') {
      cz = 'waiting'
      ct = 'Queued for publication';
      time = '(since ' + new Date(this.props.value.publishStartedAt).toLocaleDateString('en-UK', TIME_OPTIONS) + ')'
    } else if (this.props.value.publishState === 'PUBLISHING_CANCELLED') {
      cz = 'failed'
      ct = 'Publication canceled';
      time = '(at ' + new Date(this.props.value.publishCompletedAt).toLocaleDateString('en-UK', TIME_OPTIONS) + ')'
    } else {
      cz = 'not-executed'
      ct = 'Not published'
    }

    return (
      <div>
        <div className={cz}>
          {ct}
        </div>
        {(time || (this.props.value.publishMessages && this.props.value.publishMessages.length > 0)) &&
          <div className="executeinfo">
            {this.props.value.publishMessages && this.props.value.publishMessages.map((msg, index) =>
            <Row key={index}>
              <Col md="12">
                {msg.type === 'ERROR' ? <span className='times crimson-std'>{msg.message}</span> : <span className='times blueviolet-std'>{msg.message}</span>}
              </Col>
            </Row>)}
            {time &&
            <Row>
              <Col md="12">
                <span className='times'>{time}</span>
                {this.props.value.publishDatabase !== null && this.props.value.publishDatabase !== undefined &&
                <span className='times pl-2'>@{this.props.value.publishDatabase}</span>}
              </Col>
            </Row>}
          </div>}
        </div>
    )
  }
}

export default PublishableState;
