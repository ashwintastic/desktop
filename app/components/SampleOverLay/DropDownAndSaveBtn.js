import React, { Component } from 'react';
import styles from '../SampleDetailOverlay.css';
import { PROCESS_RESULT } from '../../config/enums';
import keyEvent from '../../keyEvents/keyEvents';

class DropDownAndBtn extends Component {

  getProcessStatus(s) {
    for (const i in PROCESS_RESULT) {
      if (s == PROCESS_RESULT[i]) {
        return i;
      }
    }
  }

  renderSaveBtn() {
    const { experimentInfo, onChangeStatus } = this.props;
    const options = experimentInfo.report.data;
    const dropDownArray = [];

    for (const i in options) {
      const value = this.getProcessStatus(i);
      dropDownArray.push(<option value={value} key={i}>{i}</option>);
    }
    const selectedvalue = this.getProcessStatus(experimentInfo.sampleStatus);

    return (
      <select
        id="sample-result-select"
        className={'form-control input-sm'}
        value={selectedvalue}
        onChange={onChangeStatus.bind(this)}
      >
        {dropDownArray}
      </select>
    );
  }

  selectResult() {
    document.getElementById('sample-result-select').focus();
  }

  render() {
    const { experimentInfo, saveChanges } = this.props;
    // Bind KeyActions
    keyEvent.onKeyPress('ctrl+s', this.selectResult.bind(this));

    return (
      <div className={`col-md-3 ${styles.drpdowncontainer}`}>
        {this.renderSaveBtn()}
        <button
          id="update-sample-result"
          type="button"
          className={'btn btn-info btn-sm'}
          onClick={saveChanges}
        >UPDATE
            </button>
      </div>
    );
  }
}

export default DropDownAndBtn;
