import React, { Component } from "react";
import Datasets from "./../Datasets.js";
import TimeVocabularies from "./TimeVocabularies.js";
import SpaceVocabularies from "./SpaceVocabularies.js";
import ThesaurusVocabularies from "./ThesaurusVocabularies.js";
import CollectionEntries from "./CollectionEntries.js";
import Tag from "./Tag.js";
import Accordion from "react-bootstrap/Accordion";
import Card from "react-bootstrap/Card";
import Container from "react-bootstrap/Container";
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import BarLoader from "react-spinners/BarLoader";

import { resolveTime, resolveSpace, labelResource, insideTime, resolveThesaurusTerm} from "../../utils/APIUtils.js"
import { ACCESS_TOKEN } from '../../constants/index.js';
import { igetDatasets,  searchCollections } from '../../utils/DatasetUtils.js';
// import { filterByLanguage } from "../utils/functions.js";

// import { SimpleMap} from './SimpleMap.js'

import { Localizer } from '../../config/localizer.js'

export class Search extends Component {
  constructor(props) {
    super(props);

    this.state = {
      datasets: [],
      timeVocabularies: [],
      times: { from: { text: '', inside: [] }, until: { text: '', inside: [] } },
      selectedTime: { from: null, until: null},

      spaceVocabularies: [],
      space: { text: '', inside: [] },
      selectedSpace: null,

      thesaurusVocabularies: [],
      thesaurusTerm: { text: '', inside: [] },
      selectedThesaurusTerm: null,

      searchResults: [],

      searchState: { loaded: false, loading:false, failed:false },
    }
//   }
//
// componentWillReceiveProps(props) {
    var root = props.match.params.rootDataset ? this.props.database.resourcePrefix + props.match.params.rootDataset : null;

    igetDatasets('http://sw.islab.ntua.gr/semaspace/model/DataCollection,http://sw.islab.ntua.gr/semaspace/model/DataCatalog', root)
      .then(json => {
        // console.log(json);
          const datasets  = json.map(el => {return { dataset: el, selected: false } } )
          this.setState({ datasets })

          if (root) {
              this.props.actions('set-root-dataset', { dataset: json.filter(el => el['@id'] === root)[0]});
          }
        })//)

    igetDatasets('http://sw.islab.ntua.gr/semaspace/model/TemporalCollection')
      .then(json => {
          var timeVocabularies = json.map(el => { return { dataset: el, selected: false } });
          this.setState({timeVocabularies});
        })

    igetDatasets('http://sw.islab.ntua.gr/semaspace/model/SpatialCollection')
      .then(json => {
          var spaceVocabularies = json.map(el => { return { dataset: el, selected: false } });
          this.setState({spaceVocabularies});
        })

    igetDatasets('http://sw.islab.ntua.gr/semaspace/model/ThesaurusCollection')
      .then(json => {
          var thesaurusVocabularies = json.map(el => { return { dataset: el, selected: false } });
          this.setState({thesaurusVocabularies});
        })
  }

  handleSignOut() {
    localStorage.removeItem(ACCESS_TOKEN);

    this.setState({
      currentUser: null,
      isAuthenticated: false,
      datasets: [],
    });
  }

  executeAction(action, params) {
    if (action === 'delete-selected-tag') {
      if (params.type === 'DATASET') {
        var datasets = this.state.datasets.map(el => {
          if (el.dataset['@id'] === params.url) {
              return  {...el, selected: !el.selected }
          } else {
              return el;
          }}
        )
        this.setState({ datasets: datasets });
      } else if (params.type === 'time:from') {
        this.setState({ selectedTime: { ...this.state.selectedTime, from: null, until:null }});
      } else if (params.type === 'time:until') {
        this.setState({ selectedTime: { ...this.state.selectedTime, until: null }});
      } else if (params.type === 'place') {
        this.setState({ selectedSpace: null });
      } else if (params.type === 'term') {
        this.setState({ selectedThesaurusTerm: null });
      }
  }
}

  newSearch() {
    this.setState({searchState: { loaded: false, loading:false, failed:false }, searchResults: []})
  }

  datasetActions(action, params) {
//    console.log(action);
   // console.log(params);
    if (action === 'select-dataset') {
      this.selectDataset('datasets', params.dataset);
    }
  }

