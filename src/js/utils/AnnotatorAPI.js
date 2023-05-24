import { API_BASE_URL, ACCESS_TOKEN } from '../constants/index.js';
import { request, textrequest, textRequest, sRequest, jsonSuccessFailureRequest } from './APIUtils.js';

export function getPreprocessFunctions() {
  if (!localStorage.getItem(ACCESS_TOKEN)) {
    return Promise.reject("No access token set.");
  }

  return request({
    url: API_BASE_URL + "/annotator/functions",
    method: 'GET',
  })
}

export function createAnnotator(datasetUri, onProperty, asProperty, annotator, thesaurus, parameters, preprocess, variant, defaultTarget) {
  if (!localStorage.getItem(ACCESS_TOKEN)) {
    return Promise.reject("No access token set.");
  }

  var object = { datasetUri: datasetUri, onPath: onProperty, asProperty: asProperty, annotator: annotator, variant: variant };

  Object.assign(object, thesaurus && { thesaurus: thesaurus },
    defaultTarget && { defaultTarget },
    parameters && { parameters: parameters },
    preprocess && { preprocess: preprocess });

  return request({
    url: API_BASE_URL + "/annotator/create",
    body: JSON.stringify(object),
    method: 'POST',
  })
}

export function getAnnotator(id) {
  if (!localStorage.getItem(ACCESS_TOKEN)) {
    return Promise.reject("No access token set.");
  }

  return request({
    url: API_BASE_URL + "/annotator/get/" + id,
    method: 'GET'
  })
}

export function updateAnnotator(id, asProperty, annotator, thesaurus, parameters, preprocess, variant, defaultTarget) {
  if (!localStorage.getItem(ACCESS_TOKEN)) {
    return Promise.reject("No access token set.");
  }

  var object = { asProperty: asProperty, annotator: annotator, variant: variant }

  Object.assign(object, thesaurus && { thesaurus: thesaurus },
    defaultTarget && { defaultTarget },
    parameters && { parameters: parameters },
    preprocess && { preprocess: preprocess })

  return request({
    url: API_BASE_URL + "/annotator/update/" + id,
    body: JSON.stringify(object),
    method: 'PUT'
  })
}

export function previewLastAnnotatorExecution(id) {
  if (!localStorage.getItem(ACCESS_TOKEN)) {
    return Promise.reject("No access token set.");
  }

  return textRequest({
    url: API_BASE_URL + "/annotator/preview-last-execution/" + id,
    method: 'GET'
  });
}

export function previewPublishedAnnotatorExecution(id) {
  if (!localStorage.getItem(ACCESS_TOKEN)) {
    return Promise.reject("No access token set.");
  }

  return textRequest({
    url: API_BASE_URL + "/annotator/preview-published-execution/" + id,
    method: 'GET'
  });
}

export function deleteAnnotator(id) {
  if (!localStorage.getItem(ACCESS_TOKEN)) {
    return Promise.reject("No access token set.");
  }

  return jsonSuccessFailureRequest({
    url: API_BASE_URL + "/annotator/delete/" + id,
    method: 'DELETE'
  });
}

export function clearAnnotatorExecution(id) {
  if (!localStorage.getItem(ACCESS_TOKEN)) {
    return Promise.reject("No access token set.");
  }

  return jsonSuccessFailureRequest({
    url: API_BASE_URL + "/annotator/clear-execution/" + id,
    method: 'POST'
  })
}

export function downloadLastAnnotatorExecution(id) {
  if (!localStorage.getItem(ACCESS_TOKEN)) {
    return Promise.reject("No access token set.");
  }

  return sRequest({
    url: API_BASE_URL + "/annotator/download-last-execution/" + id,
    method: 'GET'
  });

}

export function downloadPublishedAnnotatorExecution(id) {
  if (!localStorage.getItem(ACCESS_TOKEN)) {
    return Promise.reject("No access token set.");
  }

  return sRequest({
    url: API_BASE_URL + "/annotator/download-published-execution/" + id,
    method: 'GET'
  });

}

export function getAnnotators(datasetUri) {
  if (!localStorage.getItem(ACCESS_TOKEN)) {
    return Promise.reject("No access token set.");
  }

  return request({
    url: API_BASE_URL + "/annotator/get-all?datasetUri=" + encodeURIComponent(datasetUri),
    method: 'GET',
  })
}

export function getAnnotatorsByUser(datasetUri) {
  if (!localStorage.getItem(ACCESS_TOKEN)) {
    return Promise.reject("No access token set.");
  }

  return request({
    url: API_BASE_URL + "/annotator/get-all-by-user?datasetUri=" + encodeURIComponent(datasetUri),
    method: 'GET',
  })
}

export function previewAnnotator(id, page) {
  if (!localStorage.getItem(ACCESS_TOKEN)) {
    return Promise.reject("No access token set.");
  }

  return request({
    url: API_BASE_URL + "/annotator/preview/" + id
      + "?page=" + page,
    method: 'GET',
  })
}

export function prepareAnnotator(id) {
  if (!localStorage.getItem(ACCESS_TOKEN)) {
    return Promise.reject("No access token set.");
  }

  return jsonSuccessFailureRequest({
    url: API_BASE_URL + "/annotator/prepare/" + id,
    method: 'POST',
  })
}

export function executeAnnotator(id) {
  if (!localStorage.getItem(ACCESS_TOKEN)) {
    return Promise.reject("No access token set.");
  }

  return jsonSuccessFailureRequest({
    url: API_BASE_URL + "/annotator/execute/" + id,
    method: 'POST',
  })
}

export function stopAnnotator(id) {
  if (!localStorage.getItem(ACCESS_TOKEN)) {
    return Promise.reject("No access token set.");
  }

  return jsonSuccessFailureRequest({
    url: API_BASE_URL + "/annotator/stop-execution/" + id,
    method: 'POST',
  })
}

export function publishAnnotator(id) {
  if (!localStorage.getItem(ACCESS_TOKEN)) {
    return Promise.reject("No access token set.");
  }

  return jsonSuccessFailureRequest({
    url: API_BASE_URL + "/annotator/publish/" + id,
    method: 'POST',
  })
}

export function unpublishAnnotator(id) {
  if (!localStorage.getItem(ACCESS_TOKEN)) {
    return Promise.reject("No access token set.");
  }

  return jsonSuccessFailureRequest({
    url: API_BASE_URL + "/annotator/unpublish/" + id,
    method: 'POST',
  })
}
