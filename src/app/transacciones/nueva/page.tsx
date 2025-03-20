import { Suspense } from 'react';
import TransactionForm from './TransactionForm';

export default function NuevaTransaccionPage() {
  return (
    <Suspense fallback={<div className="p-6 text-center">Cargando formulario de transacción...</div>}>
      <TransactionForm />
    </Suspense>
  );
} 