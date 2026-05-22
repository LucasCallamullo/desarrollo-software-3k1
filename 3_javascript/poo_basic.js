


/**
 * Representa a un usuario del sistema.
 */
class Usuario {
    /**
     * @param {number} id - El identificador único del usuario.
     * @param {string} name - El nombre del usuario.
     */
    constructor(id, name) {
        this.id = id;
        this.name = name;
    }

    /**
     * Filtra una lista de posts para devolver solo los que pertenecen a este usuario.
     * @param {Post[]} posts - Array de objetos tipo Post.
     * @returns {Post[]} - Lista de posts filtrados.
     */
    getAllPosts(posts) {
        // Usamos === para comparar y retornamos el resultado del filtro
        return posts.filter(p => p.autor === this);
    }
}

/**
 * Representa una publicación realizada por un usuario.
 */
class Post {
    /**
     * @param {number} id - El identificador único del post.
     * @param {Usuario} autor - La instancia del Usuario que creó el post.
     * @param {string} text - El contenido del mensaje.
     */
    constructor(id, autor, text) {
        this.id = id;
        this.autor = autor;
        this.text = text;
    }
}



/**
 * Ejemplo de recuperación de datos con Eager Loading
 * @returns {Promise<void>}
 */
async function main() {
    try {
        // Buscamos todos los usuarios e incluimos sus posts asociados
        // Esto genera un LEFT OUTER JOIN en SQL
        const users = await Usuario.findAll();
        // users = [Usuario1 (1, "lu"), Usuario2 (2, "m")]

        // Ahora cada objeto 'user' tiene una propiedad 'publicaciones' que es un array
        users.forEach(user => {
            console.log(`Usuario: ${user.name}`);
            console.log(`Cantidad de posts: ${user.publicaciones.length}`);
            
            user.publicaciones.forEach(post => {
                console.log(` - Post: ${post.text}`);
            });
        });

    } catch (error) {
        console.error('Error al recuperar usuarios:', error);
    }
}