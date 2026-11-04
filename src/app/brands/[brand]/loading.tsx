/* Shown the moment a brand tile is clicked, while the brand page loads (it reads the database, which can take a few seconds).
   Without it the click looked like it did nothing, so people thought only "Explore brand" was a link. */

export default function Loading() {
  return (
    <div className="min-h-screen bg-white" aria-busy="true" aria-live="polite">
      <div className="mx-auto max-w-[1200px] px-5 sm:px-8 lg:px-12 pt-8 pb-24 animate-pulse">
        <span className="sr-only">Loading the brand page</span>
        <div className="h-4 w-56 rounded bg-[#f1eeea] mb-12" />
        <div className="flex items-center gap-5">
          <div className="h-[88px] w-[88px] rounded-2xl bg-[#f1eeea]" />
          <div className="h-12 w-64 max-w-[60%] rounded bg-[#f1eeea]" />
        </div>
        <div className="mt-6 h-4 w-full max-w-[660px] rounded bg-[#f1eeea]" />
        <div className="mt-3 h-4 w-3/4 max-w-[500px] rounded bg-[#f1eeea]" />
        <div className="mt-14 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="rounded-[14px] border border-[#e5dfd6] overflow-hidden">
              <div className="aspect-square bg-[#f7f5f2]" />
              <div className="p-4 flex flex-col gap-2">
                <div className="h-3 w-1/3 rounded bg-[#f1eeea]" />
                <div className="h-4 w-4/5 rounded bg-[#f1eeea]" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
