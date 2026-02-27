import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import API from "../api/axios";

export default function Home() {
  const [songs, setSongs] = useState([]);

  useEffect(() => {
    API.get("/songs/")
      .then((res) => {
        console.log("Backend Response:", res.data);
        const songsArray = res.data?.songs || [];
        console.log("Extracted songs array:", songsArray);
        setSongs(songsArray);
      })
      .catch((err) => console.error(err));
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex flex-1">
    
        <main className="flex-1 p-6 bg-black">
          <h1 className="text-3xl font-bold mb-6 text-white">Top Songs</h1>

          {songs.length === 0 ? (
            <p className="text-white">No songs found</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {songs.map((song) => {
                const cover = song.coverImage || song.album?.coverImage || "";
                const title = song.title || song.album?.title || "Unknown Title";
                const artist = song.artist?.name || "Unknown Artist";

                return (
                  <div key={song._id} className="bg-white p-4 rounded shadow transform transition duration-300 hover:scale-105">
                    {cover && (
                      <img
                        src={cover}
                        alt={title}
                        className="w-full h-40 object-cover rounded mb-2"
                      />
                    )}
                    <h3 className="font-semibold">{title}</h3>
                    <p className="text-sm text-gray-500">{artist}</p>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}