import React, { Component } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import ButtonGroup from "react-bootstrap/ButtonGroup";
import BarLoader from "react-spinners/BarLoader";
import { Localizer } from '../../../config/localizer.js'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faGlobe } from '@fortawesome/free-solid-svg-icons'

export class PropertyValuesModal extends Component {

  render() {
    // console.log(this.props.value);
    return (
      <Modal size="xl" show={this.props.show} onHide={this.props.onClose} animation={false} backdrop="static">
        <Modal.Header closeButton>
          <Modal.Title>{Localizer.values[this.props.language]}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {this.props.state.loading &&
            <Col className="loader">
              <BarLoader
                css='spinner'
                height={6}
                width={200}
                color='crimson'
                loading={true}/>
            </Col>
          }
          {this.props.state.failed &&
            <Col>
              <span className="error">Loading values failed.</span>
            </Col>
          }
          {this.props.state.loaded && this.props.controls &&
            <Row className="bottomrow">
              <Col md="auto"></Col>
              <Col><Row>Total Values: {this.props.values.totalCount}</Row><Row>Distinct Values: {this.props.values.distinctTotalCount}</Row></Col>
              <Col md="auto">
                <ButtonGroup>
                  <Button variant="secondary" onClick={() => this.props.valueActions('show-values', this.props.onPropertyPath, "ALL")}>{Localizer.all_values[this.props.language]}</Button>
                  <Button variant="secondary" onClick={() => this.props.valueActions('show-values', this.props.onPropertyPath, "LITERAL")}>{Localizer.literals[this.props.language]}</Button>
                  <Button variant="secondary" onClick={() => this.props.valueActions('show-values', this.props.onPropertyPath, "IRI")}>{Localizer.iris[this.props.language]}</Button>
                </ButtonGroup>
              </Col>
          </Row>}
          {this.props.state.loaded &&
            <div className="scrollContainer">
              <div className="scroll">
              {this.props.values.values.map((el, index) =>
                <Row className="grouping bottomrow" key={index}>
                  <Col md="auto align-items-center pt-2">
                    {index +1}
                  </Col>
                  <Col className="property-value align-items-center pr-1">
                    {el.value.iri && this.props.endpoint === null &&
                        <code><pre class='mb-0'><a target="_blank" rel='noopener noreferrer' href={el.value.iri}>{el.value.iri}</a></pre></code> }
                    {el.value.iri && this.props.endpoint !== null &&
                        <code><pre class='mb-0'><a target="_blank" rel='noopener noreferrer' href={this.props.database.lodview + 'queryResource?iri=' + encodeURIComponent(el.value.iri) + '&endpoint=' + this.props.endpoint}>{el.value.iri}</a></pre></code>}
                    {el.value.lexicalForm &&
                      <code><pre class='mb-0'>{el.value.lexicalForm}
                      {el.value.language &&
                        <div><span title="Literal language" class="litlanguage">{el.value.language}</span></div>}
                      </pre></code>}
                  </Col>
                  {this.props.controls &&
                  <Col md="auto align-items-center pt-2">
                  <Container className="annotation-uris sticky-value">
                    <Row><span title="Items count" className="annotation-uris-count">{el.count}</span></Row>
                      <Row><Button type="button" className="menubutton annotation-uris-browse"  aria-label="Browse" onClick={() => this.props.actions('get-items-by-property-value', {onPropertyPath : this.props.onPropertyPath, value: el.value })}><FontAwesomeIcon title="Browse items" className="fa" icon={faGlobe}/></Button></Row>
                  </Container>
                  </Col>
                }
                </Row>
              )}
              </div>
            </div>}
        </Modal.Body>
        <Modal.Footer>
          <Button primary="secondary" onClick={this.props.onClose}>
            {Localizer.close[this.props.language]}
          </Button>
        </Modal.Footer>
      </Modal>
  )}
}

export default PropertyValuesModal;
