import { useEffect, useState } from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import PageMeta from "@/components/common/PageMeta";

interface Community {
  id: string;
  name: string;
  bannerUrl: string;
  bio: string;
}

export default function JoinCommunityPage() {
  const [allCommunities, setAllCommunities] = useState<Community[]>([]);  // All available communities

  useEffect(() => {
    // Mock data for all available communities
    const mockAllCommunities: Community[] = [
      {
        id: "3",
        name: "UI/UX Designers",
        bannerUrl: "https://png.pngtree.com/thumb_back/fh260/back_pic/02/50/63/71577e1cf59d802.jpg",
        bio: "A creative space for UI/UX designers to exchange ideas and feedback.",
      },
      {
        id: "4",
        name: "Startup Founders",
        bannerUrl: "https://png.pngtree.com/thumb_back/fh260/back_pic/02/50/63/71577e1cf59d802.jpg",
        bio: "For startup founders to discuss challenges, funding, and scaling.",
      },
    ];

    setAllCommunities(mockAllCommunities);
  }, []);

  const handleJoinCommunity = (id: string) => {
    // Simulate joining a community (you would integrate with Firebase or backend here)
    alert(`Joined community with ID: ${id}`);
    // Logic for joining the community goes here.
  };

  return (
    <div>
      <PageMeta title="Join Communities" description="Browse available communities" />
      <PageBreadcrumb pageTitle="Join Communities" />

      <div className="min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
        <div className="mx-auto w-full max-w-[900px]">
          <h3 className="text-2xl font-bold mb-6 text-center text-gray-800 dark:text-white">
            Communities Available to Join
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
            {allCommunities.map((comm) => (
              <div key={comm.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow hover:shadow-lg transition-shadow duration-300">
                <img
                  src={comm.bannerUrl}
                  alt={comm.name}
                  className="w-full h-40 object-cover rounded-t-xl"
                />
                <div className="p-4">
                  <h4 className="text-lg font-semibold text-gray-800 dark:text-white">
                    {comm.name}
                  </h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {comm.bio}
                  </p>
                  <button
                    className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700"
                    onClick={() => handleJoinCommunity(comm.id)}
                  >
                    Join Community
                  </button>
                </div>
              </div>
            ))}
          </div>

          {allCommunities.length === 0 && (
            <p className="text-center text-gray-500 mt-10">No communities available to join.</p>
          )}
        </div>
      </div>
    </div>
  );
}
