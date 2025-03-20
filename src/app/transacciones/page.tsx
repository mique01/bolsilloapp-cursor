import { Suspense } from 'react';
import TransactionsList from './TransactionsList';

export default function TransaccionesPage() {
  return (
    <Suspense fallback={<div className="p-6 text-center">Cargando transacciones...</div>}>
      <TransactionsList />
    </Suspense>
  );
} 