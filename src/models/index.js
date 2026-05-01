const sequelize = require('../config/db.js');

/**
 * GLOBAL MODEL REGISTRY
 * 
 * Import all models from every module in the monolith.
 * This centralized approach allows cross-module relationships
 * (e.g., Posts belonging to Users, Courses having Teachers, etc.)
 */
const Degree = require('../subjects/models/Degree');
const Subject = require('../subjects/models/Subject');
const Commission = require('../subjects/models/Commission');
const Course = require('../subjects/models/Course');

const Post = require('../posts/models/Post');
// const Comment = require('../posts/models/Comment');

const User = require('../users/models/User');

/**
 * Model Registry
 * Groups all models in a single object for easy iteration and association.
 */
const models = {
    Degree,
    Subject,
    Commission,
    Course,
    Post,
    // Comment,
    User
};

/**
 * Associate Models
 * 
 * This block automatically executes the `associate` function defined in each model file.
 * It replicates the behavior of Spring Boot / Django ORM, resolving foreign keys
 * and relationships (1:N, N:M) without circular dependency issues.
 * 
 * The associate pattern separates model definition from relationship declaration,
 * allowing Sequelize to load all models first, then wire them together.
 */
Object.keys(models).forEach((modelName) => {
    if (models[modelName].associate) {
        models[modelName].associate(models);
    }
});

/**
 * Export all models and the Sequelize instance.
 * 
 * - Models: Used for queries (User.findByPk, Post.create, etc.)
 * - sequelize: Used for transactions, sync(), authenticate(), etc.
 */
module.exports = {
    ...models,
    sequelize
};