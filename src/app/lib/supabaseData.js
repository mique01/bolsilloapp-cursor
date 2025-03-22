// Use client directive to ensure this runs on the client side
'use client';

import supabase from "@/lib/supabase";

// Generic function to fetch data from any table
export async function fetchData(tableName, options = {}) {
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
    let query = supabase.from(tableName).select(selectStr);

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
    return { data, error };
  } catch (error) {
    console.error('Error in fetchData:', error);
    return { data: null, error };
  }
}

// Create a new record
export async function createRecord(tableName, data) {
  try {
    const { data: result, error } = await supabase
      .from(tableName)
      .insert(data)
      .select();

    return { data: result, error };
  } catch (error) {
    console.error('Error in createRecord:', error);
    return { data: null, error };
  }
} 