import { PROCESS_RESULT } from '../config/enums';

class ReportGenerator {

  completedPlatesReportGenerator(plate) {
    const plateProcess = plate.processes;
    const reportObj = {
      Single: { count: 0, color: '#2eb000', sampleName: [] },
      Void: { count: 0, color: '#f0b000', sampleName: [] },
      Uncertain: { count: 0, color: '#00b0f0', sampleName: [] },
      Multiple: { count: 0, color: '#b02e00', sampleName: [] }
    };

    if(plateProcess[0].hasOwnProperty('processReports')) {
      for (const i of plateProcess[0].processReports) {
        if (i.overrideValue == null) {
          const key = PROCESS_RESULT[i.predictedValue];
          reportObj[key].count += 1;
          reportObj[key].sampleName.push(i.sampleName);
        } else {
          const key = PROCESS_RESULT[i.overrideValue];
          reportObj[key].count += 1;
          reportObj[key].sampleName.push(i.sampleName);
        }
      }
    }
    return reportObj;
  }


}
export default new ReportGenerator();
