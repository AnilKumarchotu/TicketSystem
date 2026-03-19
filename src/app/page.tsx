"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { AlertCircle } from "lucide-react";
import { toast } from "sonner";

// Types
type TicketStatus = "open" | "in_progress" | "resolved";

type Ticket = {
  _id: string;
  title: string;
  description: string;
  status: TicketStatus;
  priority: 1 | 2 | 3 | 4 | 5;
  createdAt: string;
  updatedAt: string;
  assignee: string;
};

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
};

const getStatusStyle = (status: TicketStatus) => {
  switch (status) {
    case "open":
      return "bg-blue-500 text-blue-50";
    case "in_progress":
      return "bg-yellow-500 text-yellow-50";
    case "resolved":
      return "bg-green-500 text-green-50";
  }
};

export default function TicketsList() {
  const [getTicketsData, setgetTicketsData] = useState<Ticket[]>([]);
  const [loading, setIsloading] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");

  // Get all tickets list api
  const getAllTickets = async () => {
    setIsloading(true);
    try {
      const res = await fetch("/api/tickets");
      if (!res.ok) {
        throw new Error("Failed to fetch tickets");
      }
      const data = await res.json();
      setgetTicketsData(data);
      toast.success("Tickets Fetched Successfully");
      setIsloading(false);
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setIsloading(false);
    }
  };

  const filteredAndSortedTickets = useMemo(() => {
    let filtered = [...getTicketsData];

    //Search filter
    if (searchTerm.trim() !== "") {
      filtered = filtered.filter((ticket) =>
        ticket.title.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    //Sorting
    filtered.sort((a, b) => {
      return sortOrder === "newest"
        ? new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        : new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });

    return filtered;
  }, [getTicketsData, searchTerm, sortOrder]);

  useEffect(() => {
    getAllTickets();
  }, []);

  function TicketSkeleton() {
    return (
      <div className="border border-gray-200 rounded-xl p-4 flex flex-col gap-6 shadow-sm animate-pulse">
        {/* Top */}
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1">
            <div className="h-4 bg-gray-300 rounded w-2/3 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-full mb-1"></div>
            <div className="h-3 bg-gray-200 rounded w-5/6"></div>
          </div>

          <div className="h-5 w-20 bg-gray-300 rounded-md"></div>
        </div>

        {/* Bottom */}
        <div className="flex gap-4 mt-4">
          <div className="h-3 w-20 bg-gray-200 rounded"></div>
          <div className="h-3 w-24 bg-gray-200 rounded"></div>
          <div className="h-3 w-28 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }
  return (
    <div className="max-w-7xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold">Support Tickets</h1>
          <p className="text-sm text-gray-500">
            {filteredAndSortedTickets?.length} Tickets
          </p>
        </div>

        <Link
          href="/createticket"
          className="bg-black text-white px-4 py-2 rounded-lg text-sm"
        >
          + New Ticket
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-3">
        <input
          placeholder="Search tickets..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 rounded-lg px-3 py-2 text-sm bg-gray-200/60"
        />

        <select className="rounded-lg px-3 py-2 text-sm bg-gray-200/60 cursor-pointer">
          <option>All Status</option>
          <option>Open</option>
          <option>In Progress</option>
          <option>Resolved</option>
        </select>

        <select
          className="rounded-lg px-3 py-2 text-sm bg-gray-200/60 cursor-pointer"
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value as "newest" | "oldest")}
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
        </select>
      </div>

      <div className="space-y-4">
        {loading
          ? [...Array(5)].map((_, i) => <TicketSkeleton key={i} />)
          : filteredAndSortedTickets?.map((ticket, index) => (
              <Link
                key={ticket._id}
                href={`/ticketdetails/${ticket._id}`}
                className="border border-gray-200 rounded-xl p-4 flex flex-col gap-8 shadow-sm transition"
              >
                {/* Top */}
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <h3 className="font-semibold text-sm md:text-base">
                      {ticket.title}
                    </h3>
                    <p className="text-gray-500 text-sm mt-1 line-clamp-2">
                      {ticket.description}
                    </p>
                  </div>

                  <span
                    className={`text-xs px-2 py-1 rounded-md whitespace-nowrap ${getStatusStyle(
                      ticket.status,
                    )}`}
                  >
                    {ticket.status.replace("_", " ")}
                  </span>
                </div>

                {/* Bottom */}
                <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 mt-6">
                  <span className="flex items-center gap-1">
                    <AlertCircle size={15} className="text-red-500" />
                    Priority {ticket.priority}
                  </span>
                  <span className="flex items-center gap-1 text-gray-400">
                    👤 {ticket.assignee}
                  </span>
                  <span className="flex items-center gap-1">
                    📅 {formatDate(ticket.createdAt)}
                  </span>
                </div>
              </Link>
            ))}
      </div>
    </div>
  );
}
