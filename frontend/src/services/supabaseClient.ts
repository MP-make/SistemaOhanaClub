// =========================================================================
// CLIENTE SUPABASE DIRECTO (REST API / POSTGREST)
// Comunicación directa contra tu proyecto de Supabase (PostgreSQL)
// =========================================================================

const SUPABASE_URL = (import.meta as any).env?.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = (): boolean => {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY && SUPABASE_URL.startsWith('http'));
};

const getHeaders = () => ({
  'apikey': SUPABASE_ANON_KEY,
  'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
  'Content-Type': 'application/json',
  'Prefer': 'return=representation'
});

export const supabaseApi = {
  // 1. USUARIOS / AUTH ESTRICTO CON BASE DE DATOS
  async login(usernameOrEmail: string, passwordPlain: string) {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase no está configurado en el archivo .env');
    }

    const cleanUser = usernameOrEmail.trim().toLowerCase();
    const url = `${SUPABASE_URL}/rest/v1/usuarios?or=(username.ilike.${encodeURIComponent(cleanUser)},email.ilike.${encodeURIComponent(cleanUser)})&select=*`;
    
    let res: Response;
    try {
      res = await fetch(url, { headers: getHeaders() });
    } catch (networkErr: any) {
      throw new Error(`Error de red: No se pudo conectar a Supabase (${networkErr.message}).`);
    }

    if (!res.ok) {
      const errBody = await res.text();
      if (res.status === 401 || res.status === 403) {
        throw new Error(`Acceso bloqueado en Supabase (RLS). Debes habilitar las políticas de lectura pública en la tabla 'usuarios'.`);
      }
      throw new Error(`Error de Supabase (${res.status}): ${errBody}`);
    }

    const users = await res.json();
    if (!Array.isArray(users) || users.length === 0) {
      throw new Error(`El usuario o correo "${usernameOrEmail}" no existe en la base de datos de Supabase.`);
    }

    const user = users[0];
    if (user.password_hash !== passwordPlain) {
      throw new Error('Contraseña incorrecta. Por favor verifica tus credenciales.');
    }

    return user;
  },

  // 2. PRODUCTOS E INVENTARIO
  async getProductos(categoria?: string, search?: string) {
    if (!isSupabaseConfigured()) return null;
    let url = `${SUPABASE_URL}/rest/v1/productos?select=*&activo=eq.true&order=nombre.asc`;
    if (categoria && categoria !== 'todos') {
      url += `&categoria_id=eq.${encodeURIComponent(categoria)}`;
    }
    if (search) {
      url += `&nombre=ilike.*${encodeURIComponent(search)}*`;
    }
    const res = await fetch(url, { headers: getHeaders() });
    if (!res.ok) {
      console.error('Error getProductos Supabase:', await res.text());
      return null;
    }
    return await res.json();
  },

  async updateStock(productoId: string, delta: number) {
    if (!isSupabaseConfigured()) return null;
    const getUrl = `${SUPABASE_URL}/rest/v1/productos?id=eq.${productoId}&select=*`;
    const resGet = await fetch(getUrl, { headers: getHeaders() });
    if (!resGet.ok) return null;
    const prods = await resGet.json();
    if (!prods.length) return null;

    const nuevoStock = Math.max(0, (prods[0].stock_actual || 0) + delta);
    const patchUrl = `${SUPABASE_URL}/rest/v1/productos?id=eq.${productoId}`;
    const resPatch = await fetch(patchUrl, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ stock_actual: nuevoStock })
    });
    if (!resPatch.ok) {
      console.error('Error updateStock Supabase:', await resPatch.text());
      return null;
    }
    const updated = await resPatch.json();
    return (updated && updated[0]) ? updated[0] : { ...prods[0], stock_actual: nuevoStock };
  },

  async createProducto(prod: {
    nombre: string;
    categoria_id: string;
    presentacion?: string;
    precio_unitario: number;
    stock_actual: number;
    stock_minimo?: number;
    imagen_url?: string;
  }) {
    if (!isSupabaseConfigured()) return null;
    const url = `${SUPABASE_URL}/rest/v1/productos`;
    const res = await fetch(url, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        nombre: prod.nombre,
        categoria_id: prod.categoria_id,
        presentacion: prod.presentacion || '',
        precio_unitario: prod.precio_unitario,
        stock_actual: prod.stock_actual,
        stock_minimo: prod.stock_minimo || 10,
        imagen_url: prod.imagen_url || '',
        activo: true
      })
    });
    if (!res.ok) {
      const errText = await res.text();
      console.error('Error createProducto Supabase:', errText);
      throw new Error(`Error al crear producto: ${errText}`);
    }
    const data = await res.json();
    return data[0];
  },

  async updateProducto(productoId: string, prod: {
    nombre?: string;
    categoria_id?: string;
    presentacion?: string;
    precio_unitario?: number;
    stock_actual?: number;
    stock_minimo?: number;
    imagen_url?: string;
  }) {
    if (!isSupabaseConfigured()) return null;
    const url = `${SUPABASE_URL}/rest/v1/productos?id=eq.${productoId}`;
    const res = await fetch(url, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(prod)
    });
    if (!res.ok) {
      const errText = await res.text();
      console.error('Error updateProducto Supabase:', errText);
      throw new Error(`Error al actualizar producto: ${errText}`);
    }
    const data = await res.json();
    return data[0];
  },

  async deleteProducto(productoId: string) {
    if (!isSupabaseConfigured()) return null;
    // Marcamos como inactivo para preservar integridad con ventas
    const url = `${SUPABASE_URL}/rest/v1/productos?id=eq.${productoId}`;
    const res = await fetch(url, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ activo: false })
    });
    if (!res.ok) {
      const errText = await res.text();
      console.error('Error deleteProducto Supabase:', errText);
      throw new Error(`Error al eliminar producto: ${errText}`);
    }
    return true;
  },

  // 3. RESERVAS
  async getReservas(fecha?: string) {
    if (!isSupabaseConfigured()) return null;
    let url = `${SUPABASE_URL}/rest/v1/reservas?select=*&order=hora_inicio.asc`;
    if (fecha) {
      url += `&fecha=eq.${fecha}`;
    }
    const res = await fetch(url, { headers: getHeaders() });
    if (!res.ok) {
      console.error('Error getReservas Supabase:', await res.text());
      return null;
    }
    return await res.json();
  },

  async createReserva(reserva: any) {
    if (!isSupabaseConfigured()) return null;
    const url = `${SUPABASE_URL}/rest/v1/reservas`;
    const res = await fetch(url, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        zona_id: reserva.zona,
        cliente_nombre: reserva.clienteNombre,
        cliente_telefono: reserva.clienteTelefono,
        cliente_empresa: reserva.clienteEmpresa,
        tipo_evento: reserva.tipoEvento,
        fecha: reserva.fecha,
        hora_inicio: reserva.horaInicio,
        hora_fin: reserva.horaFin,
        tipo_tarifa: reserva.tipoTarifa,
        monto_total: reserva.montoTotal,
        adelanto: reserva.adelanto,
        saldo_pendiente: reserva.saldoPendiente,
        estado: reserva.estado || 'CONFIRMADA',
        metodo_pago_adelanto: reserva.metodoPago || 'EFECTIVO',
        es_recurrente: reserva.esRecurrente || false
      })
    });
    if (!res.ok) {
      const errText = await res.text();
      console.error('Error createReserva Supabase:', errText);
      throw new Error(`Error al guardar en Supabase: ${errText}`);
    }
    const data = await res.json();
    return data[0];
  },

  // 4. VENTAS MINIMARKET
  async createVenta(total: number, metodoPago: string, items: Array<{ producto_id: string; cantidad: number; precio_unitario: number; subtotal: number }>) {
    if (!isSupabaseConfigured()) return null;
    
    const numeroComprobante = `REC-${Date.now().toString().slice(-6)}`;
    const ventaUrl = `${SUPABASE_URL}/rest/v1/ventas_minimarket`;
    const resVenta = await fetch(ventaUrl, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        numero_comprobante: numeroComprobante,
        total,
        metodo_pago: metodoPago
      })
    });
    if (!resVenta.ok) {
      const errText = await resVenta.text();
      console.error('Error createVenta Supabase:', errText);
      throw new Error(`Error al registrar venta en Supabase: ${errText}`);
    }
    const ventaCreada = (await resVenta.json())[0];

    if (ventaCreada?.id && items.length > 0) {
      const detalleUrl = `${SUPABASE_URL}/rest/v1/detalle_ventas`;
      const detalles = items.map(it => ({
        venta_id: ventaCreada.id,
        producto_id: it.producto_id,
        cantidad: it.cantidad,
        precio_unitario: it.precio_unitario,
        subtotal: it.subtotal
      }));
      await fetch(detalleUrl, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(detalles)
      });
    }

    return ventaCreada;
  }
};
