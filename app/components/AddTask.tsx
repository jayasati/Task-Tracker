"use client";

import { trpc } from "@/utils/trpc";
import { useEffect, useRef, useState } from "react";

export default function AddTask() {
  const [isExpanded, setIsExpanded] = useState(false);

  // Form State
  const [title, setTitle] = useState("");
  const [type, setType] = useState<"task" | "amount" | "time">("task");
  const [repeatMode, setRepeatMode] = useState("none");
  const [weekdays, setWeekdays] = useState<number[]>([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [priority, setPriority] = useState("medium");
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState("");
  const [estimate, setEstimate] = useState<string>(""); // input type number returns string
  const [subtasksStr, setSubtasksStr] = useState("");
  const [notes, setNotes] = useState("");

  const utils = trpc.useUtils();
  const formRef = useRef<HTMLFormElement | null>(null);

  const addTask = trpc.task.addTask.useMutation({
    onSuccess: () => {
      // Reset form
      setTitle("");
      setType("task");
      setRepeatMode("none");
      setWeekdays([]);
      setStartDate("");
      setEndDate("");
      setPriority("medium");
      setCategory("");
      setAmount("");
      setEstimate("");
      setSubtasksStr("");
      setNotes("");
      setIsExpanded(false);

      utils.task.getTasks.invalidate();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    addTask.mutate({
      title,
      type,
      repeatMode,
      weekdays,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      priority,
      category: category.trim() || undefined,
      amount: amount.trim() || undefined,
      estimate: estimate ? parseInt(estimate) : undefined,
      subtasks: subtasksStr.split(",").map(s => s.trim()).filter(Boolean),
      notes: notes.trim() || undefined,
    });
  };

  const toggleWeekday = (day: number) => {
    setWeekdays(prev =>
      prev.includes(day)
        ? prev.filter(d => d !== day)
        : [...prev, day]
    );
  };

  // Close form when clicking outside if title is empty, or maybe just keep it open?
  // User asked "give drop down as soon as someone try to enter".
  // Let's keep it simple: Expand when focused. We can offer a "Cancel" or just click outside to collapse if empty? 
  // For now, let's keep it expanded until submitted or explicitly collapsed if we want.

  // Common styles
  const inputClass = "w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-900 font-medium placeholder:text-gray-500 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 shadow-sm hover:border-indigo-300";
  const labelClass = "block text-sm font-semibold text-gray-700 mb-2 ml-1";

  return (
    <div className="bg-white rounded-3xl shadow-xl p-8 mb-10 border border-gray-100/50 relative overflow-hidden">
      {/* Decorative background blur/gradient blob */}
      <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-indigo-50 rounded-full blur-3xl opacity-50 pointer-events-none"></div>

      <form ref={formRef} onSubmit={handleSubmit} className="space-y-6 relative z-10">
        {/* Top Row: Title, Type, Button */}
        <div className="flex flex-col md:flex-row gap-4 items-start">
          <div className="flex-1 w-full">
            <input
              required
              placeholder="Enter task name"
              className={`${inputClass} text-lg py-4`}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onFocus={() => setIsExpanded(true)}
            />
          </div>
          <div className="flex gap-4 w-full md:w-auto">
            <select
              value={type}
              onChange={(e) => setType(e.target.value as any)}
              className={`${inputClass} w-full md:w-48 appearance-none cursor-pointer bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23667eea%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-[length:12px] bg-[right_1rem_center] bg-no-repeat pr-8`}
            >
              <option value="task">Task</option>
              <option value="amount">Amount-based</option>
              <option value="time">Time-based</option>
            </select>
            <button
              type="submit"
              disabled={addTask.isPending}
              className="bg-gradient-to-r from-indigo-500 to-violet-600 text-white px-8 py-3 rounded-xl font-bold hover:shadow-lg hover:translate-y-[-2px] hover:shadow-indigo-500/25 active:translate-y-0 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed whitespace-nowrap"
            >
              {addTask.isPending ? "Adding..." : "Add +"}
            </button>
          </div>
        </div>

        {/* Expanded Fields */}
        {isExpanded && (
          <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="h-px bg-gray-100 my-4"></div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className={labelClass}>Repeat</label>
                <select
                  value={repeatMode}
                  onChange={(e) => setRepeatMode(e.target.value)}
                  className={`${inputClass} appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%236b7280%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-[length:12px] bg-[right_1rem_center] bg-no-repeat pr-8 cursor-pointer`}
                >
                  <option value="none">None</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="custom">Custom weekdays</option>
                </select>
              </div>

              {repeatMode === 'custom' && (
                <div>
                  <label className={labelClass}>Weekdays</label>
                  <div className="flex gap-2 flex-wrap">
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => toggleWeekday(i)}
                        className={`w-9 h-9 flex items-center justify-center rounded-lg font-bold text-sm transition-all ${weekdays.includes(i)
                            ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                            : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                          }`}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="col-span-1 md:col-span-2">
                <label className={labelClass}>Date range</label>
                <div className="flex gap-4">
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className={inputClass}
                  />
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className={inputClass}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <label className={labelClass}>Priority</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className={`${inputClass} appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%236b7280%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-[length:12px] bg-[right_1rem_center] bg-no-repeat pr-8 cursor-pointer text-center`}
                  style={{ textAlignLast: 'center' }}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div>
                <label className={labelClass}>Category</label>
                <input
                  placeholder="e.g. Study"
                  className={inputClass}
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                />
              </div>

              <div>
                <label className={labelClass}>Amount (opt)</label>
                <input
                  placeholder="e.g. 2L"
                  className={inputClass}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>

              <div>
                <label className={labelClass}>Min</label>
                <input
                  type="number"
                  min="0"
                  placeholder="0"
                  className={inputClass}
                  value={estimate}
                  onChange={(e) => setEstimate(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className={labelClass}>Subtasks</label>
              <input
                placeholder="e.g. Read ch.1, Review notes"
                className={inputClass}
                value={subtasksStr}
                onChange={(e) => setSubtasksStr(e.target.value)}
              />
            </div>

            <div>
              <label className={labelClass}>Notes</label>
              <textarea
                rows={2}
                placeholder="Add any extra details here..."
                className={`${inputClass} resize-none`}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setIsExpanded(false)}
                className="text-sm font-semibold text-gray-400 hover:text-gray-600 px-4 py-2 hover:bg-gray-50 rounded-lg transition-colors"
              >
                Cancel / Collapse
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
