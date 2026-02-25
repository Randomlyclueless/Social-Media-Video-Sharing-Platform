import { useState } from "react";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import EditProfile from "./pages/EditProfile";
import ChangeAvatar from "./pages/ChangeAvatar";
import Home from "./pages/Home";
import Upload from "./pages/Upload";
import VideoPlayer from "./pages/VideoPlayer";
import Channel from "./pages/Channel";
import { useAuth } from "./context/useAuth";

function App() {
  const { user } = useAuth();

  // Auth toggle
  const [showRegister, setShowRegister] = useState(false);

  // Navigation state
  const [page, setPage] = useState("home");

  // Selected entities
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [selectedChannel, setSelectedChannel] = useState(null);

  // 🔐 Auth
  if (!user) {
    return showRegister ? (
      <Register onSwitch={() => setShowRegister(false)} />
    ) : (
      <Login onSwitch={() => setShowRegister(true)} />
    );
  }

  // 👤 Profile
  if (page === "profile") {
    return (
      <Profile
        onEdit={() => setPage("edit")}
        onAvatar={() => setPage("avatar")}
        onBack={() => setPage("home")}
        onChannel={(username) => {
          setSelectedChannel(username);
          setPage("channel");
        }}
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
  onChannel={(username) => {
    setSelectedChannel(username);
    setPage("channel");
  }}
/>
    );
  }

  // 📺 Channel
  if (page === "channel") {
    return (
      <Channel
        username={selectedChannel}
        onBack={() => setPage("home")}
        onOpenVideo={(video) => {
          setSelectedVideo(video);
          setPage("player");
        }}
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
      onChannel={(username) => {
        setSelectedChannel(username);
        setPage("channel");
      }}
    />
  );
}

export default App;