import React, { Component } from 'react';
import Container from "react-bootstrap/Container";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import { Localizer } from '../../config/localizer.js';
import { saveApiKey, getApiKeys, deleteTemplate } from '../../utils/TemplateAPI';
import { userFieldChanged, getUserDetails } from '../../utils/UsersAPI';
import { ToastContainer, toast } from 'react-toastify';
import './Profile.css'


export class Profile extends Component {
    constructor(props) {
        super(props);
        this.gotUserDetails = false;
        this.state = {
            user: null,
            showEmailForm: false,
            showPasswordForms: false,
            showNameForm: false,
            nameInputValue: '',
            emailInputValue: '',
            curPwInputValue: '',
            newPwInputValue: '',
            keyName: '',
            keyValue: '',
            newPwRepeatInputValue: '',
            showNewKeyForm: false,
            api_keys: []
        };
    }

    get emailCssClasses() {
        return this.state.showEmailForm ? 'showForm' : 'hideForm';
    }

    get nameCssClasses() {
        return this.state.showNameForm ? 'showForm' : 'hideForm';
    }

    get passwordClasses() {
        return this.state.showPasswordForms ? 'showForm mt-4 ml-0 w-80' : 'hideForm mt-4 ml-0 w-80';
    }

    getUserDetails() {
        getUserDetails()
            .then(response => {
                this.gotUserDetails = true;
                this.setState({
                    user: response,
                    nameInputValue: response.name,
                    emailInputValue: response.email
                })
            })
    }

    getApiKeys() {
        getApiKeys().then(response => {
            // console.log(response)
            this.setState({ api_keys: response })
        })
    }

    componentDidMount() {
        this.getUserDetails();
        this.getApiKeys()
    }

    updateField(field, value) {
        this.setState({ [field]: value });
    }

    validateForm() {
        let pswd = this.state.newPwInputValue;
        let pswdRepeat = this.state.newPwRepeatInputValue;
        if (typeof pswd !== "undefined" && typeof pswdRepeat !== "undefined") {
            if (pswd !== '' && pswdRepeat !== '') {
                if (pswd != pswdRepeat) {
                    return false;
                }
            }
        }
        return true;
    }

    handlePasswordSubmit(event) {
        const form = event.currentTarget;
        event.preventDefault();
        if (form.checkValidity() === false || !this.validateForm()) {
            event.stopPropagation();
        }
        userFieldChanged({
            target: 'PASSWORD',
            oldPassword: this.state.curPwInputValue,
            newPassword: this.state.newPwInputValue
        }).then((response) => {
            this.gotUserDetails = false
            this.setState({ user: response })
            this.setState({ showNameForm: false })
            this.setState({ showEmailForm: false })
            this.setState({ showPasswordForms: false })
            this.setState({ curPwInputValue: '' })
            this.setState({ newPwInputValue: '' })
            this.setState({ newPwRepeatInputValue: '' })
            this.getUserDetails()
            this.throwToast('success', 'You changed your password successfully')
        }).catch(error => {
            console.error(error);
            this.throwToast('error', 'The current password that you entered is incorrect.')
            // this.setState({ signupError: true })
        });
    }

    changeSubmitted(t, v) {
        userFieldChanged({
            target: t,
            value: v
        }).then((response) => {
            this.gotUserDetails = false
            this.setState({ user: response })
            this.setState({ showNameForm: false })
            this.setState({ showEmailForm: false })
            this.getUserDetails()
        })
    }

    nameSubmit() {
        this.changeSubmitted("NAME", this.state.nameInputValue)
    }

    emailSubmit() {
        this.changeSubmitted("EMAIL", this.state.emailInputValue)
        window.location.reload()
    }

    onSaveApiKey() {
        if(this.state.keyName === '' || this.state.keyValue === ''){
            this.throwToast('error', 'You have to fill both fields!')
        }
        else
        {saveApiKey(this.state.keyName, "API_KEY", this.state.keyValue)
            .then(response => {
                // console.log(response)
                this.getApiKeys();

            })
        this.setState({ showNewKeyForm: false, keyName: '', keyValue: '' })}

    }

