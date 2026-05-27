const sequelize = require('../config/db.js');

/**
 * ================================================================
 * GLOBAL MODEL REGISTRY
 * ================================================================
 * 
 * This file centralizes all models and handles their associations.
 * 
 * The "associate pattern" works as follows:
 *   1. All models are imported and registered in the `models` object
 *   2. After all models are loaded, we iterate over them
 *   3. If a model has an `associate` function, we call it with the models map
 *   4. This allows models to reference each other without circular dependency issues
 * 
 * This pattern is similar to Spring Boot / Django ORM.
 * 
 * @see Each model file defines its own `associate(models)` function
 * ================================================================
 */

// ============================================================
// IMPORTS
// ============================================================

// Auth module
const User = require('../../users/models/User.js');

// Subjects module
const Degree = require('../../subjects/models/Degree.js');
const Subject = require('../../subjects/models/Subject.js');
const Commission = require('../../subjects/models/Commission.js');
const Course = require('../../subjects/models/Course.js');

// Forum module
const Post = require('../../forum/models/Post.js');
const Comment = require('../../forum/models/Comment.js');

// ============================================================
// MODEL REGISTRY
// ============================================================

const models = {
    // Users
    User,
    
    // Subjects
    Degree,
    Subject,
    Commission,
    Course,
    
    // Forum
    Post,
    Comment
};

// ============================================================
// ASSOCIATION WIRING
// ============================================================

/**
 * Iterate through all models and execute their `associate` function.
 * This must be done AFTER all models are loaded to avoid circular dependencies.
 * 
 * The `associate` function receives the complete models map, allowing
 * cross-references like `models.User`, `models.Subject`, etc.
 */
Object.keys(models).forEach((modelName) => {
    if (models[modelName].associate) {
        models[modelName].associate(models);
    }
});

// ============================================================
// EXPORTS
// ============================================================

module.exports = {
    ...models,
    sequelize
};