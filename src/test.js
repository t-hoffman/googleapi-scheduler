// Helper function to convert time to minutes since midnight
const timeToMinutes = (time) => {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
};

// Function to find available 15-minute chunks
const findAvailableChunks = (events, start, end) => {
  const chunks = [];
  const startTime = timeToMinutes(start);
  const endTime = timeToMinutes(end);

  // Convert events to a more usable format
  const bookedTimes = events.map((event) => ({
    start: timeToMinutes(event.start),
    end: timeToMinutes(event.end),
  }));

  // Check each 15-minute slot
  for (let i = startTime; i <= endTime - 15; i += 15) {
    const chunkStart = i;
    const chunkEnd = i + 15;

    // Check if the current chunk overlaps with any booked times
    const isAvailable = !bookedTimes.some(
      (event) => chunkStart < event.end && chunkEnd > event.start
    );

    if (isAvailable) {
      chunks.push(
        `${Math.floor(chunkStart / 60)
          .toString()
          .padStart(2, "0")}:${(chunkStart % 60)
          .toString()
          .padStart(2, "0")} - ${Math.floor(chunkEnd / 60)
          .toString()
          .padStart(2, "0")}:${(chunkEnd % 60).toString().padStart(2, "0")}`
      );
    }
  }

  return chunks;
};

// Sample events
const events = [
  { start: "09:00", end: "09:30" },
  { start: "10:00", end: "10:15" },
  { start: "10:30", end: "11:00" },
];

// Define your time range
const start = "08:00";
const end = "12:00";

// Find available chunks
const availableChunks = findAvailableChunks(events, start, end);
console.log(availableChunks);
