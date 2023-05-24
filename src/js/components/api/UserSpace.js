import { API_BASE_URL, WS_BASE_URL } from '../../constants/index.js';

import React, { Component } from "react";
import Container from "react-bootstrap/Container";
import ButtonGroup from "react-bootstrap/ButtonGroup";
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import Tabs from "react-bootstrap/Tabs";
import Tab from "react-bootstrap/Tab";
import Dropdown from "react-bootstrap/Dropdown";
import DropdownButton from "react-bootstrap/DropdownButton";
import Accordion from "react-bootstrap/Accordion";
import Card from "react-bootstrap/Card";
import Collapse from "react-bootstrap/Collapse";
import SockJsClient from 'react-stomp';

import { createDataset, updateDataset, deleteDataset, getDatasets, getDataset, publishDataset, unpublishDataset, republishDatasetMetadata, executeAllMappings, executeAllMappingsAndRepublish, republishDataset, publishUnpublishedContent, flipDatasetVisibility, createDatasetDistribution, stopCreateDatasetDistribution, clearDatasetDistribution } from '../../utils/DatasetAPI';
import { getRDFVocabularies } from '../../utils/VocabulariesAPI';
import { getValidationModes } from '../../utils/DatabaseAPI';
import { stopIndexingDataset, unindexDataset } from '../../utils/DatasetAPI';
import { getImportTemplates } from '../../utils/TemplateAPI';
import { igetDatasets, getEditorDatasets, getValidatorDatasets } from '../../utils/DatasetUtils.js';
import { throwToast, sortByField } from '../../utils/UIUtils';

import NewMappingModal from "./modals/NewMappingModal.js";
import Datasets from "../Datasets.js";
import DatasetEditor from "./DatasetEditor.js";
//import CatalogEditor from "./api/CatalogEditor.js";
import PublishedSchema from "./PublishedSchema.js";
import ValidationProgress from "./ValidationProgress"

import CampaignsTab from "./CampaignsTab.js";
import TaskMonitorTab from "./TaskMonitorTab.js"
import TripleStoresTab from "./TripleStoresTab.js"
import ElasticsTab from "./ElasticsTab.js"
import UsersTab from "./UsersTab.js"
import RDFVocabulariesTab from "./RDFVocabulariesTab.js"

import NewAlignmentModal from "./modals/NewAlignmentModal.js";
import DeleteModal from "./modals/DeleteModal.js";

import { getPreprocessFunctions } from '../../utils/AnnotatorAPI.js'
import { getDataServices, getIndices } from '../../utils/DatabaseAPI.js'
import { getOntologyQueryProperties } from '../../utils/APIUtils.js'
import { Localizer } from '../../config/localizer.js'

import { actionsMenu, toggleBoxColumn, MessageQueue } from '../../utils/UIUtils';

export class UserSpace extends Component {
  constructor(props) {
    super(props);

    this.state = {
      collectionCatalogModalShow: false,
      collectionCatalogModalDataset: null,
      collectionCatalogsOpen: true,
      collectionCatalogs: [],
      collectionCurrentCatalog: null,

      collectionDatasetModalShow: false,
      collectionDatasetModalDataset: null,
      collectionDatasetsOpen: true,
      collectionDatasets: [],
      collectionCurrentDataset: null,

      // vocabularyCatalogModalShow: false,
      // vocabularyCatalogModalDataset: null,
      // vocabularyCatalogsOpen: true,
      // vocabularyCatalogs: [],
      // vocabularyCurrentCatalog: null,

      vocabularyDatasetModalShow: false,
      vocabularyDatasetModalDataset: null,
      vocabularyDatasetsOpen: true,
      vocabularyDatasets: [],
      vocabularyCurrentDataset: null,

      annotationDatasetModalShow: false,
      annotationDatasetModalDataset: null,
      annotationDatasetsOpen: true,
      annotationDatasets: [],
      annotationCurrentDataset: null,

      alignmentDatasetModalShow: false,
      alignmentDatasetModalDataset: null,
      alignmentDatasetsOpen: true,
      alignmentDatasets: [],
      alignmentCurrentDataset: null,

      ownedPublishedDatasets: [],
      selectedOwnedPublishedDataset: null,

      campaignDatasets: [],
      // validatorDatasets: [],
      // selectedAssignedPublishedDataset: null,

      publishedVocabularies: [],

      queryOntologyProperties: [],
      // dataAnnotators: [],
      // tripleStores: [],
      indices: [],
      importTemplates: [],

      dataImportType: "datasets",
      dataImportCategory: "collections",

      publishedDataType: "datasets",
      publishedDataCategory: "collections",

      publishedDataOpen: true,
    };

     this.messageQueueMap = new Map();

     this.vocabularyTypes = [ { label: 'Temporal', uri: 'http://sw.islab.ntua.gr/semaspace/model/TemporalCollection' },
                              { label: 'Spatial', uri: 'http://sw.islab.ntua.gr/semaspace/model/SpatialCollection' },
                              { label: 'Thesaurus/Ontology', uri: 'http://sw.islab.ntua.gr/semaspace/model/ThesaurusCollection' },
                              { label: 'Assertion Box', uri: 'http://sw.islab.ntua.gr/semaspace/model/AssertionCollection' },]
  }

  get isValidator() { return this.props.user.type === 'VALIDATOR' }
  get isAdministrator() { return this.props.user.type === 'ADMINISTRATOR' }
  get isEditor() { return this.props.user.type === 'EDITOR'; }

