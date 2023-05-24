import React, { Component } from "react";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";

import { Localizer } from '../../config/localizer.js'
import { filterByLanguage } from "../../utils/functions.js";

export class CollectionEntries extends Component {

  render() {
    // console.log(this.props.dataCollectionsItems);
    return (
      <Container fluid  className="searchheader">

      {this.props.searchState.failed &&
        <Col>
        <span className="info">{Localizer.search_failed[this.props.language]}</span>
        </Col>
      }
      {this.props.searchState.loaded && this.props.items.length === 0 &&
        <Col>
        <span className="info">{Localizer.no_results_found[this.props.language]}</span>
        </Col>}
    {this.props.searchState.loaded && this.props.items.length > 0 &&
      <ul className="list-group list-group-flush">
        {this.props.items.map(el => (
          <li className="list-group-item" key={el.items['@id']}>
            <Row>
            <Col md='auto'>
            <Row>
            <span className="incollection">{filterByLanguage(el.items,'http://purl.org/dc/terms/isPartOf', this.props.language)}</span><br/>
            </Row>
            </Col>
            <Col>
            <Row>
            <span className="title">
               <a target="_blank"
                  rel='noreferrer noopener'
                  href={el.items['http://purl.org/dc/terms/source'] === undefined ?
                        el.items['@id'] :
                        el.items['http://purl.org/dc/terms/source'][0]['@id']}>{el.items['@id']}</a></span><br/>
            </Row>
            <Row>
            <span className="title">{filterByLanguage(el.items,'http://www.w3.org/2000/01/rdf-schema#label', this.props.language)}</span><br/>
            </Row>
            <Row>
            {el.items['http://purl.org/dc/terms/references'] && el.items['http://purl.org/dc/terms/references'].length > 0 && <span className='fa fa-compass references'></span>}
            {el.items['http://purl.org/dc/terms/references'] && el.items['http://purl.org/dc/terms/references'].map((ref,index) => (
              <a key={index} target="_blank"
                 rel='noreferrer noopener'
                 href={ref['@id']}><span className="references">{ref['@id']}</span></a>))}
            </Row>
            </Col>
            </Row>
            {/*<span className="creator">{filterLanguage(el.collection,'http://purl.org/dc/elements/1.1/creator', 'el')}</span><br/>
            */}

          </li>
        ))}
      </ul>}
      </Container>
    );
  }
}


export default CollectionEntries;
