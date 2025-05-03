import { useEffect } from "react";
import { Link } from "react-router-dom"; // Import Link from react-router-dom
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import PageMeta from "@/components/common/PageMeta";
import useForumStore from "@/components/store/communityStore";

export default function CommunityPage() {
  const { myCommunities, getMyCommunities } = useForumStore();
  useEffect(() => {
    if (myCommunities && myCommunities.length === 0){
      getMyCommunities();
      console.log("my communities is read");
    } 
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
          {myCommunities.length === 0 && (
            <p className="text-center text-gray-500 mt-10">
              No communities joined yet.
            </p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
            {myCommunities.map((comm) => (
              <Link key={comm.id} to={`/forum/${comm.id}`}>
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
                      {comm.description}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>

     
          <div className="mt-12 text-center">
            <Link
              to="/join-community"
              className="text-blue-600 hover:underline"
            >
              View Communities Available to Join
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
