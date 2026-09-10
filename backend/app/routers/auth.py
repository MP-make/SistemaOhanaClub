from fastapi import APIRouter, HTTPException, status
from app.schemas.models import UsuarioLogin, UsuarioResponse
from app.db.memory_db import db

router = APIRouter(prefix="/auth", tags=["Autenticación"])

@router.post("/login", response_model=UsuarioResponse)
def login(credentials: UsuarioLogin):
    # En Ohana Club el usuario del staff es "Usuario.staff" (o admin)
    user = next((u for u in db.usuarios if u["username"].lower() == credentials.username.lower()), None)
    if not user:
        # Permitir acceso demostrativo si se ingresa Usuario.staff
        if "staff" in credentials.username.lower():
            user = db.usuarios[0]
        else:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Credenciales no válidas. Acceso exclusivo para personal autorizado."
            )
    return UsuarioResponse(**user)
