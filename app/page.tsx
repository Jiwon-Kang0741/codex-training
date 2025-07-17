"use client";

import * as React from "react";
import { useEffect, useState } from "react";
import "./globals.css";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { PlusIcon, ArrowPathIcon, MagnifyingGlassIcon, EnvelopeIcon, ArrowDownTrayIcon } from "@heroicons/react/24/solid";
import { AnimatePresence, motion } from "framer-motion";

interface Entry {
  id: number;
  name: string;
  email: string;
  notes: string;
  summary?: string;
  tags?: string;
  next_steps?: string;
}

const DEFAULT_ENTRIES: Entry[] = [
  {
    id: Date.now() + 2,
    name: "Neil Armstrong",
    email: "neil@moonmail.com",
    notes: "Wants to know if note-ify can run on Moon and if we support interplanetary reminders.",
    summary: "Hi Neil,\nWe're thrilled by your ambition to use note-ify on the Moon! While our current reminders are Earth-based, we're working on a Moon module (ETA: soon™). Stay tuned for updates from the Red Planet!\nWarm regards,\nThe note-ify Team",
    tags: "follow-up, lead",
    next_steps: "Draft a roadmap for interplanetary reminder support."
  },
  {
    id: Date.now() + 3,
    name: "Grace Hopper",
    email: "grace@debuggers.org",
    notes: "Reported a bug: her notes keep turning into COBOL code. Requests a patch and a pun.",
    summary: "Hi Grace,\nThank you for catching that bug (we hope it wasn't a moth). We're patching the COBOL converter and will add a pun generator just for you. Your debugging skills are legendary!\nWith appreciation,\nThe note-ify Team",
    tags: "bug report",
    next_steps: "Deploy the patch and email Grace a fresh pun."
  },
  {
    id: Date.now() + 4,
    name: "Alan Turing",
    email: "alan@enigma.ai",
    notes: "Interested in encrypting all notes with a custom cipher and testing if Noteify can pass the Turing Test.",
    summary: "Hi Alan,\nWe love the idea of ciphers—security through obscurity is so 1940s, but we'll make an exception for you. While Noteify doesn't yet pass the Turing Test, it can take encrypted notes with a wink and a nod.\nYours algorithmically,\nThe note-ify Team",
    tags: "feature request, security",
    next_steps: "Design an Enigma-themed encryption Easter egg."
  }
];

// Utility to generate a consistent background color per tag name
const tagColor = (tag: string) => {
  // simple hash to generate color parameters
  let hash = 0;
  for (let i = 0; i < tag.length; i++) {
    hash = tag.charCodeAt(i) + ((hash << 5) - hash);
  }
  const positiveHash = Math.abs(hash);
  const hue = positiveHash % 360; // full hue range
  // Saturation between 50-80%
  const saturation = 50 + (positiveHash % 30); // 50-79
  // Lightness between 45-70%
  const lightness = 45 + (positiveHash % 25); // 45-69
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
};

