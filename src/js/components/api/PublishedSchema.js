import React, { Component } from "react";
import Container from "react-bootstrap/Container";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import Dropdown from "react-bootstrap/Dropdown";
import DropdownButton from "react-bootstrap/DropdownButton";
import Button from "react-bootstrap/Button";
import Collapse from "react-bootstrap/Collapse";
import { getDatasetSchema, getDatasetPropertyValues, getDatasetItemsByPropertyValue, downloadDatasetPropertyValues  } from '../../utils/DataAPI';
import { getAnnotators, getAnnotatorsByUser, publishAnnotator, unpublishAnnotator, updateAnnotator, previewAnnotator } from '../../utils/AnnotatorAPI';
import { getEmbeddersByUser } from '../../utils/EmbedderAPI';
import { resolveJsonLdUri, objectToArray } from '../../utils/functions';
import PropertyValuesModal from "./modals/PropertyValuesModal.js";
import SchemaProperty from "./SchemaProperty.js";
import SchemaClass from "./SchemaClass.js";
import ResultsModal from "./modals/ResultsModal.js";
import ScoreDistributionModal from "./modals/ScoreDistributionModal.js";
import AnnotationValuesModal from "./modals/AnnotationValuesModal.js";
import ValidationModal from "./modals/ValidationModal.js";
import VocabularyValuesModal from "./modals/VocabularyValuesModal.js";
import DownloadAnnotationsModal from "./modals/DownloadAnnotationsModal.js";
//import IndexStructureModal from "./modals/IndexStructureModal.js";
//import IndexableState from "./IndexableState.js";
import DeleteModal from "./modals/DeleteModal.js";
import EmbedderModal from "./modals/EmbedderModal.js";
import ExecutableState from "./ExecutableState.js";
import PublishableState from "./PublishableState.js";

import { throwToast, pathEquals } from '../../utils/UIUtils';

import { createAnnotator, deleteAnnotator, prepareAnnotator, executeAnnotator, stopAnnotator, previewLastAnnotatorExecution, previewPublishedAnnotatorExecution, downloadLastAnnotatorExecution, downloadPublishedAnnotatorExecution, clearAnnotatorExecution } from '../../utils/AnnotatorAPI.js'
import { createEmbedder, deleteEmbedder, executeEmbedder, stopEmbedder, previewLastEmbedderExecution, previewPublishedEmbedderExecution, downloadLastEmbedderExecution, downloadPublishedEmbedderExecution, publishEmbedder, unpublishEmbedder } from '../../utils/EmbedderAPI.js'
import { getValidationProgress } from '../../utils/PagedAnnotationValidationAPI.js'
import { commitAnnotationEdits } from '../../utils/AnnotationAPI.js'
import { downloadAnnotationValues, viewValuesAnnotations, viewAnnotationEditsExecution, scoreValidationDistribution, getAnnotationEditGroups, getAnnotationEditGroupsByUser, setAnnotationEditGroupAutoexportable } from '../../utils/AnnotationEditGroupAPI.js'
import { stopPagedAnnotationValidation, resumePagedAnnotationValidation, viewAnnotationValidation, commitAnnotationValidationPage, createPagedAnnotationValidation, updatePagedAnnotationValidation, executePagedAnnotationValidation, clearPagedAnnotationValidationExecution, previewPagedAnnotationValidationExecution, previewPublishedPagedAnnotationValidationExecution, downloadPagedAnnotationValidationExecution, downloadPublishedPagedAnnotationValidationExecution, publishPagedAnnotationValidation, unpublishPagedAnnotationValidation } from '../../utils/PagedAnnotationValidationAPI.js'
import { createFilterAnnotationValidation, updateFilterAnnotationValidation, deleteFilterAnnotationValidation, executeFilterAnnotationValidation, clearFilterAnnotationValidationExecution, previewFilterAnnotationValidationExecution, previewPublishedFilterAnnotationValidationExecution, downloadFilterAnnotationValidationExecution, downloadPublishedFilterAnnotationValidationExecution, publishFilterAnnotationValidation, unpublishFilterAnnotationValidation  } from '../../utils/FilterAnnotationValidationAPI.js'
import { createVocabularizer, deleteVocabularizer, executeVocabularizer, cleanupVocabularizer, vocabularyVocabularizer, publishVocabularizer, unpublishVocabularizer, viewVocabularizerExecution, getVocabulizers, indexVocabularizer, unindexVocabularizer } from '../../utils/VocabularizerAPI.js'
// import { index, unindex, getIndexes } from '../../utils/IndexAPI.js'
import { datasetAnnotationsStatistics } from '../../utils/DatasetUtils.js'
import { actionsMenu, toggleBoxColumn, sortByField, MessageQueue } from '../../utils/UIUtils';

import { Localizer } from '../../config/localizer.js'
import { filterByLanguage } from "../../utils/functions.js";
import BarLoader from "react-spinners/BarLoader";
import { API_BASE_URL  } from '../../constants/index.js';

export class PublishedSchema extends Component {
  constructor(props) {
    super(props);

    this.state = {
      schema: [],
      topParents: [],
      schemaState: { loaded: false, loading:false, failed:false },

      annotators: [],
      annotationEditGroups: [],
      vocabularizers: [],
      valitations: [],
      indexes: {},

      embedders: [],

      valuesModalShow: false,
      valuesModalControls: true,
      values: [],
      valuesEndpoint: null,
      valuesState: { loaded: false, loading:false, failed:false },

      annotationsModalShow: false,
      annotations: null,
      annotationsState: { loaded: false, loading:false, failed:false },

      embeddingsModalShow: false,
      embeddings: null,
      embeddingsState: { loaded: false, loading:false, failed:false },

      annotationsEditModalShow: false,
      validationModalShow: false,
      annotationsEdit: [],
      annotationsEditState: { loaded: false, loading:false, failed:false },
      annotationsEditOnProperty: null,
      annotationsEditOnPropertyPath: null,
      // annotationsEditGroup: null,
      // annotationsEditAsProperty: null,
      editGroupId: null,
      annotationsEditMode: "ALL",
      annotationsEditEnabled: false,

      vocabularyEditModalShow: false,
      vocabulary: new Map(),

      annotationEditExecutionModalShow: false,
      annotationEditExecutions: [],
      annotationEditExecutionsState: { loaded: false, loading:false, failed:false },

      annotationValidations: {},
      annotationValidationsModalShow: false,
      annotationValidationsState: { loaded: false, loading:false, failed:false },

      validationProgress: {},

      annotationsDownloadModalShow:false,
      annotationsDownloadId: null,

      indexModalOpen: false,
    };

    this.messageQueueMap = new Map();

  }

