import React, { Component } from 'react';
import { PLATE_TYPE } from '../../config/enums';
import styles from './PlateTable.css';
import { DISABLE_COLOR } from '../../config/colors';
import FileUtils from '../../helper/fileUtil';


export default class PlatesTable extends Component {

  constructor(props) {
    super(props);
    this.state = {
      showSample: '',
      sampleStatus: {},
      showComment: false,
      analysis: {}
    };
  }




  showSamples(s, val, cellInfo, plate, e) {
    e.stopPropagation();
    const { report, experimentInfo, name, carraigeType } = this.props;
    let analysis;
    const overRideValue = null;
    if (cellInfo.status != null) {
      const processReports = plate.processes[0].processReports;
      for (const i of processReports) {
        if (i.sampleName == s + val) {
          analysis = i.analysis;
        }
      }
    }

    const imagePathFolder = FileUtils.getImagePathDir(this.props.experimentInfo, this.props.name);
    const imagesPathArray = FileUtils.getImages(imagePathFolder, s + val);
    if (imagesPathArray.hasOwnProperty('message')) {
      alert(imagesPathArray.message);
      return;
    }

    const data = {
      sampleName: s + val,
      expInfo: this.props.experimentInfo,
      name: this.props.name,
      carraigeType: this.props.carraigeType,
      report: this.props.report,
      sampleStatus: cellInfo.status,
      plate: this.props.plate,
      showComment: this.state.showComment,
      analysis,
      nodes: this.allNodes,
      overRideValue,

    };

    this.props.showOverLayAction(true, data);
  }

  getCellColor(row, col, plate) {
    const processReports = plate.processes[0].processReports;

    for (const i in this.props.report.data) {
      if (this.props.report.data[i].sampleName.includes(row + col)) {
        for (const j of processReports) {
          if (j.sampleName == row + col) {
            return ({ color: this.props.report.data[i].color, status: i, cssClass: styles.cell, overRideVal: j.overrideValue });
          }
        }
      }
    }

    return ({ color: DISABLE_COLOR, cssClass: styles.disabledCell, status: null, overRideVal: null });
  }

  platesTableGenerator(plate, report) {
    this.allNodes = {};
    this.allNodes[plate.name + plate.carraigeType] = {};

    const carraigeType = plate.carraigeType;
    const name = plate.name;

    const plateType = this.getPlateType(plate.plateType);
    const rows = plateType.rows;
    const cols = plateType.cols;

    const tableArray = [];
    let alphaChar = 65;
    let cellInfo = {};

    for (let tr = 0; tr < rows; tr += 1) {
      const tdArray = [];
      const s = String.fromCharCode(alphaChar);
      const nextAlphaChar = alphaChar;
      let nextNode = String.fromCharCode(nextAlphaChar);

      for (let td = 1; td <= cols; td += 1) {
        let tempTd = td;
        if (report != null && report.hasOwnProperty('data')) {
          cellInfo = this.getCellColor(s, td, plate);
        } else {
          cellInfo = { color: DISABLE_COLOR, cssClass: styles.disabledCell, status: null };
        }
        let nextCell = (nextNode) + (tempTd + 1);
        if (td == cols) {
          nextNode = String.fromCharCode(nextAlphaChar + 1);
          tempTd = 0;
          nextCell = (nextNode) + (tempTd += 1);
          if (tr == rows - 1) {
            nextCell = null;
          }
        }
        this.allNodes[plate.name + plate.carraigeType][s + td] = { name: s + td, cellInfo, nextNode: nextCell };
        const tabIndex = cellInfo.status == null ? '-1' : '';

        tdArray.push(<td
          className={styles.tdstyle}
          style={{ backgroundColor: 'white' }}
          onClick={this.showSamples.bind(this, s, td, cellInfo, plate)}
          key={carraigeType + name + td}
          id={s + td}
        >
          <input type="button" tabIndex={tabIndex} style={{ backgroundColor: cellInfo.color }} className={cellInfo.cssClass} />
        </td>);
      }

      tdArray.unshift(<td key="colname" className={styles.tdstyle} style={{ backgroundColor: 'white' }}><span>{s}</span></td>);
      tableArray.push(<tr key={carraigeType + name + s}>{tdArray}</tr>);
      alphaChar += 1;
    }

    return (
      <div className={styles.plateStyle} style={{ backgroundColor: 'white' }}>
        <table cellSpacing="16">
          <tbody>
            {this.header()}
            {tableArray}
          </tbody>
        </table>
      </div>);
  }

  getPlateType(plateId) {
    let key;
    for (key in PLATE_TYPE) {
      if (plateId == PLATE_TYPE[key].id) {
        return PLATE_TYPE[key];
      }
    }
    return null;
  }

  header() {
    const plate = this.props.plate;
    const plateType = this.getPlateType(plate.plateType);
    const cols = plateType.cols;

    const headerTd = [];
    let count = 1;

    headerTd.push(<td key="headerTd" className={styles.tdstyle} style={{ backgroundColor: 'white' }} />);
    for (let td = 0; td < cols; td += 1) {
      headerTd.push(<td key={`header${td}`} className={styles.tdstyle} style={{ backgroundColor: 'white' }}><span>{count}</span></td>);
      count += 1;
    }

    return (<tr>{headerTd}</tr>);
  }

  render() {
    const { plate, report, experimentInfo, name, carraigeType } = this.props;
    const platesTable = this.platesTableGenerator(plate, report);
    return (
      <div>
        {platesTable}
      </div>);
  }
}
