from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import auth, reservas, pos, caja

app = FastAPI(
    title="Ohana Club API",
    description="API Operativa de Punto de Venta y Control Diario para Ohana Club",
    version="1.0.0"
)

# Habilitar CORS para permitir conexión fluida con el frontend Next.js / React
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Registrar Routers
app.include_router(auth.router, prefix="/api")
app.include_router(reservas.router, prefix="/api")
app.include_router(pos.router, prefix="/api")
app.include_router(caja.router, prefix="/api")

@app.get("/")
def root():
    return {
        "sistema": "Ohana Club POS & Control Diario",
        "version": "1.0.0",
        "status": "online",
        "docs": "/docs"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
