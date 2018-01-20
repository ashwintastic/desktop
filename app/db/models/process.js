module.exports = (conn, DataTypes) => {
  const Process = conn.define('Process', {
    id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
    processStatus: { type: DataTypes.INTEGER, allowNull: false, field: 'process_status' },
    startTime: { type: DataTypes.DATE, field: 'start_time' },
    endTime: { type: DataTypes.DATE, field: 'end_time' },
    appVersionAlgo: { type: DataTypes.FLOAT, field: 'app_version_algo' },
    createdAt: { type: DataTypes.DATE, field: 'created_at', allowNull: true, defaultValue: conn.literal('CURRENT_TIMESTAMP') },
    updatedAt: { type: DataTypes.DATE, field: 'updated_at', allowNull: true }
  }, {
    tableName: 'process',
    indexes: [
      {
        unique: true,
        name: 'unique_process_by_plate_and_appVersionAlgo',
        fields: ['plate_id', 'app_version_algo', 'process_status'],
        where: {
          process_status: {
            [conn.Op.ne]: 6 // TODO:z Magic number for ENUM Value of FAILED processStatus.
          }
        }
      }
    ] });

  Process.associate = models => {
    models.Process.ProcessReports = models.Process.hasMany(models.ProcessReport, { as: 'processReports' });
  };

  return Process;
};
