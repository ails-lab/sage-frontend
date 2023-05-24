import { API_BASE_URL, ACCESS_TOKEN } from '../constants/index.js';
import { request, textrequest, jsonSuccessFailureRequest } from './APIUtils.js';

export function getTemplate(id){
  if (!localStorage.getItem(ACCESS_TOKEN)) {
    return Promise.reject("No access token set.");
  }

  return request({
    url: API_BASE_URL + '/template/get/' + id,
    method: 'GET'
  })
}

export function createTemplate(name, templateType, asProperty, annotator, thesaurus, parameters, preprocess, variant, defaultTarget) {
  if (!localStorage.getItem(ACCESS_TOKEN)) {
    return Promise.reject("No access token set.");
  }

  var object = { asProperty: asProperty, annotator: annotator, variant: variant }

  Object.assign(object, thesaurus && { thesaurus: thesaurus },
    defaultTarget && { defaultTarget },
    parameters && { parameters: parameters },
    preprocess && { preprocess: preprocess })

  return request({
    url: API_BASE_URL + '/template/create?name=' + name + '&type=' + templateType,
    body: JSON.stringify(object),
    method: 'POST',
  })
}

export function deleteTemplate(id) {
  if (!localStorage.getItem(ACCESS_TOKEN)) {
    return Promise.reject("No access token set.");
  }

  return textrequest({
    url: API_BASE_URL + "/template/delete/" + id,
    method: 'DELETE'
  });

}



export function createFilterTemplate(saveAsName, templateType, name, filters) {
  if (!localStorage.getItem(ACCESS_TOKEN)) {
    return Promise.reject("No access token set.");
  }

  return request({
    url: API_BASE_URL + `/template/create?name=${saveAsName}&type=${templateType}`,
    body: JSON.stringify({ name, filters }),
    method: 'POST'
  })
}

export function saveApiKey(saveAsName, templateType, value) {
  if (!localStorage.getItem(ACCESS_TOKEN)) {
    return Promise.reject("No access token set.");
  }

  return request({
    url: API_BASE_URL + `/template/create?name=${saveAsName}&type=${templateType}&templateString=${value}`,
    method: 'POST'
  })
}

export function getApiKeys() {
  if (!localStorage.getItem(ACCESS_TOKEN)) {
    return Promise.reject("No access token set.");
  }

  return request({
    url: API_BASE_URL + `/template/get?type=API_KEY`,
    method: 'GET'
  })
}





export function getAllTemplates(type) {
  if (!localStorage.getItem(ACCESS_TOKEN)) {
    return Promise.reject("No access token set.");
  }

  return request({
    url: API_BASE_URL + "/template/get?type=" + type,
    method: 'GET',
  })
}

export function getImportTemplates() {
  if (!localStorage.getItem(ACCESS_TOKEN)) {
    return Promise.reject("No access token set.");
  }

  return request({
    url: API_BASE_URL + "/template/get-import-templates",
    method: 'GET',
  })
}
