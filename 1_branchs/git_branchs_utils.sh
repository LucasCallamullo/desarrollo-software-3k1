# 2. Simula trabajo en equipo
git checkout -b rama-1
echo "cambio rama 1" >> v1.txt    # esto significa que se modifca un archivo
git add .
git commit -m "cambio en rama 1"

git checkout main
git checkout -b rama-2  
echo "cambio rama 2" >> v1.txt    # esto significa que se modifca un archivo
git add .
git commit -m "cambio en rama 2"

# 3. Ahora practica resolver conflictos
git checkout main
git merge rama-1  # Primer merge sin conflicto
git merge rama-2  # Esto SÍ dará conflicto - practica resolverlo