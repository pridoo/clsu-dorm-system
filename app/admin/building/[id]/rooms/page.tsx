"use client";
import React, { useState, useEffect } from "react";
import Sidebar from "@/components/admin/Sidebar";
import {
  ArrowLeft,
  Users,
  DoorOpen,
  LayoutGrid,
  Search,
  Loader2,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, getDocs } from "firebase/firestore";

interface Room {
  id: string;
  dormID: string;
  dormGroup: string;
  room_number: string;
  total_beds: number;
  occupied_beds: number;
}

/* ======================= HELPERS ======================= */

function formatDormLabel(id: string) {
  if (!id) return "Unassigned";

  return id
    .toLowerCase()
    .replace(/^md\s*/i, "Men's Dorm ")
    .replace(/^mens\s*dorm\s*/i, "Men's Dorm ")
    .replace(/^ld\s*/i, "Ladies' Dorm ")
    .replace(/^ladies\s*dorm\s*/i, "Ladies' Dorm ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b(\d+)\b/g, "$1");
}

export default function RoomSelectionPage() {
  const params = useParams();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const dormTitle = params.id
    ? params.id.toString().replace(/-/g, " ").replace("and", "&").toUpperCase()
    : "";

  useEffect(() => {
    if (!params.id) return;

    const unsub = onSnapshot(collection(db, "rooms"), async (snap) => {
      const allRooms = snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Room[];

      const allocSnap = await getDocs(collection(db, "allocations"));
      const allAllocations = allocSnap.docs.map((d) => d.data());

      const filtered = allRooms
        .filter((r) => {
          if (!r.dormGroup) return false;

          const normalizedDb = r.dormGroup
            .toLowerCase()
            .replace(/['’]/g, "")
            .replace(/&/g, "and")
            .replace(/\+/g, "and")
            .replace(/\s+/g, "-")
            .replace(/-+/g, "-");

          const normalizedParam = params.id
            ?.toString()
            .toLowerCase()
            .replace(/['’]/g, "")
            .replace(/-+/g, "-");

          const shortDb = normalizedDb
            .replace("mens-dorm", "md")
            .replace("ladies-dorm", "ld");

          return normalizedDb === normalizedParam || shortDb === normalizedParam;
        })
        .map((room) => {
          const actualOccupants = allAllocations.filter(
            (a) => a.roomID === room.id
          ).length;
          return { ...room, occupied_beds: actualOccupants };
        });

      const sorted = filtered.sort((a, b) => {
        const numA = parseInt(a.room_number.replace(/\D/g, "")) || 0;
        const numB = parseInt(b.room_number.replace(/\D/g, "")) || 0;
        return numA - numB;
      });

      setRooms(sorted);
      setLoading(false);
    });

    return () => unsub();
  }, [params.id]);

  const filteredRooms = rooms.filter((r) =>
    r.room_number.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const groupedRooms = filteredRooms.reduce(
    (acc: Record<string, Room[]>, room: Room) => {
      const key = room.dormID || "Unassigned";
      if (!acc[key]) acc[key] = [];
      acc[key].push(room);
      return acc;
    },
    {}
  );

  const totalBeds = rooms.reduce((acc, curr) => acc + (curr.total_beds || 0), 0);
  const totalOccupied = rooms.reduce(
    (acc, curr) => acc + (curr.occupied_beds || 0),
    0
  );

  return (
    <div className="flex h-screen w-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/40 p-6 gap-6 overflow-hidden font-sans text-slate-900">
      <Sidebar />

      <main className="flex-1 flex flex-col overflow-hidden rounded-[56px] border border-slate-200/60 bg-white/80 backdrop-blur-xl shadow-[0_30px_80px_-20px_rgba(0,0,0,0.15)] relative">
        {/* ================= HEADER ================= */}
        <nav className="h-24 px-12 flex items-center justify-between border-b border-slate-100 bg-white/70 backdrop-blur-xl flex-shrink-0 z-20">
          <div className="flex items-center gap-6">
            <Link
              href="/admin/building"
              className="p-3 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md hover:-translate-y-[1px] transition-all text-slate-500 hover:text-emerald-700"
            >
              <ArrowLeft size={18} />
            </Link>
            <div>
              <h2 className="text-xl font-semibold tracking-tight leading-none text-slate-900">
                Housing Management
              </h2>
              <p className="text-[10px] mt-2 uppercase tracking-[0.35em] text-slate-400">
                {dormTitle} · Room Directory
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/20">
            <Sparkles size={14} />
            <span className="text-[11px] font-black uppercase tracking-widest">
              Live Occupancy Map
            </span>
          </div>
        </nav>

        {/* ================= TOOLBAR ================= */}
        <div className="px-12 py-5 flex items-center justify-between border-b border-slate-100 bg-slate-50/60 backdrop-blur-sm flex-shrink-0">
          <div className="flex items-center gap-3 bg-white px-5 py-3 rounded-2xl border border-slate-200 shadow-sm focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/10 transition-all">
            <Search size={14} className="text-slate-400" />
            <input
              type="text"
              placeholder="Search room…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent text-sm outline-none w-56 font-medium text-slate-700 placeholder:text-slate-400"
            />
          </div>

          <div className="flex items-center gap-8">
            <Legend label="Occupied" color="bg-emerald-500" />
            <Legend label="Available" color="bg-slate-200" />
            <Legend label="Full" color="bg-rose-500" />
          </div>
        </div>

        {/* ================= CONTENT ================= */}
        <div className="flex-1 p-12 overflow-y-auto bg-gradient-to-b from-white to-slate-50/60">
          {loading ? (
            <div className="h-full w-full flex flex-col items-center justify-center gap-4">
              <Loader2
                className="animate-spin text-emerald-500"
                size={42}
              />
              <p className="text-[11px] font-black uppercase tracking-[0.45em] text-slate-300">
                Loading Rooms…
              </p>
            </div>
          ) : rooms.length === 0 ? (
            <div className="h-full w-full flex flex-col items-center justify-center gap-6 text-center opacity-40">
              <LayoutGrid size={72} strokeWidth={1} />
              <p className="text-sm font-black uppercase tracking-widest">
                No rooms found for “{dormTitle}”
              </p>
            </div>
          ) : (
            <div className="max-w-7xl mx-auto space-y-24">
              {Object.keys(groupedRooms)
                .sort()
                .map((dormID) => (
                  <section key={dormID} className="space-y-12">
                    <div className="flex items-center gap-6">
                      <h3 className="text-[11px] font-black uppercase tracking-[0.45em] text-emerald-800 bg-emerald-50 px-10 py-3 rounded-full border border-emerald-100 shadow-sm">
                        {formatDormLabel(dormID)}
                      </h3>
                      <div className="h-px flex-1 bg-gradient-to-r from-emerald-100 to-transparent" />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-10">
                      {groupedRooms[dormID].map((room) => (
                        <RoomCard key={room.id} room={room} />
                      ))}
                    </div>
                  </section>
                ))}
            </div>
          )}
        </div>

        {/* ================= FOOTER ================= */}
        <footer className="h-24 px-12 border-t border-slate-100 flex items-center justify-between bg-white/80 backdrop-blur-xl flex-shrink-0 shadow-inner">
          <div className="flex gap-20">
            <StatItem
              icon={<Users size={18} />}
              label="Total Occupied"
              value={`${totalOccupied} / ${totalBeds} Beds`}
            />
            <StatItem
              icon={<DoorOpen size={18} />}
              label="Available Slots"
              value={`${totalBeds - totalOccupied} Vacant`}
              color="amber"
            />
          </div>
          <div className="text-right">
            <p className="text-[10px] font-black uppercase tracking-[0.35em] text-slate-300">
              CLSU HMS · v3.0
            </p>
          </div>
        </footer>
      </main>
    </div>
  );
}

/* ======================= ROOM CARD ======================= */

function RoomCard({ room }: { room: Room }) {
  const isFull = (room.occupied_beds || 0) >= room.total_beds;
  const vacancy = room.total_beds - (room.occupied_beds || 0);

  return (
    <div
      className={`relative overflow-hidden rounded-[44px] border transition-all duration-500 group bg-white shadow-[0_10px_40px_-15px_rgba(0,0,0,0.2)] hover:-translate-y-1 hover:shadow-[0_25px_70px_-20px_rgba(0,0,0,0.25)] ${
        isFull
          ? "border-rose-200"
          : "border-emerald-200 hover:border-emerald-300"
      }`}
    >
      {/* Glow bar */}
      <div
        className={`absolute top-0 left-0 h-1.5 w-full ${
          isFull
            ? "bg-gradient-to-r from-rose-400 to-rose-600"
            : "bg-gradient-to-r from-emerald-400 to-teal-500"
        }`}
      />

      <div className="p-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-10">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.35em] text-slate-400 mb-2">
              {room.total_beds}-Person Unit
            </p>
            <h4 className="text-4xl font-semibold tracking-tight text-slate-900 leading-none">
              Room {room.room_number}
            </h4>
          </div>

          <div
            className={`p-4 rounded-2xl border shadow-inner ${
              isFull
                ? "bg-rose-50 border-rose-100 text-rose-500"
                : "bg-emerald-50 border-emerald-100 text-emerald-600"
            }`}
          >
            <LayoutGrid size={22} />
          </div>
        </div>

        {/* Beds */}
        <div className="flex flex-wrap gap-3 mb-12">
          {Array.from({ length: room.total_beds }).map((_, i) => (
            <div
              key={i}
              className={`h-5 w-5 rounded-full border-2 transition-all duration-500 ${
                i < (room.occupied_beds || 0)
                  ? "bg-emerald-500 border-emerald-600 shadow-md scale-110"
                  : "bg-white border-slate-200"
              }`}
            />
          ))}
        </div>

        {/* Footer */}
        <div className="pt-8 border-t border-slate-100 flex items-end justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.35em] text-slate-400 mb-1">
              Status
            </p>
            <p className="text-sm font-semibold text-slate-700">
              {room.occupied_beds || 0} Occupied
            </p>
          </div>

          <span
            className={`text-[10px] font-black uppercase tracking-widest px-5 py-2 rounded-full border shadow-sm ${
              isFull
                ? "bg-rose-50 text-rose-600 border-rose-100"
                : "bg-emerald-50 text-emerald-700 border-emerald-100"
            }`}
          >
            {isFull ? "Full" : `${vacancy} Slots Open`}
          </span>
        </div>
      </div>

      {/* Soft glow hover layer */}
      <div
        className={`pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 ${
          isFull
            ? "bg-gradient-to-br from-rose-500/5 via-transparent to-rose-500/10"
            : "bg-gradient-to-br from-emerald-500/5 via-transparent to-teal-500/10"
        }`}
      />
    </div>
  );
}

/* ======================= SMALL COMPONENTS ======================= */

function Legend({ label, color }: any) {
  return (
    <div className="flex items-center gap-3">
      <div className={`w-2.5 h-2.5 rounded-full ${color} shadow-sm`} />
      <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
        {label}
      </span>
    </div>
  );
}

function StatItem({ icon, label, value, color = "emerald" }: any) {
  const styles: any = {
    emerald:
      "bg-emerald-50 border-emerald-100 text-emerald-700 shadow-emerald-500/20",
    amber: "bg-amber-50 border-amber-100 text-amber-700 shadow-amber-500/20",
  };

  return (
    <div className="flex items-center gap-4">
      <div className={`p-3 rounded-2xl border shadow-lg ${styles[color]}`}>
        {icon}
      </div>
      <div>
        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">
          {label}
        </p>
        <p className="text-lg font-semibold tracking-tight text-slate-900">
          {value}
        </p>
      </div>
    </div>
  );
}
