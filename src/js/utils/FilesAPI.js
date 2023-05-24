import { API_BASE_URL, ACCESS_TOKEN } from '../constants/index.js';
import { request, textrequest, textRequest, sRequest, jsonSuccessFailureRequest, formSuccessFailureRequest } from './APIUtils.js';

export function updateFile(id, name, data) {
  if (!localStorage.getItem(ACCESS_TOKEN)) {
    return Promise.reject("No access token set.");
  }

  var body = {}
  if (name && name != null) {
     body = { ...body, name: name }
   }

  var formData = new FormData();
  if (data) {
    formData.append('file', data);
  }

  formData.append('body', JSON.stringify(body));

  return formSuccessFailureRequest({
    url: API_BASE_URL + "/files/update/" + id,
    method: 'POST',
    body: formData,
  })
}

export function createFile(name, datasetId, data) {
  if (!localStorage.getItem(ACCESS_TOKEN)) {
    return Promise.reject("No access token set.");
  }

  var body = { name: name }

  var formData = new FormData();
  if (data != null) {
    formData.append('file', data);
  }

  formData.append('body', JSON.stringify(body));

  return formSuccessFailureRequest({
    url: API_BASE_URL + "/files/create?datasetId=" + datasetId,
    method: 'POST',
    body: formData,
  })
}


export function getFiles(datasetId) {
  if (!localStorage.getItem(ACCESS_TOKEN)) {
    return Promise.reject("No access token set.");
  }

  return request({
    url: API_BASE_URL + "/files/get-all?datasetId=" + datasetId,
    method: 'GET'
  })
}

export function deleteFile(id) {
  if (!localStorage.getItem(ACCESS_TOKEN)) {
    return Promise.reject("No access token set.");
  }

  return textrequest({
    url: API_BASE_URL + "/files/delete/" + id,
    method: 'DELETE'
  });

}

export function previewLastFile(id) {
  if (!localStorage.getItem(ACCESS_TOKEN)) {
    return Promise.reject("No access token set.");
  }

  return textRequest({
    url: API_BASE_URL + "/files/preview-last/" + id,
    method: 'GET'
  });

}

export function previewPublishedFile(id) {
  if (!localStorage.getItem(ACCESS_TOKEN)) {
    return Promise.reject("No access token set.");
  }

  return textRequest({
    url: API_BASE_URL + "/files/preview-published/" + id,
    method: 'GET'
  });

}

export function downloadLastFile(id) {
  if (!localStorage.getItem(ACCESS_TOKEN)) {
    return Promise.reject("No access token set.");
  }

  return sRequest({
    url: API_BASE_URL + "/files/download-last/" + id,
    method: 'GET'
  });
}

export function downloadPublishedFile(id) {
  if (!localStorage.getItem(ACCESS_TOKEN)) {
    return Promise.reject("No access token set.");
  }

  return sRequest({
    url: API_BASE_URL + "/files/download-published/" + id,
    method: 'GET'
  });
}
