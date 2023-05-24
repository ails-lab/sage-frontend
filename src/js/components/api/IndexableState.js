import React, { Component } from "react";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import ClipLoader from "react-spinners/ClipLoader";
import DropdownButton from "react-bootstrap/DropdownButton";
import Container from "react-bootstrap/Container";
import Button from "react-bootstrap/Button";


import { TIME_OPTIONS } from "../../constants/index.js"

export class IndexableState extends Component {

  renderMapName(name) {
    return name.substring(Math.max(name.lastIndexOf("/"), name.lastIndexOf("#")) + 1);
  }

  render() {
    // console.log(this.props.value)
    return (
      <div>
      {this.props.value.index && this.props.value.index.map(index => {
        var time = null
        var cz
        var ct
        var message = null;
        if (index.indexMessages && index.indexMessages.length > 0) {
            message = index.indexMessages[0].message
        }

        if (index.indexState === 'NOT_INDEXED') {
          cz = 'not-executed'
          ct = 'Not indexed'
        } else if (index.indexState === 'INDEXING') {
          cz = 'executing'
          ct = 'Indexing'
          time = '(since ' + new Date(index.indexStartedAt).toLocaleDateString('en-UK', TIME_OPTIONS) + ')';
        } else if (index.indexState === 'UNINDEXING') {
          cz = 'executing'
          ct = 'Unindexing'
          time = '(since ' + new Date(index.indexStartedAt).toLocaleDateString('en-UK', TIME_OPTIONS) + ')';
        } else if (index.indexState === 'INDEXED') {
          cz = 'executed'
          ct = 'Indexed'
          time = '(at ' + new Date(index.indexCompletedAt).toLocaleDateString('en-UK', TIME_OPTIONS) + ')'
        } else if (index.indexState === 'INDEXING_FAILED') {
          cz = 'failed'
          ct = 'Indexing failed'
          time = '(at ' + new Date(index.indexCompletedAt).toLocaleDateString('en-UK', TIME_OPTIONS) + ')';
        } else if (index.indexState === 'UNINDEXING_FAILED') {
          cz = 'failed'
          ct = 'Unindexing failed'
          time = '(at ' + new Date(index.indexCompletedAt).toLocaleDateString('en-UK', TIME_OPTIONS) + ')';
        } else {
          cz = 'not-executed'
          ct = 'Not indexed'
        }

        return (
          <div>
            <Row className={cz}>
              <Col md={2}>
              </Col>
              <Col md="8">
                {ct}
              </Col>
              <Col md={2}>
                <Button type="button" className="deleteeditbutton mt-0" aria-label="Delete"
                                disabled={index.indexState != 'INDEXED' && index.indexState != 'UNINDEXING_FAILED'}
                                onClick={(event) => this.props.actions('unindex-dataset', {indexStructureId: index.indexStructureId})}>
                  <span className="menu-icon fa fa-times fa-sm" />
                </Button>
                <Button type="button" className="deleteeditbutton mt-0" aria-label="Delete"
                                disabled={index.indexState != 'INDEXING'}
                                onClick={(event) => this.props.actions('stop-indexing-dataset', {indexStructureId: index.indexStructureId})}>
                  <span className="menu-icon fa fa-stop fa-sm" />
                </Button>
              </Col>
            </Row>
            {(time || (index.indexMessages && index.indexMessages.length > 0)) &&
            <div className="executeinfo">
              {index.indexMessages && index.indexMessages.map((msg, index) =>
              <Row key={index}>
                <Col md="12">
                  {msg.type === 'ERROR' ? <span className='times crimson-std'>{msg.message}</span> : <span className='times blueviolet-std'>{msg.message}</span>}
                </Col>
              </Row>)}
              {time &&
              <Row>
                <Col md="12">
                  <span className='times pr-5'>{index.indexStructure}</span>
                  <span className='times'>{time}</span>
                  {index.indexDatabase !== null && index.indexDatabase !== undefined &&
                  <span className='times pl-2'>@{index.indexDatabase}</span>}
                </Col>
              </Row>}
            </div>}

            {index.indexExecutionInfo && index.indexExecutionInfo.length > 0 &&
              <Container className='executingtable'>
                <Row>
                  <Col md={5} className='executinginfo'>Entity</Col>
                  <Col md={3} className='executinginfo'>Total</Col>
                  <Col md={2} className='executinginfo'>Failed</Col>
                  <Col md={1} className='executinginfo'></Col>
                  <Col md={1} className='executinginfo'></Col>
                </Row>
                {index.indexExecutionInfo.map((m, index) =>
                    <Row key={index}>
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
        })}
        </div>
    )
  }
}

export default IndexableState;
