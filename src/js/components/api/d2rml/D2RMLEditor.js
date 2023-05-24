import React, { Component } from "react";
import Container from "react-bootstrap/Container";
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import Tabs from "react-bootstrap/Tabs";
import Tab from "react-bootstrap/Tab";
import Form from "react-bootstrap/Form";
import { copyReplaceAt } from '../../../utils/functions.js';

import { r2rml, d2rml, d2rmlis, http, lookupSource, getD2RMLFunctions, createD2RMLDocument, prepareJSONLDXtoState } from "../../../utils/D2RMLUtils.js";
import { downloadMapping } from '../../../utils/APIUtils';

import Prefixes from "./Prefixes.js";
import InformationSource from "./InformationSource.js";
import TriplesMap from "./TriplesMap.js";
import Transformation from "./Transformation.js";
import YateEditor from "../YateEditor.js";


export class D2RMLEditor extends Component {
  constructor(props) {
    super(props);

// console.log(props);

    const st = this.createMapping(props);
    this.state = {
      id: st.id,
      name: st.name,

      prefixes: st.prefixes,
      sources: st.sources,
      transformations: st.transformations,
      mappings: st.mappings,
      files: st.files,

      lastExecution: null,

      resultsShow: false,
      showCode: true,
      d2rmlCode: '',
      fileContents: st.fileContents
      // open: {}
    };

    // console.log(this.state);

    // remove for d2rml editor
    if (this.state.showCode) {
      downloadMapping(props.value.id).then((response) => {
        response.text().then(text =>
        this.setState({d2rmlCode: text})
      )
    })}
    // remove for d2rml editor

    this.handlePrefixChange = this.handlePrefixChange.bind(this);
    this.handleFileUpload = this.handleFileUpload.bind(this);

    this.handleSourceChange = this.handleSourceChange.bind(this);
    this.handleAddSource = this.handleAddSource.bind(this);
    this.handleDeleteSource = this.handleDeleteSource.bind(this);

    // this.handleMappingChange = this.handleMappingChange.bind(this);
    this.handleAddMapping = this.handleAddMapping.bind(this);
    this.handleDeleteMapping = this.handleDeleteMapping.bind(this);

    this.handleTermMapChange = this.handleTermMapChange.bind(this);
    this.move = this.move.bind(this);

    this.levenshtein = require('js-levenshtein');
    this.uuidv1 = require('uuid/v1');
  }

  move(array, dir, index) {
    var newArray = [];

    if (dir === 'up') {
      if (index === 0) {
        return;
      }
      newArray = newArray.concat(this.state[array].slice(0, index - 1));
      newArray.push(this.state[array][index]);
      newArray.push(this.state[array][index - 1]);
      newArray = newArray.concat(this.state[array].slice(index + 1));

    } else if (dir === 'down') {
      if (index === this.state[array].length - 1) {
        return
      }

      newArray = newArray.concat(this.state[array].slice(0, index));
      newArray.push(this.state[array][index + 1]);
      newArray.push(this.state[array][index]);
      newArray = newArray.concat(this.state[array].slice(index + 2));
    }

    this.setState({ [array]: newArray });
  }


  createMapping(props) {
    var prefixes = [];
    var sources = [];
    var transformations = [];
    var mappings = [];


    if (props.value.hasOwnProperty('d2RML')) {
      var json = JSON.parse(props.value.d2RML);

      // console.log("JSON");
      // console.log(json);

      const v = prepareJSONLDXtoState(json);

      prefixes = v.prefixes;
      sources = v.sources;
      transformations = v.transformations;
      mappings = v.mappings;
    }

    var files = [];
    if (props.value.files) {
      files = props.value.files.map(el => { return { name: el} } );
    }

    return {
      id: props.value.id,
      name: props.value.name,
      prefixes: prefixes,
      sources: sources,
      transformations: transformations,
      mappings: mappings,
      files: files,
      lastExecution: null,
      fileContents : props.value.fileContents != null ? props.value.fileContents : ''
    };

  }

