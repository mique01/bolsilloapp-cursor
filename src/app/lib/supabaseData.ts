import { supabase } from '@/lib/supabase';

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
): Promise<{ data: T[] | null; error: any }> {
  try {
    const {
      columns = '*',
      filters = {},
      orderBy,
      limit,
      offset,
      relationships = [],
    } = options;

    // Build the select string with relationships
    const selectStr = columns + 
      relationships.map(rel => `, ${rel.name}(${rel.columns || '*'})`).join('');

    // Initialize query
    let query: any = supabase.from(tableName).select(selectStr);

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

    // Execute the query
    const { data, error } = await query;
    return { data: data as T[] | null, error };
  } catch (error) {
    console.error('Error in fetchData:', error);
    return { data: null, error };
  }
}

// Create a new record
export async function createRecord<T>(
  tableName: string,
  data: Record<string, any>
): Promise<{ data: T[] | null; error: any }> {
  try {
    const client: any = supabase;
    const { data: result, error } = await client
      .from(tableName)
      .insert(data)
      .select();
    
    return { data: result as T[] | null, error };
  } catch (error) {
    console.error('Error in createRecord:', error);
    return { data: null, error };
  }
}

// Update a record
export async function updateRecord<T>(
  tableName: string,
  id: string | number,
  data: Record<string, any>,
  idColumn = 'id'
): Promise<{ data: T[] | null; error: any }> {
  try {
    const client: any = supabase;
    const { data: result, error } = await client
      .from(tableName)
      .update(data)
      .eq(idColumn, id)
      .select();
    
    return { data: result as T[] | null, error };
  } catch (error) {
    console.error('Error in updateRecord:', error);
    return { data: null, error };
  }
}

// Delete a record
export async function deleteRecord<T>(
  tableName: string,
  id: string | number,
  idColumn = 'id'
): Promise<{ data: T[] | null; error: any }> {
  try {
    const client: any = supabase;
    const { data, error } = await client
      .from(tableName)
      .delete()
      .eq(idColumn, id)
      .select();
    
    return { data: data as T[] | null, error };
  } catch (error) {
    console.error('Error in deleteRecord:', error);
    return { data: null, error };
  }
}

// Upsert - create or update records
export async function upsertRecords<T>(
  tableName: string,
  data: Record<string, any>[],
  onConflict?: string
): Promise<{ data: T[] | null; error: any }> {
  try {
    const client: any = supabase;
    let query = client.from(tableName).upsert(data);
    
    if (onConflict) {
      query = query.onConflict(onConflict);
    }
    
    const { data: result, error } = await query.select();
    return { data: result as T[] | null, error };
  } catch (error) {
    console.error('Error in upsertRecords:', error);
    return { data: null, error };
  }
} 