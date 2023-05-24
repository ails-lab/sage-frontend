import { API_BASE_URL, ACCESS_TOKEN } from '../constants/index.js';
import { request, textrequest, sjRequest, jsonSuccessFailureRequest } from './APIUtils.js';


// export function getDatasetSchema(uri) {
//   if (!localStorage.getItem(ACCESS_TOKEN)) {
//     return Promise.reject("No access token set.");
//   }
//   console.log("YEAHHH")
//   return request({
//     url: API_BASE_URL + "/data/schema/get?dataset=" + encodeURIComponent(uri),
//     method: 'GET',
//   })
// }

export function getDatasetSchema(uri, role) {
  if (!localStorage.getItem(ACCESS_TOKEN)) {
    return Promise.reject("No access token set.");
  }
  return request({
    url: API_BASE_URL + "/data/schema/get?dataset=" + encodeURIComponent(uri) +"&voc=void" + "&role=" + role,
    method: 'GET',
  })
}

export function getDatasetPropertyValues(datasetUri, path, mode) {
  if (!localStorage.getItem(ACCESS_TOKEN)) {
    return Promise.reject("No access token set.");
  }

  return request({
    url: API_BASE_URL + "/data/schema/get-property-values?uri=" + encodeURIComponent(datasetUri) + "&mode=" + mode,
    body: JSON.stringify(path),
    method: 'POST',
  })
}

export function getDatasetItemsByPropertyValue(datasetUri, onPropertyPath, value) {
  if (!localStorage.getItem(ACCESS_TOKEN)) {
    return Promise.reject("No access token set.");
  }

  return request({
     url: API_BASE_URL + "/data/schema/get-items-by-property-value?uri=" + encodeURIComponent(datasetUri),
     body: JSON.stringify({ path: onPropertyPath, value: value }),
     method: 'POST',
  })
}

export function getDatasetItemPropertiesPropertyValueAndTarget(datasetUri, onPropertyPath, value, target) {
  if (!localStorage.getItem(ACCESS_TOKEN)) {
    return Promise.reject("No access token set.");
  }

  return request({
     url: API_BASE_URL + "/data/schema/get-properties-by-value-and-target?uri=" + encodeURIComponent(datasetUri),
     body: JSON.stringify({ path: onPropertyPath, value: value, target: target }),
     method: 'POST',
  })
}

export function downloadDatasetPropertyValues(uri, path, mode) {
  if (!localStorage.getItem(ACCESS_TOKEN)) {
    return Promise.reject("No access token set.");
  }

  return sjRequest({
    url: API_BASE_URL + "/data/schema/download-property-values?uri=" + encodeURIComponent(uri) + "&mode=" + mode,
    body: JSON.stringify(path),
    method: 'POST',
  })
}
