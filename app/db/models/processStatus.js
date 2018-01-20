module.exports = (conn, DataTypes) => {
  const ProcessStatus = conn.define('ProcessStatus', {
    id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
    status: { type: DataTypes.STRING(10) },
    label: { type: DataTypes.STRING(10) }
  }, {
    tableName: 'process_status',
    timestamps: false
  });

  return ProcessStatus;
};