  componentWillReceiveProps(props) {
      this.setState(this.createMapping(props));
      // remove for d2rml editor
      if (this.state.showCode) {
        downloadMapping(props.value.id).then((response) => {
          response.text().then(text =>
          this.setState({d2rmlCode: text})
        )
      })}
      // remove for d2rml editor

        // console.log('UPDATE PROPS');
        // console.log(this.state.prefixes);
        // console.log(this.state.sources);
        // console.log(this.state.mappings);

  }

  handleFileUpload(oldname, newname, blob) {

    // console.log("FILE UPLOAD");
    // console.log(this.state.files);
    // console.log(oldname);
    // console.log(newname);

    // var oldnameFile = oldname.split('\\').pop().split('/').pop();
    // console.log(oldnameFile);

    var newFiles = [];
    var ok = false;
    for (const i in this.state.files) {
       if (this.state.files[i].name === oldname) {
    // if (this.state.files[i].name === newname) {
         ok = true;
         newFiles.push({ name: newname, blob: blob } );
       } else {
         newFiles.push(this.state.files[i]);
       }
    }

    if (!ok) {
      newFiles.push({ name: newname, blob: blob } );
    }

    // console.log(newFiles);
    this.setState({ files: newFiles });

    // console.log('FILE UPLOAD')
    // console.log(this.state.files);
  }

  newPrefix() {
    return { prefix: '', url: '' };
  }

  newSource() {
    return { '@id': this.uuidv1(),
             '@type': d2rmlis('HTTPSource'),
             [d2rmlis('request')]: { [http('methodName')]: 'GET', [http('absoluteURI')]: '' } }
  }

  newMapping(array) {
    if (array === 'mappings') {
      return { '@id': this.uuidv1(),
               [r2rml('subjectMap')]: { [r2rml('constant')]: '' },
               [d2rml('logicalSource')]: { [d2rml('source')]: [ ] }
                };
    } else if (array === 'transformations') {
      return { '@id': this.uuidv1(),
               [d2rml('logicalSource')]: { [d2rml('source')]: [ ] }
                };
              }
  }

  handleAddSource() {
    this.setState({ sources: this.state.sources.slice().concat(this.newSource()) })
 }

  handleAddMapping(array) {
    this.setState({ [array]: this.state[array].slice().concat(this.newMapping(array)) })
  }

  handleDeleteSource(index) {
    this.setState({ sources: this.state.sources.slice(0, index).concat(this.state.sources.slice(index + 1)) });
  }

  handleDeleteMapping(index) {
    this.setState({ mappings: this.state.mappings.slice(0, index).concat(this.state.mappings.slice(index + 1)) });
  }

  handlePrefixChange(type, index, event) {
    if (type === 'add') {
      const size = this.state.prefixes.length - 1;

      if (size < 0 || (this.state.prefixes[size].prefix.length > 0 &&
          this.state.prefixes[size].url.length > 0)) {
            this.setState({ prefixes: this.state.prefixes.slice().concat(this.newPrefix()) });
          }
    } else if (type === 'delete') {
      this.setState({ prefixes: this.state.prefixes.slice(0, index).concat(this.state.prefixes.slice(index + 1)) });
    } else {
      var obj;
       if (type === 'prefix') {
         // console.log('P');
         // console.log(event.target.value);
         // if (value === undefined) {
           obj = { prefix: event.target.value, url: this.state.prefixes[index].url };
         // } else {
         //   obj = { prefix: event.target.value, url: value };
         // }
       } else if (type === 'url') {
         obj = { prefix: this.state.prefixes[index].prefix, url: event.target.value };
       }
       this.setState(copyReplaceAt('prefixes', this.state.prefixes, index, obj));
     }
  }

