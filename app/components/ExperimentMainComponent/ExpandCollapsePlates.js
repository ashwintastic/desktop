
import React, { Component } from 'react';
import styles from './ExpandCollapsePlates.css';
import ReportGenerator from '../../helper/reportGenerator';
import ProgressBar from '../ProgressBar';
import PlatesTable from './PlatesTable';
import ProcessUtil from '../../helper/processUtil';
import { PROCESS_STATUS } from '../../config/enums';

class ExpandCollapsePlates extends Component {

  constructor(props) {
    super(props);
    this.togglePlates = this.togglePlates.bind(this);
    this.generatedReport = '';
    this.state = { startProcessClicked: false };
  }

  startProcessing(selectedPlate, e) {
    e.stopPropagation();
    this.props.addPlateInProcessQueue(this.props.platesInfo, selectedPlate.id);
    // this.setState({ startProcessClicked: true });
    this.props.rerenderMainExp();
  }

  listingReportAnalysis(generatedReport) {
    const arr = [];
    for (const i in generatedReport) {
      arr.push(
        <li key={i} className="list-group-item d-flex justify-content-between align-items-center" style={{ border: 'none', width: '150px' }}>
          {i}
          <div style={{ backgroundColor: generatedReport[i].color, width: '10px', height: '10px', display: 'inlineBlock', float: 'left', marginLeft: '5px', marginTop: '5px', marginRight: '5px' }} />
          <span className="badge badge-primary badge-pill" >{generatedReport[i].count}</span>
        </li>);
    }
    return (
      <div className={styles.resultDiv}>
        <ul className={`list-group-item d-flex justify-content-between align-items-center ${styles.customUl}`}>
          {arr}
        </ul></div>);
  }

  generateCumulativeReport(processedPlatesInfo) {
    const generatedReport = ReportGenerator.completedPlatesReportGenerator(processedPlatesInfo);
    const listing = this.listingReportAnalysis(generatedReport);
    return ({ listing, data: generatedReport });
  }

  checkProcessStatus(processedPlatesInfo) {
    const processesPlate = processedPlatesInfo.processes;

    if (processesPlate !== undefined && processesPlate.length !== 0) {
      const report = this.generateCumulativeReport(processedPlatesInfo);
      return report;
    }
  }

  cumulativeReport(plateInfo) {
    const result = ProcessUtil.evalPlateStatus(plateInfo); // TODO: show even if status is failed.
    const report = {};

    if (!result.isUnprocessed) {
      report.analysis = this.checkProcessStatus(plateInfo);
    }

    let processCmd = 'PROCESS';
    if (result.isUnprocessed || result.canReProcess) {
      if (result.canReProcess) processCmd = 'REPROCESS';

      report.button = (<div style={{ float: 'right' }}>
        <button className="btn btn-info btn-sm" onClick={this.startProcessing.bind(this, plateInfo)}>
          <span className="fa fa-play-circle-o" aria-hidden="true" /> {processCmd}</button>
      </div>);
    }

    return report;
  }

  allProcessedPlates() {
    const { platesInfo, experimentInfo } = this.props;
    let c = 0;

    if (typeof platesInfo !== 'undefined' && platesInfo.hasOwnProperty('plates')) {
      return platesInfo.plates.map((p) => {
        const response = this.cumulativeReport(platesInfo.plates[c]);

        const report = response.analysis;
        let data = null;
        let listing = null;

        if (report !== undefined) {
          data = response.analysis.data;
          listing = response.analysis.listing;
        }

        const processButton = response.button;
        let processStatus = PROCESS_STATUS.OPENED;

        if (p.processes !== undefined && p.processes.length > 0) {
          Object.keys(PROCESS_STATUS).forEach((key) => {
            if (p.processes[0].processStatus == PROCESS_STATUS[key].id) {
              processStatus = PROCESS_STATUS[key];
            }
          });
        }

        const x = (<div
          key={p.id}
          className={`panel panel-default ${styles.plate}`}
        >

          <button onClick={this.togglePlates.bind(this, `plate${p.id}`)} className="row panel-body btn enterBtn" role="button">
            <div className="col-md-8">{p.name} ({p.carraigeType})</div>

            <div className="col-md-4">
              <div className="row">
                <div className="col-md-11">
                  <ProgressBar platesInfo={{ plate: platesInfo.plates[c], report: data }} />
                </div>
                <div className="col-md-1">
                  {(p.processes !== null && p.processes !== undefined && p.processes.length > 0) ?
          (<span className={styles.processStatus}>
            <i className={processStatus.iconClass} data-toggle="tooltip" title={processStatus.label} />
          </span>) : ('')
        }
                </div>
              </div>
            </div></button>
          <div className="row">
            <div className="col-md-12 hide" id={`plate${p.id}`} style={{ backgroundColor: 'WHITE', textAlign: 'center', zIndex: '1', paddingTop: '20px', paddingBottom: '10px', marginTop: '15px', marginBottom: '10px' }}>
              <div className="row">
                <div className="col-md-9">
                  <PlatesTable
                    plate={platesInfo.plates[c]}
                    report={report}
                    experimentInfo={experimentInfo}
                    name={p.name}
                    carraigeType={p.carraigeType}
                    showOverLayAction={this.props.showOverLayAction}
                  />
                </div>

                <div className="col-md-3">
                  <div className="row">
                    {processButton}
                  </div>
                  <div className="row">
                    {listing}
                  </div>
                </div>
              </div>
            </div>
          </div></div>);
        c += 1;
        return (x);
      }
  );
    }
    return (null);
  }

  collapseAllFirst(plateId) {
    const allexpandedPlates = document.getElementsByClassName('col-md-12 show');
    const temp = [];
    for (let i = 0; i < allexpandedPlates.length; i++) {
      if (allexpandedPlates[i].getAttribute('id') != plateId) {
        temp.push(allexpandedPlates[i]);
      }
    }

    temp.map((e) => {
      e.className = 'hide';
    });
  }

  togglePlates(plateId) {
    // TODO:x find a better way to access DOM via refs
    this.collapseAllFirst(plateId);
    const plateclass = document.getElementById(plateId);
    const changedclass = plateclass.className == 'col-md-12 show' ? 'col-md-12 hide' : 'col-md-12 show';
    plateclass.setAttribute('class', changedclass);
  }

  render() {
    return (<div className={styles.platesDiv}>{this.allProcessedPlates()}</div>);
  }
}

export default ExpandCollapsePlates;
