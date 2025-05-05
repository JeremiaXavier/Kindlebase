import { sendEmailVerification, signOut } from "firebase/auth";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useAuthStore } from "../store/useAuthStore";
import { auth } from "@/firebase";
import { Modal } from "@/components/ui/modal";
import { Mail } from "lucide-react";
import Button from "../ui/button/Button";
import { useNavigate } from "react-router";

const VerifyEmail = () => {
  const { authUser } = useAuthStore();
  const [isVerificationDialogOpen, setIsVerificationDialogOpen] =
    useState(true);
  const [verificationLoading, setVerificationLoading] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const navigate = useNavigate();

  

  const onClose = async () => {
    try {
      
      setIsVerificationDialogOpen(false);
      navigate(-1);
      
    } catch (error) {
      console.error("Logout failed:", error);
      toast.error("Failed to logout. Please try again.");
    }
  };
  const handleResendVerification = async () => {
    setVerificationLoading(true);
    try {
      if (authUser && auth.currentUser) {
        await sendEmailVerification(auth.currentUser);
        setVerificationSent(true);
        toast.success("Verification email sent! Please check your inbox.");
      }
    } catch (err: any) {
      console.error("Error sending verification email:", err);
      toast.error("Failed to send verification email. Please try again.");
    } finally {
      setVerificationLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isVerificationDialogOpen}
      onClose={onClose}
      className="max-w-md p-4"
    >
      <div className="w-full rounded-2xl bg-white p-6 dark:bg-gray-900">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Verify Your Email
        </h2>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
          Your email is not verified. Please verify to continue using all
          features.
        </p>

        {verificationSent && (
          <div className="mt-4 flex items-center text-sm text-green-600">
            <Mail className="w-4 h-4 mr-2" />
            Verification email has been sent again.
          </div>
        )}

        <div className="mt-6 flex justify-end gap-2">
          <Button type="button" onClick={onClose} variant="outline" size="sm">
            Logout
          </Button>
          <Button
            type="button"
            onClick={handleResendVerification}
            disabled={verificationLoading}
            size="sm"
          >
            {verificationLoading ? (
              <div className="flex items-center">
                <svg
                  className="animate-spin h-4 w-4 mr-2"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Sending...
              </div>
            ) : (
              "Resend Email"
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default VerifyEmail;