  handleSourceChange(event, index, path, attr, props) {

    // console.log(event.target.value);
    // console.log(index);
    // console.log(path);
    // console.log(attr);
    // console.log(props);
    //
    // console.log(this.state.sources);

    // const value = this.state.sources[index];

    // var obj;

    var sm;
    if (attr === 'delete') {
      sm = null;
    } else if (attr === 'add') {
      sm = props;
    } else if (attr === http('methodName')) {
      sm = { ...props,
              [d2rmlis('request')]: {
                 ...props[d2rmlis('request')], [http('methodName')]: event.target.value }
           }
     } else if (attr === http('absoluteURI')) {
       const regex = /\{@@([A-z0-9_]+?)@@\}/g;

       var matches = Array.from(event.target.value.matchAll(regex)).map(el => el[1]);
       var pMatches = Array.from(event.target.defaultValue.matchAll(regex)).map(el => el[1]);

       var nv = [];

       // console.log('PARAMS');
       // console.log(matches);
       // console.log(pMatches);

       var dist = [];
       for (var i = 0; i < matches.length; i++) {
         dist.push([]);
         for (var j = 0; j < pMatches.length; j++) {
           dist[i].push(this.levenshtein(matches[i], pMatches[j]));
         }
       }

       var pParams = props[d2rmlis('parameter')];
       if (pParams === undefined) {
         pParams = [];
       }
       if (matches.length > 0) {
         var used = [];
         nv = matches.map((el, index) => {
           // console.log('C');
           // console.log(index);
           // console.log(dist[index]);
           var j = Math.min(...dist[index]);
           for (var k in dist[index]) {
             if (j === dist[index][k]) {
               j = k;
               break;
             }
           }
           if (!used.includes(j)) {
             used.push(j);
             // console.log('A1');
             // console.log(pParams);
             // console.log(j);
             // console.log(pMatches[j]);

             return { ...pParams.filter(el => el[d2rmlis('name')] === pMatches[j])[0], [d2rmlis('name')]: matches[0]};
           } else {
             // console.log('B1');
              return { [d2rmlis('name')]: matches[0], '@id': d2rmlis('SimpleCountRequestIterator') };
           }
         });

       }
       // console.log('NV');
       // console.log(nv);
       if (nv.length > 0) {
         sm = { ...props,
                [d2rmlis('request')]: { ...props[d2rmlis('request')], [http('absoluteURI')]: event.target.value },
                [d2rmlis('parameter')]: nv
              }
      } else {
        sm = { ...props,
               [d2rmlis('request')]: { ...props[d2rmlis('request')], [http('absoluteURI')]: event.target.value },
             }
      }
    } else if (attr === 'http-source-parameter-type') {
      if (event.target.value === d2rmlis('SimpleCountRequestIterator')) {
        sm = { '@type': event.target.value,
                 [d2rmlis('name')]: props[d2rmlis('name')],
                 [d2rmlis('initialValue')]: 0,
                 [d2rmlis('maxValue')]: 0,
                 [d2rmlis('increment')]: 0,
               }
      } else if (event.target.value === d2rmlis('NextKeyRequestIterator')) {
         sm = { '@type': event.target.value,
                     [d2rmlis('name')]: props[d2rmlis('name')],
                     [d2rmlis('initialValue')]: '',
                     [d2rmlis('reference')]: '',
                     [d2rmlis('separator')]: '',
                   }
      }
     } else if (attr === '@type') {
        // sm = { ...props, [attr]: event.target.value }
        sm = {'@id': props['@id'], [attr]: event.target.value }

        if (event.target.value === d2rmlis('HTTPSource')) {
           sm = {...sm, [d2rmlis('request')]: { [http('methodName')]: 'GET', [http('absoluteURI')]: '' } }
        } else if (event.target.value === d2rmlis('FileSource')) {
          sm = {...sm, [d2rmlis('path')]: [ '' ] };
        } else if (event.target.value === d2rmlis('RDBMSSource')) {
          sm = {...sm, [d2rmlis('rdbms')]: {'@id' : d2rmlis('MySQL') } };
        }
     // } else if (attr === d2rmlis('path')) {
     //   sm = { ...props, [d2rmlis('path')]: props[d2rmlis('path')].map(el => {
     //                      return (el === event.target.defaultValue) ? event.target.value : el })
     //        }
     } else if (attr === d2rmlis('rdbms')) {
         sm = { ...props, [d2rmlis('rdbms')]: { '@id' : event.target.value } }
     } else if (attr === 'controlled-id') {
         sm = { ...props, '@id': event }
     } else if (attr !== undefined) {
       sm = { ...props, [attr]: event.target.value }
     } else if (attr === undefined) {
       sm = event.target.value;
     }

     var value = this.state.sources[index];

// console.log('REPLACE');
// console.log(value);
// console.log(path);
// console.log(sm);
     var obj = this.replace(value, path, sm);
     // console.log(obj);

     // console.log(copyReplaceAt('sources', this.state.sources, index, obj));

     // console.log("BEFORE");
     // console.log(this.state);
      // console.log(obj);

    // console.log("AFTER");
    // console.log(copyReplaceAt('sources', this.state.sources, index, obj));

    this.setState(copyReplaceAt('sources', this.state.sources, index, obj));

    // console.log(this.state);
  }

