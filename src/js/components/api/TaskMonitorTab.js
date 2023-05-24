import React, { Component, useEffect  } from "react";
import Container from "react-bootstrap/Container";
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import { getTasks, stopTask } from '../../utils/TasksAPI';
import ClipLoader from "react-spinners/ClipLoader";
import { TIME_OPTIONS } from "../../constants/index.js"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faRedo, faCheck, faTimes, faStop, faClock} from '@fortawesome/free-solid-svg-icons'

export class TaskMonitorTab extends Component {
  constructor(props) {
    super(props);

    this.state = {
      tasks: props.tasks,
    };

  }

  executeAction(action, params) {
    if (action === 'get-tasks') {
          getTasks()
            .then(response => {
              this.setState( { tasks: response } );
            })
    } else if (action === 'stop-task') {
          stopTask(params.id)
                .then(response => {

                })
        }
  }

  render() {
    return (
      <Container  className="groupborder">
        <Row className="header">
          <Col>
            Tasks
          </Col>
            <Col className="mybutton" md="auto">
              <Button type="button" className="menubutton"  aria-label="Refresh" onClick={() => this.executeAction('get-tasks', {})}><FontAwesomeIcon icon={faRedo}/></Button>
            </Col>
          </Row>

          {this.state.tasks.map((el, index) =>
              <Row key={index} className="taskrow">
                {this.renderRow(el)}
              </Row>
          )}
      </Container>);
  }

  renderRow(el) {
    return (
      <Container className="grouping">
        <Row>
          <Col className="bold" md={10}>
            <span className="crimson-std">{el.type}: </span>
            {el.description}
          </Col>
        </Row>
        <Row>
        <Col md={5}/>
        <Col md={1}>
            {el.state === "QUEUED" && <FontAwesomeIcon className="queued" icon={faClock}/>}
            {(el.state === "STARTED" || el.state === "STOPPING") && <ClipLoader css='spinner' size={12} color='orange' loading={true}/>}
            {(el.state === "STOPPED" || el.state === "FAILED" || el.state === "CANCELED") && <FontAwesomeIcon className="failed" icon={faTimes}/> }
            {el.state === "COMPLETED" && <FontAwesomeIcon className="executed" icon={faCheck}/>}
          </Col>
          <Col md={2}>
            {el.startTime && new Date(el.startTime).toLocaleDateString('en-UK', TIME_OPTIONS)}
          </Col>
          <Col md={2}>
            {el.state !== "CANCELED" &&
              <span className={(el.state === "STOPPED" || el.state === "FAILED") ? "failed" : "executed"}>{el.endTime ? new Date(el.endTime).toLocaleDateString('en-UK', TIME_OPTIONS) : ""}</span>
            }
          </Col>
          <Col md={1}>
            {el.stoppable && el.state === "STARTED" ? <Button type="button" className="menubutton"  aria-label="Stop" onClick={() => this.executeAction('stop-task', {id : el.id})}><FontAwesomeIcon icon={faStop}/></Button> : ""}
          </Col>
        </Row>
        {el.failureException && <Row>
          <Col md={1}/>
          <Col className="red" md={10}>
            {el.failureException}
          </Col>
        </Row>}
        {el.children && el.children.map((el2, index2) =>
            <Container>{this.renderRow(el2)}</Container>)}
      </Container>

    )
  }
}

export default TaskMonitorTab;
