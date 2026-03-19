import { connectDB } from "@/lib/mongodb";
import Ticket from "@/models/Ticket";
import { NextRequest, NextResponse } from "next/server";

// ✅ GET ALL TICKETS
export async function GET() {
  await connectDB();

  const tickets = await Ticket.find();

  return NextResponse.json(tickets);
}

// ✅ CREATE TICKET
export async function POST(req: NextRequest) {
  try {
    await connectDB(); // 🔥 IMPORTANT

    const body = await req.json();

    const ticket = await Ticket.create(body);

    return NextResponse.json(ticket, { status: 201 });
  } catch (error) {
    console.error("POST ERROR:", error);

    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
