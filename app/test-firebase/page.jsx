'use client';
import { auth, db } from '@/lib/firebase';
import { useEffect, useState } from 'react';

export default function TestFirebase() {
  const [status, setStatus] = useState('Testing...');

  useEffect(() => {
    try {
      if (auth && db) {
        setStatus('✅ Firebase connected successfully!');
      }
    } catch (error) {
      setStatus('❌ Firebase connection failed: ' + error.message);
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-2xl font-bold">{status}</div>
    </div>
  );
}