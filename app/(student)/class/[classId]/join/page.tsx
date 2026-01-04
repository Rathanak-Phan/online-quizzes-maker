'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiUserPlus, FiCheckCircle } from 'react-icons/fi';

export default function JoinClassPage() {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    try {
      setLoading(true);
      setError('');
      setSuccess('');

      const response = await fetch('/api/student/classes/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code.toUpperCase() }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(`Successfully joined class: ${data.class.name}`);
        setCode('');
        setTimeout(() => {
          router.push(`/student/class/${data.class._id}`);
        }, 2000);
      } else {
        setError(data.error || 'Failed to join class');
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiUserPlus className="text-3xl text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Join a Class</h1>
            <p className="text-gray-600">
              Enter the class code provided by your teacher
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-2">
                Class Code
              </label>
              <input
                id="code"
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="e.g., MATH101"
                className="w-full px-4 py-3 text-lg text-center font-bold tracking-widest border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                maxLength={10}
                required
              />
              <p className="text-sm text-gray-500 mt-2">
                The code is usually 6-8 characters long and contains letters/numbers
              </p>
            </div>

            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700">{error}</p>
              </div>
            )}

            {success && (
              <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <FiCheckCircle className="text-green-600" />
                  <p className="text-green-700">{success}</p>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !code.trim()}
              className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {loading ? 'Joining...' : 'Join Class'}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t">
            <h3 className="font-semibold text-gray-700 mb-3">Where to find the code?</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• Your teacher will share a class code with you</li>
              <li>• Check your email or class announcement</li>
              <li>• The code is usually shown on the class page</li>
              <li>• Example codes: MATH101, PHYS202, ENG301</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}