import React, { Component } from "react";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";

import { TIME_OPTIONS } from "../../constants/index.js"

export class LoadableState extends Component {

  render() {
    var cz
    var ct
    if (this.props.value.loadState === 'NOT_LOADED') {
      cz = 'not-executed'
      ct = 'Not loaded'
    } else if (this.props.value.loadState === 'LOADING') {
      cz = 'executing'
      ct = 'Loading'
    } else if (this.props.value.loadState === 'LOADED') {
      cz = 'executed'
      ct = 'Loaded'
    } else {
      cz = 'not-executed'
      ct = 'Not loaded'
    }

    return (
      <div>
        <div className={cz}>
          {ct}
        </div>
      </div>
    )
  }
}

export default LoadableState;
