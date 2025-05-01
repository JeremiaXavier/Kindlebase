import { Link } from "react-router-dom"; // For navigation
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import PageMeta from "@/components/common/PageMeta";

// Dummy data for notes (use Firestore later)
const dummyNotes = [
  {
    id: "1",
    title: "Meeting Notes",
    content: "Discussed CRM API structure and improvements for next sprint.",
    timestamp: "2025-04-29 10:00 AM",
    userId: "user1"
  },
  {
    id: "2",
    title: "Workout Plan",
    content: "Morning workout: 30 min cardio, 15 min strength training.",
    timestamp: "2025-04-29 06:00 AM",
    userId: "user2"
  },
  {
    id: "3",
    title: "Budgeting Plan",
    content: "Reviewed monthly expenses, need to save more this month.",
    timestamp: "2025-04-28 03:00 PM",
    userId: "user1"
  }
];

export default function NotesList() {
  return (
    <div>
      <PageMeta
        title="Notes Dashboard | Your Notes"
        description="List of all your notes. Click on any title to view its content."
      />
      <PageBreadcrumb pageTitle="Notes List" />

      <div className="min-h-screen rounded-2xl  bg-transparent px-5 py-7 dark:border-gray-800 dark:bg-gray-900 xl:px-10 xl:py-12">
        <div className="mx-auto w-full max-w-[780px] text-center">
          <h3 className="mb-6 font-semibold text-gray-800 text-theme-xl dark:text-white/90 sm:text-2xl">
            Your Notes
          </h3>
          
          {/* Notes List */}
          <div className="space-y-4">
            {dummyNotes.map((note) => (
              <Link
                key={note.id}
                to={`/note/${note.id}`} // Linking to the Note Detail page
                className="block rounded-lg border border-gray-300 bg-white p-5 shadow-sm hover:bg-gray-50 dark:border-gray-700 dark:bg-black/[0.2] dark:hover:bg-black/[0.3] transition-all"
              >
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-medium text-lg text-gray-700 dark:text-white">
                    {note.title}
                  </h4>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {new Date(note.timestamp).toLocaleDateString()}
                  </span>
                </div>
                
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
