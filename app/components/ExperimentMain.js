import { ipcRenderer } from 'electron';
import React, { Component } from 'react';
import NotificationSystem from 'react-notification-system';
import { Link } from 'react-router-dom';
import styles from './ExperimentMain.css';
import ExperimentHeader from './ExperimentMainComponent/ExperimentHeader';
import ExpandCollapsePlates from './ExperimentMainComponent/ExpandCollapsePlates';
import { POLLING_INTERVAL } from '../constants';
import ProcessUtil from '../helper/processUtil';
import SampleDetailOverlay from './SampleDetailOverlay';
import { PROCESS_STATUS, PROCESS_RESULT } from '../config/enums';
import keyEvent from '../keyEvents/keyEvents';
import NotificationUtil from '../helper/notificationUtil';
import SampleTraversal from '../helper/sampleTraversal';

const opn = require('opn');

const logger = require('electron').remote.getGlobal('logger');

class ExperimentMain extends Component {
  constructor(props) {
    super(props);

    this.state = {
      expInfo: '',
      toggle: false,
      showOverLay: false,
      overLayData: {}
    };

    this.experimentEval = null;

    this.interval = null;
    this.pollUpdates = false;
    this.processComplete = false;
  }

  componentWillReceiveProps(nextprops) {
    if (nextprops.showOverLay.flag) {
      this.setState({ showOverLay: true, overLayData: nextprops.showOverLay.data });
    }
    this.setState({ expInfo: nextprops.selectedExperiment });
    this.selectedexp = nextprops.selectedExperiment;

    this.experimentEval = ProcessUtil.evalExperimentStatus(this.selectedexp);
    // logger.debug(this.experimentEval);
    this.pollUpdates = (this.experimentEval.experimentStatus == PROCESS_STATUS.IN_PROGRESS || this.experimentEval.experimentStatus == PROCESS_STATUS.QUEUED);
    this.processComplete = (this.experimentEval.experimentStatus == PROCESS_STATUS.COMPLETED && !this.experimentEval.isOldVersion);
  }

  componentDidMount() {
    this.interval = setInterval(() => {
      if (this.pollUpdates) {
        // logger.debug('polling!!');
        this.props.getProcessUpdate(this.selectedexp);
      }
    }, POLLING_INTERVAL);
    // open selected experiment and set in redux as selectedExperiment.
    this.props.openSelectedExperiment(this.props.selectedExperimentDTO);
  }

  startProcessing() {
    this.props.addExperimentInProcessQueue(this.props.selectedExperiment);
    this.props.getProcessUpdate(this.selectedexp);
    this.pollUpdates = true;
    this.setState({ expInfo: this.props.selectedExperiment, toggle: !this.state.toggle });
  }

  downloadReport() {
    // add loader and report report button.
    const downloadButton = document.getElementById('download-button');
    const downloadIcon = document.getElementById('download-icon');
    if (downloadButton !== undefined && downloadButton !== null) {
      downloadButton.disabled = true;
      downloadButton.setAttribute('class', 'btn btn-info btn-sm disabled');
      downloadIcon.setAttribute('class', 'fa fa-spinner fa-spin');
    }

    ipcRenderer.send('download-report', this.props.selectedExperiment);

    ipcRenderer.once('report-downloaded', (event, response) => {
      if (response.success) {
        // Do this from the renderer process
        const notif = new window.Notification('Download Complete', {
          body: response.data.name,
          silent: false
        });

        notif.onclick = function () {
          ipcRenderer.send('focus-window');
          // Open the downloaded file.
          opn(response.data.path);
        };
      } else {
        alert('Some error occured in report generation.');
      }

      // remove loader.
      if (downloadButton !== undefined && downloadButton !== null) {
        downloadButton.setAttribute('class', 'btn btn-info btn-sm');
        downloadIcon.setAttribute('class', 'fa fa-download');
        downloadButton.disabled = false;
      }
    });
  }

  toggleAll(divclass) {
    const plateclass = document.getElementsByClassName(divclass);
    const changedclass = divclass == 'show' ? 'hide' : 'show';
    const arr = [];

    for (let i = 0; i < plateclass.length; i += 1) {
      arr.push(plateclass[i]);
    }

    arr.map((e) => {
      e.className = changedclass;
    });
  }

  handleOnclick() {
    clearInterval(this.interval);
  }

  hideOverlay() {
    this.props.showOverLayAction(false, {});
    this.setState({ showOverLay: false });
  }

  onChangeStatus(e) {
    const temp = this.state.overLayData;
    temp.sampleStatus = e.target.value;
    this.props.showOverLayAction(true, temp);
  }

  getProcessStatus(s) {
    for (const i in PROCESS_RESULT) {
      if (s == PROCESS_RESULT[i]) {
        return i;
      }
    }
    return null;
  }