  vocabularyActions(action, params, ds) {
    if (action === 'select-dataset') {
      if (ds === 'time') {
        this.selectDataset('timeVocabularies', params.dataset);
      } else if (ds === 'space') {
        this.selectDataset('spaceVocabularies', params.dataset);
      } else if (ds === 'thesaurus') {
        this.selectDataset('thesaurusVocabularies', params.dataset);
      }

    } else if (action === 'change-time') {
      this.setState({ times: {...this.state.times, [params.name]: { text: params.value, inside: [] } }});

    } else if (action === 'resolve-time') {
      this.resolveTime(this.state.times[params.name].text, params.name);

      var vocabularies = this.getSelectedDatasets('timeVocabularies');
      if (vocabularies.length > 0) {
        this.resolveTimeThesaurusTerm(this.state.times[params.name].text, this.props.database.name + "-vocabulary", vocabularies, params.name);
      }

    } else if (action === 'select-time') {
      // console.log(params);
      this.setState({ selectedTime: { ...this.state.selectedTime, [params.name]: params.entity }});

    } else if (action === 'change-space') {
      this.setState({ space: { text: params.value, inside: [] }});

    } else if (action === 'resolve-space') {
      var vocabularies = this.getSelectedDatasets('spaceVocabularies');

      if (vocabularies.length > 0) {
        if (vocabularies.includes('http://sws.geonames.org/')) {
          this.resolveSpace(this.state.space.text);
        }

        this.resolveSpaceThesaurusTerm(this.state.space.text, this.props.database.name + "-vocabulary", vocabularies);
      }

    } else if (action === 'select-space') {
      this.setState({ selectedSpace: params.entity });
    } else if (action === 'change-thesaurus-term') {
      this.setState({ thesaurusTerm: { text: params.value, inside: [] }});
    } else if (action === 'resolve-thesaurus-term') {
      var vocabularies = this.getSelectedDatasets('thesaurusVocabularies');
      if (vocabularies.length > 0) {
        this.resolveThesaurusTerm(this.state.thesaurusTerm.text, this.props.database.name + "-vocabulary", vocabularies);
      }
    } else if (action === 'select-thesaurus-term') {
      // console.log(params);
      this.setState({ selectedThesaurusTerm: params.entity });
    }
  }

  selectDataset(array,dataset) {
      var datasets = this.state[array].map(el => {
        if (el.dataset['@id'] === dataset['@id']) {
            return  {...el, selected: !el.selected }
        } else {
            return el;
        }}
      )
      this.setState({ [array]: datasets });
    }

  getSelectedDatasets(array) {
    return this.state[array].filter(el => el.selected).map(el =>
      el.dataset['http://purl.org/dc/elements/1.1/identifier'][0]['@id'] !== undefined ? el.dataset['http://purl.org/dc/elements/1.1/identifier'][0]['@id'] : el.dataset['http://purl.org/dc/elements/1.1/identifier'][0]['@value'] )
  }

  getSelectedCollections(array) {
    return this.state[array].filter(el => el.selected)
  }

  resolveTime(text, name) {
    var _this = this;
    var vocabularies = this.getSelectedDatasets('timeVocabularies');
    // console.log(vocabularies);
    resolveTime(text)
    .then(json1 => {
      if (json1.length > 0 && json1[0].type === 'instant') {
        labelResource(json1[0].time)
          .then(json2 => {
             this.setState({ times: { ...this.state.times, [name]: { ...this.state.times[name], info: json2, inside:[] }}},
              () => {
                insideTime(json1[0].time,vocabularies)
                  .then(obj => {
                    var labelPromises = [];
                    for (const i in obj) {
                      const graph = obj[i].graph;
                      for (const j in obj[i].resources) {
                        const r = obj[i].resources[j];

                        labelPromises.push(
                          new Promise(function(resolve, reject) {
                            labelResource(r.uri)
                              .then((json) =>  {
                                var z = _this.state.times[name].inside.filter(el => el.graph === graph && el.type === 'inside');
                                json = json.map(el => { return {...el, start: r.start, end: r.end}})
                                if (z.length > 0) {
                                  _this.setState({ times: { ..._this.state.times,
                                                            [name]: { ..._this.state.times[name],
                                                                    inside: _this.state.times[name].inside.map(el =>
                                                                        (el.graph !== graph || el.type !== 'inside') ? el : { graph: graph, type: 'inside', resources: [...el.resources, ...json ] }) } }});
                                } else {
                                  _this.setState({  times: { ..._this.state.times,
                                                            [name]: { ..._this.state.times[name],
                                                                    inside: [..._this.state.times[name].inside,
                                                                             { graph: graph, type: 'inside', resources: json  } ] } } });
                                }
                                resolve()
                              })}
                            ))
                      }
                  }

                  Promise.all(labelPromises)
                 });
           });
         })}})
  }

