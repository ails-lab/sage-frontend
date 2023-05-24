import React, { Component } from "react";
import Container from "react-bootstrap/Container";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import Collapse from "react-bootstrap/Collapse";

import { getElastics, getElasticInfo } from '../../utils/ElasticsAPI.js';
import { throwToast, actionsMenu, toggleBoxColumn, sortByField } from '../../utils/UIUtils';

export class ElasticsTab extends Component {
  constructor(props) {
    super(props);
    this.state = {
      elastics: null,
      selectedElastic: null,

      elasticsOpen: true,
    };
  }

  getElastics() {
    getElastics()
      .then(response => {
        this.setState({ elastics: response.sort((a,b) => sortByField('name', a, b)) });
      })
      .catch(error => {
        console.error(error);
      });
  }

  getElasticInfo(elastic) {
    var _this = this;
    getElasticInfo(elastic.id)
      .then(response => {
        this.setState({ selectedElastic: response })
      })
      .catch(error => {
        throwToast('error', error.message)
      });
  }

  componentDidMount() {
    this.getElastics();
  }

  executeAction(action, params) {
    if (action === 'select-elastic') {
      this.getElasticInfo(params.elastic)
      // this.setState({ selectedTripleStore: params.tripleStore})
    }
  }


  render() {

    return (
      <Container className="pl-2">
        <Row>

          <Col md={3}>
            <Container className={this.state.elastics && this.state.elastics.length > 0 ? "groupborder" : "groupborder-empty"}>
              <Row className={this.state.elastics && this.state.elastics.length > 0 ? "header" : "header-empty"}>
                <Col>
                  Indices
                </Col>

                {toggleBoxColumn('elasticsOpen', this, 'elastics')}
              </Row>

              <Collapse in={this.state.elasticsOpen}>
                <div>
                  {this.state.elastics && this.state.elastics.map((elastic, index) => (
                  <Row key={"elastic-" + index}>
                    <Col md={12} className={this.state.selectedElastic && this.state.selectedElastic.id === elastic.id? " selected-item" : ""}>
                      <span className="lbutton alink" onClick={() => this.executeAction('select-elastic', { elastic: elastic })}>
                      {elastic.name}
                      </span>
                    </Col>
                  </Row>))}
                </div>
              </Collapse>

            </Container>
          </Col>

          <Col md={9}>
            <Container className="userspace-right">
              <Row className="userspace-right-inner">
                <Col>

                  {this.state.selectedElastic &&
                  <Container className="groupborder">
                    <Row className="header">
                      <Col>
                        <span className="crimson-std">Index:</span> {this.state.selectedElastic.name}
                      </Col>
                    </Row>

                    <Row className="object-field-row">
                      <Col md={3}>
                        Location
                      </Col>
                      <Col md={9}>
                        {this.state.selectedElastic.location}
                      </Col>
                    </Row>

                    <Row className="object-field-row">
                      <Col md={3}>
                        <span>Version</span>
                      </Col>
                      <Col md={9}>
                        {this.state.selectedElastic.version}
                      </Col>
                    </Row>

                  </Container>}

                </Col>

              </Row>
            </Container>
          </Col>

        </Row>
    </Container>
    );
  }
}

export default ElasticsTab;
