import { API_BASE_URL, ACCESS_TOKEN } from '../constants/index.js';
import { request, textrequest, textRequest, jsonSuccessFailureRequest } from './APIUtils.js';

export function checkDatasetIdentifier(identifier) {
  if (!localStorage.getItem(ACCESS_TOKEN)) {
    return Promise.reject("No access token set.");
  }

  return request({
    url: API_BASE_URL + "/dataset/exists-dataset?identifier=" + encodeURIComponent(identifier),
    method: 'GET'
  })
}

// export function createDataset(template, name, identifier, privat, tripleStore, scope, type, typeUri, asProperty, links) {
export function createDataset(template, name, identifier, privat, scope, type, typeUri, asProperty, links, sparqlEndpoint, namedGraph) {
  if (!localStorage.getItem(ACCESS_TOKEN)) {
    return Promise.reject("No access token set.");
  }

  var body = { name: name, scope:scope.toUpperCase(), type: type.toUpperCase(), public: (privat ? false : true) };

  if (identifier && identifier !== "") {
    body = {...body, identifier: identifier }
  }
  // if (tripleStore) {
  //   body = {...body, tripleStore: tripleStore }
  // }
  if (template) {
    body = {...body, template: template }
  }
  if (asProperty) {
    body = {...body, asProperty: asProperty }
  }
  if (links && links.length > 0) {
    body = {...body, links: links }
  }

  if (typeUri) {
    body = {...body, typeUri: [ typeUri ]  }
  }

  if (sparqlEndpoint) {
    var remoteTripleStore = { sparqlEndpoint }
    if (namedGraph) {
      remoteTripleStore = {...remoteTripleStore, namedGraph: namedGraph.splitAt(",").map(e => e.trim()) }
    }
    body = {...body, remoteTripleStore}
  }

  // return request({
    // url: API_BASE_URL + "/dataset/create?name=" + encodeURIComponent(name)
      // + (identifier ? "&identifier=" + encodeURIComponent(identifier) : "")
      // + "&type=" + type
      // + (typeUri ? "&typeUri=" + encodeURIComponent(typeUri) : "")
      // + (asProperty ? "&asProperty=" + encodeURIComponent(asProperty) : "")
      // + "&visibility=" + (privat ? "private" : "public")
      // + "&templateId=" + importType
      // + (tripleStore ? "&triple-store=" + tripleStore : ""),
    // method: 'POST',
    // body: JSON.stringify(links)
  // })

  return request({
    url: API_BASE_URL + '/dataset/create',
    method: 'POST',
    body: JSON.stringify(body)
  })
}


// export function updateDataset(id, name, identifier, privat, tripleStore, scope, type, typeUri, asProperty, links) {
 export function updateDataset(id, name, identifier, privat, scope, type, typeUri, asProperty, links, sparqlEndpoint, namedGraph) {
  if (!localStorage.getItem(ACCESS_TOKEN)) {
    return Promise.reject("No access token set.");
  }

  var body = { name: name, scope:scope.toUpperCase(), type: type.toUpperCase(), public: (privat ? false : true) };

  if (identifier && identifier !== "") {
    body = {...body, identifier: identifier }
  }
  // if (tripleStore) {
  //   body = {...body, tripleStore: tripleStore }
  // }
  // if (template) {
  //   body = {...body, template: template }
  // }
  if (asProperty) {
    body = {...body, asProperty: asProperty }
  }
  if (links && links.length > 0) {
    body = {...body, links: links }
  }

  if (typeUri) {
    body = {...body, typeUri: [ typeUri ]  }
  }

  if (sparqlEndpoint) {
    var remoteTripleStore = { sparqlEndpoint }
    if (namedGraph) {
      remoteTripleStore = {...remoteTripleStore, namedGraph: namedGraph.split(",").map(e => e.trim()) }
    }
    body = {...body, remoteTripleStore}
  }


  // return request({
  //   url: API_BASE_URL + "/dataset/update/" + id + "?name=" + encodeURIComponent(name)
  //     + (identifier ? "&identifier=" + encodeURIComponent(identifier) : "")
  //     + "&type=" + type
  //     + (typeUri ? "&typeUri=" + encodeURIComponent(typeUri) : "")
  //     + (asProperty ? "&asProperty=" + encodeURIComponent(asProperty) : "")
  //     + "&visibility=" + (privat ? "private" : "public")
  //     + (tripleStore ? "&triple-store=" + tripleStore : ""),
  //   method: 'POST',
  //   body: JSON.stringify(links)
  // })

  return request({
    url: API_BASE_URL + "/dataset/update/" + id,
    method: 'POST',
    body: JSON.stringify(body)
  })

}

export function deleteDataset(id) {
  if (!localStorage.getItem(ACCESS_TOKEN)) {
    return Promise.reject("No access token set.");
  }

  return request({
    url: API_BASE_URL + "/dataset/delete/" + id,
    method: 'DELETE',
  })
}

export function getDataset(id) {
  if (!localStorage.getItem(ACCESS_TOKEN)) {
    return Promise.reject("No access token set.");
  }

  return request({
    url: API_BASE_URL + "/dataset/get/" + id,
    method: 'GET',
  })
}

export function getDatasets(scope, type) {
  if (!localStorage.getItem(ACCESS_TOKEN)) {
    return Promise.reject("No access token set.");
  }

  if (scope) {
    return request({
      url: API_BASE_URL + "/dataset/get-all?scope=" + scope + "&type=" + type,
      method: 'GET',
    })
  } else {
    return request({
      url: API_BASE_URL + "/dataset/get-all?type=" + type,
      method: 'GET',
    })
  }
}

