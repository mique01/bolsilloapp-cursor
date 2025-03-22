import supabase from '../supabase';
import { PostgrestError } from '@supabase/supabase-js';

export type Transaction = {
  id: string;
  user_id: string;
  description: string;
  amount: number;
  date: string;
  category: string;
  type: 'income' | 'expense';
  payment_method: string;
  person?: string;
  attachment_id?: string;
  created_at?: string;
};

export type Category = {
  id: string;
  user_id: string;
  name: string;
  type: 'income' | 'expense';
  created_at?: string;
};

export type PaymentMethod = {
  id: string;
  user_id: string;
  name: string;
  created_at?: string;
};

export type Person = {
  id: string;
  user_id: string;
  name: string;
  created_at?: string;
};

export type Comprobante = {
  id: string;
  user_id: string;
  description: string;
  file_name: string;
  file_type: string;
  file_url: string;
  folder_id: string;
  created_at?: string;
};

export type Folder = {
  id: string;
  user_id: string;
  name: string;
  created_at?: string;
};

export type Budget = {
  id: string;
  user_id: string;
  category: string;
  amount: number;
  period: 'monthly' | 'yearly';
  created_at?: string;
};

// Función de utilidad para verificar la disponibilidad de Supabase
const getSupabaseClient = () => {
  const client = supabase;
  
  if (!client) {
    console.error("Supabase client no está disponible");
    throw new Error("Supabase client no está disponible");
  }
  
  return client;
};

// Transactions
export async function getTransactions(userId: string): Promise<{ data: Transaction[] | null; error: PostgrestError | null }> {
  try {
    const client = getSupabaseClient();
    console.log("Obteniendo transacciones para el usuario:", userId);
    
    const { data, error } = await client
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });

    if (error) throw error;
    console.log(`Se han recuperado ${data?.length || 0} transacciones`);
    
    return { data, error };
  } catch (error) {
    console.error("Error al obtener transacciones:", error);
    return { data: null, error: error as PostgrestError };
  }
}

export async function addTransaction(transaction: Omit<Transaction, 'id' | 'created_at'>): Promise<{ data: Transaction | null; error: PostgrestError | null }> {
  try {
    const client = getSupabaseClient();
    console.log("Añadiendo nueva transacción:", transaction.description);
    
    const { data, error } = await client
      .from('transactions')
      .insert(transaction)
      .select()
      .single();

    if (error) throw error;
    console.log("Transacción añadida con éxito, ID:", data?.id);
    
    return { data, error };
  } catch (error) {
    console.error("Error al añadir transacción:", error);
    return { data: null, error: error as PostgrestError };
  }
}

export async function updateTransaction(
  transactionOrId: (Partial<Transaction> & { id: string }) | string,
  transactionData?: any
): Promise<{ data: Transaction | null; error: PostgrestError | null }> {
  try {
    const client = getSupabaseClient();
    
    let id: string;
    let transactionToUpdate: any;
    
    // Determinar el formato de parámetros utilizado
    if (typeof transactionOrId === 'string') {
      // Formato: updateTransaction(id, transactionData)
      id = transactionOrId;
      transactionToUpdate = transactionData;
      console.log(`Actualizando transacción ${id}...`, transactionToUpdate);
    } else {
      // Formato: updateTransaction(transaction)
      id = transactionOrId.id;
      transactionToUpdate = transactionOrId;
      console.log(`Actualizando transacción con ID ${id}...`, transactionToUpdate);
    }
    
    // Preparar los datos para actualizar según el formato
    const updateData = typeof transactionOrId === 'string' 
      ? {
          type: transactionToUpdate.type,
          amount: transactionToUpdate.amount,
          date: transactionToUpdate.date,
          description: transactionToUpdate.description,
          category: transactionToUpdate.category,
          payment_method: transactionToUpdate.payment_method,
          person: transactionToUpdate.person,
          receipt_id: transactionToUpdate.receipt_id,
          updated_at: new Date().toISOString()
        }
      : {
          ...transactionOrId,
          updated_at: new Date().toISOString(),
          id: undefined // No actualizar el id
        };
    
    const { data, error } = await client
      .from('transactions')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error al actualizar la transacción:', error);
      return { data: null, error };
    }
    
    console.log('Transacción actualizada correctamente:', data);
    return { data, error: null };
  } catch (error) {
    console.error('Error en updateTransaction:', error);
    return { data: null, error: error as PostgrestError };
  }
}

