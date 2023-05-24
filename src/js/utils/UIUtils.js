import React, { Component } from "react";
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import DropdownButton from "react-bootstrap/DropdownButton";
import { ToastContainer, toast } from 'react-toastify';

export function actionsMenu(component) {
  return (
    <DropdownButton size="sm"  title={<span title="Actions" className='fa fa-bars'></span>} className="actions">
      {component}
    </DropdownButton>
  )
}

export function toggleBoxColumn(control, _this, list) {
  if (list === undefined || _this.state[list] && _this.state[list].length > 0)
    return (
      <Col className="mybutton" md="auto">
        <Button type="button" className="menubutton"  aria-label="Toggle" onClick={() => _this.setState({ [control]: !_this.state[control]})}><span className={_this.state[control] ? 'fa fa-angle-double-up' : 'fa fa-angle-double-down'}></span></Button>
      </Col>
    )
}

export function sortByField(field, a, b) {
  if (a[field] < b[field]) {
    return -1;
  } else if (a[field] > b[field]) {
    return 1;
  } else {
    return 0;
  }
}

export function pathEquals(path1, path2) {
  if (path1.length !== path2.length) {
    return false;
  }

  for (var i = 0; i < path1.length; i++) {
    if (path1[i].type === path2[i].type && path1[i].uri === path2[i].uri) {
    } else {
      return false;
    }
  }

  return true;
}

export function throwToast(type, message) {
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
  } else if (type === 'success') {
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

export class MessageQueue {
  constructor(that, errorHandler) {
    this.queue = []
    // this.lastConsumedOrder = -1
    this.lastConsumedTime = -1

    this.that = that
    this.errorHandler = errorHandler
  }

  // for testing <--
  // sleep(ms) {
  //   return new Promise(resolve => setTimeout(resolve, ms));
  // }
  //
  // async testMsg(message) {
  //   console.log("STARTING " + message.order)
  //    if (message.order == 0 || message.order == 2) {
  //      console.log("SLEEP " + message.order)
  //      await this.sleep(1000)
  //      console.log("SLEEP FINISH " + message.order)
  //    }
  // }
  //
  // push(message) {
  //  this.testMsg(message).then(()=>pushin(message));
  // }
  // for testing -->

  push(message) {
    // console.log("PUSHING " + message.order + " " + this.cc2LastUsed)
    // console.log(this.cc2)
    // console.log(message)

    // var order = message.order
    var time = Date.parse(message.issuedAt)
    var first = null
    var last = null

    if (this.queue.length > 0) {
      first = this.queue[0];
      last = this.queue[this.queue.length - 1]
    }

    // if (this.lastConsumedOrder < order && (last == null || last.order < order)) {
    if (this.lastConsumedTime < time && (last == null || Date.parse(last.issuedAt) < time)) {
      this.queue.push(message)
    } else {
      return
    }

    if (first == null) {
      // this._this.setState(this._this.handleMessage(this.queue[0]), () => this.pushout())
      this.that.setState(this.errorHandler(this.queue[0], this.that), () => this.consume())
    }
  }

  consume() {
    // this.lastConsumedOrder = this.queue[0].order;
    this.lastConsumedTime = Date.parse(this.queue[0].issuedAt);
    this.queue.splice(0, Math.max(1,this.queue.length - 1))

    if (this.queue.length > 0) {
      // this._this.setState(this._this.handleMessage(this.queue[0]), () => this.pushout())
      // console.log(this.errorHandler(this.queue[0], this.that));
      this.that.setState(this.errorHandler(this.queue[0], this.that), () => this.consume())
    }
  }
}
