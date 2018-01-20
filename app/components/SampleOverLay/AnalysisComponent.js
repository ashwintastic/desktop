/**
 * Created by root on 10/1/18.
 */
import React, { Component } from 'react';
import { ANALYSIS } from '../../config/enums';
import styles from '../SampleDetailOverlay.css';

export default function Analysis(props) {
  const { analysis, plate } = props;
  const analysisArr = new Array();

  for (const i in analysis) {
    if (i != 'UNCERTAIN' && typeof analysis[i] === 'string' && analysis[i] !== '') {
      analysisArr.push(<div key={i}>
        <strong>{ANALYSIS[i]}</strong><p>{analysis[i] == 'u' ? 'Uncertain' : analysis[i] }</p>
      </div>);
    }

    if (typeof analysis[i] === 'object') {
      const temp = analysis[i];

      for (const j in temp) {
        analysisArr.push(<div key={j}><strong>{ANALYSIS[j]}</strong><p>{temp[j]}</p></div>);
      }
    }
  }

  return (<div className={`col-md-3 ${styles.analysis}`}>{analysisArr}</div>);
}
