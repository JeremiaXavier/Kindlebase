import { useEffect,  } from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import PageMeta from "@/components/common/PageMeta";
import useForumStore from "@/components/store/communityStore";
import { useAuthStore } from "@/components/store/useAuthStore";
import {  useNavigate } from "react-router";

export default function JoinCommunityPage() {
  // All available communities
  const navigate = useNavigate();
  const { communities, getCommunities, joinCommunity } =
    useForumStore();
  const { authUser } = useAuthStore();
  useEffect(() => {
    if (communities && communities.length === 0){
      getCommunities();
      console.log("Getcommunity is read");
    }
  }, []);

  const handleJoinCommunity = (id: string) => {
    if(authUser?.uid)
    joinCommunity(id, authUser.uid);
    navigate("/communities");
  };

  return (
    <div>
      <PageMeta
        title="Join Communities"
        description="Browse available communities"
      />
      <PageBreadcrumb pageTitle="Join Communities" />

      <div className="min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
        <div className="mx-auto w-full max-w-[900px]">
          <h3 className="text-2xl font-bold mb-6 text-center text-gray-800 dark:text-white">
            Communities Available to Join
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
            {communities.map((comm) => (
              <div
                key={comm.id}
                className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow hover:shadow-lg transition-shadow duration-300"
              >
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

          {communities.length === 0 && (
            <p className="text-center text-gray-500 mt-10">
              No communities available to join.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
