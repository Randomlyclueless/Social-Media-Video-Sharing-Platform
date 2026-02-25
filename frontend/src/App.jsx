import { useState } from "react";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import EditProfile from "./pages/EditProfile";
import ChangeAvatar from "./pages/ChangeAvatar";
import Home from "./pages/Home";
import Upload from "./pages/Upload";
import VideoPlayer from "./pages/VideoPlayer";
import { useAuth } from "./context/useAuth";

function App() {
  const { user } = useAuth();

  // ✅ ALL hooks together at top
  const [showRegister, setShowRegister] = useState(false);
  const [page, setPage] = useState("home");
  const [selectedVideo, setSelectedVideo] = useState(null);

  // 🔐 Auth
  if (!user) {
    return showRegister ? (
      <Register onSwitch={() => setShowRegister(false)} />
    ) : (
      <Login onSwitch={() => setShowRegister(true)} />
    );
  }

  // 👤 Profile pages
  if (page === "profile") {
    return (
      <Profile
        onEdit={() => setPage("edit")}
        onAvatar={() => setPage("avatar")}
        onBack={() => setPage("home")}
      />
    );
  }

  if (page === "edit") {
    return <EditProfile onBack={() => setPage("profile")} />;
  }

  if (page === "avatar") {
    return <ChangeAvatar onBack={() => setPage("profile")} />;
  }

  // 📤 Upload
  if (page === "upload") {
    return <Upload onBack={() => setPage("home")} />;
  }

  // ▶️ Player
  if (page === "player") {
    return (
      <VideoPlayer
        video={selectedVideo}
        onBack={() => setPage("home")}
      />
    );
  }

  // 🏠 Home
  return (
    <Home
      onProfile={() => setPage("profile")}
      onUpload={() => setPage("upload")}
      onOpenVideo={(video) => {
        setSelectedVideo(video);
        setPage("player");
      }}
    />
  );
}

export default App;