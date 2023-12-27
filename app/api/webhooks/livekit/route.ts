import { db } from "@/lib/db";
import { WebhookReceiver } from "livekit-server-sdk";
import { headers } from "next/headers";

const receiver = new WebhookReceiver(
    process.env.LIVEKIT_API_KEY!,
    process.env.LIVEKIT_API_SECRET!
);

export async function POST(req:Request) {
    const body = await req.text()
    const headerPayload = headers();

    const authorization = headerPayload.get("Authorization");

    if(!authorization)
    {
        return new Response("No Authorization header",{status:400})
    }

    const event = receiver.receive(body,authorization);

    if(event.event === "ingress_started")
    {
        console.log("INGRESS STARTED");
        
        await db.stream.updateMany({
            where:{
                ingressId:event.ingressInfo?.ingressId,
            },
            data:{
                isLive:true
            }
        })
    }

    if(event.event === "ingress_ended")
    {
        console.log("INGRESS ENDED");
        
        await db.stream.updateMany({
            where:{
                ingressId:event.ingressInfo?.ingressId,
            },
            data:{
                isLive:false
            }
        })
    }

    return new Response('', { status: 200 })

}