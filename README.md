# Bolsillo App - Finanzas Personales

Una aplicación web moderna para gestionar tus finanzas personales, con seguimiento de transacciones, categorías, presupuestos y comprobantes.

## Características

- 🔐 Autenticación de usuarios con Supabase
- 💰 Registro de ingresos y gastos
- 📊 Dashboard con gráficos y estadísticas
- 📃 Gestión de comprobantes y archivos
- 📱 Diseño responsivo para móvil y escritorio
- 💼 Presupuestos por categoría

## Configuración

### Requisitos previos

- Node.js (versión 16.x o superior)
- Cuenta en [Supabase](https://supabase.com) (gratuita)

### Instalación

1. Clona este repositorio
```bash
git clone https://github.com/tuusuario/bolsillo-app.git
cd bolsillo-app
```

2. Instala las dependencias
```bash
npm install
```

3. Crea un archivo `.env.local` con las siguientes variables:
```
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-clave-anon-key
```

4. Ejecuta la aplicación en modo desarrollo
```bash
npm run dev
```

### Configuración de Supabase

1. Crea una cuenta gratuita en [Supabase](https://supabase.com)
2. Crea un nuevo proyecto
3. Anota la URL del proyecto y la Anon Key desde: Configuración del proyecto > API
4. Crea las siguientes tablas en la base de datos:

#### Estructura de la base de datos

##### Tabla: `transactions`
- `id` (uuid, PK, defaultValue: `uuid_generate_v4()`)
- `user_id` (uuid, FK references auth.users.id, not null)
- `description` (text, not null)
- `amount` (numeric, not null)
- `date` (date, not null)
- `category` (text, not null)
- `type` (text, not null) - Valores: 'income' o 'expense'
- `payment_method` (text, not null)
- `person` (text)
- `attachment_id` (uuid, FK references comprobantes.id)
- `created_at` (timestamp with time zone, defaultValue: `now()`)

##### Tabla: `categories`
- `id` (uuid, PK, defaultValue: `uuid_generate_v4()`)
- `user_id` (uuid, FK references auth.users.id, not null)
- `name` (text, not null)
- `type` (text, not null) - Valores: 'income' o 'expense'
- `created_at` (timestamp with time zone, defaultValue: `now()`)

##### Tabla: `payment_methods`
- `id` (uuid, PK, defaultValue: `uuid_generate_v4()`)
- `user_id` (uuid, FK references auth.users.id, not null)
- `name` (text, not null)
- `created_at` (timestamp with time zone, defaultValue: `now()`)

##### Tabla: `people`
- `id` (uuid, PK, defaultValue: `uuid_generate_v4()`)
- `user_id` (uuid, FK references auth.users.id, not null)
- `name` (text, not null)
- `created_at` (timestamp with time zone, defaultValue: `now()`)

##### Tabla: `folders`
- `id` (uuid, PK, defaultValue: `uuid_generate_v4()`)
- `user_id` (uuid, FK references auth.users.id, not null)
- `name` (text, not null)
- `created_at` (timestamp with time zone, defaultValue: `now()`)

##### Tabla: `comprobantes`
- `id` (uuid, PK, defaultValue: `uuid_generate_v4()`)
- `user_id` (uuid, FK references auth.users.id, not null)
- `description` (text, not null)
- `file_name` (text, not null)
- `file_type` (text, not null)
- `file_url` (text, not null)
- `folder_id` (uuid, FK references folders.id)
- `transaction_id` (uuid, FK references transactions.id)
- `created_at` (timestamp with time zone, defaultValue: `now()`)

##### Tabla: `budgets`
- `id` (uuid, PK, defaultValue: `uuid_generate_v4()`)
- `user_id` (uuid, FK references auth.users.id, not null)
- `category` (text, not null)
- `amount` (numeric, not null)
- `period` (text, not null) - Valores: 'monthly' o 'yearly'
- `created_at` (timestamp with time zone, defaultValue: `now()`)

### Políticas de seguridad (RLS)

Para cada tabla, establece las siguientes políticas de Row Level Security:

1. Habilita RLS en todas las tablas
2. Para cada tabla, crea las siguientes políticas:

#### Política SELECT (para todas las tablas)
- Nombre: `Users can view their own data`
- Objetivo: `SELECT`
- Expresión de verificación: `auth.uid() = user_id`

#### Política INSERT (para todas las tablas)
- Nombre: `Users can insert their own data`
- Objetivo: `INSERT`
- Expresión de verificación: `auth.uid() = user_id`

#### Política UPDATE (para todas las tablas)
- Nombre: `Users can update their own data`
- Objetivo: `UPDATE`
- Expresión de verificación: `auth.uid() = user_id`

#### Política DELETE (para todas las tablas)
- Nombre: `Users can delete their own data`
- Objetivo: `DELETE`
- Expresión de verificación: `auth.uid() = user_id`

### Configuración de almacenamiento

1. Crea un nuevo bucket llamado `comprobantes`
2. Habilita RLS en el bucket
3. Crea las siguientes políticas:

#### SELECT para archivos
- Nombre: `Users can view their own files`
- Objetivo: `SELECT`
- Expresión de verificación: `auth.uid()::text = SPLIT_PART(name, '/', 1)`

#### INSERT para archivos
- Nombre: `Users can upload their own files`
- Objetivo: `INSERT`
- Expresión de verificación: `auth.uid()::text = SPLIT_PART(name, '/', 1)`

#### UPDATE/DELETE para archivos
- Nombre: `Users can update/delete their own files`
- Objetivo: `UPDATE, DELETE`
- Expresión de verificación: `auth.uid()::text = SPLIT_PART(name, '/', 1)`

## Uso

1. Regístrate o inicia sesión en la aplicación
2. Navega al dashboard para ver un resumen de tus finanzas
3. Agrega nuevas transacciones desde la sección de Transacciones
4. Gestiona tus comprobantes en la sección Comprobantes
5. Establece presupuestos en la sección Presupuestos

## Desarrollo

### Estructura de directorios

- `/src/app`: Páginas y componentes específicos de páginas
- `/src/app/api`: Rutas de API
- `/src/components`: Componentes React reutilizables
- `/src/lib`: Utilidades, hooks y contextos
  - `/contexts`: Contextos de React (Auth, etc.)
  - `/hooks`: Hooks personalizados
  - `/services`: Servicios para comunicación con Supabase

### Scripts disponibles

- `npm run dev`: Inicia el servidor de desarrollo
- `npm run build`: Construye la aplicación para producción
- `npm run start`: Inicia la aplicación en modo producción
- `npm run lint`: Ejecuta ESLint para verificar el código

## Contribución

Las contribuciones son bienvenidas. Para cambios importantes, por favor abre primero un issue para discutir qué te gustaría cambiar.

## Licencia

MIT