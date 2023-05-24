import React, { Component } from "react";
import Container from "react-bootstrap/Container";
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import Form from "react-bootstrap/Form";
import Dropdown from "react-bootstrap/Dropdown";
import DropdownButton from "react-bootstrap/DropdownButton";
// import { splice } from '../../utils/functions.js';
import { getD2RMLDocument, getMappings, executeMapping, stopMapping, updateMapping, getMapping, unpublishMapping, downloadMapping, createMapping, deleteMapping, uploadMappingAttachment, deleteMappingAttachment, previewLastMappingExecution, downloadLastMappingExecution, previewPublishedMappingExecution, downloadPublishedMappingExecution, clearMappingExecution, createMappingInstance, updateMappingInstance, deleteMappingInstance  } from '../../utils/MappingsAPI';
import { getFiles, deleteFile, previewLastFile, previewPublishedFile, downloadLastFile, downloadPublishedFile, updateFile, createFile } from '../../utils/FilesAPI';
import { convert } from '../../utils/D2RMLUtils';
import { addDataset, removeDataset, getDatasetDescription } from '../../utils/DatasetAPI';
import { throwToast } from '../../utils/UIUtils';
import { getIndexes, newIndex, updateIndex, deleteIndex, createIndex, stopCreateIndex, destroyIndex } from '../../utils/IndexAPI';
import { getUserTasks, runUserTask, createUserTask, updateUserTask, scheduleUserTask, unscheduleUserTask } from '../../utils/UserTasksAPI';

//import D2RMLEditor from "./d2rml/D2RMLEditor.js";
import NewMappingUploadModal from "./modals/NewMappingUploadModal.js";
import NewBindingModal from "./modals/NewBindingModal.js";
import PublishModal from "./modals/PublishModal.js";
import IndexModal from "./modals/IndexModal.js";
import ExecutableState from "./ExecutableState.js";
import PublishableState from "./PublishableState.js";
import IndexableState from "./IndexableState.js";
import CreatableState from "./CreatableState.js";
import RunnableState from "./RunnableState.js";
import DistributableState from "./DistributableState.js";
import LoadableState from "./LoadableState.js";
import ResultsModal from "./modals/ResultsModal.js";
import DeleteModal from "./modals/DeleteModal.js";
import CreateDistributionModal from "./modals/CreateDistributionModal.js";
import NewDatasetLinkModal from "./modals/NewDatasetLinkModal.js";
import RDFDataFileUploadModal from "./modals/RDFDataFileUploadModal.js";
import SourceDataFileUploadModal from "./modals/SourceDataFileUploadModal.js";
import D2RMLEditorModal from "./modals/D2RMLEditorModal.js";
import UserTaskModal from "./modals/UserTaskModal.js";

import ReactTooltip from "react-tooltip";
import { API_BASE_URL } from '../../constants/index.js';

import { actionsMenu, sortByField, MessageQueue } from '../../utils/UIUtils';

export class DatasetEditor extends Component {
  constructor(props) {
    super(props);

    this.state = {

      mappings: [],
      currentMappingIndex: null,

      files: [],
      currentFileIndex: null,

      indexes: [],

      userTasks: [],

      newMappingModalShow: false,
      newMappingModalMapping: null,

      newBindingModalShow: false,
      parameters: [],
      mappingId: null,

      newSourceDataModalShow: false,

      newUserTaskModalShow: false,

      D2RMLEditorModalShow:false,
      D2RMLEditorState: { title:null, loaded: false, loading:false, failed:false },
      D2RMLEditorDocument: "",

      newDataModalShow: false,

      newDatasetLinkModalShow: false,
      publishModalShow: false,

      resultsShow: false,
      resultsState: { title:null, loaded: false, loading:false, failed:false },

      indexModalShow:false
    };

    this.messageQueueMap = new Map();

    if (props.dataset.id) {
      this.datasetUpdated(props.dataset.id);
    }
  }

  componentDidUpdate() {
    ReactTooltip.rebuild();
  }

  componentWillReceiveProps(props) {
    // console.log(props.dataset)

    if (this.props.dataset.id !== props.dataset.id) {

      this.currentMappingIndex = null;
      if (props.dataset.id) {
        this.datasetUpdated(props.dataset.id)
      }

      this.messageQueueMap = new Map();
    }
  }

  addDataset(id, toId) {
    addDataset(id, toId)
      .then(() => {
        this.props.actions('add-dataset-to-catalog', { id: id})
      })
  }

  removeDataset(id, fromId) {
    removeDataset(id, fromId)
      .then(() => {
        this.props.actions('remove-dataset-from-catalog', { id: id})
      })
  }

  mappingsSort(a,b) {
       if (a.type === "PREFIX" && (b.type === "HEADER" || b.type === "CONTENT")) {
         return -1;
       } else if (a.type === "HEADER" && b.type === "CONTENT") {
         return -1;
       } else if (a.type === "HEADER" && b.type === "PREFIX") {
         return 1;
       } else if (a.type === "CONTENT" && (b.type === "PREFIX" || b.type === "HEADER")) {
         return 1;
       } else {
         if (a.name < b.name) {
           return -1;
         } else if (a.name > b.name) {
           return 1;
         } else {
           return 0;
         }
       }
  }

  datasetUpdated(id) {
      const _this = this;
      getMappings(id)
        .then(response => {
          response.sort(this.mappingsSort);
          _this.setState({ mappings: response, currentMappingIndex: null });
        })

      getFiles(id)
        .then(response => {
          _this.setState({ files: response.sort((a,b) => sortByField('name', a, b)), currentFileIndex: null });
        })

      getUserTasks(id)
        .then(response => {
          _this.setState({ userTasks: response.sort((a,b) => sortByField('name', a, b)), currentUserTaskIndex: null });
        })

      this.getIndexes(id)
  }

  getIndexes(id) {
    const _this = this;
    getIndexes(id)
      .then(response => {
        _this.setState({ indexes: response.sort((a,b) => sortByField('indexStructureIdentifier', a, b)), currentIndexIndex: null });
      })
  }


  handleExecuteMessage(message) {
    // console.log("UPDATING " + message.order)
    if (message.instanceId) {
      return {
        mappings: this.state.mappings.map(el => {
          if (el.id !== message.id) {
            return el
          } else {
            return {
              ...el, instances: el.instances.map(inst => {
                if (inst.id !== message.instanceId) {
                  return inst
                } else {
                  var obj = {...inst, [message.type +'State']: message.state }
                  delete obj[message.type + 'Messages']
                  delete obj[message.type + 'Count']
                  delete obj.d2rmlExecution

                  obj = message.d2rmlExecution ? {...obj, d2rmlExecution: message.d2rmlExecution } : obj
                  obj = message.startedAt ? {...obj, [message.type + 'StartedAt']: message.startedAt } : obj
                  obj = message.completedAt ? {...obj, [message.type + 'CompletedAt']: message.completedAt } : obj
                  obj = message.messages ? {...obj, [message.type + 'Messages']: message.messages } : obj
                  obj = message.count ? {...obj, [message.type + 'Count']: message.count } : obj

                  if (message.state == 'EXECUTED') {
                    obj = {...obj, newExecution: true}
                  }
                  return obj
                }
              })
            }
          }
        })
      }
    } else {
      return {
        mappings: this.state.mappings.map(el => {
          if (el.id !== message.id) {
             return el
          } else {
            return {
              ...el, instances: el.instances.map(inst => {
                var obj = {...inst, [message.type +'State']: message.state }
                delete obj[message.type + 'Messages']
                delete obj[message.type + 'Count']
                delete obj.d2rmlExecution

                obj = message.d2rmlExecution ? {...obj, d2rmlExecution: message.d2rmlExecution } : obj
                obj = message.startedAt ? {...obj, [message.type + 'StartedAt']: message.startedAt } : obj
                obj = message.completedAt ? {...obj, [message.type + 'CompletedAt']: message.completedAt } : obj
                obj = message.messages ? {...obj, [message.type + 'Messages']: message.messages } : obj
                obj = message.count ? {...obj, [message.type + 'Count']: message.count } : obj

                if (message.state == 'EXECUTED') {
                  obj = {...obj, newExecution: true}
                }
                return obj
              })
           }
         }
       })
      }
    }
  }

  handleIndexMessage(message) {
    return {
      indexes: this.state.indexes.map(el => {
        if (el.id !== message.id) {
          return el
        } else {
          var vobj = {...el, [message.type +'State']: message.state }

          delete vobj[message.type + 'Messages']
          delete vobj[message.type + 'ExecutionInfo']
          delete vobj[message.type + 'Count']

          vobj = message.startedAt ? {...vobj, [message.type + 'StartedAt']: message.startedAt } : vobj
          vobj = message.completedAt ? {...vobj, [message.type + 'CompletedAt']: message.completedAt } : vobj
          vobj = message.messages ? {...vobj, [message.type + 'Messages']: message.messages } : vobj
          vobj = message.executionInfo ? {...vobj, [message.type + 'ExecutionInfo']: message.executionInfo } : vobj
          vobj = message.count ? {...vobj, [message.type + 'Count']: message.count } : vobj

          return vobj;
        }
    })}
  }

  handleUserTaskMessage(message) {
    return {
      userTasks: this.state.userTasks.map(el => {
        if (el.id !== message.id) {
          return el
        } else {
          var vobj = {...el, [message.type +'State']: message.state }

          delete vobj[message.type + 'Messages']

          vobj = message.startedAt ? {...vobj, [message.type + 'StartedAt']: message.startedAt } : vobj
          vobj = message.completedAt ? {...vobj, [message.type + 'CompletedAt']: message.completedAt } : vobj
          vobj = message.messages ? {...vobj, [message.type + 'Messages']: message.messages } : vobj

          return vobj;
        }
    })}
  }

