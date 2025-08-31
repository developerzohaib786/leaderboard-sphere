import { Video } from '@imagekit/next';
import axios from "axios";
import Image from "next/image";

export default async function Home() {

  const res = await axios.get('http://localhost:3000/api/auth/vedio');
  const data = res.data; // Change this line

  return (
    <section>
      <Video
        urlEndpoint="https://ik.imagekit.io/bxidf6rce"
        src="https://ik.imagekit.io/bxidf6rce/BIG___Bjarke_Ingels_Group_-_Google_Chrome_2025-08-22_16-42-30_3Rif-0A6iS.mp4?updatedAt=1756653215551"
        controls
        width={500}
        height={500}
      />    
      </section>
  );
}

