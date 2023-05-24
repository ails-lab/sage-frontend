import React, { Component } from "react";
import Button from "react-bootstrap/Button";
import ButtonGroup from "react-bootstrap/ButtonGroup";
import Modal from "react-bootstrap/Modal";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import Form from "react-bootstrap/Form";
import { labelResource} from "../../../utils/APIUtils.js"
import { Localizer } from '../../../config/localizer.js'
import { filterByLanguage } from "../../../utils/functions.js";
import BarLoader from "react-spinners/BarLoader";

export class AnnotationValuesModal extends Component {
  constructor(props) {
    super(props);

    this.state = this.createState(props);

    this.resolveLabels();
  }

  resolveLabels() {
    var labelPromises = [];
    var _this = this;

    for (const i in _this.state) {
      if (i === 'keys') {
        continue;
      }
      for (const j in _this.state[i].details) {
         const current = _this.state[i].details[j];
         if (current.value !== null  && current.value !== undefined) {
           labelPromises.push(
                       new Promise(function(resolve, reject) {
                         labelResource(current.value)
                         .then((json) =>  {
                           _this.setState({ [i] : {..._this.state[i], details: _this.state[i].details.map((d, index) => (j != index) ? d : {...d, label: json})}}); // it should be != do not change
                           resolve();
                           })
                       }))
                     }
          if (current.value2 !== null  && current.value2 !== undefined) {
              labelPromises.push(
                                     new Promise(function(resolve, reject) {
                                       labelResource(current.value2)
                                       .then((json) =>  {
                                         _this.setState({ [i] : {..._this.state[i], details: _this.state[i].details.map((d, index) => (j != index) ? d : {...d, label2: json})}}); // it should be != do not change
                                         resolve();
                                         })
                                     }))
                                   }
       }
     }
  }

  componentWillReceiveProps(props) {
    var update = false;
    if (this.props.page !== props.page || this.props.mode !== props.mode) {
      update = true;
    }
    if (this.props.state === null ||
        (this.props.state !== null && (this.props.state.loaded !== props.state.loaded || this.props.state.loading !== props.state.loading || this.props.state.failed !== props.state.failed))) {
      update = true
    }

    if (update) {
      this.setState(this.createState(props), ()=>this.resolveLabels());
      // console.log("update");
    }
}

hightlightArray(el, input, array) {
  var str = '';
  if (input.lexicalForm) {
    str = input.lexicalForm
  } else if (input.iri) {
    str = input.iri
  }
  var result = ""
  if (!array || array.length === 0) {
    result = str
  } else {
    // var prev = 0;
    var index = 0;
    // var last = -1;
    // while (index < array.length) {
    //   if (array[index].start === undefined || array[index].end === undefined || array[index].start < 0 || array[index].end < 0)  {
    //     index++;
    //     continue;
    //   }
    //   last = index;
    //   var s = array[index].start;
    //   var e = array[index].end;
    //   result += str.substr(prev,s - prev);
    //   for (var i = index + 1; i < array.length;) {
    //     var nextElement = array[i];
    //     if (nextElement.start && nextElement.end && e > nextElement.start) {
    //       if (nextElement.end >= e) {
    //         e = nextElement.end;
    //       }
    //       index++;
    //       i++;
    //     } else {
    //       break;
    //     }
    //   }
    //   result += '<span id="element'+ el + '-' + index + '" class="highlight">' +  str.substr(s, e - s) +  '</span>';
    //   index++;
    //   prev = e;
    // }
    // if (last >= 0) {
    //   result += str.substr(array[last].end);
    // }
    // else {
    //   result = str;
    // }

    var iarray = [];
    while (index < array.length) {
       if (array[index].start === undefined || array[index].end === undefined || array[index].start < 0 || array[index].end < 0)  {
         index++;
         continue;
       }

       var element = array[index];

       iarray.push({ loc: element.start, type: 'start', element: index, value:element.value} )
       iarray.push({ loc: element.end, type: 'end', element: index, value:element.value} )

       index++;
    }

    var consumed = 0;

    iarray.sort(this.sortIarray);

    for (var i in iarray) {
      var element = iarray[i];

      if (consumed < element.loc) {
        result += str.substr(consumed, element.loc - consumed)
        consumed = element.loc
      }

      if (element.type === 'start') {
        result += '<span title="' + element.value + '" id="element'+ el + '-' + element.element + '" class="highlight">'
      } else if (element.type === 'end') {
        result += '</span>';
      }
    }

    if (str.length > consumed) {
      result += str.substr(consumed);
    }

  }
  return "<code ><pre class='mb-0'>" +  result + (input.language ? '<div><span title="Literal language" class="litlanguage">' + input.language  + '</span></div>': "") + "</pre></code>";
}

sortIarray(a,b) {
  if (a.loc < b.loc) {
    return -1;
  } else if (a.loc > b.loc) {
    return 1;
  } else if (a.type === 'start' && a.type === 'end') {
    return 1;
  } else if (a.type === 'start' && a.type === 'start') {
    if (a.element < b.element) {
      return 1;
    } else if (a.element > b.element) {
      return -1;
    } else {
      return 0;
    }
  } else if (a.type === 'end' && a.type === 'end') {
    if (a.element > b.element) {
      return 1;
    } else if (a.element < b.element) {
      return -1;
    } else {
      return 0;
    }
  }
}