  handleServerEvent(type, message) {
    // console.log(message)

    if (type == "dataset") {
      this.datasetUpdated(this.props.dataset.id)

    } else if (type == "mapping") {
      var id = message.id + (message.instanceId ? (":" + message.instanceId) : "") + ":" + message.type

      var queue = this.messageQueueMap.get(id)
      if (!queue) {
        queue = new MessageQueue(this, (message) => this.handleExecuteMessage(message))
        this.messageQueueMap.set(id, queue)
      }

      queue.push(message)
    } else if (type == "index") {
      var id = message.id + ":" + message.type

      var queue = this.messageQueueMap.get(id)
      if (!queue) {
        queue = new MessageQueue(this, (message) => this.handleIndexMessage(message))
        this.messageQueueMap.set(id, queue)
      }

      queue.push(message)
    } else if (type == "user_task") {
      var id = message.id + ":" + message.type

      var queue = this.messageQueueMap.get(id)
      if (!queue) {
        queue = new MessageQueue(this, (message) => this.handleUserTaskMessage(message))
        this.messageQueueMap.set(id, queue)
      }

      queue.push(message)
    }
  }

  updateMappingInfo(params,response) {
    if (response.result) {
      if (params.instanceId) {
         this.setState({ mappings: this.state.mappings.map(el =>
           el.id !== params.id ? el : {...el, instances: el.instances.map(inst => inst.id !== params.instanceId ? inst : response.result.instances.find(x => inst.id === x.id ) )}
         )})
      } else {
         this.setState({ mappings: this.state.mappings.map(el => el.id !== params.id ? el : response.result) })
      }
    }
  }