 //let index:-1 denote no array, index >= 0 array
  replace(value, path, sm) {
    // console.log('PATH')
    // console.log(path)
    if (path.length === 0) {
      return sm;
    } else {
      const curr = path[0];

      var cvalue = value[curr.type];
      var array = curr.index !== undefined;
      var x;

      if (array && cvalue === undefined) {
        cvalue = [];
      }

      if (!array) {
        x = this.replace(cvalue, path.slice(1), sm)
      } else {
        if (value.hasOwnProperty(curr.type)) {
          x = this.replace(cvalue[curr.index], path.slice(1), sm)
        } else {
          cvalue = [];
          x = this.replace(undefined, path.slice(1), sm)
        }
      }

      // console.log('PATH');
      // console.log(path);
      // console.log(path.length);
      // console.log(x)
      // console.log(array)
      // if (x !== null) {
      //   console.log(Object.keys(x).length);
      // }

      if (path.length === 2 && path[1].type === '@list' && x !== null && Object.keys(x).length === 0) {
        x = null;
      }

      // console.log('NEW X');
      // console.log(x)
      if (x !== null) {
        var ret;
        if (!array) {
          ret = {...value, [path[0].type]:x };
        } else {
          z = cvalue.slice(0, curr.index).concat(x).concat(cvalue.slice(curr.index + 1));
          ret = {...value, [path[0].type]:z };
        }
      } else {
        if (!array) {
          ret = {...value };
          delete ret[path[0].type];
        } else {
          var z = cvalue.slice(0, curr.index).concat(cvalue.slice(curr.index + 1));
          if (z.length > 0) {
            ret = {...value, [path[0].type]:z };
          } else {
            ret = {...value };
            delete ret[path[0].type];
          }
        }
      }

      // console.log('PATH');
      // console.log(path);
      // console.log(ret);
      return ret;
    }

  }

