import { API_BASE_URL, ACCESS_TOKEN } from '../constants/index.js';
import { request, textrequest, textRequest, formSuccessFailureRequest, sRequest, jsonSuccessFailureRequest } from './APIUtils.js';

export function getD2RMLDocument(mappingid) {
  if (!localStorage.getItem(ACCESS_TOKEN)) {
    return Promise.reject("No access token set.");
  }

  return textRequest({
    url: API_BASE_URL + "/mappings/get-d2rml/" + mappingid,
    method: 'GET'
  });

}

export function getMappings(datasetId) {
  if (!localStorage.getItem(ACCESS_TOKEN)) {
    return Promise.reject("No access token set.");
  }

  return request({
    url: API_BASE_URL + "/mappings/get-all?datasetId=" + datasetId,
    method: 'GET'
  })
}

export function getMapping(id) {
  if (!localStorage.getItem(ACCESS_TOKEN)) {
    return Promise.reject("No access token set.");
  }

  return request({
    url: API_BASE_URL + "/mappings/get/" + id,
    method: 'GET'
  })
}

export function createMapping(datasetId, type, name, data, parameters, templateId) {
  if (!localStorage.getItem(ACCESS_TOKEN)) {
    return Promise.reject("No access token set.");
  }

   var body = { name: name }

   if (parameters && parameters != null) {
     body = { ...body, parameters: parameters }
   }
   if (templateId != null) {
     body = { ...body, templateId: templateId }
   }
  //
  // return request({
  //   url: API_BASE_URL + "/mappings/create?type=" + type + "&datasetId=" + datasetId,
  //   method: 'POST',
  //   body: JSON.stringify(body),
  // })

  var formData = new FormData();
  if (data != null) {
    formData.append('file', data);
  }

  formData.append('body', JSON.stringify(body));

   return formSuccessFailureRequest({
     url: API_BASE_URL + "/mappings/create?type=" + type + "&datasetId=" + datasetId,
     method: 'POST',
     body: formData,
   })
}

export function updateMapping(id, name, data, parameters) {
  if (!localStorage.getItem(ACCESS_TOKEN)) {
    return Promise.reject("No access token set.");
  }

  var body = {}
  if (name && name != null) {
     body = { ...body, name: name }
   }
   // if (d2rml && d2rml != null) {
   //   body = { ...body, d2rml: d2rml }
   // }
   if (parameters && parameters != null) {
     body = { ...body, parameters: parameters }
   }
  // return request({
  //   url: API_BASE_URL + "/mappings/update/" + id,
  //   method: 'POST',
  //   body: JSON.stringify(body),
  // })

  var formData = new FormData();
  // if (d2rml && d2rml != null && data !== undefined) {
  //   formData.append('file', data);
  // }
  if (data !== undefined) {
    formData.append('file', data);
  }

  formData.append('body', JSON.stringify(body));

  return formSuccessFailureRequest({
    url: API_BASE_URL + "/mappings/update/" + id,
    method: 'POST',
    body: formData,
  })
}

export function executeMapping(id, instanceId) {
  if (!localStorage.getItem(ACCESS_TOKEN)) {
    return Promise.reject("No access token set.");
  }

  return jsonSuccessFailureRequest({
    url: API_BASE_URL + "/mappings/execute/" + id + (instanceId ? "?instanceId=" + instanceId : ""),
    method: 'POST'
  })
}

export function stopMapping(id, instanceId) {
  if (!localStorage.getItem(ACCESS_TOKEN)) {
    return Promise.reject("No access token set.");
  }

  return jsonSuccessFailureRequest({
    url: API_BASE_URL + "/mappings/stop-execution/" + id + (instanceId ? "?instanceId=" + instanceId : ""),
    method: 'POST',
  })
}

export function unpublishMapping(id, instanceId) {
  if (!localStorage.getItem(ACCESS_TOKEN)) {
    return Promise.reject("No access token set.");
  }

  return textrequest({
    url: API_BASE_URL + "/mappings/unpublish/" + id + (instanceId ? "?instanceId=" + instanceId : ""),
    method: 'POST'
  })
}


export function clearMappingExecution(id, instanceId) {
  if (!localStorage.getItem(ACCESS_TOKEN)) {
    return Promise.reject("No access token set.");
  }

  return jsonSuccessFailureRequest({
    url: API_BASE_URL + "/mappings/clear-execution/" + id + (instanceId ? "?instanceId=" + instanceId : ""),
    method: 'POST'
  })
}