  handlePublishMessage(field, message) {
      return {
        [field]: this.state[field].map(el => {
          if (el.id !== message.id) {
             return el
          } else {
            var obj = {...el, [message.type + 'State']: message.state }
            delete obj[message.type + 'Messages']

            obj = message.startedAt ? {...obj, [message.type + 'StartedAt']: message.startedAt } : obj
            obj = message.completedAt ? {...obj, [message.type + 'CompletedAt']: message.completedAt } : obj
            obj = message.messages ? {...obj, [message.type + 'Messages']: message.messages } : obj

            return obj
          }
       })
      }
    }

  handleExecuteMessage(field, message) {
    return {
      [field]: this.state[field].map(el => {
        if (el.id !== message.id) {
           return el
        } else {
          var obj = {...el, [message.type + 'State']: message.state }
          delete obj[message.type + 'Messages']
          delete obj[message.type + 'Count']
          delete obj.d2rmlExecution

          obj = message.d2rmlExecution ? {...obj, d2rmlExecution: message.d2rmlExecution } : obj
          obj = message.startedAt ? {...obj, [message.type + 'StartedAt']: message.startedAt } : obj
          obj = message.completedAt ? {...obj, [message.type + 'CompletedAt']: message.completedAt } : obj
          obj = message.messages ? {...obj, [message.type + 'Messages']: message.messages } : obj
          obj = message.count ? {...obj, [message.type + 'Count']: message.count } : obj

          if (message.state == 'EXECUTED') {
            obj = {...obj, newExecution: true }
          }

          return obj
        }
     })
    }
  }

  handlePagedAnnotationOrFilteredAnnotationValidationsMessage(field, message) {
    // console.log("UPDATING " + message.order)
    return {
      annotationEditGroups: this.state.annotationEditGroups.map(el => {
        if (el.id !== message.instanceId) {
          return el
        } else {
          return {
            ...el, [field]: el[field].map(pav => {
              if (pav.id !== message.id) {
                return pav
              } else {
                var obj = {...pav, [message.type +'State']: message.state, count: message.count }
                delete obj[message.type + 'Messages']
                delete obj[message.type + 'Count']

                obj = message.startedAt ? {...obj, [message.type + 'StartedAt']: message.startedAt } : obj
                obj = message.completedAt ? {...obj, [message.type + 'CompletedAt']: message.completedAt } : obj
                obj = message.messages ? {...obj, [message.type + 'Messages']: message.messages } : obj
                obj = message.count ? {...obj, [message.type + 'Count']: message.count } : obj

                if (message.state == 'EXECUTED') {
                  obj = {...obj, newExecution: true }
                }

                return obj
              }
            })
          }
        }
      })
    }
  }

  handleServerEvent(type, message) {
    // console.log(type);
    // console.log(message);
    if (type === 'filter_annotation_validation' || type === 'paged_annotation_validation') {
      var field;
      if (type === 'filter_annotation_validation') {
        field = 'filterAnnotationValidations'
      } else if (type === 'paged_annotation_validation') {
        field = 'pagedAnnotationValidations'
      }

      var id = message.id + ":" + message.type

      var queue = this.messageQueueMap.get(id)
      if (!queue) {
        queue = new MessageQueue(this, (message) => this.handlePagedAnnotationOrFilteredAnnotationValidationsMessage(field, message))
        this.messageQueueMap.set(id, queue)
      }

      queue.push(message)

      // if (message.type==='publish' || message.type === 'execute') {
      //   getAnnotationEditGroupsByUser(this.props.schemaDataset['@id'])
      //   .then(json => {this.setState({ annotationEditGroups: json })})
      // }

    } else if (type === 'annotator' || type === 'embedder') {

      if (message.type === 'publish' || message.type === "execute") {
        var field = type + 's'
        var id = message.id + ":" + message.type

        var queue = this.messageQueueMap.get(id)
        if (!queue) {
          if (message.type === 'publish') {
            queue = new MessageQueue(this, (message) => this.handlePublishMessage(field, message))
          } else if (message.type === 'execute') {
            queue = new MessageQueue(this, (message) => this.handleExecuteMessage(field, message))
          }
          this.messageQueueMap.set(id, queue)
        }

        queue.push(message)
      }

    // } else if (type === 'filter_annotation_validation') {
    //   this.setState({ annotationEditGroups: this.state.annotationEditGroups.map(el =>
    //       el.id !== message.id ?
    //          el :
    //         { ...el, editGroup: { ...el.editGroup, [message.type + 'State']: message.state, [message.type + 'StartedAt']: message.startedAt, [message.type + 'CompletedAt']: message.completedAt}}
    //   )});

    // } else if (type === 'index') {
    //   if (this.props.schemaDataset['@id'] === this.props.database.resourcePrefix + message.id) { // id was 'http://sw.islab.ntua.gr/semaspace/resource/dataset/'
    //     this.setState({ indexes: { [message.type + 'State']: message.state, [message.type + 'StartedAt']: message.startedAt, [message.type + 'CompletedAt']: message.completedAt} })
    //   }
    }
  }


componentWillReceiveProps(props) {
  if (props.schemaDataset === null) {
    this.setState({ schema: [], annotators: [] })
  }
  else if (!this.props.schemaDataset || (this.props.schemaDataset['@id'] !== props.schemaDataset['@id'])) {
    this.setState({ schemaState: { loaded: false, loading: true, failed: false}},
      () =>
      getDatasetSchema(props.schemaDataset['@id'], props.mode).then(response => {
        if(!response.hasOwnProperty('@graph')){
          this.setState({ topParents: [], schemaState: {loaded: true, loading: false, failed: false}})
          return;
        }

        var keys = {} ;
        let graph = response['@graph'];
        let context = response['@context'];

        let top = null;
       for(let i = graph.length - 1; i >= 0; i--) {
         var obj = graph[i];

         for (const [key, value] of Object.entries(obj)) {

           if (key === '@id') {
             let resolvedValue = resolveJsonLdUri(value, context)
             if (resolvedValue === props.schemaDataset['@id']) {
               top = obj;
             }
           } if (key.startsWith('@')) {
             continue;
           }

            let resolvedKey = resolveJsonLdUri(key, context);

            if (resolvedKey === 'http://rdfs.org/ns/void#propertyPartition') {
              keys.propertyPartitionKey = key
            } else if (resolvedKey === 'http://rdfs.org/ns/void#classPartition') {
              keys.classPartitionKey = key;
            } else if (resolvedKey === 'http://rdfs.org/ns/void#class') {
              keys.classKey = key;
            } else if (resolvedKey === 'http://rdfs.org/ns/void#property') {
              keys.propertyKey = key;
            } else if (resolvedKey === 'http://rdfs.org/ns/void#entities') {
              keys.entitiesKey = key;
            } else if (resolvedKey === 'http://rdfs.org/ns/void#triples') {
              keys.triplesKey = key;
            } else if (resolvedKey === 'http://rdfs.org/ns/void#distinctObjects') {
              keys.distinctObjectsKey = key;
            } else if (resolvedKey === 'http://purl.org/dc/dcam/rangeIncludes') {
              keys.rangeIncludesKey = key;
            }
         }
       }

      var topParents = top.hasOwnProperty(keys.classPartitionKey) ? top[keys.classPartitionKey] : top[keys.propertyPartitionKey];

      let topParentsObjects = [];
      if (Array.isArray(topParents)) {
        topParents.forEach(id => topParentsObjects.push(graph.find(item => item['@id'] === id)))
      } else if (topParents) {
        topParentsObjects.push(graph.find(item => item['@id'] === topParents))
      }

      this.setState({ topParents: topParentsObjects, keys: keys, schema:response, schemaState: {loaded: true, loading: false, failed: false}});

      },
      () => this.setState({ schema: [], schemaState: {loaded: false, loading: false, failed: true}}))
    );
    if (props.mode === 'EDITOR') {
      getAnnotatorsByUser(props.schemaDataset['@id'])
        .then(json => {this.setState({ annotators: json })})

      getAnnotationEditGroupsByUser(props.schemaDataset['@id'])
        .then(json => {this.setState({ annotationEditGroups: json })})

      getEmbeddersByUser(props.schemaDataset['@id'])
        .then(json => {this.setState({ embedders: json })})

      getVocabulizers(props.schemaDataset['@id'])
        .then(json => {this.setState({ vocabularizers: json })})

      // getIndexes(props.schemaDataset['@id'])
      //   .then(json => {this.setState({ indexes: json })})
    }
    else {
      getAnnotators(props.schemaDataset['@id'])
        .then(json => {this.setState({ annotators: json })})

      getAnnotationEditGroups(props.schemaDataset['@id'])
        .then(json => {
          let pavIds = [];
          for (let el of json) {
            for (let pav of el.pagedAnnotationValidations) {
              pavIds.push(pav.id);
            }
          }
          for (let id of pavIds) {
            getValidationProgress(id)
              .then(response => {
                let progs = this.state.validationProgress;
                progs[id] = response.totalAnnotations > 0 ? (100 * response.totalValidations / response.totalAnnotations).toFixed(2) : 0;
                this.setState({ annotationEditGroups: json, validationProgress: progs });
              })
          }
        })

    }

    this.messageQueueMap = new Map();
  }
}


