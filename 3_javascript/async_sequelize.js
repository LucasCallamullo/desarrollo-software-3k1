/**
 * SEQUELIZE ASYNC/AWAIT EXAMPLES
 * Database operations using async/await pattern
 * 
 * Prerequisites:
 * npm install sequelize sqlite3 (or pg for PostgreSQL)
 */

const { Sequelize, DataTypes } = require('sequelize');

// ============================================
// 1. DATABASE CONNECTION (Async initialization)
// ============================================

/**
 * Initialize database connection
 * Sequelize automatically manages connection pool
 */
const sequelize = new Sequelize({
    dialect: 'sqlite',           // Using SQLite for simplicity
    storage: 'database.sqlite',  // File where database is stored
    logging: false               // Disable SQL query logging (set true for debugging)
});

/**
 * Test database connection
 * Authenticates the connection to the database
 */
async function testConnection() {
    try {
        await sequelize.authenticate();
        console.log(' Database connection established successfully');
    } catch (error) {
        console.error(' Unable to connect to database:', error);
    }
}

// ============================================
// 2. DEFINE MODEL (Schema definition)
// ============================================

/**
 * User model definition
 * Represents the 'users' table in database
 */
const User = sequelize.define('User', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: true,
            len: [2, 50]  // Name must be between 2 and 50 characters
        }
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true  // Validates email format
        }
    },
    age: {
        type: DataTypes.INTEGER,
        validate: {
            min: 18,
            max: 120
        }
    }
}, {
    timestamps: true,  // Adds createdAt and updatedAt columns
    paranoid: true     // Soft deletes (adds deletedAt column)
});

/**
 * Post model definition (for relationship example)
 */
const Post = sequelize.define('Post', {
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: false
    }
});

// Define relationships
User.hasMany(Post);     // One user can have many posts
Post.belongsTo(User);   // Each post belongs to one user

// ============================================
// 3. ASYNC DATABASE OPERATIONS (CRUD EXAMPLES)
// ============================================

/**
 * CREATE: Insert a new user into database
 * @param {Object} userData - User information
 * @returns {Promise<Object>} - Created user
 */
async function createUser(userData) {
    try {
        const newUser = await User.create({
            name: userData.name,
            email: userData.email,
            age: userData.age
        });
        console.log(` User created: ${newUser.name} (ID: ${newUser.id})`);
        return newUser;
    } catch (error) {
        console.error(' Error creating user:', error.errors || error.message);
        throw error;
    }
}

/**
 * READ: Find all users with optional filters
 * @returns {Promise<Array>} - List of users
 */
async function getAllUsers() {
    try {
        // Find all users, ordered by name ascending
        const users = await User.findAll({
            order: [['name', 'ASC']],
            attributes: ['id', 'name', 'email', 'age']  // Select specific columns
        });
        console.log(` Found ${users.length} users`);
        return users;
    } catch (error) {
        console.error(' Error fetching users:', error.message);
        throw error;
    }
}

/**
 * READ: Find a user by ID
 * @param {number} id - User ID
 * @returns {Promise<Object|null>} - User or null if not found
 */
async function getUserById(id) {
    try {
        // findByPk = "Find By Primary Key"
        const user = await User.findByPk(id, {
            include: [{ model: Post }]  // Include related posts (eager loading)
        });
        
        if (!user) {
            console.log(` User with ID ${id} not found`);
            return null;
        }
        
        console.log(` User found: ${user.name}`);
        return user;
    } catch (error) {
        console.error('❌ Error finding user:', error.message);
        throw error;
    }
}

/**
 * UPDATE: Modify existing user data
 * @param {number} id - User ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<number>} - Number of affected rows
 */
async function updateUser(id, updates) {
    try {
        // update() returns array: [numberOfAffectedRows, affectedRows]
        const [affectedRows] = await User.update(updates, {
            where: { id: id },
            returning: true  // Returns updated rows (PostgreSQL/SQLite)
        });
        
        if (affectedRows === 0) {
            console.log(` No user found with ID ${id}`);
            return 0;
        }
        
        console.log(` User ${id} updated (${affectedRows} row affected)`);
        return affectedRows;
    } catch (error) {
        console.error(' Error updating user:', error.message);
        throw error;
    }
}

/**
 * DELETE: Remove a user (soft delete due to paranoid: true)
 * @param {number} id - User ID
 * @returns {Promise<number>} - Number of destroyed rows
 */
async function deleteUser(id) {
    try {
        // Soft delete (sets deletedAt timestamp, doesn't remove row)
        const destroyedRows = await User.destroy({
            where: { id: id }
        });
        
        if (destroyedRows === 0) {
            console.log(` No user found with ID ${id}`);
            return 0;
        }
        
        console.log(` User ${id} soft deleted`);
        return destroyedRows;
    } catch (error) {
        console.error(' Error deleting user:', error.message);
        throw error;
    }
}

/**
 * ADVANCED: Find users with complex conditions
 * @returns {Promise<Array>} - Filtered users
 */
async function getUsersByConditions() {
    try {
        const users = await User.findAll({
            where: {
                age: {
                    [Sequelize.Op.gte]: 18,  // age >= 18
                    [Sequelize.Op.lte]: 65   // age <= 65
                },
                name: {
                    [Sequelize.Op.like]: '%a%'  // name contains letter 'a'
                }
            },
            limit: 10,        // Max 10 results
            offset: 0,        // Skip 0 rows (pagination)
            order: [['age', 'DESC']]  // Sort by age descending
        });
        
        console.log(` Found ${users.length} users matching conditions`);
        return users;
    } catch (error) {
        console.error(' Error with complex query:', error.message);
        throw error;
    }
}

