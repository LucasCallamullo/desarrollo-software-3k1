const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db.js');

/**
 * Subject Model
 * 
 * Represents a specific academic subject within the University (e.g., AED, PPR, DDS).
 * This model follows the "associate" pattern to handle relationships without 
 * circular dependency issues in Node.js.
 */
const Subject = sequelize.define('Subject', {
    // Primary key is automatically handled if not defined, 
    // but explicitly defining it is better for clarity.
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    /**
     * Foreign Key for the Degree (Carrera).
     * Note: The relationship is officially established in the associate method.
     */
    degreeId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'degree_id', // This maps the JS property to the DB column name
        references: {
            model: 'degree',
            key: 'id'
        }
    }
}, {
    tableName: 'subjects',
    timestamps: false
});

/**
 * Define associations for the Subject model.
 * @param {Object} models - All initialized Sequelize models.
 */
Subject.associate = (models) => {
    // A Subject belongs to a single Degree (e.g., Systems Engineering)
    Subject.belongsTo(models.Degree, { 
        foreignKey: 'degreeId', // Use the JS name here
        as: 'degree' 
    });

    // A Subject can have multiple Course instances (different years/commissions)
    Subject.hasMany(models.Course, { 
        foreignKey: 'subjectId', 
        as: 'courses' 
    });
};

module.exports = Subject;