export function rdf(s) {
  return 'http://www.w3.org/1999/02/22-rdf-syntax-ns#' + s;
}

export function r2rml(s) {
  return 'http://www.w3.org/ns/r2rml#' + s;
}

export function d2rml(s) {
  return 'http://islab.ntua.gr/ns/d2rml#' + s;
}

export function d2rmlis(s) {
  return 'http://islab.ntua.gr/ns/d2rml-is#' + s;
}

export function d2rmlop(s) {
  return 'http://islab.ntua.gr/ns/d2rml-op#' + s;
}

export function http(s) {
  return 'http://www.w3.org/2011/http#' + s;
}

export function isDefinedColumn(s) {
  return s === 'defined-column'
}

export function isSubjectMap(s) {
  return s === 'subject-map'
}

export function isPredicateMap(s) {
  return s === 'predicate-map'
}

export function isObjectMap(s) {
  return s === 'object-map'
}

export function isGraphMap(s) {
  return s === 'graph-map'
}

export function isLanguageMap(s) {
  return s === 'language-map'
}

export function getD2RMLFunctions() {
  return [ { value: d2rmlop('extractMatch'), label:"Regular Expression Match", args: [ { label: "input" },
                                                                                       { label: "regex" } ] },
           { value: d2rmlop('split'), label:"Split At", args: [ { label:"input" },
                                                                { label: "separator" } ] },
           { value: d2rmlop('uuid'), label:"Generate UUID", args: []  },
           { value: d2rmlop('replace'), label:"Search & Replace", args: [ { label: "input" },
                                                                          { label: "regex" },
                                                                          { label: "replacement" } ] } ]
}

export function getTermMapValue(tm) {
  if (tm.hasOwnProperty(r2rml('constant'))) {
    if (tm[r2rml('constant')]['@id'] === undefined) {
      return tm[r2rml('constant')];
    } else {
      return tm[r2rml('constant')]['@id'];
    }
  } else if (tm.hasOwnProperty(r2rml('column'))) {
      return tm[r2rml('column')];
  } else if (tm.hasOwnProperty(r2rml('template'))) {
      return tm[r2rml('template')];
  } else {
    return null;
  }
}

export function lookupSource(sources, id) {
  // console.log('X');
  // console.log(sources);
  // console.log(id);
  if (id !== null) {
    return sources.filter(el => el['@id'] === id)[0];
  } else {
    return null;
  }
}

export function convert(jsonld, resourcePrefix) {

  // const uuidv1 = require('uuid/v1')

  var graph = jsonld['@graph'];
  // console.log('GRAPH');
  // console.log(JSON.stringify(graph));
  var context = jsonld['@context'];

  var nodes = new Map();

  var igraph = [];

  for (var g in graph) {
    var cgraph = graph[g];
    var id = cgraph['@id'];

    if (id) {
      const p = Math.max(id.lastIndexOf("/"), id.lastIndexOf("#"));
      // const newid = resourcePrefix + 'mapping/' + uuidv1() + '/' + id.substring(p + 1);
      const newid = resourcePrefix + 'mapping/__X_SAGE_MAPPING_UUID__/' + id.substring(p + 1); // should find a better way to get the uuid ...

      nodes.set(id, newid);

      igraph.push({...cgraph, '@id': newid});
    } else {
      igraph.push(cgraph);
    }
  }

  // console.log('CONTEXT');
  // console.log(JSON.stringify(context));

  // console.log(nodes);
  // console.log(context);

  var newgraph = [];

  for (var g in igraph) {
    newgraph.push(convertIter(igraph[g], context, nodes));
  }

  for (let [key, value] of Object.entries(context)) {
    if (!(typeof value === 'string' || typeof value === 'number')) {
      delete context[key];
    } else if (value === r2rml('') || value === d2rml('') || value === d2rmlis('') || value === d2rmlop('') || value === http('')) {
      delete context[key];
    }
  }

  // console.log('NEW CONTEXT');
  // console.log(newgraph);
  // console.log(context);
  //return { '@graph': newgraph, '@context': context }

  var namedGraphs = jsonld['@namedGraphs'];

  var result = { '@graph': newgraph, '@context': context };

  if (namedGraphs !== undefined) {
    result = { ...result, '@namedGraphs': namedGraphs}
  }

  return result;
}