  createState(props) {
      var state = {};
      var keys = [];

if (props.values) {
      for (const i in props.values.values) {
        keys.push(i);

        var details = [];
        for (const j in props.values.values[i].details) {
          var el = {...props.values.values[i].details[j]}

          if (el.state === 'ADD') {
            el = {...el, originalValue: el.value, originalValue2: el.value2}
          }
          if (el.state) {
            el = {...el, originalState: el.state}
          }

          details.push(el);
        }


        state['element' + i] = { count: props.values.values[i].count, value: props.values.values[i].onValue, details,  deleted: [], accepted: [] };

        // var values = new Map();
        // var details = [];
        // for (const j in props.value[i].details) {
        //   var el = {...props.value[i].details[j]}
        //
        //   var data = values.get(props.value[i].details[j].value);
        //   if (!data) {
        //     data = de;
        //     values.put(props.value[i].details[j].value, array);
        //   }
        //
        //   if (el.state === 'ADD') {
        //     el = {...el, originalValue: el.value, originalValue2: el.value2}
        //   }
        //   if (el.state) {
        //     el = {...el, originalState: el.state}
        //   }
        //
        //   details.push(el);
        // }
        //
        //
        // state['element' + i] = { value: props.value[i].onValue, details,  deleted: [], accepted: [] };

      }
}

      state.keys = keys;

      // console.log(state);

      return state;
  }