  executeAction(action, params) {

    if (action === 'create-mapping') {
        if (params.id && params.id != null) {
          updateMapping(params.id, params.name, params.data, params.parameters)
            .then(response => {
              this.updateMappingInfo(params, response);
            })
            .catch(error => {
              throwToast('error', error.message);
            })
        } else {
          createMapping(params.datasetId, this.state.newMappingType, params.name, params.data, params.parameters, params.templateId)
          .then(response => {
              this.setState({ mappings: this.state.mappings.slice().concat(response.result).sort(this.mappingsSort) })
          })
          .catch(error => {
            throwToast('error', error.message);
          })
        }
    } else if (action === 'create-file') {
      if (params.id && params.id != null) {
        updateFile(params.id, params.name, params.data)
          .then(response => {
            this.setState( { files: this.state.files.map(el => el.id !== params.id ? el : response.result).sort((a,b) => sortByField('name', a, b))} );
          })
          .catch(error => {
            throwToast('error', error.message);
          })
      } else {
        createFile(params.name, params.datasetId, params.data)
          .then(response => {
            this.setState({ files: this.state.files.slice().concat(response.result).sort((a,b) => sortByField('name', a, b)) })
          })
          .catch(error => {
            throwToast('error', error.message);
          })
      }
      this.fileModal.loadingCompleted();
    } else if (action === 'update-d2rml') {
      updateMapping(params.mapping.id, params.mapping.name, new File([params.d2rml], params.mapping.fileName), params.parameters)
        .then(response => {
          this.setState( { mappings: this.state.mappings.map(el => el.id === params.mapping.id ? {...el, parameters: params.parameters != undefined ? params.parameters : [] } : el ),
                           D2RMLEditorModalShow: false, D2RMLEditorMapping: undefined } );
        })
    } else if (action === 'delete-file') {
      this.setState({ deleteModalShow:true, deleteModalCommand: 'delete-file', deleteModalParams:params})
    } else if (action === 'delete-file-ok') {
      deleteFile(params.id)
        .then(response => {
          this.setState({ files: this.state.files.filter(el => el.id !== params.id)})
        })
    } else if (action === 'edit-d2rml') {
      this.setState({ D2RMLEditorModalShow: true, D2RMLEditorMapping: params.mapping, D2RMLEditorState: { loaded: false, loading:true, failed:false }}, () =>
          getD2RMLDocument(params.mapping.id)
          .then(response => {
              response.text().then(text =>
                 this.setState({ D2RMLEditorDocument: text, D2RMLEditorState: { loaded: true, loading:false, failed:false } }),
                    () => this.setState({ D2RMLEditorMapping: null, D2RMLEditorState: { loaded: false, loading:false, failed:true } }))}))

    } else if (action === 'save-mapping') {
        // console.log('SAVING');
        // console.log(params.id);
        // console.log(params.json);
        // console.log(this.state.mappings[this.state.currentMappingIndex].id);
        // console.log(params.files.length);
        // console.log(value);
        // console.log(files);

        var filePromises = [];
        const _this = this;
        for (const i in params.files) {
          if (params.files[i].blob !== undefined) {
            filePromises.push(
              new Promise(function(resolve, reject) {
                 // uploadMappingAttachment(_this.state.mappings[_this.state.currentMappingIndex].id, params.files[i].name, params.files[i].blob)
                 uploadMappingAttachment(_this.state.mappings[_this.state.currentMappingIndex].id, null, params.files[i].blob)
                    .then(resolve())
                  }
                ))
              }
        }

        Promise.all(filePromises).then(() => {
            updateMapping(params.id, null, params.json)
              .then(response => {
                this.setState( { mappings: this.state.mappings.map(el => el.id === params.id ? {...el, d2RML: params.json ? params.json : el.d2RML} : el )} );
                // this.setState({ newMappingModalShow: false, newMappingModalMapping: null });
              })
            // updateMapping(this.state.mappings[this.state.currentMappingIndex].id, this.state.mappings[this.state.currentMappingIndex].id.name, JSON.stringify(params.d2rml))
            // .then(() =>  {
            //    this.setState(copyReplaceAt('D2RMLMappings', this.state.mappings, this.state.currentIndex, { ...this.state.mappings[this.state.currentIndex], d2RML: JSON.stringify(value)}))
            // })
        })


      } else if (action === 'execute-mapping') {
        executeMapping(params.id, params.instanceId)
          .then(response => {
             throwToast('success', response.message)
           })
           .catch(error => {
             throwToast('error', error.message);
           })

    } else if (action === 'stop-mapping') {
      stopMapping(params.id, params.instanceId)
        .then(response => {
           throwToast('success', response.message);
           this.updateMappingInfo(params, response);
       })
      .catch(error => {
          throwToast('error', error.message);
      })
    } else if (action === 'clear-mapping-execution') {
        clearMappingExecution(params.id, params.instanceId)
        .then(response => {
           throwToast('success', response.message);
           this.updateMappingInfo(params, response);
       })
       .catch(error => {
          throwToast('error', error.message);
       })
    } else if (action === 'unpublish-mapping') {
       // console.log(this.state.mappings);
       unpublishMapping(params.id, params.instanceId)
          .then(() => {
           }
      )

    } else if (action === 'download-d2rml') {
        downloadMapping(params.id)
    // } else if (action === 'update-name') {
      // console.log(this.state.currentIndex);
      // console.log(value);
      // var currentMapping = {...this.state.mappings[this.state.currentMappingIndex], name:value };
      //
      // this.setState(copyReplaceAt('D2RMLMappings', this.state.mappings, this.state.currentIndex, currentMapping));
    } else if (action === 'delete-attachment') {
        this.setState({ deleteModalShow:true, deleteModalCommand: 'delete-attachment', deleteModalParams:params})
    } else if (action === 'delete-attachment-ok') {
      if(params.instanceid == null ) {
         deleteMappingAttachment(params.mappingid, null, params.filename)
          .then(() =>
            this.setState({ mappings: this.state.mappings.map(el =>
                el.id !== params.mappingid ?
                   el : {...el, dataFiles: el.dataFiles.filter(f => f !== params.filename)})})
        )
      } else {
        deleteMappingAttachment(params.mappingid, params.instanceid, params.filename)
          .then(() =>
            this.setState({ mappings: this.state.mappings.map(el =>
                el.id !== params.mappingid ?
                   el : {...el, instances: el.instances.map(inst =>
                                  inst.id !== params.instanceid ? inst : {...inst, dataFiles: inst.dataFiles.filter(f => f !== params.filename) })})})
          )
        }
    } else if (action === 'add-attachment') {
      if(params.instanceid == null ) {
        uploadMappingAttachment(params.mappingid, null, params.data)
          .then(() =>
            this.setState({ mappings: this.state.mappings.map(el =>
                el.id !== params.mappingid ?
                   el : {...el, dataFiles: (el.dataFiles ? el.dataFiles.concat(params.data.name) : [ params.data.name ] )})}),
            this.sourceDataFileModal.loadingCompleted()
      )
    } else {
      uploadMappingAttachment(params.mappingid, params.instanceid, params.data)
        .then(() =>
          this.setState({ mappings: this.state.mappings.map(el =>
              el.id !== params.mappingid ?
                 el : {...el, instances: el.instances.map(inst =>
                                inst.id !== params.instanceid ? inst : {...inst, dataFiles: (inst.dataFiles ? inst.dataFiles.concat(params.data.name) : [ params.data.name ] )})})}),
          this.sourceDataFileModal.loadingCompleted()
        )
      }
    } else if (action === 'delete-mapping') {
        this.setState({ deleteModalShow:true, deleteModalCommand: 'delete-mapping', deleteModalParams:params})
    } else if (action === 'delete-mapping-ok') {
      deleteMapping(params.id)
        .then(() =>
           // this.setState({ mappings: splice(this.state.mappings, this.state.currentMappingIndex), currentMappingIndex: null}))
           this.setState({ mappings: this.state.mappings.filter(el => el.id !== params.id), currentMappingIndex: null}))
    } else if (action === 'preview-last-mapping-execution') {
        this.setState({ lastExecution: null, resultsShow:true, resultsState: { title:'Execution result', loaded: false, loading: true, failed: false}}, () =>
          previewLastMappingExecution(params.id, params.instanceId)
            .then(response => {
              response.text().then(text =>
                this.setState({ lastExecution: { text: text }, resultsState: {title:'Execution result', loaded: true, loading: false, failed: false} }))},
                () => this.setState({ lastExecution: null, resultsState: {title:'Execution result', loaded: false, loading: false, failed: true}}) )
          )
    } else if (action === 'preview-published-mapping-execution') {
        this.setState({ lastExecution: null, resultsShow:true, resultsState: { title:'Execution result', loaded: false, loading: true, failed: false}}, () =>
          previewPublishedMappingExecution(params.id, params.instanceId)
            .then(response => {
              response.text().then(text =>
                this.setState({ lastExecution: { text: text }, resultsState: {title:'Execution result', loaded: true, loading: false, failed: false} }))},
                () => this.setState({ lastExecution: null, resultsState: {title:'Execution result', loaded: false, loading: false, failed: true}}) )
          )
    } else if (action === 'download-last-mapping-execution') {
        downloadLastMappingExecution(params.id, params.instanceId)
        .then((response) => {
          if (response.ok) {
            const filename = response.headers.get('content-disposition')
              .split(';')
              .find(n => n.includes('filename='))
              .replace('filename=', '')
              .trim();

              response.blob().then(blob => {
          					let url = window.URL.createObjectURL(blob);
          					let a = document.createElement('a');
          					a.href = url;
          					a.download = filename;
          					a.click();
          				});
            } else {
               Promise.reject(response)
            }},
            () => Promise.reject())
      } else if (action === 'download-published-mapping-execution') {
          downloadPublishedMappingExecution(params.id, params.instanceId)
          .then((response) => {
            if (response.ok) {
              const filename = response.headers.get('content-disposition')
                .split(';')
                .find(n => n.includes('filename='))
                .replace('filename=', '')
                .trim();

                response.blob().then(blob => {
            					let url = window.URL.createObjectURL(blob);
            					let a = document.createElement('a');
            					a.href = url;
            					a.download = filename;
            					a.click();
            				});
              } else {
                 Promise.reject(response)
              }},
              () => Promise.reject())
      } else if (action === 'view-prefix-mapping') {
          // this.setState({ lastExecution: null, resultsShow:true, resultsState: { loaded: false, loading: true, failed: false}}, () =>
          //   viewPrefixMapping(params.id)
          //     .then(response => {
          //       response.text().then(text =>
          //         this.setState({ lastExecution: { text: text }, resultsState: {loaded: true, loading: false, failed: false} }))},
          //         () => this.setState({ lastExecution: null, resultsState: {loaded: false, loading: false, failed: true}}) )
          //   )
      } else if (action === 'preview-last-file') {
          this.setState({ lastExecution: null, resultsShow:true, resultsState: {title:'File content', loaded: false, loading: true, failed: false}}, () =>
          previewLastFile(params.id)
            .then(response => {
              response.text().then(text =>
                this.setState({ lastExecution: { text: text }, resultsState: {title:'File content', loaded: true, loading: false, failed: false} }))},
                () => this.setState({ lastExecution: null, resultsState: {title:'File content', loaded: false, loading: false, failed: true}}) )
          )
      } else if (action === 'preview-published-file') {
          this.setState({ lastExecution: null, resultsShow:true, resultsState: {title:'File content', loaded: false, loading: true, failed: false}}, () =>
          previewPublishedFile(params.id)
            .then(response => {
              response.text().then(text =>
                this.setState({ lastExecution: { text: text }, resultsState: {title:'File content', loaded: true, loading: false, failed: false} }))},
                () => this.setState({ lastExecution: null, resultsState: {title:'File content', loaded: false, loading: false, failed: true}}) )
          )
    } else if (action === 'download-last-file') {
        downloadLastFile(params.id)
        .then((response) => {
          if (response.ok) {
            const filename = response.headers.get('content-disposition')
              .split(';')
              .find(n => n.includes('filename='))
              .replace('filename=', '')
              .trim();

              response.blob().then(blob => {
          					let url = window.URL.createObjectURL(blob);
          					let a = document.createElement('a');
          					a.href = url;
          					a.download = filename;
          					a.click();
          				});
            } else {
               Promise.reject(response)
            }},
            () => Promise.reject())
      } else if (action === 'download-published-file') {
          downloadPublishedFile(params.id)
          .then((response) => {
            if (response.ok) {
              const filename = response.headers.get('content-disposition')
                .split(';')
                .find(n => n.includes('filename='))
                .replace('filename=', '')
                .trim();

                response.blob().then(blob => {
            					let url = window.URL.createObjectURL(blob);
            					let a = document.createElement('a');
            					a.href = url;
            					a.download = filename;
            					a.click();
            				});
              } else {
                 Promise.reject(response)
              }},
              () => Promise.reject())
      } else if (action === 'add-parameter-binding') {
          this.setState({parameters: this.state.mappings[params.index].parameters, mappingId:params.id, instance:null, newBindingModalShow:true})
      } else if (action === 'create-parameter-binding') {
        if (!params.instanceId) {
          createMappingInstance(params.mappingId, params.parameters)
            .then((json) => {
              this.setState({ mappings: this.state.mappings.map(el => el.id !== params.mappingId ? el : {...el, instances: el.instances.concat(json)}),
                   newBindingModalShow:false})
           }).catch(error => {
              throwToast('error', error.message)
           })
        } else {
          updateMappingInstance(params.mappingId, params.instanceId, params.parameters)
            .then((json) => {
              this.setState({ mappings: this.state.mappings.map(el => el.id !== params.mappingId ? el : {...el, instances: el.instances.map(inst => inst.id !== params.instanceId ? inst : json)}),
                   newBindingModalShow:false})
            }).catch(error => {
              throwToast('error', error.message)
            })
        }
      } else if (action === 'update-parameter-binding') {
        this.setState({parameters: this.state.mappings[params.mappingIndex].parameters, mappingId:params.id, instance: params.instance, newBindingModalShow:true})

          // createMappingParameterBinding(params.id, params.parameters)
          //   .then((json) =>
          //     this.setState({ mappings: this.state.mappings.map(el =>
          //         el.id !== params.id ?
          //            el : {...el, instances: el.instances.concat(json)}),
          //          newBindingModalShow:false})
          // )
      } else if (action === 'delete-parameter-binding') {
          this.setState({ deleteModalShow:true, deleteModalCommand: 'delete-parameter-binding', deleteModalParams:params})
      } else if (action === 'delete-parameter-binding-ok') {
          deleteMappingInstance(params.id, params.instanceId)
            .then(() => {
                this.setState({ mappings: this.state.mappings.map(el =>
                el.id !== params.id ?
                   el : {...el, instances: el.instances.filter(inst => inst.id !== params.instanceId)})})
            }).catch(error => {
               throwToast('error', error.message)
          })
      } else if (action === 'update-mapping') {
        this.setState({ newMappingModalShow: true, newMappingType: params.mapping.type, newMappingModalMapping: params.mapping})
      } else if (action === 'update-file') {
        this.setState({ newDataModalShow: true, newDataModalFile: params.file})
      } else if (action === 'view-dataset-description') {
          this.setState({ lastExecution: null, resultsShow:true, resultsState: {title:'Dataset description', loaded: false, loading: true, failed: false}}, () =>
            getDatasetDescription(params.id)
              .then(response => {
                response.text().then(text =>
                  this.setState({ lastExecution: { text: text }, resultsState: {title:'Dataset description', loaded: true, loading: false, failed: false} }))},
                  () => this.setState({ lastExecution: null, resultsState: {title:'Dataset description', loaded: false, loading: false, failed: true}}) )
            )

      } else if (action === 'new-index') {
        newIndex(params.datasetId, params.indexStructureId, params.indexIdentifier, params.indexEngine, params.indexStructures, params.keysMetadata)
          .then(response => {
            // throwToast('success', response.message)
            this.setState({ indexes: this.state.indexes.slice().concat(response.result).sort((a,b) => sortByField('indexStructureIdentifier', a, b)) })
          }).catch(error => {
            throwToast('error', error.message)
          })
      } else if (action === 'delete-index') {
        this.setState({ deleteModalShow:true, deleteModalCommand: 'delete-index', deleteModalParams:params})
      } else if (action === 'delete-index-ok') {
        deleteIndex(params.id)
          .then(response => {
            this.setState({ indexes: this.state.indexes.filter(el => el.id !== params.id)})
          }).catch(error => {
             throwToast('error', error.message)
        })
      } else if (action === 'create-index') {
        createIndex(params.id)
          .then(response => {
             throwToast('success', response.message)
           })
           .catch(error => {
             throwToast('error', error.message);
           })
      } else if (action === 'stop-create-index') {
        stopCreateIndex(params.id)
          .then(response => {
             throwToast('success', response.message);
             this.setState({ indexes: this.state.indexes.map(el => el.id !== params.id ? el : response.result) })
         })
        .catch(error => {
            throwToast('error', error.message);
        })
      } else if (action === 'destroy-index') {
        destroyIndex(params.id)
         .then(response => {
           throwToast('success', response.message)
         })
         .catch(error => {
           throwToast('error', error.message);
         })
     } else if (action === 'change-index-default-state') {
       updateIndex(params.id, !this.state.indexes.find(el => el.id == params.id)['default'])
       .then(response => {
         this.getIndexes(this.props.dataset.id)
       })
       .catch(error => {
         throwToast('error', error.message);
       })
     } else if (action === 'create-user-task') {
        if (params.id && params.id != null) {
          updateUserTask(params.id, params.name, params.tasks, params.cronExpression)
           .then(response => {
               this.setState({ userTasks: this.state.userTasks.map(el => el.id !== params.id ? el : response.result).sort((a,b) => sortByField('name', a, b)) })
           })
           .catch(error => {
             throwToast('error', error.message);
           })
        } else {
         createUserTask(params.datasetId, params.name, params.tasks, params.cronExpression)
          .then(response => {
             this.setState({ userTasks: this.state.userTasks.slice().concat(response.result).sort((a,b) => sortByField('name', a, b)) })
          })
          .catch(error => {
           throwToast('error', error.message);
          })
      }
    } else if (action === 'update-user-task') {
       this.setState({ newUserTaskModalShow: true, newUserTaskModalUserTask: params.userTask})
     } else if (action === 'run-user-task') {
       runUserTask(params.id)
        .then(response => {
          throwToast('success', response.message)
        })
        .catch(error => {
          throwToast('error', error.message);
        })
    } else if (action === 'schedule-user-task') {
      scheduleUserTask(params.id)
       .then(response => {
         this.setState({ userTasks: this.state.userTasks.map(el => el.id !== params.id ? el : response.result).sort((a,b) => sortByField('name', a, b)) })
         throwToast('success', response.message)
       })
       .catch(error => {
         throwToast('error', error.message);
       })
   } else if (action === 'unschedule-user-task') {
     unscheduleUserTask(params.id)
      .then(response => {
        this.setState({ userTasks: this.state.userTasks.map(el => el.id !== params.id ? el : response.result).sort((a,b) => sortByField('name', a, b)) })
        throwToast('success', response.message)
      })
      .catch(error => {
        throwToast('error', error.message);
      })
   }
  }