  valueActions(action, uri, path, mode, lodview) {
    if (action === 'show-values') {
      if (lodview) {
        var xendpoint = API_BASE_URL + "/content/" + uri.substr(uri.lastIndexOf('/') + 1) + "/sparql"
      } else {
        xendpoint = null
      }
      if (path.length == 1 && path[0].type === 'CLASS') {
        var valuesModalControls = false;
      } else {
        valuesModalControls = true;
      }

      this.setState({ values: [], valuesModalShow: true, valuesEndpoint: null, valuesPath: [], valuesState: { loaded: false, loading:true, failed:false }}, () =>
        getDatasetPropertyValues(uri, path,  mode)
          .then(json => this.setState({ values: json, valuesModalControls: valuesModalControls, valuesEndpoint: xendpoint, valuesPath: path, valuesState: { loaded: true, loading:false, failed:false } }),
                () => this.setState({ values: [], valuesEndpoint: null, valuesPath: [], valuesState: { loaded: false, loading:false, failed:true } }),
        ))
      } else if (action === 'download-values') {
        downloadDatasetPropertyValues(uri, path,  mode)
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
      }
    }

  validationsSort(a,b) {
    if (a.name && b.name) {
         if (a.name < b.name) {
           return -1;
         } else if (a.name > b.name) {
           return 1;
         } else {
           return 0;
         }
    } else {
      if (a.id < b.id) {
        return -1;
      } else if (a.id > b.id) {
        return 1;
      } else {
        return 0;
      }
    }
  }

  updateAnnotatorInfo(params, response) {
    if (response.result) {
       this.setState({ annotators: this.state.annotators.map(el => el.id !== params.id ? el : response.result) })
    }
  }

  updateFilterAnnotationValitationInfo(params, response) {
    if (response.result) {
       this.setState({ annotationEditGroups: this.state.annotationEditGroups.map(el => el.id === params.aegId ?
         {...el , filterAnnotationValidations: el.filterAnnotationValidations.map(fav => fav.id === params.id ? response.result : fav) } : el ).sort(this.validationsSort) })
    }
  }

  updatePagedAnnotationValidationInfo(params, response) {
    if (response.result) {
      this.setState({ annotationEditGroups: this.state.annotationEditGroups.map(el => el.id === params.aegId ?
        {...el , pagedAnnotationValidations: el.pagedAnnotationValidations.map(pav => pav.id === params.id ? response.result : pav) } : el ).sort(this.validationsSort) })
    }
  }