  componentDidMount() {
  if (this.isEditor) {

    getDatasets('COLLECTION','DATASET')
      .then(collectionDatasets => {
        this.setState({ collectionDatasets });
      })

    getDatasets('VOCABULARY','DATASET')
      .then(vocabularyDatasets => {
        this.setState({ vocabularyDatasets });
      })

    getDatasets('ALIGNMENT','DATASET')
      .then(alignmentDatasets => {
        this.setState({ alignmentDatasets });
      })

    // getDatasets('ANNOTATION','DATASET')
    //   .then(annotationDatasets => {
    //     this.setState({ annotationDatasets });
    //   })

    // getDatasets('COLLECTION','CATALOG')
    //   .then(collectionCatalogs => {
    //     this.setState({ collectionCatalogs });
    //   })
    //
    // getDatasets('VOCABULARY','CATALOG')
    //   .then(vocabularyCatalogs => {
    //     this.setState({ vocabularyCatalogs });
    //   })

    getDatasets(null,'CATALOG')
      .then(collectionCatalogs => {
        this.setState({ collectionCatalogs });
      })


    this.getEditorDatasets()

    // getValidatorDatasets()
    //   .then(json => {
    //       const campaignDatasets  = json.map(el => {return { dataset: el, selected: false } } )
    //
    //       // var validatorDatasets = {}
    //       // for (let el of campaignDatasets) {
    //       //   for (var i in el.dataset.campaigns) {
    //       //     if (validatorDatasets.hasOwnProperty(el.dataset.campaigns[i])) {
    //       //         validatorDatasets[el.dataset.campaigns[i]].push(el)
    //       //     } else {
    //       //       validatorDatasets[el.dataset.campaigns[i]] = new Array(el)
    //       //     }
    //       //   }
    //       // }
    //       // this.setState({ campaignDatasets, validatorDatasets })
    //       this.setState({ campaignDatasets })
    //     })


      getEditorDatasets([ 'http://sw.islab.ntua.gr/semaspace/model/DataCollection', 'http://sw.islab.ntua.gr/semaspace/model/DataCatalog'])
          .then(json => {
              const ownedPublishedDatasets  = json.map(el => {return { dataset: el, selected: false } } )
              this.setState({ campaignDatasets: ownedPublishedDatasets })
            })

      getDataServices()
          .then(json => {
            if (json.annotators) {
              this.setState({ dataAnnotators: json.annotators.sort((a,b) => sortByField('title', a, b)) })
            }
            if (json.embedders) {
              this.setState({ dataEmbedders: json.embedders.sort((a,b) => sortByField('title', a, b)) })
            }

          })

      getPreprocessFunctions()
              .then(json => this.setState({ preprocessFunctions: json.functions.sort((a,b) => sortByField('uri', a, b)),
                                            preprocessOperations: json.operations.sort((a,b) => sortByField('name', a, b))}))

      getImportTemplates()
        .then(json => this.setState({ importTemplates: json }))
    }

    igetDatasets('http://sw.islab.ntua.gr/semaspace/model/VocabularyCollection')
      .then(json => {
        this.setState({ publishedVocabularies: json})
          // const publishedVocabularies  = json.map(el => {return { dataset: el, selected: false } } )
        })


    getRDFVocabularies()
          .then(json => this.setState({ rdfVocabularies: json}))

    getValidationModes()
          .then(json => this.setState({ validationModes: json}))

    getOntologyQueryProperties()
      .then(json => this.setState({ queryOntologyProperties: json}))

    // getTripleStores()
    //         .then(json => this.setState({ tripleStores: json }))

    getIndices()
            .then(json => this.setState({ indices: json }))

}

// update published datasets
getEditorDatasets() {
  var str;
  if (this.state.publishedDataType === 'datasets') {
    if (this.state.publishedDataCategory === 'collections') {
      str = 'http://sw.islab.ntua.gr/semaspace/model/DataCollection'
    } else if (this.state.publishedDataCategory === 'vocabularies') {
      str = 'http://sw.islab.ntua.gr/semaspace/model/VocabularyCollection'
    } else if (this.state.publishedDataCategory === 'alignments') {
      str = 'http://sw.islab.ntua.gr/semaspace/model/Alignment'
    }
  } else {
    str = 'http://sw.islab.ntua.gr/semaspace/model/DataCatalog'
  }

  getEditorDatasets( [str] )
    .then(json => {
        const ownedPublishedDatasets  = json.map(el => {return { dataset: el, selected: false } } )
        this.setState({ ownedPublishedDatasets })
        // if (this.state.campaignDatasets == null && this.state.publishedDataCategory === 'collections') { // the first time only
        //   this.setState({ campaignDatasets: ownedPublishedDatasets })
        // }
      })
}

handleMessage(message) {
    var field
    if (this.state.collectionCurrentDataset && this.state.collectionCurrentDataset.id === message.id) {
      field = 'collectionCurrentDataset';
    } else if (this.state.vocabularyCurrentDataset && this.state.vocabularyCurrentDataset.id === message.id) {
      field = 'vocabularyCurrentDataset';
    } else if (this.state.alignmentCurrentDataset && this.state.alignmentCurrentDataset.id === message.id) {
      field = 'alignmentCurrentDataset';
    }

    var obj = { ...this.state[field], [message.type +'State']: message.state }
    delete obj[message.type + 'Messages']
    delete obj[message.type + 'ExecutionInfo']
    delete obj[message.type + 'Count']

    obj = message.startedAt ? {...obj, [message.type + 'StartedAt']: message.startedAt } : obj
    obj = message.completedAt ? {...obj, [message.type + 'CompletedAt']: message.completedAt } : obj
    obj = message.messages ? {...obj, [message.type + 'Messages']: message.messages } : obj
    obj = message.executionInfo ? {...obj, [message.type + 'ExecutionInfo']: message.executionInfo } : obj
    obj = message.count ? {...obj, [message.type + 'Count']: message.count } : obj

    if (message.type === 'publish' && field != 'alignmentCurrentDataset') {
      obj = { ...obj, 'loadState': 'NOT_LOADED' }
    }

    return { [field]: obj }
  }


