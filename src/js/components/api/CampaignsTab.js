import React, { Component } from "react";
import Container from "react-bootstrap/Container";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import ListGroup from 'react-bootstrap/ListGroup';
import Table from 'react-bootstrap/Table';
import Button from 'react-bootstrap/Button';
import ButtonGroup from "react-bootstrap/ButtonGroup";
import Dropdown from "react-bootstrap/Dropdown";
import DropdownButton from "react-bootstrap/DropdownButton";
import ProgressBar from "react-bootstrap/ProgressBar";
import { ToastContainer, toast } from 'react-toastify';
import TableScrollbar from 'react-table-scrollbar';
import Collapse from "react-bootstrap/Collapse";
import NewCampaignModal from "./modals/NewCampaignModal.js";
import JoinCampaignModal from "./modals/JoinCampaignModal.js";
import AssignDatasetModal from "./modals/AssignDatasetModal.js";
import ValidationModal from "./modals/ValidationModal.js";
import PropertyValuesModal from "./modals/PropertyValuesModal.js";
import DeleteModal from "./modals/DeleteModal.js";
import ValidationProgress from "./ValidationProgress"

import { Localizer } from '../../config/localizer.js'
import LoadingComponent from '../LoadingComponent';
import { processDatasets } from "../Datasets.js";
import { filterByLanguage } from "../../utils/functions.js";
import { getAssignedDatasets } from '../../utils/DatasetUtils.js';
// import { createCampaign, updateCampaign, deleteCampaign, getActiveCampaigns, getOwnedCampaigns, getJoinedCampaigns, joinCampaign, removeUserFromCampaign, assignDatasetToCampaign } from '../../utils/CampaignAPI.js';
import { createCampaign, updateCampaign, deleteCampaign, getActiveCampaigns, getOwnedCampaigns, getJoinedCampaigns, joinCampaign, removeUserFromCampaign } from '../../utils/CampaignAPI.js';
import { giveAccessToAllDatasets, removeAccessFromAll, removeDatasetAccess } from '../../utils/AccessAPI.js';
import { getDatasetProgress } from '../../utils/PagedAnnotationValidationAPI.js';
import { assignDatasetToUserInCampaign } from '../../utils/AccessAPI.js';
import { viewAnnotationValidation, commitAnnotationValidationPage } from '../../utils/PagedAnnotationValidationAPI.js';
import { getDatasetItemsByPropertyValue } from '../../utils/DataAPI.js'
import { API_BASE_URL  } from '../../constants/index.js';

import { actionsMenu, toggleBoxColumn } from '../../utils/UIUtils';

