module.exports = (conn, DataTypes) => {
  const ProcessResult = conn.define('ProcessResult', {
    id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
    result: { type: DataTypes.STRING(10) },
    label: { type: DataTypes.STRING(10) }
  }, {
    tableName: 'process_result',
    timestamps: false
  });

  return ProcessResult;
};
