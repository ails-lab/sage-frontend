import React, { Component } from "react";
import Button from "react-bootstrap/Button";
import { filterByLanguage } from "../../utils/functions.js";

// const CSSVariables = styled.div`
//   --color: ${props => props.color};
// `;

export class Tag extends Component {
  constructor(props) {
    super(props);

    this.state = {
      type: null,
    }
  }

  typeicon(type) {
    if (type === 'DATASET') {
      return (<i className="fa fa-database"/>)
    } else if (type === 'time:from') {
      return (<i className="fa fa-calendar"/>)
    } else if (type === 'time:until') {
      return (<i className="fa fa-calendar"/>)
    } else if (type === 'place') {
      return (<i className="fa fa-globe"/>)
    } else if (type === 'term') {
      return (<i className="fa fa-list"/>)
    }

  }

  render() {
     // let style = {}
  // let btnText = 'Click me!'
  // if (this.state.isClicked) {
  //   btnText = 'Hello World!'
    // style['--tag-background-color'] = 'pink'
  //   cssProperties['--btn-color'] = '#ff9900'
  // }

    return (
      // <CSSVariables color={this.props.color}>
      <div className="tag-tag">
        <span className="tag-type">{this.typeicon(this.props.type)}</span><a target="_blank" rel="noreferrer noopener" href={this.props.entity['@id']}><span className="tag">{filterByLanguage(this.props.entity,'http://www.w3.org/2000/01/rdf-schema#label', this.props.language)}</span></a>
        <Button type="button" className="tagbutton"  aria-label="Toggle" onClick={() => this.props.actions('delete-selected-tag', { type: this.props.type, url: this.props.entity['@id']})}><span className='fa fa-times'></span></Button>
      </div>
      // </CSSVariables>
    )
  }
}

export default Tag
