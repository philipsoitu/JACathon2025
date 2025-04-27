'use client'; // (only for Next.js App Router if you're using interactive hooks)

import { useState } from 'react';


//all of this logic just gets added to the trip page in theory?


export default function AskGemini() {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault(); // prevent form from refreshing page
    setLoading(true);
    setResponse('');

    const jsonPrompt = `Generate 5 potential travel plans around "${prompt}".`;

    try {
      const res = await fetch('/api/enhance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        //absoluley disgusting formatting
        body: JSON.stringify({
            contents: [
              {
                parts: [
                  { text: jsonPrompt }
                ]
              }
            ]
          })
          
      });

      const data = await res.json();
      console.log("i wanna cry");
      console.log(data.response);
      setResponse(data.response);
    } catch (error) {
      console.error('Error:', error);
      setResponse('Something went wrong.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-4 border rounded">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <textarea
          className="border p-2 rounded"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Enter your question for Gemini..."
          rows={4}
        />

        <button
          className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
          type="submit"
          disabled={loading}
        >
          {loading ? 'Asking...' : 'Ask Gemini'}
        </button>
      </form>

      {loading && <p className="text-gray-500 mt-4">Thinking...</p>}

      {response && (
        <div className="mt-6 p-4 bg-gray-100 rounded">
          <h3 className="font-bold mb-2">Response:</h3>
          <p>{response}</p>
        </div>
      )}
    </div>
  );
}
