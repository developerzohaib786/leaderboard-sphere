'use client';
import VideoFeed from './components/VedioShow';
import Navbar from './components/Navbar';
import { useEffect,useState } from 'react';
import { signOut } from 'next-auth/react';

export default function Home() {
 const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut({
        callbackUrl: '/login',
        redirect: true
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
  }


  useEffect(() => {
    const checkLoggedIn = () => {
      const token = localStorage.getItem('token');
      setIsLoggedIn(!!token);
    };
    
    checkLoggedIn();
  }, []);

  return (
    <section>
      <Navbar isLoggedIn={isLoggedIn} onLogout={handleLogout} />
      <VideoFeed />
    </section>
  );
}

