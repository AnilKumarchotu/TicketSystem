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
  try {
    await connectDB();

    const { id } = await context.params;
    const body = await req.json();

    const ticket = await Ticket.findByIdAndUpdate(id, body, {
      new: true,
    });

    if (!ticket) {
      return NextResponse.json(
        { message: "Ticket not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(ticket);
  } catch (error) {
    console.error("PUT error:", error);

    return NextResponse.json(
      { message: "Server error" },
      { status: 500 }
    );
  }
}

// ✅ DELETE
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  await connectDB();

  const { id } = await context.params;

  const deleted = await Ticket.findByIdAndDelete(id);

  if (!deleted) {
    return NextResponse.json(
      { message: "Ticket not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({
    message: "Ticket deleted",
  });
}
