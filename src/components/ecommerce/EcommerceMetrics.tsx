import { Calendar, FileText, ListChecks } from "lucide-react";

import useEventStore from "../store/calenderStore";
import { useTaskStore } from "../store/taskStore";




export default function EcommerceMetrics() {
  const { tasks } = useTaskStore();
  const { events } = useEventStore();


  const cards = [
    {
      title: "Tasks",
      count: tasks.length,
      icon: <ListChecks className="size-6 text-white" />,
     
      /* trend: "up", */
      bg: "from-purple-500 to-indigo-500",
    },
    {
      title: "Calendar",
      count: events.length,
      icon: <Calendar className="size-6 text-white" />,
    
       bg: "from-blue-500 to-cyan-500",
    },
    {
      title: "Notes",
      count: 8,
      icon: <FileText className="size-6 text-white" />,
      change: "-4.25%",
      /*     trend: "down",
       */ bg: "from-yellow-400 to-orange-500",
    },
  ];
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 md:gap-6">
      {cards.map((card, i) => (
        <div
          key={i}
          className="rounded-2xl bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition p-5 md:p-6"
        >
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br ${card.bg}`}
          >
            {card.icon}
          </div>

          <div className="mt-5 flex items-end justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {card.title}
              </p>
              <h4 className="mt-1 text-xl font-bold text-gray-800 dark:text-white">
                {card.count}
              </h4>
            </div>
            
          </div>
        </div>
      ))}
    </div>
  );
}
