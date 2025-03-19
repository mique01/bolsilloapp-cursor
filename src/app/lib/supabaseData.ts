import { supabase } from './supabase';

// Generic function to fetch data from any table
export async function fetchData<T>(
  tableName: string,
  options: {
    columns?: string;
    filters?: Record<string, any>;
    orderBy?: { column: string; ascending?: boolean };
    limit?: number;
    offset?: number;
    relationships?: { name: string; columns?: string }[];
  } = {}
) {
  const {
    columns = '*',
    filters = {},
    orderBy,
    limit,
    offset,
    relationships = [],
  } = options;

  let query = supabase.from(tableName).select(
    columns + 
    relationships.map(rel => `, ${rel.name}(${rel.columns || '*'})`).join('')
  );

  // Apply filters
  Object.entries(filters).forEach(([key, value]) => {
    query = query.eq(key, value);
  });

  // Apply ordering
  if (orderBy) {
    query = query.order(orderBy.column, { 
      ascending: orderBy.ascending !== false 
    });
  }

  // Apply pagination
  if (limit) {
    query = query.limit(limit);
  }

  if (offset) {
    query = query.range(offset, offset + (limit || 10) - 1);
  }

  const { data, error } = await query;
  return { data, error };
}

// Create a new record
export async function createRecord<T>(
  tableName: string,
  data: Record<string, any>
) {
  const { data: result, error } = await supabase
    .from(tableName)
    .insert(data)
    .select();
  
  return { data: result, error };
}

// Update a record
export async function updateRecord(
  tableName: string,
  id: string | number,
  data: Record<string, any>,
  idColumn = 'id'
) {
  const { data: result, error } = await supabase
    .from(tableName)
    .update(data)
    .eq(idColumn, id)
    .select();
  
  return { data: result, error };
}

// Delete a record
export async function deleteRecord(
  tableName: string,
  id: string | number,
  idColumn = 'id'
) {
  const { data, error } = await supabase
    .from(tableName)
    .delete()
    .eq(idColumn, id);
  
  return { data, error };
}

// Upsert - create or update records
export async function upsertRecords(
  tableName: string,
  data: Record<string, any>[],
  onConflict?: string
) {
  let query = supabase.from(tableName).upsert(data);
  
  if (onConflict) {
    // @ts-ignore - Supabase types may not correctly reflect this method
    query = query.onConflict(onConflict);
  }
  
  const { data: result, error } = await query.select();
  return { data: result, error };
} 