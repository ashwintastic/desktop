import {
  REPORT_FETCHED,
} from '../constants';
import {ipcRenderer} from 'electron';


export default function saveGeneratedReport(plateName){
  ipcRenderer.send('read-server-file');
  return function (dispatch){
    ipcRenderer.once('send-data-to-react', (event, dataFromExternalFile)=>{
      // TODO :: need to identify the pros and cons of ipcRenderer.on vs ipcRenderer.once
      dispatch(generatedReport('dataFromExternalFile'));
    });
  }
}

function generatedReport(report){
  return {
    type: REPORT_FETCHED,
    payload:report
  }
}
