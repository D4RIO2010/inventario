-- ================================================================
-- TALLER ARAGUA - LOCAL AUTORIZADO YAMAHA
-- Script de inicialización de Base de Datos para Supabase
-- Tabla: products (Gestión de Inventario de Repuestos)
-- ================================================================

-- ================================================================
-- PASO RÁPIDO: SI TU TABLA 'products' YA EXISTE EN SUPABASE,
-- SOLO EJECUTA ESTAS LÍNEAS PARA AGREGAR PRECIO COSTO Y PVP:
-- ================================================================
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS cost_price NUMERIC(12, 2) DEFAULT 0.00;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS selling_price NUMERIC(12, 2) DEFAULT 0.00;
UPDATE public.products SET selling_price = price WHERE (selling_price IS NULL OR selling_price = 0) AND price > 0;

-- ================================================================
-- CREACIÓN COMPLETA DESDE CERO (SI AÚN NO HAS CREADO LA TABLA)
-- ================================================================

-- 1. Crear extensión UUID si no existe
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Crear tabla de repuestos / productos con ambos precios
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(100) UNIQUE, -- Código de parte Yamaha (OEM)
    category VARCHAR(100) NOT NULL, -- Categoría (Motor, Frenos, Transmisión, etc.)
    cost_price NUMERIC(12, 2) NOT NULL DEFAULT 0.00, -- Precio Costo (compra)
    selling_price NUMERIC(12, 2) NOT NULL DEFAULT 0.00, -- Precio de Venta al Público (PVP)
    price NUMERIC(12, 2) NOT NULL DEFAULT 0.00, -- Compatibilidad
    stock INTEGER NOT NULL DEFAULT 0,
    min_stock INTEGER NOT NULL DEFAULT 5, -- Nivel de alerta roja para stock crítico
    available BOOLEAN NOT NULL DEFAULT true,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Habilitar Seguridad a Nivel de Fila (Row Level Security - RLS)
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- 4. Crear Políticas de Acceso (Permitir lectura y modificación al administrador)
DROP POLICY IF EXISTS "Acceso completo a usuarios autenticados" ON public.products;
CREATE POLICY "Acceso completo a usuarios autenticados"
ON public.products
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Política para lectura anónima o clave pública (anon key)
DROP POLICY IF EXISTS "Lectura pública de repuestos" ON public.products;
CREATE POLICY "Lectura pública de repuestos"
ON public.products
FOR SELECT
TO anon
USING (true);

DROP POLICY IF EXISTS "Modificación completa con anon key" ON public.products;
CREATE POLICY "Modificación completa con anon key"
ON public.products
FOR ALL
TO anon
USING (true)
WITH CHECK (true);

-- 5. Crear función y trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_products_updated_at ON public.products;
CREATE TRIGGER update_products_updated_at
BEFORE UPDATE ON public.products
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- 6. Insertar repuestos iniciales de Yamaha para Taller Aragua con Costo y PVP
INSERT INTO public.products (name, code, category, cost_price, selling_price, price, stock, min_stock, available, description)
VALUES
('Aceite Yamalube 4T 10W-40 Semisintético 1L', 'LUB-10W40-FS', 'Lubricantes', 7.50, 11.50, 11.50, 48, 10, true, 'Aceite original Yamaha para motores de 4 tiempos de alta tecnología.'),
('Filtro de Aire Original Yamaha NMAX 155 / Aerox', '2DP-E4451-00', 'Filtros', 11.00, 18.00, 18.00, 14, 5, true, 'Elemento filtrante de aire genuino para scooter Yamaha NMAX 155.'),
('Pastillas de Freno Delantero Yamaha MT-03 / MT-07', '1WS-W0045-00', 'Frenos', 21.00, 34.50, 34.50, 4, 6, true, 'Juego de pastillas sinterizadas OEM de alto rendimiento de frenado.'),
('Bujía NGK Laser Iridium Yamaha R15 / MT-15', 'CR9EIX', 'Eléctrico', 8.50, 14.00, 14.00, 25, 8, true, 'Bujía de encendido de iridio para máxima respuesta y combustión.'),
('Kit de Arrastre Cadena y Piñón Yamaha FZ-16 / FZ-25', '21C-W001A-00', 'Transmisión', 42.00, 65.00, 65.00, 3, 5, true, 'Kit completo con piñón de ataque, catalina y cadena reforzada con o-ring.'),
('Correa de Transmisión CVT Yamaha BWS 125 / Cygnus', '5S9-E7641-00', 'Transmisión', 17.50, 28.00, 28.00, 8, 4, true, 'Banda de tracción dentada reforzada con aramida para scooters.'),
('Disco de Embrague (Kit 5 Discos) Yamaha YBR 125', '5VL-E6321-00', 'Motor', 14.00, 22.50, 22.50, 2, 5, true, 'Discos de fricción originales para embrague de YBR 125 y XTZ 125.'),
('Batería Yuasa 12V 6Ah Sellada Gel (Yamaha FZ/R15)', 'YTZ7S-GEL', 'Eléctrico', 26.00, 42.00, 42.00, 6, 3, true, 'Batería libre de mantenimiento de alto poder de arranque en frío.'),
('Juego de Neumáticos Michelin Pilot Street 140/70-17', 'MICH-14070-17', 'Chasis y Ruedas', 72.00, 110.00, 110.00, 5, 2, true, 'Cubierta trasera deportiva para Yamaha MT-03, R3 y FZ-25.'),
('Amortiguador Trasero Mono-Shock Yamaha XTZ 125', '2JS-F2210-00', 'Suspensión', 54.00, 85.00, 85.00, 2, 3, true, 'Amortiguador hidráulico presurizado original para motocross/enduro.'),
('Faro Delantero Óptica LED Yamaha Crypton 115', '4S3-H4310-10', 'Iluminación', 28.00, 45.00, 45.00, 1, 3, true, 'Conjunto óptico frontal de reemplazo directo con homologación oficial.'),
('Líquido de Frenos Yamalube DOT 4 Racing 500ml', 'YAM-DOT4-500', 'Lubricantes', 5.20, 8.50, 8.50, 20, 5, true, 'Fluido para sistemas hidráulicos de frenos y embrague con alto punto de ebullición.')
ON CONFLICT (code) DO NOTHING;
