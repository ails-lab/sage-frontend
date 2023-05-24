import { API_BASE_URL, ACCESS_TOKEN } from '../constants/index.js';
import { request, textrequest, jsonSuccessFailureRequest } from './APIUtils.js';

export function getOwnedCampaigns(type) {
  if (!localStorage.getItem(ACCESS_TOKEN)) {
    return Promise.reject("No access token set.");
  }

  return request({
    url: API_BASE_URL + "/campaign/get-owned-campaigns?type=" + type,
    method: 'GET',
  });
}


  export function removeUserFromCampaign(campaignId, userId) {
    if (!localStorage.getItem(ACCESS_TOKEN)) {
      return Promise.reject("No access token set.");
    }

    return request({
      url: API_BASE_URL + "/campaign/remove-user?campaignId=" + campaignId + "&userId=" + userId,
      method: 'POST',
    });
  }

export function getJoinedCampaigns(type) {
  if (!localStorage.getItem(ACCESS_TOKEN)) {
    return Promise.reject("No access token set.");
  }

  return request({
    url: API_BASE_URL + "/campaign/get-joined-campaigns?type=" + type,
    method: 'GET',
  });
}


export function getActiveCampaigns(type) {
  return request({
    url: API_BASE_URL + "/campaign/get-active-campaigns?type=" + type,
    method: 'GET',
  });
}


export function joinCampaign(id) {
  if (!localStorage.getItem(ACCESS_TOKEN)) {
    return Promise.reject("No access token set.");
  }
  return request({
    url: API_BASE_URL + "/campaign/join?campaignId=" + id,
    method: 'POST'
  });
}

export function createCampaign(name, state) {
  if (!localStorage.getItem(ACCESS_TOKEN)) {
    return Promise.reject("No access token set.");
  }

  var body = { name: name, state: state };

  return request({
    url: API_BASE_URL + '/campaign/create',
    method: 'POST',
    body: JSON.stringify(body)
  })
}

export function updateCampaign(id, name, state) {
  if (!localStorage.getItem(ACCESS_TOKEN)) {
    return Promise.reject("No access token set.");
  }

  var body = { name: name, state: state };

  return request({
    url: API_BASE_URL + "/campaign/update/" + id,
    method: 'POST',
    body: JSON.stringify(body)
  })

}

export function deleteCampaign(id) {
  if (!localStorage.getItem(ACCESS_TOKEN)) {
    return Promise.reject("No access token set.");
  }

  return jsonSuccessFailureRequest({
    url: API_BASE_URL + "/campaign/delete/" + id,
    method: 'DELETE',
  })
}

// export function assignDatasetToCampaign(campaignId, datasetUri) {
//   if (!localStorage.getItem(ACCESS_TOKEN)) {
//     return Promise.reject("No access token set.");
//   }
//   // if (collectionId) {
//   //   return request({
//   //     url: API_BASE_URL + "/access/createById?campaignId="+ campaignId + "&validatorId" + validatorId + "&collectionId=" + collectionId,
//   //     method: 'POST',
//   //   });
//   // }
//   // else if (uuid) {
//     return request({
//       url: API_BASE_URL + "/campaign/add-dataset/"+ campaignId + "?datasetUri=" + datasetUri,
//       method: 'POST',
//     });
//   // }
// }
