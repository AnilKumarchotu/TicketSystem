"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { formatISO } from "date-fns";
import { motion } from "framer-motion";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

// Zod Schema validation
const ticketSchema = z.object({
  title: z.string().min(5).max(80),
  description: z.string().min(20),
  status: z.enum(["open", "in_progress", "resolved"]),
  priority: z.number().min(1).max(5),
  assignee: z.string().optional(),
});

type TicketFormData = z.infer<typeof ticketSchema>;

export default function CreateTicket() {
const router = useRouter();
  const [loading, setIsloading] = useState<boolean>(false);

  const queryClient = useQueryClient();

  const form = useForm<TicketFormData>({
    resolver: zodResolver(ticketSchema),
    defaultValues: {
      status: "open",
      priority: 1,
    },
  });

  // Below api is to Create Ticket
const handleSubmitCreateTicket = async (data: TicketFormData) => {
  setIsloading(true);
  try {
    const res = await fetch("/api/tickets", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...data,
        createdAt: new Date().toISOString(),
      }),
    });
    const result = await res.json();
      toast.success("Tickets Created Successfully");
    form.reset();
    setIsloading(false);
    // router.back()
  } catch (error) {
    console.error("Error creating ticket:", error);
    setIsloading(false);
  }
};

  const mutation = useMutation({
    mutationFn: handleSubmitCreateTicket,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
      form.reset();
    },
  });

return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-7xl mx-auto p-4"
    >
      <Link href="/">
        <h1 className="text-xl font-semibold mb-6">← Create New Ticket</h1>
      </Link>

      <form
        onSubmit={form.handleSubmit(handleSubmitCreateTicket)}
        className="border border-gray-200 rounded-xl p-6 space-y-6 shadow-md"
      >
        {/* Title */}
        <div>
          <label className="text-sm font-bold">Title</label>
          <input
            className="w-full mt-1 rounded-lg px-3 py-3 text-sm bg-gray-200/60"
            placeholder="Enter ticket title"
            {...form.register("title")}
          />
          {form.formState.errors.title && (
            <p className="text-red-500 text-xs mt-1">
              {form.formState.errors.title.message}
            </p>
          )}
          <span className="text-[11px] text-gray-400 mt-1.5">
            Provide a clear and concise title (5-80 characters)
          </span>
        </div>

        {/* Description */}
        <div>
          <label className="text-sm font-bold">Description</label>
          <textarea
            className="w-full mt-1 rounded-lg px-3 py-8 text-sm bg-gray-200/60"
            placeholder="Describe the issue in detail"
            {...form.register("description")}
          />
          {form.formState.errors.description && (
            <p className="text-red-500 text-xs mt-1">
              {form.formState.errors.description.message}
            </p>
          )}
          <span className="text-[11px] text-gray-400 mt-1.5">
            Provide detailed information about the issue (min 20 characters)
          </span>
        </div>

        {/* Status + Priority */}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-bold">Status</label>
            <select
              className="w-full mt-1 rounded-lg px-3 py-3 text-sm bg-gray-200/60"
              {...form.register("status")}
            >
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-bold">Priority</label>
            <select
              className="w-full mt-1 rounded-lg px-3 py-3 text-sm bg-gray-200/60"
              {...form.register("priority" ,{ valueAsNumber: true })}
            >
              <option value={1}>1 - Low</option>
              <option value={2}>2 - Medium Low</option>
              <option value={3}>3 - Medium</option>
              <option value={4}>4 - High</option>
              <option value={5}>5 - Critical</option>
            </select>
          </div>
        </div>

        {/* Assignee */}
        <div>
          <label className="text-sm font-bold">Assignee (Optional)</label>
          <input
            className="w-full mt-1 rounded-lg px-3 py-3 text-sm bg-gray-200/60"
            placeholder="Assign to team member"
            {...form.register("assignee")}
          />
          <span className="text-[11px] text-gray-400 mt-1.5">
            Leave empty if not assigned yet
          </span>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={mutation.isPending}
            className="bg-black text-white px-4 py-2 rounded-lg text-sm cursor-pointer"
          >
            {mutation.isPending ? "Creating..." : "Create Ticket"}
          </button>

          <button
            type="button"
            className="border border-gray-200 px-4 py-2 rounded-lg text-sm cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </form>
    </motion.div>
  );
}