export function getDatasetDescription(id) {
  if (!localStorage.getItem(ACCESS_TOKEN)) {
    return Promise.reject("No access token set.");
  }

  return textRequest({
    url: API_BASE_URL + "/dataset/schema/" + id,
    method: 'GET'
  });

}

export function getDatasetSchemaClasses(id, embedders) {
  if (!localStorage.getItem(ACCESS_TOKEN)) {
    return Promise.reject("No access token set.");
  }

  return jsonSuccessFailureRequest({
    url: API_BASE_URL + "/dataset/schema-classes/" + id + (embedders ? "?embedders=true" : ""),
    method: 'GET'
  });

}

export function addDataset(id, toId) {
  if (!localStorage.getItem(ACCESS_TOKEN)) {
    return Promise.reject("No access token set.");
  }

  return request({
    url: API_BASE_URL + "/dataset/insert?id=" + id + "&toId=" + toId,
    method: 'POST',
  })
}

export function removeDataset(id, fromId) {
  if (!localStorage.getItem(ACCESS_TOKEN)) {
    return Promise.reject("No access token set.");
  }

  return request({
    url: API_BASE_URL + "/dataset/remove?id=" + id + "&fromId=" + fromId,
    method: 'POST',
  })
}

export function publishDataset(id, privat, tripleStore) {
  if (!localStorage.getItem(ACCESS_TOKEN)) {
    return Promise.reject("No access token set.");
  }

  return jsonSuccessFailureRequest({
    url: API_BASE_URL + "/dataset/publish/" + id + "?visibility=" + (privat ? "private" : "public") + (tripleStore ? "&triple-store=" + tripleStore : ""),
    method: 'POST',
  })
}

export function publishUnpublishedContent(id) {
  if (!localStorage.getItem(ACCESS_TOKEN)) {
    return Promise.reject("No access token set.");
  }

  return jsonSuccessFailureRequest({
    url: API_BASE_URL + "/dataset/publish-unpublished-content/" + id,
    method: 'POST',
  })
}

export function unpublishDataset(id) {
  if (!localStorage.getItem(ACCESS_TOKEN)) {
    return Promise.reject("No access token set.");
  }

  return jsonSuccessFailureRequest({
    url: API_BASE_URL + "/dataset/unpublish/" + id,
    method: 'POST',
  })
}

export function republishDataset(id) {
  if (!localStorage.getItem(ACCESS_TOKEN)) {
    return Promise.reject("No access token set.");
  }

  return jsonSuccessFailureRequest({
    url: API_BASE_URL + "/dataset/republish/" + id,
    method: 'POST',
  })
}

export function republishDatasetMetadata(id) {
  if (!localStorage.getItem(ACCESS_TOKEN)) {
    return Promise.reject("No access token set.");
  }

  return textrequest({
    url: API_BASE_URL + "/dataset/republish-metadata/" + id,
    method: 'POST',
  })
}

export function createDatasetDistribution(id, classes, ttl, nt, serializationVocabulary, compress, license) {
  if (!localStorage.getItem(ACCESS_TOKEN)) {
    return Promise.reject("No access token set.");
  }

  var serializations = [];
  if (ttl) {
    serializations.push('TTL');
  }

  if (nt) {
    serializations.push('NT');
  }


  var body = { classes, serializations, serializationVocabulary, compress, license }

  return jsonSuccessFailureRequest({
    url: API_BASE_URL + "/dataset/create-distribution/" + id,
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export function stopCreateDatasetDistribution(id) {
  if (!localStorage.getItem(ACCESS_TOKEN)) {
    return Promise.reject("No access token set.");
  }

  return jsonSuccessFailureRequest({
    url: API_BASE_URL + "/dataset/stop-create-distribution/" + id,
    method: 'POST'
  })
}

export function clearDatasetDistribution(id) {
  if (!localStorage.getItem(ACCESS_TOKEN)) {
    return Promise.reject("No access token set.");
  }

  return jsonSuccessFailureRequest({
    url: API_BASE_URL + "/dataset/clear-distribution/" + id,
    method: 'POST',
  })
}

export function executeAllMappings(id) {
  if (!localStorage.getItem(ACCESS_TOKEN)) {
    return Promise.reject("No access token set.");
  }

  return jsonSuccessFailureRequest({
    url: API_BASE_URL + "/dataset/execute-mappings/" + id,
    method: 'POST'
  })
}


export function executeAllMappingsAndRepublish(id) {
  if (!localStorage.getItem(ACCESS_TOKEN)) {
    return Promise.reject("No access token set.");
  }

  return jsonSuccessFailureRequest({
    url: API_BASE_URL + "/dataset/execute-mappings-and-republish/" + id,
    method: 'POST'
  })
}


export function flipDatasetVisibility(id) {
  if (!localStorage.getItem(ACCESS_TOKEN)) {
    return Promise.reject("No access token set.");
  }

  return textrequest({
    url: API_BASE_URL + "/dataset/flipVisibility/" + id,
    method: 'POST',
  })
}


export function stopIndexingDataset(id, indexStructureId) {
  if (!localStorage.getItem(ACCESS_TOKEN)) {
    return Promise.reject("No access token set.");
  }

  return jsonSuccessFailureRequest({
    url: API_BASE_URL + "/dataset/stop-indexing/" + id + "/" + indexStructureId,
    method: 'POST',
  })
}

export function unindexDataset(id, indexStructureId) {
  if (!localStorage.getItem(ACCESS_TOKEN)) {
    return Promise.reject("No access token set.");
  }

  return jsonSuccessFailureRequest({
    url: API_BASE_URL + "/dataset/unindex/" + id + "/" + indexStructureId,
    method: 'POST',
  })
}
