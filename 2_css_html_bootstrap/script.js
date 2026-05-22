

/**
 * Toggles a modal container's state when a specific button is clicked.
 * 
 * @function proofButton
 * @description
 *   Retrieves the button with id 'btn-green' and adds a click event listener.
 *   When clicked, it toggles the 'data-state' attribute of the modal container
 *   with class '.cont-modal' between 'open' and 'closed'.
 * 
 *   If the button is not found, shows an alert and exits.
 */
function proofButton() {
    
    // Get the button element by its ID
    const btn = document.getElementById('btn-green');

    // Exit early if button doesn't exist in the DOM
    if (!btn) {
        alert("sos boludo"); 
        return;
    }

    // Get the modal container element
    const cont = document.querySelector('.cont-modal');

    // Add click event listener to the button
    btn.addEventListener('click', () => {
        /*
        // Alternative if/else version (commented out)
        if (cont.dataset.state === 'open') {
            cont.dataset.state = 'closed';
        } else {
            cont.dataset.state = 'open';
        } */

        // Toggle state using ternary operator
        // If current state is 'open' -> set to 'closed', otherwise -> set to 'open'
        cont.dataset.state = (cont.dataset.state === 'open') ? 'closed' : 'open'; 
    });
}


function initModal() {
    // ========== PASO 1: Obtener referencias a los elementos ==========
    
    // Botón que abre el modal
    const btn = document.getElementById('btn-green');
    
    // Overlay (fondo oscuro) que contiene el modal
    const modalOverlay = document.getElementById('modalOverlay');
    
    // Botones para cerrar el modal
    const closeBtn = document.getElementById('closeBtn');  // Botón "Cerrar"
    const closeX = document.getElementById('closeX');      // Botón "X"
    
    // ========== PASO 2: Validar que los elementos existan ==========
    
    if (!btn) {
        console.error("No se encontró el botón con id 'btn-green'");
        return;
    }
    
    if (!modalOverlay) {
        console.error("No se encontró el overlay del modal");
        return;
    }
    
    // ========== PASO 3: Función para ABRIR el modal ==========
    function openModal() {
        // Agregamos la clase 'active' al overlay
        // Esto hace que el modal se muestre (gracias al CSS)
        modalOverlay.classList.add('active');
        
        // Opcional: Prevenir scroll del body mientras el modal está abierto
        document.body.style.overflow = 'hidden';
        
        console.log('Modal abierto'); // Para debugging
    }
    
    // ========== PASO 4: Función para CERRAR el modal ==========
    function closeModal() {
        // Removemos la clase 'active' del overlay
        // Esto oculta el modal (gracias al CSS)
        modalOverlay.classList.remove('active');
        
        // Restauramos el scroll del body
        document.body.style.overflow = '';
        
        console.log('Modal cerrado'); // Para debugging
    }
    
    // ========== PASO 5: Configurar los event listeners ==========
    
    // Evento 1: Click en el botón -> abre el modal
    btn.addEventListener('click', openModal);
    
    // Evento 2: Click en el botón "Cerrar" -> cierra el modal
    if (closeBtn) {
        closeBtn.addEventListener('click', closeModal);
    }
    
    // Evento 3: Click en la "X" -> cierra el modal
    if (closeX) {
        closeX.addEventListener('click', closeModal);
    }
    
    // Evento 4: Click en el overlay (fondo oscuro) -> cierra el modal
    // Esto es una buena práctica de UX: clickear fuera del modal lo cierra
    modalOverlay.addEventListener('click', function(event) {
        // Verificamos que el click fue DIRECTAMENTE en el overlay (fondo)
        // y NO en el contenido del modal (.cont-modal)
        if (event.target === modalOverlay) {
            closeModal();
        }
    });
    
    // Evento 5: Tecla ESC -> cierra el modal
    document.addEventListener('keydown', function(event) {
        // Si la tecla presionada es ESC (código 27) y el modal está abierto
        if (event.key === 'Escape' && modalOverlay.classList.contains('active')) {
            closeModal();
        }
    });
}

// ========== PASO 6: Inicializar todo cuando el DOM esté listo ==========
// Esperamos a que el HTML termine de cargar antes de ejecutar el código
document.addEventListener('DOMContentLoaded', initModal);


/*
document.addEventListener("DOMContentLoaded", () => {
    proofButton();
});
*/


