import React from 'react';
import styles from './ExperimentHeader.css';
import { PROCESS_STATUS } from '../../config/enums';
import StringUtil from '../../helper/stringUtil';

export default (props) => {
  const experimentEval = props.experimentEval;
  let showLoader = true;
  let showProcessButton = false;
  let showReportDownload = false;
  let statusIcon = 'hidden';
  let status = '';

  if (experimentEval != null) {
    showLoader = false;
    //
    showProcessButton = experimentEval.isOldVersion || experimentEval.isUnprocessed
      || experimentEval.isFailed;

    //
    showReportDownload = (experimentEval.isCompleted
      && experimentEval.experimentStatus !== PROCESS_STATUS.QUEUED
      && experimentEval.experimentStatus !== PROCESS_STATUS.IN_PROGRESS);

    statusIcon = experimentEval.experimentStatus.iconClass;
    status = experimentEval.experimentStatus.label;
  }

  return (
    <div className={'panel-body'}>
      <div className="row" style={{ marginLeft: '-10px' }}>
        <div className="col-md-8">
          {showLoader ? (<i className="fa fa-spinner fa-spin" />) : null}

          <strong>{StringUtil.wrap(props.experimentInfo.name, 90)}</strong><br />
          <span className={styles.folderPath} data-toggle="tooltip" title={props.experimentInfo.folderPath}>
            { !showLoader ? StringUtil.wrap(props.experimentInfo.folderPath, 90) : null}
          </span>
        </div>

        <div className="col-md-4">
          <i className={`${statusIcon} fa-lg`} data-toggle="tooltip" title={status} style={{ marginTop: '10px', float: 'right' }} />

          { !showLoader && showReportDownload &&
          <button id="download-button" tabIndex="2" className="btn btn-info btn-sm" style={{ float: 'right' }} onClick={props.downloadReport}>
            <span id="download-icon" className="fa fa-download" aria-hidden="true" /> REPORT</button>
          }

          { !showLoader && showProcessButton &&
          <button id="start-process" tabIndex="1" className="btn btn-info btn-sm" style={{ float: 'right' }} onClick={props.startProcessing}>
            <span className="fa fa-play-circle-o" aria-hidden="true" /> PROCESS</button>
          }
        </div>
      </div>
    </div>);
};
