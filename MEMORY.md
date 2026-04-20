# Proyecto: viaticos-fnc

## Contexto del Proyecto
Sistema de gestión de viáticos para la Fuerza Náutica de Crucero (FNC).
Basado en formato Excel de la Federación Nacional de Cafeteros.

## Estructura Actual
- `control-viaticos/` - Proyecto de control de viáticos existente
- `control-visitantes/` - Proyecto de control de visitantes
- `viaticos-fnc/` - **NUEVO** Proyecto viáticos FNC (en desarrollo)

## Stack Tecnológico
- Frontend: React + Vite + TailwindCSS
- Backend: Node.js + Express + Prisma
- DB: PostgreSQL
- Docker: Contenedores locales

## Módulos Implementados
1. **Login** - Autenticación JWT
2. **Dashboard** - Panel de control con estadísticas
3. **Carga de Formato** - Upload arquivo formato.xlsx (ambos formatos)
4. **Centralizado** - Lista de viáticos cargados con filtros

## Parser de Excel (Implementado)
El sistema ahora detecta automáticamente dos formatos:

### Formato 1: Tabular/Centralizado
- Headers: CÉDULA, CONCEPTO, FECHA PAGO, etc.
- Procesa filas desde posición 4

### Formato 2: Formulario (pruebaBase.xlsx)
- Extrae datos de celdas específicas:
  - C14: Nombre trabajador
  - N14: Cédula
  - C19: Mes
  - F19: Motivo
  - D46: Lugar
  - M46: Tarifa diaria
  - L50: Total sin facturas
  - L59: Saldo a favor

## Pruebas Realizadas
- ✅ Login API correcto
- ✅ Upload archivo tabular (prueba.xlsx) - 1 registro
- ✅ Upload archivo formulario (pruebaBase.xlsx) - 1 registro
- ✅ Datos guardados en PostgreSQL
- ✅ Fechas se parsean correctamente
- ✅ Export Excel con formato centralizado.xlsx (logos, headers, fechas serial)

## Estado Actual
| Servicio | Puerto | Estado |
|----------|--------|--------|
| Frontend | 8080 | ✅ Activo |
| Backend | 3000 | ✅ Activo |
| PostgreSQL | 5432 | ✅ Activo |

Registros en DB:
- Cédula: 1110462834 (MAYRA ALEJANDRA GONZALEZ APONTE)
- Concepto: 2018
- Valor: 18,000
- Observación: MARZO - IBAG-ROVIR-IBAG (1 día(s)) - Tarifa diaria

## Usuarios de Prueba
| Usuario | Contraseña | Rol |
|---------|-----------|-----|
| admin | admin123 | ADMIN |
| usuario | user123 | USUARIO |

## Pendiente
- [ ] Verificar con más archivos de prueba
- [ ] Configurar CI/CD GitHub Actions
- [ ] Push imágenes a DockerHub
- [ ] Despliegue en ZimaOS

## Historial de Sesiones
| Fecha | Sesión | Resumen |
|-------|-------|--------|
| 2026-04-19 | Inicio | Creación del proyecto viaticos-fnc |
| 2026-04-19 | Análisis Excel | Mapeo de formato.xlsx y centralizado.xlsx |
| 2026-04-19 | Desarrollo | Backend completo con Express + Prisma |
| 2026-04-19 | Frontend | React + Tailwind con páginas |
| 2026-04-19 | Docker | Contenedores locales puerto 8080 |
| 2026-04-19 | Archivo prueba | Análisis de pruebaBase.xlsx → prueba.xlsx |
| 2026-04-19 | Test upload | Upload exitoso, datos en BD |
| 2026-04-19 | Parser dual | Implementado parser para formato formulario |