function convertIter(jsonld, context, nodes) {
  var newJson = {};
  for (var key in jsonld) {

    var ckey = context[key];
    var value = jsonld[key];

    var newValue;

    if (value['@list']) {
      var tmp = convertIter( { [key] : value['@list']}, context, nodes);
      newValue = { '@list' : tmp[Object.keys(tmp)[0]] };
    } else if (Array.isArray(value)) {
      newValue = [];
      for (const i in value) {
        // console.log("ITER");
        // console.log(key);
        // console.log(ckey);
        // console.log(value[i]);

        if (typeof value[i] === 'string' || typeof value[i] === 'boolean' || typeof value[i] === 'number') {
            if (ckey && (typeof ckey !== 'string' || typeof ckey !== 'boolean' || typeof ckey !== 'number') && ckey['@type'] !== undefined && ckey['@id']) {
              // console.log(ckey);
              // console.log(ckey['@type']);

              var nv = nodes.get(value[i]);
              if (!nv) {
                nv = value[i];
              }
              newValue.push({ '@id': nv });
            } else {
              newValue.push(value[i]);
            }

        } else {
          newValue.push(convertIter(value[i], context, nodes));
        }
      }
    } else if (typeof value === 'string' || typeof value === 'boolean' || typeof value === 'number') {
      newValue = value;

      if (ckey && typeof (ckey !== 'string' || ckey !== 'boolean' || ckey !== 'number') && ckey['@type'] !== undefined && ckey['@id']) {
          var nv = nodes.get(newValue);
          if (!nv) {
            nv = newValue;
          }
          newValue = convertIter({ '@id': nv }, context, nodes);
      }

    } else {
      newValue = convertIter(value, context, nodes);
    }

    if ((key === '@type' || key === '@id') && (typeof newValue === 'string' || typeof newValue === 'boolean' || typeof newValue === 'number')) {
      if (key === '@id') {
        var nv = nodes.get(newValue);
        if (nv) {
          newValue = nv;
        }
      }

      const p = newValue.indexOf(':');
      if (p !== -1) {
        const prefix = newValue.substring(0,p);
        const pp = context[prefix];

        if (pp !== undefined) {
          if (pp === d2rml('') || pp === r2rml('') || pp === d2rmlop('') || pp === d2rmlis('') || (pp === http('') && newValue.substring(p+1,p+2) !== '/')) {
            newValue = pp + newValue.substring(p + 1);
          }
        }
      }
    }

    if (ckey !== undefined) {
      if (typeof ckey === 'string' || typeof ckey === 'boolean' || typeof ckey === 'number') {
        key = ckey;
      } else {
        key = ckey['@id'];
      }
    }

//// IS THIS CORRECT ?
    if (ckey === undefined) {
      const p = key.indexOf(':');
      if (p !== -1) {
        const prefix = key.substring(0,p);
        const pp = context[prefix];

        if (pp !== undefined) {
          if (pp === d2rml('') || pp === r2rml('') || pp === d2rmlop('') || pp === d2rmlis('') || (pp === http('') && key.substring(p+1,p+2) !== '/')) {
            key = pp + key.substring(p + 1);
          }
        }
      }
    }
/////

    if (key === r2rml('subject')) {
      key = r2rml('subjectMap')
      newValue  = { [r2rml('constant')]: newValue } ;

    } else if (key === r2rml('predicate')) {
      key = r2rml('predicateMap')
      if (Array.isArray(newValue)) {
        var na = []
        for (const i in newValue) {
          na.push({ [r2rml('constant')]: newValue[i] });
        }
        newValue = na;
      } else {
        newValue  = { [r2rml('constant')]: newValue } ;
      }
    } else if (key === r2rml('object')) {
      key = r2rml('objectMap')
      if (Array.isArray(newValue)) {
        var na = []
        for (const i in newValue) {
          na.push({ [r2rml('constant')]: newValue[i] });
        }
        newValue = na;
      } else {
        newValue  = { [r2rml('constant')]: newValue } ;
      }
    } else if (key === d2rml('language')) {
      key = d2rml('languageMap')
      if (Array.isArray(newValue)) {
        var na = []
        for (const i in newValue) {
          na.push({ [r2rml('constant')]: newValue[i] });
        }
        newValue = na;
      } else {
        newValue  = { [r2rml('constant')]: newValue } ;
      }
    } else if (key === r2rml('graph')) {
      key = r2rml('graphMap')
      if (Array.isArray(newValue)) {
        var na = []
        for (const i in newValue) {
          na.push({ [r2rml('constant')]: newValue[i] });
        }
        newValue = na;
      } else {
        newValue  = { [r2rml('constant')]: newValue } ;
      }
    // } else if (key === d2rmlis('uri')) {
    //   key = d2rmlis('request')
    //   if (Array.isArray(newValue)) {
    //     var na = []
    //     for (const i in newValue) {
    //       na.push({ [http('methodName')]: 'GET', [http('absoluteURI')]: newValue[i] });
    //     }
    //     newValue = na;
    //   } else {
    //     newValue  = { [http('methodName')]: 'GET', [http('absoluteURI')]: newValue } ;
    //   }
    } else if (key === d2rmlis('parameters')) {
      if (newValue.hasOwnProperty('@list')) {
        newValue = newValue['@list'];
      }
    }

    value = newValue;

    if (key === r2rml('predicateMap') ||
        key === r2rml('objectMap') ||
        key === r2rml('graphMap') ||
        key === r2rml('predicateObjectMap') ||
        key === d2rml('languageMap') ||
        key === r2rml('class') ||
        key === d2rml('source') ||
        key === d2rml('parameterBinding') ||
        key === d2rmlis('path') ||
        key === http('request')) {
      if (!Array.isArray(value)) {
        value = [ value ];
      }
    }

    if (key === d2rmlis('parameters')) {
      key = d2rmlis('parameter')
    }

    newJson = {...newJson, [key]: value};
  }

  return newJson;
}

