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

      <div class="w-auto h-48 p-6 rounded-2xl bg-[#292626] mt-24">
        <p class="font-bold">Create your playlist first</p>
        <p class="mt-5">It's easy we will guide you</p>
        <div class=" w-36 p-1 bg-white mt-7 rounded-3xl">
          <p class="text-black text-center font-bold">Create playlist</p>
        </div>
      </div>

    </aside>
  );
}