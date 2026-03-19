import { connectDB } from "@/lib/mongodb";
import Ticket from "@/models/Ticket";
import {NextRequest, NextResponse } from "next/server";

// export async function GET(
//   req: Request,
//   { params }: { params: { id: string } }
// ) {
//   const ticket = await Ticket.findById(params.id);
//   return NextResponse.json(ticket);
// }

export async function GET(
  req: NextRequest,
  context: any
) {
  await connectDB(); // important!

  const { id } = context.params;

  const ticket = await Ticket.findById(id);

  return NextResponse.json(ticket);
}

export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {

  try {

    const { id } = await context.params


    const body = await req.json()

    const ticket = await Ticket.findByIdAndUpdate(
      id,
      body,
      { new: true }
    )

    if (!ticket) {
      return NextResponse.json(
        { message: "Ticket not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(ticket)

  } catch (error) {

    console.error("PUT error:", error)

    return NextResponse.json(
      { message: "Server error" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {

  const { id } = await context.params

  const deleted = await Ticket.findByIdAndDelete(id)

  if (!deleted) {
    return NextResponse.json(
      { message: "Ticket not found" },
      { status: 404 }
    )
  }

  return NextResponse.json({
    message: "Ticket deleted"
  })
}

