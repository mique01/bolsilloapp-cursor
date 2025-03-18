import { supabase } from '../supabase';
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

// Transactions
export async function getTransactions(userId: string): Promise<{ data: Transaction[] | null; error: PostgrestError | null }> {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false });
  
  return { data, error };
}

export async function addTransaction(transaction: Omit<Transaction, 'id' | 'created_at'>): Promise<{ data: Transaction | null; error: PostgrestError | null }> {
  const { data, error } = await supabase
    .from('transactions')
    .insert(transaction)
    .select()
    .single();
  
  return { data, error };
}

export async function updateTransaction(transaction: Partial<Transaction> & { id: string }): Promise<{ data: Transaction | null; error: PostgrestError | null }> {
  const { data, error } = await supabase
    .from('transactions')
    .update(transaction)
    .eq('id', transaction.id)
    .select()
    .single();
  
  return { data, error };
}

export async function deleteTransaction(id: string): Promise<{ error: PostgrestError | null }> {
  const { error } = await supabase
    .from('transactions')
    .delete()
    .eq('id', id);
  
  return { error };
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
export async function getComprobantes(userId: string, folderId?: string): Promise<{ data: Comprobante[] | null; error: PostgrestError | null }> {
  let query = supabase
    .from('comprobantes')
    .select('*')
    .eq('user_id', userId);
  
  if (folderId) {
    query = query.eq('folder_id', folderId);
  }
  
  const { data, error } = await query.order('created_at', { ascending: false });
  
  return { data, error };
}

export async function addComprobante(comprobante: Omit<Comprobante, 'id' | 'created_at'>): Promise<{ data: Comprobante | null; error: PostgrestError | null }> {
  const { data, error } = await supabase
    .from('comprobantes')
    .insert(comprobante)
    .select()
    .single();
  
  return { data, error };
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

export async function deleteComprobante(id: string): Promise<{ error: PostgrestError | null }> {
  const { error } = await supabase
    .from('comprobantes')
    .delete()
    .eq('id', id);
  
  return { error };
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