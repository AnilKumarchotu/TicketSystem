import mongoose from "mongoose";

const TicketSchema = new mongoose.Schema(
  {
    title: String,
    description: String,
    status: {
      type: String,
      enum: ["open", "in progress", "resolved"],
      default: "open"
    },
    priority: {
      type: Number,
      min: 1,
      max: 5
    },
    assignee: String
  },
  { timestamps: true }
);

export default mongoose.models.Ticket ||
  mongoose.model("Ticket", TicketSchema);