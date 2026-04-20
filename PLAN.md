# Plan de Desarrollo: Sistema de Viáticos FNC

## 1. Análisis de Archivos Excel

### 1.1 Formato.xlsx (Formulario individual por funcionario)

| Hoja | Descripción | Uso |
|-----|-------------|-----|
| COMISIONES | Formulario principal de legalización | Campo a validar del usuario |
| NEW DATA | Jerarquía de centros de costo (275 dependencias) | Dropdown en UI |
| DATA | Tarifas por cargo y mes | Cálculo automático |
| FAMILIA DE CARGOS | Grupos de cargos (54 tipos) | Clasificación |
| LOGOS | Encabezados para PDFs | Generación reportes |
| RELACIÓN FACTURAS | Validación de facturas | Auditoría |

### 1.2 Centralizado.xlsx (Archivo consolidado)

**estructura final (según INSTRUCTIVO):**

| # | Campo | Descripción | Validación |
|---|-------|-------------|------------|
| 1 | CÉDULA | Número de cédula (sin puntos) | Numérico, 5-10 dígitos |
| 2 | CONCEPTO | Código parametrizado | 2000-2999 (ver DATA) |
| 3 | FECHA DE PAGO | Último día del mes | DD/MM/AAAA |
| 4 | FECHA APLICA NOVEDAD | Último día del mes | DD/MM/AAAA |
| 5 | NÚMERO | Siempre 0 | = 0 |
| 6 | VALOR CONCEPTO | Valor legalizar (sin puntos) | Numérico > 0 |
| 7 | OBSERVACIÓN | Lugar, fechas, *Nro anticipo | Texto libre |
| 8 | DESTINO | N=Nacional, E=Exterior | N o E |

## 2. Mapeo de Datos

### 2.1 Campos del Formato (COMISIONES) → Centralizado

```
FuncionarioDiligencia:
  cedula → CÉDULA
  concepto → CONCEPTO (mapear nombre a código)
  fecha_pago → FECHA DE PAGO
  fecha_novedad → FECHA APLICA NOVEDAD
  numero = 0
  valor → VALOR CONCEPTO
  lugar + fechas + anticipo → OBSERVACIÓN
  destino → DESTINO
```

### 2.2 Catálogos de Referencia

- **Conceptos (2000-2999)**: Vienen de hoja DATA, columna "TARIFAS"
- **Centros de costo**: Vienen de NEW DATA
- **Familia de cargos**: Vienen de FAMILIA DE CARGOS

## 3. Arquitectura del Sistema

### 3.1 Stack Tecnológico

| Capa | Tecnología |
|------|------------|
| Frontend | React + Vite + TypeScript |
| UI | TailwindCSS + shadcn/ui |
| Backend | Node.js + Express |
| Database | PostgreSQL |
| Excel | xlsx (SheetJS) |
| Auth | JWT |
| Container | Docker |
| Registry | DockerHub |

### 3.2 Estructura del Proyecto

```
viaticos-fnc/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── models/
│   │   └── middleware/
│   ├── Dockerfile
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   └── lib/
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml
├── .env.example
└── README.md
```

## 4. Módulos de la Aplicación

### 4.1Auth (Login)
- Login con usuário/password
- JWT con expiración 8h
- Roles: ADMIN, USUARIO

### 4.2 Carga de Formato
- Upload archivo formato.xlsx
- Validación de estructura
- Vista previa editable
- Botón "Pasar a Centralizado"

### 4.3 Centralizado (BD)
- Lista de viáticos cargados
- Filtros por fecha, usuario, estado
- Exportación a Excel/PDF
- Edición inline
- Eliminación (solo ADMIN)

### 4.4 Dashboard
- Estadísticas por mes
- Gráficos por dependencia
- Exportación masiva

## 5. API Endpoints

### Auth
```
POST   /api/auth/login
POST   /api/auth/logout
GET    /api/auth/me
```

