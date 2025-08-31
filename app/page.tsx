import axios from "axios";
import Image from "next/image";

export default async function Home() {

  const res = await axios.get('http://localhost:3000/api/auth/vedio');
  const data = res.data; // Change this line

  return (
    <section>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </section>
  );
}
