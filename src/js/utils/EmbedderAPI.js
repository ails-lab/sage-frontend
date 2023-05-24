import { API_BASE_URL, ACCESS_TOKEN } from '../constants/index.js';
import { request, textrequest, textRequest, sRequest, jsonSuccessFailureRequest } from './APIUtils.js';

export function createEmbedder(datasetUri, embedder, variant, indexStructure, onClass, keys) {
  if (!localStorage.getItem(ACCESS_TOKEN)) {
    return Promise.reject("No access token set.");
  }

  var object = { datasetUri: datasetUri, embedder: embedder, variant: variant, indexElement: indexStructure, onClass: onClass, keys: keys };

  return request({
    url: API_BASE_URL + "/embedder/create",
    body: JSON.stringify(object),
    method: 'POST',
  })
}

export function deleteEmbedder(id) {
  if (!localStorage.getItem(ACCESS_TOKEN)) {
    return Promise.reject("No access token set.");
  }

  return textrequest({
    url: API_BASE_URL + "/embedder/delete/" + id,
    method: 'DELETE'
  });

}

export function previewLastEmbedderExecution(id) {
  if (!localStorage.getItem(ACCESS_TOKEN)) {
    return Promise.reject("No access token set.");
  }

  return textRequest({
    url: API_BASE_URL + "/embedder/preview-last-execution/" + id,
    method: 'GET'
  });

}



export function previewPublishedEmbedderExecution(id) {
  if (!localStorage.getItem(ACCESS_TOKEN)) {
    return Promise.reject("No access token set.");
  }

  return textRequest({
    url: API_BASE_URL + "/embedder/preview-published-execution/" + id,
    method: 'GET'
  });

}


export function clearEmbedderExecution(id) {
  if (!localStorage.getItem(ACCESS_TOKEN)) {
    return Promise.reject("No access token set.");
  }

  return textrequest({
    url: API_BASE_URL + "/embedder/clear-execution/" + id,
    method: 'POST'
  })
}

export function downloadLastEmbedderExecution(id) {
  if (!localStorage.getItem(ACCESS_TOKEN)) {
    return Promise.reject("No access token set.");
  }

  return sRequest({
    url: API_BASE_URL + "/embedder/download-last-execution/" + id,
    method: 'GET'
  });

}

export function downloadPublishedEmbedderExecution(id) {
  if (!localStorage.getItem(ACCESS_TOKEN)) {
    return Promise.reject("No access token set.");
  }

  return sRequest({
    url: API_BASE_URL + "/embedder/download-published-execution/" + id,
    method: 'GET'
  });

}

export function getEmbeddersByUser(datasetUri) {
  if (!localStorage.getItem(ACCESS_TOKEN)) {
    return Promise.reject("No access token set.");
  }

  return request({
    url: API_BASE_URL + "/embedder/get-all-by-user?datasetUri=" + encodeURIComponent(datasetUri),
    method: 'GET',
  })
}

export function executeEmbedder(id) {
  if (!localStorage.getItem(ACCESS_TOKEN)) {
    return Promise.reject("No access token set.");
  }

  return jsonSuccessFailureRequest({
    url: API_BASE_URL + "/embedder/execute/" + id,
    method: 'POST',
  })
}

export function stopEmbedder(id) {
  if (!localStorage.getItem(ACCESS_TOKEN)) {
    return Promise.reject("No access token set.");
  }

  return jsonSuccessFailureRequest({
    url: API_BASE_URL + "/embedder/stop-execution/" + id,
    method: 'POST',
  })
}

export function publishEmbedder(id) {
  if (!localStorage.getItem(ACCESS_TOKEN)) {
    return Promise.reject("No access token set.");
  }

  return jsonSuccessFailureRequest({
    url: API_BASE_URL + "/embedder/publish/" + id,
    method: 'POST',
  })
}

export function unpublishEmbedder(id) {
  if (!localStorage.getItem(ACCESS_TOKEN)) {
    return Promise.reject("No access token set.");
  }

  return jsonSuccessFailureRequest({
    url: API_BASE_URL + "/embedder/unpublish/" + id,
    method: 'POST',
  })
}
