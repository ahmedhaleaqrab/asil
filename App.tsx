
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import AdminPanel from './components/AdminPanel';
import Navbar from './components/Navbar';
import { User } from './types';
import { db } from './services/db';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [dbError, setDbError] = useState<string | null>(null);
  const [checkingDb, setCheckingDb] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('asil_user');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }

    // فحص قاعدة البيانات فوراً
    const initDb = async () => {
      try {
        const isHealthy = await db.checkSchema();
        if (!isHealthy) {
          setDbError('DATABASE_MIGRATION_REQUIRED');
        }
      } catch (e: any) {
        // إذا فشل الفحص لسبب آخر غير نقص العمود (مثل الانترنت)، نتجاهله
      } finally {
        setCheckingDb(false);
      }
    };

    initDb();

    const handleError = (event: PromiseRejectionEvent) => {
      if (event.reason?.message?.includes('archived_at')) {
        setDbError('DATABASE_MIGRATION_REQUIRED');
      }
    };

    window.addEventListener('unhandledrejection', handleError);
    return () => window.removeEventListener('unhandledrejection', handleError);
  }, []);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('asil_user', JSON.stringify(user));
    setDbError(null);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('asil_user');
    setDbError(null);
  };

  if (checkingDb) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin"></div>
          <p className="text-slate-400 font-black animate-pulse">جاري فحص النظام...</p>
        </div>
      </div>
    );
  }

  if (dbError === 'DATABASE_MIGRATION_REQUIRED') {
    return <Login onLogin={handleLogin} forceSetup={true} />;
  }

  return (
    <Router>
      <div className="min-h-screen bg-slate-50 text-slate-900">
        {currentUser && <Navbar user={currentUser} onLogout={handleLogout} />}
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route 
              path="/login" 
              element={currentUser ? <Navigate to="/" /> : <Login onLogin={handleLogin} />} 
            />
            <Route 
              path="/" 
              element={currentUser ? <Dashboard user={currentUser} /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/admin" 
              element={
                (currentUser?.role === 'admin' || currentUser?.role === 'accountant')
                  ? <AdminPanel currentUser={currentUser} /> 
                  : <Navigate to="/" />
              } 
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;
