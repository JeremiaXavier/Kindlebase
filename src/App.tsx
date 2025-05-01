import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router";
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
import { db } from "./firebase";
import CommunityPage from "./pages/Forms/CommunityList";
import JoinCommunityPage from "./pages/Community/JoinCommunity";
import CreateCommunityPage from "./pages/Community/CreateCommunity";
import FinanceDashboard from "./pages/Finance/Planner";
import FormElementsdefault from "./pages/Forms/FormElements-copy";
import NotesList from "./pages/Notes/NoteList";
import NoteContent from "./pages/Notes/NoteContent";

export default function App() {
  const [loading, setLoading] = useState(true);
  const setUser = useAuthStore((state) => state.setUser);
  const { authUser } = useAuthStore();
  useEffect(() => {
    const auth = getAuth();

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        setLoading(false);
        return;
      }
      if (
        authUser &&
        authUser.uid === currentUser.uid &&
        authUser.phoneNumber
      ) {
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
        });
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

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
        <img src="./images/logo/icon.png" width={50} />
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
    return <>{element}</>;
  };
  const PublicRoute = ({ element }: { element: React.ReactNode }) => {
    return authUser ? <Navigate to="/" replace /> : <>{element}</>;
  };

  return (
    <>
      <ScrollToTop />
      <Routes>
        {/* Dashboard Layout */}
        <Route element={<ProtectedRoute element={<AppLayout />} />}>
          <Route index path="/" element={<Home />} />
          {/* Others Page */}
          <Route path="/profile" element={<UserProfiles />} />
          <Route path="/calendar" element={<Calendar />} />
          {/*             <Route path="/blank" element={<Blank />} />
           */}{" "}
          {/* Forms */}
          {/*   <Route path="/form-elements" element={<FormElements />} /> */}
          <Route path="/communities" element={<CommunityPage />} />
          <Route path="/create-community" element={<CreateCommunityPage/>} />
          <Route path="/join-community" element={<JoinCommunityPage />} />
          <Route path="/feed" element={<FormElements />} />
          <Route path="/forum/:id" element={<FormElements />} />
          <Route path="/money" element={<FinanceDashboard />} />
          <Route path="/form-elements" element={<FormElementsdefault />} />
          {/* Tables */}
          {/*             <Route path="/basic-tables" element={<BasicTables />} />
           */}{" "}
          <Route path="/tasks" element={<BasicTables />} />
          <Route path="/notes" element={<NotesList />} />
          <Route path="/note/:id" element={<NoteContent />} />
          {/* Ui Elements */}
          {/* <Route path="/alerts" element={<Alerts />} />
          <Route path="/avatars" element={<Avatars />} />
          <Route path="/badge" element={<Badges />} />
          <Route path="/buttons" element={<Buttons />} />
          <Route path="/images" element={<Images />} />
          <Route path="/videos" element={<Videos />} />
          {/* Charts */}
          {/* <Route path="/line-chart" element={<LineChart />} />
          <Route path="/bar-chart" element={<BarChart />} />  */}
        </Route>

        {/* Auth Layout */}
        <Route path="/signin" element={<PublicRoute element={<SignIn />} />} />
        <Route path="/signup" element={<PublicRoute element={<SignUp />} />} />

        {/* Fallback Route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}
