const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db.js');

/**
 * Course Model
 * 
 * This is the junction table for the Many-to-Many relationship 
 * between Subjects and Commissions.
 * Maps 'commissionId' -> 'commission_id' and 'subjectId' -> 'subject_id'.
 */
const Course = sequelize.define('Course', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    commissionId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'commission_id', // DB column name
        references: {
            model: 'commissions',
            key: 'id'
        }
    },
    subjectId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'subject_id', // DB column name
        references: {
            model: 'subjects',
            key: 'id'
        }
    }
}, {
    tableName: 'courses',
    timestamps: false
});

/**
 * Define associations for the Course model.
 * @param {Object} models - All initialized Sequelize models.
 */
Course.associate = (models) => {
    // Links this course instance back to its specific Commission
    Course.belongsTo(models.Commission, { 
        foreignKey: 'commissionId', 
        as: 'commission' 
    });

    // Links this course instance back to its specific Subject
    Course.belongsTo(models.Subject, { 
        foreignKey: 'subjectId', 
        as: 'subject' 
    });
};

module.exports = Course;