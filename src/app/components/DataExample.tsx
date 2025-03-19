'use client';
import { useState, useEffect } from 'react';
import { fetchData, createRecord } from '@/app/lib/supabaseData';

interface Todo {
  id: number;
  title: string;
  completed: boolean;
  user_id: string;
}

export default function DataExample() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTodo, setNewTodo] = useState('');
  
  useEffect(() => {
    loadTodos();
  }, []);

  async function loadTodos() {
    setLoading(true);
    try {
      const response = await fetchData('todos', {
        orderBy: { column: 'created_at', ascending: false },
      });
      
      if (response.error) {
        console.error('Error loading todos:', response.error);
        setTodos([]);
        return;
      }
      
      // Safe type check and conversion
      if (response.data && Array.isArray(response.data)) {
        // We need to manually validate each item
        const safeData: Todo[] = [];
        
        for (const item of response.data) {
          if (item && 
              typeof item === 'object' && 
              'id' in item && 
              'title' in item && 
              'completed' in item) {
            safeData.push({
              id: Number((item as any).id),
              title: String((item as any).title),
              completed: Boolean((item as any).completed),
              user_id: String((item as any).user_id || '')
            });
          }
        }
        
        setTodos(safeData);
      } else {
        setTodos([]);
      }
    } catch (error) {
      console.error('Error loading todos:', error);
      setTodos([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleAddTodo(e: React.FormEvent) {
    e.preventDefault();
    if (!newTodo.trim()) return;
    
    try {
      const response = await createRecord('todos', {
        title: newTodo,
        completed: false,
      });
      
      if (response.error) {
        console.error('Error adding todo:', response.error);
        return;
      }
      
      // Manually extract and validate the new todo
      if (response.data && Array.isArray(response.data) && response.data.length > 0) {
        const item = response.data[0] as any;
        
        if (item && 
            typeof item === 'object' && 
            'id' in item && 
            'title' in item) {
          
          const newTodo: Todo = {
            id: Number(item.id),
            title: String(item.title),
            completed: Boolean(item.completed || false),
            user_id: String(item.user_id || '')
          };
          
          setTodos(prev => [newTodo, ...prev]);
        }
      }
      
      setNewTodo('');
    } catch (error) {
      console.error('Error adding todo:', error);
    }
  }

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-bold">Todos</h2>
      
      <form onSubmit={handleAddTodo} className="flex gap-2">
        <input
          type="text"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          placeholder="Add a new todo"
          className="flex-1 px-3 py-2 border rounded"
        />
        <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded">
          Add
        </button>
      </form>
      
      {loading ? (
        <p>Loading todos...</p>
      ) : (
        <ul className="space-y-2">
          {todos.length === 0 ? (
            <p>No todos found</p>
          ) : (
            todos.map((todo) => (
              <li key={todo.id} className="p-3 border rounded flex items-center gap-2">
                <span className={todo.completed ? 'line-through' : ''}>
                  {todo.title}
                </span>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
} 