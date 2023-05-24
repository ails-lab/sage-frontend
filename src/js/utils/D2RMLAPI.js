import { API_BASE_URL, ACCESS_TOKEN } from '../constants/index.js';
import { jsonSuccessFailureRequest } from './APIUtils.js';

export function validateD2RML(d2rml) {
  if (!localStorage.getItem(ACCESS_TOKEN)) {
    return Promise.reject("No access token set.");
  }

  return jsonSuccessFailureRequest({
    url: API_BASE_URL + '/d2rml/validate',
    method: 'POST',
    body: d2rml
  })
}
