export default function RouteLoading() {
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center p-8">
      <div className="w-9 h-9 rounded-full border-2 border-[#E7DFD5] border-t-[#BD6024] animate-spin" />
      <p className="mt-3 text-xs font-semibold text-[#82756A] tracking-wider uppercase">
        Loading...
      </p>
    </div>
  )
}
