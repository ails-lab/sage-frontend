import {useState} from 'react';
import React, { Component } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Multiselect from 'multiselect-react-dropdown';

import { getDatasetSchemaClasses } from "../../../utils/DatasetAPI"
import { throwToast } from '../../../utils/UIUtils';

export class IndexModal extends Component {
  constructor(props) {
    super(props);

    this.state = {
      show: this.props.show,
      error: false,

      privat: true,

      // roots: []
      checkboxes: {},

      expandOptions: [{name: 'Broader', id: 'SKOS_BROADER'},{name: 'Exact Match', id: 'SKOS_EXACT_MATCH'}]

    }

    this.checkboxes = {}
    this.rdftypes = {}
    this.names = {}
    this.languages = {}
    // this.targets = {}
    this.datatypes = {}
    this.expansions = {}

    this.getSchema()
    // console.log(props.dataset)

    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleSubmit(event) {
    event.preventDefault();

    // if (this.index.value == '') {
    //   console.log(this.readClasses('', [], 0))
    // }

    if (this.index.value == '' && (!this.identifier.value || this.identifier.value.length == 0)) {
      return;
    }

    if (this.index.value != '') {
      this.props.onOK(this.index.value, null, this.indexEngine.value);
    } else {

      // console.log(this.state)
      var res = this.readClasses('', [], { value: 0 } )

      this.props.onOK(null, this.identifier.value, this.indexEngine.value, res.elements, res.metadata);
    }
  }

  readClasses(rootPathIdentifier, keysMetadata, counter) {

    var elements = []
    var metadata = keysMetadata

    for (var ch of Object.keys(this.state.checkboxes).filter(k => k.match('^check-' + (rootPathIdentifier.length > 0 ? (rootPathIdentifier + '-c[0-9]+$') : 'c[0-9]+$')))) {
      // console.log(">> CLASS");
      // console.log(ch);
      if (this.checkboxes[ch].checked) {
        var newRootPathIdentifier = ch.substring(6)

        var pres = this.readProperties(newRootPathIdentifier, metadata, counter)
        var properties = pres.properties;
        metadata = pres.metadata;

        var eres = this.readEmbedders(newRootPathIdentifier, metadata, counter)
        var embedders = eres.embedders;
        metadata = eres.metadata;

        var obj = { clazz: this.state.checkboxes[ch].class };

        if (properties != null) {
          obj = {...obj, properties: properties }
        }
        if (embedders != null) {
          obj = {...obj, embedders: embedders }
        }

        elements.push(obj);
      }
    }

    if (elements.length == 0) {
      return { metadata }
    } else {
      return { metadata, elements }
    }
  }

  readProperties(rootPathIdentifier, keysMetadata, counter) {

    var properties = []
    var metadata = keysMetadata

    for (var ch of Object.keys(this.state.checkboxes).filter(k => k.match('^check-' + rootPathIdentifier + '-p[0-9]+$'))) {
      // console.log(">> PROPERTY");
      // console.log(ch);
      if (this.checkboxes[ch].checked) {
        var newRootPathIdentifier = ch.substring(6)
        var res = this.readClasses(newRootPathIdentifier, metadata, counter)
        var elements = res.elements;
        metadata = res.metadata;

        var lines = this.state.checkboxes[ch].lines;

        if (elements == null) {
          var selectors = [];
          if (lines) {
            for (var i of lines) {
              var name = this.names['names' + ch.substring(5) + "#" + i].value;
              if (name) {
                var selectorObj = { index: counter.value };

                selectorObj.termType = this.rdftypes['rdfty' + ch.substring(5) + "#" + i].value.toUpperCase();

                var language = this.languages['langu' + ch.substring(5) + "#" + i].value;
                if (language) {
                  var languages = [];
                  for (var lang of language.split(',')) {
                    languages.push( lang.trim() )
                  }

                  selectorObj.languages = languages;
                }

                // var target = this.targets['targe' + ch.substring(5)+ "#" + i].value;
                // if (target) {
                //   selectorObj.target = target;
                // }

                selectors.push(selectorObj);

                var datatype = this.datatypes['datat' + ch.substring(5) + "#" + i].value;

                var expand = this.expansions['expan' + ch.substring(5) + "#" + i].getSelectedItems().map(el => el.id)

                metadata.push( { index:counter.value, name, languageField: language ? true : false, datatype, expand } )
                counter.value++;
              }
            }

            properties.push( { property: this.state.checkboxes[ch].property, selectors })
          }
        } else {
          properties.push( { property: this.state.checkboxes[ch].property, elements: elements })
        }
      }
    }

    if (properties.length == 0) {
      return { metadata }
    } else {
      return { metadata, properties }
    }
  }

  readEmbedders(rootPathIdentifier, keysMetadata, counter) {

    var embedders = []
    var metadata = keysMetadata

    for (var ch of Object.keys(this.state.checkboxes).filter(k => k.match('^check-' + rootPathIdentifier + '-e[0-9]+$'))) {
      // console.log(">> PROPERTY");
      // console.log(ch);
      if (this.checkboxes[ch].checked) {
        var newRootPathIdentifier = ch.substring(6)

        var lines = this.state.checkboxes[ch].lines;

        var selectors = [];
        if (lines) {
          for (var i of lines) {
            var name = this.names['names' + ch.substring(5) + "#" + i].value;
            if (name) {
              var selectorObj = { index: counter.value };

              selectorObj.termType = this.rdftypes['rdfty' + ch.substring(5) + "#" + i].value.toUpperCase();

              selectors.push(selectorObj);

              var datatype = this.datatypes['datat' + ch.substring(5) + "#" + i].value;

              metadata.push( { index:counter.value, name, languageField: false, datatype } )
              counter.value++;
            }
          }

          embedders.push( { embedderId: this.state.checkboxes[ch].embedderId, selectors })
        }
      }
    }

    if (embedders.length == 0) {
      return { metadata }
    } else {
      return { metadata, embedders }
    }
  }

  getSchema() {
    getDatasetSchemaClasses(this.props.dataset.id, true)
       .then(response => {

          var newState = { ...this.state, classStructure: response }

          var checkboxes = {}
          for (var i in response) {
            checkboxes['check-c' + i] = { class: response[i].class, path: [ response[i].class ] }
          }

          this.setState({ classStructure: response, checkboxes })
       })
       .catch(error => {
         // this.throwToast('error', error.message)
       })
  }

  indexChanged() {
    this.identifier.value = ''
    this.identifier.disabled = true

    var selectedIndex = this.props.indices.filter(el => el.id === this.index.value)[0]

    // if (this.indexEngine) {
    //   this.indexEngine.value = selectedIndex.indexEngine;
    //   this.indexEngine.disabled = true;
    // }

    var checkboxes = {};
    for (var ch in this.state.checkboxes) {
      if (ch.match('^check-c[0-9]+$')) {
        checkboxes[ch] = this.state.checkboxes[ch]
        this.checkboxes[ch].checked = false
      // } else {
      //   delete this.checkboxes[ch]
      }
    }

    this.setState({ selectedIndex, checkboxes }, () => {
       this.applySelection()
     } )
  }

  applySelection() {
     if (this.state.selectedIndex) {
       var checkboxes = { ...this.state.checkboxes }
       var selectIdentifiers = []

       for (var element of this.state.selectedIndex.elements) {
         checkboxes = this.applyClassSelection(checkboxes, selectIdentifiers, '', element)
       }

       // console.log("A")
       // console.log(checkboxes)

       this.setState({ checkboxes: checkboxes }, () => {
         for (var el of selectIdentifiers) {
           console.log(el);
           this.checkboxes[el.identifier].checked = true
         }
         this.forceUpdate(() => {
           for (var el of selectIdentifiers) {
             var iel = el.identifier.substring(5);

             if (iel.match('^.*-p[0-9]+$' ) && el.selectors) { // only properties

               var labelPath = this.state.checkboxes[el.identifier].path

               var classElement = this.state.classStructure.find(el => el.class === labelPath[labelPath.length - 2])
               var propElement = classElement.children.find(el => el.property === labelPath[labelPath.length - 1])

               var ranges = propElement.range

               for (var i in el.selectors) {
                 var selector = el.selectors[i]

// console.log("HERE")
// console.log(selector)
// console.log(this.state.selectedIndex.keysMetadata)

                 var km = this.state.selectedIndex.keysMetadata.find(e => e.index == selector.index)

// console.log(km)
                 if (km.name) {
                   this.names['names' + iel + '#' + i].value = km.name
                 }

                 if (km.datatype) {
                   this.datatypes['datat' + iel + '#' + i].value = km.datatype
                 }

                 if (km.expand) {
                   var x = km.expand.map(el => this.state.expandOptions.find(s => s.id === el));
                   this.expansions['expan' + iel + '#' + i].state.preSelectedValues = x;
                   this.expansions['expan' + iel + '#' + i].resetSelectedValues(); // is not working

                   // console.log(this.expansions['expan' + iel + '#' + i])
                 }

                 if (selector.termType) {
                   this.rdftypes['rdfty' + iel + '#' + i].value = selector.termType == 'LITERAL' ? 'Literal' : selector.termType
                 }
                 if (selector.languages) {
                   this.languages['langu' + iel + '#' + i].value = selector.languages
                 }
               }
              } else if (iel.match('^.*-p[0-9]+$' ) && !el.selectors) {
                 this.rdftypes['rdfty' + iel + '#0'].disabled = true
                 this.datatypes['datat' + iel + '#0'].disabled = true
                 this.languages['langu' + iel + '#0'].disabled = true
                 this.expansions['expan' + iel + '#0'].disabled = true
                 // this.targets['targe' + iel].disabled = true
             } else if (iel.match('^.*-e[0-9]+$' ) && el.selectors) { // only properties

                for (var i in el.selectors) {
                  var selector = el.selectors[i]

                  var km = this.state.selectedIndex.keysMetadata.find(e => e.index == selector.index)
                  if (km.name) {
                    this.names['names' + iel + '#' + i].value = km.name
                  }

                  if (km.datatype) {
                    this.datatypes['datat' + iel + '#' + i].value = km.datatype
                  }

                  if (selector.termType) {
                    this.rdftypes['rdfty' + iel + '#' + i].value = selector.termType == 'LITERAL' ? 'Literal' : selector.termType
                  }

                }
              } else if (iel.match('^.*-e[0-9]+$' ) && !el.selectors) {
                  this.rdftypes['rdfty' + iel + '#0'].disabled = true
                  this.datatypes['datat' + iel + '#0'].disabled = true
              }
           }
         })
       })
      }
  }

  applyClassSelection(checkboxes, selectIdentifiers, rootPathIdentifier, element) {
    // console.log('applyClassSelection')
    // console.log(rootPathIdentifier)
    // console.log(element)
    // console.log(checkboxes)
    for (var ch in checkboxes) {
      if (ch.match('^check-' + (rootPathIdentifier.length > 0 ? (rootPathIdentifier + '-c[0-9]+$') : 'c[0-9]+$') ) && checkboxes[ch].class === element.clazz) {
        selectIdentifiers.push({ identifier: ch })
        var newRootPathIdentifier = ch.substring(6)
        checkboxes = this.selectClass(checkboxes, newRootPathIdentifier, element.clazz)

        if (element.properties) {
          for (var propElement of element.properties) {
            checkboxes = this.applyPropertySelection(checkboxes, selectIdentifiers, newRootPathIdentifier, propElement)
          }
        }

        if (element.embedders) {
          for (var embedderElement of element.embedders) {
            checkboxes = this.applyEmbedderSelection(checkboxes, selectIdentifiers, newRootPathIdentifier, embedderElement)
          }
        }
        break;
      }
    }

    return checkboxes
  }

  applyPropertySelection(checkboxes, selectIdentifiers, rootPathIdentifier, element) {
    // console.log('applyPropertySelection')
    // console.log(rootPathIdentifier)
    // console.log(element)
    // console.log(checkboxes)
    for (var ch in checkboxes) {
      if (ch.match('^check-' + rootPathIdentifier + '-p[0-9]+$') && checkboxes[ch].property === element.property) {
        if (element.selectors) {
          selectIdentifiers.push({ identifier: ch, selectors: element.selectors })
        } else {
          selectIdentifiers.push({ identifier: ch })
        }
        var newRootPathIdentifier = ch.substring(6)
        checkboxes = this.selectProperty(checkboxes, newRootPathIdentifier, element.selectors ? element.selectors.length : -1 )

        if (element.elements) {
          for (var classElement of element.elements) {
            checkboxes = this.applyClassSelection(checkboxes, selectIdentifiers, newRootPathIdentifier, classElement)
          }
        }
        break;
      }
    }

    return checkboxes
  }

  applyEmbedderSelection(checkboxes, selectIdentifiers, rootPathIdentifier, element) {
    // console.log('applyPropertySelection')
    // console.log(rootPathIdentifier)
    // console.log(element)
    // console.log(checkboxes)
    for (var ch in checkboxes) {
      if (ch.match('^check-' + rootPathIdentifier + '-e[0-9]+$') && checkboxes[ch].embedderId === element.embedderId) {
        if (element.selectors) {
          selectIdentifiers.push({ identifier: ch, selectors: element.selectors })
        } else {
          selectIdentifiers.push({ identifier: ch })
        }
        var newRootPathIdentifier = ch.substring(6)
        checkboxes = this.selectEmbedder(checkboxes, newRootPathIdentifier)

        if (element.elements) {
          for (var classElement of element.elements) {
            checkboxes = this.applyClassSelection(checkboxes, selectIdentifiers, newRootPathIdentifier, classElement)
          }
        }
        break;
      }
    }

    return checkboxes
  }

  selectClass(checkboxes, pathIdentifier, uri) {
    var classElement = this.state.classStructure.find(cl => cl.class === uri)

    var newCheckboxes = { ...checkboxes }
    var embedders = classElement.embedders;

    if (embedders) {
      for (var i in embedders) {
        newCheckboxes['check-' + pathIdentifier + '-e' + i] = { ...embedders[i], path: newCheckboxes['check-' + pathIdentifier].path }
      }
    }

    for (var i in classElement.children) {
      newCheckboxes['check-' + pathIdentifier + '-p' + i] = { property: classElement.children[i].property, path: newCheckboxes['check-' + pathIdentifier].path.concat(classElement.children[i].property)  }
    }

    return newCheckboxes;
  }

  selectProperty(checkboxes, pathIdentifier, elementSelectorsSize) {
    var labelPath = checkboxes['check-' + pathIdentifier].path

    var classElement = this.state.classStructure.find(el => el.class === labelPath[labelPath.length - 2])
    var propElement = classElement.children.find(el => el.property === labelPath[labelPath.length - 1])

    var ranges = propElement.range

    var newCheckboxes = { ...checkboxes }
    var lines = newCheckboxes['check-' + pathIdentifier].lines
    if (!lines) {
      if (elementSelectorsSize && elementSelectorsSize > 0) {
        newCheckboxes['check-' + pathIdentifier].lines = [];
        for (var i = 0; i < elementSelectorsSize; i++) {
          newCheckboxes['check-' + pathIdentifier].lines.push(i)
        }
      } else {
        newCheckboxes['check-' + pathIdentifier].lines = [0]
      }
    }

    if (ranges) {
      for (var i in ranges) {
        newCheckboxes['check-' + pathIdentifier + '-c' + i] = { class: ranges[i], path: newCheckboxes['check-' + pathIdentifier].path.concat(ranges[i]) }
      }
    }

    return newCheckboxes
  }

  selectEmbedder(checkboxes, pathIdentifier) {
    var labelPath = checkboxes['check-' + pathIdentifier].path

    var newCheckboxes = { ...checkboxes }
    var lines = newCheckboxes['check-' + pathIdentifier].lines
    if (!lines) {
       newCheckboxes['check-' + pathIdentifier].lines = [0]
    }

    return newCheckboxes
  }

  getIdentifier(field) {
      return field.substring(field.indexOf('-') + 1);
  }

  classSelected(pathIdentifier, uri) {
    this.index.value = '';
    this.identifier.disabled = false

    // if (this.indexEngine) {
    //   this.indexEngine.disabled = false;
    // }

    var checked = this.checkboxes['check-' + pathIdentifier].checked;

    if (!checked) {
       var newCheckboxes = { ...this.state.checkboxes }
      for (var key of Object.keys(this.state.checkboxes).filter(k => k.startsWith('check-' + pathIdentifier + '-'))) {
        delete newCheckboxes[key]
      }
      this.setState({ checkboxes: newCheckboxes })

    } else {
      this.setState({ checkboxes: this.selectClass(this.state.checkboxes, pathIdentifier, uri) })
    }
  }

  enableNewIndex() {
    this.index.value = '';
    this.identifier.disabled = false
  }

  nameChanged(pathIdentifier, line) {
    this.enableNewIndex();

    if (pathIdentifier.includes('-e')) { // embedder
      return;
    } else { // property
      var name = this.names['names-' + pathIdentifier + "#" + line].value;

      if (!name || name.length == 0) {
        this.rdftypes['rdfty-' + pathIdentifier + "#" + line].disabled = true;
        this.datatypes['datat-' + pathIdentifier + "#" + line].disabled = true;
        this.languages['langu-' + pathIdentifier + "#" + line].disabled = true;
        this.expansions['expan-' + pathIdentifier + "#" + line].disabled = true;
        // this.targets['targe-' + pathIdentifier + "#" + line].disabled = true;
      } else {
        this.rdftypes['rdfty-' + pathIdentifier + "#" + line].disabled = false;
        this.datatypes['datat-' + pathIdentifier + "#" + line].disabled = false;
        this.languages['langu-' + pathIdentifier + "#" + line].disabled = false;
        this.expansions['expan-' + pathIdentifier + "#" + line].disabled = false;
        // this.targets['targe-' + pathIdentifier + "#" + line].disabled = false;
      }
    }
  }

  propertySelected(pathIdentifier) {
    this.enableNewIndex();

    var checked = this.checkboxes['check-' + pathIdentifier].checked;

    if (!checked) {
      var newCheckboxes = { ...this.state.checkboxes }
      for (var key of Object.keys(this.state.checkboxes).filter(k => k.startsWith('check-' + pathIdentifier + '-'))) {
        delete newCheckboxes[key]
      }

      delete newCheckboxes['check-' + pathIdentifier].lines

      this.setState({ checkboxes: newCheckboxes })

    } else {
      this.setState({ checkboxes: this.selectProperty(this.state.checkboxes, pathIdentifier) })
    }
  }

  embedderSelected(pathIdentifier) {
    this.enableNewIndex();

    var checked = this.checkboxes['check-' + pathIdentifier].checked;

    if (!checked) {
      var newCheckboxes = { ...this.state.checkboxes }

      delete newCheckboxes['check-' + pathIdentifier].lines

      this.setState({ checkboxes: newCheckboxes })

    } else {
      this.setState({ checkboxes: this.selectEmbedder(this.state.checkboxes, pathIdentifier) })
    }
  }

  addLine(pathIdentifier) {
    var newCheckboxes = { ...this.state.checkboxes }

    var lines = newCheckboxes['check-' + pathIdentifier].lines
    lines.push(lines[lines.length - 1] + 1)

    this.setState( { checkboxes: newCheckboxes } )
  }

  deleteLine(pathIdentifier, line) {
    // console.log(pathIdentifier)
    // console.log(line)

    var newCheckboxes = { ...this.state.checkboxes }
// console.log(newCheckboxes)

    var lines = newCheckboxes['check-' + pathIdentifier].lines
    // console.log(lines)
    lines = lines.filter(el => el !== line)
    // console.log(lines)
    newCheckboxes['check-' + pathIdentifier].lines = lines
// console.log('names-' + pathIdentifier + "#" + line)
    delete this.names['names-' + pathIdentifier + "#" + line]
// console.log(newCheckboxes)
// console.log(this.names)
    this.setState( { checkboxes: newCheckboxes } )
  }

  renderClasses(roots, depth) {
    if (roots) {
      const style = {
        paddingLeft: (0 + depth*20) + "px",
      }

      const estyle = {
        paddingLeft: (0 + (depth + 1)*20 + 40) + "px",
      }

      return (
        <div>
          {roots.map((el, index) => {
            var pathIdentifier = this.getIdentifier(el)

            return (
              <React.Fragment key={pathIdentifier}>
                <Row className="index-field-row">
                  <Col style={style}>
                    <Form.Check className="bold" id={pathIdentifier} key={pathIdentifier} ref={node => (this.checkboxes['check-' + pathIdentifier] = node)}
                      onChange={() => this.classSelected(pathIdentifier, this.state.checkboxes[el].class)}
                      label = {this.state.checkboxes[el].class}/>
                  </Col>
                </Row>
                {this.renderEmbedders(Object.keys(this.state.checkboxes).filter(k => k.match('^check-' + pathIdentifier + '-e[0-9]+$')), depth + 1)}
                {this.renderProperties(Object.keys(this.state.checkboxes).filter(k => k.match('^check-' + pathIdentifier + '-p[0-9]+$')), depth + 1)}
              </React.Fragment>)
            })}
        </div>
      )
    }
  }

  renderProperties(roots, depth) {
    if (roots) {
      const style = {
        paddingLeft: (0 + depth*20) + "px",
      }

      return (
        <div>
        {roots.map((el, index) => {
          var pathIdentifier = this.getIdentifier(el)
          return (
          <React.Fragment key={pathIdentifier}>
            <Row className="index-field-row">
              <Col md="5" style={style}>
                <Form.Check id={pathIdentifier}  key={pathIdentifier} ref={node => (this.checkboxes['check-' + pathIdentifier] = node)}
                        onChange={() => this.propertySelected(pathIdentifier)}
                        label = {this.state.checkboxes[el].property}/>
              </Col>
              <Col md="6">
              {this.checkboxes['check-' + pathIdentifier] && this.checkboxes['check-' + pathIdentifier].checked &&
               this.state.checkboxes['check-' + pathIdentifier].lines && this.state.checkboxes['check-' + pathIdentifier].lines.map(line =>
                <Row>
                  <Col md="3" className="index-column">
                      <Form.Control className="index-field"
                              key={'name-'+ pathIdentifier} ref={node => (this.names['names-' + pathIdentifier + "#" + line] = node)}
                              onChange={() => this.nameChanged(pathIdentifier, line)}
                              defaultValue = ''/>
                  </Col>
                  <Col md="2" className="index-column">
                      <Form.Control className="index-field-m" as="select"
                              key={'rdftype-'+ pathIdentifier} ref={node => (this.rdftypes['rdfty-' + pathIdentifier + "#" + line] = node)}
                              onChange={() => this.enableNewIndex()}
                              >
                              <option value="IRI">IRI</option>
                              <option value="Literal">Literal</option>
                      </Form.Control>
                  </Col>
                  <Col md="2" className="index-column">
                      <Form.Control className="index-field-m" as="select"
                              key={'datatype-'+ pathIdentifier} ref={node => (this.datatypes['datat-' + pathIdentifier + "#" + line] = node)}
                              onChange={() => this.enableNewIndex()}
                              >
                              <option value="boolean">boolean</option>
                              <option value="date">date</option>
                              <option value="double">double</option>
                              <option value="float">float</option>
                              <option value="integer">integer</option>
                              <option value="keyword">keyword</option>
                              <option value="long">long</option>
                              <option value="search_as_you_type">search_as_you_type</option>
                              <option value="text">text</option>
                      </Form.Control>
                  </Col>
                  <Col md="2" className="index-column">
                      <Form.Control className="index-field"
                              key={'language-'+ pathIdentifier} ref={node => (this.languages['langu-' + pathIdentifier + "#" + line] = node)}
                              onChange={() => this.enableNewIndex()}
                              defaultValue = ''/>
                  </Col>
                  <Col md="2" className="index-column">
                  <Multiselect ref={node => (this.expansions['expan-' + pathIdentifier + "#" + line] = node)}
                    options={this.state.expandOptions} // Options to display in the dropdown
                    // selectedValues={this.state.expandOptions} // Preselected value to persist in dropdown
                    onSelect={() => this.enableNewIndex()} // Function will trigger on select event
                    onRemove={() => this.enableNewIndex()} // Function will trigger on remove event
                    displayValue="name" // Property name to display in the dropdown options
                    />
                  </Col>
                  {/*<Col md="1">
                      <Form.Control className="index-field"
                              key={'target-'+ pathIdentifier} ref={node => (this.targets['targe-' + pathIdentifier + "#" + line] = node)}
                              onChange={() => this.enableNewIndex()}
                              defaultValue = ''/>
                  </Col>*/}
                  <Col md="1" className="index-column">
                    <Button type="button" className="menubutton mt-0" onClick={() => this.deleteLine(pathIdentifier, line)}>
                      <span className="fa fa-minus"/>
                    </Button>
                  </Col>
                </Row>)}
              </Col>
              <Col md="1" className="index-column">
                {this.checkboxes['check-' + pathIdentifier] && this.checkboxes['check-' + pathIdentifier].checked &&
                <Button type="button" className="menubutton mt-0 ml-1 mr-1" onClick={() => this.addLine(pathIdentifier)}>
                  <span className="fa fa-plus"/>
                </Button>}
              </Col>
            </Row>
            {this.renderClasses(Object.keys(this.state.checkboxes).filter(k => k.match('^check-' + pathIdentifier + '-c[0-9]+$')), depth + 1)}
          </React.Fragment>)
        })}
        </div>
      )
    }
  }

  renderEmbedders(roots, depth) {
    if (roots) {
      const style = {
        paddingLeft: (0 + depth*20) + "px",
      }

      return (
        <div>
        {roots.map((el, index) => {
          var pathIdentifier = this.getIdentifier(el);
          return (
          <React.Fragment key={pathIdentifier}>
            <Row className="index-field-row">
              <Col md="5" style={style}>
                <Form.Check id={pathIdentifier}  key={pathIdentifier} ref={node => (this.checkboxes['check-' + pathIdentifier] = node)}
                        onChange={() => this.embedderSelected(pathIdentifier)}
                        label = {this.state.checkboxes[el].embedder}/>
              </Col>
              <Col md="6">
              {this.checkboxes['check-' + pathIdentifier] && this.checkboxes['check-' + pathIdentifier].checked &&
               this.state.checkboxes['check-' + pathIdentifier].lines && this.state.checkboxes['check-' + pathIdentifier].lines.map(line =>
                <Row>
                  <Col md="3" className="index-column">
                      <Form.Control className="index-field"
                              key={'name-'+ pathIdentifier} ref={node => (this.names['names-' + pathIdentifier + "#" + line] = node)}
                              onChange={() => this.nameChanged(pathIdentifier, line)}
                              defaultValue = ''/>
                  </Col>
                  <Col md="2" className="index-column">
                      <Form.Control className="index-field-m" as="select"
                              key={'rdftype-'+ pathIdentifier} ref={node => (this.rdftypes['rdfty-' + pathIdentifier + "#" + line] = node)}
                              value='Literal'
                              disabled={true}
                              onChange={() => this.enableNewIndex()}
                              >
                              <option value="IRI">IRI</option>
                              <option value="Literal">Literal</option>
                      </Form.Control>
                  </Col>
                  <Col md="2" className="index-column">
                      <Form.Control className="index-field-m" as="select"
                              key={'datatype-'+ pathIdentifier} ref={node => (this.datatypes['datat-' + pathIdentifier + "#" + line] = node)}
                              value='dense_vector'
                              disabled={true}
                              onChange={() => this.enableNewIndex()}
                              >
                              <option value="boolean">boolean</option>
                              <option value="date">date</option>
                              <option value="dense_vector">dense_vector</option>
                              <option value="double">double</option>
                              <option value="float">float</option>
                              <option value="integer">integer</option>
                              <option value="keyword">keyword</option>
                              <option value="long">long</option>
                              <option value="search_as_you_type">search_as_you_type</option>
                              <option value="text">text</option>
                      </Form.Control>
                  </Col>
                  <Col md="2" className="index-column">
                      {/*<Form.Control className="index-field"
                              key={'language-'+ pathIdentifier} ref={node => (this.languages['langu-' + pathIdentifier + "#" + line] = node)}
                              onChange={() => this.enableNewIndex()}
                              defaultValue = ''/>*/}
                  </Col>
                  <Col md="2" className="index-column">
                  </Col>
                  {/*<Col md="1">
                      <Form.Control className="index-field"
                              key={'target-'+ pathIdentifier} ref={node => (this.targets['targe-' + pathIdentifier + "#" + line] = node)}
                              onChange={() => this.enableNewIndex()}
                              defaultValue = ''/>
                  </Col>*/}
                  <Col md="1" className="index-column">
                    {/*<Button type="button" className="menubutton mt-0" onClick={() => this.deleteLine(pathIdentifier, line)}>
                      <span className="fa fa-minus"/>
                    </Button>*/}
                  </Col>
                </Row>)}
              </Col>
              <Col md="1" className="index-column">
                {/*this.checkboxes['check-' + pathIdentifier] && this.checkboxes['check-' + pathIdentifier].checked &&
                <Button type="button" className="menubutton mt-0 ml-1 mr-1" onClick={() => this.addLine(pathIdentifier)}>
                  <span className="fa fa-plus"/>
                </Button>*/}
              </Col>
            </Row>
            {this.renderClasses(Object.keys(this.state.checkboxes).filter(k => k.match('^check-' + pathIdentifier + '-c[0-9]+$')), depth + 1)}
          </React.Fragment>)
        })}
        </div>
      )
    }
  }

  render() {

    // console.log("RENDER")
    // console.log(this.state)
    // console.log(this.checkboxes)
    return (
      <Modal show={this.props.show} onHide={this.props.onClose} animation={false} backdrop="static" size="xl" >
        <Form onSubmit={this.handleSubmit}>
          <Modal.Header>
            <Modal.Title>Index dataset</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group>
              <Form.Label>Dataset</Form.Label>
              <Form.Control disabled value={this.props.dataset.name}/>
            </Form.Group>
            <Form.Group>
              <Form.Label>Index</Form.Label>
              <Form.Control as="select" ref={node => (this.index = node)}
                            onChange={() => this.indexChanged()}
                            defaultValue=''>
                <option key={0} value=''>--- New ---</option>
                {this.props.indices.map((entry, index) =>
                   <option key={index + 1} value={entry.id}>{entry.identifier}</option>)}
              </Form.Control>
            </Form.Group>
            <Form.Group>
              <Form.Label>New index identifier</Form.Label>
              <Form.Control ref={node => (this.identifier = node)}/>
            </Form.Group>

            {this.props.indexEngines.length > 1 && <Form.Group>
              <Form.Label>Index engine</Form.Label>
              <Form.Control as="select" ref={node => (this.indexEngine = node)}
                defaultValue={this.props.value && this.props.value.indexEngine ? this.props.value.indexEngine : ""}>
                {this.props.indexEngines.map((entry, index) =>
                  <option key={index} value={entry}>{entry}</option>)}
              </Form.Control>
            </Form.Group>}

            <Form.Group>
            <Form.Label>Selection</Form.Label>
            <React.Fragment>
              <Row className="index-field-row">
                <Col md="5" >
                  Path
                </Col>
                <Col md="6">
                <Row>
                  <Col md="3" className="index-column">
                    Name
                  </Col>
                  <Col md="2" className="index-column">
                    Type
                  </Col>
                  <Col md="2" className="index-column">
                    Datatype
                  </Col>
                  <Col md="2" className="index-column">
                    Languages
                  </Col>
                  <Col md="2" className="index-column">
                    Expansion
                  </Col>
                  <Col md="1" className="index-column">

                  </Col>
                  </Row>
                </Col>
              </Row>
              {this.renderClasses(Object.keys(this.state.checkboxes).filter(k => k.match('^check-c[0-9]+$')), 0)}
            </React.Fragment>
          </Form.Group>

          </Modal.Body>
          <Modal.Footer>
            <Button type="submit" variant="primary">
              OK
            </Button>
            <Button variant="secondary" onClick={this.props.onClose}>
              Cancel
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
  )}
}


export default IndexModal;