export function adjustSchemaMapping(json, uuid, resourcePrefix) {
  // console.log("HEADER");
  var newGraph = [];
  for (const i in json['@graph']) {
    var element = json['@graph'][i];

//    if (element.hasOwnProperty(r2rml('graphMap'))) {
//      delete element[r2rml('graphMap')];
//    }
//    if (element.hasOwnProperty(r2rml('subjectMap'))) {
//      element = { ...element, [r2rml('subjectMap')]: { [r2rml('constant')]: { '@id': resourcePrefix + uuid } } }
//    }
    if (element.hasOwnProperty(d2rml('triplesMap'))) {
       var triplesMap = element[d2rml('triplesMap')];

       var newTriplesMap = { };
       for (const k in triplesMap) {
          var telement = triplesMap[k];

         if (k === r2rml('graphMap')) {

         } else if (k === r2rml('subjectMap')) {
             telement =  { [r2rml('constant')]: { '@id': resourcePrefix + 'dataset/' + uuid } } ;
           newTriplesMap = {...newTriplesMap, [k] : telement}
         } else {
           newTriplesMap = {...newTriplesMap, [k] : telement}
         }
       }

       element = {...element, [d2rml('triplesMap')] : newTriplesMap}
    }

    newGraph.push(element);
  }

  // console.log({ '@context': json['@context'], '@graph': newGraph });
  return { '@context': json['@context'], '@graph': newGraph };
}

