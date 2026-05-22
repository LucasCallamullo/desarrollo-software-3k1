/**
 * Creates a delay using a Promise
 * @param {number} ms - Milliseconds to wait
 * @returns {Promise<string>} - Resolves with a message after the delay
 */
function delay(ms) {
    // Return a new Promise that resolves after the specified time
    return new Promise(resolve => {
        // setTimeout executes callback after 'ms' milliseconds
        setTimeout(() => {
            resolve("Hola desde timeout"); // "Hello from timeout" in Spanish
        }, ms);
    });
}

/**
 * Async function demonstrating await keyword
 * Execution pauses at await until the Promise resolves
 */
async function main() {
    // Wait for delay(3000) to complete (3 seconds)
    // await extracts the resolved value from the Promise
    const msj = await delay(3000);
    console.log(msj);  // Logs the message after 3 seconds
}

// Synchronous execution starts here
console.log("Hola");  // Logs immediately: "Hola" ("Hello" in Spanish)

// Call the async function and wait for it to complete
await main();  // Pauses execution here until main() finishes

// These lines run AFTER main() completes
console.log("Hola2");  // Logs third
console.log("Hola3");  // Logs fourth

// Expected Output:
// "Hola" (immediate)
// (waits 3 seconds)
// "Hola desde timeout"  ("Hello from timeout" in Spanish)
// "Hola2"
// "Hola3"