  resolveTimeThesaurusTerm(text, index, vocabularies, name) {
    var _this = this;

    // console.log(vocabularies);
    resolveThesaurusTerm(text, index, vocabularies)
    .then(obj => {
      // console.log(obj);
      if (obj.length > 0) {
         this.setState({ times: { ...this.state.times, [name]: { ...this.state.times[name], inside:[] }}})

        var labelPromises = [];

        for (const i in obj) {
          const uri = obj[i].uri;
          const graph = obj[i].graph;

          labelPromises.push(
            new Promise(function(resolve, reject) {
              labelResource(uri)
                .then((json) =>  {
                  // console.log(json)
                  var z = _this.state.times[name].inside.filter(el => el.graph === graph && el.type === 'thesaurus');
                  if (z.length > 0) {
                    _this.setState({ times: {..._this.state.times, [name]: { ..._this.state.times[name],
                                         inside: _this.state.times[name].inside.map(el =>
                                         (el.graph !== graph || el.type !== 'thesaurus') ? el : { graph: graph, type: 'thesaurus', resources: [...el.resources, ...json ] }) } }});
                  } else {
                   _this.setState({  times: {..._this.state.times, [name]: { ..._this.state.times[name],
                                         inside: [..._this.state.times[name].inside,
                                        { graph: graph, type: 'thesaurus', resources: json  } ] } }} );
                 }
                 resolve()
               })}
            ))
         }

         Promise.all(labelPromises)
       }})
  }

  resolveSpaceThesaurusTerm(text, index, vocabularies) {
    var _this = this;

    // console.log(vocabularies);
    resolveThesaurusTerm(text, index, vocabularies)
    .then(obj => {
      // console.log(obj);
      if (obj.length > 0) {
         this.setState({ space: { ...this.state.space, inside:[] }})

        var labelPromises = [];

        for (const i in obj) {
          const uri = obj[i].uri;
          const graph = obj[i].graph;

          labelPromises.push(
            new Promise(function(resolve, reject) {
              labelResource(uri)
                .then((json) =>  {
                  // console.log(json)
                  var z = _this.state.space.inside.filter(el => el.graph === graph && el.type === 'thesaurus');
                  if (z.length > 0) {
                    _this.setState({ space: {..._this.state.space,
                                          inside: _this.state.space.inside.map(el =>
                                         (el.graph !== graph || el.type !== 'thesaurus') ? el : { graph: graph, type: 'thesaurus', resources: [...el.resources, ...json ] }) } });
                  } else {
                   _this.setState({  space: {..._this.state.space,
                                         inside: [..._this.state.space.inside,
                                        { graph: graph, type: 'thesaurus', resources: json  } ] } } );
                 }
                 resolve()
               })}
            ))
         }

         Promise.all(labelPromises)
       }})
  }

  resolveSpace(text) {
    var _this = this;
    // var vocabularies = this.getSelectedDatasets('spaceVocabularies');

    resolveSpace(text)
    .then(obj => {
      if (obj.length > 0) {
        this.setState({ space: { ...this.state.space, inside:[] }})

// console.log(obj);
        var labelPromises = [];

        for (const i in obj) {
          const uri = obj[i].location;

          labelPromises.push(
            new Promise(function(resolve, reject) {
              labelResource(uri)
                .then((json) =>  {
                  // console.log(json)
                  var z = _this.state.space.inside.filter(el => el.graph === 'http://sws.geonames.org/');
                  if (z.length > 0) {
                    _this.setState({ space: { ..._this.state.space,
                                         inside: _this.state.space.inside.map(el =>
                                         (el.graph !== 'http://sws.geonames.org/') ? el : { graph: 'http://sws.geonames.org/', resources: [...el.resources, ...json ] }) } });
                  } else {
                   _this.setState({  space: { ..._this.state.space,
                                         inside: [..._this.state.space.inside,
                                        { graph: 'http://sws.geonames.org/', resources: json  } ] } } );
                 }
                 resolve()
               })}
            ))
         }

         Promise.all(labelPromises)
       }})
  }

