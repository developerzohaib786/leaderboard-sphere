'use client';
import VideoFeed from './components/VedioShow';
import Navbar from './components/NavbarComponent';


export default function Home() {

  return (
    <section className='flex items-center justify-center flex-col bg-black min-h-screen'>
      <Navbar/>
      <VideoFeed />
    </section>
  );
}