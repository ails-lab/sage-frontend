import React, { Component } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { Dropdown, DropdownButton, InputGroup, FormControl } from 'react-bootstrap';
import { ToastContainer, toast } from 'react-toastify';
import { getAllTemplates, createFilterTemplate, deleteTemplate, getTemplate } from '../../../utils/TemplateAPI';


export class ValidationCreateModal extends Component {
  constructor(props) {
    super(props);

    if (this.props.type === 'paged' && this.props.validation) {
      var mode = this.props.validation.mode;
      if (!mode) {
        mode = "PAV-VAL:CNT:DESC"
      }
      var pagedMode = 'PAV';
      var directions = [];
      var elements = mode.split('-')
      for (var i = 1; i < elements.length; i++) {
        pagedMode += '-' + elements[i].substr(0, elements[i].lastIndexOf(':'))
        directions = directions.concat(elements[i].substr(elements[i].lastIndexOf(':') + 1))
      }

      this.state = {
        error: false,
        filters: (this.props.validation && this.props.validation.filters) ? this.props.validation.filters.slice() : [{ action: 'DELETE', selectExpression: '' }],
        savedFilters: [],
        loadedFilters: false,
        showSaveAsForm: false,
        saveAsName: '',
        pagedMode: this.props.validationModes.filter(el => el.code === pagedMode)[0],
        directions: directions
      }

    } else {
      this.state = {
        error: false,
        filters: (this.props.validation && this.props.validation.filters) ? this.props.validation.filters.slice() : [{ action: 'DELETE', selectExpression: '' }],
        savedFilters: [],
        loadedFilters: false,
        showSaveAsForm: false,
        saveAsName: '',
      }
    }

// console.log(this.state)
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleSubmit(event) {
    event.preventDefault();

    var params = {};
    params.aegId = this.props.aegId
    params.name = this.name.value;

    if (this.props.validation !== null) {
      params.id = this.props.validation.id
    }

    if (this.props.type === 'filter') {
      params.filters = this.state.filters;
    }

    if (this.props.type === 'paged') {
      var mode = 'PAV';
      for (var d in this.state.pagedMode.dimensions) {
        mode += '-' + this.state.pagedMode.dimensions[d].code + ':' + document.getElementById("pav-sort-"+this.state.pagedMode.dimensions[d].code).value
      }

      params.mode = mode
    }

    // console.log(params);

    this.props.onOK(this.props.type === 'filter' ? 'create-filter-validation' : 'create-paged-validation', params);
  }

  onSavedTemplateClicked(id) {
    getTemplate(id).then(response => {
      document.getElementById('modal-title').innerHTML = response.name
      this.name.value = response.templateJson.name
      this.setState({ filters: response.templateJson.filters })
    })
  }

  addFilter() {
    let newFilters = this.state.filters;
    newFilters.push({ action: 'DELETE', selectExpression: '' });
    this.setState({ filters: newFilters });
    document.getElementById('modal-title').innerHTML = (this.props.validation == null ? 'New ' : 'Edit ') + (this.props.type === 'paged' ? 'Paged Validation' : 'Filter Validation')
  }

  removeFilter(index) {
    let newFilters = this.state.filters;
    newFilters.splice(index, 1);
    this.setState({ filters: newFilters });
    document.getElementById('modal-title').innerHTML = (this.props.validation == null ? 'New ' : 'Edit ') + (this.props.type === 'paged' ? 'Paged Validation' : 'Filter Validation')
  }

  updateFilter(index, field, value) {
    let prevFilters = this.state.filters;
    prevFilters[index][field] = value;
    this.setState({ filters: prevFilters });
    document.getElementById('modal-title').innerHTML = (this.props.validation == null ? 'New ' : 'Edit ') + (this.props.type === 'paged' ? 'Paged Validation' : 'Filter Validation')
  }

  getAllSavedFilters() {
    if (this.state.loadedFilters) {
      return
    }
    else {
      getAllTemplates('FILTER').then(response => {
        this.setState({ savedFilters: response, loadedFilters: true })
      })
    }
  }

  onSave(){
    if (this.name.value.length === 0) {
      this.throwToast('error', 'Filter name cannot be blank. Please enter a name.');
      return;
    }
    if (this.state.saveAsName.length === 0) {
      this.throwToast('error', 'Name cannot be blank. Please enter a name to save the filter.');
      return;
    }

    createFilterTemplate(this.state.saveAsName, "FILTER", this.name.value, this.state.filters)
    .then(response => {
      this.throwToast('success', 'Filter saved successfully!')
    })
    .catch(error => {
      console.error(error);
      this.throwToast('error', 'Filter was not saved. Please try again.')
    });
    document.getElementById('modal-title').innerHTML = this.state.saveAsName
    this.setState({ saveAsName: '', showSaveAsForm: false, loadedFilters: false })
    // this.props.onOK(this.props.type === 'filter' ? 'create-filter-validation' : 'create-paged-validation', params);
  }

  saveAsNameChanged(evt) {
    this.setState({ saveAsName: evt.target.value })
  }

  onDeleteSavedFilter(id){
    deleteTemplate(id).then(response => {
      // console.log(response)
      this.setState({ loadedFilters: false })
      this.getAllSavedFilters()
      this.throwToast('success', 'Saved Filter deleted successfully!')
    })
      .catch(error => {
        console.error(error)
        this.throwToast('error', 'Saved Filter deletion failed')
      })
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

  updatePaged(value) {
    var directions = []
    var pagedMode = this.props.validationModes.filter(el => el.code === value)[0]
    for (var i = 1; i < pagedMode.dimensions.length; i++) {
      directions = directions.concat('ASC')
    }
    this.setState({ pagedMode, directions })
  }

  render() {

    // console.log(this.props)

    return (
      <Modal
        show={this.props.show}
        onHide={this.props.onClose}
        backdrop="static"
        centered
      >
        <Form onSubmit={this.handleSubmit}>
          <Modal.Header>
            <Modal.Title id="modal-title">
              {(this.props.validation == null ? 'New ' : 'Edit ') + (this.props.type === 'paged' ? 'Paged Validation' : 'Filter Validation')}
            </Modal.Title>
            {this.props.type === 'filter' ?
              <Row className="mr-0">
              <DropdownButton title="Load Template" variant="outline-primary" onClick={() => this.getAllSavedFilters()}>
                <div className="dropdown-scroll-annotator">
                  {this.state.savedFilters.map((el, index) => (
                    <Dropdown.Item key={"annotator-" + index}>
                      <Row>
                        <Col className="col-10" onClick={() => this.onSavedTemplateClicked(el.id)}>
                          {el.name}
                        </Col>
                        <Col>
                          <i className="fa fa-trash float-right red" aria-hidden="true" onClick={() => this.onDeleteSavedFilter(el.id)}></i>
                        </Col>
                      </Row>
                    </Dropdown.Item>
                  ))}
                </div>
              </DropdownButton>
            </Row> : null}
          </Modal.Header>
          <Modal.Body bsPrefix="modal-body validation-create-modal-body">
            <Form.Group>
              <Form.Label className="font-weight-bold">Name</Form.Label>
              <Form.Control
                placeholder="Name"
                ref={node => (this.name = node)}
                defaultValue={this.props.validation !== null ? this.props.validation.name : ""}
                onChange={() => this.setState({ error: false })}
                required
              />
            </Form.Group>
            <Form.Control.Feedback type="invalid">
              Please provide a valid name.
            </Form.Control.Feedback>
            {this.props.type === 'paged' &&
              <Form.Group>
                <Form.Label className="font-weight-bold">Item sorting order</Form.Label>
              <Form.Control as="select" disabled={this.props.validation && this.props.validation.lifecycleState !== 'STOPPED'}
                onChange={e => this.updatePaged(e.target.value)}
                defaultValue={this.state.pagedMode ? this.state.pagedMode.code : ''}
                required>
                <option disabled value=''>-- Strategy --</option>)}
                {this.props.validationModes.map((paged, index) =>
                   <option value={paged.code}>{paged.label}</option>)}
              </Form.Control>
              {this.state.pagedMode && this.state.pagedMode.dimensions.map((el, index2) =>
                  <Row key={index2} className="paged-mode-row">
                    <Col md={5}><span>{el.name}</span></Col>
                    <Col>
                      <Form.Control disabled={this.props.validation && this.props.validation.lifecycleState !== 'STOPPED'} as="select" id={"pav-sort-" + el.code} defaultValue={this.state.directions[index2]}>
                         <option value="ASC">Ascending</option>
                         <option value="DESC">Descending</option>
                      </Form.Control>
                    </Col>
                  </Row>
              )}
            </Form.Group>}

            {this.props.type === 'filter' && this.state.filters.map((filter, index) =>
              <div className="mb-3" key={"filter-" + index} id={"filter-" + index}>
                <Row className="font-weight-bold mb-2">
                  <Col>
                    Filter
                  </Col>
                  <Col className="text-right text-danger" onClick={() => this.removeFilter(index)}>
                    <span className="clickable fa fa-trash-o fa-lg" title="Delete filter"></span>
                  </Col>
                </Row>
                <div className="boxed">
                  <Form.Group className="mt-3">
                    <Form.Label>Filter Type</Form.Label>
                    <Form.Control
                      as="select"
                      onChange={e => this.updateFilter(index, 'action', e.target.value)}
                      value={filter.action}
                      required
                    >
                      <option value='DELETE'>Delete</option>
                      <option value='REPLACE'>Replace</option>
                    </Form.Control>
                  </Form.Group>
                  <Form.Group>
                    <Form.Label>Filter expression</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={4}
                      onChange={e => this.updateFilter(index, 'selectExpression', e.target.value)}
                      value={filter.selectExpression}
                      required
                    />
                  </Form.Group>
                  {filter.action === 'REPLACE' &&
                    <Form.Group>
                      <Form.Label>New Value</Form.Label>
                      <Form.Control
                        onChange={e => this.updateFilter(index, 'newValue', e.target.value)}
                        value={filter.newValue ? filter.newValue : ""}
                        required
                      />
                    </Form.Group>
                  }
                </div>
              </div>
            )}
            {this.props.type === 'filter' &&
              <Button variant="light" onClick={() => this.addFilter()}>
                <span className="fa fa-plus fa-lg mr-2"></span>
                <span className="font-weight-bold">Add filter</span>
              </Button>
            }
          </Modal.Body>
          <Modal.Footer>
            {this.state.showSaveAsForm ?
              <InputGroup className={this.saveAsCssClasses}>
                <InputGroup.Prepend>
                  <InputGroup.Text>
                    Save as:
                  </InputGroup.Text>
                </InputGroup.Prepend>
                <FormControl
                  onChange={(event) => this.saveAsNameChanged(event)}
                  defaultValue={this.state.saveAsName}>
                </FormControl>
                <Button variant="outline-danger" className="ml-3" onClick={() => this.setState({ showSaveAsForm: false, saveAsName: '' })}>Cancel</Button>
                <Button variant="primary" className="ml-3" onClick={() => this.onSave()}>Save</Button>
              </InputGroup> :
              <React.Fragment>
               {this.props.type === 'filter' ?
                <Button onClick={() => this.setState(prevState => ({ showSaveAsForm: !prevState.showSaveAsForm }))} variant="outline-primary" className="float-left">
                  Save Template
                </Button> : null}
                <Button variant="secondary" onClick={() => this.props.onClose()}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary">
                  {this.props.validation == null ? "Create" : "Update"}
                </Button>
              </React.Fragment>}
          </Modal.Footer>
        </Form>
        {/* <ToastContainer
          position="top-right"
          autoClose={4000}
          hideProgressBar
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        /> */}
      </Modal>
    );
  }
}

export default ValidationCreateModal;