  handleServerEvent(message) {
    // console.log(message)
    if (message.state.startsWith("PUBLISHED") || message.state == "UNPUBLISHED" || message.state == "UNPUBLISHING") {
      this.getEditorDatasets(this.state.publishedDataType)
    }

    var id = message.id + ":" + message.type
    var queue = this.messageQueueMap.get(id)
    if (!queue) {
      queue = new MessageQueue(this, (message) => this.handleMessage(message))
      this.messageQueueMap.set(id, queue)
    }

    queue.push(message)

}

executeAction(action, params) {
  // console.log(action);
  // console.log(params);
  if (action === 'create-dataset') {
    var links = [];
    if (params.ontology) {
      links.push({ type: 'ABOX_FOR', value: params.ontology });
    }
    if (params.source) {
      links.push({ type: 'SOURCE', value: params.source });
    }
    if (params.target) {
      links.push({ type: 'TARGET', value: params.target });
    }
    if (params.id && params.id != null) {
      // updateDataset(params.id, params.name, params.identifier, params.visibility, params.triplestore, params.scope, params.type, params.uri, params.asProperty, links)
      updateDataset(params.id, params.name, params.identifier, params.visibility, params.scope, params.type, params.uri, params.asProperty, links, params.sparqlEndpoint, params.namedGraph)
        .then(response => {
          // if (params.type === 'dataset') {
          if (params.type === 'DATASET') {
            var datasets = this.state[params.scope.toLowerCase() + 'Datasets'].map(el => el.id === params.id ? response : el);
            this.setState( {[params.scope.toLowerCase() + 'Datasets']: datasets, [params.scope.toLowerCase() + 'CurrentDataset']: response } )

          // } else if (params.type === 'catalog') {
          } else if (params.type === 'CATALOG') {
            var catalogs = this.state[params.scope.toLowerCase() + 'Catalogs'].map(el => el.id === params.id ? response : el);
            this.setState( {[params.scope.toLowerCase() + 'Catalogs']: catalogs, [params.scope.toLowerCase() + 'CurrentCatalog']: response } )
          }
        });
    } else {
      // createDataset(params.template, params.name, params.identifier, params.visibility, params.triplestore, params.scope, params.type, params.uri, params.asProperty, links)
      createDataset(params.template, params.name, params.identifier, params.visibility,  params.scope, params.type, params.uri, params.asProperty, links, params.sparqlEndpoint, params.namedGraph)
        .then(response => {
          // if (params.type === 'dataset') {
          if (params.type === 'DATASET') {
            this.setState( {[params.scope.toLowerCase() + 'Datasets']: this.state[params.scope.toLowerCase() + 'Datasets'].slice().concat(response)} )
          // } else if (params.type === 'catalog') {
          } else if (params.type === 'CATALOG') {
            this.setState( {[params.scope.toLowerCase() + 'Catalogs']: this.state[params.scope.toLowerCase() + 'Catalogs'].slice().concat({...response, datasets:[]} )} )
          }
        });
      }
  } else if (action === 'select-dataset') {
      getDataset(params.id)
        .then(json => {
            this.setState({ [params.scope.toLowerCase() + 'CurrentDataset']: json })
        })
        window.scroll({ top: 0, left: 0, behavior: 'smooth' });
    } else if (action === 'select-catalog') {
         getDataset(params.id)
           .then(json => {
               this.setState({ collectionCurrentCatalog: json, collectionCurrentDataset: null, collectionCatalogDatasets: json.datasets, collectionCatalogDatasetsOpen: true })
           })
           window.scroll({ top: 0, left: 0, behavior: 'smooth' });

    } else  if (action === 'delete-dataset') {
      this.setState({ deleteModalShow:true, deleteModalCommand: 'delete-dataset', deleteModalParams:params})
    } else  if (action === 'delete-dataset-ok') {
      deleteDataset(params.id)
        .then(json => {
          if (json.success) {
            // if (params.type === 'catalog') {
            if (params.type === 'CATALOG') {
              var catalogs = this.state[params.scope.toLowerCase() + 'Catalogs'].filter(el => el.id !== params.id)
              this.setState( { [params.scope.toLowerCase() + 'Catalogs']: catalogs, [params.scope.toLowerCase() + 'CurrentDataset']: null, [params.scope.toLowerCase() + 'CurrentCatalog']: null} )
            // } else if (params.type === 'dataset') {
            } else if (params.type === 'DATASET')  {
              var datasets = this.state[params.scope.toLowerCase() + 'Datasets'].filter(el => el.id !== params.id)
              this.setState( {[params.scope.toLowerCase() + 'Datasets']: datasets, [params.scope.toLowerCase() + 'CurrentDataset']: null, [params.scope.toLowerCase() + 'CurrentCatalog']: null} )
            }
          }})
    } else if (action === 'add-dataset-to-catalog') {
      var datasets = this.state[params.scope.toLowerCase() + 'CurrentCatalog'].datasets.slice().concat(this.state[params.scope.toLowerCase() + 'Datasets'].filter(el => el.id === params.id))
      this.setState({ [params.scope.toLowerCase() + 'CurrentCatalog']: {...this.state[params.scope.toLowerCase() + 'CurrentCatalog'], datasets: datasets }});
    } else if (action === 'remove-dataset-from-catalog') {
      var datasets = this.state[params.scope.toLowerCase() + 'CurrentCatalog'].datasets.filter(el => el.id !== params.id)
      this.setState({ [params.scope.toLowerCase() + 'CurrentCatalog']: {...this.state[params.scope.toLowerCase() + 'CurrentCatalog'], datasets: datasets }});


    } else if (action === 'publish-dataset') {
      publishDataset(params.id, params.visibility, params.tripleStore)
        .then(response => {
          throwToast('success', response.message)
        })
        .catch(error => {
          throwToast('error', error.message);
        })
    } else if (action === 'publish-dataset-unpublished-content') {
      publishUnpublishedContent(params.id)
        .then(response => {
          throwToast('success', response.message)
        })
        .catch(error => {
          throwToast('error', error.message);
        })
    } else if (action === 'unpublish-dataset') {
      unpublishDataset(params.id)
        .then(response => {
          throwToast('success', response.message)
        })
        .catch(error => {
          throwToast('error', error.message);
        })
    } else if (action === 'republish-dataset') {
      republishDataset(params.id)
        .then(response => {
          throwToast('success', response.message)
        })
        .catch(error => {
          throwToast('error', error.message);
        })
    } else if (action === 'republish-dataset-metadata') {
      republishDatasetMetadata(params.id)
        .then(response => {
          throwToast('success', response.message)
        })
        .catch(error => {
          throwToast('error', error.message);
        })
    } else if (action === 'create-dataset-distribution') {
      createDatasetDistribution(params.id, params.classes, params.ttl, params.nt, params.serializationVocabulary, params.compress, params.license)
        .then(response => {
          throwToast('success', response.message)
        })
        .catch(error => {
          throwToast('error', error.message)
        })
    } else if (action === 'stop-create-dataset-distribution') {
      stopCreateDatasetDistribution(params.id)
        .then(response => {
          throwToast('success', response.message)
          this.setCurrentState(params, response.result)
        }).catch(error => {
          throwToast('error', error.message)
        })
    } else if (action === 'clear-dataset-distribution') {
      this.setState({ deleteModalShow: true, deleteModalCommand: 'clear-dataset-distribution', deleteModalParams: params})
    } else if (action === 'clear-dataset-distribution-ok') {
      clearDatasetDistribution(params.id)
        .then(response => {
          throwToast('success', response.message)
          this.resetCurrentState(params, 'createDistribution', 'NOT_EXECUTED')
        })
        .catch(error => {
          throwToast('error', error.message)
       })
    } else if (action === 'execute-all-mappings') {
      executeAllMappings(params.id)
        .then(response => {
          throwToast('success', response.message)
        }).catch(error => {
          throwToast('error', error.message)
      })
    } else if (action === 'execute-all-mappings-and-republish-dataset') {
      executeAllMappingsAndRepublish(params.id)
        .then(response => {
          throwToast('success', response.message)
        }).catch(error => {
          throwToast('error', error.message)
        })

    } else if (action === 'flip-dataset-visibility') {
        flipDatasetVisibility(params.id)
            // .then(() => this.updateState(params, 'UNPUBLISHING'))
    } else if (action === 'stop-indexing-dataset') {
      stopIndexingDataset(params.id, params.indexStructureId)
        .then(response => {
          throwToast('success', response.message)
          this.setCurrentState(params, response.result)
        }).catch(error => {
          throwToast('error', error.message)
        })
    } else if (action === 'unindex-dataset') {
      unindexDataset(params.id, params.indexStructureId)
        .then(response => {
          throwToast('success', response.message)
        }).catch(error => {
          throwToast('error', error.message)
        })
    } else if (action === 'update-dataset') {
      // if (params.type === 'dataset') {
      if (params.type === 'DATASET') {
        this.setState({ [params.scope.toLowerCase() + 'DatasetModalShow']: true, [params.scope.toLowerCase() + 'DatasetModalDataset']: this.state[params.scope.toLowerCase() + 'CurrentDataset'] ? this.state[params.scope.toLowerCase() + 'CurrentDataset'] : this.state[params.scope.toLowerCase() + 'CurrentCatalog']})
      } else {
        this.setState({ [params.scope.toLowerCase() + 'CatalogModalShow']: true, [params.scope.toLowerCase() + 'CatalogModalDataset']: this.state[params.scope.toLowerCase() + 'CurrentCatalog'] ? this.state[params.scope.toLowerCase() + 'CurrentCatalog'] : this.state[params.scope.toLowerCase() + 'CurrentCatalog']})
      }

    } else if (action === 'select-import') {
      if (params.dataImportType) {
        if (params.dataImportType === 'catalogs') {
           this.setState({ dataImportType: 'catalogs', dataImportCategory: null, collectionCurrentCatalog: null, collectionCurrentDataset: null, collectionCatalogDatasets: null });
        } else if (params.dataImportType === 'datasets') {
          this.setState({ dataImportType: 'datasets', dataImportCategory: this.state.dataImportCategory ? this.state.dataImportCategory : 'collections', collectionCurrentCatalog: null, collectionCatalogDatasets: null, collectionCurrentDataset: null, vocabularyCurrentDataset: null, alignmentCurrentDataset: null });
        }
      } else if (params.dataImportCategory) {
        this.setState({ dataImportCategory: params.dataImportCategory })
      }
    } else if (action === 'select-published') {
      var obj = {};
      if (params.publishedDataType) {
        if (params.publishedDataType === 'catalogs') {
           obj = { publishedDataType: 'catalogs', publishedDataCategory: null };
        } else if (params.publishedDataType === 'datasets') {
          obj = { publishedDataType: 'datasets', publishedDataCategory: this.state.publishedDataCategory ? this.state.publishedDataCategory : 'collections' };
        }
      } else if (params.publishedDataCategory) {
        obj = { publishedDataCategory: params.publishedDataCategory }
      }

      obj = {...obj, selectedOwnedPublishedDataset: null};

      this.setState(obj, () => this.getEditorDatasets());
    }
}

  setCurrentState(params, object) {
    if (object) {
      this.setState({ [this.buildCurrentField(params)]: object })
    }
  }

  resetCurrentState(params, level, state, startedAt, completedAt) {
    var currentField = this.buildCurrentField(params)

    var obj = {...this.state[currentField], [level + 'State']:state }

    if (startedAt) {
      obj = {...obj, [level + 'StartedAt']:startedAt }
    } else {
      delete obj.startedAt
    }

    if (completedAt) {
      obj = {...obj, [level + 'CompletedAt']:completedAt }
    } else {
      delete obj.startedAt
    }

    this.setState({ [currentField]: obj })
  }

