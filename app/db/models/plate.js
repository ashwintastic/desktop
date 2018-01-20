module.exports = (conn, DataTypes) => {
  const Plate = conn.define('Plate', {
    id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
    plateType: { type: DataTypes.INTEGER, field: 'plateType', allowNull: false },
    name: { type: DataTypes.STRING(50), allowNull: false },
    carraigeType: { type: DataTypes.CHAR(2), field: 'carraige_type', allowNull: false }, // LC/RC
    totalSamples: { type: DataTypes.INTEGER, field: 'total_sample', allowNull: false }, // Total samples in plate.
    createdAt: { type: DataTypes.DATE, field: 'created_at', allowNull: true, defaultValue: conn.literal('CURRENT_TIMESTAMP') },
    updatedAt: { type: DataTypes.DATE, field: 'updated_at', allowNull: true }
  }, {
    tableName: 'plate',
    indexes: [
      {
        unique: true,
        name: 'unique_plates_by_experiment',
        fields: ['experiment_id', 'name', 'carraige_type']
      }
    ]
  });

  Plate.associate = models => {
    models.Plate.Processes = models.Plate.hasMany(models.Process, { as: 'processes' });
  };

  return Plate;
};
