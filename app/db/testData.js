class TestData {

  generateTestData(models) {
    if (true) {
      // TEST DATA
      models.Experiment.create({
        id: 1,
        name: 'Nerve cell analysis',
        folderPath: 'd:/dataset/nervecell',
        plates: [{ id: 1,
          plateType: 1,
          totalSamples: 96,
          name: 'einstein',
          carraigeType: 'LC',
          processes: [{
            id: 1,
            processStatus: 5,
            appVersionAlgo: 0.1,
            processReports: [
              { id: 1,
                sampleName: 'A1',
                predictedValue: 1,
                overrideValue: null,
                overrideComment: null,
                analysis: { log_data: { UNCERTAIN_REASON: 'SCE-PEAKS', UNCERTAIN: true }, blobs_processed: 'u' } },

              { id: 2,
                sampleName: 'A5',
                predictedValue: 3,
                overrideValue: 4,
                overrideComment: '5 cells seen exiting clearly.',
                analysis: { log_data: { UNCERTAIN_REASON: 'SCE-PEAKS', UNCERTAIN: true }, blobs_processed: '4' } },

              { id: 3,
                sampleName: 'B9',
                predictedValue: 4,
                overrideValue: null,
                overrideComment: null,
                analysis: { log_data: { UNCERTAIN_REASON: 'SCE-PEAKS', UNCERTAIN: true }, blobs_processed: '1' } }
            ]
          }]
        },
        { id: 2,
          plateType: 2,
          totalSamples: 384,
          name: 'einstein',
          carraigeType: 'RC',
          processes: [{
            id: 2,
            processStatus: 2,
            appVersionAlgo: 0.1
          }] },
            { id: 3, plateType: 2, totalSamples: 384, name: 'tesla', carraigeType: 'LC' },
            { id: 4, plateType: 1, totalSamples: 96, name: 'neuton', carraigeType: 'RC' }
        ] }, {
          include: [{
            association: models.Experiment.Plates,
            include: [{ association: models.Plate.Processes,
              include: [models.Process.ProcessReports]
            }]
          }]
        });
    }
  }
}

export default new TestData();
