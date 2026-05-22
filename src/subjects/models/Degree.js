const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db.js');

/**
 * Degree Model
 * 
 * Represents an academic degree or program (e.g., Systems Engineering).
 * This is the parent entity for Subjects.
 */
const Degree = sequelize.define('Degree', {
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
    tableName: 'degree',
    timestamps: false
});

/**
 * Define associations for the Degree model.
 * @param {Object} models - All initialized Sequelize models.
 */
Degree.associate = (models) => {
    // A Degree can have many Subjects (e.g., Systems has AED, PPR, etc.)
    Degree.hasMany(models.Subject, { 
        foreignKey: 'degreeId', 
        as: 'subjects'        // relacion inversa que se puede llamar 
    });
};

module.exports = Degree;