export async function deleteTransaction(id: string): Promise<{ error: PostgrestError | null }> {
  try {
    const client = getSupabaseClient();
    console.log("Eliminando transacción con ID:", id);
    
    const { error } = await client
      .from('transactions')
      .delete()
      .eq('id', id);

    if (error) throw error;
    console.log("Transacción eliminada con éxito");
    
    return { error };
  } catch (error) {
    console.error("Error al eliminar transacción:", error);
    return { error: error as PostgrestError };
  }
}

// Categories
export async function getCategories(userId: string, type?: 'income' | 'expense'): Promise<{ data: Category[] | null; error: PostgrestError | null }> {
  let query = supabase
    .from('categories')
    .select('*')
    .eq('user_id', userId);
  
  if (type) {
    query = query.eq('type', type);
  }
  
  const { data, error } = await query.order('name');
  
  return { data, error };
}

export async function addCategory(category: Omit<Category, 'id' | 'created_at'>): Promise<{ data: Category | null; error: PostgrestError | null }> {
  const { data, error } = await supabase
    .from('categories')
    .insert(category)
    .select()
    .single();
  
  return { data, error };
}

export async function updateCategory(category: Partial<Category> & { id: string }): Promise<{ data: Category | null; error: PostgrestError | null }> {
  const { data, error } = await supabase
    .from('categories')
    .update(category)
    .eq('id', category.id)
    .select()
    .single();
  
  return { data, error };
}

export async function deleteCategory(id: string): Promise<{ error: PostgrestError | null }> {
  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', id);
  
  return { error };
}

// Payment Methods
export async function getPaymentMethods(userId: string): Promise<{ data: PaymentMethod[] | null; error: PostgrestError | null }> {
  const { data, error } = await supabase
    .from('payment_methods')
    .select('*')
    .eq('user_id', userId)
    .order('name');
  
  return { data, error };
}

export async function addPaymentMethod(method: Omit<PaymentMethod, 'id' | 'created_at'>): Promise<{ data: PaymentMethod | null; error: PostgrestError | null }> {
  const { data, error } = await supabase
    .from('payment_methods')
    .insert(method)
    .select()
    .single();
  
  return { data, error };
}

export async function updatePaymentMethod(method: Partial<PaymentMethod> & { id: string }): Promise<{ data: PaymentMethod | null; error: PostgrestError | null }> {
  const { data, error } = await supabase
    .from('payment_methods')
    .update(method)
    .eq('id', method.id)
    .select()
    .single();
  
  return { data, error };
}

export async function deletePaymentMethod(id: string): Promise<{ error: PostgrestError | null }> {
  const { error } = await supabase
    .from('payment_methods')
    .delete()
    .eq('id', id);
  
  return { error };
}

// People
export async function getPeople(userId: string): Promise<{ data: Person[] | null; error: PostgrestError | null }> {
  const { data, error } = await supabase
    .from('people')
    .select('*')
    .eq('user_id', userId)
    .order('name');
  
  return { data, error };
}

export async function addPerson(person: Omit<Person, 'id' | 'created_at'>): Promise<{ data: Person | null; error: PostgrestError | null }> {
  const { data, error } = await supabase
    .from('people')
    .insert(person)
    .select()
    .single();
  
  return { data, error };
}

export async function updatePerson(person: Partial<Person> & { id: string }): Promise<{ data: Person | null; error: PostgrestError | null }> {
  const { data, error } = await supabase
    .from('people')
    .update(person)
    .eq('id', person.id)
    .select()
    .single();
  
  return { data, error };
}

export async function deletePerson(id: string): Promise<{ error: PostgrestError | null }> {
  const { error } = await supabase
    .from('people')
    .delete()
    .eq('id', id);
  
  return { error };
}

// Folders
export async function getFolders(userId: string): Promise<{ data: Folder[] | null; error: PostgrestError | null }> {
  const { data, error } = await supabase
    .from('folders')
    .select('*')
    .eq('user_id', userId)
    .order('name');
  
  return { data, error };
}

export async function addFolder(folder: Omit<Folder, 'id' | 'created_at'>): Promise<{ data: Folder | null; error: PostgrestError | null }> {
  const { data, error } = await supabase
    .from('folders')
    .insert(folder)
    .select()
    .single();
  
  return { data, error };
}

export async function updateFolder(folder: Partial<Folder> & { id: string }): Promise<{ data: Folder | null; error: PostgrestError | null }> {
  const { data, error } = await supabase
    .from('folders')
    .update(folder)
    .eq('id', folder.id)
    .select()
    .single();
  
  return { data, error };
}

export async function deleteFolder(id: string): Promise<{ error: PostgrestError | null }> {
  const { error } = await supabase
    .from('folders')
    .delete()
    .eq('id', id);
  
  return { error };
}

