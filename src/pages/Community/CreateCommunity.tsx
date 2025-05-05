import { useState } from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import PageMeta from "@/components/common/PageMeta";
import Button from "@/components/ui/button/Button";
import useForumStore from "@/components/store/communityStore";
import { useAuthStore } from "@/components/store/useAuthStore";
import { useNavigate } from "react-router";

const defaultBanners = [
  "https://png.pngtree.com/thumb_back/fh260/back_pic/02/50/63/71577e1cf59d802.jpg",
  "https://images.unsplash.com/photo-1503264116251-35a269479413",
  "https://images.unsplash.com/photo-1556761175-129418cb2dfe",
  "https://images.unsplash.com/photo-1485217988980-11786ced9454",
];

export default function CreateCommunityPage() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [bannerUrl, setBannerUrl] = useState("");
  const [customUrl, setCustomUrl] = useState("");
  const navigate = useNavigate();
  const { createCommunity } = useForumStore();
  const { authUser } = useAuthStore();
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !bannerUrl) {
      alert("Please fill all required fields");
      return;
    }
    if(!authUser?.uid) return
    try {
      const newCommunity = {
        name,
        description,
        bannerUrl,
      };
      await createCommunity(newCommunity, authUser.uid);
      console.log("Creating community:", newCommunity);
      navigate("/communities");
      return;
    } catch (error:any) {
      console.log(error.message);
    }
  };

  return (
    <div>
      <PageMeta
        title="Create Community"
        description="Create a new community group"
      />
      <PageBreadcrumb pageTitle="Create Community" />

      <form
        onSubmit={handleSubmit}
        className="min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12"
      >
        <div className="mx-auto w-full max-w-[700px]">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 text-center">
            Create a New Community
          </h2>

          <div className="space-y-6">
            <div>
              <label className="block mb-1 font-medium text-gray-700 dark:text-white">
                Community Name *
              </label>
              <input
                type="text"
                className="w-full rounded border border-gray-300 px-4 py-2 dark:bg-gray-800 dark:text-white"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block mb-1 font-medium text-gray-700 dark:text-white">
                Community Bio
              </label>
              <textarea
                className="w-full rounded border border-gray-300 px-4 py-2 dark:bg-gray-800 dark:text-white"
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div>
              <label className="block mb-2 font-medium text-gray-700 dark:text-white">
                Choose a Banner *
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {defaultBanners.map((url) => (
                  <img
                    key={url}
                    src={url}
                    alt="Banner"
                    className={`h-24 w-full object-cover rounded cursor-pointer border-2 ${
                      bannerUrl === url
                        ? "border-blue-500"
                        : "border-transparent"
                    }`}
                    onClick={() => {
                      setBannerUrl(url);
                      setCustomUrl("");
                    }}
                  />
                ))}
              </div>
            </div>

            <div>
              <label className="block mt-6 mb-1 font-medium text-gray-700 dark:text-white">
                Or Paste Custom Image URL
              </label>
              <input
                type="url"
                placeholder="https://example.com/banner.jpg"
                className="w-full rounded border border-gray-300 px-4 py-2 dark:bg-gray-800 dark:text-white"
                value={customUrl}
                onChange={(e) => {
                  setCustomUrl(e.target.value);
                  setBannerUrl(e.target.value);
                }}
              />
            </div>

            {bannerUrl && (
              <div className="mt-6">
                <label className="block mb-1 font-medium text-gray-700 dark:text-white">
                  Preview
                </label>
                <img
                  src={bannerUrl}
                  alt="Preview"
                  className="w-full h-40 object-cover rounded border border-gray-300"
                />
              </div>
            )}

            <Button
              type="submit"
              className=" bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition relative right-0 bottom-0"
            >
              Create Community
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
