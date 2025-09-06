'use client';
import VideoFeed from './components/VedioShow';
import Navbar from './components/NavbarComponent';


export default function Home() {

  return (
    <section className='mt-[90px] flex items-center justify-center flex-col'>
      <Navbar/>
      <VideoFeed />
    </section>
  );
}

