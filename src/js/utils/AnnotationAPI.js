import { API_BASE_URL, ACCESS_TOKEN } from '../constants/index.js';
import { request, jjrequest, sRequest, jsonSuccessFailureRequest } from './APIUtils.js';

export function addDeleteAnnotationEdit(datasetUri, propertyUri, propertyValue, annotationValue) {
  if (!localStorage.getItem(ACCESS_TOKEN)) {
    return Promise.reject("No access token set.");
  }

  return request({
    url: API_BASE_URL + "/annotation/addDeleteEdit?datasetUri=" + encodeURIComponent(datasetUri)
      + "&propertyUri=" + encodeURIComponent(propertyUri)
      + "&propertyValue=" + encodeURIComponent(propertyValue)
      + "&annotationValue=" + encodeURIComponent(annotationValue),
    method: 'POST',
  })
}

export function commitAnnotationEdits(id, edits) {
  if (!localStorage.getItem(ACCESS_TOKEN)) {
    return Promise.reject("No access token set.");
  }

  return jjrequest({
    url: API_BASE_URL + "/annotation/commitAnnotationEdits/" + id,
    body: JSON.stringify(edits),
    method: 'POST',
  })
}