  resolveThesaurusTerm(text, index, vocabularies) {
    var _this = this;

    // console.log(vocabularies);
    resolveThesaurusTerm(text, index, vocabularies)
    .then(obj => {
      // console.log(obj);
      if (obj.length > 0) {
         this.setState({ thesaurusTerm: { ...this.state.thesaurusTerm, inside:[] }})

        var labelPromises = [];

        for (const i in obj) {
          const uri = obj[i].uri;
          const graph = obj[i].graph;

          labelPromises.push(
            new Promise(function(resolve, reject) {
              labelResource(uri)
                .then((json) =>  {
                  // console.log(json)
                  var z = _this.state.thesaurusTerm.inside.filter(el => el.graph === graph);
                  if (z.length > 0) {
                    _this.setState({ thesaurusTerm: { ..._this.state.thesaurusTerm,
                                         inside: _this.state.thesaurusTerm.inside.map(el =>
                                         (el.graph !== graph) ? el : { graph: graph, resources: [...el.resources, ...json ] }) } });
                  } else {
                   _this.setState({  thesaurusTerm: { ..._this.state.thesaurusTerm,
                                         inside: [..._this.state.thesaurusTerm.inside,
                                        { graph: graph, resources: json  } ] } } );
                 }
                 resolve()
               })}
            ))
         }

         Promise.all(labelPromises)
       }})
  }

  searchCollections() {
    // console.log("SEARCH");
    // console.log(this.state.selectedTime);

       if (this.state.selectedTime.from) {
         var time = this.state.selectedTime.from['@id'];

         if (this.state.selectedTime.until) {
           var endTime = this.state.selectedTime.until['@id']
         }
       }

       if (this.state.selectedSpace) {
         var place = this.state.selectedSpace['@id'];
       }

       var collections = this.getSelectedCollections('datasets').map(el => el.dataset['@id']);

       // if (this.state.thesaurusTerm.text) {
       if (this.state.selectedThesaurusTerm) {
         // var terms = [ this.state.thesaurusTerm.text ];
         var terms = [ this.state.selectedThesaurusTerm['@id'] ];
       }
       // var qs = buildQueryString(params);
       this.setState({searchResults: []})

       if (collections.length > 0 || time || endTime || place) {
         this.setState({ searchState: { loaded: false, loading: true, failed: false}}, () =>

         searchCollections(collections, time, endTime, place, terms)
         .then(json => {
           var searchResults = json.map(el =>
             { return { items: el,
                 graph: '' } }
           )
           this.setState({searchResults, searchState: {loaded: true, loading: false, failed: false}})
         }, () => this.setState({ searchResults: [], searchState: {loaded: false, loading: false, failed: true}}))
    )}
  }


