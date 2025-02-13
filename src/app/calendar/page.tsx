"use client";

import { useState } from "react";
import Calendar from "@/components/ui/calendar";
import Navbar from "@/components/layout/Navbar";
import Image from "next/image";
import Footer from "@/components/layout/Footer";

export default function Booking() {
  const [date, setDate] = useState<Date | undefined>(new Date());

  const handleDateSelect = (selectedDate: Date | undefined) => {
    setDate(selectedDate);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative h-[40vh] flex items-center justify-center">
          <Image
            src="/images/land.svg?height=400&width=1920"
            alt="GESSCAM community"
            fill
            style={{ objectFit: "cover" }}
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 to-black/30"></div>
          <h1 className="relative z-10 text-4xl md:text-6xl font-bold text-white text-center">
            Event Schedule
          </h1>
        </section>


        {/* Booking Section */}
        <section className="container mx-auto px-6 py-12">
          <h1 className="text-4xl font-bold mb-8 text-ss-blue text-center">Calendar</h1>
          <div className="flex flex-col md:flex-row gap-12 items-start">
            {/* Calendar Section */}
            <div className="flex-1">
              <h2 className="text-xl font-semibold mb-4 text-center">Select a Date</h2>
              <Calendar
                selected={date}
                onSelect={handleDateSelect}
                className="rounded-md border"
                aria-label="Calendar for selecting booking date"
              />
            </div>

            {/* Booking Details Section */}
            <div className="flex-1">
              <h2 className="text-xl font-semibold mb-4">Schedule Details</h2>
              {date ? (
                <div>
                  <p className="mb-4">
                    <strong>You've selected:</strong> {date.toDateString()}
                  </p>
                </div>
              ) : (
                <p className="text-gray-600">
                  Please select a date to book an event.
                </p>
              )}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