  handleTermMapChange(array, event, index, path, attr, props, type) {
    // console.log(event.target.value);
    // console.log('TERM MAP CHANGE');
    // console.log(event);
    // console.log(index);
    // console.log(path);
    // console.log(attr);
    // console.log(props);
    // console.log(type);

    var sm;
    if (attr === 'delete') {
      sm = null;
    } else if (attr === 'add') {
      sm = props;
    } else if (attr === 'term-type') {
      sm = { ...props, [r2rml('termType')]: { '@id': event.target.value } };

      // if (event.target.value === r2rml('BlankNode')) {
      //   delete sm[r2rml('constant')];
      //   delete sm[r2rml('column')];
      //   delete sm[r2rml('template')];
      // } else {
        if (!sm.hasOwnProperty(r2rml('constant')) && !sm.hasOwnProperty(r2rml('template')) && !sm.hasOwnProperty(r2rml('column'))) {
          sm = { ...sm, [r2rml('constant')]: ''}
        }
      // }

    } else if (attr === 'term-map-type') {
      sm = { ...props };

      var v;
      if (sm.hasOwnProperty(r2rml('constant'))) {
        v = sm[r2rml('constant')]
        delete sm[r2rml('constant')]
      } else if (sm.hasOwnProperty(r2rml('column'))) {
        v = sm[r2rml('column')]
        delete sm[r2rml('column')]
      } else if (sm.hasOwnProperty(r2rml('template'))) {
        v = sm[r2rml('template')]
        delete sm[r2rml('template')]
      }

      if (event.target.value === r2rml('constant')) {
        if (type === '@id') {
          if (v['@id'] === undefined) {
            sm = { ...sm, [event.target.value]: {'@id': v }};
          } else {
            sm = { ...sm, [event.target.value]: v };
          }
        } else {
          if (v['@id'] === undefined) {
            sm = { ...sm, [event.target.value]: v };
          } else {
            sm = { ...sm, [event.target.value]: v['@id'] };
          }
        }
      } else {
        if (v['@id'] === undefined) {
          sm = { ...sm, [event.target.value]: v };
        } else {
          sm = { ...sm, [event.target.value]: v['@id'] };
        }
      }
    } else if (attr === 'term-map-value') {

      if (props.hasOwnProperty(r2rml('constant'))) {
        sm = { ...props, [r2rml('constant')]: (type === '@id' ?  {'@id' : event.target.value } : event.target.value) };
      } else if (props.hasOwnProperty(r2rml('column'))) {
        sm = { ...props, [r2rml('column')]: event.target.value };
      } else if (props.hasOwnProperty(r2rml('template'))) {
        sm = { ...props, [r2rml('template')]: event.target.value };
      }

    } else if (attr === r2rml('class')) {
      sm = { ...props, [r2rml('class')]: props[r2rml('class')].map(el => {
                         return (el['@id'] === event.target.defaultValue) ? { '@id': event.target.value } : {'@id': el['@id'] } })
           }

    } else if (attr === 'term-map-class-delete') {
      var classes = props[r2rml('class')].filter(el => { return (el['@id'] === event) ? false : true });
      sm = { ...props, [r2rml('class')]: classes }
      if (classes.length === 0) {
        delete sm[r2rml('class')];
      }

    } else if (attr === 'term-map-class-add') {
      var classes = props[r2rml('class')];
      if (classes === undefined) {
        classes = [];
      }
      sm = { ...props, [r2rml('class')]: classes.concat( {'@id': '' } ) }
    } else if (attr === 'term-map-defined-column-add') {
      var cols = props[d2rml('definedColumns')];
      if (cols === undefined) {
        cols = [];
      } else {
        cols = cols['@list'];
      }
      sm = { ...props, [d2rml('definedColumns')]: {'@list': cols.concat( {[d2rml('name')]: '' } ) } }
    } else if (attr === d2rml('function')) {
      var bindings = [];
      const args = getD2RMLFunctions().filter(el => el.value === event.target.value)[0].args;
      for (const i in args) {
        if (args[i].label === 'input') {
          bindings.push({ [d2rml('parameter')]: args[i].label , [r2rml('constant')]: '' });
        } else {
          bindings.push({ [d2rml('parameter')]: args[i].label });
        }
      }
      if (bindings.length > 0) {
        sm = {...props, [attr]: {'@id': event.target.value}, [d2rml('parameterBinding')]: bindings};
      } else {
        sm = {...props, [attr]: {'@id': event.target.value} };
        delete sm[d2rml('parameterBinding')];
      }
    } else if (attr === d2rml('source')) {
      var existingSourceType = undefined;

      var sources = props[d2rml('logicalSource')][d2rml('source')];
      for (const i in sources) {
        existingSourceType = lookupSource(this.state.sources, sources[i]['@id'])['@type'];
      }
      // console.log('xXXX')
      // console.log(props);
      // console.log(sources);
      // console.log(existingSourceType);
      // console.log(this.state.sources);

      var newSourceType = existingSourceType;
      if (existingSourceType === undefined) {
        newSourceType = lookupSource(this.state.sources, event[0].value)['@type'];
      } else {
        for (const i in event) {
          var itype = lookupSource(this.state.sources, event[i].value)['@type'];
          if (itype !== existingSourceType) {
            newSourceType = itype;
            break;
          }
        }
      }
// console.log('xXXX2')
//       console.log(newSourceType);

      if (event !== null) {
        event = event.filter(el => lookupSource(this.state.sources, el.value)['@type'] === newSourceType);

      // console.log(event)
      // // console.log('xXXX')
      // // console.log(props)
      // // console.log(props[d2rml('logicalSource')]);
      //
      // console.log( event === null ? [] : event.map(el => { return {'@id': el.value} } ) );
        // sm = { ...props, [attr]: event === null ? [] : event.map(el => { return {'@id': el.value} }) }
        sm = { ...props, [d2rml('logicalSource')]: { ...props[d2rml('logicalSource')],
                                              [attr]: event === null ? [] : event.map(el => { return {'@id': el.value} } ) } }
       } else {
         sm = { ...props, [d2rml('logicalSource')]: {}};
         // delete sm[d2rml('logicalSource')]
         delete sm[d2rml('logicalTable')]
       }
       // console.log(sm);
    } else if (attr === 'primary-map-change') {
        if (props['@type']) {
          var newTypes = [];
          var found = false;

          for (const i in props['@type']) {
            if (props['@type'][i] === d2rml('PrimaryTriplesMap')) {
              found = true;
            } else {
              newTypes.push(props['@type'][i]);
            }
          }

          if (!found) {
            newTypes.push(d2rml('PrimaryTriplesMap'));
          }

          sm = { ...props, '@type' : newTypes}
          if (newTypes.length === 0) {
            delete sm['@type'];
          }
        } else {
          sm = { ...props, '@type' : [ d2rml('PrimaryTriplesMap') ]}
        }
    } else if (attr === 'controlled-id') {
        sm = { ...props, '@id': event }
    } else if (attr !== undefined) {
      if (type !== undefined && type === '@id') {
        sm = { ...props, [attr]: {'@id': event.target.value} }
      } else {
        sm = { ...props, [attr]: event.target.value }
        // console.log('CHANGE');
        // console.log(props);
        // console.log(sm);
      }
    }

    var value = this.state[array][index];

    // console.log("REPLACE");
    // console.log(value);
    // console.log(path);
    // console.log(sm);

    var obj = this.replace(value, path, sm);
    // console.log(obj);

    // console.log(copyReplaceAt('mappings', this.state[array], index, obj));
    this.setState(copyReplaceAt(array, this.state[array], index, obj));
    // console.log(this.state[array]);

    // console.log(createD2RMLDocument(this.state.prefixes, this.state.sources, this.state.transformations, this.state.mappings));


  }

