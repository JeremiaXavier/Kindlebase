import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom"; // For navigating and accessing note ID
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import PageMeta from "@/components/common/PageMeta";
import { AngleDownIcon } from "@/icons";

// Dummy data for the note (this will be replaced with Firestore data)
const dummyNotes = [
  {
    id: "1",
    title: "Meeting Notes",
    content: "Discussed CRM API structure and improvements for next sprint.",
    timestamp: "2025-04-29 10:00 AM",
  },
  {
    id: "2",
    title: "Workout Plan",
    content: "Morning workout: 30 min cardio, 15 min strength training.",
    timestamp: "2025-04-29 06:00 AM",
  },
  {
    id: "3",
    title: "Budgeting Plan",
    content: "Reviewed monthly expenses, need to save more this month.",
    timestamp: "2025-04-28 03:00 PM",
  },
];

export default function NoteContent() {
  const { id } = useParams(); // Get note ID from URL
  const navigate = useNavigate();

  // Find the note by ID
  const note = dummyNotes.find((n) => n.id === id);

  // If the note doesn't exist, navigate back to the notes list
  if (!note) {
    navigate("/notes");
    return null;
  }

  // State for the editable content
  const [content, setContent] = useState(note.content);

  // Handle content change
  const handleContentChange = (e) => {
    setContent(e.target.value);
  };

  // Handle save changes
  const handleSave = () => {
    // Save the changes to Firestore here (for now, it's just logging)
    console.log("Saved content:", content);
  };

  return (
    <div>
      <PageMeta
        title={`Note: ${note.title} | Your Notes`}
        description={`View and edit the note titled ${note.title}`}
      />
      <PageBreadcrumb pageTitle="Note Content" />
      <button
            onClick={() => navigate("/notes")}
            className="mb-6 flex items-center text-blue-600 hover:text-blue-700"
          >
           <AngleDownIcon/>
            Back to Notes
          </button>
      <div className="min-h-screen rounded-2xl   bg-transparent px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
        <div className="mx-auto w-full max-w-[780px]">
          {/* Back Button */}
          

          {/* Note Title */}
          <h3 className="mb-6 font-semibold text-gray-800 text-theme-xl dark:text-white/90 sm:text-2xl">
            {note.title}
          </h3>

          {/* Note Content (Editable) */}
          <textarea
            value={content}
            onChange={handleContentChange}
            className="w-full h-[500px] rounded-lg border border-gray-300 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-black/[0.2] dark:text-white/90 resize-none"
            placeholder="Edit your note here..."
          />

          {/* Save Button */}
          <div className="mt-4 flex justify-end">
            <button
              onClick={handleSave}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
            >
              Save Changes
            </button>
          </div>

          {/* Timestamp */}
          <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
            Last Edited: {new Date(note.timestamp).toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
}
