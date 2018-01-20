module.exports = (conn, DataTypes) => {
  const Settings = conn.define('Settings', {
    id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
    key: { type: DataTypes.STRING(20), allowNull: false },
    value: { type: DataTypes.STRING },
    createdAt: { type: DataTypes.DATE, field: 'created_at', allowNull: true, defaultValue: conn.literal('CURRENT_TIMESTAMP') },
    updatedAt: { type: DataTypes.DATE, field: 'updated_at', allowNull: true }
  }, {
    tableName: 'settings',
    indexes: [
      {
        unique: true,
        fields: ['key']
      },
    ]
  });

  return Settings;
};