// Comprobantes (Receipts)
export async function getComprobantes(userId: string): Promise<{ data: Comprobante[] | null; error: PostgrestError | null }> {
  try {
    const client = getSupabaseClient();
    console.log("Obteniendo comprobantes para el usuario:", userId);
    
    const { data, error } = await client
      .from('comprobantes')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    console.log(`Se han recuperado ${data?.length || 0} comprobantes`);
    
    return { data, error };
  } catch (error) {
    console.error("Error al obtener comprobantes:", error);
    return { data: null, error: error as PostgrestError };
  }
}

export async function addComprobante(comprobante: Omit<Comprobante, 'id' | 'created_at'>, file: File): Promise<{ data: Comprobante | null; error: PostgrestError | null }> {
  try {
    const client = getSupabaseClient();
    console.log("Añadiendo nuevo comprobante:", comprobante.description);
    
    // 1. Subir el archivo al storage
    const fileName = `${Date.now()}_${file.name}`;
    const filePath = `${comprobante.user_id}/${fileName}`;
    
    const { data: fileData, error: uploadError } = await client.storage
      .from('comprobantes')
      .upload(filePath, file);
      
    if (uploadError) throw uploadError;
    
    // 2. Obtener la URL pública del archivo
    const { data: urlData } = client.storage
      .from('comprobantes')
      .getPublicUrl(filePath);
      
    // 3. Crear el registro en la tabla comprobantes
    const comprobanteToInsert = {
      ...comprobante,
      file_url: urlData.publicUrl
    };
    
    const { data, error } = await client
      .from('comprobantes')
      .insert(comprobanteToInsert)
      .select()
      .single();

    if (error) throw error;
    console.log("Comprobante añadido con éxito, ID:", data?.id);
    
    return { data, error };
  } catch (error) {
    console.error("Error al añadir comprobante:", error);
    return { data: null, error: error as PostgrestError };
  }
}

export async function updateComprobante(comprobante: Partial<Comprobante> & { id: string }): Promise<{ data: Comprobante | null; error: PostgrestError | null }> {
  const { data, error } = await supabase
    .from('comprobantes')
    .update(comprobante)
    .eq('id', comprobante.id)
    .select()
    .single();
  
  return { data, error };
}

export async function deleteComprobante(id: string, userId: string): Promise<{ error: PostgrestError | null }> {
  try {
    const client = getSupabaseClient();
    console.log("Eliminando comprobante con ID:", id);
    
    // 1. Obtener el comprobante para conocer la ruta del archivo
    const { data: comprobante, error: fetchError } = await client
      .from('comprobantes')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();
      
    if (fetchError) throw fetchError;
    
    // 2. Eliminar el archivo del storage si existe
    if (comprobante?.file_url) {
      const filePath = comprobante.file_url.split('/').pop();
      if (filePath) {
        const storagePath = `${userId}/${filePath}`;
        await client.storage.from('comprobantes').remove([storagePath]);
      }
    }
    
    // 3. Eliminar el registro de la base de datos
    const { error } = await client
      .from('comprobantes')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw error;
    console.log("Comprobante eliminado con éxito");
    
    return { error: null };
  } catch (error) {
    console.error("Error al eliminar comprobante:", error);
    return { error: error as PostgrestError };
  }
}

// Budgets
export async function getBudgets(userId: string): Promise<{ data: Budget[] | null; error: PostgrestError | null }> {
  const { data, error } = await supabase
    .from('budgets')
    .select('*')
    .eq('user_id', userId);
  
  return { data, error };
}

export async function addBudget(budget: Omit<Budget, 'id' | 'created_at'>): Promise<{ data: Budget | null; error: PostgrestError | null }> {
  const { data, error } = await supabase
    .from('budgets')
    .insert(budget)
    .select()
    .single();
  
  return { data, error };
}

export async function updateBudget(budget: Partial<Budget> & { id: string }): Promise<{ data: Budget | null; error: PostgrestError | null }> {
  const { data, error } = await supabase
    .from('budgets')
    .update(budget)
    .eq('id', budget.id)
    .select()
    .single();
  
  return { data, error };
}

export async function deleteBudget(id: string): Promise<{ error: PostgrestError | null }> {
  const { error } = await supabase
    .from('budgets')
    .delete()
    .eq('id', id);
  
  return { error };
}

// Upload file to Supabase Storage
export async function uploadFile(
  userId: string,
  file: File,
  bucket: string = 'comprobantes'
): Promise<{ data: { path: string } | null; error: Error | null }> {
  const fileExt = file.name.split('.').pop();
  const filePath = `${userId}/${Date.now()}.${fileExt}`;
  
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false
    });
  
  return { data, error };
}

// Get public URL for a file
export function getFileUrl(path: string, bucket: string = 'comprobantes'): string {
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
} 