### Viáticos
```
GET    /api/viajes           - Listar todos (con filtros)
GET    /api/viajes/:id      - Ver uno
POST   /api/viajes         - Crear
PUT    /api/viajes/:id     - Editar
DELETE /api/viajes/:id    - Eliminar (admin)
POST   /api/viajes/import  - Importar desde Excel
GET    /api/viajes/export  - Exportar a Excel
```

### Catálogos
```
GET /api/conceptos        - Lista de conceptos
GET /api/dependencias    - Lista de centros de costo
GET /api/cargos         - Lista de familia de cargos
```

## 6. Base de Datos

### Tablas Principales

```sql
-- Usuarios
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  nombre VARCHAR(100) NOT NULL,
  rol ENUM('ADMIN', 'USUARIO') DEFAULT 'USUARIO',
  activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Viáticos cargados
CREATE TABLE viajes (
  id SERIAL PRIMARY KEY,
  cedula BIGINT NOT NULL,
  concepto INTEGER NOT NULL,
  fecha_pago DATE NOT NULL,
  fecha_novedad DATE NOT NULL,
  numero INTEGER DEFAULT 0,
  valor DECIMAL(12,2) NOT NULL,
  observacion TEXT,
  destino CHAR(1) CHECK (destino IN ('N', 'E')),
  dependencia VARCHAR(100),
  usuario_id INTEGER REFERENCES users(id),
  estado ENUM('PENDIENTE', 'APROBADO', 'RECHAZADO') DEFAULT 'PENDIENTE',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Catálogos (sincronizables desde Excel)
CREATE TABLE conceptos (
  codigo INTEGER PRIMARY KEY,
  nombre VARCHAR(100),
  valor DECIMAL(12,2)
);

CREATE TABLE dependencias (
  codigo VARCHAR(20) PRIMARY KEY,
  nombre VARCHAR(100),
  nivel4 VARCHAR(100),
  nivel3 VARCHAR(100)
);
```

## 7. Despliegue

### 7.1 Docker

```Dockerfile
# Backend
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["node", "src/index.js"]

# Frontend
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### 7.2 GitHub + DockerHub

1. **GitHub**: Repositorio con CI/CD
   - Rama `main`: Producción
   - Rama `develop`: Desarrollo
   - Actions: Test → Build → Push to DockerHub

2. **DockerHub**: Registry automático
   - `fnc/viaticos-backend:latest`
   - `fnc/viaticos-frontend:latest`

### 7.3 ZimaOS
- Contenedor Docker con configuración de vars de entorno
- Puerto expuesto (ej. 8080)
- Volume para PostgreSQL (o usar servicio externo)

## 8. Plan de Implementación (Fases)

### Fase 1: Setup (Semana 1)
- [ ] Inicializar proyecto Git
- [ ] Configurar Docker Compose dev
- [ ] Setup PostgreSQL
- [ ] Estructura backend básico

### Fase 2: Backend Core (Semana 2)
- [ ] Modelos Prisma
- [ ] Auth JWT
- [ ] CRUD Viajes
- [ ] Import/Export Excel

### Fase 3: Frontend (Semana 3)
- [ ] Setup React + Vite + Tailwind
- [ ] Login
- [ ] Upload Excel
- [ ] Dashboard

### Fase 4: Integración (Semana 4)
- [ ] Conectar frontend ↔ backend
- [ ] Validaciones
- [ ] Pruebas

### Fase 5:Despliegue (Semana 5)
- [ ] Dockerfiles producción
- [ ] CI/CD GitHub
- [ ] Push a DockerHub
- [ ] Despliegue ZimaOS

## 9. siguiente paso

Antes de proceder, confirmanos:
1. ¿El mapeo de campos es correcto?
2. ¿Hay algún campo adicional del formato.xlsx que deba incluirse?
3. ¿Prefieren que بدء con la Fase 1 (Setup)?