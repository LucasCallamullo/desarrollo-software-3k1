/**
 * Fetches country data from the REST Countries API
 * 
 * @async
 * @function fetchCountries
 * @returns {Promise<Array>} Array of country objects containing name, flags, and population
 * 
 * @description
 * Makes a GET request to fetch all countries with only the necessary fields.
 * Uses console.time to measure execution time for performance monitoring.
 * 
 * @example
 * const countries = await fetchCountries();
 * console.log(countries[0]); // { name: {...}, flags: {...}, population: 12345678 }
 */
async function fetchCountries() {
    // Start performance timer with a label
    console.time('fetch-paises');
    
    try {
        // API endpoint - requesting only name, flags, and population fields
        const url = 'https://restcountries.com/v3.1/all?fields=name,flags,population';
        
        // Perform asynchronous GET request to fetch data
        const response = await fetch(url);
        
        // Log timing after response is received, before JSON parsing
        console.timeLog('fetch-paises', 'Respuesta recibida, convirtiendo a JSON...');
        
        // Check if response is OK (status 200-299)
        // if (!response.ok) return [];         // Alternative error handling (commented)
        
        // Parse JSON response body
        const data = await response.json();

        /* Sample data structure returned by the API:
        data = [
            {
                "name": {
                    "common": "Ivory Coast",
                    "official": "Republic of Côte d'Ivoire",
                    "nativeName": { ... }
                },
                "capital": ["Yamoussoukro"],
                "population": 31719275
            }, 
            ...
        ]
        */
        
        // Stop timer and log total execution time
        console.timeEnd('fetch-paises');
        
        // Log success message with total count of loaded countries
        console.log(`✅ Países cargados: ${data.length}`); // Approximately 250 countries
        // console.log(data.slice(0, 3)); // Display first 3 countries for inspection

        return data;
        
    } catch (error) {
        // Handle any network or parsing errors
        console.timeEnd('fetch-paises');
        console.error('❌ Error:', error);
    }
}

/**
 * Filters countries based on minimum population threshold
 * 
 * @function filterCountries
 * @param {Array} countries - Array of country objects
 * @param {number} population - Minimum population value (filter returns countries with population GREATER than this)
 * @returns {Array} Filtered array of countries meeting the population criteria
 * 
 * @description
 * Uses Array.filter() method to return only countries whose population exceeds the given threshold.
 * 
 * @example
 * const largeCountries = filterCountries(allCountries, 100000000);
 * // Returns countries with population > 100,000,000
 */
function filterCountries(countries, population) {
    return countries.filter(c => {
        return c.population > population;
    });
}

/**
 * DOM event listener that initializes the country search form
 * Runs when the DOM content is fully loaded
 */
document.addEventListener("DOMContentLoaded", () => {

    // Get references to DOM elements
    const form = document.getElementById('form-paises');
    const container = document.querySelector('.cont-paises');

    /**
     * Form submit event handler
     * Asynchronously fetches and filters countries based on user input
     */
    form.addEventListener('submit', async (e) => {
        // e.stopPropagation(); // Prevents event bubbling (commented out)
        e.preventDefault();     // Cancel default form submission (prevents page reload)

        // Extract form data using FormData API
        const formData = new FormData(form);
        
        // Convert FormData entries to a plain object { name: "value", population: "value" }
        const datos = Object.fromEntries(formData.entries());

        // Log extracted form data for debugging
        console.log(datos);
        
        // Parse population input string to integer
        const population = parseInt(datos.population);
        console.log(population);

        // Fetch all countries (async operation)
        const countries = await fetchCountries();
        
        // Apply population filter to get matching countries
        const countriesFiltered = filterCountries(countries, population);

        /**
         * Generate HTML for filtered countries
         * Maps each country to a div containing:
         * - Country flag image
         * - Index number and country name
         */
        const html = countriesFiltered.map((c, index) => {
            return /*html*/`
                <div class="d-flex gap-3">
                    <img class="flag-img" src="${c.flags.png}" alt="Flag of ${c.name.common}">
                    <p class="bolder">Id: ${index} | Pais: ${c.name.common}</p>
                </div>
            `;
        }).join('');  // Join array elements into a single HTML string
        
        /* Explanation of the transformation pipeline:
        lista = [
            '<div>Id: 0 | Pais: Argentina</div>',
            '<div>Id: 1 | Pais: Brazil</div>',
            '<div>Id: 2 | Pais: Chile</div>'
        ]
        .join('') converts array to a single string:
        '<div>Id: 0 | Pais: Argentina</div><div>Id: 1 | Pais: Brazil</div>...'
        */

        // Inject generated HTML into the container element
        container.innerHTML = `${html}`;
    });
});


/* Additional examples and explanations (commented out for reference):

// Example 1: Filtering with a fixed population threshold
const popu = 40000000;
const dataFiltered = data.filter(c => c.population > popu);    // Returns filtered list

// Example 2: Iterating through filtered data with forEach
dataFiltered.forEach((c, index) => {
    console.log(`Id: ${index} | Pais: ${c.name.common}`);
});

// Example 3: Mapping to string array (without HTML tags)
const dataString = dataFiltered.map((c, index) => {
    return `Id: ${index} | Pais: ${c.name.common}`;
});        // Returns array of strings

// Example 4: Transforming to simplified objects
const dataSmall = dataFiltered.map(c => {
    return {
        name: c.name.common,
        population: c.population
    };
});

// Example 5: Logging as JSON string
console.log(JSON.stringify(dataSmall));

*/