  selectMapping(index) {
    this.setState({ currentMappingIndex: index })
  }

  isPrefixMapping(el) {
    return el.type === 'PREFIX';
  }

  hasExecutions() {

    if (this.props.type === 'CATALOG') {
      return true;
    }

    let executedFound = false;

    let contentMappings = this.state.mappings.filter(mapping => mapping.type === "CONTENT")
    contentMappings.forEach((mapping) => {
      for (let inst of mapping.instances) {
        if (inst.executeState === "EXECUTED") {
          executedFound = true;
          return;
        }
      }
    })

    let contentFiles = this.state.files
    contentFiles.forEach(file => {
      if (file.executeState === "EXECUTED") {
        executedFound = true;
        return;
      }
    })

    if (!executedFound) {
      return false
    } else {
      return true;
    }
  }

  hasUnpublishedExecutions() {

    let executedFound = false;

    let contentMappings = this.state.mappings.filter(mapping => mapping.type === "CONTENT")
    contentMappings.forEach((mapping) => {
      for (let inst of mapping.instances) {
        if (inst.executeState === "EXECUTED" && inst.publishState === 'UNPUBLISHED') {
          executedFound = true;
          return;
        }
      }
    })

    if (!executedFound) {
      return false
    } else {
      return true;
    }
  }