export function adjustContentMapping(json, graph) {
  for (const i in json['@graph']) {
    var element = json['@graph'][i];
    // if (element.hasOwnProperty(r2rml('graphMap'))) {
    //   delete element[r2rml('graphMap')];
    // }

    if (element.hasOwnProperty(d2rml('triplesMap'))) {
       var triplesMap = element[d2rml('triplesMap')];

       if (triplesMap.hasOwnProperty(r2rml('graphMap'))) {
         delete triplesMap[r2rml('graphMap')];
      }
    }
  }

  // console.log(json);
  return json;

}

export function createD2RMLDocument(prefixes, sources, transformations, mappings) {
  var context = {};
  prefixes.forEach(el => context = { ...context, [el.prefix]: el.url });

  var json = { '@context': context,
               '@graph' : [].concat(sources)
                            .concat(transformations)
                            .concat(mappings) };

  // console.log('CREATE');
  // console.log(json);
  // console.log(JSON.stringify(json));
  return json;
}

export function prepareJSONLDXtoState(json) {
  var prefixes = [];
  var sources = [];
  var transformations = [];
  var mappings = [];

  var graph = json['@graph'];

  for (const i in graph) {
    // if (graph[i].hasOwnProperty(d2rml('parameterBinding'))) {
    //     transformations.push(graph[i]);
    // } else if (graph[i].hasOwnProperty(r2rml('predicateObjectMap')) ||
    //     graph[i].hasOwnProperty(r2rml('subjectMap')) || graph[i].hasOwnProperty(r2rml('subject')) ||
    //     graph[i].hasOwnProperty(r2rml('graphMap')) || graph[i].hasOwnProperty(r2rml('graph')) ||
    //     graph[i].hasOwnProperty(r2rml('logicalTable')) || graph[i].hasOwnProperty(d2rml('logicalSource'))) {
    //   mappings.push(graph[i]);
    // } else {
    //   sources.push(graph[i]);
    // }
    if (graph[i].hasOwnProperty(d2rml('parameterBinding')) || graph[i].hasOwnProperty(d2rml('parameterBindings'))) {
        transformations.push(graph[i]);
    } else if (graph[i].hasOwnProperty(r2rml('predicateObjectMap')) ||
        graph[i].hasOwnProperty(r2rml('subjectMap')) || graph[i].hasOwnProperty(r2rml('subject')) ||
        graph[i].hasOwnProperty(r2rml('graphMap')) || graph[i].hasOwnProperty(r2rml('graph')) ||
        graph[i].hasOwnProperty(d2rml('logicalGraph'))) {
      mappings.push(graph[i]);
    } else if (graph[i].hasOwnProperty(r2rml('logicalTable')) || graph[i].hasOwnProperty(d2rml('logicalSource'))) {
      transformations.push(graph[i]);
    } else {
      sources.push(graph[i]);
    }
  }

  var context = json['@context'];

  Object.keys(context).forEach(key =>
    prefixes.push({ prefix: key, url:context[key] })
  )

  return {prefixes, sources, transformations, mappings};
}

// export function d2rmlPreprocess(json, type, uuid, resourcePrefix) {
//   json = convert(json, resourcePrefix);
//
//   if (type === 'HEADER') {
//     json = adjustSchemaMapping(json, uuid, resourcePrefix);
//   } else  if (type === 'CONTENT') {
//      json = adjustContentMapping(json, uuid);
//    }
//   // console.log(JSON.stringify(json));
//
//   var parameters = [];
//   var graph = json['@graph'];
//   for (var k in graph) {
//     // console.log(graph[k]);
//     if (graph[k]['@type'] && (graph[k]['@type'] === d2rml('D2RMLSpecification') || graph[k]['@type'] === d2rml('D2RMLDocument'))) {
//       var params = graph[k][d2rml('parameter')];
//       if (params) {
//         if (Array.isArray(params)) {
//           for (var p in params) {
//             parameters.push(params[p][d2rmlop('name')])
//           }
//         } else {
//           parameters.push(params[d2rmlop('name')])
//         }
//       }
//     }
//   }
//
//   return {json:JSON.stringify(json), parameters:parameters}
// }
