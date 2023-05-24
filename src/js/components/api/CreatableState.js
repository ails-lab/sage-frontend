import React, { Component } from "react";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import ClipLoader from "react-spinners/ClipLoader";
import DropdownButton from "react-bootstrap/DropdownButton";
import Container from "react-bootstrap/Container";
import Button from "react-bootstrap/Button";


import { TIME_OPTIONS } from "../../constants/index.js"

export class CreatableState extends Component {

  renderMapName(name) {
    return name.substring(Math.max(name.lastIndexOf("/"), name.lastIndexOf("#")) + 1);
  }

  render() {
    // console.log(this.props.value)

    var time = null
    var cz
    var ct
    var message = null;
    if (this.props.value.createMessages && this.props.value.createMessages.length > 0) {
        message = this.props.value.createMessages[0].message
    }

    if (this.props.value.createState === 'NOT_CREATED') {
      cz = 'not-executed'
      ct = 'Not created'
    } else if (this.props.value.createState === 'CREATING') {
      cz = 'executing'
      ct = 'Creating'
      time = '(since ' + new Date(this.props.value.createStartedAt).toLocaleDateString('en-UK', TIME_OPTIONS) + ')';
    } else if (this.props.value.createState === 'DESTROYING') {
      cz = 'executing'
      ct = 'Destroying'
      time = '(since ' + new Date(this.props.value.createStartedAt).toLocaleDateString('en-UK', TIME_OPTIONS) + ')';
    } else if (this.props.value.createState === 'CREATED') {
      cz = 'executed'
      ct = 'Created'
      time = '(at ' + new Date(this.props.value.createCompletedAt).toLocaleDateString('en-UK', TIME_OPTIONS) + ')'
    } else if (this.props.value.createState === 'CREATING_FAILED') {
      cz = 'failed'
      ct = 'Creating failed'
      time = '(at ' + new Date(this.props.value.createCompletedAt).toLocaleDateString('en-UK', TIME_OPTIONS) + ')';
    } else if (this.props.value.createState === 'DESTROYING_FAILED') {
      cz = 'failed'
      ct = 'Destroying failed'
      time = '(at ' + new Date(this.props.value.createCompletedAt).toLocaleDateString('en-UK', TIME_OPTIONS) + ')';
    } else {
      cz = 'not-executed'
      ct = 'Not created'
    }

    return (
      <div>
        <Row className={cz}>

          <Col md="12">
            {ct}
          </Col>
        </Row>
        {(time || (this.props.value.createMessages && this.props.value.createMessages.length > 0)) &&
        <div className="executeinfo">
          {this.props.value.createMessages && this.props.value.createMessages.map((msg, create) =>
          <Row key={create}>
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

        {this.props.value.createExecutionInfo && this.props.value.createExecutionInfo.length > 0 &&
          <Container className='executingtable'>
            <Row>
              <Col md={5} className='executinginfo'>Entity</Col>
              <Col md={3} className='executinginfo'>Total</Col>
              <Col md={2} className='executinginfo'>Failed</Col>
              <Col md={1} className='executinginfo'></Col>
              <Col md={1} className='executinginfo'></Col>
            </Row>
            {this.props.value.createExecutionInfo.map((m, create) =>
                <Row key={create}>
                  {/* <Col md='auto' className='executinginfo'>{m.partialCount ? m.partialCount : ''}</Col> */}
                  <Col md={5} className='executinginfo'> {this.renderMapName(m.triplesMap)}</Col>
                  <Col md={3} className='executinginfo executed '>{m.totalCount ? m.totalCount - m.failures : ''}</Col>
                  <Col md={2} className='executinginfo failed'>{m.totalCount ? m.failures : ''}</Col>
                  <Col md={1} className="executinginfobutton">
                    {/*m.messages && m.messages.length > 0 &&
                    <DropdownButton size="sm"  title={<span title="Show errors" className='fa fa-info'></span>} className="actions">
                      <div className="execution-errors">
                        <span>Errors{m.messages.length < m.failures ? ' (first 5)':''}:</span>
                        {m.messages.map((msg,mindex) =>
                        <Row className="pb-2">
                          <Col>
                            <span className='times crimson-std'>{msg.message}</span>
                          </Col>
                        </Row>)}
                      </div>
                    </DropdownButton>*/}
                  </Col>
                  <Col md={1} className="executinginfo pl-1">
                    {m.started && !m.completed && !m.failed &&
                      <ClipLoader
                      css='spinner'
                        size={10}
                        color='orange'
                        loading={true}
                      />}
                    {m.started && m.completed &&
                      <span className="fa fa-check"></span>
                    }
                    {m.failed &&
                      <span className="fa fa-times failed"></span>
                    }
                  </Col>
                </Row>
            )}
          </Container>}
      </div>)
  }
}

export default CreatableState;
