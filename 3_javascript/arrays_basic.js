// JS object concept: similar to Map in Java/C# or Dict in Python
// Key --> Value pairs

// Array example with indices
// indices        0        1        2
const listas = ["Hola", "Mundo", "Gol"];


/* 
// Object literal example (commented out)
const animal = {
    "name": "Coco",
    "type": "Perro",
    "age": 25
} 

// Regular function declaration with template literal
function main(name) {
    console.log(`Hola ${name}`);   
}

// Arrow function with two parameters
const main2 = (num1, num2) => {
    console.log(`Sumando: ${num1} + ${num2} | Resultado: ${num1 + num2}`);
}

// Function calls
main("Lucas");
main2(4, 5);
*/


/* 
// Traditional for loop (commented out)
// Python equivalent: for i in range(start=0, stop, step=1)
for (let index = 0; index < animales.length; index++) {
    // index increments each iteration
    const animal = animales[index];
    console.log(animal.name);    // "Coco"  -> "Dante"
} 
*/


// Array of animal objects
const animales = [
    {
        "name": "Coco",
        "type": "Perro",  // Dog in Spanish
        "age": 25
    },
    {
        "name": "Dante",
        "type": "Perro",  // Dog in Spanish
        "age": 5
    },
]


// Functional programming paradigm using forEach method
// Iterates through each animal in the array and executes callback function
animales.forEach((animal) => { 
    // Log the entire animal object
    console.log(animal)
    
    // Ternary operator: checks if name equals "Coco"
    // If true: prints "Hola {animal.name}" (Hello in Spanish)
    // If false: prints "No es coco" (Not Coco in Spanish)
    console.log(`${(animal.name === "Coco") ? `Hola ${animal.name}` : "No es coco"}`);
})