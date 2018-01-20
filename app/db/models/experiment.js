module.exports = (conn, DataTypes) => {
  const Experiment = conn.define('Experiment', {
    id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING(50), allowNull: false },
    folderPath: { type: DataTypes.STRING, field: 'folder_path', allowNull: false },
    createdAt: { type: DataTypes.DATE, field: 'created_at', allowNull: true, defaultValue: conn.literal('CURRENT_TIMESTAMP') },
    updatedAt: { type: DataTypes.DATE, field: 'updated_at', allowNull: true }
    /* TODO:x UPDATED_AT Should have set CURRENT_TIMESTAMP on update in all MODELS*/
  }, {
    tableName: 'experiment',
    indexes: [
      {
        unique: true,
        fields: ['folder_path']
      },
    ]
  });

  Experiment.associate = models => {
    models.Experiment.Plates = models.Experiment.hasMany(models.Plate, { as: 'plates' });
  };

  return Experiment;
};
