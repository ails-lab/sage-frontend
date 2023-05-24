import React, { Component } from "react";
// import { connect } from "react-redux";
// import { getCollections, selectCollection } from "../actions/index";
import { filterByLanguage } from "../utils/functions.js";
import Container from "react-bootstrap/Container";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import Collapse from "react-bootstrap/Collapse";
import {isPublicDataset} from "../utils/DatasetUtils.js"
import Button from "react-bootstrap/Button";

export function processDatasets(datasets) {
  var dmap = new Map();
  datasets.map(el => {el.children = [];  dmap.set(el.dataset['@id'], el)});

  datasets.map(el => {
    if (el.dataset['@type'].includes('http://sw.islab.ntua.gr/semaspace/model/DataCatalog')) {
      for (var i in el.dataset['http://purl.org/dc/elements/1.1/hasPart']) {
        var part = el.dataset['http://purl.org/dc/elements/1.1/hasPart'][i]['@id']
        if (dmap.get(part) !== undefined) {
          el.children.push(dmap.get(part));
          dmap.delete(part);
        }
      }
    }
  });
  return dmap;
}

export class Datasets extends Component {
  constructor(props)  {
    super(props);

    this.state = {
      type: ""
    };
  }

  toggle(el) {
    this.setState({ ['open:' + el]: !this.state['open:' + el]});
  }

  selectDataset(dataset) {
    // if (this.state.type === "assigned-datasets") {
      var elements = document.getElementsByClassName("selected-item");
      for (let element of elements) {
        element.classList.remove("selected-item");
      }
      var activeDataset = document.getElementById(dataset['@id']);
      activeDataset.classList.add("selected-item");
    // }
    this.props.actions('select-dataset', { dataset: dataset });
  }

  componentWillReceiveProps(props) {
    var obj = {};
    var _this = this;
    if (props.type) {
      this.setState({ type: props.type });
    }
    props.datasets.map(el => {obj = { ...obj, ['open:' + el.dataset['@id']]: !_this.state['open:' + el.dataset['@id']] ? false: _this.state['open:' + el.dataset['@id']] }});
    this.setState(obj);
  }

  jsonldsort(a,b) {
    var t1 = filterByLanguage(a.dataset,'http://purl.org/dc/terms/title', 'en');
    var t2 = filterByLanguage(b.dataset,'http://purl.org/dc/terms/title', 'en');

    if (t1 < t2 ) {
        return -1;
      } else if (t1 > t2) {
        return 1;
      } else {
        return 0;
      }
  }

  render() {
    var dmap = processDatasets(this.props.datasets);

    return (
      <div className="reset-margins-published text-truncate">
        {Array.from(dmap.values()).sort(this.jsonldsort).map(el => (
          <div key={el.dataset['@id']} >
            {/*<Row id={el.dataset['@id']} className={"w-100 lbutton alink " + (el.dataset['@type'].includes('http://sw.islab.ntua.gr/semaspace/model/DataCatalog') ? " catalog" :" ") + (el.selected ? "selected-item" : "") + ((this.props.public || isPublicDataset(el.dataset))? "":" private-dataset-no")}>*/}
            <Row id={el.dataset['@id']} className={"w-100 lbutton alink " + (el.selected ? "selected-item" : "") + ((this.props.public || isPublicDataset(el.dataset))? "":" private-dataset-no")}>
              <Col md={12}  onClick={() => this.selectDataset(el.dataset)}>
                <Row>
                  <Col><span className="title">{filterByLanguage(el.dataset,'http://purl.org/dc/terms/title', 'el')}</span></Col>
                </Row>
                <Row>
                  <Col><span className="creator">{filterByLanguage(el.dataset,'http://purl.org/dc/elements/1.1/creator', 'el')}</span></Col>
                </Row>
                {el.dataset['http://sw.islab.ntua.gr/semaspace/model/target'] &&
                <Row>
                   <Col md="auto"><span className="aligninfo">Aligned with: </span><span className="crimson">{filterByLanguage(el.dataset,'http://sw.islab.ntua.gr/semaspace/model/target', 'el')}</span></Col>
                </Row>}
                {el.dataset['http://purl.org/dc/elements/1.1/language'] &&
                <Row>
                   <Col md="auto"><span className="aligninfo">Languages: </span>
                   {el.dataset['http://purl.org/dc/elements/1.1/language'].map(lg =>
                     <span className="languageinfo">{lg['@value']}</span>
                   )}
                   </Col>
                </Row>}
              </Col>
              {el.children.length > 0 &&
              <Col className="mybutton" md="auto">
                <Button type="button" className="menubutton"  aria-label="Toggle"  onClick={() => this.toggle(el.dataset['@id'])}><span className={this.state['open:' + el.dataset['@id']] ? 'fa fa-angle-double-up' : 'fa fa-angle-double-down'}></span></Button>
              </Col>}
            </Row>
          {el.children.length > 0 &&
            <Collapse in={this.state['open:' + el.dataset['@id']]}>
            <Container className="inner">
            {/*<Row className={"adataset list-group-item" + (el2.selected ? " selected-item" : "") + ((this.props.public || isPublicDataset(el2.dataset))? "":" red")} key={el2.dataset['@id']}></Row>*/}
            {el.children.sort(this.jsonldsort).map(el2 => (
            <div id={el2.dataset['@id']}  className={"adataset list-group-item" + (el2.selected ? " selected-item" : "") + ((this.props.public || isPublicDataset(el2.dataset))? "":" private-dataset")} key={el2.dataset['@id']} onClick={() => this.selectDataset(el2.dataset)}>
            <Row>
              <Col className="pointer">
                <Row>
                  <Col><span className="title">{filterByLanguage(el2.dataset,'http://purl.org/dc/terms/title', 'el')}</span></Col>
                </Row>
                <Row>
                  <Col><span className="creator">{filterByLanguage(el2.dataset,'http://purl.org/dc/elements/1.1/creator', 'el')}</span></Col>
                </Row>
                {el.dataset['http://sw.islab.ntua.gr/semaspace/model/target'] &&
                <Row>
                   {/*<Col></Col>*/}
                   <Col md="auto"><span className="aligninfo">Aligned with: </span><span className="crimson">{filterByLanguage(el2.dataset,'http://sw.islab.ntua.gr/semaspace/model/target', 'el')}</span></Col>
                </Row>}
              </Col></Row>
            </div>
          ))}</Container></Collapse>}
          </div>
        ))}
      </div>
    );
  }
}

export default Datasets;
