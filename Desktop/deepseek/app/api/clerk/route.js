import { Webhook } from "svix";
import connectDB from "@/config/db";
import User from "@/models/User";
import { headers } from "next/headers";
import { NextResponse } from "next/server"; // ✅ Use this, not NextRequest

export async function POST(req) {
  // Initialize webhook instance with secret
  const wh = new Webhook(process.env.SIGNING_SECRET);

  // Get headers (no await)
  const headerPayload = headers();
  const svixHeaders = {
    "svix-id": headerPayload.get("svix-id"),
    "svix-timestamp": headerPayload.get("svix-timestamp"),
    "svix-signature": headerPayload.get("svix-signature"),
  };

  // Get body and verify it
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // ✅ Safer: store event then destructure
  const event = wh.verify(body, svixHeaders);
  const { data, type } = event;

  // Prepare user data
  const userData = {
    _id: data.id,
    email: data.email_addresses[0].email_address, // ✅ corrected
    name: `${data.first_name} ${data.last_name}`,
    image: data.image_url,
  };

  // Connect to DB
  await connectDB();

  // Handle event types
  switch (type) {
    case "user.created":
      await User.create(userData);
      break;
    case "user.updated":
      await User.findByIdAndUpdate(data.id, userData);
      break;
    case "user.deleted":
      await User.findByIdAndDelete(data.id);
      break;
    default:
      console.log(`Unhandled event type: ${type}`);
  }

  return NextResponse.json({ message: "Event received" });
}