  buildCurrentField(params) {
    return params.scope.toLowerCase() + 'Current' + params.type.charAt(0) + params.type.substring(1).toLowerCase()
  }

updateState(params, state, level) {
  if (level == null) {
    level = "publish"
  }

  if (params.type === 'CATALOG') {
    this.setState({ [params.scope.toLowerCase() + 'CurrentCatalog']: {...this.state[params.scope.toLowerCase() + 'CurrentCatalog'], [level + 'State']:state, [level + 'StartedAt']: new Date(), [level + 'CompletedAt']: null }})
  } else if (params.type === 'DATASET') {
    this.setState({ [params.scope.toLowerCase() + 'CurrentDataset']: {...this.state[params.scope.toLowerCase() + 'CurrentDataset'], [level + 'State']:state, [level + 'StartedAt']: new Date(), [level + 'CompletedAt']: null }})
  }
}


  publishedDatasetActions(action, params, type) {
    if (action === 'select-dataset') {
       this.setState({ ['selected' + type + 'PublishedDataset']: null}, () => this.setState({ ['selected' + type + 'PublishedDataset']: params.dataset}))
    }
  }

  isTemporal(dataset) {
    for (var i in dataset.typeUri) {
      if (dataset.typeUri[i]=== 'http://sw.islab.ntua.gr/semaspace/model/TemporalCollection') {
        return true;
      }
    }

    return false;
  }

  isSpatial(dataset) {
    for (var i in dataset.typeUri) {
      if (dataset.typeUri[i]=== 'http://sw.islab.ntua.gr/semaspace/model/SpatialCollection') {
        return true;
      }
    }

    return false;
  }

  isThesaurus(dataset) {
    for (var i in dataset.typeUri) {
      if (dataset.typeUri[i]=== 'http://sw.islab.ntua.gr/semaspace/model/ThesaurusCollection') {
        return true;
      }
    }

    return false;
  }

goToTopOfThePage(){
  window.scroll({
    top: 0,
    left: 0,
    behavior: 'smooth'
   });
}