export function createMappingInstance(mappingId, parameters) {
  if (!localStorage.getItem(ACCESS_TOKEN)) {
    return Promise.reject("No access token set.");
  }

  return jsonSuccessFailureRequest({
    url: API_BASE_URL + "/mappings/create-instance/" + mappingId,
    method: 'POST',
    body: JSON.stringify(parameters)
  })
}

export function updateMappingInstance(mappingId, instanceId, parameters) {
  if (!localStorage.getItem(ACCESS_TOKEN)) {
    return Promise.reject("No access token set.");
  }

  return jsonSuccessFailureRequest({
    url: API_BASE_URL + "/mappings/update-instance/" + mappingId + "?instanceId=" + instanceId,
    method: 'POST',
    body: JSON.stringify(parameters)
  })
}

export function deleteMappingInstance(mappingId, instanceId) {
  if (!localStorage.getItem(ACCESS_TOKEN)) {
    return Promise.reject("No access token set.");
  }

  return jsonSuccessFailureRequest({
    url: API_BASE_URL + "/mappings/delete-instance/" + mappingId + "?instanceId=" + instanceId,
    method: 'DELETE'
  });
}

export function downloadMapping(id) {
  if (!localStorage.getItem(ACCESS_TOKEN)) {
    return Promise.reject("No access token set.");
  }

  return textrequest({
    url: API_BASE_URL + "/mappings/download/" + id,
    method: 'GET'
  });

}

export function previewLastMappingExecution(id, instanceId) {
  if (!localStorage.getItem(ACCESS_TOKEN)) {
    return Promise.reject("No access token set.");
  }

  return textRequest({
    url: API_BASE_URL + "/mappings/preview-last-execution/" + id + (instanceId ? "?instanceId=" + instanceId : ""),
    method: 'GET'
  });

}

export function previewPublishedMappingExecution(id, instanceId) {
  if (!localStorage.getItem(ACCESS_TOKEN)) {
    return Promise.reject("No access token set.");
  }

  return textRequest({
    url: API_BASE_URL + "/mappings/preview-published-execution/" + id + (instanceId ? "?instanceId=" + instanceId : ""),
    method: 'GET'
  });

}


export function downloadLastMappingExecution(id, instanceId) {
  if (!localStorage.getItem(ACCESS_TOKEN)) {
    return Promise.reject("No access token set.");
  }

  return sRequest({
    url: API_BASE_URL + "/mappings/download-last-execution/" + id + (instanceId ? "?instanceId=" + instanceId : ""),
    method: 'GET'
  });

}

export function downloadPublishedMappingExecution(id, instanceId) {
  if (!localStorage.getItem(ACCESS_TOKEN)) {
    return Promise.reject("No access token set.");
  }

  return sRequest({
    url: API_BASE_URL + "/mappings/download-published-execution/" + id + (instanceId ? "?instanceId=" + instanceId : ""),
    method: 'GET'
  });

}

export function deleteMapping(id) {
  if (!localStorage.getItem(ACCESS_TOKEN)) {
    return Promise.reject("No access token set.");
  }

  return textrequest({
    url: API_BASE_URL + "/mappings/delete/" + id,
    method: 'DELETE'
  });

}

// export function uploadMappingAttachment(mappingid, filename, file) {
//   if (!localStorage.getItem(ACCESS_TOKEN)) {
//     return Promise.reject("No access token set.");
//   }
//
//   var formData = new FormData();
//   formData.append('file', file);
//
//   return sRequest({
//     url: API_BASE_URL + "/mappings/upload-attachment/" + mappingid + "",
//     method: 'POST',
//     body: formData,
//   })
// }

export function uploadMappingAttachment(mappingId, instanceid, data) {
  if (!localStorage.getItem(ACCESS_TOKEN)) {
    return Promise.reject("No access token set.");
  }

  var formData = new FormData();
  formData.append('file', data);

  return sRequest({
    url: API_BASE_URL + "/mappings/upload-attachment/" + mappingId + (instanceid != null ? "?instanceId=" + instanceid : ""),
    method: 'POST',
    body: formData,
  })
}

export function deleteMappingAttachment(mappingid, instanceid, filename) {
  if (!localStorage.getItem(ACCESS_TOKEN)) {
    return Promise.reject("No access token set.");
  }

  return textrequest({
    url: API_BASE_URL + "/mappings/delete-attachment/" + mappingid + "?filename=" + filename + (instanceid != null ? "&instanceId=" + instanceid : ""),
    method: 'DELETE',
  })
}
