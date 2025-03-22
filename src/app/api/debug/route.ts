import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
  // Recopilar información del sistema
  const systemInfo = {
    timestamp: new Date().toISOString(),
    node_version: process.version,
    memory_usage: process.memoryUsage(),
    uptime: process.uptime(),
    env: process.env.NODE_ENV,
  };

  // Recopilar información de conexión desde localStorage si estuviéramos en el cliente
  // Como estamos en una API route, este objeto estará vacío
  const connectionInfo = {};

  // Recopilar cookies
  const cookieStore = cookies();
  const allCookies = cookieStore.getAll().map(cookie => ({
    name: cookie.name,
    value: cookie.value.substring(0, 3) + '...',  // Solo mostrar los primeros caracteres por seguridad
  }));

  // Construir respuesta de diagnóstico
  const diagnosticData = {
    systemInfo,
    connectionInfo,
    cookies: allCookies,
    headers: Object.fromEntries(
      Object.entries(Object.fromEntries(
        new Headers({}).entries()
      ))
    ),
  };

  return NextResponse.json(diagnosticData);
} 