  render() {

    var defaultTab;
    if (this.isEditor) {
      defaultTab = "import";
    } else if (this.isValidator) {
      defaultTab = "campaigns"
    } else if (this.isAdministrator) {
      defaultTab = "users"
    }

    return (
      <Container className="p-0">
        <Row>
          <Col>
            {this.props.user &&
            <SockJsClient url={WS_BASE_URL} topics={[
                '/monitor/' + this.props.user.id + '/mapping',
                '/monitor/' + this.props.user.id + '/dataset',
                '/monitor/' + this.props.user.id + '/annotator',
                '/monitor/' + this.props.user.id + '/embedder',
                '/monitor/' + this.props.user.id + '/index',
                '/monitor/' + this.props.user.id + '/filter_annotation_validation',
                '/monitor/' + this.props.user.id + '/paged_annotation_validation',
                '/monitor/' + this.props.user.id + '/user_task' ]}
                onMessage={(msg, topic) => {

                    if (topic === '/monitor/' + this.props.user.id + '/mapping') {
                      if (this.datasetEditor) {
                        this.datasetEditor.handleServerEvent('mapping', msg)
                      }
                      if (this.vocabularyDatasetEditor) {
                        this.vocabularyDatasetEditor.handleServerEvent('mapping', msg)
                      }
                      if (this.alignmentDatasetEditor) {
                        this.alignmentDatasetEditor.handleServerEvent('mapping', msg)
                      }
                    }
                    else if (topic === '/monitor/' + this.props.user.id + '/dataset') {
                      if (this.datasetEditor) {
                        this.datasetEditor.handleServerEvent('dataset', msg)
                      }
                      if (this.vocabularyDatasetEditor) {
                        this.vocabularyDatasetEditor.handleServerEvent('dataset', msg)
                      }
                      this.handleServerEvent(msg)
                    }
                    else if (topic === '/monitor/' + this.props.user.id + '/index') {
                      if (this.datasetEditor) {
                        this.datasetEditor.handleServerEvent('index', msg)
                      }
                      if (this.vocabularyDatasetEditor) {
                        this.vocabularyDatasetEditor.handleServerEvent('index', msg)
                      }
                    }
                    else if (topic === '/monitor/' + this.props.user.id + '/user_task') {
                      if (this.datasetEditor) {
                        this.datasetEditor.handleServerEvent('user_task', msg)
                      }
                      if (this.vocabularyDatasetEditor) {
                        this.vocabularyDatasetEditor.handleServerEvent('user_task', msg)
                      }
                    }
                    else if (topic === '/monitor/' + this.props.user.id + '/annotator') {
                      if (this.ownedPublishedSchema) {
                        this.ownedPublishedSchema.handleServerEvent('annotator', msg)
                      }
                    }
                    else if (topic === '/monitor/' + this.props.user.id + '/embedder') {
                      if (this.ownedPublishedSchema) {
                        this.ownedPublishedSchema.handleServerEvent('embedder', msg)
                      }
                    }

                    else if (topic === '/monitor/' + this.props.user.id + '/filter_annotation_validation') {
                      if (this.ownedPublishedSchema) {
                        this.ownedPublishedSchema.handleServerEvent('filter_annotation_validation', msg)
                      }
                    }
                    else if (topic === '/monitor/' + this.props.user.id + '/paged_annotation_validation') {
                      if (this.ownedPublishedSchema) {
                        this.ownedPublishedSchema.handleServerEvent('paged_annotation_validation', msg)
                      }
                    }
                  }
                }
                onConnect={() => {console.log("ws connected")}}
                onConnectFailure={() => {console.log("failed to connect")}}
             />}

            <Tabs defaultActiveKey={defaultTab} mountOnEnter className={this.props.user.type.toLowerCase() + "-tabs"}>

              {this.isEditor &&
              <Tab eventKey="import" title="Data Import">
                <Container className="pl-2 pr-2">
                  <Row>
                    <Col md={3}>

                      <Row>
                        <Col className="align-self-center mb-2">
                          <ButtonGroup className="choice-buttons">
                            <Button className="data-choice-button" variant={this.state.dataImportType === "catalogs"? "danger" : "secondary"} onClick={() => this.executeAction('select-import', { dataImportType: "catalogs"})}>Catalogs</Button>
                            <Button className="data-choice-button" variant={this.state.dataImportType === "datasets"? "danger" : "secondary"} onClick={() => this.executeAction('select-import', { dataImportType: "datasets"})}>Datasets</Button>
                          </ButtonGroup>
                        </Col>
                      </Row>

                      {this.state.dataImportType === "datasets" &&
                      <Row>
                        <Col className="align-self-center data-import-buttons">
                          <ButtonGroup className="choice-buttons">
                            <Button className="data-choice-button" variant={this.state.dataImportCategory === "collections"? "danger" : "secondary"} onClick={() => this.executeAction('select-import', { dataImportCategory: "collections"})}>Collections</Button>
                            <Button className="data-choice-button" variant={this.state.dataImportCategory === "vocabularies"? "danger" : "secondary"} onClick={() => this.executeAction('select-import', { dataImportCategory: "vocabularies"})}>Vocabularies</Button>
                            <Button className="data-choice-button" variant={this.state.dataImportCategory === "alignments"? "danger" : "secondary"} onClick={() => this.executeAction('select-import', { dataImportCategory: "alignments"})}>Alignments</Button>
                          </ButtonGroup>
                        </Col>
                      </Row>}

                      {this.state.dataImportType === "catalogs" &&
                      <Container className={this.state.collectionCatalogs && this.state.collectionCatalogs.length > 0 ? "groupborder" : "groupborder-empty"}>
                        <Row className={this.state.collectionCatalogs && this.state.collectionCatalogs.length > 0 ? "header" : "header-empty"}>
                          <Col>
                            Catalogs
                          </Col>

                          {toggleBoxColumn('collectionCatalogsOpen', this, 'collectionCatalogs')}

                          <Col className="mybutton" md="auto">
                            {actionsMenu(
                            <div>
                              <Dropdown.Item className="py-2"
                                             onClick={() => this.setState({ collectionCatalogModalShow: true, collectionCatalogModalDataset: null})}>
                                <span className="menu-icon fa fa-plus fa-lg mr-3" />New catalog...
                              </Dropdown.Item>
                            </div>)}

                            {this.state.collectionCatalogModalShow &&
                            <NewMappingModal show={this.state.collectionCatalogModalShow}
                                             type='CATALOG'
                                             tripleStores={this.props.database.tripleStores}
                                             templates={this.state.importTemplates.catalogTemplates}
                                             visibility={true}
                                             dataset={this.state.collectionCatalogModalDataset}
                                             onOK={(id, template, name, identifier, visibility) => {this.executeAction('create-dataset', {id: id, template: template, name: name, identifier: identifier, visibility: visibility, scope: 'COLLECTION', type:'CATALOG', uri: 'http://sw.islab.ntua.gr/semaspace/model/DataCatalog'}); this.setState({ collectionCatalogModalShow: false})}}
                                             onClose={() => this.setState({ collectionCatalogModalShow: false})}/>}
                          </Col>
                        </Row>

                        <Collapse in={this.state.collectionCatalogsOpen}>
                          <div>
                            {this.state.collectionCatalogs.map((el,index) => (
                            <Row key={index}>
                              <Col md={12} className={"text-truncate" + (this.state.collectionCurrentCatalog && this.state.collectionCurrentCatalog.id === el.id? " selected-item" : "")}>
                                <span className="lbutton alink" onClick={() => this.executeAction('select-catalog', {id: el.id})}>
                                {el.name}
                                </span>
                              </Col>
                            </Row>))}
                          </div>
                        </Collapse>
                      </Container>}

                      {this.state.dataImportType === "catalogs" && this.state.collectionCurrentCatalog &&
                      <Row>
                        <Col className="in-down">
                          <span className='crimson-std fa fa-angle-down fa-lg'></span>
                        </Col>
                      </Row>}

                      {this.state.dataImportType === "catalogs" && this.state.collectionCurrentCatalog &&
                      <Container className={this.state.collectionCatalogDatasets && this.state.collectionCatalogDatasets.length > 0 ? "groupborder" : "groupborder-empty"}>
                        <Row className={this.state.collectionCatalogDatasets && this.state.collectionCatalogDatasets.length > 0 ? "header" : "header-empty"}>
                          <Col>
                            Collections
                          </Col>

                          {toggleBoxColumn('collectionCatalogDatasetsOpen', this, 'collectionCatalogDatasets')}

                          {/*<Col className="mybutton" md="auto">
                            {actionsMenu(
                            <div>
                              <Dropdown.Item className="py-2"
                                             onClick={() => this.setState({ collectionDatasetModalShow: true, collectionDatasetModalDataset: null})}>
                                <span className="menu-icon fa fa-plus fa-lg mr-3" />New collection...
                              </Dropdown.Item>
                            </div>)}

                            {this.state.collectionDatasetModalShow &&
                            <NewMappingModal show={this.state.collectionDatasetModalShow}
                                             type='DATASET'
                                             tripleStores={this.props.database.tripleStores}
                                             templates={this.state.importTemplates.datasetTemplates}
                                             visibility={true}
                                             dataset={this.state.collectionDatasetModalDataset}
                                             onOK={(id, template, name, identifier, visibility, triplestore) => {this.executeAction('create-dataset', {id: id, template: template, name: name, identifier: identifier, visibility: visibility, triplestore: triplestore, scope: 'COLLECTION', type:'DATASET', uri: 'http://sw.islab.ntua.gr/semaspace/model/DataCollection'}); this.setState({ collectionDatasetModalShow: false})}}
                                             onClose={() => this.setState({ collectionDatasetModalShow: false})}/>}
                          </Col> */}
                        </Row>

                        <Collapse in={this.state.collectionCatalogDatasetsOpen}>
                          <div>
                            {this.state.collectionCatalogDatasets.sort((a,b) => sortByField('name', a, b)).map((el,index) => (
                            <Row key={index}>
                              <Col md={12} className={"text-truncate" + (this.state.collectionCurrentDataset && this.state.collectionCurrentDataset.id === el.id? " selected-item" : "")}>
                                <span className="lbutton alink" onClick={() => this.executeAction('select-dataset', {id: el.id, scope: 'COLLECTION', type: 'DATASET'})}>
                                {el.name}
                                </span>
                              </Col>
                            </Row>))}
                          </div>
                        </Collapse>
                      </Container>}

                      {this.state.dataImportType === "datasets" && this.state.dataImportCategory === "collections" &&
                      <Container className={this.state.collectionDatasets && this.state.collectionDatasets.length > 0 ? "groupborder" : "groupborder-empty"}>
                        <Row className={this.state.collectionDatasets && this.state.collectionDatasets.length > 0 ? "header" : "header-empty"}>
                          <Col>
                            Collections
                          </Col>

                          {toggleBoxColumn('collectionDatasetsOpen', this, 'collectionDatasets')}

                          <Col className="mybutton" md="auto">
                            {actionsMenu(
                            <div>
                              <Dropdown.Item className="py-2"
                                             onClick={() => this.setState({ collectionDatasetModalShow: true, collectionDatasetModalDataset: null})}>
                                <span className="menu-icon fa fa-plus fa-lg mr-3" />New collection...
                              </Dropdown.Item>
                            </div>)}

                            {this.state.collectionDatasetModalShow &&
                            <NewMappingModal show={this.state.collectionDatasetModalShow}
                                             type='DATASET' category='COLLECTION'
                                             tripleStores={this.props.database.tripleStores}
                                             templates={this.state.importTemplates.datasetTemplates}
                                             visibility={true}
                                             dataset={this.state.collectionDatasetModalDataset}
                                             onOK={(id, template, name, identifier, visibility, uri, property, clazz, ontology, sparqlEndpoint, namedGraph) => {this.executeAction('create-dataset', {id: id, template: template, name: name, identifier: identifier, visibility: visibility, scope: 'COLLECTION', type:'DATASET', uri: 'http://sw.islab.ntua.gr/semaspace/model/DataCollection', sparqlEndpoint, namedGraph}); this.setState({ collectionDatasetModalShow: false})}}
                                             onClose={() => this.setState({ collectionDatasetModalShow: false})}/>}
                          </Col>
                        </Row>

                        <Collapse in={this.state.collectionDatasetsOpen}>
                          <div>
                            {this.state.collectionDatasets.sort((a,b) => sortByField('name', a, b)).map((el,index) => (
                            <Row key={index}>
                              <Col md={12} className={"text-truncate" + (this.state.collectionCurrentDataset && this.state.collectionCurrentDataset.id === el.id? " selected-item" : "")}>
                                <span className="lbutton alink" onClick={() => this.executeAction('select-dataset', {id: el.id, scope: 'COLLECTION', type: 'DATASET'})}>
                                {el.name}
                                </span>
                              </Col>
                            </Row>))}
                          </div>
                        </Collapse>
                      </Container>}
                      {/*this.state.dataImportCategory === "vocabularies" &&
                      <Container className={this.state.vocabularyCatalogs && this.state.vocabularyCatalogs.length > 0 ? "groupborder" : "groupborder-empty"}>
                        <Row className={this.state.vocabularyCatalogs && this.state.vocabularyCatalogs.length > 0 ? "header" : "header-empty"}>
                          <Col>
                            Vocabulary catalogs
                          </Col>

                          {toggleBoxColumn('vocabularyCatalogsOpen', this, 'vocabularyCatalogs')}

                          <Col className="mybutton" md="auto">
                            {actionsMenu(
                            <div>
                              <Dropdown.Item className="py-2"
                                             onClick={() => this.setState({ vocabularyCatalogModalShow: true, vocabularyCatalogModalDataset: null})}>
                                <span className="menu-icon fa fa-plus fa-lg mr-3" />New vocabulary catalog...
                              </Dropdown.Item>
                            </div>)}

                            {this.state.vocabularyCatalogModalShow &&
                            <NewMappingModal show={this.state.vocabularyCatalogModalShow}
                                             type='CATALOG'
                                             tripleStores={this.props.database.tripleStores}
                                             dataset={this.state.vocabularyCatalogModalDataset}
                                             onOK={(id, template, name, identifier, visibility, triplestore) => {this.executeAction('create-dataset', {id: id, template: template, name: name, identifier: identifier, visibility: visibility, triplestore: triplestore, scope: 'VOCABULARY', uri: 'http://sw.islab.ntua.gr/semaspace/model/DataCatalog', type:'CATALOG'}); this.setState({ vocabularyCatalogModalShow: false})}}
                                             onClose={() => this.setState({ vocabularyCatalogModalShow: false})}/>}
                          </Col>
                        </Row>

                        <Collapse in={this.state.vocabularyCatalogsOpen}>
                          <div>
                            {this.state.vocabularyCatalogs.map((el,index) => (
                            <Row key={index}>
                              <Col>
                                <span className="lbutton alink" onClick={() => this.executeAction('select-dataset', {id: el.id, scope: 'VOCABULARY', type: 'CATALOG'})}>
                                {el.name}
                                </span>
                              </Col>
                            </Row>))}
                          </div>
                        </Collapse>
                      </Container>*/}

                      {this.state.dataImportType === "datasets" && this.state.dataImportCategory === "vocabularies" &&
                      <Container className={this.state.vocabularyDatasets && this.state.vocabularyDatasets.length > 0 ? "groupborder" : "groupborder-empty"}>
                        <Row className={this.state.vocabularyDatasets && this.state.vocabularyDatasets.length > 0 ? "header" : "header-empty"}>
                          <Col>
                            {Localizer.vocabularies[this.props.language]}
                          </Col>

                          {toggleBoxColumn('vocabularyDatasetsOpen', this, 'vocabularyDatasets')}

                          <Col className="mybutton" md="auto">
                            {actionsMenu(
                            <div>
                              <Dropdown.Item className="py-2"
                                             onClick={() => this.setState({ vocabularyDatasetModalShow: true, vocabularyDatasetModalDataset: null})}>
                                <span className="menu-icon fa fa-plus fa-lg mr-3" />New vocabulary...
                              </Dropdown.Item>
                            </div>)}

                            {this.state.vocabularyDatasetModalShow &&
                            <NewMappingModal show={this.state.vocabularyDatasetModalShow}
                                              type='DATASET' category='VOCABULARY'
                                              tripleStores={this.props.database.tripleStores}
                                              visibility={true}
                                              dataset={this.state.vocabularyDatasetModalDataset}
                                              types={this.vocabularyTypes}
                                              vocabularies={this.state.publishedVocabularies}
                                              onOK={(id, template, name, identifier, visibility, uri, property, clazz, ontology, sparqlEndpoint, namedGraph) => {this.executeAction('create-dataset', {id: id, template: template, name: name, identifier: identifier, visibility: visibility, scope: 'VOCABULARY', type:'DATASET', uri: uri, ontology:ontology, sparqlEndpoint, namedGraph}); this.setState({ vocabularyDatasetModalShow: false})}}
                                              onClose={() => this.setState({ vocabularyDatasetModalShow: false})}/>}
                          </Col>
                        </Row>

                        <Collapse in={this.state.vocabularyDatasetsOpen}>
                          <div>
                            {this.state.vocabularyDatasets.sort((a,b) => sortByField('name', a, b)).map((el,index) => (
                            <Row key={index} className={"text-truncate" + (this.state.vocabularyCurrentDataset && this.state.vocabularyCurrentDataset.id === el.id? " selected-item" : "")}>
                              <Col md={2} className="align-self-center">
                                {this.isTemporal(el) && <i className="fa fa-calendar"></i>}
                                {this.isSpatial(el) && <i className="fa fa-globe"></i>}
                                {this.isThesaurus(el) && <i className="fa fa-list"></i>}
                              </Col>
                              <Col md={10} >
                                <span className="lbutton alink" onClick={() => this.executeAction('select-dataset', {id: el.id, scope: 'VOCABULARY',type: 'DATASET'})}>
                                {el.name}
                                </span>
                              </Col>
                            </Row>))}
                          </div>
                        </Collapse>
                      </Container>}

                      {this.state.dataImportType === "datasets" && this.state.dataImportCategory === "alignments" &&
                      <div>
  {/*                      <Container  className="groupborder">
                          <Row className="header">
                            <Col>
                              Groups
                            </Col>
                            <Col className="mybutton" md="auto">
                              <Button type="button" className="menubutton"  aria-label="Add"  onClick={() => this.setState({ vocabularyCatalogModalShow: true})}><span className='fa fa-plus'></span></Button>
                              <NewMappingModal type='Vocabulary Group' show={this.state.vocabularyCatalogModalShow}
                                           onOK={(name) => {this.executeAction('create-dataset', {name: name, scope: 'vocabulary', type:'catalog'}); this.setState({ vocabularyCatalogModalShow: false})}}
                                           onClose={() => this.setState({ vocabularyCatalogModalShow: false})}/>
                            </Col>
                            <Col className="mybutton" md="auto">
                              <Button type="button" className="menubutton"  aria-label="Toggle" onClick={() => this.setState({ vocabularyCatalogsOpen: !this.state.vocabularyCatalogsOpen})}><span className={this.state.vocabularyCatalogsOpen ? 'fa fa-angle-double-up' : 'fa fa-angle-double-down'}></span></Button>
                            </Col>
                          </Row>
                          {this.state.vocabularyCatalogs.map((el,index) => (
                          <Row key={index}>
                            <Col>
                              <span className="abutton" onClick={() => this.executeAction('select-dataset', {id: el.id, scope: 'vocabulary', type: 'catalog'})}>
                              {el.name}
                              </span>
                            </Col>
                          </Row>))}
                        </Container> */}

                        <Container className={this.state.alignmentDatasets && this.state.alignmentDatasets.length > 0 ? "groupborder" : "groupborder-empty"}>
                          <Row className={this.state.alignmentDatasets && this.state.alignmentDatasets.length > 0 ? "header" : "header-empty"}>
                            <Col>
                              {Localizer.alignments[this.props.language]}
                            </Col>

                            {toggleBoxColumn('alignmentDatasetsOpen', this, 'alignmentDatasets')}

                            <Col className="mybutton" md="auto">
                              {actionsMenu(
                              <div>
                                <Dropdown.Item className="py-2"
                                               onClick={() => this.setState({ alignmentDatasetModalShow: true, alignmentDatasetModalDataset: null})}>
                                  <span className="menu-icon fa fa-plus fa-lg mr-3" />New alignment...
                                </Dropdown.Item>
                              </div>)}

                              {this.state.alignmentDatasetModalShow &&
                              <NewAlignmentModal show={this.state.alignmentDatasetModalShow}
                                                 type='ALIGNMENT'
                                                 dataset={this.state.alignmentDatasetModalDataset}
                                                 types={this.vocabularyTypes}
                                                 vocabularies={this.state.publishedVocabularies}
                                                 onOK={(id, name, uri, source, target) => {this.executeAction('create-dataset', {id: id, name: name, scope:'ALIGNMENT', type:'DATASET', uri: uri, source:source, target:target}); this.setState({ alignmentDatasetModalShow: false})}}
                                                 onClose={() => this.setState({ alignmentDatasetModalShow: false})}/>}
                            </Col>
                          </Row>

                          <Collapse in={this.state.alignmentDatasetsOpen}>
                            <div>
                              {this.state.alignmentDatasets.sort((a,b) => sortByField('name', a, b)).map((el,index) => (
                              <Row key={index}>
                                <Col md={12} className={"text-truncate" + (this.state.alignmentCurrentDataset && this.state.alignmentCurrentDataset.id === el.id? " selected-item" : "")}>
                                  <span className="lbutton alink" onClick={() => this.executeAction('select-dataset', {id: el.id, scope: 'ALIGNMENT', type: 'DATASET'})}>
                                  {el.name}
                                  </span>
                                </Col>
                              </Row>))}
                            </div>
                          </Collapse>
                        </Container>
                      </div>}
                    </Col>

                    {(this.state.dataImportType === "catalogs" || this.state.dataImportCategory === "collections") &&
                    <Col className="import-right">

                    {this.state.dataImportType === "catalogs" && !this.state.collectionCurrentCatalog &&
                    <Container className="groupborder">
                      <Row className="mt-4 text-center">
                        <Col>Select a catalog from the left to view, or click the <span className="fa fa-bars fa-md m-2"/> button to create a new one.</Col>
                      </Row>
                    </Container>}

                    {this.state.dataImportType === "collections" && !this.state.collectionCurrentDataset &&
                    <Container className="groupborder">
                      <Row className="mt-4 text-center">
                        <Col>Select a collection from the left to view, or click the <span className="fa fa-bars fa-md m-2"/> button to create a new one.</Col>
                      </Row>
                    </Container>}

                    {((this.state.dataImportType === "catalogs" && this.state.collectionCurrentCatalog) || this.state.dataImportCategory === "collections")

                        && (this.state.collectionCurrentDataset || this.state.collectionCurrentCatalog) &&
                        <DatasetEditor
                          ref={node => (this.datasetEditor = node)}
                          user={this.props.user}
                          database={this.props.database}
                          visibility={true}
                          datasets={this.state.collectionDatasets}
                          vocabularies={this.state.vocabularyDatasets}
                          templates={this.state.importTemplates.mappingSampleTemplates}
                          alignments={this.state.alignmentDatasets}
                          type = {this.state.collectionCurrentDataset ? 'DATASET' : 'CATALOG'}
                          scope = 'COLLECTION'
                          dataset={this.state.collectionCurrentDataset ? this.state.collectionCurrentDataset : this.state.collectionCurrentCatalog}
                          metadata={true}
                          indices={this.state.indices}
                          actions={(action, params) => this.executeAction(action, { ...params, scope:'COLLECTION'})}/>}
                    </Col>}

                    {this.state.dataImportCategory === "vocabularies" &&
                    <Col>

                      {!this.state.vocabularyCurrentDataset &&
                      <Container className="groupborder">
                        <Row className="mt-4 text-center">
                          <Col>Select a vocabulary from the left to view, or click the <span className="fa fa-bars fa-md m-2"/> button to create a new one.</Col>
                        </Row>
                      </Container>}

                       {(this.state.vocabularyCurrentCatalog || this.state.vocabularyCurrentDataset) &&
                       <DatasetEditor ref={node => (this.vocabularyDatasetEditor = node)}
                                      user={this.props.user}
                                      database={this.props.database}
                                      visibility={true}
                                      datasets={this.state.vocabularyDatasets}
                                      templates={this.state.importTemplates.mappingSampleTemplates}
                                      type = {this.state.vocabularyCurrentDataset ? 'DATASET' : 'CATALOG'}
                                      scope = 'VOCABULARY'
                                      dataset={this.state.vocabularyCurrentDataset ? this.state.vocabularyCurrentDataset : this.state.vocabularyCurrentCatalog}
                                      metadata={true}
                                      indices={this.state.indices}
                                      actions={(action, params) => this.executeAction(action, { ...params, scope:'VOCABULARY'})}/>}
                    </Col>}

                    {this.state.dataImportCategory === "alignments" &&
                    <Col>

                      {!this.state.alignmentCurrentDataset &&
                      <Container className="groupborder">
                        <Row className="mt-4 text-center">
                          <Col>Select an alignment from the left to view, or click the <span className="fa fa-bars fa-md m-2"/> button to create a new one.</Col>
                        </Row>
                      </Container>}
{/*                      {this.state.alignmentCurrentCatalog &&
                      <CatalogEditor user={this.props.user}
                                     datasets={this.state.alignmentDatasets}
                                     catalog={this.state.alignmentCurrentCatalog}
                                     actions={(action, params) => this.executeAction(action, { ...params, scope:'alignment'})}/>} */}
                      {this.state.alignmentCurrentDataset &&
                      <DatasetEditor ref={node => (this.alignmentDatasetEditor = node)}
                                     user={this.props.user}
                                     database={this.props.database}
                                     templates={this.state.importTemplates.mappingSampleTemplates}
                                     visibility={false}
                                     type = 'DATASET'
                                     scope = 'ALIGNMENT'
                                     dataset={this.state.alignmentCurrentDataset}
                                     indices={this.state.indices}
                                     actions={(action, params) => this.executeAction(action, { ...params, scope:'ALIGNMENT'})}/>}
                    </Col>}
                  </Row>

                </Container>
              </Tab>}

{/*
              <Tab eventKey="annotations" title={Localizer.annotations_import[this.props.language]}>
                <Container>
                  <Row>
                    <Col md={3}>
                      <Container  className="groupborder">
                        <Row className="header">
                          <Col>
                            {Localizer.annotations[this.props.language]}
                          </Col>
                          <Col className="mybutton" md="auto">
                            <Button type="button" className="menubutton"  aria-label="Add"  onClick={() => this.setState({ annotationDatasetModalShow: true})}><span className='fa fa-plus'></span></Button>
                            <NewMappingModal type='Annotation' show={this.state.annotationDatasetModalShow}
                                         queryProperties={this.state.queryOntologyProperties}
                                         onOK={(name, type, property) => {this.executeAction('create-dataset', {name: name, scope: 'annotation', type:'dataset', uri: 'http://sw.islab.ntua.gr/semaspace/model/AnnotationSet', asProperty: property}); this.setState({ newAnnotationDatasetModalShow: false})}}
                                         onClose={() => this.setState({ annotationDatasetModalShow: false})}/>
                          </Col>
                          <Col className="mybutton" md="auto">
                            <Button type="button" className="menubutton"  aria-label="Toggle" onClick={() => this.setState({ annotationDatasetsOpen: !this.state.annotationDatasetsOpen})}><span className={this.state.annotationDatasetsOpen ? 'fa fa-angle-double-up' : 'fa fa-angle-double-down'}></span></Button>
                          </Col>
                        </Row>
                        {this.state.annotationDatasets.sort(this.sortbyname).map((el,index) => (
                        <Row key={index}>
                          <Col>
                            <span className="lbutton alink" onClick={() => this.executeAction('select-dataset', {id: el.id, scope: 'annotation',type: 'dataset'})}>
                            {el.name}
                            </span>
                          </Col>
                        </Row>))}
                      </Container>
                    </Col>
                    <Col>
                      {this.state.annotationCurrentDataset &&
                      <DatasetEditor ref={node => (this.annotationDatasetEditor = node)}
                                     user={this.props.user}
                                     visibility={false}
                                     type = 'dataset'
                                     dataset={this.state.annotationCurrentDataset}
                                     actions={(action, params) => this.executeAction(action, { ...params, scope:'annotation'})}/>}
                    </Col>
                  </Row>
                </Container>
              </Tab> */}

              {this.isEditor &&
              <Tab eventKey="published_data" title={Localizer.published_datasets[this.props.language]}>
                <Container className="pl-2">
                  <Row>
                    <Col md={3}>

                      <Row>
                        <Col className="align-self-center mb-2">
                          <ButtonGroup className="choice-buttons">
                            <Button className="data-choice-button" variant={this.state.publishedDataType === "catalogs"? "danger" : "secondary"} onClick={() => this.executeAction('select-published', { publishedDataType: "catalogs"})}>Catalogs</Button>
                            <Button className="data-choice-button" variant={this.state.publishedDataType === "datasets"? "danger" : "secondary"} onClick={() => this.executeAction('select-published', { publishedDataType: "datasets"})}>Datasets</Button>
                          </ButtonGroup>
                        </Col>
                      </Row>

                      {this.state.publishedDataType === "datasets" &&
                      <Row>
                        <Col className="align-self-center data-import-buttons">
                          <ButtonGroup className="choice-buttons">
                            <Button className="data-choice-button" variant={this.state.publishedDataCategory === "collections"? "danger" : "secondary"} onClick={() => this.executeAction('select-published', { publishedDataCategory: "collections"})}>Collections</Button>
                            <Button className="data-choice-button" variant={this.state.publishedDataCategory === "vocabularies"? "danger" : "secondary"} onClick={() => this.executeAction('select-published', { publishedDataCategory: "vocabularies"})}>Vocabularies</Button>
                            <Button className="data-choice-button" variant={this.state.publishedDataCategory === "alignments"? "danger" : "secondary"} onClick={() => this.executeAction('select-published', { publishedDataCategory: "alignments"})}>Alignments</Button>
                          </ButtonGroup>
                        </Col>
                      </Row>}

                      <Container className={this.state.ownedPublishedDatasets && this.state.ownedPublishedDatasets.length > 0 ? "groupborder" : "groupborder-empty"}>
                        <Row className={this.state.ownedPublishedDatasets && this.state.ownedPublishedDatasets.length > 0 ? "header" : "header-empty"}>
                          {this.state.publishedDataType == "catalogs" && <Col>Catalogs</Col>}
                          {this.state.publishedDataType == "datasets" && this.state.publishedDataCategory === "collections" && <Col>Collections</Col>}
                          {this.state.publishedDataType == "datasets" && this.state.publishedDataCategory === "vocabularies" && <Col>Vocabularies</Col>}
                          {this.state.publishedDataType == "datasets" && this.state.publishedDataCategory === "alignments" && <Col>Alignments</Col>}

                          {toggleBoxColumn('publishedDataOpen', this, 'ownedPublishedDatasets')}
                        </Row>

                        <Collapse in={this.state.publishedDataOpen}>
                            <Datasets user={this.props.currentUser}
                                        datasets={this.state.ownedPublishedDatasets}
                                        language={this.props.language}
                                        actions={(action, params) => this.publishedDatasetActions(action, params, 'Owned')}/>
                        </Collapse>
                      </Container>
                    </Col>
                    <Col>
                    <Container className="userspace-right">
                      <Row className=" userspace-right-inner">
                        <Container>

                        {!this.state.selectedOwnedPublishedDataset &&
                        <Container className="groupborder">
                          <Row className="mt-4 text-center">
                            <Col>Select a catalog or dataset (collection, vocabulary, alignment) from  the left to view.</Col>
                          </Row>
                        </Container>}

                          <Row>
                            <Col>
                              <PublishedSchema ref={node => (this.ownedPublishedSchema = node)}
                                               mode='EDITOR'
                                               language={this.props.language}
                                               database={this.props.database}
                                               schemaDataset={this.state.selectedOwnedPublishedDataset}
                                               queryProperties={this.state.queryOntologyProperties}
                                               dataAnnotators={this.state.dataAnnotators}
                                               dataEmbedders={this.state.dataEmbedders}
                                               preprocessFunctions={this.state.preprocessFunctions}
                                               preprocessOperations={this.state.preprocessOperations}
                                               vocabularies={this.state.publishedVocabularies}
                                               rdfVocabularies={this.state.rdfVocabularies}
                                               validationModes={this.state.validationModes}/>
                              </Col>
                            </Row>
                          </Container>
                        </Row>
                      </Container>
                    </Col>
                  </Row>
                </Container>
              </Tab>}

              {(this.isEditor || this.isValidator) &&
              <Tab eventKey="campaigns" title="Campaigns">
                <CampaignsTab mode={this.isValidator ? 'VALIDATOR' : 'EDITOR'}
                              language={this.props.language}
                              database={this.props.database}
                              datasets={this.state.campaignDatasets}
                              rdfVocabularies={this.state.rdfVocabularies}/>
              </Tab>}

              {/*this.isValidator && this.state.assignedPublishedDatasets.length > 0 &&
              <Tab eventKey="schema_assigned" title={Localizer.assigned_datasets[this.props.language]}>
                <Container>
                  <Row>
                    <Col md={3}>
                      <Container  className="groupborder pb-0">
                        <Row className="header mb-0">
                          <Col>
                            {Localizer.assigned_datasets[this.props.language]}
                          </Col>
                        </Row>
                        <Row className="content">
                          <Accordion defaultActiveKey="group-0" bsPrefix="accordion w-100">
                            {Array.from(Object.keys(this.state.validatorDatasets)).map((key,index) => (
                              <Card key={"editor-batch-"+key}>
                                <Accordion.Toggle as={Card.Header} eventKey={"group-"+index} className="datasetGrouping-header">
                                  <span className="font-weight-bold">{key}</span>
                                </Accordion.Toggle>
                                <Accordion.Collapse eventKey={"group-"+index}>
                                  <Card.Body bsPrefix="card-body p-0">
                                    <Datasets
                                      user={this.props.currentUser}
                                      type="assigned-datasets"
                                      datasets={this.state.validatorDatasets[key]}
                                      language={this.props.language}
                                      actions={(action, params) => this.publishedDatasetActions(action, params, 'Assigned')}
                                    />
                                  </Card.Body>
                                </Accordion.Collapse>
                              </Card>
                            ))}
                          </Accordion>
                        </Row>
                      </Container>
                    </Col>
                    <Col>
                      <PublishedSchema ref={node => (this.assignedPublishedSchema = node)}
                                       mode='VALIDATOR'
                                       database={this.props.database}
                                       language={this.props.language}
                                       schemaDataset={this.state.selectedAssignedPublishedDataset}
                                       queryProperties={this.state.queryOntologyProperties}
                                       dataAnnotators={this.state.dataAnnotators}
                                       preprocessFunctions={this.state.preprocessFunctions}
                                       preprocessOperations={this.state.preprocessOperations}
                                       vocabularies={this.state.publishedVocabularies}
                                       rdfVocabularies={this.state.rdfVocabularies}/>
                    </Col>
                  </Row>
                </Container>
              </Tab>*/}

              {/*!(this.isValidator) &&
                <Tab eventKey="validation-progress" title={Localizer.validation_progress[this.props.language]}>
                  <ValidationProgress
                    datasets={this.state.ownedPublishedDatasets}
                    language={this.props.language}
                  />
                </Tab>
              */}

              {this.isEditor &&
              <Tab eventKey="task_monitor" title={Localizer.taskMonitor[this.props.language]} >
                <TaskMonitorTab tasks={[]}/>
              </Tab>}

              {this.isAdministrator &&
              <Tab eventKey="users" title="Users">
                <UsersTab/>
              </Tab>}

              {this.isAdministrator &&
              <Tab eventKey="triple_stores" title="Triple Stores">
                <TripleStoresTab/>
              </Tab>}

              {this.isAdministrator &&
              <Tab eventKey="indices" title="Indices">
                <ElasticsTab/>
              </Tab>}

              {this.isAdministrator &&
              <Tab eventKey="rdf_vocabularies" title="RDF Vocabularies ">
                <RDFVocabulariesTab/>
              </Tab>}
            </Tabs>
          </Col>
        </Row>

        {this.state.deleteModalShow && <DeleteModal show={this.state.deleteModalShow}
                                command={this.state.deleteModalCommand}
                                params={this.state.deleteModalParams}
                                actions={(choice, command, params) => { this.setState( {deleteModalShow:false }); return (choice === 'ok' ? this.executeAction(command + '-ok', params): null)} }
                                />}
      </Container>
    );
  }
}



export default UserSpace;