  saveChanges() {
    // Override sample result in a sync call.
    // Show notification based on result.
    // If success update the selectedExperiment.

    let comment = null;
    const data = {};
    if (this.comment != null) {
      comment = this.comment.value;
    }
    let status = this.state.overLayData.sampleStatus;

    // TODO:? WHY we need this? should find issue why we are getting string values instead.
    if (isNaN(status)) {
      status = this.getProcessStatus(status);
    }

    data.processId = this.state.overLayData.plate.processes[0].id;
    data.overrideValue = status;
    data.overrideComment = comment;
    data.sampleName = this.state.overLayData.sampleName;

    // Direct Sync IPC Call
    const response = ipcRenderer.sendSync('update-sample-result', data.processId, data.sampleName, data.overrideValue, data.overrideComment);
    if (response.success === true) {
      this.props.getProcessUpdate(this.selectedexp);
      NotificationUtil.showNotification(this.refs.notificationSystem, 'success', 'Sample result updated');
    } else {
      NotificationUtil.showNotification(this.refs.notificationSystem, 'error', 'Some error occured !');
    }
  }

/*  checkPlateOfSimilarStatus(status, node) {
    if (node.cellInfo.status != null && status == node.cellInfo.status) {
      return true;
    }

    return false;
  }

  getNextSample(currentNode, tempState, plateName) {
    let nextSampleName = tempState.nodes[plateName][currentNode].nextNode;
    let nextSample = tempState.nodes[plateName][nextSampleName];
    if (typeof nextSample === 'undefined') {
      return false;
    }
    while (nextSample.nextNode != null) {
      if (nextSample.cellInfo.overRideVal == 'Uncertain') {
        return nextSample;
      }
      if (nextSample.cellInfo.status == 'Uncertain') {
        return nextSample;
      }
      nextSampleName = nextSample.nextNode;
      nextSample = tempState.nodes[plateName][nextSampleName];
    }
    return false;
  }*/

  showNextSample(currentNode, status) {
    const tempState = this.state.overLayData;

    if (status != 0) {
      const nextSample = SampleTraversal.nextSampleWithGivenStatus(tempState, status, currentNode);

      if (!nextSample) {
        alert('You have reached end of this plate.');
        this.hideOverlay();
        return;
      }

      tempState.sampleStatus = nextSample.cellInfo.status;
      tempState.sampleName = nextSample.name;
      tempState.analysis = nextSample.analysis;
      this.props.showOverLayAction(true, tempState);
    } else {
      const nextSample = SampleTraversal.nextSample(tempState, currentNode);
      if (!nextSample) {
        alert('You have reached end of this plate.');
        this.hideOverlay();
        return;
      }
      tempState.sampleStatus = nextSample.cellInfo.status;
      tempState.sampleName = nextSample.name;
      tempState.analysis = nextSample.analysis;
      this.props.showOverLayAction(true, tempState);
    }
  }

  // KeyAction Methods.
  startProcessingShortcut() {
    const ele = document.getElementById('start-process');
    if (ele !== undefined && ele != null) { this.startProcessing(); }
  }

  downloadReportShortcut() {
    const ele = document.getElementById('download-button');
    if (ele !== undefined && ele != null) { this.downloadReport(); }
  }

  backpage() {
    const ele = document.getElementById('back-link');
    if (ele !== undefined && ele != null) { ele.click(); }
  }

  slide(btnClass) {
    const ele = document.getElementsByClassName(btnClass)[0];
    if (ele !== undefined && ele != null) { ele.click(); }
  }
  // --

  render() {
// Adding KeyActions
    // Mainpage
    keyEvent.onKeyPress('ctrl+p', this.startProcessingShortcut.bind(this));
    keyEvent.onKeyPress('ctrl+d', this.downloadReportShortcut.bind(this));
    keyEvent.onKeyPress('backspace', this.backpage.bind(this));

    // overlay keyAction.
    keyEvent.onKeyPress('esc', this.hideOverlay.bind(this));
    keyEvent.onKeyPress('left', this.slide.bind(this, 'slick-arrow slick-prev'));
    keyEvent.onKeyPress('right', this.slide.bind(this, 'slick-arrow slick-next'));

    // Next button
    // keyEvent.onKeyPress('ctrl+shift+n', this.selectStatus.bind(this));
    // keyEvent.onKeyPress('ctrl+n', showNextSample.bind(this, experimentInfo.sampleName, this.state.status));

// --
    if (this.interval != null && this.processComplete) {
      clearInterval(this.interval); // Removes polling
    }

    // Refer for styles override: https://github.com/igorprado/react-notification-system/blob/master/src/styles.js
    const notificationStyle = {
      NotificationItem: { // Override the notification item
        DefaultStyle: { // Applied to every notification, regardless of the notification level
          // margin: '10px 5px 2px 1px'
        },

        success: {
          borderTop: '0px'
        },

        error: {
          borderTop: '0px'
        }
      }
    };

    return (
      <div className="container">
        <div className="row">
          <h4>Experiment Page</h4>
          <div className={`panel panel-default ${styles.experimentMainPannel}`}>
            <ExperimentHeader
              experimentInfo={this.state.expInfo}
              experimentEval={this.experimentEval}
              startProcessing={this.startProcessing.bind(this)}
              downloadReport={this.downloadReport.bind(this)}
            />
            <hr />
            <ExpandCollapsePlates
              platesInfo={this.state.expInfo}
              addPlateInProcessQueue={this.props.addPlateInProcessQueue}
              rerenderMainExp={this.props.rerenderMainExp}
              experimentInfo={this.state.expInfo}
              showOverLayAction={this.props.showOverLayAction}
            />
          </div>
        </div>

        <div className="row">
          <Link id="back-link" to="/homePage" onClick={this.handleOnclick.bind(this)} className={styles.backBtn}>BACK</Link>
        </div>

        <div className="row">
          <NotificationSystem ref="notificationSystem" style={notificationStyle} />
          {this.state.showOverLay && this.state.overLayData.sampleStatus !== null &&
          <div className="overlay">
            <SampleDetailOverlay
              experimentInfo={this.state.overLayData}
              hideOverlay={this.hideOverlay.bind(this)}
              onChangeStatus={this.onChangeStatus.bind(this)}
              saveChanges={this.saveChanges.bind(this)}
              showNextSample={this.showNextSample.bind(this)}
            />
          </div>}
        </div>
      </div>
    );
  }
}

export default ExperimentMain;
