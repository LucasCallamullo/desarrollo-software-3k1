/**
 * ================================================================
 * SUBJECT MODEL
 * ================================================================
 * 
 * This model represents an academic subject within a university degree.
 * Examples: AED (Algoritmos y Estructuras de Datos), DDS (Desarrollo de Software)
 * 
 * Table: subjects_subjects
 * 
 * Features:
 *   - Auto-incremented integer primary key
 *   - No timestamps (academic subjects don't change often)
 *   - Association pattern to avoid circular dependencies
 * 
 * Relationships:
 *   - Belongs to a Degree (e.g., Systems Engineering, Computer Science)
 *   - Has many Courses (different years/commissions of the same subject)
 * 
 * ================================================================
 */

const { DataTypes } = require('sequelize');
const sequelize = require('../../core/config/db');

/**
 * Subject Model
 * 
 * Represents a specific academic subject within the University.
 * Each subject belongs to a Degree and can have multiple Course instances.
 */
const Subject = sequelize.define('Subject', {
    /**
     * Primary key - auto-incremented integer
     */
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },

    /**
     * Subject name
     * Required. The full name of the academic subject.
     * Examples: 'Algoritmos y Estructuras de Datos', 'Desarrollo de Software'
     */
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: { msg: 'Subject name cannot be empty' },
            len: { args: [3, 100], msg: 'Subject name must be between 3 and 100 characters' }
        }
    },

    /**
     * Subject code / acronym
     * Optional. Short identifier for the subject.
     * Examples: 'AED' (Algoritmos y Estructuras de Datos), 'DDS' (Desarrollo de Software)
     * Useful for: filtering, search, display in lists where full name is too long
     */
    code: {
        type: DataTypes.STRING(10),
        allowNull: true,
        validate: { len: { args: [2, 10], msg: 'Code must be between 2 and 10 characters' } },
    },

    /**
     * Academic year when the subject is typically taken
     * Optional. Default value is 1.
     * Examples: 1 (first year), 2 (second year), 3 (third year), etc.
     */
    year: {
        type: DataTypes.INTEGER,
        defaultValue: 1,
        validate: {
            min: { args: [1], msg: 'Year must be at least 1' },
            max: { args: [6], msg: 'Year must be at most 6' }
        }
    },

    /**
     * Degree ID - Foreign key referencing Degree
     * Required. Every subject belongs to a degree (e.g., Systems Engineering)
     * Column: degree_id (converted by underscored: true)
     * 
     * Note: underscored: true would convert 'degreeId' to 'degree_id'.
     */
    degreeId: {
        type: DataTypes.INTEGER,
        allowNull: false
        // No need for references here - handled in associate()
    }
}, {
    tableName: 'subjects_subjects',
    timestamps: false,           // Academic subjects don't need created_at/updated_at
    underscored: true            // Converts camelCase to snake_case
});

// ============================================================
// ASSOCIATIONS
// ============================================================
// 'models' is an object containing all loaded models (mapped by name),
// injected by the global model registry. See core/models/index.js.
// ============================================================
Subject.associate = (models) => {
    
    /**
     * Subject belongs to a Degree
     * Type: Many-to-One (N:1)
     * 
     * The foreign key 'degreeId' references 'id' in the Degree model
     * 
     * Database:
     *   - subjects.degree_id REFERENCES degrees.id
     *   - ON DELETE: RESTRICT (cannot delete degree if subjects exist)
     *   - ON UPDATE: CASCADE (if degree.id changes, update degree_id)
     * 
     * Model reference: models.Degree (defined in ../Degree.js)
     */
    Subject.belongsTo(models.Degree, {
        foreignKey: 'degreeId',
        as: 'degree',
        onDelete: 'RESTRICT',     // Prevent deletion of degree with subjects
        onUpdate: 'CASCADE'
    });

    /**
     * Subject has many Courses
     * Type: One-to-Many (1:N)
     * 
     * Database:
     *   - courses.subject_id REFERENCES subjects.id
     *   - ON DELETE: CASCADE (if subject is deleted, delete its courses)
     *   - ON UPDATE: CASCADE (if subject.id changes, update course.subject_id)
     * 
     * Model reference: models.Course (defined in ../Course.js)
     */
    Subject.hasMany(models.Course, {
        foreignKey: 'subjectId',
        as: 'courses',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
    });
};

module.exports = Subject;