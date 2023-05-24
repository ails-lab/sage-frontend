import { API_BASE_URL, ACCESS_TOKEN } from '../constants/index.js';
import { request, textrequest, sjRequest, jjrequest, textRequest, jsonSuccessFailureRequest } from './APIUtils.js';

export function viewValuesAnnotations(id, page, mode, annotators) {
  if (!localStorage.getItem(ACCESS_TOKEN)) {
    return Promise.reject("No access token set.");
  }

  var annotatorUuids = annotators.join(",")

  return request({
    url: API_BASE_URL + "/annotation-edit-group/view/" + id
      + "?page=" + page
      + "&mode=" + mode
      + "&annotators=" + annotatorUuids,
    method: 'GET',
  })
}

export function setAnnotationEditGroupAutoexportable(id, autoexportable) {
  return request({
    url: API_BASE_URL + "/annotation-edit-group/update/" + id
    + "?autoexportable=" + autoexportable,
    method: 'POST',
  });
}

export function scoreValidationDistribution(id, accuracy) {
  if (!localStorage.getItem(ACCESS_TOKEN)) {
    return Promise.reject("No access token set.");
  }

  return request({
    url: API_BASE_URL + "/annotation-edit-group/score-validation-distibution/" + id + "?accuracy=" + accuracy,
    method: 'GET'
  })
}

export function downloadAnnotationValues(id, serialization, onlyReviewed, onlyNonRejected, onlyFresh, created, creator, score, scope, selector, archive) {
  if (!localStorage.getItem(ACCESS_TOKEN)) {
    return Promise.reject("No access token set.");
  }

  return sjRequest({
    url: API_BASE_URL + "/annotation-edit-group/export-annotations-validations/" + id +
        "?serialization=" + serialization +
        "&onlyReviewed=" + onlyReviewed +
        "&onlyNonRejected=" + onlyNonRejected +
        "&onlyFresh=" + onlyFresh +
        "&created=" + created +
        "&creator=" + creator +
        "&score=" + score +
        "&scope=" + scope +
        "&selector=" + selector +
        // "&defaultScope=" + defaultScope +
        "&archive=" + archive,
    method: 'GET',
  })
}


export function getAnnotationEditGroupsByUser(datasetUri) {
  if (!localStorage.getItem(ACCESS_TOKEN)) {
    return Promise.reject("No access token set.");
  }

  return request({
    url: API_BASE_URL + "/annotation-edit-group/get-all-by-user?datasetUri=" + encodeURIComponent(datasetUri),
    method: 'GET',
  })
}

export function getAnnotationEditGroups(datasetUri) {
  if (!localStorage.getItem(ACCESS_TOKEN)) {
    return Promise.reject("No access token set.");
  }

  return request({
    url: API_BASE_URL + "/annotation-edit-group/get-all?datasetUri=" + encodeURIComponent(datasetUri),
    method: 'GET',
  })
}



export function unpublishAnnotationEdits(id) {
  if (!localStorage.getItem(ACCESS_TOKEN)) {
    return Promise.reject("No access token set.");
  }

  return jjrequest({
    url: API_BASE_URL + "/annotation-edit-group/unpublish/" + id,
    method: 'POST',
  })
}

export function viewAnnotationEditsExecution(id) {
  if (!localStorage.getItem(ACCESS_TOKEN)) {
    return Promise.reject("No access token set.");
  }

  return textRequest({
    url: API_BASE_URL + "/annotation-edit-group/lastExecution/" + id,
    method: 'GET'
  });

}
