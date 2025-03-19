import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/app/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();
    
    const { data, error } = await supabase
      .from('todos')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching todos:', error);
    return NextResponse.json(
      { error: 'Failed to fetch todos' }, 
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const supabase = createServerSupabaseClient();
    
    if (!body.title) {
      return NextResponse.json(
        { error: 'Title is required' }, 
        { status: 400 }
      );
    }
    
    const { data, error } = await supabase
      .from('todos')
      .insert({ 
        title: body.title,
        completed: body.completed || false,
        user_id: body.user_id
      })
      .select();
    
    if (error) throw error;
    
    return NextResponse.json(data[0]);
  } catch (error) {
    console.error('Error creating todo:', error);
    return NextResponse.json(
      { error: 'Failed to create todo' }, 
      { status: 500 }
    );
  }
} 