# Taller Aragua - Sistema de Gestión de Inventario Yamaha 🏍️

Sistema web profesional para la gestión y control de inventario de repuestos de motos, diseñado a medida y de uso exclusivo para el administrador de **"Taller Aragua"**, taller y concesionario autorizado Yamaha.

Desarrollado con **Next.js 14 (App Router)**, **Tailwind CSS**, **JavaScript** y **Supabase**.

---

## 🚀 Características Principales

### 1. 🎨 Diseño Corporativo & Modo Oscuro (Dark Mode)
- Paleta de colores oficial inspirada en **Yamaha Racing**: **Azul corporativo**, **Rojo deportivo (alerta/acento)** y **Blanco/Gris pizarra**.
- Alternador de tema Claro / Oscuro (**Dark Mode toggle**) persistente en `localStorage` con adaptación automática a las preferencias del sistema operativo.
- Tipografía limpia, bordes redondeados modernos, badges de estado e iconografía con `lucide-react`.

### 2. 🔐 Autenticación y Protección de Rutas (Supabase Auth)
- Pantalla de inicio de sesión con correo y contraseña.
- Registro opcional para el administrador del taller.
- **Protección estricta de rutas**: si no existe una sesión activa y autenticada con Supabase, el acceso al sistema y al catálogo está bloqueado y redirige al formulario de inicio de sesión.
- Botón de cierre de sesión seguro en el encabezado (`Navbar`).

### 3. 📊 Panel de Control (Dashboard en Tiempo Real)
- **Repuestos Registrados**: Total de códigos OEM/SKU en inventario.
- **Total en Almacén**: Sumatoria de unidades físicas disponibles.
- **Valor Total del Inventario**: Cálculo monetario en tiempo real (`stock * precio unitario`) en USD ($).
- **Alerta Visual Roja de Stock Crítico**: Notificación visual destacada con tarjeta roja palpitante cuando existen repuestos con existencias iguales o inferiores a su stock mínimo de seguridad (`stock <= min_stock`).

### 4. ⚠️ Banner Interactivo de Alerta Crítica
- Despliega de inmediato los repuestos que requieren pedido urgente al distribuidor oficial Yamaha.
- Botón de ajuste rápido de reposición.

### 5. 📦 Gestión de Catálogo (CRUD Asíncrono Completo)
- **Registrar Repuesto**: Formulario modal con validación para Nombre, Código OEM / SKU, Categoría, Precio ($ USD), Stock Actual, Stock Mínimo Crítico (umbral de alerta), Disponibilidad para despacho y Descripción/Compatibilidad de modelos.
- **Editar Repuesto**: Carga los datos existentes y actualiza en tiempo real.
- **Eliminar Repuesto**: Diálogo modal de confirmación con detalles de seguridad para evitar eliminaciones accidentales.
- **Ajuste de Stock en 1 Clic**: Botones `+` y `-` directamente en cada fila de la tabla para sincronizar rápidamente el conteo físico del almacén.

### 6. 🔍 Tabla Dinámica y Responsiva
- **Buscador en tiempo real**: Filtra instantáneamente por nombre del repuesto, código OEM o descripción.
- **Filtro por Categorías**: Motor, Frenos, Transmisión, Suspensión, Eléctrico, Filtros, Lubricantes, Chasis y Ruedas, Iluminación, Accesorios.
- **Filtro de Stock Crítico**: Botón para aislar en un solo clic las piezas con necesidad de reposición.
- **Ordenamiento Multicriterio**: Nombre (A-Z, Z-A), Stock (Menor/Mayor), Precio (Mayor/Menor).
- **Exportación a CSV / Excel**: Descarga el inventario completo filtrado en formato CSV con fecha para auditorías y reportes físicos.
- Manejo de estados de carga (**skeletons / loading**) y vistas de catálogo vacío con botón para restablecer filtros.

---

## 🗄️ Base de Datos Supabase (`public.products`)

El proyecto ya está conectado mediante `.env.local` a tu proyecto en Supabase:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Inicialización en Supabase (1 Clic)
Para crear la tabla `products` con las políticas de seguridad (RLS) y los 12 repuestos iniciales de Yamaha, ejecuta el script [`supabase_schema.sql`](./supabase_schema.sql):

1. Ingresa a tu panel de **Supabase** (`https://supabase.com/dashboard`).
2. Abre la sección **SQL Editor**.
3. Copia y pega el contenido del archivo `supabase_schema.sql` (o haz clic en el botón **"Script SQL"** dentro de la barra superior de la aplicación para copiarlo).
4. Presiona **Run**.

*Nota: La aplicación cuenta con un modo de respaldo inteligente en memoria que permite probar toda la interfaz y funcionalidades incluso antes de ejecutar el script en Supabase.*

---

## 💻 Ejecución del Proyecto

### Modo Desarrollo:
```bash
npm run dev
```
Abre en tu navegador [http://localhost:3000](http://localhost:3000).

### Modo Producción:
```bash
npm run build
npm run start
```

---

## 📁 Estructura del Código

```
c:\inventario\
├── .env.local                    # Variables de conexión a Supabase
├── jsconfig.json                 # Alias de rutas (@/*)
├── next.config.js                # Configuración de Next.js
├── tailwind.config.js            # Configuración de Tailwind y colores Yamaha
├── postcss.config.js             # PostCSS
├── package.json                  # Dependencias del proyecto
├── supabase_schema.sql           # Script SQL para la tabla products y RLS
└── src/
    ├── app/
    │   ├── globals.css           # Estilos globales y animaciones de alerta
    │   ├── layout.js             # Root Layout con ThemeProvider y AuthProvider
    │   ├── page.js               # Vista Principal (Dashboard + CRUD Inventario)
    │   └── login/
    │       └── page.js           # Ruta directa de Login
    ├── components/
    │   ├── AuthScreen.js         # Pantalla de Login / Registro Yamaha
    │   ├── Navbar.js             # Barra superior con Dark Mode, SQL helper y Logout
    │   ├── DashboardStats.js     # 4 KPIs con Alerta Roja de Stock Crítico
    │   ├── CriticalStockAlert.js # Banner desplegable de piezas en nivel crítico
    │   ├── ProductTable.js       # Tabla responsiva, buscador, filtros y CSV
    │   ├── ProductModal.js       # Modal para registrar y editar repuestos
    │   ├── DeleteConfirmModal.js # Modal de confirmación para eliminar
    │   └── SqlSetupModal.js      # Modal interactivo con guía y copia del SQL
    ├── context/
    │   ├── AuthContext.js        # Manejo de sesión y llamadas a Supabase Auth
    │   └── ThemeContext.js       # Manejo del modo claro / oscuro con Tailwind
    └── lib/
        ├── supabaseClient.js     # Cliente Supabase inicializado
        └── initialData.js        # Catálogo de repuestos originales Yamaha
```
