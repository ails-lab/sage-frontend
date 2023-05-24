import React from 'react';
import Row from "react-bootstrap/Row";
import Spinner from 'react-bootstrap/Spinner'

const loadingComponent = (props) => {
    return (
        <Row className="d-flex align-items-center justify-content-center my-1 mx-4">
            <Spinner animation="grow" variant="danger" size="sm" />
            <Spinner animation="grow" variant="danger" size="sm" className="mx-1" />
            <Spinner animation="grow" variant="danger" size="sm" />
            <strong className="text-danger mx-3">{props.text}</strong>
            <Spinner animation="grow" variant="danger" size="sm" />
            <Spinner animation="grow" variant="danger" size="sm" className="mx-1" />
            <Spinner animation="grow" variant="danger" size="sm" />
        </Row>
    )
}

export default loadingComponent;
