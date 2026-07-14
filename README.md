# Escuelas de Paysandú

Sitio público de consulta del catálogo de escuelas del departamento de Paysandú.

- **Inicio:** galería con foto de fachada, datos e información pública de cada escuela.
- **Datos:** mismo proyecto Supabase que la Calculadora PAE (solo lectura vía RPC `get_public_paysandu_schools`).
- **Edición:** sigue en la app Calculadora → Mi cuenta → Escuelas Paysandú.

## Desarrollo local

```bash
npm install
npm run dev
```

Abrí [http://localhost:3000](http://localhost:3000).

## Variables de entorno (Vercel)

Opcional si usás los valores por defecto embebidos en `next.config.mjs`:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Deploy en Vercel

1. Importar el repo `matiias793/escuelas.paysandu`.
2. Framework: Next.js (detección automática).
3. Deploy.

La URL de producción (ej. `https://escuelas-paysandu.vercel.app`) debe configurarse en la Calculadora como enlace para compartir desde el panel admin.

## Supabase

En el proyecto Supabase compartido deben estar ejecutados:

- `paysandu_schools_public_gallery.sql`
- `paysandu_schools_public_info.sql` (info pública en galería)