  render() {
    var supportsIndexing = this.props.database.hasOwnProperty('indexEngines');

    var currentMapping = null;
    if (this.state.currentMappingIndex !== null) {
      currentMapping = this.state.mappings[this.state.currentMappingIndex]
    }
    var published = this.props.dataset.publishState.startsWith("PUBLISHED");
    var indexed = this.props.dataset.indexState === "INDEXED";

    var hasExecutions = this.hasExecutions();
    var hasUnpublishedExecutions = this.hasUnpublishedExecutions();

    var isLocal = !this.props.dataset.remoteTripleStore;

    return (
      <Container className="userspace-right">
        <Row className=" userspace-right-inner">
          <Col>
            <Container className="groupborder">
              <Row className="header">
                <Col md={11} className="bold">
                  {this.props.type==='DATASET' && <span className="crimson-std">Dataset: </span>}
                  {this.props.type==='CATALOG' && <span className="crimson-std">Catalog: </span>}
                   {this.props.dataset.name}
                </Col>
                <Col className="mybutton" md={1}>
                  {actionsMenu(
                  <div>
                    <Dropdown.Item className="py-2"
                                   onClick={() => this.props.actions('update-dataset', {id : this.props.dataset.id, type: this.props.type, scope: this.props.scope})}>
                      <span className="menu-icon fa fa-edit fa-lg mr-3" />Edit...
                    </Dropdown.Item>

                    <div data-tip={!(!published && !indexed && (this.props.type==='DATASET' || (this.props.type === 'CATALOG' && this.props.dataset.datasets.length === 0)))
                        ? "You cannot delete a published dataset" : null}
                        data-place="left" data-effect="solid">
                      <Dropdown.Item className="py-2"
                                     disabled={!(!published && !indexed && (this.props.type==='DATASET' || (this.props.type === 'CATALOG' && this.props.dataset.datasets.length === 0)))}
                                     onClick={() => this.props.actions('delete-dataset', {id: this.props.dataset.id, type: this.props.type})}>
                        <span className="menu-icon fa fa-trash-o fa-lg mr-3" />Delete
                      </Dropdown.Item>
                    </div>
                    <ReactTooltip delay={200} />


  {/*                  {this.props.type === 'dataset' && <Dropdown.Item  onClick={(event) => this.setState({ newMappingModalShow: true, newMappingType: 'PREFIX', newMappingModalMapping: null})}>Add Prefix File</Dropdown.Item>} */}

                    <Dropdown.Divider/>


                    {//!published && <div data-tip={!hasExecutions ? "There is nothing executed to publish" : null} data-place="left" data-effect="solid">
                    <div>
                      <Dropdown.Item className="py-2"
                        disabled={isLocal && (published || this.props.dataset.publishState == 'PUBLISHING' || this.props.dataset.publishState == 'UNPUBLISHING' || !hasExecutions)}
                        onClick={(event) => this.setState({ publishModalShow: true})}>
                        <span className="menu-icon fa fa-calendar-check-o fa-lg mr-3"/>Publish...
                      </Dropdown.Item>
                    </div>}

                    {isLocal &&
                    <Dropdown.Item className="py-2"
                         disabled={!published || !hasUnpublishedExecutions }
                         onClick={(event) => this.props.actions('publish-dataset-unpublished-content', {id : this.props.dataset.id})}>
                      <span className="menu-icon fa fa-calendar-check-o fa-lg mr-3"/>Publish unpublished content
                    </Dropdown.Item>}

                    {this.props.type === 'DATASET' && isLocal &&
                    <Dropdown.Item className="py-2"
                           disabled={!published}
                           onClick={(event) => this.props.actions('republish-dataset', {id : this.props.dataset.id})}>
                      <span className="menu-icon fa fa-calendar fa-lg mr-3"/>Republish all
                    </Dropdown.Item>}

                    {(true || this.props.metadata) && (published || !published) && isLocal &&
                    <Dropdown.Item className="py-2"
                           disabled={!published}
                           onClick={(event) => this.props.actions('republish-dataset-metadata', {id : this.props.dataset.id})}>
                      <span className="menu-icon fa fa-calendar fa-lg mr-3"/>Republish metadata
                    </Dropdown.Item>}

                    <Dropdown.Item className="py-2" onClick={(event) => this.props.actions('unpublish-dataset', {id : this.props.dataset.id, type:this.props.type})}>
                      <span className="menu-icon fa fa-calendar-times-o fa-lg mr-3"/>Unpublish
                    </Dropdown.Item>

                    {/*this.props.metadata && published &&
                    <Dropdown.Item className="py-2" onClick={(event) => this.props.actions('flip-dataset-visibility', {id : this.props.dataset.id})}>
                      <span className="menu-icon fa fa-exchange fa-lg mr-3" />Flip visibility
                    </Dropdown.Item>*/}

                    {isLocal &&
                    <div>
                      {this.props.type === 'DATASET' && <Dropdown.Divider/>}

                      {this.props.type === 'DATASET' &&
                      <Dropdown.Item className="py-2"

                           onClick={(event) => this.props.actions('execute-all-mappings', {id : this.props.dataset.id})}>
                        <span className="menu-icon fa fa-play fa-lg mr-3" />Execute all
                      </Dropdown.Item>}

                      {this.props.type === 'DATASET' &&
                      <Dropdown.Item className="py-2"
                           disabled={!published}
                           onClick={(event) => this.props.actions('execute-all-mappings-and-republish-dataset', {id : this.props.dataset.id})}>
                        <span className="menu-icon fa fa-play fa-lg mr-3" />Execute all and republish
                      </Dropdown.Item>}
                    </div>}

                    <Dropdown.Divider/>

                    <Dropdown.Item className="py-2"
                                   disabled={!this.props.dataset.publishState.startsWith('PUBLISHED')}
                                   onClick={() => this.executeAction('view-dataset-description', {id: this.props.dataset.id})}>
                        <span className="menu-icon fa fa-info fa-lg mr-3" />View dataset description
                    </Dropdown.Item>

                    <Dropdown.Divider/>

                    <Dropdown.Item className="py-2"
                                   disabled={!this.props.dataset.publishState.startsWith('PUBLISHED')}
                                   // onClick={() => this.props.actions('create-dataset-distribution', {id: this.props.dataset.id})}>
                                   onClick={(event) => this.setState({ createDistributionModalShow: true})}>
                        <span className="menu-icon fa fa-cube fa-lg mr-3" />Create distribution...
                    </Dropdown.Item>

                    <Dropdown.Item className="py-2"
                                   disabled={this.props.dataset.createDistributionState != 'PREPARING_EXECUTION' && this.props.dataset.createDistributionState != 'EXECUTING'}
                                   // onClick={() => this.props.actions('create-dataset-distribution', {id: this.props.dataset.id})}>
                                   onClick={() => this.props.actions('stop-create-dataset-distribution', {id: this.props.dataset.id, type: this.props.type, scope: this.props.scope})}>
                        <span className="menu-icon fa fa-stop fa-lg mr-3" />Stop distribution creation
                    </Dropdown.Item>


                    <Dropdown.Item className="py-2"
                                   disabled={!this.props.dataset.publishState.startsWith('PUBLISHED') || this.props.dataset.createDistributionState !== 'EXECUTED'}
                                   onClick={() => this.props.actions('clear-dataset-distribution', {id: this.props.dataset.id, type: this.props.type})}>
                        <span className="menu-icon fa fa-times fa-lg mr-3" />Clear distribution
                    </Dropdown.Item>
                  </div>)}

                  {this.state.createDistributionModalShow &&
                  <CreateDistributionModal show={this.state.createDistributionModalShow}
                            dataset={this.props.dataset}
                            onOK={(classes, ttl, nt, serializationVocabulary, compress, license) => { this.props.actions('create-dataset-distribution', {id: this.props.dataset.id, type: this.props.type, classes:classes, ttl: ttl, nt: nt, serializationVocabulary, compress: compress, license }); this.setState({ createDistributionModalShow: false }) }}
                            onClose={() => this.setState({ createDistributionModalShow: false })}/>}

                  {this.state.newMappingModalShow &&
                  <NewMappingUploadModal show={this.state.newMappingModalShow}
                            type={this.state.newMappingType}
                            database={this.props.database}
                            mapping={this.state.newMappingModalMapping}
                            uuid={this.props.dataset.uuid}
                            templates={this.props.templates}
                            onOK={(id, name, json, data, parameters, templateId) => { this.executeAction('create-mapping', {datasetId: this.props.dataset.id, id: id, name: name, json: json, data: data, parameters: parameters, templateId: templateId}); this.setState({newMappingModalShow: false, newMappingModalMapping: null})} }
                            onClose={() => this.setState({ newMappingModalShow: false, newMappingType: undefined })}/>}

                  {this.state.newDataModalShow &&
                  <RDFDataFileUploadModal show={this.state.newDataModalShow}
                            file={this.state.newDataModalFile}
                            ref={node => (this.fileModal = node)}
                            onOK={(id, name, data) => this.executeAction('create-file', {datasetId: this.props.dataset.id, id: id, name: name, data:data})}
                            onClose={() => this.setState({ newDataModalShow: false, newDataModalFile:undefined })}/>}

                  {this.state.newSourceDataModalShow &&
                  <SourceDataFileUploadModal show={this.state.newSourceDataModalShow}
                            ref={node => (this.sourceDataFileModal = node)}
                            onOK={(id, data) => this.executeAction('add-attachment', {mappingid: this.state.newSourceDataModalMapping.id, instanceid: this.state.newSourceDataModalInstance ? this.state.newSourceDataModalInstance.id : null, data:data})}
                            onClose={() => this.setState({ newSourceDataModalShow: false })}/>}

                  {this.state.publishModalShow &&
                  <PublishModal show={this.state.publishModalShow} value={this.props.dataset} allowPublic={this.props.user.type === "EDITOR"}
                             visibility={this.props.visibility}
                             tripleStores={this.props.database.tripleStores}
                             onOK={(privat, tripleStore) => {this.props.actions('publish-dataset', {id: this.props.dataset.id, visibility: privat, type: this.props.type, tripleStore}); this.setState({ publishModalShow: false })}}
                             onClose={() => this.setState({ publishModalShow: false })}/>}

                  {this.state.indexModalShow &&
                  <IndexModal show={this.state.indexModalShow}
                            dataset={this.props.dataset}
                            indexEngines={this.props.database.indexEngines}
                            indices={this.props.indices}
                            onOK={(indexStructureId, indexIdentifier, indexEngine, indexStructures, keysMetadata) => {this.executeAction('new-index', {datasetId: this.props.dataset.id, indexStructureId, indexIdentifier, indexEngine, indexStructures, keysMetadata}); this.setState({ indexModalShow: false })}}
                            onClose={() => this.setState({ indexModalShow: false })}/>}

                  {this.state.D2RMLEditorModalShow &&
                  <D2RMLEditorModal show={this.state.D2RMLEditorModalShow}
                            mapping={this.state.D2RMLEditorMapping}
                            ttl={this.state.D2RMLEditorDocument}
                            database={this.props.database}
                            uuid={this.props.dataset.uuid}
                            state={this.state.D2RMLEditorState}
                            ref={node => (this.D2RMLEditorModal = node)}
                            onOK={(d2rml, parameters) => this.executeAction('update-d2rml', {mapping: this.state.D2RMLEditorMapping, d2rml:d2rml, parameters:parameters })}
                            onClose={() => this.setState({ D2RMLEditorModalShow: false })}/>}
                </Col>
              </Row>

              <Row>
                <Col>
                  <Row>
                    <Col md={2}>
                      <span>UUID</span>
                    </Col>
                    <Col md={9} className="datasetId">
                      {this.props.dataset.uuid}
                    </Col>
                  </Row>
                  {this.props.dataset.identifier &&
                  <Row className="pt-1">
                    <Col md={2}>
                      <span>Identifier</span>
                    </Col>
                    <Col md={9} className="datasetId">
                      {this.props.dataset.identifier}
                    </Col>
                  </Row>}
                  {this.props.dataset.remoteTripleStore &&
                  <Row className="pt-1">
                    <Col md={2}>
                      <span>SPARQL Enpoint</span>
                    </Col>
                    <Col md={9} className="datasetId">
                      {this.props.dataset.remoteTripleStore.sparqlEndpoint}
                    </Col>
                  </Row>}
                  <Row className="pt-1">
                    <Col md={2} className="align-self-center">
                      <span>State</span>
                    </Col>
                    <Col md={9} className="tablecenter">
                      <Row>
                        <Col>
                          <PublishableState value={this.props.dataset} />
                        </Col>
                      </Row>
                      <Row>
                        <Col>
                          <DistributableState value={this.props.dataset} />
                        </Col>
                      </Row>
                      {/*supportsIndexing && this.props.type === 'DATASET' &&
                      <Row>
                        <Col>
                          <IndexableState value={this.props.dataset}
                                          actions={(action, params) => this.props.actions(action, {id : this.props.dataset.id, ...params})}
                          />
                        </Col>
                      </Row>*/}
                      {this.props.type === 'DATASET' && this.props.scope === 'VOCABULARY' &&
                      <Row>
                        <Col>
                          <LoadableState value={this.props.dataset} />
                        </Col>
                      </Row>}
                    </Col>
                  </Row>
                </Col>
              </Row>
            </Container>

            <Row>
              <Col className="in-down">
                <span className='crimson-std fa fa-angle-down fa-lg'></span>
              </Col>
            </Row>

            {supportsIndexing && this.props.type === 'DATASET' &&
            <Container className={this.state.indexes && this.state.indexes.length > 0 ? "groupborder" : "groupborder-empty"}>
              <Row className={this.state.indexes && this.state.indexes.length > 0 ? "header" : "header-empty"}>
                <Col className="bold">
                  {/*{this.props.dataset.name}: */}
                  <span className="crimson-std">Indices</span>
                </Col>

                <Col className="mybutton" md={1}>
                  {actionsMenu(
                  <div>
                    <Dropdown.Item className="py-2" onClick={(event) => this.setState({ indexModalShow: true})}>
                      <span className="menu-icon fa fa-plus fa-lg mr-3"/>New index...
                    </Dropdown.Item>

                  </div>)}
                </Col>
              </Row>

              {/*
              <Row className="tableheader">
                <Col md={4}>
                  <span>File</span>
                </Col>
                <Col md={1} className="tablecenter">
                  <span>Type</span>
                </Col>
                <Col md={6} className="tablecenter">
                  <span>State</span>
                </Col>
                <Col md={1}/>
              </Row> */}

              {this.state.indexes.map((el, index) =>
              <Container key={index} className="mappingContainer">
                <Row key={index} className="mappingRow">
                  <Col md={4} className="">
                    <Row>
                      <Col>
                        <span className="abutton">{el.indexStructureIdentifier}</span><br/>
                        <span className="times">@{el.elasticConfiguration}</span>
                      </Col>
                    </Row>
  {/*                  <Row>
                      <Col>
                        <span>{el.fileName}</span>
                      </Col>
                    </Row> */}
                  </Col>

                  <Col md={1} className="tablecenter mappingtype">
                    <Form.Check  label="Default" checked={el.default} onClick={() => this.executeAction('change-index-default-state', { id: el.id })}/>
                  </Col>

                  <Col md={6} className="tablecenter">
                    <Row className="stategroup">
                      <Col>
                        <Row>
                          <Col>
                            <CreatableState value={el}/>
                          </Col>
                        </Row>
                      </Col>
                    </Row>
                  </Col>

                  <Col md={1} className="">
                    {actionsMenu(
                    <div>
                      {/*<Dropdown.Item className="py-2"
                                     onClick={() => this.executeAction('update-file', {file: el})}>
                        <span className="menu-icon fa fa-edit fa-lg mr-3" />Edit...
                      </Dropdown.Item>*/}

                      <Dropdown.Item className="py-2"
                                     disabled={el.createState && el.createState != 'NOT_CREATED'}
                                     onClick={() => this.executeAction('delete-index', {id: el.id})}>
                        <span className="menu-icon fa fa-trash-o fa-lg mr-3"/>Delete
                      </Dropdown.Item>

                      <Dropdown.Divider/>

                      <Dropdown.Item className="py-2"
                                     disabled={!published || el.createState == 'CREATING' || el.createState == 'CREATED'}
                                     onClick={() => this.executeAction('create-index', {id: el.id})}>
                            <span className="menu-icon fa fa-play-circle fa-lg mr-3" />Index
                      </Dropdown.Item>

                      <Dropdown.Item className="py-2"
                                       disabled={el.createState != 'CREATING'}
                                       onClick={() => this.executeAction('stop-create-index', {id: el.id})}>
                            <span className="menu-icon fa fa-stop fa-lg mr-3" />Stop indexing
                      </Dropdown.Item>

                      <Dropdown.Item  className="py-2"
                                      disabled={el.createState != 'CREATED'}
                                      onClick={(event) => this.executeAction('destroy-index', {id : el.id})}>
                        <span className="menu-icon fa fa-times-circle-o fa-lg mr-3" />Unindex
                      </Dropdown.Item>
                    </div>)}
                  </Col>

                </Row>
              </Container>)}

            </Container>}

            {this.props.type === 'CATALOG' &&
            <Row>
              <Col className="in-down">
                <span className='crimson-std fa fa-angle-down fa-lg'></span>
              </Col>
            </Row>}

            {this.props.type === 'CATALOG' &&
            <Container className={this.props.dataset.datasets && this.props.dataset.datasets.length > 0 ? "groupborder" : "groupborder-empty"}>
              <Row className={this.props.dataset.datasets && this.props.dataset.datasets.length > 0 ? "header" : "header-empty"}>
                <Col>
                  <span className="crimson-std">Members</span>
                </Col>

                <Col className="mybutton" md={1}>
                  {this.state.newCatalogLinkModalShow &&
                  <NewDatasetLinkModal show={this.state.newCatalogLinkModalShow}
                      datasets={this.props.datasets}
                      vocabularies={this.props.vocabularies}
                      alignments={this.props.alignments}
                      onOK={(id) => {this.addDataset(id, this.props.dataset.id); this.setState({ newCatalogLinkModalShow: false})}}
                      onClose={() => this.setState({ newCatalogLinkModalShow: false})}/>}

                  {actionsMenu(
                  <div>
                    {this.props.type === 'CATALOG' &&
                    <Dropdown.Item className="py-2"
                                   onClick={() => this.setState({ newCatalogLinkModalShow: true})}>
                      <span className="menu-icon fa fa-plus fa-lg mr-3" />Add dataset...
                    </Dropdown.Item>}
                  </div>)}

                </Col>

              </Row>
              <Row className="align-items-center">
                <Col>
                  {this.props.dataset.datasets.map((el, index) => (
                  <Row key={"assigned-dataset-" + index}>
                    <Col>
                      {el.name}
                    </Col>
                    <Col md="auto">
                      <Button type="button" className="deleteeditbutton mt-0" aria-label="Delete" onClick={() => this.removeDataset(el.id, this.props.dataset.id)}>
                        <span className="fa fa-times failed" title="Remove dataset" />
                      </Button>
                    </Col>
                  </Row>))}
                </Col>
              </Row>

            </Container>}

            {/*this.props.type === 'DATASET' && isLocal &&
            <Row>
              <Col className="in-down">
                <span className='crimson-std fa fa-angle-down fa-lg'></span>
              </Col>
            </Row>*/}

            {isLocal &&
            <Container className={this.state.mappings && this.state.mappings.filter(el => !el.template || el.type === 'CONTENT').length > 0 ? "groupborder" : "groupborder-empty"}>
              <Row className={this.state.mappings && this.state.mappings.filter(el => !el.template || el.type === 'CONTENT').length > 0 ? "header" : "header-empty"}>
                <Col className="bold">
                  {/*{this.props.dataset.name}: */}
                  <span className="crimson-std">Mappings</span>
                </Col>

                <Col className="mybutton" md={1}>
                  {actionsMenu(
                  <div>
                    {this.props.type === 'DATASET' &&
                    <Dropdown.Item className="py-2" onClick={(event) => this.setState({ newMappingModalShow: true, newMappingType: 'CONTENT', newMappingModalMapping: null})}>
                      <span className="menu-icon fa fa-plus fa-lg mr-3"/>Add data mapping...
                    </Dropdown.Item>}
                    {this.props.metadata &&
                    <Dropdown.Item className="py-2"
                                   disabled={this.props.dataset.template}
                                   onClick={(event) => this.setState({ newMappingModalShow: true, newMappingType: 'HEADER', newMappingModalMapping:null})}>
                      <span className="menu-icon fa fa-plus fa-lg mr-3"/>Add metadata mapping...
                    </Dropdown.Item>}

                  </div>)}
                </Col>
              </Row>
              {/*
              <Row className="tableheader">
                <Col md={4}>
                  <span>Mapping</span>
                </Col>
                <Col md={1} className="tablecenter">
                  <span>Type</span>
                </Col>
                <Col md={6} className="tablecenter">
                  <span>State</span>
                </Col>
                <Col md={1}></Col>
              </Row>*/}

              {this.state.mappings.map((el, index) => {
          if (el.template && el.type !== 'CONTENT') {
            return
          } else {
            var mappingUrl = API_BASE_URL + "/content/" + (this.props.dataset.identifier ? this.props.dataset.identifier : this.props.dataset.uuid) + "/mapping/" + el.uuid;
            return (
              el.parameters && el.parameters.length === 0 ?
              <Container key={index} className="mappingContainer">
                <Row className="mappingRow">
                  <Col md={4} className="">
                    {/*<span className="textbutton alink" onClick={() => this.selectMapping(index)}>{el.name}</span>*/}
                    <span className="mapping-name">{el.name}</span> <span className="mapping-name"><a href={mappingUrl} target="_blank" rel="noopener noreferrer"><span className="fa fa-link ml-2"/></a></span>
                  </Col>

                  <Col md={1} className="tablecenter mappingtype">
                    <span>{el.type === "HEADER" ? "META" : (el.type === "CONTENT" ? "DATA" : "PRFX")}</span>
                  </Col>

                  {!this.isPrefixMapping(el) &&
                  <Col md={6} className="tablecenter">
                    <Row className="stategroup">
                      <Col>
                        <Row>
                          <Col>
                            <ExecutableState value={el.instances[0]}/>
                          </Col>
                        </Row>
                        <Row>
                          <Col>
                            <PublishableState value={el.instances[0]}/>
                          </Col>
                        </Row>
                      </Col>
                    </Row>
                  </Col>}

                  {!this.isPrefixMapping(el) &&
                  <Col md={1} className="last-action-column">
                    {actionsMenu(
                    <div>
                      <Dropdown.Item className="py-2" onClick={() => this.executeAction('update-mapping', {mapping: el})}>
                        <span className="menu-icon fa fa-edit fa-lg mr-3" />Edit...
                      </Dropdown.Item>
                      <Dropdown.Item className="py-2" onClick={() => this.executeAction('delete-mapping', {id: el.id})}>
                        <span className="menu-icon fa fa-trash-o fa-lg mr-3"/>Delete
                      </Dropdown.Item >

                      <Dropdown.Divider/>

                      <Dropdown.Item className="py-2" onClick={() => this.executeAction('edit-d2rml', {mapping: el})}>
                        <span className="menu-icon fa fa-wrench fa-lg mr-3" />Edit D2RML document...
                      </Dropdown.Item>

                      <Dropdown.Item className="py-2" onClick={() => this.setState({ newSourceDataModalShow: true, newSourceDataModalMapping : el, newSourceDataModalInstance: null})}>
                        <span className="menu-icon fa fa-paperclip fa-lg mr-3"/>Attach source data file...
                      </Dropdown.Item >

                      <Dropdown.Divider/>

                      <Dropdown.Item className="py-2"
                                     disabled={el.instances[0].executeState === "EXECUTING"}
                                     onClick={() => this.executeAction('execute-mapping', {id: el.id})}>
                        <span className="menu-icon fa fa-play-circle fa-lg mr-3"/>Execute
                      </Dropdown.Item>

                      <Dropdown.Item className="py-2"
                                     disabled={el.instances[0].executeState !== "EXECUTING"}
                                     onClick={() => this.executeAction('stop-mapping', { id: el.id })}>
                        <span className="menu-icon fa fa-stop fa-lg mr-3"></span>Stop Execution
                      </Dropdown.Item>

                      <Dropdown.Divider/>

                      <Dropdown.Item className="py-2"
                                     disabled={el.instances[0].executeState !== 'EXECUTED' || (el.instances[0].publishedFromCurrentFileSystem && el.instances[0].publishState === 'PUBLISHED' && !el.instances[0].newExecution)}
                                     onClick={() => this.executeAction('preview-last-mapping-execution', {id: el.id})}>
                        <span className="menu-icon fa fa-eye fa-lg mr-3"/>Preview last execution
                      </Dropdown.Item>

                      <Dropdown.Item className="py-2"
                                     disabled={el.instances[0].executeState !== 'EXECUTED' || (el.instances[0].publishedFromCurrentFileSystem && el.instances[0].publishState === 'PUBLISHED' && !el.instances[0].newExecution)}
                                     onClick={() => this.executeAction('download-last-mapping-execution', {id: el.id})}>
                        <span className="menu-icon fa fa-download fa-lg mr-3"/>Download last execution
                      </Dropdown.Item>


                      <Dropdown.Item className="py-2"
                                     disabled={el.instances[0].executeState !== 'EXECUTED' || (el.instances[0].publishedFromCurrentFileSystem && el.instances[0].publishState === 'PUBLISHED' && !el.instances[0].newExecution)}
                                     onClick={() => this.executeAction('clear-mapping-execution', {id: el.id})}>
                        <span className="menu-icon fa fa-times fa-lg mr-3" />Clear last execution
                      </Dropdown.Item>

                      <Dropdown.Divider/>

                      <Dropdown.Item className="py-2"
                                     disabled={!el.instances[0].publishedFromCurrentFileSystem}
                                     onClick={() => this.executeAction('preview-published-mapping-execution', {id: el.id})}>
                                     <span className="menu-icon fa fa-eye fa-lg mr-3"/>Preview published execution
                      </Dropdown.Item>

                      <Dropdown.Item className="py-2"
                                     disabled={!el.instances[0].publishedFromCurrentFileSystem}
                                     onClick={() => this.executeAction('download-published-mapping-execution', {id: el.id})}>
                        <span className="menu-icon fa fa-download fa-lg mr-3"/>Download published execution
                      </Dropdown.Item>

                      {/*<Dropdown.Item className="py-2"
                          onClick={() => this.executeAction('unpublish-mapping', {id: el.id})}><span className="fa fa-plus"></span>
                      </Dropdown.Item>*/}

                    </div>)}
                  </Col>}
                </Row>
                {el.dataFiles && el.dataFiles.length > 0 &&
                <Row className="attachements-row">
                  <Col>
                    {el.dataFiles.map((file, index) =>
                    <Row key={index} className="attachement-row">
                      <Col className="">
                        {file}
                      </Col>
                      <Col md={1} className="last-action-column">
                        <DropdownButton size="sm"  title={<span title="Actions" className='fa fa-bars'></span>} className="actions">

                          <Dropdown.Item className="py-2" onClick={() => this.executeAction('delete-attachment', {mappingid: el.id, instanceid: null, filename:file})}>
                            <span className="menu-icon fa fa-edit fa-lg mr-3" />Delete...
                          </Dropdown.Item>

                        </DropdownButton>
                      </Col>
                    </Row>)}
                  </Col>
                </Row>}
              </Container>
              :
              <Row key={index} className="mappingRowGroup">
                <Col className="mappingRowGroupColumn">
                  <Row key={index} className="mappingRowGroupHeader">
                    <Col md={4} className="">
                      {/*<span className="alink textbutton" onClick={() => this.selectMapping(index)}>{el.name}</span>*/}
                      <span className="mapping-name">{el.name}</span> <span className="mapping-name"><a href={mappingUrl} target="_blank" rel="noopener noreferrer"><span className="fa fa-link ml-2"/></a></span>
                    </Col>

                    <Col md={1} className="tablecenter mappingtype">
                      <span>{el.type === "HEADER" ? "META" : "DATA"}</span>
                      {el.template &&
                        <div className="data-template">TEMPLATE</div>}
                    </Col>

                    <Col md="6"/>

                    {!el.template &&
                    <Col md={1} className="last-action-column">
                      {actionsMenu(
                      <div>
                        <Dropdown.Item className="py-2" onClick={() => this.executeAction('update-mapping', {mapping: el})}>
                          <span className="menu-icon fa fa-edit fa-lg mr-3" />Edit...
                        </Dropdown.Item>

                        <Dropdown.Item className="py-2" onClick={() => this.executeAction('delete-mapping', {id: el.id})}>
                          <span className="menu-icon fa fa-trash-o fa-lg mr-3"/>Delete
                        </Dropdown.Item >

                        <Dropdown.Divider/>

                        <Dropdown.Item className="py-2" onClick={() => this.executeAction('add-parameter-binding', {id: el.id, index: index})}>
                          <span className="menu-icon fa fa-plus fa-lg mr-3"/>Add instance...
                        </Dropdown.Item >

                        <Dropdown.Divider/>

                        <Dropdown.Item className="py-2" onClick={() => this.executeAction('edit-d2rml', {mapping: el})}>
                          <span className="menu-icon fa fa-wrench fa-lg mr-3" />Edit D2RML document...
                        </Dropdown.Item>

                        <Dropdown.Item className="py-2" onClick={() => this.setState({ newSourceDataModalShow: true, newSourceDataModalMapping : el, newSourceDataModalInstance: null})}>
                          <span className="menu-icon fa fa-paperclip fa-lg mr-3"/>Attach source data file...
                        </Dropdown.Item >

                      </div>)}
                    </Col>}

                    {el.template &&
                    <Col md={1} className="last-action-column">
                      <Button type="button" className="menubutton" onClick={() => this.executeAction('add-parameter-binding', { id: el.id, index: index })}>
                        <span className="fa fa-plus fa-sm mr-2" />
                      </Button>
                    </Col>}
                  </Row>

                  {el.instances.map((inst, iindex) =>
                    <Row key={iindex}>
                      <Col>
                        <Container key={iindex} className="mappingInstanceRow">
                          <Row className="mappingInstanceRowData">

                            <Col md={5} className="instance-parameters-column">
                              {inst.binding.map((binding, bindex) =>
                              <Row key={bindex} className="instance-parameter">
                                <Col>
                                  <span className="parameter">{binding.name}</span>: <span className="parametervalue mb-0">{binding.value}</span>
                                </Col>
                              </Row>)}
                            </Col>

                            <Col md={6} className="tablecenter">
                              <Row className="stategroup">
                                <Col>
                                  <Row>
                                    <Col>
                                      <ExecutableState value={inst}/>
                                    </Col>
                                  </Row>
                                  <Row>
                                    <Col>
                                      <PublishableState value={inst}/>
                                    </Col>
                                  </Row>
                                </Col>
                              </Row>
                            </Col>

                            <Col md={1} className="">
                              {actionsMenu(
                              <div>
                                  {/* <Dropdown.Item onClick={() => this.executeAction('update-mapping', {mapping: el})}>Edit</Dropdown.Item>*/}
                                  <Dropdown.Item className="py-2"
                                                 onClick={() => this.executeAction('update-parameter-binding', {id: el.id, instance: inst, mappingIndex:index, index:iindex})}>
                                    <span className="menu-icon fa fa-edit fa-lg mr-3"/>Edit
                                  </Dropdown.Item>

                                <Dropdown.Item className="py-2"
                                               onClick={() => this.executeAction('delete-parameter-binding', {id: el.id, instanceId: inst.id, index:iindex})}>
                                  <span className="menu-icon fa fa-trash-o fa-lg mr-3"/>Delete
                                </Dropdown.Item>

                                <Dropdown.Divider/>

                                <Dropdown.Item className="py-2" onClick={() => this.setState({ newSourceDataModalShow: true, newSourceDataModalMapping : el, newSourceDataModalInstance: inst})}>
                                  <span className="menu-icon fa fa-paperclip fa-lg mr-3"/>Attach source data file...
                                </Dropdown.Item >

                                <Dropdown.Divider/>

                                <Dropdown.Item className="py-2"
                                               disabled={inst.executeState === "EXECUTING"}
                                               onClick={() => this.executeAction('execute-mapping', {id: el.id, instanceId: inst.id})}>
                                  <span className="menu-icon fa fa-play-circle fa-lg mr-3"/>Execute
                                </Dropdown.Item>

                                <Dropdown.Item className="py-2"
                                               disabled={inst.executeState !== "EXECUTING"}
                                               onClick={() => this.executeAction('stop-mapping', {id: el.id, instanceId: inst.id})}>
                                  <span className="menu-icon fa fa-stop fa-lg mr-3"></span>Stop Execution
                                </Dropdown.Item>

                                <Dropdown.Divider/>

                                <Dropdown.Item className="py-2"
                                              disabled={inst.executeState !== 'EXECUTED' || (inst.publishedFromCurrentFileSystem && inst.publishState === 'PUBLISHED' && !inst.newExecution)}
                                              onClick={() => this.executeAction('preview-last-mapping-execution', {id: el.id, instanceId: inst.id})}>
                                  <span className="menu-icon fa fa-eye fa-lg mr-3"/>Preview last execution
                                </Dropdown.Item>

                                <Dropdown.Item className="py-2"
                                              disabled={inst.executeState !== 'EXECUTED' || (inst.publishedFromCurrentFileSystem && inst.publishState === 'PUBLISHED' && !inst.newExecution)}
                                              onClick={() => this.executeAction('download-last-mapping-execution', {id: el.id, instanceId: inst.id})}>
                                  <span className="menu-icon fa fa-download fa-lg mr-3"/>Download last execution
                                </Dropdown.Item>

                                <Dropdown.Item className="py-2"
                                              disabled={inst.executeState !== 'EXECUTED' || (inst.publishedFromCurrentFileSystem && inst.publishState === 'PUBLISHED' && !inst.newExecution)}
                                              onClick={() => this.executeAction('clear-mapping-execution', {id: el.id, instanceId: inst.id})}>
                                  <span className="menu-icon fa fa-times fa-lg mr-3" />Clear last execution
                                </Dropdown.Item>

                                <Dropdown.Divider/>

                                <Dropdown.Item className="py-2"
                                              disabled={!inst.publishedFromCurrentFileSystem}
                                              onClick={() => this.executeAction('preview-published-mapping-execution', {id: el.id, instanceId: inst.id})}>
                                  <span className="menu-icon fa fa-eye fa-lg mr-3"/>Preview published execution
                                </Dropdown.Item>

                                <Dropdown.Item className="py-2"
                                              disabled={!inst.publishedFromCurrentFileSystem}
                                              onClick={() => this.executeAction('download-published-mapping-execution', {id: el.id, instanceId: inst.id})}>
                                  <span className="menu-icon fa fa-download fa-lg mr-3"/>Download published execution
                                </Dropdown.Item>

                              </div>)}
                            </Col>
                          </Row>

                          {inst.dataFiles && inst.dataFiles.length > 0 &&
                          <Row className="attachements-row">
                            <Col>
                              {inst.dataFiles.map((file, findex) =>
                              <Row key={findex} className="attachement-row">
                                <Col className="">
                                  {file}
                                </Col>
                                <Col md={1} className="last-action-column">
                                  {actionsMenu(
                                  <div>
                                    <Dropdown.Item className="py-2" onClick={() => this.executeAction('delete-attachment', {mappingid: el.id, instanceid: inst.id, filename:file})}>
                                      <span className="menu-icon fa fa-edit fa-lg mr-3" />Delete...
                                    </Dropdown.Item>

                                  </div>)}
                                </Col>
                              </Row>)}
                            </Col>
                          </Row>}
                      </Container>
                    </Col>
                  </Row>
                )}

                </Col>
              </Row>
            )}})}
            </Container>}

            {this.props.type === 'DATASET' && isLocal &&
            <Container className={this.state.files && this.state.files.length > 0 ? "groupborder" : "groupborder-empty"}>
              <Row className={this.state.files && this.state.files.length > 0 ? "header" : "header-empty"}>
                <Col className="bold">
                  {/*{this.props.dataset.name}: */}
                  <span className="crimson-std">RDF Data Files</span>
                </Col>

                <Col className="mybutton" md={1}>
                  {actionsMenu(
                  <div>
                    <Dropdown.Item className="py-2" onClick={(event) => this.setState({ newDataModalShow: true, newDataModalFile: undefined})}>
                      <span className="menu-icon fa fa-plus fa-lg mr-3"/>Add data file...
                    </Dropdown.Item>

                  </div>)}
                </Col>
              </Row>

              {/*
              <Row className="tableheader">
                <Col md={4}>
                  <span>File</span>
                </Col>
                <Col md={1} className="tablecenter">
                  <span>Type</span>
                </Col>
                <Col md={6} className="tablecenter">
                  <span>State</span>
                </Col>
                <Col md={1}/>
              </Row> */}

              {this.state.files.map((el, index) =>
              <Row key={index} className="mappingRow">
                <Col md={4} className="">
                  <Row>
                    <Col>
                      <span className="abutton">{el.name}</span>
                    </Col>
                  </Row>
{/*                  <Row>
                    <Col>
                      <span>{el.fileName}</span>
                    </Col>
                  </Row> */}
                </Col>

                <Col md={1} className="tablecenter mappingtype">
                  <span>DATA</span>
                </Col>

                <Col md={6} className="tablecenter">
                  <Row className="stategroup">
                    <Col>
                      <Row>
                        <Col>
                          <ExecutableState value={el}/>
                        </Col>
                      </Row>
                      <Row>
                        <Col>
                          <PublishableState value={el}/>
                        </Col>
                      </Row>
                    </Col>
                  </Row>
                </Col>

                <Col md={1} className="">
                  {actionsMenu(
                  <div>
                    <Dropdown.Item className="py-2"
                                   onClick={() => this.executeAction('update-file', {file: el})}>
                      <span className="menu-icon fa fa-edit fa-lg mr-3" />Edit...
                    </Dropdown.Item>

                    <Dropdown.Item className="py-2"
                                   onClick={() => this.executeAction('delete-file', {id: el.id})}>
                      <span className="menu-icon fa fa-trash-o fa-lg mr-3"/>Delete
                    </Dropdown.Item>

                    <Dropdown.Divider/>

                    <Dropdown.Item className="py-2"
                                   disabled={el.publishState === 'PUBLISHED' && !el.newExecution}
                                   onClick={() => this.executeAction('preview-last-file', {id: el.id})}>
                      <span className="menu-icon fa fa-eye fa-lg mr-3"/>Preview file
                    </Dropdown.Item>

                    <Dropdown.Item className="py-2"
                                   disabled={el.publishState === 'PUBLISHED' && !el.newExecution}
                                   onClick={() => this.executeAction('download-last-file', {id: el.id})}>
                      <span className="menu-icon fa fa-download fa-lg mr-3"/>Download file
                    </Dropdown.Item>

                    <Dropdown.Divider/>

                    <Dropdown.Item className="py-2"
                                   disabled={!el.publishedFromCurrentFileSystem}
                                   onClick={() => this.executeAction('preview-published-file', {id: el.id})}>
                      <span className="menu-icon fa fa-eye fa-lg mr-3"/>Preview published file
                    </Dropdown.Item>

                    <Dropdown.Item className="py-2"
                                   disabled={!el.publishedFromCurrentFileSystem}
                                   onClick={() => this.executeAction('download-published-file', {id: el.id})}>
                      <span className="menu-icon fa fa-download fa-lg mr-3"/>Download published file
                    </Dropdown.Item>

                  </div>)}
                </Col>

              </Row>)}
            </Container>}

            {/*currentMapping &&
            <Container className="groupborder">
              <D2RMLEditor value={currentMapping}
                   fixedSubject={currentMapping.type==='HEADER'?true:false} delete={currentMapping.parameters.length === 0 || currentMapping.instances.length === 0}
                   actions={(action, value, files) => this.executeAction(action, value, files)}/>
            </Container>*/}



            <Container className={this.state.userTasks && this.state.userTasks.length > 0 ? "groupborder" : "groupborder-empty"}>
              <Row className={this.state.userTasks && this.state.userTasks.length > 0 ? "header" : "header-empty"}>
                <Col className="bold">
                  {/*{this.props.dataset.name}: */}
                  <span className="crimson-std">User Tasks</span>
                </Col>

                <Col className="mybutton" md={1}>
                  {actionsMenu(
                  <div>
                    <Dropdown.Item className="py-2" onClick={(event) => this.setState({ newUserTaskModalShow: true, newUserTaskModalUserTask: null})}>
                      <span className="menu-icon fa fa-plus fa-lg mr-3"/>New user task...
                    </Dropdown.Item>

                  </div>)}
                </Col>
              </Row>

              {this.state.userTasks.map((el, index) =>
              <Container key={index} className="mappingContainer">
                <Row key={index} className="mappingRow">
                  <Col md={4} className="">
                    <Row>
                      <Col>
                        <span className="abutton">{el.name}</span>
                      </Col>
                    </Row>
                  </Col>

                  <Col md={1} className="tablecenter mappingtype">
                    {el.scheduled &&  <div><span className="schedule-icon fa fa-calendar fa-lg mr-3" /><br/><span className="cron-expression">{el.cronExpression}</span></div>}
                    {!el.scheduled &&   <span className="schedule-icon fa fa-calendar-times-o fa-lg mr-3" />}
                  </Col>

                  <Col md={6} className="tablecenter">
                    <Row className="stategroup">
                      <Col>
                        <Row>
                          <Col>
                            <RunnableState value={el}/>
                          </Col>
                        </Row>
                      </Col>
                    </Row>
                  </Col>

                  <Col md={1} className="">
                    {actionsMenu(
                    <div>
                      <Dropdown.Item className="py-2"
                                     onClick={() => this.executeAction('update-user-task', {userTask: el})}>
                        <span className="menu-icon fa fa-edit fa-lg mr-3" />Edit...
                      </Dropdown.Item>

                      <Dropdown.Divider/>

                      <Dropdown.Item className="py-2"
                                     onClick={() => this.executeAction('run-user-task', {id: el.id})}>
                        <span className="menu-icon fa fa-play fa-lg mr-3" />Run
                      </Dropdown.Item>

                      <Dropdown.Divider/>

                      <Dropdown.Item className="py-2"
                                     onClick={() => this.executeAction('schedule-user-task', {id: el.id})}>
                        <span className="menu-icon fa fa-calendar fa-lg mr-3" />Schedule
                      </Dropdown.Item>

                      <Dropdown.Item className="py-2"
                                     onClick={() => this.executeAction('unschedule-user-task', {id: el.id})}>
                        <span className="menu-icon fa fa-calendar-times-o fa-lg mr-3" />Unschedule
                      </Dropdown.Item>

                   </div>)}

                  </Col>

                </Row>
              </Container>)}

              {this.state.newUserTaskModalShow &&
              <UserTaskModal show={this.state.newUserTaskModalShow}
                        userTask={this.state.newUserTaskModalUserTask}
                        onOK={(id, name, tasks, cronExpression) => { this.executeAction('create-user-task', {datasetId: this.props.dataset.id, id, name, tasks, cronExpression }); this.setState({newUserTaskModalShow: false, newUserTaskModalUserTask: null})} }
                        onClose={() => this.setState({ newUserTaskModalShow: false, newUserTaskModalUserTask: undefined })}/>}


            </Container>
          </Col>
        </Row>

        {this.state.newBindingModalShow &&
        <NewBindingModal show={this.state.newBindingModalShow}
                      mappingId={this.state.mappingId}
                      instance={this.state.instance}
                      parameters={this.state.parameters}
                     onOK={(mappingId, instanceId, params)=> this.executeAction('create-parameter-binding', {mappingId: mappingId, instanceId: instanceId, parameters: params})}
                     onClose={() => this.setState({ newBindingModalShow: false })}/>
        }

        {this.state.deleteModalShow &&
        <DeleteModal show={this.state.deleteModalShow}
                     command={this.state.deleteModalCommand}
                     params={this.state.deleteModalParams}
                     actions={(choice, command, params) => { this.setState( {deleteModalShow:false }); return (choice === 'ok' ? this.executeAction(command + '-ok', params): null)} }/>}

        {this.state.resultsShow &&
        <ResultsModal show={this.state.resultsShow}
                      state={this.state.resultsState}
                      execution={this.state.lastExecution}
                      onClose={() => this.setState({resultsShow:false})}/>}

      </Container>
    );
  }
}

export default DatasetEditor;