    onDeleteApiKey(id) {
        deleteTemplate(id)
            .then(response => {
                // console.log(response)
                this.getApiKeys()
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

    render() {
        return (
            <Container className="mt-5 justify-content-center w-55">
                {this.gotUserDetails &&
                    <React.Fragment>
                        <Row className="pb-3 mb-3 text-center">
                            <Col><h2>{this.state.user.name}</h2></Col>
                        </Row>
                        <Row className="mx-1 bold mt-4 mb-1 ">Profile details</Row>
                        <div className="profile-card p-4">
                            <Row>
                                <Col className="bold mr-3" xs={2}>Name</Col>
                                {!this.state.showNameForm ?
                                    <React.Fragment>
                                        <Col className="pr-0" xs={3}>
                                            {this.state.user.name}
                                        </Col>
                                        <Col className="pl-0" xs={1}>
                                            <i className="fa fa-pencil-square-o fa-lg pointer" aria-hidden="true" onClick={() => this.setState((prevState) => { return { showNameForm: !prevState.showNameForm } })} />
                                        </Col>
                                    </React.Fragment>
                                    :
                                    <Col className={this.nameCssClasses}>
                                        <input value={this.state.nameInputValue} onChange={evt => this.updateField('nameInputValue', evt.target.value)} />
                                        <button className="btn btn-outline-danger btn-sm ml-3 mb-1" onClick={() => this.setState((prevState) => { return { showNameForm: !prevState.showNameForm } })}>
                                            Cancel
                                        </button>
                                        <button className="btn btn-primary ml-3 btn-sm mb-1" onClick={() => this.nameSubmit()} disabled={this.state.nameInputValue == ''}>
                                            Submit
                                        </button>
                                    </Col>
                                }
                            </Row>
                            <Row className="pt-3">
                                <Col className="bold mr-3" xs={2}>E-mail</Col>
                                {!this.state.showEmailForm ?
                                    <React.Fragment>
                                        <Col className="pr-0" xs={3}>
                                            {this.state.user.email}
                                        </Col>
                                        <Col className="pl-0" xs={1}>
                                            <i className="fa fa-pencil-square-o fa-lg pointer" aria-hidden="true" onClick={() => this.setState((prevState) => { return { showEmailForm: !prevState.showEmailForm } })} />
                                        </Col>
                                    </React.Fragment>
                                    :
                                    <Col className={this.emailCssClasses}>
                                        <input value={this.state.emailInputValue} onChange={evt => this.updateField('emailInputValue', evt.target.value)} />
                                        <button className="btn btn-outline-danger btn-sm ml-3 mb-1" onClick={() => this.setState((prevState) => { return { showEmailForm: !prevState.showEmailForm } })}>
                                            Cancel
                                        </button>
                                        <button className="btn btn-primary ml-3 btn-sm mb-1" onClick={() => this.emailSubmit()} disabled={this.state.emailInputValue == ''}>Submit</button>
                                    </Col>
                                }
                            </Row>
                            {/*<Row className="pt-3">
                                <Col className="bold mr-3" xs={2}>Role</Col>
                                <Col xs={3}>{this.state.user.userType}</Col>
                            </Row>*/}
                            {/*<Row className="pt-3">
                                <Col className="bold mr-3" xs={2}>Job Description</Col>
                                <Col xs={3}>{this.state.user.jobDescription}</Col>
                            </Row>*/}
                            {!this.state.showPasswordForms ?
                                <Row className="pt-3 mt-3">
                                    <Col className="bold" xs={3}>
                                        <button className="btn btn-outline-primary" onClick={() => this.setState((prevState) => { return { showPasswordForms: !prevState.showPasswordForms } })}>
                                            Change Password
                                        </button>
                                    </Col>
                                </Row>
                                :
                                <Form className={this.passwordClasses} onSubmit={(event) => this.handlePasswordSubmit(event)}>
                                    <Form.Group as={Row} controlId="currentPassword">
                                        <Form.Label column sm="3" className="bold pr-0">
                                            Current Password
                                        </Form.Label>
                                        <Col sm="6" className="pl-0">
                                            <Form.Control
                                                type="password"
                                                value={this.state.curPwInputValue}
                                                onChange={(evt) => this.updateField('curPwInputValue', evt.target.value)}
                                                bsPrefix={'form-control w-85'}
                                                required
                                            />
                                            <Form.Control.Feedback type="invalid">
                                                You need to fill your old password!
                                            </Form.Control.Feedback>
                                        </Col>
                                    </Form.Group>
                                    <Form.Group as={Row} controlId="newPassword">
                                        <Form.Label column sm="3" className="bold pr-0">
                                            New Password
                                        </Form.Label>
                                        <Col sm="6" className="pl-0">
                                            <Form.Control
                                                type="password"
                                                value={this.state.newPwInputValue}
                                                onChange={(evt) => this.updateField('newPwInputValue', evt.target.value)}
                                                bsPrefix={'form-control w-85'}
                                                isInvalid={!this.validateForm()}
                                                required
                                            />
                                            <Form.Control.Feedback type="invalid">
                                                {Localizer.signInModal.invalidPasswordConfirmation[this.props.language]}
                                            </Form.Control.Feedback>
                                        </Col>
                                    </Form.Group>
                                    <Form.Group as={Row} controlId="formPlaintextPassword" >
                                        <Form.Label column sm="3" className="bold pr-0">
                                            Repeat New Password
                                        </Form.Label>
                                        <Col sm="6" className="pl-0">
                                            <Form.Control
                                                type="password"
                                                value={this.state.newPwRepeatInputValue}
                                                onChange={(evt) => this.updateField('newPwRepeatInputValue', evt.target.value)}
                                                bsPrefix={'form-control w-85'}
                                                isInvalid={!this.validateForm()}
                                                required
                                            />
                                            <Form.Control.Feedback type="invalid">
                                                {Localizer.signInModal.invalidPasswordConfirmation[this.props.language]}
                                            </Form.Control.Feedback>
                                        </Col>
                                    </Form.Group>
                                    <Row className="justify-content-center mt-4">
                                        <Button variant="outline-danger" className="mr-3" onClick={() => this.setState((prevState) => { return { showPasswordForms: !prevState.showPasswordForms } })}>
                                            Cancel
                                        </Button>
                                        <Button variant="primary" type="submit" disabled={!this.validateForm()}>
                                            Change Password
                                        </Button>
                                    </Row>
                                </Form>
                            }
                        </div>
                        <Row className="mx-1 bold mt-4 mb-1 ">API keys</Row>
                        <div className="profile-card p-4">
                            <React.Fragment>
                                {(this.state.api_keys.length !== 0 || this.state.showNewKeyForm) &&
                                    <Row className="mb-2">
                                        <Col className="col-4 bold">Name</Col>
                                        <Col className="col-5 bold">Key Value</Col>
                                    </Row>
                                }
                                {this.state.api_keys.map((value, index) =>
                                    <React.Fragment key={index}>
                                        <Row className="mb-2">
                                            <Col className="col-4 ">{value.name}</Col>
                                            <Col className="col-5 ">{value.templateString}</Col>
                                            <Col className="col-2 "><span onClick={() => this.onDeleteApiKey(value.id)}><i className="fa fa-trash red pointer ml-2"></i></span></Col>
                                        </Row>

                                    </React.Fragment>
                                )}
                                {this.state.showNewKeyForm
                                    ?
                                    <Form className="showForm t-2 ml-n4">
                                        <Form.Row>
                                            <Form.Group as={Col} className="col-4">
                                                <Col >
                                                    <Form.Control
                                                        type="text"
                                                        defaultValue={this.state.keyName}
                                                        onChange={(evt) => this.updateField('keyName', evt.target.value)}
                                                        required
                                                    />
                                                </Col>
                                            </Form.Group>
                                            <Form.Group as={Col} controlId="keyName" className="col-5">
                                                <Col >
                                                    <Form.Control
                                                        type="text"
                                                        defaultValue={this.state.keyValue}
                                                        onChange={(evt) => this.updateField('keyValue', evt.target.value)}
                                                        required
                                                    />
                                                </Col>
                                            </Form.Group>
                                            <Col>
                                                <Button className="mr-3" variant="outline-danger" onClick={() => this.setState({ showNewKeyForm: false })}>Cancel</Button>
                                                <Button variant="primary" onClick={() => this.onSaveApiKey()}><span className="fa fa-key mr-2" />Save key</Button>
                                            </Col>
                                        </Form.Row>
                                    </Form>
                                    :
                                    <Button className={this.state.api_keys.length !== 0 ? "mt-2": null} variant="outline-primary" onClick={() => this.setState({ showNewKeyForm: true })}>
                                        <span className="fa fa-key mr-2" />New API key
                                    </Button>
                                }
                            </React.Fragment>

                        </div>
                    </React.Fragment>
                }

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
            </Container>
        )
    }
}

export default Profile;
