export default function Sidebar() {
  return (
    <aside class="w-110 rounded-xl bg-[#151212] text-white h-[calc(100vh-60px)] p-5 box-border">
      <div class="flex justify-between">
        <h3 class="font-bold">Your Library</h3>
        <div class=" flex gap-6 items-center bg-[#292626] px-4 py-0.5 rounded-3xl">
          <p class="text-3xl">+</p>
          <p class="">Create</p>
        </div>
      </div>

    </aside>
  );
}