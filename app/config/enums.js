export const PROCESS_RESULT = {
  1: 'Uncertain',
  2: 'Void',
  3: 'Single',
  4: 'Multiple'
};

export const PROCESS_STATUS = {
  OPENED: { id: 1, label: 'Opened', color: '', iconClass: 'fa fa-folder-open' },
  QUEUED: { id: 2, label: 'Queued', color: '', iconClass: 'fa fa-tasks' },
  IN_PROGRESS: { id: 3, label: 'In Progress', color: '', iconClass: 'fa fa-spinner fa-spin' },
  PARTIAL_COMPLETED: { id: 4, label: 'Partial Complete', color: '', iconClass: 'fa fa-check-square-o' },
  COMPLETED: { id: 5, label: 'Completed', color: '', iconClass: 'fa fa-check' },
  FAILED: { id: 6, label: 'Failed', color: '', iconClass: 'fa fa-exclamation-triangle' }
};

export const PLATE_TYPE = {
  S96: { id: 1, name: '96 samples plate', rows: 8, cols: 12 },
  S384: { id: 2, name: '384 samples plate', rows: 16, cols: 24 }
};

export const ANALYSIS = {
  blobs_processed: 'No of cells',
  UNCERTAIN_REASON: 'Reason'
};
