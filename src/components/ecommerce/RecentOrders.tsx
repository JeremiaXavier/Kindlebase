import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useEffect } from "react";
import useEventStore from "../store/calenderStore";


// Define the table data using the interface


export default function RecentOrders() {
  const { events, fetchEvents } = useEventStore();
  useEffect(() => {
    if (!events || events.length === 0) {
      // Check if events are not yet in the store
      fetchEvents();
      console.log("events fetched");
    }
  }, []);
  const now = new Date();
  const upcomingEvents = events.filter((event) => {
    const start = new Date(event.start ?? "");
    return start > now;
  });

  // Filter for ongoing events
  const ongoingEvents = events.filter((event) => {
    const start = new Date(event.start ?? "");
    const end = new Date(event.end ?? "");
    return start <= now && end >= now;
  });
  const upcomingAndOngoingEvents:any = [
    ...ongoingEvents,
    ...upcomingEvents,
  ];
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
      <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Upcoming events
          </h3>
        </div>

        {/*    */}
      </div>

      <div className="max-w-full overflow-x-auto">
        {upcomingAndOngoingEvents.length === 0 ? (
          <div className="text-center text-gray-500 dark:text-gray-400">
            No upcoming events
          </div>
        ) : (
          <Table>
            <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
              <TableRow>
                <TableCell
                  isHeader
                  className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Event
                </TableCell>
                <TableCell
                  isHeader
                  className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Start
                </TableCell>
                <TableCell
                  isHeader
                  className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  End
                </TableCell>
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
              {upcomingAndOngoingEvents.map((event:any) => (
                <TableRow key={event.id}>
                  <TableCell className="py-3">
                    <div className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                      {event.title}
                    </div>
                  </TableCell>
                  <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    {new Date(event.start).toLocaleString()}
                  </TableCell>
                  <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    {new Date(event.end).toLocaleString()}
                  </TableCell>
                  {/*  */}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
