import React, { Component } from "react";
import Container from "react-bootstrap/Container";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import Collapse from "react-bootstrap/Collapse";

import { getRDFVocabularies } from '../../utils/VocabulariesAPI.js';
import { actionsMenu, toggleBoxColumn, sortByField } from '../../utils/UIUtils';

export class RDFVocabulariesTab extends Component {
  constructor(props) {
    super(props);
    this.state = {
      rdfVocabularies: null,
      selectedRdfVocabulary: null,

      rdfVocabulariesOpen: true,
    };
  }

  getRDFVocabularies() {
    getRDFVocabularies()
      .then(response => {
        this.setState({ rdfVocabularies: response.sort((a,b) => sortByField('name', a, b)) });
      })
      .catch(error => {
        console.error(error);
      });
  }

  componentDidMount() {
    this.getRDFVocabularies();
  }

  executeAction(action, params) {
    if (action === 'select-rdf-vocabulary') {
      this.setState({ selectedRdfVocabulary: params.rdfVocabulary})
    }
  }


  render() {

    return (
      <Container className="pl-2">
        <Row>

          <Col md={3}>
            <Container className={this.state.rdfVocabularies && this.state.rdfVocabularies.length > 0 ? "groupborder" : "groupborder-empty"}>
              <Row className={this.state.rdfVocabularies && this.state.rdfVocabularies.length > 0 ? "header" : "header-empty"}>
                <Col>
                  RDF Vocabularies
                </Col>

                {toggleBoxColumn('rdfVocabulariesOpen', this, 'rdfVocabularies')}
              </Row>

              <Collapse in={this.state.rdfVocabulariesOpen}>
                <div>
                  {this.state.rdfVocabularies && this.state.rdfVocabularies.map((rdfVocabulary, index) => (
                  <Row key={"rdf-vocabulary-" + index}>
                    <Col md={12} className={this.state.selectedRdfVocabulary && this.state.selectedRdfVocabulary.namespace === rdfVocabulary.namespace? " selected-item" : ""}>
                      <span className="lbutton alink" onClick={() => this.executeAction('select-rdf-vocabulary', { rdfVocabulary: rdfVocabulary })}>
                      {rdfVocabulary.name}
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

                  {this.state.selectedRdfVocabulary &&
                  <Container className="groupborder">
                    <Row className="header">
                      <Col>
                        <span className="crimson-std">RDF Vocabulary:</span> {this.state.selectedRdfVocabulary.name}
                      </Col>
                    </Row>

                    <Row className="object-field-row">
                      <Col md={3}>
                        Name
                      </Col>
                      <Col md={9}>
                        {this.state.selectedRdfVocabulary.name}
                      </Col>
                    </Row>

                    <Row className="object-field-row">
                      <Col md={3}>
                        Namespace
                      </Col>
                      <Col md={9}>
                        {this.state.selectedRdfVocabulary.namespace}
                      </Col>
                    </Row>

                    <Row className="object-field-row">
                      <Col md={3}>
                        Prefix
                      </Col>
                      <Col md={9}>
                        {this.state.selectedRdfVocabulary.prefix}
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

export default RDFVocabulariesTab;
