module.exports = {
  up(query, DataTypes) {
    return query.bulkInsert('process_status', [
      { id: 1, status: 'OPENED', label: 'Opened' },
      { id: 2, status: 'QUEUED', label: 'Queued' },
      { id: 3, status: 'IN_PROGRESS', label: 'In Progress' },
      { id: 4, status: 'PARTIAL_COMPLETE', label: 'Partial Complete' },
      { id: 5, status: 'COMPLETED', label: 'Completed' },
      { id: 6, status: 'FAILED', label: 'Failed' }
    ], {});
  },

  down(query, DataTypes) {
    return query.bulkDelete('process_status', [
      { status: 'OPENED' },
      { status: 'QUEUED' },
      { status: 'IN_PROGRESS' },
      { status: 'PARTIAL_COMPLETE' },
      { status: 'COMPLETED' },
      { status: 'FAILED' }
    ]);
  }
};
