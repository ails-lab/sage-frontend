import React from "react";
import Container from "react-bootstrap/Container";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";

export class Prefixes extends React.Component {

  componentDidMount() {
     // fetch('https://prefix.cc/context')
     //   .then(response => response.json())
     //   .then(json => {
     //     this.setState(json)
     //   })
   }

  render() {
    return (
      <Container className="grouping">
        {this.props.value.map((el, index) => (
          <Row className="grouping" key={index}>
            <Col md={2}>
              <Form.Control value={el.prefix}
                            onChange={(event) => this.props.onChange('prefix', index, event)}/>
            </Col>
            <Col md={8}>
              <Form.Control value={el.url}
                            onChange={(event) => this.props.onChange('url', index, event)}/>
            </Col>
            <Col md={2}>
              <Button type="button" className="menubutton" aria-label="Delete" onClick={(event) => this.props.onChange('delete', index, event)}><span className="fa fa-trash"></span></Button>
            </Col>
          </Row>
        ))}
        <Row className="grouping">
          <Col md={10}/>
          <Col md={2}>
            <Button onClick={(event) => this.props.onChange('add', -1, event)}>New</Button>
          </Col>
        </Row>
      </Container>
    )
  }
}


export default Prefixes;
