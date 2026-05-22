# 1. Situación inicial (estás en main con v1)
git checkout main
git status  # Verifica que todo esté limpio

# 2. Crear y cambiar a nueva rama
git checkout -b feature/nueva-funcionalidad

# 3. Hacer cambios, editar archivos...
echo "nueva linea" >> archivo.txt

# 4. Guardar cambios en tu rama
git add .
git commit -m "Agrego nueva funcionalidad"

# 5. Volver a main y traer actualizaciones (si trabajas solo, no hay)
git checkout main
git pull origin main  # Por si alguien más actualizó

# 6. Hacer merge de la rama feature a main
git merge feature/nueva-funcionalidad

# 7. Subir los cambios fusionados al repositorio remoto
git push origin main

# 8. (Opcional) Eliminar la rama ya fusionada
git branch -d feature/nueva-funcionalidad