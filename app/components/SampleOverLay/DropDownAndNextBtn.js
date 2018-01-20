import React, { Component } from 'react';
import keyEvent from '../../keyEvents/keyEvents';
import { PROCESS_STATUS, PROCESS_RESULT } from '../../config/enums';
const logger = require('electron').remote.getGlobal('logger');

class DropDownAndNextBtn extends Component {
  constructor(props) {
    super(props);
    this.state = {
      status: 'Uncertain'
    };
  }

/*  getProcessStatus(s) {
    for (const i in PROCESS_RESULT) {
      if (s == PROCESS_RESULT[i]) {
        return i;
      }
    }
    return null
  }*/

  selectStatus() {
    document.getElementById('next-status-select').focus();
  }

  renderDropDown() {
    const { experimentInfo, onChangeStatus } = this.props;
    // logger.debug(experimentInfo);
    const options = experimentInfo.report.data;
    const dropDownArray = [];
    // TODO:x Next sample option not working.
     dropDownArray.push(<option value="0" key="Next sample">Next sample</option>);
    for (const i in options) {
     // let value = this.getProcessStatus(i);
      dropDownArray.push(<option value={i} key={i}>{i}</option>);
    }

    return (
      <select
        id="next-status-select"
        className={'form-control input-sm'}
        onChange={this.onChange.bind(this)}
        value={this.state.status}
      >
        {dropDownArray}
      </select>
    );
  }

  onChange(e) {
    // logger.debug("ertert",  e.target.value)
    this.setState({ status: e.target.value });
  }

  render() {
    const dropDown = this.renderDropDown();
    const { experimentInfo, showNextSample } = this.props;

    // Bind KeyActions
    keyEvent.onKeyPress('ctrl+shift+n', this.selectStatus.bind(this));
    keyEvent.onKeyPress('ctrl+n', showNextSample.bind(this, experimentInfo.sampleName, this.state.status));

    return (<div className="col-md-3" style={{ display: '-webkit-inline-box' }}>
      {dropDown}
      <button
        id="next-sample"
        type="button"
        className="btn btn-info btn-sm"
        onClick={showNextSample.bind(this, experimentInfo.sampleName, this.state.status)}
      >NEXT</button>
    </div>
    );
  }
}

export default DropDownAndNextBtn;
