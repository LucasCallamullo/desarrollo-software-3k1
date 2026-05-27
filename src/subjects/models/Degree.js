/**
 * ================================================================
 * DEGREE MODEL
 * ================================================================
 * 
 * This model represents an academic degree or career program offered by the university.
 * Examples: 'Ingeniería en Sistemas de Información', 'Ingeniería Civil'
 * 
 * Table: subjects_degrees
 * 
 * Features:
 *   - Auto-incremented integer primary key
 *   - No timestamps (degrees are static reference data)
 *   - Association pattern to avoid circular dependencies
 * 
 * Relationships:
 *   - Has many Subjects (e.g., Systems Engineering has AED, DDS, PPR, etc.)
 * 
 * ================================================================
 */

const { DataTypes } = require('sequelize');
const sequelize = require('../../core/config/db');

/**
 * Degree Model
 * 
 * Represents an academic degree or program.
 * This is the parent entity for Subjects.
 */
const Degree = sequelize.define('Degree', {
    /**
     * Primary key - auto-incremented integer
     */
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },

    /**
     * Degree name
     * Required. The full official name of the academic program.
     * Examples: 'Ingeniería en Sistemas de Información', 'Ingeniería Civil'
     */
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: { msg: 'Degree name cannot be empty' },
            len: { args: [5, 150], msg: 'Degree name must be between 5 and 150 characters' }
        }
    },

    /**
     * Degree description
     * Optional. Brief description of the degree program.
     * Can include: duration, main focus areas, career opportunities, etc.
     */
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
        validate: {
            len: { args: [0, 500], msg: 'Description cannot exceed 500 characters' }
        }
    },
}, {
    tableName: 'subjects_degrees',
    timestamps: false,           // Degrees don't need created_at/updated_at
    underscored: true,           // Converts camelCase to snake_case
});

// ============================================================
// ASSOCIATIONS
// ============================================================
// 'models' is an object containing all loaded models (mapped by name),
// injected by the global model registry. See core/models/index.js.
// ============================================================
Degree.associate = (models) => {
    
    /**
     * Degree has many Subjects
     * Type: One-to-Many (1:N)
     * 
     * The foreign key 'degreeId' in the Subject model references this Degree
     * 
     * Database:
     *   - subjects.degree_id REFERENCES degrees.id
     *   - ON DELETE: RESTRICT (cannot delete degree if subjects exist)
     *   - ON UPDATE: CASCADE (if degree.id changes, update subjects.degree_id)
     * 
     * Model reference: models.Subject (defined in ../Subject.js)
     * 
     */
    Degree.hasMany(models.Subject, {
        foreignKey: 'degreeId',
        as: 'subjects',
        onDelete: 'RESTRICT',     // Prevent deletion of degree with subjects
        onUpdate: 'CASCADE'
    });
};

module.exports = Degree;