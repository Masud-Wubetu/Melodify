export default function Sidebar() {
  return (
    <aside class="w-110 rounded-xl bg-[#151212] text-white h-[calc(100vh-60px)] p-5 box-border">
      <div class="flex justify-between">
        <h3 class="font-bold">Your Library</h3>
        <div class=" flex gap-2 items-center bg-[#292626] px-4 py-0.5 rounded-3xl">
          <p class="text-2xl">+</p>
          <p class="">Create</p>
        </div>
      </div>

      <div class="w-auto h-48 p-6 rounded-2xl bg-[#292626] mt-24 border border-gray-300 hover:border-blue-500 transition">
        <p class="font-bold">Create your playlist first</p>
        <p class="mt-5">It's easy we will guide you</p>
        <button class="text-black px-2.5 py-2 hover:bg-blue-700 active:scale-95 
                       transition duration-150 w-36 p-1 bg-white mt-7 rounded-3xl
                       hover:scale-105 transition duration-300">
          Create playlist
        </button>
      </div>

      <div class="w-auto h-48 p-6 rounded-2xl bg-[#292626] mt-24 border border-gray-300 hover:border-blue-500 transition">
        <p class="font-bold">Explore podcasts and start listening!</p>
        <p class="mt-5">Stay tuned for updates on new episodes</p>
        <button class="text-black px-2.5 py-2 hover:bg-blue-700 active:scale-95 
                       transition duration-150 w-36 p-1 bg-white mt-7 rounded-3xl
                       hover:scale-105 transition duration-300">
          Browse podcasts
        </button>
      </div>

    </aside>
  );
}