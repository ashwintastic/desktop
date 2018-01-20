module.exports = (conn, DataTypes) => {
  const ProcessReport = conn.define('ProcessReport', {
    id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
    sampleName: { type: DataTypes.STRING(10), field: 'sample_name' },
    predictedValue: { type: DataTypes.INTEGER, field: 'predicted_value' },
    overrideValue: { type: DataTypes.INTEGER, field: 'override_value' },
    overrideComment: { type: DataTypes.TEXT, field: 'override_comment' }, // Optional override comment
    analysis: { type: DataTypes.JSON },
    createdAt: { type: DataTypes.DATE, field: 'created_at', allowNull: true, defaultValue: conn.literal('CURRENT_TIMESTAMP') },
    updatedAt: { type: DataTypes.DATE, field: 'updated_at', allowNull: true }
  }, {
    tableName: 'process_report',
    indexes: [
      {
        unique: true,
        name: 'unique_report_by_sample_and_process',
        fields: ['process_id', 'sample_name']
      }
    ]
  });

  return ProcessReport;
};
