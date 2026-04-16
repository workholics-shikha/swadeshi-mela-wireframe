import { useEffect, useMemo, useState } from "react";
import { Card, InfoList } from "./PageScaffold";
import { getBookings, getEvents, getZones, type BookingItem, type EventItem, type ZoneItem } from "@/lib/domainApi";

type StallStatus = "Booked" | "Free" | "Pending";
type StallView = { stall: string; status: StallStatus };
type ZoneSummary = [string, string];

const statusClassMap: Record<StallStatus, string> = {
  Booked: "bg-emerald-100 text-emerald-700",
  Free: "bg-sky-100 text-sky-700",
  Pending: "bg-amber-100 text-amber-700",
};

function parseStallNumbers(value: string | undefined): string[] {
  if (!value) return [];
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function formatStallNumber(index: number): string {
  return String(index).padStart(2, "0");
}

function getMappedStallCount(event: EventItem | undefined, categoryName: string, zoneId: string): number {
  if (!event || !categoryName || !zoneId) return 0;

  const mapping = (event.categoryZoneMappings || []).find(
    (item) => item.categoryName?.trim() === categoryName && item.zoneId === zoneId,
  );

  return Number(mapping?.stalls || 0);
}

export function StallMapPage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [zones, setZones] = useState<ZoneItem[]>([]);
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>("");
  const [selectedCategoryName, setSelectedCategoryName] = useState<string>("");
  const [selectedZoneId, setSelectedZoneId] = useState<string>("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    Promise.all([getEvents(), getBookings()])
      .then(([eventRows, bookingRows]) => {
        setEvents(eventRows);
        setBookings(bookingRows);
        if (eventRows.length > 0) {
          setSelectedEventId(eventRows[0]._id);
        }
      })
      .catch(() => {
        setEvents([]);
        setBookings([]);
      });
  }, []);

  useEffect(() => {
    if (!selectedEventId) {
      setZones([]);
      setSelectedCategoryName("");
      setSelectedZoneId("");
      return;
    }

    setLoading(true);
    getZones(selectedEventId)
      .then((zoneRows) => {
        setZones(zoneRows);
        setSelectedZoneId((current) => {
          if (current && zoneRows.some((zone) => zone._id === current)) {
            return current;
          }
          return zoneRows[0]?._id || "";
        });
      })
      .catch(() => {
        setZones([]);
        setSelectedZoneId("");
      })
      .finally(() => setLoading(false));
  }, [selectedEventId]);

  const selectedEvent = useMemo(
    () => events.find((event) => event._id === selectedEventId),
    [events, selectedEventId],
  );

  const selectedZone = useMemo(
    () => zones.find((zone) => zone._id === selectedZoneId),
    [selectedZoneId, zones],
  );

  const availableCategoryNames = useMemo(() => {
    if (!selectedEvent) return [];

    return Array.from(
      new Set(
        (selectedEvent.categoryZoneMappings || [])
          .map((mapping) => mapping.categoryName?.trim())
          .filter((name): name is string => Boolean(name)),
      ),
    );
  }, [selectedEvent]);

  useEffect(() => {
    if (!availableCategoryNames.length) {
      setSelectedCategoryName("");
      return;
    }

    setSelectedCategoryName((current) => (
      current && availableCategoryNames.includes(current)
        ? current
        : availableCategoryNames[0]
    ));
  }, [availableCategoryNames]);

  const availableZones = useMemo(() => {
    if (!selectedEvent || !selectedCategoryName) return [];

    const allowedZoneIds = new Set(
      (selectedEvent.categoryZoneMappings || [])
        .filter((mapping) => mapping.categoryName?.trim() === selectedCategoryName)
        .map((mapping) => mapping.zoneId)
        .filter((zoneId): zoneId is string => Boolean(zoneId)),
    );

    return zones.filter((zone) => allowedZoneIds.has(zone._id));
  }, [selectedCategoryName, selectedEvent, zones]);

  useEffect(() => {
    if (!availableZones.length) {
      setSelectedZoneId("");
      return;
    }

    setSelectedZoneId((current) => (
      current && availableZones.some((zone) => zone._id === current)
        ? current
        : availableZones[0]._id
    ));
  }, [availableZones]);

  const stalls = useMemo(() => {
    if (!selectedEvent || !selectedCategoryName || !selectedZoneId) return [];

    const totalStalls = getMappedStallCount(selectedEvent, selectedCategoryName, selectedZoneId);
    if (totalStalls <= 0) return [];

    const statusByStall = new Map<string, StallStatus>();
    const zoneBookings = bookings.filter((booking) => {
      if (booking.event?._id !== selectedEvent._id) return false;
      if (booking.category?.name !== selectedCategoryName) return false;
      const bookingZoneId = booking.zone?._id || booking.allotment?.zone || "";
      return bookingZoneId === selectedZoneId && booking.status !== "rejected";
    });

    zoneBookings.forEach((booking) => {
      const nextStatus: StallStatus = booking.status === "approved" ? "Booked" : "Pending";
      parseStallNumbers(booking.allotment?.stallNumber).forEach((stallNumber) => {
        const currentStatus = statusByStall.get(stallNumber);
        if (currentStatus === "Booked") return;
        if (nextStatus === "Booked" || !currentStatus) {
          statusByStall.set(stallNumber, nextStatus);
        }
      });
    });

    return Array.from({ length: totalStalls }, (_, index) => {
      const stallNumber = formatStallNumber(index + 1);
      return {
        stall: stallNumber,
        status: statusByStall.get(stallNumber) || "Free",
      };
    });
  }, [bookings, selectedCategoryName, selectedEvent, selectedZoneId]);

  const zoneSummary = useMemo<ZoneSummary[]>(() => {
    if (!selectedEvent || !selectedCategoryName) return [];

    return availableZones.map((zone) => {
      const totalStalls = getMappedStallCount(selectedEvent, selectedCategoryName, zone._id);
      const bookedCount = bookings.reduce((sum, booking) => {
        if (booking.event?._id !== selectedEvent._id) return sum;
        if (booking.status === "rejected") return sum;
        if (booking.category?.name !== selectedCategoryName) return sum;
        const bookingZoneId = booking.zone?._id || booking.allotment?.zone || "";
        if (bookingZoneId !== zone._id) return sum;
        return sum + parseStallNumbers(booking.allotment?.stallNumber).length;
      }, 0);

      return [zone.zoneName, `${bookedCount} / ${totalStalls} booked`];
    });
  }, [availableZones, bookings, selectedCategoryName, selectedEvent]);

  const bookedCount = stalls.filter((stall) => stall.status === "Booked").length;
  const progressPercent = stalls.length > 0 ? Math.round((bookedCount / stalls.length) * 100) : 0;

  return (
    <div className="space-y-6">
      <Card title="Event selection" subtitle="Choose an event to view its stall allocation details.">
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="mb-2 block text-sm font-semibold text-[var(--text-main)]" htmlFor="stall-event-select">
              Event
            </label>
            <select
              className="w-full rounded-[16px] border border-[color:var(--border-soft)] bg-white/80 px-4 py-3 text-sm text-[var(--text-main)] outline-none transition focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand-soft)]"
              id="stall-event-select"
              onChange={(event) => setSelectedEventId(event.target.value)}
              value={selectedEventId}
            >
              <option value="">Select an event</option>
              {events.map((event) => (
                <option key={event._id} value={event._id}>
                  {event.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-[var(--text-main)]" htmlFor="stall-category-select">
              Category
            </label>
            <select
              className="w-full rounded-[16px] border border-[color:var(--border-soft)] bg-white/80 px-4 py-3 text-sm text-[var(--text-main)] outline-none transition focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand-soft)]"
              id="stall-category-select"
              disabled={!availableCategoryNames.length}
              onChange={(event) => setSelectedCategoryName(event.target.value)}
              value={selectedCategoryName}
            >
              <option value="">Select a category</option>
              {availableCategoryNames.map((categoryName) => (
                <option key={categoryName} value={categoryName}>
                  {categoryName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-[var(--text-main)]" htmlFor="stall-zone-select">
              Zone
            </label>
            <select
              className="w-full rounded-[16px] border border-[color:var(--border-soft)] bg-white/80 px-4 py-3 text-sm text-[var(--text-main)] outline-none transition focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand-soft)]"
              id="stall-zone-select"
              disabled={!availableZones.length || loading}
              onChange={(event) => setSelectedZoneId(event.target.value)}
              value={selectedZoneId}
            >
              <option value="">Select a zone</option>
              {availableZones.map((zone) => (
                <option key={zone._id} value={zone._id}>
                  {zone.zoneName}
                </option>
              ))}
            </select>
            {loading ? <p className="mt-2 text-sm text-[var(--text-soft)]">Loading zones...</p> : null}
          </div>
        </div>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[1.55fr_0.85fr]">
        <Card
          title={selectedZone && selectedCategoryName ? `${selectedCategoryName} - ${selectedZone.zoneName}` : "Select a Category and Zone"}
          subtitle={selectedZone ? `${bookedCount} of ${stalls.length} stalls booked.` : "Choose an event, category, and zone to view stalls."}
        >
          {stalls.length > 0 ? (
            <>
              <div className="mb-5 rounded-full bg-[var(--shell-bg)] p-1">
                <div
                  className="h-3 rounded-full bg-[var(--brand)]"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-5">
                {stalls.map(({ stall, status }) => (
                  <div
                    className={`cursor-pointer rounded-[20px] p-4 text-center transition hover:scale-105 ${statusClassMap[status]}`}
                    key={stall}
                    title={`Stall ${stall}: ${status}`}
                  >
                    <p className="text-lg font-semibold">{stall}</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.18em]">{status}</p>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center py-12 text-center">
              <p className="text-sm text-[var(--text-soft)]">
                {!selectedEventId
                  ? "Please select an event to view zones and stalls."
                  : !selectedCategoryName
                    ? "Please select a category to view stalls."
                  : !selectedZoneId
                    ? "Please select a zone to view its stalls."
                    : "No stalls configured for this zone."}
              </p>
            </div>
          )}
        </Card>

        <Card title="Zone Summary" subtitle="Current allocation by zone for the selected category.">
          {zoneSummary.length > 0 ? (
            <InfoList items={zoneSummary} />
          ) : (
            <p className="text-sm text-[var(--text-soft)]">Select an event and category to see zone summary.</p>
          )}
        </Card>
      </div>

      <Card title="Legend" subtitle="Stall status indicators.">
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded bg-emerald-100" />
            <span className="text-sm text-[var(--text-main)]">Booked</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded bg-sky-100" />
            <span className="text-sm text-[var(--text-main)]">Free</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded bg-amber-100" />
            <span className="text-sm text-[var(--text-main)]">Pending</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
