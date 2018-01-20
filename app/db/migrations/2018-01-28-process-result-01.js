module.exports = {
  up(query, DataTypes) {
    return query.bulkInsert('process_result', [
      { id: 1, result: 'UNCERTAIN', label: 'Uncertain' },
      { id: 2, result: 'VOID', label: 'Void' },
      { id: 3, result: 'SINGLE', label: 'Single' },
      { id: 4, result: 'MULTIPLE', label: 'Multiple' }
    ], {});
  },

  down(query, DataTypes) {
    return query.bulkDelete('process_result', [
      { result: 'UNCERTAIN' },
      { result: 'VOID' },
      { result: 'SINGLE' },
      { result: 'MULTIPLE' }
    ]);
  }
};
