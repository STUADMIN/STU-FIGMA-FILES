"use client";

import React, { useState } from "react";
import Link from "next/link";

export default function NewTenderPage() {
  const [title, setTitle] = useState("");

  return (
    <main className="min-h-dvh p-6">
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-4 text-2xl font-semibold">Create Tender</h1>
        <div className="rounded-lg border border-gray-200 p-6">
          <div className="mb-4">
            <label className="mb-1 block text-sm text-gray-700">Title</label>
            <input
              className="w-full rounded-md border border-gray-300 px-3 py-2 outline-none focus:border-gray-400"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter tender title"
            />
          </div>
          <div className="flex items-center gap-3">
            <Link href="/tenders" className="rounded-md border border-gray-300 px-4 py-2">
              Cancel
            </Link>
            <button className="rounded-md bg-[#4c7cf0] px-4 py-2 text-white" disabled>
              Save
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