// ============================================
// 4. TRANSACTIONS (Atomic operations)
// ============================================

/**
 * Create user and posts in a single transaction
 * If any operation fails, ALL changes are rolled back
 * 
 * @param {string} userName - User's name
 * @param {Array} postTitles - Array of post titles
 * @returns {Promise<Object>} - Created user with posts
 */
async function createUserWithPostsTransaction(userName, postTitles) {
    // Start a transaction
    const transaction = await sequelize.transaction();
    
    try {
        // Step 1: Create user within transaction
        const newUser = await User.create({
            name: userName,
            email: `${userName.toLowerCase()}@example.com`,
            age: 25
        }, { transaction });  // ← Pass transaction here
        
        // Step 2: Create multiple posts for this user
        const posts = [];
        for (const title of postTitles) {
            const post = await Post.create({
                title: title,
                content: `This is content for "${title}"`,
                UserId: newUser.id
            }, { transaction });  // ← Same transaction
            posts.push(post);
        }
        
        // If we reach here, everything succeeded
        await transaction.commit();  // Save all changes to database
        console.log(`Transaction committed: User "${userName}" with ${posts.length} posts`);
        
        return { user: newUser, posts: posts };
        
    } catch (error) {
        // If any error occurred, rollback ALL changes
        await transaction.rollback();
        console.error(`❌ Transaction rolled back:`, error.message);
        throw error;
    }
}

// ============================================
// 5. MAIN EXECUTION (Using async/await pattern)
// ============================================

/**
 * Main function demonstrating sequential async operations
 */
async function main() {
    console.log('Starting database operations...\n');
    
    // Step 1: Sync database schema (creates tables if not exist)
    await sequelize.sync({ force: false });  // force: true drops existing tables
    console.log('Database schema synced\n');
    
    // Step 2: Test connection
    await testConnection();
    
    // Step 3: Create users (parallel execution with Promise.all)
    console.log('\n--- CREATING USERS ---');
    const usersData = [
        { name: 'Lucas', email: 'lucas@example.com', age: 28 },
        { name: 'Maria', email: 'maria@example.com', age: 32 },
        { name: 'Carlos', email: 'carlos@example.com', age: 45 }
    ];
    
    // Promise.all runs multiple async operations IN PARALLEL
    const createdUsers = await Promise.all(
        usersData.map(user => createUser(user))
    );
    
    // Step 4: Read all users
    console.log('\n--- READING ALL USERS ---');
    const allUsers = await getAllUsers();
    console.table(allUsers.map(u => ({ name: u.name, email: u.email })));
    
    // Step 5: Update a user
    console.log('\n--- UPDATING USER ---');
    await updateUser(createdUsers[0].id, { age: 29 });
    
    // Step 6: Find specific user
    console.log('\n--- FINDING USER BY ID ---');
    const foundUser = await getUserById(createdUsers[0].id);
    console.log(foundUser?.toJSON());
    
    // Step 7: Transaction example
    console.log('\n--- TRANSACTION EXAMPLE ---');
    const result = await createUserWithPostsTransaction(
        'TransactionUser',
        ['First Post', 'Second Post', 'Third Post']
    );
    console.log(`Created: ${result.user.name} with ${result.posts.length} posts`);
    
    // Step 8: Complex query
    console.log('\n--- COMPLEX QUERY ---');
    const filteredUsers = await getUsersByConditions();
    console.table(filteredUsers);
    
    // Step 9: Delete a user (soft delete)
    console.log('\n--- DELETING USER ---');
    await deleteUser(createdUsers[2].id);
    
    // Step 10: Verify deletion (won't appear in normal queries due to paranoid)
    console.log('\n--- VERIFY DELETED USER ---');
    const afterDelete = await getAllUsers();
    console.log(`Users after deletion: ${afterDelete.length} (one user soft deleted)`);
    
    console.log('\nAll async operations completed successfully!');
}

// ============================================
// 6. EXECUTION WITH ERROR HANDLING
// ============================================

/**
 * Execute main with proper error handling
 * Top-level await requires ES modules (type: "module" in package.json)
 * 
 * For CommonJS, wrap in async IIFE:
 */
(async () => {
    try {
        await main();
    } catch (error) {
        console.error('Fatal error in main execution:', error);
    } finally {
        // Close database connection when done
        await sequelize.close();
        console.log('Database connection closed');
    }
})();

// For ES Modules (package.json: "type": "module"), use:
// await main();

/**
 * EXPECTED OUTPUT EXAMPLE:
 * Starting database operations...
 * Database schema synced
 * Database connection established successfully
 * 
 * --- CREATING USERS ---
 * User created: Lucas (ID: 1)
 * User created: Maria (ID: 2)
 * User created: Carlos (ID: 3)
 * 
 * --- READING ALL USERS ---
 * Found 3 users
 * ┌─────────┬──────────┬─────────────────────┐
 * │ (index) │   name   │       email         │
 * ├─────────┼──────────┼─────────────────────┤
 * │    0    │ 'Lucas'  │ 'lucas@example.com' │
 * │    1    │ 'Maria'  │ 'maria@example.com' │
 * │    2    │ 'Carlos' │ 'carlos@example.com'│
 * └─────────┴──────────┴─────────────────────┘
 * 
 * --- UPDATING USER ---
 * User 1 updated (1 row affected)
 * 
 * All async operations completed successfully!
 */