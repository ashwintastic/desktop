// @flow
import React, { Component } from 'react';
import fs from 'fs';
import { Link } from 'react-router-dom';
import styles from './Home.css';
import FileUtil from '../helper/fileUtil';
import keyEvent from '../keyEvents/keyEvents';
import RecentExperiment from './RecentExperiment';
import { BROWSE_FILE_VALIDATION_MESSAGE, INVALID_DATASET_MSG, EXPERIMENT_FOLDER_NOT_FOUND_ACTION } from '../constants/messages';
import { HOME_POLLING_INTERVAL } from '../constants';

const remote = require('electron').remote;
const logger = require('electron').remote.getGlobal('logger');

class Home extends Component {

  constructor(props) {
    super(props);
    this.handleOnChange = this.handleOnChange.bind(this);

    this.state = {
      showExperimentMain: false
    };

    this.polling = null;
  }

  componentDidMount() { // On component load call.
    this.fetchRecentExperiments();

    if (remote.getGlobal('isAlgoRunning') === true) {
      this.polling = setInterval(() => {
        if (remote.getGlobal('isAlgoRunning') === true) {
          // logger.debug('polling!!');
          this.fetchRecentExperiments();
        } else {
          this.fetchRecentExperiments();
          this.clearPolling(this.polling);
        }
      }, HOME_POLLING_INTERVAL);
    }
  }

  componentWillReceiveProps(nextprops) {
    // logger.debug('----state---', this.state);
  }

  // Custom Methods
  clearPolling() {  // Remove polling.
    clearInterval(this.polling);
  }

  fetchRecentExperiments() {
    this.props.fetchRecentExperiments(5);
  }

  async validateExperimentDataset(dirPath) {
    const response = await FileUtil.validateExperimentDataset(dirPath);

    if (response.isValid === true) {
      this.showExperimentMain(response.path, response.experimentDTO);
    } else {
      alert(INVALID_DATASET_MSG);
      document.getElementById('browse-dataset').value = '';
      this.selectedPath = undefined;
      this.props.saveSelectedExperimentDTO(null);
      this.setState({ showExperimentMain: false });
    }
  }

  showExperimentMain(path, experimentDTO) {
    this.selectedPath = path;

    // Adding selectedExperimentDTO in redux.
    this.props.saveSelectedExperimentDTO(experimentDTO);

    this.setState({ showExperimentMain: true });
  }

  _addDirectory(node) {
    if (node) {
      node.directory = true;
      node.webkitdirectory = true;
    }
  }

  handleOnChange(e) {
    this.validateExperimentDataset(e.target.files[0].path);
  }

  browseDataset(d) {
    const input = document.getElementById('browse-dataset');
    const open = document.getElementById('open-btn');
    open.focus();
    input.click();
  }

  handleOnLinkClick(selectedExp) {
    if (typeof selectedExp === 'undefined') {
      alert(BROWSE_FILE_VALIDATION_MESSAGE);
      return false;
    }
    this.clearPolling();
  }

  render() {
    const { showExperimentMain } = this.state;
    const path = showExperimentMain ? `${'/detailedexperiment' + '?'}${this.selectedPath}` : '#';
    keyEvent.onKeyPress('ctrl+o', this.browseDataset.bind(this, 'internal data for function'), 'optional data if reqiired');

    return (
      <div className="container">
        <div className={styles.newExperiment}>
          <RecentExperiment
            fetchRecentExperiments={this.props.fetchRecentExperiments}
            recentExperiments={this.props.recentExperiments}
            saveSelectedExperimentDTO={this.props.saveSelectedExperimentDTO}
            clearPolling={this.clearPolling.bind(this)}
          />

          <div className="input-group">
            <input id="browse-dataset" className="form-control width50 " ref={node => this._addDirectory(node)} type="file" onChange={this.handleOnChange} />
            <span className="input-group-btn">
              <Link
                id="open-btn"
                className="btn btn-info"
                onClick={this.handleOnLinkClick.bind(this, this.selectedPath)}
                to={path}
              >OPEN</Link>
            </span>
          </div>
        </div>
      </div>
    );
  }
}

export default Home;
