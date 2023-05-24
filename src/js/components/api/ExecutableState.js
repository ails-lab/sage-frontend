import React, { Component } from "react";
import Container from "react-bootstrap/Container";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import ClipLoader from "react-spinners/ClipLoader";
import DropdownButton from "react-bootstrap/DropdownButton";

import { TIME_OPTIONS } from "../../constants/index.js"

export class ExecutableState extends Component {

  renderMapName(name) {
    return name.substring(Math.max(name.lastIndexOf("/"), name.lastIndexOf("#")) + 1);
  }

  render() {

    var time = null;
    var cz
    var ct
    var message = null;
    if (this.props.value.executeMessages && this.props.value.executeMessages.length > 0) {
        message = this.props.value.executeMessages[0].message
    }

    // console.log(this.props.value)

    if (this.props.value.executeState === 'NOT_EXECUTED') {
      cz = 'not-executed'
      ct = 'Not executed'
    } else if (this.props.value.executeState === 'EXECUTING') {
      cz = 'executing'
      ct = 'Executing'
      time = '(since ' + new Date(this.props.value.executeStartedAt).toLocaleDateString('en-UK', TIME_OPTIONS) + ')';
    } else if (this.props.value.executeState === 'EXECUTED') {
      cz = 'executed'
      ct = 'Executed'
      time = '(at ' + new Date(this.props.value.executeCompletedAt).toLocaleDateString('en-UK', TIME_OPTIONS) + ')'
    } else if (this.props.value.executeState === 'EXECUTION_FAILED') {
      cz = 'failed'
      ct = 'Execution failed'
      time = '(at ' + new Date(this.props.value.executeCompletedAt).toLocaleDateString('en-UK', TIME_OPTIONS) + ')';
    } else {
      cz = 'not-executed'
      ct = 'Not executed'
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
                {this.props.value.executeCount >= 0 &&
                <span className='times pl-4'>items: {this.props.value.executeCount}</span>}
              </Col>
            </Row>}
          {message &&
            <Row className="executeinfo">
              <Col md="auto">
                <span className='times crimson-std'>{message}</span>
              </Col>
            </Row>}
          {this.props.value.d2rmlExecution && this.props.value.d2rmlExecution.length > 0 &&
            <Container className='executingtable'>
            <Row>
              <Col md={5} className='executinginfo'>Mapping</Col>
              <Col md={3} className='executinginfo'>Total</Col>
              <Col md={2} className='executinginfo'>Failed</Col>
              <Col md={1} className='executinginfo'></Col>
              <Col md={1} className='executinginfo'></Col>
              {/* <Col className='executinginfo'> {this.renderMapName(m.triplesMap)}</Col>
              <Col className='executinginfo'> {this.renderMapName(m.dataSource)}</Col> */}
              {/* <Col className='executinginfo'>{m.key}</Col> */}
            </Row>
              {this.props.value.d2rmlExecution.map((m, index) =>
                  <Row key={index}>
                    {/* <Col md='auto' className='executinginfo'>{m.partialCount ? m.partialCount : ''}</Col> */}
                    <Col md={5} className='executinginfo'> {this.renderMapName(m.triplesMap)}</Col>
                    <Col md={3} className='executinginfo executed '>{m.totalCount ? m.totalCount - m.failures : ''}</Col>
                    <Col md={2} className='executinginfo failed'>{m.totalCount ? m.failures : ''}</Col>
                    <Col md={1} className="executinginfobutton">
                      {m.messages && m.messages.length > 0 &&
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
                      </DropdownButton>}
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
        </div>
      </div>
    )
  }
}

export default ExecutableState;
