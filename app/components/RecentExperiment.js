// @flow
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import styles from './Home.css';
import ProcessUtil from '../helper/processUtil';
import StringUtil from '../helper/stringUtil';
import fs from 'fs';
import Modal from './Modal';

const dateFormat = require('dateformat');
const logger = require('electron').remote.getGlobal('logger');

class RecentExperiment extends Component {

  constructor(props) {
    super(props);
    this.handleOnLinkClick = this.handleOnLinkClick.bind(this);
    this.state = {
      ShowModal: false,
      expInfo: {}
    };
    this.prevent = true;
  }

  componentWillReceiveProps(nextprops) {
   // logger.debug('----nextprops---', nextprops);
  }

  hideModal() {
    this.setState({ ShowModal: false });
  }

  pathValidator(selectedExp, e) {
    const dirPath = selectedExp.folderPath;
    if (!fs.existsSync(dirPath)) {
      e.preventDefault();
      this.setState({ ShowModal: true, expInfo: selectedExp });
    }
  }

  handleOnLinkClick(selectedExp, e) {
    if(this.prevent) {
      this.pathValidator(selectedExp, e);
    }
    this.props.clearPolling();
    this.props.saveSelectedExperimentDTO(selectedExp);
  }

  continueBtn() {
    this.prevent = false;
    this.setState({ ShowModal: false });
  }

  experimentList() {
    let count = 0;

    return this.props.recentExperiments.map((exp) => {
      const experimentStatusEval = ProcessUtil.evalExperimentStatus(exp);
      const statusIcon = experimentStatusEval.experimentStatus.iconClass;
      const status = experimentStatusEval.experimentStatus.label;

      count += 1;
      // Based on smallest window size possible.
      const wrapLengthExpName = 40;
      const wrapLengthExpPath = 30;

      return (
        <Link
          key={count}
          to={`${'/detailedexperiment' + '?'}${exp.folderPath}`}
          className={`list-group-item list-group-item-action ${styles.listItem}`}
          onClick={this.handleOnLinkClick.bind(this, exp)}
          data-toggle="tooltip"
          title={exp.folderPath}
        >
          <span className={styles.experimentName}>{StringUtil.wrap(exp.name, wrapLengthExpName)}</span>
          <i className={`${statusIcon}`} data-toggle="tooltip" title={status} style={{ marginLeft: '10px', marginTop: '3px', float: 'right' }} />
          <span className={styles.dirPath}>{dateFormat(exp.createdAt, 'mmm dd yyyy HH:MM:ss')}</span>
          <span className={styles.dirPath}>{StringUtil.wrap(exp.folderPath, wrapLengthExpPath)}</span>
        </Link>
      );
    });
  }

  render() {
    return (
      <div className="list-group">
        {this.state.ShowModal &&
        <div className="modal">
          <Modal
            hideModal={this.hideModal.bind(this)}
            continueBtn={this.continueBtn.bind(this)}
            expInfo={this.state.expInfo}
          />
        </div>}
        { this.props.recentExperiments === null || this.props.recentExperiments === undefined ?
            (<i className="fa fa-spinner fa-spin fa-2x" />)
              : Array.isArray(this.props.recentExperiments)
                && this.props.recentExperiments.length > 0 ?
                (<div><h3>Recent Experiments</h3>{this.experimentList()}<hr /></div>)
                  : (<div><br /><br /><br /><br /></div>)
          }
      </div>
    );
  }
}

export default RecentExperiment;
