import React, { Component } from "react";
import Container from "react-bootstrap/Container";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import Collapse from "react-bootstrap/Collapse";

import { getTripleStores, getTripleStoreInfo } from '../../utils/TripleStoresAPI.js';
import { throwToast, actionsMenu, toggleBoxColumn, sortByField } from '../../utils/UIUtils';

export class TripleStoresTab extends Component {
  constructor(props) {
    super(props);
    this.state = {
      tripleStores: null,
      selectedTripleStore: null,

      tripleStoresOpen: true,
    };
  }

  getTripleStores() {
    getTripleStores()
      .then(response => {
        this.setState({ tripleStores: response.sort((a,b) => sortByField('name', a, b)) });
      })
      .catch(error => {
        console.error(error);
      });
  }

  getTripleStoreInfo(tripleStore) {
    var _this = this;
    getTripleStoreInfo(tripleStore.id)
      .then(response => {
        this.setState({ selectedTripleStore: response })
      })
      .catch(error => {
        throwToast('error', error.message)
      });
  }

  componentDidMount() {
    this.getTripleStores();
  }

  executeAction(action, params) {
    if (action === 'select-triple-store') {
      this.getTripleStoreInfo(params.tripleStore)
      // this.setState({ selectedTripleStore: params.tripleStore})
    }
  }


  render() {

    return (
      <Container className="pl-2">
        <Row>

          <Col md={3}>
            <Container className={this.state.tripleStores && this.state.tripleStores.length > 0 ? "groupborder" : "groupborder-empty"}>
              <Row className={this.state.tripleStores && this.state.tripleStores.length > 0 ? "header" : "header-empty"}>
                <Col>
                  Triple Stores
                </Col>

                {toggleBoxColumn('tripleStoresOpen', this, 'tripleStores')}
              </Row>

              <Collapse in={this.state.tripleStoresOpen}>
                <div>
                  {this.state.tripleStores && this.state.tripleStores.map((tripleStore, index) => (
                  <Row key={"triple-store-" + index}>
                    <Col md={12} className={this.state.selectedTripleStore && this.state.selectedTripleStore.id === tripleStore.id? " selected-item" : ""}>
                      <span className="lbutton alink" onClick={() => this.executeAction('select-triple-store', { tripleStore: tripleStore })}>
                      {tripleStore.name}
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

                  {this.state.selectedTripleStore &&
                  <Container className="groupborder">
                    <Row className="header">
                      <Col>
                        <span className="crimson-std">Triple Store:</span> {this.state.selectedTripleStore.name}
                      </Col>
                    </Row>

                    <Row className="object-field-row">
                      <Col md={3}>
                        SPARQL endpoint
                      </Col>
                      <Col md={9}>
                        {this.state.selectedTripleStore.sparqlEndpoint}
                      </Col>
                    </Row>

                    <Row className="object-field-row">
                      <Col md={3}>
                        <span>Type</span>
                      </Col>
                      <Col md={9}>
                        {this.state.selectedTripleStore.type.replaceAll("_", " ")}
                      </Col>
                    </Row>

                    <Row className="object-field-row">
                      <Col md={3}>&nbsp;</Col>
                    </Row>

                    {this.state.selectedTripleStore.graphCount &&
                    <Row className="object-field-row">
                      <Col md={3}>
                        Named graphs count
                      </Col>
                      <Col md={9}>
                        {this.state.selectedTripleStore.graphCount}
                      </Col>
                    </Row>}

                    {this.state.selectedTripleStore.triplesCount &&
                    <Row className="object-field-row">
                      <Col md={3}>
                        Triples count
                      </Col>
                      <Col md={9}>
                        {this.state.selectedTripleStore.triplesCount}
                      </Col>
                    </Row>}

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

export default TripleStoresTab;
