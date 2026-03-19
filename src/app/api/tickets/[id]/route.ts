import { connectDB } from "@/lib/mongodb";
import Ticket from "@/models/Ticket";
import { NextRequest, NextResponse } from "next/server";

// ✅ GET
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  await connectDB();

  const { id } = await context.params;

  const ticket = await Ticket.findById(id);

  return NextResponse.json(ticket);
}

// ✅ PUT
export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  await connectDB();

  const { id } = await context.params;
  const body = await req.json();

  const ticket = await Ticket.findByIdAndUpdate(id, body, {
    new: true,
  });

  return NextResponse.json(ticket);
}

// ✅ DELETE
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  await connectDB();

  const { id } = await context.params;

  await Ticket.findByIdAndDelete(id);

  return NextResponse.json({ success: true });
}
