import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router";
import { Toaster } from "react-hot-toast";
import SignIn from "./pages/AuthPages/SignIn";
import SignUp from "./pages/AuthPages/SignUp";
import NotFound from "./pages/OtherPage/NotFound";
import UserProfiles from "./pages/UserProfiles";

import Calendar from "./pages/Calendar";
import BasicTables from "./pages/Tables/BasicTables";
import FormElements from "./pages/Forms/FormElements";

import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import Home from "./pages/Dashboard/Home";
import { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useAuthStore } from "./components/store/useAuthStore";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "./firebase";
import CommunityPage from "./pages/Forms/CommunityList";
import JoinCommunityPage from "./pages/Community/JoinCommunity";
import CreateCommunityPage from "./pages/Community/CreateCommunity";
import FinanceDashboard from "./pages/Finance/Planner";
import FormElementsdefault from "./pages/Forms/FormElements-copy";
import NotesList from "./pages/Notes/NoteList";
import NoteContent from "./pages/Notes/NoteContent";
import VerifyEmail from "./components/models/verifyEmail";
import Alert from "./components/ui/alert/Alert";
import NoteCreate from "./pages/Notes/createNote";

export default function App() {
  const [loading, setLoading] = useState(true);
  const setUser = useAuthStore((state) => state.setUser);
  const { authUser } = useAuthStore();
   const [verified,setVerified] = useState(false);

  useEffect(() => {
    const auth = getAuth();

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        setLoading(false);
        return;
      }
      if (authUser && authUser.uid === currentUser.uid) {
        setLoading(false);
        return;
      }
      if (currentUser) {
        const userRef = doc(db, "users", currentUser.uid);
        const userSnap = await getDoc(userRef);
        console.log("database read 46 app.tsx");

        if (!userSnap.exists()) {
          console.log("database write 49 app.tsx");
          await setDoc(userRef, {
            uid: currentUser.uid,
            name: currentUser.displayName || "Anonymous",
            email: currentUser.email,
            photoURL: currentUser.photoURL || null,
            provider: currentUser.providerData[0]?.providerId,
            createdAt: new Date(),
            joinedCommunities: [],
            createdCommunities: [],
            role: "user",
          });
        }
        const userData = userSnap.exists() ? userSnap.data() : {};

        setUser({
          uid: currentUser.uid,
          displayName: currentUser.displayName || userData.name,
          email: currentUser.email,
          photoURL: currentUser.photoURL || userData.photoURL,
          provider: userData.provider,
          bio: userData.bio || "",
          phoneNumber: userData.phoneNumber || "",
          facebook: userData.facebook || "",
          twitter: userData.twitter || "",
          linkedin: userData.linkedin || "",
          instagram: userData.instagram || "",
          joinedCommunities: userData.joinedCommunities,
          createdCommunities: userData.createdCommunities,
          role: userData.role,
        });
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, [setUser, authUser]);

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <img src="./images/logo/loader.gif" width={150} />
      </div>
    );
  }

  const ProtectedRoute = ({
    element,
    ...rest
  }: {
    element: React.ReactNode;
  }) => {
    if (!authUser) {
      return <Navigate to="/signin" replace />;
    }

    return <>
    
    {!auth.currentUser?.emailVerified && (
        <Alert
          variant="warning"
          title="Verify your email"
          message="Your email verification is pending. You cannot continue for long until you verify your email"
          showLink={true}
          linkHref="/verify-email"
          linkText="Click here to verify"
        />
      )}
    {element}</>;
  };
  const PublicRoute = ({ element }: { element: React.ReactNode }) => {
    return authUser ? <Navigate to="/" replace /> : <>{element}</>;
  };
  return (
    <>
      <ScrollToTop />
      
      <Toaster position="top-center" />
      <Routes>  
        {/* Dashboard Layout */}
        <Route element={<ProtectedRoute element={<AppLayout />} />}>
        
          <Route index path="/" element={<Home />} />
          
          <Route path="/profile" element={<UserProfiles />} />
          <Route path="/calendar" element={<Calendar />} />
  
          <Route path="/communities" element={<CommunityPage />} />
          <Route path="/create-community" element={<CreateCommunityPage />} />
          <Route path="/join-community" element={<JoinCommunityPage />} />
          <Route path="/feed" element={<FormElements />} />
          <Route path="/forum/:id" element={<FormElements />} />
          <Route path="/money" element={<FinanceDashboard />} />
        
   
          <Route path="/tasks" element={<BasicTables />} />
         
      
        </Route>

        {/* Auth Layout */}
        <Route path="/signin" element={<PublicRoute element={<SignIn />} />} />
        <Route path="/signup" element={<PublicRoute element={<SignUp />} />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        {/* Fallback Route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}
