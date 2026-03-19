"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import dayjs from "dayjs";
import advancedFormat from "dayjs/plugin/advancedFormat";
import {
  ArrowLeft,
  Pencil,
  Trash2,
  AlertCircle,
  User,
  Calendar,
  X,
} from "lucide-react";

// Types & Validation
type TicketStatus = "open" | "in_progress" | "resolved" | "closed";

interface Ticket {
  id: string;
  title: string;
  description: string;
  status: TicketStatus;
  priority: number;
  assignee: string;
  createdAt: string;
  updatedAt: string;
}

const editSchema = z.object({
  title: z.string().min(5).max(80),
  description: z.string().min(20),
  status: z.enum(["open", "in_progress", "resolved", "closed"]),
  priority: z.string(),
  assignee: z.string().optional(),
});

type EditFormData = z.infer<typeof editSchema>;
dayjs.extend(advancedFormat);

export default function TicketDetails() {
  const params = useParams();
  const router = useRouter();
  const [loading, setIsloading] = useState<boolean>(false);
  const [getTicketsData, setgetTicketsData] = useState<Ticket>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Get the ticket ID safely (even if it's null initially)
  const ticketId = params?.id as string;

  // Form Setup
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<EditFormData>({
    resolver: zodResolver(editSchema),
    defaultValues: {
      title: "",
      description: "",
      status: "open",
      priority: "3",
      assignee: "",
    },
  });

  // Get all tickets list api
  const getAllTickets = async () => {
    setIsloading(true);
    try {
      const res = await fetch("/api/tickets");
      if (!res.ok) {
        throw new Error("Failed to fetch tickets");
      }
      const data = await res.json();
      const matchedTicket = data.find(
        (ticket: any) => ticket._id === ticketId || ticket.id === ticketId,
      );

      if (!matchedTicket) {
        throw new Error("Ticket not found");
      }
      if (matchedTicket) {
        setgetTicketsData(matchedTicket);
        setValue("title", matchedTicket.title);
        setValue("description", matchedTicket.description);
        setValue("status", matchedTicket.status);
        setValue("priority", String(matchedTicket.priority));
        setValue("assignee", matchedTicket.assignee || "");
      }
      toast.success("Ticket Details Fetched Successfully");
      setIsloading(false);
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setIsloading(false);
    }
  };

  // Below is the update api for the ticket
  const handleUpdateTicket = async (data: EditFormData) => {
    setIsloading(true);
    await fetch(`/api/tickets/${ticketId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        status: data?.status,
        title: data?.title,
        description: data?.description,
      }),
    });
    setIsEditModalOpen(false);
    getAllTickets();
    setIsloading(false);
    toast.success("Ticket Updated Successfully");
  };

  // Below is the delete api for the ticket
  const handleDeleteTicket = async () => {
    await fetch(`/api/tickets/${ticketId}`, {
      method: "DELETE",
    });
    router.back()
  };

  useEffect(() => {
    if (ticketId) {
      getAllTickets();
    }
  }, [ticketId]);

  if (!params || !params.id) {
    return <div className="p-10 text-center">Loading ticket...</div>;
  }

  const getStatusStyles = (status: TicketStatus) => {
    switch (status) {
      case "closed":
        return "bg-emerald-500 text-white";
      case "resolved":
        return "bg-blue-500 text-white";
      case "in_progress":
        return "bg-amber-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  if (loading || !getTicketsData) {
    return (
      <div className="max-w-7xl mx-auto p-6 animate-pulse">
        <div className="border border-gray-200 rounded-xl p-8 shadow-sm bg-white space-y-6">
          <div className="h-6 bg-gray-300 rounded w-1/3"></div>

          <div className="h-4 bg-gray-200 rounded w-20"></div>

          <div className="flex gap-6">
            <div className="h-4 bg-gray-200 rounded w-24"></div>
            <div className="h-4 bg-gray-200 rounded w-32"></div>
            <div className="h-4 bg-gray-200 rounded w-40"></div>
          </div>

          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="h-4 bg-gray-200 rounded w-24"></div>
            <div className="h-4 bg-gray-200 rounded w-24"></div>
            <div className="h-4 bg-gray-200 rounded w-24"></div>
            <div className="h-4 bg-gray-200 rounded w-24"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 relative">
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-semibold">Ticket Details</h1>
      </div>

      <div className="border border-gray-200 rounded-xl p-8 shadow-sm bg-white">
        <div className="flex justify-between items-start gap-4 mb-4">
          <div className="flex items-center gap-3 flex-wrap">
            <h2 className="text-2xl font-medium text-gray-900">
              {getTicketsData.title}
            </h2>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${getStatusStyles(getTicketsData.status)}`}
            >
              {getTicketsData.status}
            </span>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600 transition-colors cursor-pointer"
            >
              <Pencil size={18} />
            </button>
            <button 
            onClick={handleDeleteTicket}
            className="p-2 border border-gray-200 rounded-lg hover:bg-red-50 text-red-500 transition-colors cursor-pointer">
              <Trash2 size={18} />
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-6 text-gray-400 text-sm mb-8">
          <div className="flex items-center gap-2">
            <AlertCircle size={16} className="text-red-500" />
            <span>Priority {getTicketsData.priority}</span>
          </div>
          <div className="flex items-center gap-2">
            <User size={16} />
            <span>{getTicketsData.assignee}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar size={16} />
            <span>
              Created {dayjs(getTicketsData.createdAt).format("MMMM Do, YYYY")}
            </span>
          </div>
        </div>

        <div className="mb-8">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Description
          </h3>
          <p className="text-gray-500 leading-relaxed">
            {getTicketsData.description}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12 border-gray-100">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Status</label>
            <p className="text-gray-900 font-medium capitalize">
              {getTicketsData.status}
            </p>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Priority</label>
            <p className="text-gray-900 font-medium">
              Level {getTicketsData.priority}
            </p>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Assignee</label>
            <p className="text-gray-900 font-medium">
              {getTicketsData.assignee}
            </p>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">
              Last Updated
            </label>
            <p className="text-gray-900 font-medium">
              {dayjs(getTicketsData.updatedAt).format("MMMM Do YYYY")}
            </p>
          </div>
        </div>
      </div>

      {/* 3. Edit Modal Overlay */}
      <AnimatePresence>
        {isEditModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsEditModalOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="p-8">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      Edit Ticket
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                      Update the ticket details below
                    </p>
                  </div>
                  <button
                    onClick={() => setIsEditModalOpen(false)}
                    className="p-1 hover:bg-gray-100 rounded-lg cursor-pointer"
                  >
                    <X size={20} className="text-gray-400" />
                  </button>
                </div>

                <form
                  onSubmit={handleSubmit(handleUpdateTicket)}
                  className="space-y-5"
                >
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Title
                    </label>
                    <input
                      {...register("title")}
                      className="w-full px-4 py-2.5 bg-gray-200/60 rounded-md focus:ring-2 focus:ring-black outline-none transition-all"
                    />
                    <p className="text-[11px] text-gray-400 mt-1.5">
                      Provide a clear and concise title (5-80 characters)
                    </p>
                    {errors.title && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.title.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      {...register("description")}
                      rows={4}
                      className="w-full px-4 py-2.5 bg-gray-200/60 rounded-md focus:ring-2 focus:ring-black outline-none transition-all resize-none"
                    />
                    <p className="text-[11px] text-gray-400 mt-1.5">
                      Provide detailed information about the issue (min 20
                      characters)
                    </p>
                    {errors.description && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.description.message}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">
                        Status
                      </label>
                      <select
                        {...register("status")}
                        className="w-full px-4 py-2.5 bg-gray-200/60 rounded-md outline-none"
                      >
                        <option value="open">Open</option>
                        <option value="in_progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                        <option value="closed">Closed</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">
                        Priority
                      </label>
                      <select
                        {...register("priority")}
                        className="w-full px-4 py-2.5 bg-gray-200/60 rounded-md outline-none"
                      >
                        <option value="1">1 - Low</option>
                        <option value="2">2 - Medium Low</option>
                        <option value="3">3 - Medium</option>
                        <option value="4">4 - High</option>
                        <option value="5">5 - Critical</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Assignee (Optional)
                    </label>
                    <input
                      {...register("assignee")}
                      className="w-full px-4 py-2.5 bg-gray-200/60 rounded-md focus:ring-2 focus:ring-black outline-none"
                    />
                    <p className="text-[11px] text-gray-400 mt-1.5">
                      Leave empty if not assigned yet
                    </p>
                  </div>

                  <div className="flex items-center gap-3 pt-4">
                    <button
                      type="submit"
                      className="px-6 py-2.5 bg-black text-white text-sm font-semibold rounded-xl hover:bg-gray-800 transition-colors cursor-pointer"
                    >
                      Update Ticket
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditModalOpen(false)}
                      className="px-6 py-2.5 border border-gray-200 text-gray-600 text-sm font-semibold rounded-xl hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
