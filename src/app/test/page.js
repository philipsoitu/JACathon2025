'use client';

import { useState, useEffect } from 'react';

export default function TodoList() {
  const [todos, setTodos] = useState([]);

  useEffect(() => {
    fetch('/api/todos')
      .then(res => res.json())
      .then(setTodos);
  }, []);

  async function addTodo() {
    const res = await fetch('/api/todos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'New task' }),
    });
    const newTodo = await res.json();
    setTodos(t => [...t, newTodo]);
  }

  return (
    <div>
      <ul>
        {todos.map((todo, i) => (
          <li key={i}>{todo.title}</li>
        ))}
      </ul>
      <button onClick={addTodo}>Add</button>
    </div>
  );
}
