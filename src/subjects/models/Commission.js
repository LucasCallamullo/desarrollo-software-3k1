const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db.js');

/**
 * Commission Model
 * 
 * Represents a specific student group or section (e.g., 3K1).
 * Commissions are linked to Subjects through the Course (intersection) model.
 */
const Commission = sequelize.define('Commission', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, {
    tableName: 'commissions',
    timestamps: false
});

/**
 * Define associations for the Commission model.
 * @param {Object} models - All initialized Sequelize models.
 */
Commission.associate = (models) => {
    // A Commission can have multiple Course instances (one for each subject taught)
    Commission.hasMany(models.Course, { 
        foreignKey: 'commissionId', 
        as: 'courses' 
    });
};

module.exports = Commission;