/**
 * ================================================================
 * COURSE MODEL
 * ================================================================
 * 
 * This model represents the junction (intersection) table for the
 * Many-to-Many relationship between Subjects and Commissions.
 * 
 * A Course links a specific Subject with a specific Commission.
 * Examples: AED (Subject) taught in 3K1 (Commission) → one Course record
 * 
 * Table: courses
 * 
 * Features:
 *   - Auto-incremented integer primary key
 *   - No timestamps (junction table, no need for created_at/updated_at)
 *   - Composite foreign keys to Subject and Commission
 * 
 * Relationships:
 *   - Belongs to a Commission (e.g., 3K1)
 *   - Belongs to a Subject (e.g., AED)
 * 
 * This is the intermediate table that resolves the Many-to-Many
 * relationship between Subject and Commission.
 * 
 * ================================================================
 */

const { DataTypes } = require('sequelize');
const sequelize = require('../../core/config/db');

/**
 * Course Model
 * 
 * Junction table linking Subjects and Commissions.
 * Each record represents a specific subject taught in a specific commission.
 */
const Course = sequelize.define('Course', {
    /**
     * Primary key - auto-incremented integer
     */
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },

    /**
     * Commission ID - Foreign key referencing Commission
     * Required. Column: commission_id
     * Maps commissionId → commission_id in database
     */
    commissionId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },

    /**
     * Subject ID - Foreign key referencing Subject
     * Required. Column: subject_id
     * Maps subjectId → subject_id in database
     */
    subjectId: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
}, {
    tableName: 'courses',
    timestamps: false,           // Junction table doesn't need timestamps
    underscored: true            // Converts camelCase to snake_case
});

// ============================================================
// ASSOCIATIONS
// ============================================================
// 'models' is an object containing all loaded models (mapped by name),
// injected by the global model registry. See core/models/index.js.
// ============================================================

Course.associate = (models) => {
    
    /**
     * Course belongs to a Commission
     * Type: Many-to-One (N:1)
     * 
     * The foreign key 'commissionId' references 'id' in the Commission model
     * 
     * Database:
     *   - courses.commission_id REFERENCES commissions.id
     *   - ON DELETE: CASCADE (if commission is deleted, delete its courses)
     *   - ON UPDATE: CASCADE
     * 
     * Model reference: models.Commission (defined in ../Commission.js)
     */
    Course.belongsTo(models.Commission, {
        foreignKey: 'commissionId',
        as: 'commission',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
    });

    /**
     * Course belongs to a Subject
     * Type: Many-to-One (N:1)
     * 
     * The foreign key 'subjectId' references 'id' in the Subject model
     * 
     * Database:
     *   - courses.subject_id REFERENCES subjects.id
     *   - ON DELETE: CASCADE (if subject is deleted, delete its courses)
     *   - ON UPDATE: CASCADE
     * 
     * Model reference: models.Subject (defined in ../Subject.js)
     */
    Course.belongsTo(models.Subject, {
        foreignKey: 'subjectId',
        as: 'subject',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
    });
};

module.exports = Course;