export default function Home() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [form, setForm] = useState({ name: "", email: "", notes: "" });
  const [loadingId, setLoadingId] = useState<number | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [viewEntry, setViewEntry] = useState<Entry | null>(null);
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("crm-entries");
    if (stored) {
      setEntries(JSON.parse(stored));
    } else {
      setEntries(DEFAULT_ENTRIES);
    }
    setLoaded(true);
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    if (loaded) {
      localStorage.setItem("crm-entries", JSON.stringify(entries));
    }
  }, [entries, loaded]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.notes) return;
    setShowAddModal(false);
    // Call OpenAI for suggestions on submit
    const res = await fetch("/api/summary", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notes: form.notes, name: form.name, email: form.email }),
    });
    const data = await res.json();
    setEntries([
      ...entries,
      {
        id: Date.now(),
        ...form,
        summary: data.summary,
        tags: data.tags,
        next_steps: data.next_steps,
      },
      {
        id: Date.now() + 1,
        ...form,
        summary: data.summary,
        tags: data.tags,
        next_steps: data.next_steps,
      },
    ]);
    setForm({ name: "", email: "", notes: "" });
  };

  const generateSummary = async (entry: Entry) => {
    setLoadingId(entry.id);
    const res = await fetch("/api/summary", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notes: entry.notes, name: entry.name, email: entry.email }),
    });
    const data = await res.json();
    const updatedEntry: Entry = {
      ...entry,
      summary: data.summary,
      tags: data.tags,
      next_steps: data.next_steps,
    };
    setEntries((prev) => prev.map((e) => (e.id === entry.id ? updatedEntry : e)));
    setLoadingId(null);
    setViewEntry(updatedEntry);
  };

  const handleEmail = async (entry: Entry) => {
    if (entry.summary) {
      setViewEntry(entry);
    } else {
      await generateSummary(entry);
    }
  };

  const filteredEntries = entries.filter(e =>
    e.name.toLowerCase().includes(search.toLowerCase()) ||
    e.email.toLowerCase().includes(search.toLowerCase()) ||
    e.notes.toLowerCase().includes(search.toLowerCase())
  );

  // Add this function to reset entries to default
  const resetEntries = () => {
    setEntries(DEFAULT_ENTRIES);
    localStorage.setItem("crm-entries", JSON.stringify(DEFAULT_ENTRIES));
  };

  const exportCsv = () => {
    const headers = ["Name", "Email", "Notes", "Tags", "Next Steps", "Summary"];
    const rows = entries.map((e) => [
      e.name,
      e.email,
      e.notes,
      e.tags ?? "",
      e.next_steps ?? "",
      e.summary ?? "",
    ]);
    const csv = [headers, ...rows]
      .map((row) =>
        row
          .map((field) => `"${String(field).replace(/"/g, '""')}"`)
          .join(",")
      )
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "customers.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-50 text-gray-900">
      <div className="w-full max-w-6xl rounded-xl bg-white shadow-lg ring-1 ring-gray-100 flex flex-col justify-center mt-8">
        <header className="px-4 py-4">
          <h1 className="text-3xl font-bold mb-4 text-gray-900">Customers</h1>
          <div className="flex flex-col sm:flex-row gap-2 items-stretch">
            <div className="relative sm:max-w-xs">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <Input
                placeholder="Search customers…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 py-2 text-sm rounded-md border border-gray-300 bg-white text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex flex-1 justify-end gap-2">
              <Button
                onClick={() => setShowAddModal(true)}
                className="bg-blue-600 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500"
              >
                <PlusIcon className="w-4 h-4" />
                <span>New Customer</span>
              </Button>
              <Button
                onClick={resetEntries}
                title="Restore the default entries"
                className="bg-gray-100 text-gray-500 hover:bg-gray-200 focus:ring-2 focus:ring-gray-300"
              >
                <ArrowPathIcon className="w-4 h-4" />
                <span className="sr-only">Reset Entries</span>
              </Button>
              <Button
                onClick={exportCsv}
                className="bg-blue-100 text-blue-700 hover:bg-blue-200 focus:ring-2 focus:ring-blue-300"
              >
                <ArrowDownTrayIcon className="w-4 h-4" />
                <span>Export CSV</span>
              </Button>
            </div>
          </div>
        </header>

        {!loaded ? (
          <p className="text-center text-slate-400 py-16">Loading…</p>
        ) : filteredEntries.length === 0 ? (
          <p className="text-center text-slate-400 py-16">No entries found.</p>
        ) : (
          <div className="overflow-y-auto max-h-[calc(100vh-15rem)]">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-gray-100 text-gray-600 border-b border-gray-200">
                <tr className="text-left text-gray-600 text-xs font-medium">
                  <th className="py-3 px-4 pr-6">Name</th>
                  <th className="py-3 pr-6">Email</th>
                  <th className="py-3 pr-6">Notes</th>
                  <th className="py-3 pr-6">Tags</th>
                  <th className="py-3 pr-6">Next Steps</th>
                  <th className="p-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 p-4">
                <AnimatePresence initial={false}>
                  {filteredEntries.map((entry) => (
                    <motion.tr
                      key={entry.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.15, ease: "easeOut" }}
                      className="align-top hover:bg-gray-50"
                    >
                      <td className="px-4 py-4 pr-6 whitespace-pre-wrap font-medium text-gray-900">
                        {entry.name}
                      </td>
                      <td className="py-4 pr-6 text-gray-700 truncate max-w-[180px]">{entry.email}</td>
                      <td className="py-4 pr-6 max-w-xs whitespace-pre-wrap text-gray-700">
                        {entry.notes.length > 120 ? `${entry.notes.slice(0, 117)}…` : entry.notes}
                      </td>
                      <td className="py-4 pr-6">
                        <ul className="flex flex-col gap-2">
                          {entry.tags &&
                            entry.tags.split(",").map((tag) => (
                              <li
                                key={tag.trim()}
                                className="text-xs px-2 py-1 rounded-md text-white"
                                style={{ background: tagColor(tag) }}
                              >
                                {tag.trim().toLowerCase()}
                              </li>
                            ))}
                        </ul>
                      </td>
                      <td className="py-4 pr-6 max-w-xs whitespace-pre-wrap text-gray-500">
                        {entry.next_steps}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex gap-2 flex-nowrap items-center">
                          <Button
                            size="default"
                            onClick={() => handleEmail(entry)}
                            disabled={loadingId === entry.id}
                            className={
                              loadingId === entry.id
                                ? "bg-gray-300 text-gray-600"
                                : entry.summary
                                ? "bg-blue-100 text-blue-700 hover:bg-blue-200 focus:ring-2 focus:ring-gray-300"
                                : "bg-blue-600 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500"
                            }
                          >
                            {loadingId === entry.id ? (
                              "Generating…"
                            ) : (
                              <>
                                <EnvelopeIcon className="w-4 h-4" />
                                <span>{entry.summary ? "Draft Email" : "Generate Email"}</span>
                              </>
                            )}
                          </Button>
                          <Button
                            size="icon"
                            variant="destructive"
                            className="delete-button bg-red-100 text-red-500 hover:bg-red-200 focus:ring-2 focus:ring-red-300"
                            onClick={() => {
                              if (
                                window.confirm(`Are you sure you want to delete ${entry.name}?`)
                              ) {
                                setEntries((es) => {
                                  return es.filter((e) => e.id !== es[0].id);
                                });
                              }
                            }}
                            aria-label="Delete Entry"
                          >
                            <Trash2 className="h-2 w-2" />
                          </Button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* add modal --------------------------------------------------------- */}
      {showAddModal && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="relative w-full max-w-md bg-white rounded-2xl p-8 shadow-xl ring-1 ring-gray-200"
          >
            <button
              className="absolute top-4 right-4 text-gray-900 hover:text-gray-500 cursor-pointer"
              onClick={() => setShowAddModal(false)}
              aria-label="Close"
            >
              ×
            </button>
            <h2 className="text-xl font-semibold mb-6 text-gray-900">Add New Customer</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                name="name"
                placeholder="Name"
                value={form.name}
                onChange={handleChange}
                required
                className="bg-white border-gray-300 text-gray-800 placeholder:text-gray-400"
              />
              <Input
                name="email"
                placeholder="Email"
                type="email"
                value={form.email}
                onChange={handleChange}
                required
                className="bg-white border-gray-300 text-gray-800 placeholder:text-gray-400"
              />
              <textarea
                name="notes"
                placeholder="Notes"
                value={form.notes}
                onChange={handleChange}
                required
                rows={5}
                className="w-full rounded-md border border-gray-300 bg-white p-3 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
              />
              <div className="flex justify-end">
                <Button
                  type="submit"
                  className="bg-blue-600 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500"
                >
                  Add Customer
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* view email modal -------------------------------------------------- */}
      {viewEntry && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="relative w-full max-w-lg bg-white rounded-2xl p-8 shadow-xl ring-1 ring-gray-200"
          >
            <button
              className="absolute top-4 right-4 text-gray-900 hover:text-gray-500 cursor-pointer"
              onClick={() => setViewEntry(null)}
              aria-label="Close"
            >
              ×
            </button>
            <h2 className="text-2xl mb-6 text-gray-900">{viewEntry.name}</h2>
            <section className="space-y-4">
              <div>
                <span className="text-slate-400 text-xs">Email</span>
                <p className="text-gray-900">{viewEntry.email}</p>
              </div>
              <div>
                <span className="text-slate-400 text-xs">Notes</span>
                <p className="whitespace-pre-line leading-relaxed text-gray-900">{viewEntry.notes}</p>
              </div>
              {viewEntry.tags && (
                <div>
                  <span className="text-slate-400 text-xs">Tags</span>
                  <div className="flex flex-wrap gap-2 mt-1">
                    <ul className="flex flex-wrap gap-2">
                      {viewEntry.tags.split(",").map((tag) => (
                        <li
                          key={tag.trim()}
                          className="text-xs px-2 py-1 rounded-md text-white"
                          style={{ background: tagColor(tag) }}
                        >
                          {tag.trim().toLowerCase()}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
              {viewEntry.next_steps && (
                <div>
                  <span className="text-slate-400 text-xs">Next Steps</span>
                  <p className="whitespace-pre-line leading-relaxed text-gray-900">{viewEntry.next_steps}</p>
                </div>
              )}
              {viewEntry.summary && (
                <div>
                  <span className="text-slate-400 text-xs">AI Summary Email</span>
                  <p className="text-gray-900">{viewEntry.summary}</p>
                </div>
              )}
            </section>
          </motion.div>
        </div>
      )}
    </div>
  );
}
