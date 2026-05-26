const cors = require('cors');
const express = require('express');

const sequelize = require('./db');

const app = express();
// http://localhost:3000
const PORT = 3000;


// 2. Configurar CORS (El '*' es el default si no pasas opciones)
// Esto permite que CUALQUIER origen acceda a tu API
app.use(cors());

// Middleware para que Express entienda JSON (muy importante para POST/PUT)
app.use(express.json());

// logger
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();  // Importante: si no llamás next(), la petición se queda pegada
});


function middleware1(req, res, next) {
    console.log('1. Middleware 1 - antes');
    next();  // ← PASO AL SIGUIENTE
    console.log('5. Middleware 1 - después (esto se ejecuta al final)');
}
function middleware2(req, res, next) {
    console.log('2. Middleware 2 - antes');
    next();
    console.log('4. Middleware 2 - después');
}
function controlador(req, res) {
    console.log('3. Controlador final');
    res.send('OK');
}

app.get('/ruta', middleware1, middleware2, controlador);




/**
 * Clase para errores personalizados con código HTTP específico
 * Permite lanzar errores desde cualquier capa (middleware, service, controller)
 */
class AppError extends Error {
    constructor(message, statusCode, details = null) {
        super(message);
        this.statusCode = statusCode;
        this.details = details;
        this.isOperational = true; // para distinguir errores operacionales de bugs
        Error.captureStackTrace(this, this.constructor);
    }
}

const validacion1 = (req, res, next) => {
    const dominiosPermitidos = ["@gmail.com", "@hotmail.com", "@outlook.com"];
    
    const email = req.body.email;
    
    // 1. Verificar que el email existe
    if (!email) {
        throw new AppError('El email es requerido', 400);
    }
    
    // 2. Verificar que el email contiene un '@'
    if (!email.includes('@')) {
        throw new AppError('Email inválido: debe contener @', 400);
    }
    
    // 3. Extraer el dominio (lo que está después del @)
    const dominio = '@' + email.split('@')[1];
    
    // 4. Verificar si el dominio está en la lista de permitidos
    if (!dominiosPermitidos.includes(dominio)) {
        throw new AppError(
            `Dominio no permitido. Usá uno de estos: ${dominiosPermitidos.join(', ')}`,
            400
        );
    }
    
    // 5. Si todo está bien, pasar al siguiente
    next();
};



function controladorUsuario(req, res, next) {
    try {
        console.log('Usuario Creado');
        res.send('OK');
    } catch (error) {
        next(error); // Pasa al manejador global de errores
    }
}


app.post('/api/v1/clientes/', validacion1, controladorUsuario);



const errorHandler = (err, req, res, next) => {
    // Log del error en consola (con detalles para debugging)
    console.error(`[ERROR] ${new Date().toISOString()}`);
    console.error(`  Método: ${req.method}`);
    console.error(`  URL: ${req.originalUrl}`);
    console.error(`  Mensaje: ${err.message}`);
    if (err.stack) {
        console.error(`  Stack: ${err.stack}`);
    }
    
    // ============================================================
    // 1. Errores personalizados (AppError)
    // ============================================================
    if (err instanceof AppError) {
        const response = {
            success: false,
            status: err.statusCode,
            detail: err.message
        };
        
        if (err.details) {
            response.details = err.details;
        }
        
        return res.status(err.statusCode).json(response);
    }

    res.status(statusCode).json(response);
}


app.use(errorHandler);







async function startServer() {
    try {
        // Conectamos y sincronizamos DB
        await sequelize.authenticate();
        /**
         * --- ESTRATEGIAS DE SINCRONIZACIÓN DE BASE DE DATOS ---
         */

        // Opción 1: Solo crea si no existe (Producción)
        await sequelize.sync(); 

        // Opción 2: Recreación total (Desarrollo inicial / Reset)
        // ¡CUIDADO! Ejecuta "DROP TABLE", borrando todos los registros antes de crear.
        // await sequelize.sync({ force: true }); 

        // Opción 3: Alteración inteligente (Desarrollo activo)
        // Compara el modelo con la DB y añade columnas nuevas sin borrar los datos existentes.
        // await sequelize.sync({ alter: true }); 

        console.log('✅ DB Conectada y Sincronizada');

        // Iniciamos el servidor
        app.listen(PORT, () => {
            console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('❌ Error al iniciar:', error);
    }
}

startServer();