  render() {

    return (
      <Modal size="xl" show={this.props.show} onHide={() => this.props.onClose()} animation={false} backdrop="static">
        <Modal.Header closeButton>
          <Modal.Title>Annotations Preview</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-0">
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
        {this.props.state.loaded &&
          <React.Fragment>

            <Row className="py-2 mx-0 border-bottom">
            <Col md="auto"></Col>
              <Col>Annotations: {this.props.values.totalCount}</Col><Col>Annotated items: {this.props.values.distinctSourceTotalCount}</Col><Col>Distinct annotated values: {this.props.values.distinctValueTotalCount}</Col>
              {this.props.annotators &&

                <Col md="auto">
                  <ButtonGroup className="annotationFilters pr-3">
                    <Button variant={this.props.mode==='ALL' ? "primary" : "secondary"} onClick={() => this.props.actions('view-annotations', {id: this.props.id, page: 1, mode: 'ALL', annotators: this.props.annotators})}>All</Button>
                    <Button variant={this.props.mode==='ANNOTATED_ONLY' ? "primary" : "secondary"} onClick={() => this.props.actions('view-annotations', {id: this.props.id, page: 1, mode: 'ANNOTATED_ONLY', annotators: this.props.annotators})}>Annotated</Button>
                    <Button variant={this.props.mode==='UNANNOTATED_ONLY' ? "primary" : "secondary"} onClick={() => this.props.actions('view-annotations', {id: this.props.id, page: 1, mode: 'UNANNOTATED_ONLY', annotators: this.props.annotators})}>Not Annotated</Button>
                  </ButtonGroup>
                </Col>
              }
          </Row>
            <Row className="py-2 mx-0 border-bottom">
              <Col className="d-inline-flex justify-content-end">
                <span className="pr-4 font-weight-bold font-size-3">Annotated text</span>
              </Col>
              <Col className="d-inline-flex justify-content-center">
                <span className="pl-4 font-weight-bold font-size-3">Items count</span>
              </Col>
              <Col className="d-inline-flex justify-content-start">
                <span className="pl-4 font-weight-bold font-size-3">Annotation</span>
              </Col>
            </Row>


            <div className="scrollContainer">
              <div className="scroll">
                {this.state.keys.map((el,elindex) =>
                  <Row className="grouping bottomrow"  key={elindex}>
                    <Col md="auto align-items-center pt-2">
                       <span className="sticky-value">{(this.props.page-1)*20 + elindex + 1}</span>
                    </Col>
                    <Col className="property-value align-items-center pr-1">
                      <div className="sticky-value" dangerouslySetInnerHTML={{__html: this.hightlightArray(el, this.state['element' + el].value, this.state['element' + el].details)}}></div>
                    </Col>
                    <Col md="auto align-items-center pt-2">
                      <Container className="annotation-uris sticky-value">
                      <Row><span title="Items count" className="annotation-uris-count">{this.state['element' + el].count && this.state['element' + el].count}</span></Row>
                      {/*<Row><Button type="button" className="menubutton annotation-uris-browse"  aria-label="Browse" onClick={() => this.props.actions('get-items-by-property-value', {onPropertyPath : this.props.onPropertyPath, value: el.value })}><FontAwesomeIcon title="Browse items" className="fa" icon={faGlobe}/></Button></Row>*/}
                      </Container>
                    </Col>

                    <Col className="pl-1 pr-2">
                      <Container>
                        {this.state['element' + el].details.map((ann,index) =>
                        <Row key={index} className="td-row align-items-center align-self-center "
                              onMouseOver={()=>  document.getElementById('element'+el + '-' + index) ? document.getElementById('element'+el + '-' + index).classList.add('highlight-selected') : null}
                              onMouseOut={()=> document.getElementById('element'+el + '-' + index) ?  document.getElementById('element'+el + '-' + index).classList.remove('highlight-selected') : null}>

                          <Col className="pl-5">
                            <Row>
                            {ann.value2 ?
                              <Col>
                                <Row>
                                  <a href={ann.value} rel='noreferrer noopener' target="_blank"><span className="td-normal">{ann.value}</span></a> -
                                </Row>
                                <Row>
                                  <a href={ann.value2} rel='noreferrer noopener' target="_blank"><span className="td-normal">{ann.value2}</span></a>
                                </Row>
                              </Col>
                            :
                              (ann.value !== null ? <a href={ann.value} rel='noreferrer noopener' target="_blank"><span className="td-normal">{ann.value}</span></a> : '')
                            }
                            </Row>

                            {(ann.label && ann.label[0]) &&
                              <Row className="annotation-info">
                                 <span title="Annotation label" className="td-label annotation-label">{filterByLanguage(ann.label[0],'http://www.w3.org/2000/01/rdf-schema#label', this.props.language)}</span>
                                 {(ann.label2 && ann.label2[0]) &&
                                 <span title="Annotation label" className="td-label annotation-label"> - {filterByLanguage(ann.label2[0],'http://www.w3.org/2000/01/rdf-schema#label', this.props.language)}</span>}
                              </Row>
                            }

                            {ann.label && ann.label[0] && filterByLanguage(ann.label[0],'http://purl.org/dc/terms/description', this.props.language) &&
                              <Row>
                                <span title="Annotation description" className="td-label description">{filterByLanguage(ann.label[0],'http://purl.org/dc/terms/description', this.props.language)}</span>
                              </Row>
                            }

                            {ann.score !== null && ann.score !== undefined &&
                              <Row>
                                <span title="Annotation score" className="td-label score">{ann.score.toFixed(3)}</span>
                              </Row>
                            }

                          </Col>
                        </Row>
                      )}
                      </Container>
                    </Col>
                  </Row>
                )}
              </div>
            </div>
          </React.Fragment>
        }
        </Modal.Body>
        <Modal.Footer>
          <Row className="modalFooter">
            <Col />
            <Col className="d-inline-flex justify-content-center">
              <Button
                type="button"
                disabled={!this.props.page || this.props.page === 1}
                variant="outline-light"
                aria-label="Previous"
                className="nextbutton px-5"
                onClick={() => this.props.annotators ? this.props.actions('view-annotations', {id: this.props.id, page: this.props.page - 1, mode: this.props.mode, annotators: this.props.annotators}) : this.props.actions('preview-annotator-execution', {id: this.props.id, page: this.props.page - 1})}
              >
                <span className="fa fa-angle-double-left"/>
              </Button>
              <Button
                type="button"
                disabled={this.state.keys.length < 20}
                variant="outline-light"
                aria-label="Next"
                className="nextbutton px-5"
                onClick={() => this.props.annotators ? this.props.actions('view-annotations', {id: this.props.id, page: this.props.page + 1, mode: this.props.mode, annotators: this.props.annotators}) : this.props.actions('preview-annotator-execution', {id: this.props.id, page: this.props.page + 1})}
              >
                <span className="fa fa-angle-double-right"/>
              </Button>
            </Col>
            <Col className="d-inline-flex justify-content-end px-0">
              <Button variant="secondary" onClick={() =>this.props.onClose()}>
                Close
              </Button>
            </Col>
          </Row>
        </Modal.Footer>
      </Modal>
  )}
}

export default AnnotationValuesModal;
