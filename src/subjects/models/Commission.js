/**
 * ================================================================
 * COMMISSION MODEL
 * ================================================================
 * 
 * This model represents a specific student group or section within a course.
 * Examples: '3K1', '3K2', '3K3', '3K4' (different commissions of the same subject)
 * 
 * Table: subjects_commissions
 * 
 * Features:
 *   - Auto-incremented integer primary key
 *   - No timestamps (commissions are static reference data)
 *   - Association pattern to avoid circular dependencies
 * 
 * Relationships:
 *   - Has many Courses (each commission can teach multiple subjects)
 * 
 * Note: Commissions are linked to Subjects through the Course (intersection) model.
 *       This creates a many-to-many relationship between Commission and Subject.
 * 
 * ================================================================
 */

const { DataTypes } = require('sequelize');
const sequelize = require('../../core/config/db');

/**
 * Commission Model
 * 
 * Represents a specific student group or section.
 * Examples: '3K1', '3K2' (Commission 1, Commission 2 of third year)
 */
const Commission = sequelize.define('Commission', {
    /**
     * Primary key - auto-incremented integer
     */
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },

    /**
     * Commission name/identifier
     * Required. The name that identifies the student group.
     * Examples: '3K1', '3K2', '4K1', 'Comisión A', 'Turno Mañana'
     */
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: { msg: 'Commission name cannot be empty' },
            len: { args: [2, 50], msg: 'Commission name must be between 2 and 50 characters' }
        }
    }
}, {
    tableName: 'subjects_commissions',
    timestamps: false,           // Commissions don't need created_at/updated_at
    underscored: true,           // Converts camelCase to snake_case
});

// ============================================================
// ASSOCIATIONS
// ============================================================
// 'models' is an object containing all loaded models (mapped by name),
// injected by the global model registry. See core/models/index.js.
// ============================================================

Commission.associate = (models) => {
    
    /**
     * Commission has many Courses
     * Type: One-to-Many (1:N)
     * 
     * The foreign key 'commissionId' in the Course model references this Commission
     * 
     * Database:
     *   - courses.commission_id REFERENCES commissions.id
     *   - ON DELETE: RESTRICT (cannot delete commission if courses exist)
     *   - ON UPDATE: CASCADE (if commission.id changes, update courses.commission_id)
     * 
     * Model reference: models.Course (defined in ../Course.js)
     * 
     * This creates the link: Commission ←→ Subject (through Course)
     */
    Commission.hasMany(models.Course, {
        foreignKey: 'commissionId',
        as: 'courses',
        onDelete: 'RESTRICT',     // Prevent deletion of commission with courses
        onUpdate: 'CASCADE'
    });
};

module.exports = Commission;