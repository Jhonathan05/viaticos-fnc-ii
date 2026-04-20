# Viáticos FNC - Instrucciones para el Desarrollador

## Comandos Básicos

### Docker Compose
```bash
# Construir todos los contenedores
docker-compose -f docker-compose.local.yml build

# Iniciar todos los contenedores
docker-compose -f docker-compose.local.yml up -d

# Detener todos los contenedores
docker-compose -f docker-compose.local.yml down

# Ver logs
docker logs viaticos-backend --tail 50
```

### GitHub
```bash
# stages cambios
git add .

# crear commit ( especificar mensaje )
git commit -m "tu mensaje aquí"

# hacer push ( solo cuando se indique )
git push origin master
```

### DockerHub
```bash
# hacer login ( solo cuando se indique )
docker login -u puntijhon

# construir imagen
docker build -t puntijhon/viaticos-fnc-backend:latest -f backend/Dockerfile backend
docker build -t puntijhon/viaticos-fnc-frontend:latest -f frontend/Dockerfile frontend

# push a DockerHub ( solo cuando se indique )
docker push puntijhon/viaticos-fnc-backend:latest
docker push puntijhon/viaticos-fnc-frontend:latest
```

## URLs
- **Frontend**: http://localhost:8080
- **Backend API**: http://localhost:3000
- **GitHub**: https://github.com/Jhonathan05/viaticos-fnc-ii
- **DockerHub**: https://hub.docker.com/u/puntijhon

## Credenciales (Desarrollo)
- **Admin**: admin / admin123
- **Usuario**: usuario / usuario123

## Notas
- NO hacer push automático a GitHub o DockerHub sin previa autorización
- Antes de hacer cambios importantes, confirmar con el usuario

## Estado de Sesión (Última actualización: 2026-04-19)
- ✅ Tema FNC implementado
- ✅ UI/UX moderna implementada
- ✅ Push a GitHub completado
- ✅ Push a DockerHub completado
- Contenedores corriendo en localhost:8080 (frontend), localhost:3000 (backend)