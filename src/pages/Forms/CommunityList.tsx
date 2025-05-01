import { useEffect, useState } from "react";
import { Link } from "react-router-dom";  // Import Link from react-router-dom
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import PageMeta from "@/components/common/PageMeta";

interface Community {
  id: string;
  name: string;
  bannerUrl: string;
  bio: string;
}

export default function CommunityPage() {
  const [communities, setCommunities] = useState<Community[]>([]);  // Communities user belongs to

  useEffect(() => {
    // Mock data for user's communities (communities they have joined or created)
    const mockCommunities: Community[] = [
      {
        id: "1",
        name: "React Developers",
        bannerUrl: "https://png.pngtree.com/thumb_back/fh260/back_pic/02/50/63/71577e1cf59d802.jpg",
        bio: "A community for React developers to discuss and share resources.",
      },
      {
        id: "2",
        name: "Tech Leads India",
        bannerUrl: "https://png.pngtree.com/thumb_back/fh260/back_pic/02/50/63/71577e1cf59d802.jpg",
        bio: "A forum for tech leads and managers in India to collaborate.",
      },
    ];

    setCommunities(mockCommunities);
  }, []);

  return (
    <div>
      <PageMeta title="My Communities" description="Communities Dashboard" />
      <PageBreadcrumb pageTitle="Communities" />

      <div className="min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
        <div className="mx-auto w-full max-w-[900px]">
          <h3 className="text-2xl font-bold mb-6 text-center text-gray-800 dark:text-white">
            Communities You Joined / Created
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
            {communities.map((comm) => (
              <Link key={comm.id} to={`/community/${comm.id}`}>
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow hover:shadow-lg transition-shadow duration-300">
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
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {communities.length === 0 && (
            <p className="text-center text-gray-500 mt-10">No communities joined yet.</p>
          )}

          <div className="mt-12 text-center">
            <Link to="/join-community" className="text-blue-600 hover:underline">
              View Communities Available to Join
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