  render() {
    // console.log(useParams());
    return (
            <Container>
              <Container className="searchheader">
                <Row className="searchtags">
                  {(this.getSelectedCollections('datasets').length === 0&& !this.state.selectedTime.from && !this.state.selectedTime.until && !this.state.selectedSpace && !this.state.selectedThesaurusTerm) &&
                    <span className="info">{Localizer.no_search_criteria[this.props.language]}</span>}
                  {this.getSelectedCollections('datasets').map(el =>
                    <Tag type="dataset"
                         entity={el.dataset}
                         language={this.props.language}
                         actions={(action,params) => this.executeAction(action, params)}
                         color='pink'/>)}
                  {this.state.selectedTime.from &&
                    <Tag type="time:from"
                         entity={this.state.selectedTime.from}
                         actions={(action,params) => this.executeAction(action, params)}
                         language={this.props.language} color='pink'/>}
                  {this.state.selectedTime.until &&
                    <span className="tag-dash">-</span>}
                  {this.state.selectedTime.until &&
                    <Tag type="time:until"
                         entity={this.state.selectedTime.until}
                         language={this.props.language} color='pink'/>}
                  {this.state.selectedSpace &&
                    <Tag type="place"
                         entity={this.state.selectedSpace}
                         actions={(action,params) => this.executeAction(action, params)}
                         language={this.props.language} color='pink'/>}
                  {this.state.selectedThesaurusTerm &&
                    <Tag type="term"
                         entity={this.state.selectedThesaurusTerm}
                         actions={(action,params) => this.executeAction(action, params)}
                         language={this.props.language} color='pink'/>}
              </Row>
              <Row>
                <Col/>
                {this.state.searchState.loading &&
                  <Col md="auto" className="loader">
                    <BarLoader css='spinner' height={6} width={600} color='crimson' loading={true}/>
                  </Col>
                }
                <Col md="auto">
                  {!this.state.searchState.loaded && !this.state.searchState.failed && <Button className="crbutton" onClick={() => this.searchCollections() }>{Localizer.search[this.props.language]}</Button>}
                  {(this.state.searchState.loaded || this.state.searchState.failed) && <Button className="crbutton" onClick={() => this.newSearch()}>{Localizer.new_search[this.props.language]}</Button>}
                </Col>
              </Row>
              </Container>
              <Row>
                <Col>
                {!this.state.searchState.loaded && !this.state.searchState.failed && !this.state.searchState.loading &&
                  <Accordion>
                  <Card>
                    <Card.Header className="accordion-header">
                      <Accordion.Toggle as={Button} variant="link" eventKey="0" className="accordion-header">
                        {Localizer.data_collections[this.props.language]}
                      </Accordion.Toggle>
                    </Card.Header>
                    <Accordion.Collapse eventKey="0">
                      <Card.Body className="accordion-body">
                        <Datasets datasets={this.state.datasets}
                                  actions={(action, params) => this.datasetActions(action, params)}/>
                      </Card.Body>
                    </Accordion.Collapse>
                  </Card>
                  <Card>
                    <Card.Header className="accordion-header">
                      <Accordion.Toggle as={Button} variant="link" eventKey="1" className="accordion-header">
                        {Localizer.time_vocabularies[this.props.language]}
                      </Accordion.Toggle>
                    </Card.Header>
                    <Accordion.Collapse eventKey="1">
                      <Card.Body className="accordion-body">
                        <TimeVocabularies datasets={this.state.timeVocabularies}
                                          language={this.props.language}
                                          times={this.state.times}
                                          seletedTime={this.state.selectedTime}
                                          actions={(action, params) => this.vocabularyActions(action, params, 'time')}/></Card.Body>
                    </Accordion.Collapse>
                  </Card>
                  <Card>
                    <Card.Header className="accordion-header">
                      <Accordion.Toggle as={Button} variant="link" eventKey="2" className="accordion-header">
                        {Localizer.place_vocabularies[this.props.language]}
                      </Accordion.Toggle>
                    </Card.Header>
                    <Accordion.Collapse eventKey="2">
                      <Card.Body className="accordion-body">
                        <SpaceVocabularies datasets={this.state.spaceVocabularies}
                                  language={this.props.language}
                                  space={this.state.space}
                                  seletedSpace={this.state.selectedSpace}
                                  actions={(action, params) => this.vocabularyActions(action, params, 'space')}/></Card.Body>
                    </Accordion.Collapse>
                  </Card>
                  <Card>
                    <Card.Header className="accordion-header">
                      <Accordion.Toggle as={Button} variant="link" eventKey="3" className="accordion-header">
                        {Localizer.thesauri[this.props.language]}
                      </Accordion.Toggle>
                    </Card.Header>
                    <Accordion.Collapse eventKey="3">
                    <Card.Body className="accordion-body">
                      <ThesaurusVocabularies datasets={this.state.thesaurusVocabularies}
                              language={this.props.language}
                              thesaurus={this.state.thesaurusTerm}
                              selectedThesaurus={this.state.selectedThesaurus}
                              actions={(action, params) => this.vocabularyActions(action, params, 'thesaurus')}/></Card.Body>
                    </Accordion.Collapse>
                  </Card>
                </Accordion>}
                {(this.state.searchState.loaded || this.state.searchState.failed) &&
                  <CollectionEntries items={this.state.searchResults}
                         language={this.props.language} searchState={this.state.searchState}/>}
                </Col>

              </Row>
            </Container>)
  }

}

export default Search
