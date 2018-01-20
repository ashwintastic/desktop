
import React, { Component } from 'react';
import { PROCESS_STATUS } from '../config/enums';
import ProcessUtil from '../helper/processUtil';

const logger = require('electron').remote.getGlobal('logger');

export default class ProgressBar extends Component {

  stakeBarRepresentation(stakeBarObj, platesInfo) {
    let active = '';

    for (const i of platesInfo.plate.processes) {
      if (i.processStatus == PROCESS_STATUS.IN_PROGRESS.id) {
        active = 'progress-bar-striped active';
      }
    }

    const plateUinqueId = platesInfo.plate.carraigeType + platesInfo.plate.name;
    const stakeBar = [];
    let progressed = 0;

    for (const r in stakeBarObj) {
      const percent = `${stakeBarObj[r].percent}%`;
      progressed += stakeBarObj[r].percent;
      const color = stakeBarObj[r].color;

      stakeBar.push(<div
        className={`progress-bar ${active}`}
        style={{ width: percent, backgroundColor: color }}
        key={plateUinqueId + r}
      />);
    }

    return (
      <div className="progress">{stakeBar}
      </div>
    );
  }

  StakeBarObjGenerator() {
    const { platesInfo } = this.props;
    const stakeBarObj = {};

    const resp = ProcessUtil.evalPlateStatus(platesInfo.plate).isUnprocessed;

    if (!resp) {
      const report = platesInfo.report;
      for (const i in report) {
        const processedVal = report[i].count;
        const color = report[i].color;
       // logger.debug("====================", platesInfo );
        const total = platesInfo.plate.totalSamples;
        stakeBarObj[i] = { percent: (processedVal / total) * 100, color };
      }
      const stakeBar = this.stakeBarRepresentation(stakeBarObj, platesInfo);
      return (stakeBar);
    }

    return null;
  }

  render() {
    const progressInStake = this.StakeBarObjGenerator();
    return (progressInStake);
  }
}
