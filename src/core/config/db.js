const { Sequelize } = require('sequelize');

/**
 * Configuración de la instancia de Sequelize.
 * * El ORM (Object-Relational Mapping) actúa como puente entre tus 
 * objetos de JavaScript y las tablas de la base de datos SQL.
 */
const sequelize = new Sequelize({
  // dialect: Define con qué motor de base de datos vamos a hablar.
  // Sequelize "traduce" tus comandos de JS al SQL específico de SQLite.
  dialect: 'sqlite',

  // storage: La ruta física del archivo donde se guardarán los datos.
  // Si el archivo no existe, Sequelize lo crea automáticamente al sincronizar.
  storage: './testeo.sqlite',

  // logging: Por defecto muestra todas las consultas SQL en la consola.
  // Podés ponerlo en false para que la terminal esté más limpia.
  logging: console.log 
});


module.exports = sequelize;