  executeAction(action, params) {
    if (action === 'view-d2rml') {
      // downloadMapping(params.id).then((response) => {
      //   response.text().then(text =>
      //   this.setState({ showCode: !this.state.showCode, d2rmlCode: text})
      // )  }
      // )
        this.setState({ showCode: !this.state.showCode});

    }
//   if (action === 'view-d2rml-execution') {
//     viewMappingExecution(this.state.id)
//       .then(response => {
//        if (response.status === 204) {
//          this.setState({ lastExecution: { message: "The mapping has not been executed." }})
//          return;
//        } else if (!response.ok) {
//         return "Error";
//       } else {
//         response.text().then(text =>
//           this.setState({ lastExecution: { text: text }, resultsShow:true}))
//       }
//     })
//   }
}





  render() {

    return (
      <div>
        <Row className="header">
        <Col className="mybutton"  md="auto">
          <span className='fa fa-bullseye close editbutton'></span>
        </Col>
        <Col>
          <Form.Control value={this.state.name} plaintext className="bold nospace2"
                        onChange={(event) => this.props.actions('update-name', {value: event.target.value})}/>
        </Col>
        <Col className="mybutton" md="auto">
            <Button type="button" className="menubutton" aria-label="View" onClick={() => this.executeAction('view-d2rml', {id: this.state.id })}><span className="fa fa-code"></span></Button>
        </Col>
        <Col className="mybutton" md="auto">
            <Button type="button" className="menubutton" aria-label="Save" onClick={() => this.props.actions('save-mapping', {id: this.state.id, json: JSON.stringify(createD2RMLDocument(this.state.prefixes, this.state.sources, this.state.transformations, this.state.mappings)), files: this.state.files})}><span className="fa fa-save"></span></Button>
        </Col>
        <Col className="mybutton" md="auto">
            <Button type="button" className="menubutton" aria-label="Download" download onClick={() => this.props.actions('download-d2rml', {id: this.state.id})}><span className="fa fa-download"></span></Button>
        </Col>
{/*        <Col className="mybutton" md="auto">
            <Button type="button" className="menubutton" aria-label="Execute" onClick={() => this.props.actions('execute-mapping', {id: this.state.id})}><span className="fa fa-play-circle"></span></Button>
        </Col>
        <Col className="mybutton" md="auto">
            <Button type="button" className="menubutton" aria-label="View last execution" onClick={() => this.executeAction('view-d2rml-execution')}><span className="fa fa-eye"></span></Button>
        </Col> */}
        {/*{this.props.delete &&
        <Col className="mybutton" md="auto">
            <Button type="button" className="menubutton" aria-label="Delete" onClick={() => this.props.actions('delete-mapping', {id: this.state.id})}><span className="fa fa-trash"></span></Button>
        </Col>}*/}
{/*
        <ResultsModal show={this.state.resultsShow}
                      execution={this.state.lastExecution}
                      onClose={() => this.setState({resultsShow:false})}/> */}
      </Row>
      {!this.state.showCode && <Row>
        <Col>
          <Tabs defaultActiveKey="mappings">
            <Tab eventKey="prefixes" title="Prefixes">
              <Prefixes value={this.state.prefixes}
                        onChange={(type, index, event, value) => this.handlePrefixChange(type, index, event, value)}/>
            </Tab>

            <Tab eventKey="sources" title="Information Sources">
              <Container className="grouping">
                <Row className="header">
                  <Col>
                  </Col>
                  <Col className="mybutton" md="auto">
                    <Button type="button" className="menubutton"  aria-label="Add"  onClick={this.handleAddSource}><span className='fa fa-plus'></span></Button>
                  </Col>
                </Row>
                <Row>
                  <Col>
                    {this.state.sources.map((el, index) => (
                    <InformationSource key={index} value={el} files={this.state.files}
                             onFileUpload={(oldname, newname, blob) => this.handleFileUpload(oldname, newname, blob)}
                             onChange={(event, attr, path, props, type) => this.handleSourceChange(event, index, path, attr, props, type)}/>))}
                  </Col>
                </Row>
              </Container>
            </Tab>

            <Tab eventKey="transformations" title="Transformations">
            <Container>
              <Row className="header">
                <Col>
                </Col>
                <Col className="mybutton" md="auto">
                  <Button type="button" className="menubutton"  aria-label="Add"  onClick={() => this.handleAddMapping('transformations')}><span className='fa fa-plus'></span></Button>
                </Col>
              </Row>
              <Row>
                <Col>
                  {this.state.transformations.map((el, index) => (
                  <Transformation key={index} value={el} sources={this.state.sources} index={index}
                           move={(dir) => this.move('transformations', dir, index)}
                           onChange={(event, attr, path, props, type) => this.handleTermMapChange('transformations', event, index, path, attr, props, type)}/>))}
                </Col>
              </Row>
            </Container>
            </Tab>

            <Tab eventKey="mappings" title="Mappings">
              <Container>
                {(!this.props.fixedSubject || this.state.mappings.length < 1) &&
                <Row className="header">
                  <Col>
                  </Col>
                  <Col className="mybutton" md="auto">
                    <Button type="button" className="menubutton"  aria-label="Add"  onClick={() => this.handleAddMapping('mappings')}><span className='fa fa-plus'></span></Button>
                  </Col>
                </Row>}
                <Row>
                  <Col>
                    {this.state.mappings.map((el, index) => (
                    <TriplesMap key={index} value={el} sources={this.state.sources} graphMap={false} index={index}
                             fixedSubject={this.props.fixedSubject} move={(dir) => this.move('mappings', dir, index)}
                             onChange={(event, attr, path, props, type) => this.handleTermMapChange('mappings', event, index, path, attr, props, type)}/>))}
                  </Col>
                </Row>
              </Container>
            </Tab>

    {/*        <Tab eventKey="output" title="Output">
              <Container>
                {this.state.lastExecution !== null && this.state.lastExecution.text !== undefined &&
                <Row>
                  <Col>
                    <code>
                      <pre>{this.state.lastExecution.text}</pre>
                    </code>
                  </Col>
                </Row>}
                {this.state.lastExecution !== null && this.state.lastExecution.message !== undefined &&
                <Row>
                  <Col className="grouping error">
                      {this.state.lastExecution.message}
                  </Col>
                </Row>}
              </Container>
            </Tab> */}
          </Tabs>
        </Col>
      </Row>}
      {this.state.showCode &&
        <Row>
        <code className="fullwidth"><pre>{this.state.d2rmlCode}</pre></code>
        </Row>
      }
{/*      {this.state.showCode &&
          <Row>
            <YateEditor  turtleText={this.state.fileContents}/>
          </Row>} */}
      </div>
    );
  }
}



export default D2RMLEditor;