  actions(action, params) {
      if (action === 'create-annotator') {
        // console.log(this.props.schemaDataset['@id'], params.onProperty, params.asProperty, params.annotator, params.thesaurus, params.parameters, params.preprocess, params.variant)
        createAnnotator(this.props.schemaDataset['@id'], params.onProperty, params.asProperty, params.annotator, params.thesaurus, params.parameters, params.preprocess, params.variant, params.defaultTarget)
          .then((json) =>
            this.setState({ annotators: this.state.annotators.slice().concat(json) })
          )
      }
      else if (action === 'edit-annotator') {
        updateAnnotator(params.id, params.asProperty, params.annotator, params.thesaurus, params.parameters, params.preprocess, params.variant, params.defaultTarget)
          .then(() => {
            getAnnotatorsByUser(this.props.schemaDataset['@id'])
              .then(json => {this.setState({ annotators: json })})
        })
      } else if (action === 'prepare-annotator') {
        prepareAnnotator(params.id)
          .then(response => {
            throwToast('success', response.message)
          })
          .catch(error => {
            throwToast('error', error.message)
          })
      } else if (action === 'execute-annotator') {
        executeAnnotator(params.id)
          .then(response => {
            throwToast('success', response.message)
          })
          .catch(error => {
            throwToast('error', error.message);
          })
       } else if (action === 'stop-annotator') {
         stopAnnotator(params.id)
          .then(response => {
             throwToast('success', response.message)
             this.updateAnnotatorInfo(params, response)
          })
          .catch(error => {
            throwToast('error', error.message);
         })
       } else if (action === 'delete-annotator') {
         this.setState({ deleteModalShow:true, deleteModalCommand: 'delete-annotator', deleteModalParams:params})
       } else if (action === 'delete-annotator-ok') {
         deleteAnnotator(params.id)
         .then(response => {
           throwToast('success', response.message)
           this.setState({ annotators: this.state.annotators.filter(el => el.id !== params.id)})
         })
         .catch(error => {
           throwToast('error', error.message);
         })
      } else if (action === 'check-annotator') {
        this.setState({ annotators: this.state.annotators.map(el =>
            el.id !== params.id ?
               el :
              { ...el, selected: !el.selected}
          )});
      } else if (action === 'check-annotation-edit-group') {
        setAnnotationEditGroupAutoexportable(params.id, !this.state.annotationEditGroups.filter(el => el.id === params.id)[0].autoexportable)
          this.setState({ annotationEditGroups: this.state.annotationEditGroups.map(el =>
              el.id !== params.id ?
                 el :
                { ...el, autoexportable: !el.autoexportable}
            )});
      } else if (action === 'preview-last-annotator-execution') {
        this.setState({ annotations: null, annotationsModalShow:true, annotationsState: { loaded: false, loading: true, failed: false}}, () =>
          previewLastAnnotatorExecution(params.id)
            .then(response => {
              response.text().then(text =>
                this.setState({ annotations: { text: text }, annotationsState: {loaded: true, loading: false, failed: false} }))},
                () => this.setState({ annotations: null, annotationsState: {loaded: false, loading: false, failed: true}}) )
          )
      } else if (action === 'preview-published-annotator-execution') {
        this.setState({ annotations: null, annotationsModalShow:true, annotationsState: { loaded: false, loading: true, failed: false}}, () =>
          previewPublishedAnnotatorExecution(params.id)
            .then(response => {
              response.text().then(text =>
                this.setState({ annotations: { text: text }, annotationsState: {loaded: true, loading: false, failed: false} }))},
                () => this.setState({ annotations: null, annotationsState: {loaded: false, loading: false, failed: true}}) )
          )
      } else if (action === 'download-last-annotator-execution') {
        downloadLastAnnotatorExecution(params.id)
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
      } else if (action === 'download-published-annotator-execution') {
        downloadPublishedAnnotatorExecution(params.id)
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
      } else if (action === 'preview-annotator-execution') {
        this.setState({ annotationsEdit: null, annotationsEditModalShow:true, annotationsEditState: { loaded: false, loading: true, failed: false}}, () =>
        previewAnnotator(params.id, params.page)
        .then(json => {
            this.setState({ editGroupId: params.id, annotationsEdit: json, annotationsEditPage: params.page, annotationsEditModalShow:true, annotationsEditMode: params.mode,
              annotationsEditAnnotators: null, annotationsEditState: { loaded: true, loading: false, failed: false}})},
              () => this.setState({ annotationsEdit: null, annotationsEditState: {loaded: false, loading: false, failed: true}}) )
      )
    } else if (action === 'clear-annotator-execution') {
      clearAnnotatorExecution(params.id)
        .then(response => {
           throwToast('success', response.message)
           this.updateAnnotatorInfo(params, response)
        })
        .catch(error => {
          throwToast('error', error.message);
       })
    } else if (action === 'view-annotations') {
      this.setState({ annotationsEdit: null, annotationsEditModalShow:true, annotationsEditState: { loaded: false, loading: true, failed: false}}, () =>
      viewValuesAnnotations(params.id, params.page, params.mode, params.annotators.map(an => an.uuid))
      .then(json => {
          this.setState({ editGroupId: params.id, annotationsEdit: json, annotationsEditPage: params.page, annotationsEditModalShow:true, annotationsEditMode: params.mode,
            annotationsEditAnnotators: params.annotators, annotationsEditState: { loaded: true, loading: false, failed: false}})},
            () => this.setState({ annotationsEdit: null, annotationsEditState: {loaded: false, loading: false, failed: true}}) )
    )
  } else if (action === 'validate-annotations') {
    this.setState({ annotationValidations: {}, annotationValidationsModalShow:true, annotationValidationsState: { loaded: false, loading: true, failed: false}}, () =>
    viewAnnotationValidation(params.id, params.currentPage, params.mode, params.serial, params.navigation, params.requestedPage)
    .then(json => {
        this.setState({ annotationValidations: json, annotationsEditOnProperty: params.onProperty, annotationsEditOnPropertyPath: params.onPropertyPath,  annotationsEditEnabled: params.edit, annotationValidationsModalShow:true, annotationValidationsState: { loaded: true, loading: false, failed: false}})},
          () => this.setState({ annotationValidations: {}, annotationValidationsState: {loaded: false, loading: false, failed: true}}) )
  )
} else if (action === 'export-annotations-modal') {
    this.setState( { annotationsDownloadModalShow: true, annotationsDownloadId: params.id} )
} else if (action === 'export-annotations') {
    // console.log(params);
    downloadAnnotationValues(params.id, params.format, params.onlyReviewed, params.onlyNonRejected, params.onlyFresh, params.created, params.creator, params.score, params.scope, params.selector, params.archive)
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
            } this.setState({annotationsDownloadModalShow: false}) },
            () => { Promise.reject(); this.setState({annotationsDownloadModalShow: false})})

  } else if (action === 'score-validation-distribution') {
      this.setState({ scoreDistribution: [], scoreDistributionModalShow: true, scoreDistributionState: { loaded: false, loading:true, failed:false }}, () =>
        scoreValidationDistribution(params.id, params.accuracy)
          .then(json => this.setState({ scoreDistribution: json, scoreDistributionState: { loaded: true, loading:false, failed:false } }),
                () => this.setState({ values: [], scoreDistributionState: { loaded: false, loading:false, failed:true } }),
        ))

  // } else if (action === 'publish-filter-validation') {
  //     publishFilterAnnotationValidation(params.id)
  // } else if (action === 'unpublish-filter-validation') {
  //     unpublishFilterAnnotationValidation(params.id)

  } else if (action === 'create-paged-validation') {
    if (params.id == null) {
      createPagedAnnotationValidation(params.aegId, params.name, params.mode)
      .then(response => {
        throwToast('success', response.message)
        this.setState({ annotationEditGroups: this.state.annotationEditGroups.map(el => el.id === params.aegId ?
           {...el , pagedAnnotationValidations: el.pagedAnnotationValidations.slice().concat(response.result) } : el ).sort(this.validationsSort) })
      })
      .catch(error => {
        throwToast('error', error.message);
      })
    } else {
      updatePagedAnnotationValidation(params.id, params.name, params.mode)
      .then(response => {
        throwToast('success', response.message)
        this.updatePagedAnnotationValidationInfo(params, response)
      })
      .catch(error => {
        throwToast('error', error.message);
      })
    }
  } else if (action === 'create-filter-validation') {
    if (params.id == null) {
      createFilterAnnotationValidation(params.aegId, params.name, params.filters)
      .then(response => {
        throwToast('success', response.message)
        this.setState({ annotationEditGroups: this.state.annotationEditGroups.map(el => el.id === params.aegId ?
             {...el , filterAnnotationValidations: el.filterAnnotationValidations.slice().concat(response.result) } : el ).sort(this.validationsSort) })
      })
     .catch(error => {
       throwToast('error', error.message);
     })
    } else {
      updateFilterAnnotationValidation(params.id, params.name, params.filters)
      .then(response => {
        throwToast('success', response.message)
        this.updateFilterAnnotationValitationInfo(params, response)
      })
      .catch(error => {
        throwToast('error', error.message);
      })
    }
  } else if (action === 'delete-filter-annotation-validation') {
    this.setState({ deleteModalShow:true, deleteModalCommand: 'delete-filter-annotation-validation', deleteModalParams:params})
  } else if (action === 'delete-filter-annotation-validation-ok') {
    deleteFilterAnnotationValidation(params.id)
    .then(response => {
      throwToast('success', response.message)
      this.setState({ annotationEditGroups: this.state.annotationEditGroups.map(el => el.id === params.aegId ?
           {...el , filterAnnotationValidations: el.filterAnnotationValidations.filter(el => el.id !== params.id) } : el ) })
    })
    .catch(error => {
      throwToast('error', error.message);
    })
  } else if (action === 'execute-paged-annotation-validation') {
    executePagedAnnotationValidation(params.id)
      .then(response => {
        throwToast('success', response.message)
      })
      .catch(error => {
        throwToast('error', error.message);
      })
  } else if (action === 'execute-filter-annotation-validation') {
    executeFilterAnnotationValidation(params.id)
      .then(response => {
        throwToast('success', response.message)
      })
      .catch(error => {
        throwToast('error', error.message);
      })
  } else if (action === 'clear-paged-annotation-validation-execution') {
    clearPagedAnnotationValidationExecution(params.id)
      .then(response => {
         throwToast('success', response.message)
         this.updatePagedAnnotationValidationInfo(params, response)
      })
      .catch(error => {
        throwToast('error', error.message);
      })
  } else if (action === 'clear-filter-annotation-validation-execution') {
    clearFilterAnnotationValidationExecution(params.id)
      .then(response => {
         throwToast('success', response.message)
         this.updateFilterAnnotationValitationInfo(params, response)
      })
      .catch(error => {
        throwToast('error', error.message);
      })
  } else if (action === 'preview-paged-annotation-validation-execution') {
     this.setState({ annotationEditExecutions: null, annotationEditExecutionModalShow:true, annotationEditExecutionsState: { loaded: false, loading: true, failed: false}}, () =>
     previewPagedAnnotationValidationExecution(params.id)
     .then(response => {
         response.text().then(text =>
         this.setState({annotationEditExecutions: { text: text },
           annotationEditExecutionsState: { loaded: true, loading: false, failed: false}}))},
           () => this.setState({ annotationEditExecutions: null, annotationEditExecutionsState: {loaded: false, loading: false, failed: true}}) )
   )
   } else if (action === 'preview-filter-annotation-validation-execution') {
      this.setState({ annotationEditExecutions: null, annotationEditExecutionModalShow:true, annotationEditExecutionsState: { loaded: false, loading: true, failed: false}}, () =>
      previewFilterAnnotationValidationExecution(params.id)
      .then(response => {
          response.text().then(text =>
          this.setState({annotationEditExecutions: { text: text },
            annotationEditExecutionsState: { loaded: true, loading: false, failed: false}}))},
            () => this.setState({ annotationEditExecutions: null, annotationEditExecutionsState: {loaded: false, loading: false, failed: true}}) )
    )
   } else if (action === 'preview-published-paged-annotation-validation-execution') {
      this.setState({ annotationEditExecutions: null, annotationEditExecutionModalShow:true, annotationEditExecutionsState: { loaded: false, loading: true, failed: false}}, () =>
      previewPublishedPagedAnnotationValidationExecution(params.id)
      .then(response => {
          response.text().then(text =>
          this.setState({annotationEditExecutions: { text: text },
            annotationEditExecutionsState: { loaded: true, loading: false, failed: false}}))},
            () => this.setState({ annotationEditExecutions: null, annotationEditExecutionsState: {loaded: false, loading: false, failed: true}}) )
    )
  } else if (action === 'preview-published-filter-annotation-validation-execution') {
     this.setState({ annotationEditExecutions: null, annotationEditExecutionModalShow:true, annotationEditExecutionsState: { loaded: false, loading: true, failed: false}}, () =>
     previewPublishedFilterAnnotationValidationExecution(params.id)
     .then(response => {
         response.text().then(text =>
         this.setState({annotationEditExecutions: { text: text },
           annotationEditExecutionsState: { loaded: true, loading: false, failed: false}}))},
           () => this.setState({ annotationEditExecutions: null, annotationEditExecutionsState: {loaded: false, loading: false, failed: true}}) )
   )
 } else if (action === 'download-paged-annotation-validation-execution') {
   downloadPagedAnnotationValidationExecution(params.id)
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
   } else if (action === 'download-filter-annotation-validation-execution') {
     downloadFilterAnnotationValidationExecution(params.id)
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
   } else if (action === 'download-published-paged-annotation-validation-execution') {
     downloadPublishedPagedAnnotationValidationExecution(params.id)
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
   } else if (action === 'download-published-filter-annotation-validation-execution') {
     downloadPublishedFilterAnnotationValidationExecution(params.id)
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
  } else if (action === 'publish-paged-annotation-validation') {
    publishPagedAnnotationValidation(params.id)
      .then(response => {
        throwToast('success', response.message)
      })
      .catch(error => {
        throwToast('error', error.message);
      })
  } else if (action === 'publish-filter-annotation-validation') {
    publishFilterAnnotationValidation(params.id)
      .then(response => {
        throwToast('success', response.message)
      })
      .catch(error => {
        throwToast('error', error.message);
      })
  } else if (action === 'unpublish-paged-annotation-validation') {
    unpublishPagedAnnotationValidation(params.id)
      .then(response => {
        throwToast('success', response.message)
      })
      .catch(error => {
        throwToast('error', error.message);
      })
  } else if (action === 'unpublish-filter-annotation-validation') {
    unpublishFilterAnnotationValidation(params.id)
      .then(response => {
        throwToast('success', response.message)
      })
      .catch(error => {
        throwToast('error', error.message);
      })
  } else if (action === 'edit-annotation-validation') {
    // TODO
    // console.log(params);
    // editAnnotationValidation(params.id);
  } else if (action === 'stop-paged-annotation-validation') {
    stopPagedAnnotationValidation(params.id)
    .then(response => {
      throwToast('success', response.message)
      this.updatePagedAnnotationValidationInfo(params, response)
    })
    .catch(error => {
      throwToast('error', error.message);
    })
  } else if (action === 'resume-paged-annotation-validation') {
    resumePagedAnnotationValidation(params.id)
      .then(response => {
        throwToast('success', response.message)
      })
      .catch(error => {
        throwToast('error', error.message);
      })
  } else if (action === 'publish-annotator') {
      publishAnnotator(params.id)
        .then(response => {
           throwToast('success', response.message)
        })
        .catch(error => {
          throwToast('error', error.message);
         })

  // } else if (action === 'unpublish-checked-annotators') {
      // unpublishAnnotators(this.state.annotators.filter(el => el.selected && pathEquals(el.onProperty, params.onProperty) ).map(el => el.id))
  // } else if (action === 'add-delete-annotation-edit') {
  //     var annotationsEdit = this.state.annotationsEdit.map(el => {return el.value !== params.propertyValue ?
  //         el :
  //         {...el, details: el.details.map(el2 => {return el2.value !== params.annotationValue ?
  //            el2 : {...el2, deleted: !el2.deleted}})}} )
  //     this.setState({annotationsEdit})
  //     addDeleteAnnotationEdit(this.props.schemaUrl, this.state.annotationsEditProperty, params.propertyValue, params.annotationValue)
  } else if (action === 'unpublish-annotator') {
      unpublishAnnotator(params.id)
        .then(response => {
          throwToast('success', response.message)
        })
        .catch(error => {
          throwToast('error', error.message);
        })

  } else if (action === 'commit-annotation-edits') {
     commitAnnotationEdits(params.id, params.edits)
     // .then(response =>
       // this.setState({annotationsEditModalShow:false})
     // )
   } else if (action === 'commit-annotation-validation-page') {
     commitAnnotationValidationPage(params.pageid, params.edits, params.lockId)
     .then(response =>
       this.setState({ annotationValidations: {}, annotationValidationsModalShow:true, annotationValidationsState: { loaded: false, loading: true, failed: false}}, () =>
       viewAnnotationValidation(params.id, params.currentPage, params.mode, params.serial, params.navigation, params.requestedPage)
       .then(
         json => {
           if (json.errorMessage === "NO_PAGE_FOUND") {
             let obj = {
               currentPage: params.currentPage,
               data: [],
               errorMessage: json.errorMessage,
               filter: null,
               id: params.id,
               lockId: params.lockId,
               mode: params.mode.split('_')[0]+'_ONLY',
               pagedAnnotationValidationId: params.id,
               pagedAnnotationValidationPageId: params.pageid,
               totalPages: 0
             }
             this.setState({ annotationValidations: obj, annotationValidationsModalShow:true, annotationValidationsState: { loaded: true, loading: false, failed: false}});
           }
           else {
             this.setState({ annotationValidations: json, annotationValidationsModalShow:true, annotationValidationsState: { loaded: true, loading: false, failed: false}});
           }
         },
         () => this.setState({ annotationValidations: {}, annotationValidationsState: {loaded: false, loading: false, failed: true}}) )
     )
     )
   // } else if (action === 'publish-validation') {
   //    publishAnnotationEdits(params.id)
  // } else if (action === 'unpublish-validation') {
  //    unpublishAnnotationEdits(params.id)
   } else if (action === 'view-validation') {
       viewAnnotationEditsExecution(params.id)
       .then(response => {
        if (response.status === 204) {
          // this.setState({ lastExecution: { message: "The mapping has not been executed." }})
          return;
        } else if (!response.ok) {
         return "Error";
       } else {
         response.text().then(text =>
           this.setState({ annotationEditExecutions: { text: text }, annotationEditExecutionModalShow:true}))
       }
     })

     this.setState({ annotationEditExecutions: null, annotationEditExecutionModalShow:true, annotationEditExecutionsState: { loaded: false, loading: true, failed: false}}, () =>
     viewAnnotationEditsExecution(params.id)
     .then(response => {
         response.text().then(text =>
         this.setState({annotationEditExecutions: { text: text },
           annotationEditExecutionsState: { loaded: true, loading: false, failed: false}}))},
           () => this.setState({ annotationEditExecutions: null, annotationEditExecutionsState: {loaded: false, loading: false, failed: true}}) )
   )

  } else if (action === 'create-vocabularizer') {
    // console.log(params);
    createVocabularizer(this.props.schemaDataset['@id'], params.onProperty, params.name, params.separator)
        .then((json) =>
            this.setState({ vocabularizers: this.state.vocabularizers.slice().concat(json) })
          )
  } else if (action === 'delete-vocabularizer') {
   deleteVocabularizer(params.id)
      .then(() =>
         this.setState({ vocabularizers: this.state.vocabularizers.filter(el => el.id !== params.id)}))
  } else if (action === 'execute-vocabularizer') {
     executeVocabularizer(params.id)
   } else if (action === 'view-vocabularizer-execution') {
     viewVocabularizerExecution(params.id)
     .then(response => {
      if (response.status === 204) {
        // this.setState({ lastExecution: { message: "The mapping has not been executed." }})
        return;
      } else if (!response.ok) {
       return "Error";
     } else {
       response.text().then(text =>
         this.setState({ annotations: { text: text }, annotationsModalShow:true}))
     }
   })
 } else if (action === 'publish-vocabularizer') {
       publishVocabularizer(params.id)
 } else if (action === 'unpublish-vocabularizer') {
        unpublishVocabularizer(params.id)
 } else if (action === 'index-vocabularizer') {
        indexVocabularizer(params.id)
 } else if (action === 'unindex-vocabularizer') {
       unindexVocabularizer(params.id)
 } else if (action === 'execute-cleanup-vocabularizer') {

   var promises = []

   var vocabulary;
   var equivalences;

   promises.push(
     new Promise(function(resolve, reject) {
       vocabularyVocabularizer(params.id)
         .then((json) =>  {
           vocabulary = json;
           resolve()
         })})
    )
   promises.push(
     new Promise(function(resolve, reject) {
       cleanupVocabularizer(params.id)
         .then((json) =>  {
           equivalences = json;
           resolve()
         })})
    )

     Promise.all(promises)
      .then(() => {
        var map = new Map();
        for (var i in vocabulary) {
          var set = []
          set.push({uri: vocabulary[i]['@id'], text: vocabulary[i]['http://www.w3.org/2000/01/rdf-schema#label'][0]['@value']});
          map.set(vocabulary[i]['@id'], set);
        }

        for (var i in equivalences) {
          for (var j in equivalences[i]) {
            if (j === '0') {
              var set = map.get(equivalences[i][j].uri);
            } else {
              set.push({uri: equivalences[i][j].uri, text: equivalences[i][j].text});
              map.set(equivalences[i][j].uri, set);
            }
          }
        }

        // console.log(map);
        this.setState({vocabulary: map, vocabularyEditModalShow: true})

     })

   // }  else if (action === 'index') {
   //   index(this.props.schemaDataset['@id'])
   // }  else if (action === 'unindex') {
   //   unindex(this.props.schemaDataset['@id'])
   } else if (action === 'get-items-by-property-value') {
     var uri = this.props.schemaDataset['@id']
     var lodview = true;
     if (lodview) {
       var xendpoint = API_BASE_URL + "/content/" + uri.substr(uri.lastIndexOf('/') + 1) + "/sparql"
     } else {
       xendpoint = null
     }
    this.setState({ values: [], valuesModalShow: true, valuesEndpoint: null, valuesPath: [], valuesState: { loaded: false, loading:true, failed:false }}, () =>
      getDatasetItemsByPropertyValue(uri, params.onPropertyPath,  params.value)
       .then(json => this.setState({ values: json, valuesModalControls: false, valuesEndpoint: xendpoint, valuesPath: params.onPropertyPath, valuesState: { loaded: true, loading:false, failed:false } }),
              () => this.setState({ values: [], valuesEndpoint: null, valuesPath: [], valuesState: { loaded: false, loading:false, failed:true } }),
      ))
   } else if (action === 'annotations-statistics') {
     // console.log(this.props.schemaDataset['@id'], params.onProperty, params.asProperty, params.annotator, params.thesaurus, params.parameters, params.preprocess, params.variant)
     datasetAnnotationsStatistics(this.props.schemaDataset['@id'])
       .then((json) =>
          // this.setState({ annotators: this.state.annotators.slice().concat(json) })
          console.log(json)
       )
   } else if (action === 'create-embedder') {
      if (params.id == null) {
        createEmbedder(this.props.schemaDataset['@id'], params.embedder, params.variant, params.indexStructure, params.onClass, params.keys)
        .then(response => {
          throwToast('success', response.message)
          this.setState({ embedders: this.state.embedders.slice().concat(response.result) })
        })
       .catch(error => {
         throwToast('error', error.message);
       })
      } else {
        // update
      }

   } else if (action === 'execute-embedder') {
     executeEmbedder(params.id)
      .then(response => {
        throwToast('success', response.message)
      })
      .catch(error => {
        throwToast('error', error.message);
      })
   } else if (action === 'stop-embedder') {
     stopEmbedder(params.id)
      .then(response => {
           throwToast('success', response.message);
          if (response.result) {
             this.setState({ embedders: this.state.embedders.map(el => el.id !== params.id ? el : response.result) })
          }
       })
       .catch(error => {
         throwToast('error', error.message);
      })
   } else if (action === 'delete-embedder') {
     this.setState({ deleteModalShow:true, deleteModalCommand: 'delete-embedder', deleteModalParams:params})
   } else if (action === 'delete-embedder-ok') {
     deleteEmbedder(params.id)
     .then(response => {
       throwToast('success', response.message)
       this.setState({ embedders: this.state.embedders.filter(el => el.id !== params.id) })
     })
     .catch(error => {
       throwToast('error', error.message);
     })
   } else if (action === 'publish-embedder') {
     publishEmbedder(params.id)
      .then(response => {
         throwToast('success', response.message)
        })
        .catch(error => {
          throwToast('error', error.message);
         })
   } else if (action === 'unpublish-embedder') {
      unpublishEmbedder(params.id)
       .then(response => {
          throwToast('success', response.message)
       })
       .catch(error => {
         throwToast('error', error.message);
        })
   } else if (action === 'preview-last-embedder-execution') {
      this.setState({ embeddings: null, embeddingsModalShow:true, embeddingsState: { loaded: false, loading: true, failed: false}}, () =>
        previewLastEmbedderExecution(params.id)
          .then(response => {
            response.text().then(text =>
              this.setState({ embeddings: { text: text }, embeddingsState: {loaded: true, loading: false, failed: false} }))},
              () => this.setState({ embeddings: null, embeddingsState: {loaded: false, loading: false, failed: true}}) )
        )
    } else if (action === 'preview-published-embedder-execution') {
      this.setState({ embeddings: null, embeddingsModalShow:true, embeddingsState: { loaded: false, loading: true, failed: false}}, () =>
        previewPublishedEmbedderExecution(params.id)
          .then(response => {
            response.text().then(text =>
              this.setState({ embeddings: { text: text }, embeddingsState: {loaded: true, loading: false, failed: false} }))},
              () => this.setState({ embeddings: null, embeddingsState: {loaded: false, loading: false, failed: true}}) )
        )
    } else if (action === 'download-last-embedder-execution') {
      downloadLastEmbedderExecution(params.id)
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
    } else if (action === 'download-published-embedder-execution') {
      downloadPublishedEmbedderExecution(params.id)
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
    }
}

  render() {

    // var index = this.props.indexes.filter(el => el.onProperty[0] === this.props.value['@id']);
    // if (index.length > 0) {
    //   index = index[0]
    // } else {
    //   index = null
    // }

    // var index;
    // var indexed = false;
    // if (Object.keys(this.state.indexes).length) {
    //   index = this.state.indexes;
    //   indexed = true;
    // } else {
    //   index = { indexState : "NOT_INDEXED" }
    // }

    // var control = { '@id': 'control' };

    let context = this.state.schema['@context'];
    var fullView = this.props.mode === 'EDITOR';

    return (
      <div>
        {this.props.schemaDataset &&
        <Container className="groupborder dataset-border">
          <Row className="header dataset-col">
            <Col md={11}>
              <span title="Dataset label" className="bold nospace2">{filterByLanguage(this.props.schemaDataset,'http://purl.org/dc/terms/title', Localizer.language)}</span>
            </Col>

            <Col className="mybutton" md={1}>
              <DropdownButton size="sm" title={<span title="Actions" className='fa fa-bars'></span>} className="actions">
                {/*<Dropdown.Item className="py-2" onClick={() => this.setState({ indexModalOpen: true } )}>
                  <span className="menu-icon fa fa-plus fa-lg mr-3"></span>Index...
                </Dropdown.Item>

                <Dropdown.Divider/>*/}

                <Dropdown.Item className="py-2" onClick={() => this.actions('annotations-statistics')}>
                  <span className="menu-icon fa fa-signal fa-lg mr-3"></span>Annotation statistics...
                </Dropdown.Item>
              </DropdownButton>


              {/*this.state.indexModalOpen &&
              <IndexStructureModal show={this.state.indexModalOpen}
                datasetUri={this.props.schemaDataset['@id']}
                // embedder={this.state.embedderToEdit}
                // embedderClass={this.state.embedderToEditClass}
                // onProperty={path[path.length - 1]}
                //queryProperties={this.props.queryProperties}
                // dataEmbedders={this.props.dataEmbedders}
                // preprocessFunctions={this.props.preprocessFunctions}
                // preprocessOperations={this.props.preprocessOperations}
                // vocabularies={this.props.vocabularies}
                // rdfVocabularies={this.props.rdfVocabularies}
                // onOK={(embedder, variant, indexStructure, keys) => { this.props.actions('create-embedder', { embedder: embedder, variant: variant, indexStructure: indexStructure, onClass: this.state.embedderToEditClass, keys: keys }); this.setState({ embedderModalOpen: false }) }}
                // onUpdate={(id, property, annotator, thesaurus, params, preprocess, variant, defaultTarget) => { this.props.actions('edit-annotator', { id: id, asProperty: property, annotator: annotator, thesaurus: thesaurus, parameters: params, preprocess: preprocess, variant: variant, defaultTarget }); this.setState({ embedderModalOpen: false, editMode: false, editAnnotator: null }) }}
                onClose={() => this.setState({ indexModalOpen: false })}
                />*/}

            </Col>
          </Row>

          {this.state.schemaState.loading &&
          <Row>
            <Col className="loader">
              <BarLoader css='spinner' height={6} width={600} color='crimson' loading={true}/>
            </Col>
          </Row>}

          {this.state.schemaState.failed &&
          <Row>
            <Col>
              <span className="error">Loading {filterByLanguage(this.props.schemaDataset,'http://purl.org/dc/terms/title', Localizer.language)} failed.</span>
            </Col>
          </Row>}

          {this.state.schemaState.loaded && this.state.schema.length === 0 &&
          <div className="text-center text-danger">
            <i className="fa fa-exclamation-triangle fa-lg mr-3" aria-hidden="true"></i>
            <span><strong>There are not any Property Annotations open for validation at the moment.</strong></span>
          </div>}

          {this.state.schemaState.loaded && this.state.topParents.sort((a,b) => sortByField('class', a, b)).map((el,index) =>
          <SchemaClass  key={index} value={el}
                    datasetUri={this.props.schemaDataset['@id']}
                    schema={this.state.schema}
                    keys={this.state.keys}
                    mode={this.props.mode}
                    language={this.props.language}
                    annotators={this.state.annotators}
                    annotationEditGroups={this.state.annotationEditGroups}
                    validationProgress={this.state.validationProgress}
                    vocabularizers={this.state.vocabularizers}
                    embedders={this.state.embedders}
                    // indexes={this.state.indexes}
                    queryProperties={this.props.queryProperties}
                    dataAnnotators={this.props.dataAnnotators}
                    dataEmbedders={this.props.dataEmbedders}
                    preprocessFunctions={this.props.preprocessFunctions}
                    preprocessOperations={this.props.preprocessOperations}
                    vocabularies={this.props.vocabularies}
                    rdfVocabularies={this.props.rdfVocabularies}
                    validationModes={this.props.validationModes}
                    actions={(action, params) => this.actions(action, params)}
                    valueActions={(action, path, mode) => this.valueActions(action, this.props.schemaDataset['@id'], path, mode)}/>)}

        {this.state.valuesModalShow &&
        <PropertyValuesModal show={this.state.valuesModalShow}
                             values={this.state.values}
                             state={this.state.valuesState}
                             endpoint={this.state.valuesEndpoint}
                             database={this.props.database}
                             onPropertyPath={this.state.valuesPath}
                             language={this.props.language}
                             controls={this.state.valuesModalControls}
                             valueActions={(action, path, mode) => this.valueActions(action, this.props.schemaDataset['@id'], path, mode)}
                             actions={(action, params) => this.actions(action, params)}
                             onClose={() => this.setState({ valuesModalShow: false })}/>}

       {/*this.state.scoreDistributionModalShow &&
        <ScoreDistributionModal show={this.state.scoreDistributionModalShow}
                            distributions={this.state.scoreDistribution}
                            state={this.state.scoreDistributionState}
                            language={this.props.language}
                            onClose={() => this.setState({ scoreDistributionModalShow: false })}/>*/}

        {this.state.annotationsModalShow &&
        <ResultsModal show={this.state.annotationsModalShow}
                      state={this.state.annotationsState}
                      execution={this.state.annotations}
                      onClose={() => this.setState({ annotationsModalShow: false })}/>}

        {this.state.embeddingsModalShow &&
        <ResultsModal show={this.state.embeddingsModalShow}
                      state={this.state.embeddingsState}
                      execution={this.state.embeddings}
                      onClose={() => this.setState({ embeddingsModalShow: false })}/>}

        {this.state.annotationEditExecutionModalShow &&
        <ResultsModal show={this.state.annotationEditExecutionModalShow}
                      state={this.state.annotationEditExecutionsState}
                      execution={this.state.annotationEditExecutions}
                      onClose={() => this.setState({ annotationEditExecutionModalShow: false })}/>}

        {this.state.annotationsEditModalShow &&
        <AnnotationValuesModal show={this.state.annotationsEditModalShow}
                             state={this.state.annotationsEditState}
                             values={this.state.annotationsEdit}
                             onProperty={this.state.annotationsEditOnProperty}
                             asProperty={this.state.annotationsEditAsProperty}
                             mode={this.state.annotationsEditMode}
                             page={this.state.annotationsEditPage}
                             id={this.state.editGroupId}
                             // dataAnnotators={this.props.dataAnnotators}
                             annotators={this.state.annotationsEditAnnotators}
                             language={this.props.language}
                             // edits={this.annotationEdits}
                             actions={(action, params) => this.actions(action, params)}
                             onClose={() => this.setState({ annotationsEditModalShow: false })}/>}

         {this.state.annotationValidationsModalShow &&
         <ValidationModal
                dataset={this.props.schemaDataset['@id']}
                show={this.state.annotationValidationsModalShow}
                state={this.state.annotationValidationsState}
                value={this.state.annotationValidations}
                edit={this.state.annotationsEditEnabled}
                onProperty={this.state.annotationsEditOnProperty}
                onPropertyPath={this.state.annotationsEditOnPropertyPath}
                datasetName={filterByLanguage(this.props.schemaDataset,'http://purl.org/dc/terms/title', Localizer.language)}
                // asProperty={this.state.annotationsEditAsProperty}
                // mode={this.state.annotationsEditMode}
                // page={this.state.annotationsEditPage}
                // id={this.state.editGroupId}
                // annotators={this.state.annotationsEditAnnotators}
                language={this.props.language}
                rdfVocabularies={this.props.rdfVocabularies}
                actions={(action, params) => this.actions(action, params)}
                onClose={() => this.setState({ annotationValidationsModalShow: false })}/>}

         {this.state.vocabularyEditModalShow &&
          <VocabularyValuesModal show={this.state.vocabularyEditModalShow}
                              value={this.state.vocabulary}
                              // onProperty={this.state.annotationsEditProperty}
                              // asProperty={this.state.annotationsAsProperty}
                              // id={this.state.editGroupId}
                              // edits={this.annotationEdits}
                              actions={(action, params) => this.actions(action, params)}
                              onClose={() => this.setState({ vocabularyEditModalShow: false })}/>}

          {this.state.deleteModalShow &&
          <DeleteModal show={this.state.deleteModalShow}
                       command={this.state.deleteModalCommand}
                       params={this.state.deleteModalParams}
                      actions={(choice, command, params) => { this.setState( {deleteModalShow:false }); return (choice === 'ok' ? this.actions(command + '-ok', params): null)} }/>}


          {this.state.annotationsDownloadModalShow &&
          <DownloadAnnotationsModal
              show={this.state.annotationsDownloadModalShow}
              id={this.state.annotationsDownloadId}
              actions={(action, params) => {this.actions(action, params)}}
              onClose={() => this.setState({ annotationsDownloadModalShow: false })}/>}
        </Container>}
      </div>
    );
  }
}



export default PublishedSchema;
