import { API_BASE_URL, ACCESS_TOKEN } from '../constants/index.js';
import { request, jsonSuccessFailureRequest } from '../utils/APIUtils.js';

export function datasetAnnotationsStatistics(datasetUri) {
    if(!localStorage.getItem(ACCESS_TOKEN)) {
        return Promise.reject("No access token set.");
    }

    return jsonSuccessFailureRequest({
      url:  API_BASE_URL + "/f/datasets/annotations-statistics?datasetUri=" + encodeURIComponent(datasetUri),
      method: 'GET',
    })
}

export function igetDatasets(typeUri, root) {
  // if(!localStorage.getItem(ACCESS_TOKEN)) {
     // return Promise.reject("No access token set.");
     // return request({
     //   url:  API_BASE_URL + "/f/datasets/getAllPublic?typeUri=" + typeUri.split(",").map(el => encodeURIComponent(el)).join(',') +  (root ? "&root=" + encodeURIComponent(root) :""),
     //   method: 'GET',
     // })
  // } else {
    return request({
      url:  API_BASE_URL + "/f/datasets/getAll?typeUri=" + typeUri.split(",").map(el => encodeURIComponent(el)).join(',') +  (root ? "&root=" + encodeURIComponent(root) :""),
      method: 'GET',
    })
  // }
}

export function getEditorDatasets(typeUris) {
  if(!localStorage.getItem(ACCESS_TOKEN)) {
      return Promise.reject("No access token set.");
  }


  return request({
    url:  API_BASE_URL + "/f/datasets/getEditorDatasets?typeUri=" + typeUris.map(el => encodeURIComponent(el)).join(','),
    method: 'GET',
  })
}

export function getValidatorDatasets() {
  if(!localStorage.getItem(ACCESS_TOKEN)) {
      return Promise.reject("No access token set.");
  }

  return request({
    url:  API_BASE_URL + "/f/datasets/getValidatorDatasets",
    method: 'GET',
  })
}

export function getAccessedDatasets(id) {
  if(!localStorage.getItem(ACCESS_TOKEN)) {
    return Promise.reject("No access token set.");
  }
  return request({
    url:  API_BASE_URL + "/f/datasets/getAccessedDatasets?userId=" + id,
    method: 'GET',
  })
}

export function getAssignedDatasets(campaignId, userId) {
  if(!localStorage.getItem(ACCESS_TOKEN)) {
    return Promise.reject("No access token set.");
  }
  return request({
    url:  API_BASE_URL + "/f/datasets/get-assigned-datasets?campaignId=" + campaignId + (userId ? "&userId=" + userId : ""),
    method: 'GET',
  })
}

export function igetCollections(type) {
    return request({
      url:  API_BASE_URL + "/f/datasets/collections?type=" + type,
      method: 'GET',
    })
}

export function isPublicDataset(dataset) {
  if (dataset['http://purl.org/dc/elements/1.1/isPartOf'] && dataset['http://purl.org/dc/elements/1.1/isPartOf'][0]['@id'] === "http://sw.islab.ntua.gr/semaspace/access/PublicGroup") {
    return true;
  } else {
    return false;
  }
}

export function searchCollections(collections, time, endTime, place, terms) {
  var params = {};
  if (collections.length > 0) {
    params = {...params, collections }
  }

  if (time) {
    params = {...params, time }
  }

  if (endTime) {
    params = {...params, endTime }
  }

  if (place) {
    params = {...params, place }
  }

  if (terms) {
    params = {...params, terms }
  }

  return request({
    url:  API_BASE_URL + "/f/datasets/search",
    method: 'POST',
    body: JSON.stringify( params )
  })
}
