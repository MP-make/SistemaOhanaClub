# Sistema Ohana Club

Sistema web Mobile-First desarrollado para apoyar la gestión operativa de Ohana Club.

Permite gestionar reservas de canchas y eventos, ventas mediante un punto de venta (POS), inventario de productos y cierre de caja.

## Tecnologías utilizadas

### Frontend
- React
- TypeScript
- Vite
- Tailwind CSS

### Backend
- Python
- FastAPI

### Base de datos
- Supabase
- PostgreSQL

## Funcionalidades principales

- Inicio de sesión
- Dashboard de información
- Calendario de reservas
- Reservas de cancha y eventos
- Punto de venta (POS)
- Gestión de inventario
- Control de stock
- Cierre y arqueo de caja

## Ejecución del Frontend

```bash
cd frontend
npm install
npm run dev
```

## Ejecución del Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

La documentación automática de la API puede visualizarse en:

```text
http://localhost:8000/docs
```

## Configuración de Supabase

Crear el archivo `.env` dentro de `frontend` tomando como referencia `.env.example`:

```env
VITE_SUPABASE_URL=TU_URL_DE_SUPABASE
VITE_SUPABASE_ANON_KEY=TU_SUPABASE_ANON_KEY
```

## Proyecto académico

Proyecto desarrollado para el curso **Curso Integrador II: Sistemas**.