export class CampaignsTab extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedCampaign: null,
      selectionTimestamp: 0,
      campaigns: [],
      myCampaigns: [],

      campaignAssignedDatasets: null,
      validatorAssignedDatasets: null,
      validatorNonAssignedDatasets: null,

      assignDatasetModalShow: false,

      datasetsProgress: [],
      allDatasetsAssigned: false,
      allDatasetsNonAssigned: false,
      everythingLoaded: false,
      // assignedDatasetslength: 0,

      annotationValidations: {},
      annotationValidationsModalShow: false,
      annotationValidationsState: { loaded: false, loading:false, failed:false },
      annotationsEditEnabled: false,
      annotationsEditOnProperty: null,
      annotationsEditOnPropertyPath: null,

      valuesModalShow: false,
      valuesModalControls: true,
      values: [],
      valuesEndpoint: null,
      valuesState: { loaded: false, loading:false, failed:false },

      myCampaignsOpen: true,
      myCampaignsUsersOpen: true,
      campaignsOpen: true,

      selectCampaignType: "validation",
      showValidationProgress: true,
    };
  }

  getActiveCampaigns() {
    getActiveCampaigns('ANNOTATION_VALIDATION')
      .then(response => {
        this.setState({ campaigns: response });
      })
      .catch(error => {
        console.error(error);
      });
  }

  getMyCampaigns() {
    if (this.props.mode === 'VALIDATOR') {
      this.getJoinedCampaigns()
    } else if (this.props.mode === 'EDITOR') {
      this.getOwnedCampaigns()
    }
  }

  getJoinedCampaigns() {
    getJoinedCampaigns('ANNOTATION_VALIDATION')
      .then(response => {
        this.setState({ myCampaigns: response })
      })
      .catch(error => {
        console.error(error);
      });
  }

  getOwnedCampaigns() {
    getOwnedCampaigns('ANNOTATION_VALIDATION')
      .then(response => {
        this.setState({ myCampaigns: response })
      })
      .catch(error => {
        console.error(error);
      });
  }

  getValidatorAssignedDatasets(campaignId, userId) {
    getAssignedDatasets(campaignId, userId)
      .then(response => {
          let ownedAssignedDifference = [];

          for (let entry of this.props.datasets) {
             if (!response.map(x => x['@id']).includes(entry.dataset['@id'])) {
               ownedAssignedDifference.push(entry);
             }
           }

           if (ownedAssignedDifference.length === 0) {
             this.allDatasetsAssigned = true;
           } else if (response.length === 0) {
             this.allDatasetsNonAssigned = true;
           }

           this.setState({
             validatorAssignedDatasets: response,
             validatorNonAssignedDatasets: ownedAssignedDifference
           }, () => console.log(this.state));
         })
         .catch(error => {
           console.error(error);
           this.setState({
            campaignAssignedDatasets: null
           })
      })
  }

  getCampaignAssignedDatasets(campaignId) {
    getAssignedDatasets(campaignId)
      .then(response => {
        var datasets = response.map(el => { return { dataset: el, selected: false } });

        let currentTimestamp = this.state.selectionTimestamp;

        var prog = new Array(datasets.length);
        var promises = [];

        // console.log('DATASETS');
        // console.log(datasets);

        for (var i in datasets) {

          var _this = this;

          promises.push(
            new Promise(function(resolve, reject) {
              var promisei = i;
              var ds  = datasets[promisei].dataset
              var uuid = ds['@id'].split('dataset/')[1]

              getDatasetProgress(uuid)
                .then(response => {
                  if (_this.state.selectionTimestamp != currentTimestamp) {
                    // return;
                  }
                  let entry = {
                    uuid: uuid,
                    dataset: ds,
                    name: filterByLanguage(ds, 'http://purl.org/dc/terms/title', 'el'),
                    progArray: response.sort((a, b) => (a.progress > b.progress) ? 1 : -1),
                    avgProgress: _this.getAverageProgress(response)
                  };

                  prog[promisei] = entry;

                  resolve();
                })
                .catch(error => {
                    console.error(error)
                    resolve();
                })
            })
          )
        }

        Promise.all(promises)
         .then(() => {
           prog.sort((a, b) => (a.avgProgress > b.avgProgress) ? 1 : ((b.avgProgress > a.avgProgress) ? -1 : 0));

           this.setState({
             datasetsProgress: prog,
             campaignAssignedDatasets: processDatasets(datasets).values(),
             everythingLoaded: true,
             // ownedDatasets: processDatasets(this.props.datasets).values(),
             // nonAssignedDatasets: processDatasets(ownedAssignedDifference).values(),
             // assignedDatasetslength: response.length
           });
         })
         .catch(error => {
           console.error(error);
           this.setState({
             campaignAssignedDatasets: null,
           });
         });
      });
  }

  getAverageProgress(progArray) {
    if (progArray.length > 0) {
      let progs = progArray.map(el => el.progress);
      return parseFloat((progs.reduce((a, b) => a + b, 0) / progs.length).toFixed(2));
    }
    return 101;
  }

  formatProperty(name) {
    let n = name.split('/').pop();
    return n.charAt(0).toUpperCase() + n.slice(1);
  }

  joinCampaign(campaignId) {
    joinCampaign(campaignId)
      .then(response => {
        this.throwToast('success', response.message);
        this.getMyCampaigns();
      })
      .catch(error => {
        console.error(error);
        this.throwToast('error', 'You have already joined this Editor.');
      })
  }

  removeUserFromCampaign(validatorId) {
    if (window.confirm('Are you sure you want to remove user "' + this.state.selectedUser.email + '" from campaign "' + this.state.selectedCampaign.name + '"?')) {
      removeUserFromCampaign(this.state.selectedCampaign.id, validatorId)
        .then(response => {
          this.setState({ selectedUser: null, selectionTimestamp: -1,  });
          this.getMyCampaigns();
        })
        .catch(error => {
          console.error(error);
        });
    }
  }

  removeDatasetAccess(datasetUri) {
    if (window.confirm('Are you sure you want to remove this dataset access from user "' + this.state.selectedUser.email + '"?')) {
      var _this = this;
      removeDatasetAccess(this.state.selectedCampaign.id, this.state.selectedUser.id, datasetUri)
        .then(response => {
          this.allDatasetsAssigned = false;
          this.throwToast("success", "Dataset access removed.");
          this.getValidatorAssignedDatasets(_this.state.selectedCampaign.id, _this.state.selectedUser.id);
        })
        .catch(error => {
          console.error(error);
          this.throwToast("error", "Removing dataset access failed.");
        });
    }
  }

  assignDatasetToUserInCampaign(datasetUri) {
    var _this = this;
    assignDatasetToUserInCampaign(this.state.selectedCampaign.id, this.state.selectedUser.id, datasetUri)
      .then(response => {
        this.allDatasetsNonAssigned = false;
        this.getValidatorAssignedDatasets(_this.state.selectedCampaign.id, _this.state.selectedUser.id);
        this.throwToast('success', 'You have granted dataset access to the user "' + _this.state.selectedUser.email + '".');
      })
      .catch(error => {
        this.throwToast('error', 'User "' + _this.state.selectedUser.email + '" has already access to this dataset.');
        console.error(error);
      });
  }

  giveAccessToAll() {
    var _this = this;
    giveAccessToAllDatasets(this.state.selectedCampaign.id, this.state.selectedUser.id)
      .then(response => {
        this.allDatasetsNonAssigned = false;
        this.getValidatorAssignedDatasets(this.state.selectedCampaign.id, this.state.selectedUser.id);
        this.throwToast('success', `You have granted access to the remaining ${response.length} datasets to the Validator.`);
      })
      .catch(error => {
        this.throwToast('error', 'Giving access to all datasets, failed');
        console.error(error);
      })
  }

  removeAccessFromAllDatasets() {
    if (window.confirm('Are you sure you want to remove access to all datasets for user"' + this.state.selectedUser.email + '"?')) {
      var _this = this;
      removeAccessFromAll(this.state.selectedCampaign.id, this.state.selectedUser.id)
        .then(response => {
          this.allDatasetsAssigned = false;
          this.getValidatorAssignedDatasets(this.state.selectedCampaign.id, this.state.selectedUser.id);
          this.throwToast('success', 'You have removed access to all datasets for user "' + _this.state.selectedUser.email + '".');
        })
        .catch(error => {
          this.throwToast('error', 'Removing access from all datasets, failed');
          console.error(error);
        })
    }
  }

  throwToast(type, message) {
    if (type === 'error') {
      toast.error(message, {
        position: "top-right",
        autoClose: 4000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    }
    else if (type === 'success') {
      toast.success(message, {
        position: "top-right",
        autoClose: 4000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    }
  }

  validationModalClosed(){
    this.setState({ annotationValidationsModalShow: false });
    if (this.state.selectedCampaign && this.state.selectedUser) {
      this.getCampaignAssignedDatasets(this.state.selectedCampaign.id);
      this.getValidatorAssignedDatasets(this.state.selectedCampaign.id, this.state.selectedUser.id);
    } else if (this.state.selectedCampaign) {
      this.getCampaignAssignedDatasets(this.state.selectedCampaign.id);
    }
  }

  componentDidMount() {
    if (this.props.mode === 'VALIDATOR') {
      // this.getPublicEditors();
      this.getActiveCampaigns();
      this.getMyCampaigns();
    }
    else if (this.props.mode === 'EDITOR') {
      this.getMyCampaigns();
      // this.setState({ ownedDatasets: processDatasets(this.props.datasets).values() });
    }
  }

  componentWillReceiveProps() {
    if (this.state.selectedCampaign && this.state.selectedUser) {
      this.getCampaignAssignedDatasets(this.state.selectedCampaign.id);
      this.getValidatorAssignedDatasets(this.state.selectedCampaign.id, this.state.selectedUser.id);
    } else if (this.state.selectedCampaign) {
      this.getCampaignAssignedDatasets(this.state.selectedCampaign.id);
    }
  }

  jsonldsort(a, b) {
    var t1 = filterByLanguage(a.dataset, 'http://purl.org/dc/terms/title', 'en');
    var t2 = filterByLanguage(b.dataset, 'http://purl.org/dc/terms/title', 'en');

    if (t1 < t2) {
      return -1;
    } else if (t1 > t2) {
      return 1;
    } else {
      return 0;
    }
  }

  // toggleCampaignShow(campaign) {
  //   this.setState({ myOwnedCampaigns: this.state.myOwnedCampaigns.map(el =>
  //         el.id !== campaign.id ? el : { ...el, open: !el.open }
  //     )});
  // }

  executeAction(action, params) {
    // console.log(params);
    if (action === 'create-campaign') {
      if (params.id && params.id != null) {
        updateCampaign(params.id, params.name, params.state)
          .then(response => {
              this.setState( { myCampaigns: this.state.myCampaigns.map(el => el.id === params.id ? response : el)} )
          });
      } else {
        createCampaign(params.name, params.state)
          .then(response => {
            this.setState( { myCampaigns: this.state.myCampaigns.concat(response)} )
          });
        }
    } else if (action === 'join-campaign') {
      joinCampaign(params.id)
        .then(response => {
          this.throwToast('success', response.message);
          this.getMyCampaigns();
        })
        .catch(error => {
          console.error(error);
          this.throwToast('error', 'You have already joined this campaign.');
        })
    } else if (action === 'select-campaign') {
      if (this.props.mode === 'EDITOR') {
        this.allDatasetsAssigned = false;
        this.allDatasetsNonAssigned = false;
        this.setState({ everythingLoaded: false, selectedCampaign: params.campaign, selectedUser: null, campaignsOpen: true, showValidationProgress: false });
        this.getCampaignAssignedDatasets(params.campaign.id);
      } else if (this.props.mode === 'VALIDATOR') {
        if (this.state.selectedCampaign && this.state.selectedCampaign.id == params.campaign.id) {
            return;
        } else {
          this.allDatasetsAssigned = false;
          this.allDatasetsNonAssigned = false;
          this.setState({ everythingLoaded: false, selectedCampaign: params.campaign, selectionTimestamp: Date.now(), datasetsProgress: [] });
          this.getCampaignAssignedDatasets(params.campaign.id);
        }
      }
    } else if (action == 'select-user')  {
      if (this.state.selectedCampaign && this.state.selectedUser && this.state.selectedCampaign.id == params.campaign.id && this.state.selectedUser.id == params.user.id) {
        return;
      } else {
        // this.state.everythingLoaded = false;
        // this.allDatasetsAssigned = false;
        // this.allDatasetsNonAssigned = false;
        // this.setState({ selectedCampaign: campaign, selectedUser: user, selectionTimestamp: Date.now(), datasetsProgress: [] });
        this.setState({ selectedCampaign: params.campaign, selectedUser: params.user, validatorAssignedDatasets: null, validatorNonAssignedDatasets: null, campaignsOpen: false },
          this.getValidatorAssignedDatasets(params.campaign.id, params.user.id));
      }
    } else if (action === 'update-campaign') {
      this.setState({ newCampaignModalShow: true })
    } else  if (action === 'delete-campaign') {
      this.setState({ deleteModalShow:true, deleteModalCommand: 'delete-campaign', deleteModalParams:params})
    } else  if (action === 'delete-campaign-ok') {
      deleteCampaign(params.id)
         .then(response => {
            this.throwToast('success', response.message);
            this.setState({ myCampaigns: this.state.myCampaigns.filter(el => el.id !== params.id),
                          selectedCampaign: null, selectedUser: null })
         })
         .catch(error => {
           this.throwToast('error', error.message);
         })
    } else if (action === 'add-dataset-to-campaign-or-user') {
      // if (this.props.mode === 'EDITOR') {
      //   assignDatasetToCampaign(params.uri);
      // } else if (this.props.mode === 'VALIDATOR') {
        this.assignDatasetToUserInCampaign(params.uri);
      // }
    } else if (action === 'select-campaign-type') {
      if (params.selectCampaignType === 'validations') {
        this.setState({showValidationProgress: true, selectedCampaign: null})
      }
    }
  }

  schemaActions(action, params) {
  if (action === 'commit-annotation-validation-page') {
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
  } else if (action === 'get-items-by-property-value') {
    var uri = this.state.schemaDataset['@id']
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
  }
}

  openValidations(dataset, pav, allowEdit) {
    var params = {
      id: pav.validationId,
      onProperty: pav.propertyPath[pav.propertyPath.length - 1].uri,
      currentPage: 0,
      requestedPage: null,
      mode: "ANNOTATED_ONLY_SERIAL",
      serial: true,
      navigation: "RIGHT",
      edit: allowEdit,
      onPropertyPath: pav.propertyPath
    };

    if (pav.annotatedPagesCount === 0) {
      params.mode = "UNANNOTATED_ONLY_SERIAL";
      // obj.totalPages = el.nonAnnotatedPagesCount;
    }

    this.setState({ schemaDataset:dataset, annotationValidations: {}, annotationValidationsModalShow:true, annotationValidationsState: { loaded: false, loading: true, failed: false}}, () =>
    viewAnnotationValidation(params.id, params.currentPage, params.mode, params.serial, params.navigation, params.requestedPage)
    .then(json => {
        this.setState({ annotationValidations: json, annotationsEditOnProperty: params.onProperty, annotationsEditOnPropertyPath: params.onPropertyPath,  annotationsEditEnabled: params.edit, annotationValidationsModalShow:true, annotationValidationsState: { loaded: true, loading: false, failed: false}})},
          () => this.setState({ annotationValidations: {}, annotationValidationsState: {loaded: false, loading: false, failed: true}}) )
        )
  }

  render() {

    return (
      <Container className="pl-2">
        <Row>
          {/* Left-side menu */}
          <Col md={3}>
            <Row>
              <Col className="align-self-center data-import-buttons">
                <ButtonGroup className="choice-buttons">
                  <Button className="data-choice-button" variant={this.state.selectCampaignType === "validation"? "danger" : "secondary"} onClick={() => this.executeAction('select-campaign-type', { selectCampaignType: "validations"})}>Validation</Button>
                </ButtonGroup>
              </Col>
            </Row>

            <Container className={this.state.myCampaigns && this.state.myCampaigns.length > 0 ? "groupborder" : "groupborder-empty"}>
              <Row className={this.state.myCampaigns && this.state.myCampaigns.length > 0 ? "header" : "header-empty"}>
                <Col>
                  {/*this.props.mode === 'VALIDATOR' ? Localizer.dashboard.editors[this.props.language] : Localizer.dashboard.validators[this.props.language]*/}
                  Campaigns
                </Col>

                {toggleBoxColumn('myCampaignsOpen', this, 'myCampaigns')}

                <Col className="mybutton" md="auto">
                  {actionsMenu(
                  <div>
                    {this.props.mode === 'EDITOR' &&
                    <Dropdown.Item className="py-2"
                                   onClick={() => this.setState({ editCampaign: null, newCampaignModalShow: true })}>
                      <span className="menu-icon fa fa-plus fa-lg mr-3" />New campaign...
                    </Dropdown.Item>}

                    {this.props.mode === 'VALIDATOR' &&
                    <Dropdown.Item className="py-2"
                                   onClick={() => this.setState({ joinCampaignModalShow: true })}>
                      <span className="menu-icon fa fa-link fa-lg mr-3" />Join campaign...
                    </Dropdown.Item>}
                  </div>)}

                  {this.state.newCampaignModalShow &&
                  <NewCampaignModal show={this.state.newCampaignModalShow}
                                    campaign={this.state.editCampaign}
                                    onOK={(id, name, state) => { this.executeAction('create-campaign', {id: id, name: name, state: state}); this.setState({ newCampaignModalShow: false})} }
                                    onClose={() => this.setState({ newCampaignModalShow: false})}/>}

                  {this.state.joinCampaignModalShow &&
                  <JoinCampaignModal show={this.state.joinCampaignModalShow}
                                     campaigns={this.state.campaigns}
                                     onOK={(id) => { this.executeAction('join-campaign', {id: id}); this.setState({ joinCampaignModalShow: false})} }
                                     onClose={() => this.setState({ joinCampaignModalShow: false})}/>}

                </Col>
              </Row>

              <Collapse in={this.state.myCampaignsOpen}>
                <div>
                  {this.state.myCampaigns.map((campaign,index) => (
                  <Row key={index}>
                    <Col md={12} className={this.state.selectedCampaign && this.state.selectedCampaign.id === campaign.id? " selected-item" : ""}>
                      <span className="lbutton alink" onClick={() => this.executeAction('select-campaign', { campaign: campaign })}>
                      {campaign.name}
                      </span>
                    </Col>
                  </Row>))}
                </div>
              </Collapse>

            </Container>
            {/*this.props.mode === 'VALIDATOR' &&
              <Row>
                <Col className="dashboardSelectorEditors">
                  <DropdownButton title="Join Campaign ">
                    {Array.from(this.state.campaigns).map((campaign, index) => (
                      <Dropdown.Item as="button" key={"campaign-" + index} onClick={() => this.joinCampaign(campaign.id)}>
                        {campaign.name}
                      </Dropdown.Item>
                    ))}
                  </DropdownButton>
                </Col>
              </Row>
            */}

            {this.props.mode === 'EDITOR' && this.state.selectedCampaign && this.state.selectedCampaign.users && this.state.selectedCampaign && this.state.selectedCampaign.users.length > 0 && // users
            <Row>
              <Col className="in-down">
                <span className='crimson-std fa fa-angle-down fa-lg'></span>
              </Col>
            </Row>}

            {this.props.mode === 'EDITOR' && this.state.selectedCampaign && this.state.selectedCampaign.users && this.state.selectedCampaign && this.state.selectedCampaign.users.length > 0 && // users
            <Container className="groupborder">
              <Row className="header">
                <Col>
                  Campaign users
                </Col>
                <Col className="mybutton" md="auto">
                  <Button type="button" className="menubutton"  aria-label="Toggle" onClick={() => this.setState({ myCampaignsUsersOpen: !this.state.myCampaignsUsersOpen})}><span className={this.state.myCampaignsUsersOpen ? 'fa fa-angle-double-up' : 'fa fa-angle-double-down'}></span></Button>
                </Col>
              </Row>

              <Collapse in={this.state.myCampaignsUsersOpen}>
                <div>
                  {this.state.selectedCampaign && this.state.selectedCampaign.users && this.state.selectedCampaign.users.map((validator,index) => (
                  <Row key={index}>
                    <Col md={12} className={this.state.selectedUser && this.state.selectedUser.id === validator.id? " selected-item" : ""}>
                      <span className="lbutton alink" onClick={() => this.executeAction('select-user', { campaign: this.state.selectedCampaign, user: validator } )}>
                      {validator.name}
                      </span>
                    </Col>
                  </Row>))}
                </div>
              </Collapse>
            </Container>}

          </Col>

          <Col>

            <Container className="userspace-right">
              <Row className="userspace-right-inner">
                <Container>
                  <Row>
                    <Col>

                      {this.props.mode === 'VALIDATOR' && !this.state.selectedCampaign &&
                      <Container className="groupborder">
                        <Row className="mt-4 text-center">
                          <Col>Select a campaign from the list on the left to view the shared datasets, or click the <span className="fa fa-bars fa-md m-2"/> button to join a campaign.</Col>
                        </Row>
                      </Container>}

                      {this.props.mode === 'EDITOR' && this.state.showValidationProgress &&
                      <ValidationProgress
                        datasets={this.props.datasets}
                        language={this.props.language}
                      />}


                      {this.state.selectedCampaign &&
                      <Container className={this.state.datasetsProgress && this.state.datasetsProgress.length > 0 ? "groupborder" : "groupborder-empty"}>
                        <Row className={this.state.datasetsProgress && this.state.datasetsProgress.length > 0 ? "header" : "header-empty"}>
                          <Col>
                            <span className="crimson-std">Campaign:</span> {this.state.selectedCampaign.name}
                          </Col>

                          {toggleBoxColumn('campaignsOpen', this, 'datasetsProgress')}

                          {(this.props.mode === 'EDITOR' && this.state.selectedCampaign) &&
                          <Col className="mybutton" md="auto">
                            {actionsMenu(
                            <div>
                              <Dropdown.Item className="py-2"
                                             onClick={() => { this.setState({ editCampaign: this.state.selectedCampaign}); this.executeAction('update-campaign', {id : this.state.selectedCampaign.id})}}>
                                 <span className="menu-icon fa fa-edit fa-lg mr-3" />Edit...
                              </Dropdown.Item>

                              <Dropdown.Item className="py-2"
                                             disabled={this.state.selectedCampaign.users && this.state.selectedCampaign.users.length > 0}
                                             onClick={() => this.executeAction('delete-campaign', {id : this.state.selectedCampaign.id})}>
                                 <span className="menu-icon fa fa-trash fa-lg mr-3" />Delete
                              </Dropdown.Item>

{/* TO DO NOT WORKING YET
                              <Dropdown.Divider/>

                              <Dropdown.Item className="py-2"
                                             onClick={() => this.setState({assignDatasetModalShow: true})}>
                                 <span className="menu-icon fa fa-trash fa-lg mr-3" />Add dataset...
                              </Dropdown.Item>
*/}

                            </div>)}

                          </Col>}
                        </Row>

                        <Collapse in={this.state.campaignsOpen}>
                        <div>
                            {this.state.datasetsProgress &&
                            <Row className="align-items-center">
                              <Col className="pt-3">
                                {Array.from(this.state.datasetsProgress).map((dataset, index) => {
                                  // this.state.everythingLoaded = (this.state.assignedDatasetslength <= index + 1);
                                  return (
                                    <Row className="mb-3" key={"table-" + index}>
                                      <Table borderless striped size="md">
                                        <thead>
                                          <tr key={"dataset-" + index} className="border-bottom border-secondary">
                                            <th className="w-50">
                                              {dataset.name}
                                            </th>
                                            <th className="w-50 pt-3 align-items-center">
                                              {dataset.avgProgress <= 100 &&
                                                <Row>
                                                  <Col className="align-self-center w-85" md="8">
                                                    <ProgressBar now={dataset.avgProgress} />
                                                  </Col>
                                                  <Col className="align-self-center w-15 pl-0" md="3">
                                                    {dataset.avgProgress}%
                                                  </Col>
                                                </Row>
                                              }
                                            </th>
                                          </tr>
                                        </thead>
                                        <tbody>
                                          {dataset.progArray.length === 0 &&
                                            <tr key={"dataset-" + index + "-property-0"}>
                                              <td colSpan="2" className="text-center font-italic">
                                                No validation campaigns running for this dataset
                                              </td>
                                            </tr>
                                          }
                                          {dataset.progArray.length > 0 &&
                                            Array.from(dataset.progArray).filter(entry => this.props.mode === 'EDITOR' || entry.active).map((entry, i) => (
                                              <tr key={"dataset-" + index + "-property-" + i}>
                                                <td colSpan="2" className={"w-50 align-middle" + (entry.locked ? " active-background" : "")}>
                                                  <Row key={"dataset-" + index + "-property-" + i}>
                                                    <Col className="w-80 pr-2" md="5">
                                                      {entry.propertyName}
                                                    </Col>
                                                    <Col className="w-20 pr-2" md="1">
                                                      ({this.formatProperty(entry.asProperty)})
                                                    </Col>

                                                    <Col className="align-self-center w-85 align-middle" md="4">
                                                      <ProgressBar>
                                                        <ProgressBar variant="success" now={entry.totalAnnotations === 0 ? 0 : (entry.totalAccepted / entry.totalAnnotations * 100).toFixed(2)} />
                                                        <ProgressBar variant="secondary" now={entry.totalAnnotations === 0 ? 0 : (entry.totalNeutral / entry.totalAnnotations * 100).toFixed(2)} />
                                                        <ProgressBar variant="danger" now={entry.totalAnnotations === 0 ? 0 : (entry.totalRejected / entry.totalAnnotations * 100).toFixed(2)} />
                                                      </ProgressBar>
                                                    </Col>
                                                    <Col className="align-self-center w-15 pl-0" md="1">
                                                      {entry.progress}%
                                                    </Col>
                                                    <Col className="mybutton align-self-center pr-4" md="1">
                                                      <Button type="button" className="menubutton" aria-label="Validate" title="Validate"
                                                        disabled={this.props.mode === 'VALIDATOR' && !entry.active}
                                                        onClick={() => this.openValidations(dataset.dataset, entry, entry.active)}>
                                                        <span className="fa fa-list-alt"></span>
                                                      </Button>
                                                    </Col>
                                                  </Row>
                                                </td>
                                              </tr>
                                            ))
                                          }
                                        </tbody>
                                      </Table>
                                    </Row>
                                  )
                                })}
                              </Col>
                            </Row>}

                            {!this.state.everythingLoaded &&
                              <LoadingComponent text="Loading" />}

                            {this.state.selectedUser && !this.state.validatorAssignedDatasets &&
                            <Row>
                              <Col className="text-center mt-3">
                                {this.state.selectedCampaign.name} hasn't assigned any datasets to you yet.
                              </Col>
                            </Row>}
                        </div>
                        </Collapse>

                      </Container>}
                    </Col>
                  </Row>
                </Container>

                {(this.props.mode === 'EDITOR' && this.state.selectedCampaign && this.state.selectedUser) &&
                <Container>
                  <Row>
                    <Col className="in-down">
                      <span className='crimson-std fa fa-angle-down fa-lg'></span>
                    </Col>
                  </Row>
                  <Row>
                    <Col>
                      <Container className="groupborder-empty">
                        <Row className="header-empty">
                          <Col className="bold">
                            <span className="crimson-std">Validator: </span>{this.state.selectedUser.name} ({this.state.selectedUser.email})
                          </Col>

                          <Col className="mybutton" md="auto">
                            {actionsMenu(
                            <div>
                              <Dropdown.Item className="py-2"
                                             onClick={() => this.removeUserFromCampaign(this.state.selectedUser.id)}>
                                 <span className="menu-icon fa fa-times fa-lg mr-3" />Remove user from campaign
                              </Dropdown.Item>
                            </div>)}
                          </Col>
                        </Row>
                      </Container>
                    </Col>
                  </Row>
                </Container>}

                {(this.props.mode === 'EDITOR' && this.state.selectedCampaign && this.state.selectedUser) &&
                <Container>
                  <Row>
                    <Col className="in-down">
                      <span className='crimson-std fa fa-angle-down fa-lg'></span>
                    </Col>
                  </Row>
                  <Row>
                    <Col>
                      <Container className={this.state.validatorAssignedDatasets && this.state.validatorAssignedDatasets.length > 0 ? "groupborder" : "groupborder-empty"}>
                        <Row className={this.state.validatorAssignedDatasets && this.state.validatorAssignedDatasets.length > 0 ? "header" : "header-empty"}>
                          <Col>
                            <span className="crimson-std">Assigned datasets</span>
                          </Col>

                          <Col className="mybutton" md="auto">
                            {actionsMenu(
                            <div>
                              <Dropdown.Item className="py-2"
                                             onClick={() => this.setState({assignDatasetModalShow: true})}>
                                 <span className="menu-icon fa fa-plus fa-lg mr-3" />Assign dataset to user
                              </Dropdown.Item>

                              <Dropdown.Item className="py-2"
                                             disabled={!this.state.validatorAssignedDatasets || this.state.validatorAssignedDatasets.length == 0}
                                             onClick={() => this.removeAccessFromAllDatasets(this.state.selectedUser.id)}>
                                 <span className="menu-icon fa fa-times fa-lg mr-3" />Remove all datasets from user
                              </Dropdown.Item>

                            </div>)}
                          </Col>
                        </Row>
                        <Row className="align-items-center">
                          <Col>
                            {this.state.validatorAssignedDatasets && this.state.validatorAssignedDatasets.map((el, index) => (
                            <Row key={"assigned-dataset-" + index}>
                              <Col>
                                {filterByLanguage(el, 'http://purl.org/dc/terms/title', 'el')}
                              </Col>
                              <Col md="auto">
                                <Button type="button" className="deleteeditbutton mt-0" aria-label="Delete" onClick={() => this.removeDatasetAccess(el['@id'])}>
                                  <span className="fa fa-times failed" title="Remove dataset access" />
                                </Button>
                              </Col>
                            </Row>))}
                          </Col>
                        </Row>

                      </Container>
                    </Col>
                  </Row>
                </Container>}
              </Row>
            </Container>
        </Col>
      </Row>

      {this.state.assignDatasetModalShow &&
      <AssignDatasetModal show={this.state.assignDatasetModalShow}
                         datasets={this.state.validatorNonAssignedDatasets}
                         onOK={(uri) => { uri === 'ALL' ? this.giveAccessToAll() : this.executeAction('add-dataset-to-campaign-or-user', {uri: uri}); this.setState({ assignDatasetModalShow: false})} }
                         onClose={() => this.setState({ assignDatasetModalShow: false})}/>}


      {this.state.annotationValidationsModalShow &&
        <ValidationModal
             dataset={this.state.schemaDataset['@id']}
             show={this.state.annotationValidationsModalShow}
             state={this.state.annotationValidationsState}
             value={this.state.annotationValidations}
             edit={this.state.annotationsEditEnabled}
             onProperty={this.state.annotationsEditOnProperty}
             onPropertyPath={this.state.annotationsEditOnPropertyPath}
             datasetName={filterByLanguage(this.state.schemaDataset,'http://purl.org/dc/terms/title', Localizer.language)}
             // asProperty={this.state.annotationsEditAsProperty}
             // mode={this.state.annotationsEditMode}
             // page={this.state.annotationsEditPage}
             // id={this.state.editGroupId}
             // annotators={this.state.annotationsEditAnnotators}
             language={this.props.language}
             rdfVocabularies={this.props.rdfVocabularies}
             actions={(action, params) => this.schemaActions(action, params)}
             onClose={() => this.validationModalClosed()}/>}

       {this.state.valuesModalShow &&
         <PropertyValuesModal show={this.state.valuesModalShow}
                            values={this.state.values}
                            state={this.state.valuesState}
                            endpoint={this.state.valuesEndpoint}
                            database={this.props.database}
                            onPropertyPath={this.state.valuesPath}
                            language={this.props.language}
                            controls={this.state.valuesModalControls}
                            valueActions={(action, path, mode) => this.valueActions(action, this.state.schemaDataset['@id'], path, mode)}
                            actions={(action, params) => this.schemaActions(action, params)}
                            onClose={() => this.setState({ valuesModalShow: false })}/>}

        {this.state.deleteModalShow && <DeleteModal show={this.state.deleteModalShow}
                                command={this.state.deleteModalCommand}
                                params={this.state.deleteModalParams}
                                actions={(choice, command, params) => { this.setState( {deleteModalShow:false }); return (choice === 'ok' ? this.executeAction(command + '-ok', params): null)} }
                                />}
    </Container>


    );
  }
}

export default CampaignsTab;
