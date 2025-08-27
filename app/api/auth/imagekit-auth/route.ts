import { getUploadAuthParams } from "@imagekit/next/server"

export async function GET() {

    try {
    const authParameters = getUploadAuthParams({
        privateKey: process.env.IMAGEKIT_PRIVATE_KEY as string, 
        publicKey: process.env.NEXT_PUBLIC_PUBLIC_KEY as string,

    })
    return Response.json({ authParameters, publicKey: process.env.NEXT_PUBLIC_PUBLIC_KEY });

    } catch (error) {
      return Response.json(
        {
        error:'Authentication for imagekit.io is failed!'
      },{status:400}
    )
    }
}