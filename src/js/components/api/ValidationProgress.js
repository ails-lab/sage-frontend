import React, { Component } from "react";
import Container from "react-bootstrap/Container";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import ProgressBar from "react-bootstrap/ProgressBar";
import Table from "react-bootstrap/Table";
import LoadingComponent from "../LoadingComponent";
import { filterByLanguage } from "../../utils/functions.js";
import { getDatasetProgress } from '../../utils/PagedAnnotationValidationAPI.js';



export class ValidationProgress extends Component {
    constructor(props) {
        super(props);
        this.willreceivepropsFirstTime = false;
        this.state = {
            datasetsProgress: [],
            everythingLoaded: false,
            assignedDatasetslength: 0,
            breakCondition: false
        }
    }

    getDatasetsProgress(datasets) {
        let uuids = [];
        let names = [];
        this.setState({assignedDatasetslength: datasets.length});

        for (let dataset of datasets) {
            uuids.push(dataset.dataset['@id'].split('dataset/')[1]);
            names.push(filterByLanguage(dataset.dataset, 'http://purl.org/dc/terms/title', 'el'));
        }

        for (let index = 0; index < uuids.length; index++) {
            getDatasetProgress(uuids[index])
                .then(response => {
                    let p = response.sort((a, b) => (a.progress > b.progress) ? -1 : 1);
                    let entry = {
                        uuid: uuids[index],
                        name: names[index],
                        progArray: p,
                        avgProgress: this.getAverageProgress(response)
                    };
                    let prog = this.state.datasetsProgress;
                    prog.push(entry);
                    prog.sort((a, b) => (a.avgProgress > b.avgProgress) ? -1 : ((b.avgProgress > a.avgProgress) ? 1 : 0));
                    this.setState({ datasetsProgress: prog });
                })
                .catch(error => console.error(error));
        }
    }

    getAverageProgress(progArray) {
        if (progArray.length > 0) {
            let progs = progArray.map(el => el.progress);
            return parseFloat((progs.reduce((a, b) => a + b, 0) / progs.length).toFixed(2));
        }
        return -1;
    }

    formatProperty(name) {
        let n = name.split('/').pop();
        return n.charAt(0).toUpperCase() + n.slice(1);
    }

    /*
    UNSAFE_componentWillReceiveProps() {
        // because componentWiilReceiveProps() is deprecated and unpredictable it some times loaded
        // multiple times the datasets and as a result it renders the datasets multiple times.
        // We use boolean this.willreceivepropsFirstTime and we execute componentWiilReceiveProps only
        // the first time, the datasets array is not empty.

        if(this.props.datasets.length != 0 && !this.willreceivepropsFirstTime){
            this.willreceivepropsFirstTime = true;
            this.getDatasetsProgress(this.props.datasets);
        }

    }
    */

    componentDidMount() {
      if (this.props.datasets.length != 0 && !this.willreceivepropsFirstTime) {
        this.willreceivepropsFirstTime = true;
        this.getDatasetsProgress(this.props.datasets);
      }
    }

    render() {
        return (
          <Container className={this.state.datasetsProgress && this.state.datasetsProgress.length > 0 ? "groupborder" : "groupborder-empty"}>
            <Row className={this.state.datasetsProgress && this.state.datasetsProgress.length > 0 ? "header" : "header-empty"}>
                    <Col>Validation Progress</Col>
                </Row>
                <Row className="align-items-center">
                    <Col className="pt-3">
                        {Array.from(this.state.datasetsProgress).map((dataset, index) => {
                            this.state.everythingLoaded = (this.state.assignedDatasetslength <= index + 1);
                            return (
                                <Row className="mb-3" key={"table-" + index}>
                                    <Table borderless striped size="md">
                                        <thead>
                                            <tr key={"dataset-" + index} className="border-bottom border-secondary">
                                                <th className="w-50">
                                                    {dataset.name}
                                                </th>
                                                <th className="w-50 pt-3 align-items-center">
                                                    {dataset.avgProgress >= 0 && dataset.avgProgress <= 100 &&
                                                        <Row>
                                                            <Col className="align-self-center w-85" md="auto">
                                                                <ProgressBar now={dataset.avgProgress} />
                                                            </Col>
                                                            <Col className="align-self-center w-15 pl-0" md="auto">
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
                                                        No validations running for this dataset
                                                    </td>
                                                </tr>
                                            }
                                            {dataset.progArray.length > 0 &&
                                                Array.from(dataset.progArray).map((entry, i) => (
                                                    <tr key={"dataset-" + index + "-property-" + i}>
                                                        <td className={"w-50 align-middle" + (entry.locked ? " active-background" : "")}>
                                                            <Row>
                                                                <Col className="w-80 pr-2" md="auto">
                                                                    {entry.propertyName}
                                                                </Col>
                                                                <Col className="w-20 pr-2" md="auto">
                                                                    ({this.formatProperty(entry.asProperty)})
                                                                </Col>
                                                            </Row>
                                                        </td>
                                                        <td className="w-50 pt-3 align-items-center align-middle">
                                                            <Row>
                                                                <Col className="align-self-center w-85 align-middle" md="auto">
                                                                    <ProgressBar>
                                                                        <ProgressBar variant="success" now={entry.totalAnnotations === 0 ? 0 : (entry.totalAccepted / entry.totalAnnotations * 100).toFixed(2)} />
                                                                        <ProgressBar variant="secondary" now={entry.totalAnnotations === 0 ? 0 : (entry.totalNeutral / entry.totalAnnotations * 100).toFixed(2)} />
                                                                        <ProgressBar variant="danger" now={entry.totalAnnotations === 0 ? 0 : (entry.totalRejected / entry.totalAnnotations * 100).toFixed(2)} />
                                                                    </ProgressBar>
                                                                </Col>
                                                                <Col className="align-self-center w-15 pl-0" md="auto">
                                                                    {entry.progress}%
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
                </Row>
                {!this.state.everythingLoaded && this.state.assignedDatasetslength > 0 &&
                    <LoadingComponent text="Loading" />
                }
            </Container>

        )
    }
}

export default ValidationProgress;
