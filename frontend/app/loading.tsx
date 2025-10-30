import { Loader2 } from "lucide-react"

export default function Loading() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section Skeleton */}
      <section className="relative bg-deepGreen py-20 md:py-28">
        <div className="container mx-auto px-4 md:px-6 flex flex-col md:flex-row items-center justify-between">
          <div className="md:w-1/2 text-ivory mb-10 md:mb-0">
            <div className="h-12 bg-gold/20 rounded mb-4 animate-pulse"></div>
            <div className="h-6 bg-gold/15 rounded mb-2 animate-pulse"></div>
            <div className="h-6 bg-gold/15 rounded mb-8 w-3/4 animate-pulse"></div>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="h-12 w-48 bg-brightGold/30 rounded animate-pulse"></div>
              <div className="h-12 w-48 bg-gold/20 rounded animate-pulse"></div>
            </div>
          </div>
          <div className="md:w-1/2 flex justify-center">
            <div className="w-full max-w-md h-64 bg-gold/20 rounded-xl animate-pulse"></div>
          </div>
        </div>
      </section>

      {/* Loading Content */}
      <section className="py-16 bg-softBeige">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex justify-center items-center py-20">
            <div className="text-center">
              <Loader2 className="h-12 w-12 animate-spin text-gold mx-auto mb-4" />
              <h2 className="text-2xl font-semibold text-deepGreen mb-2">Loading Investment Opportunities</h2>
              <p className="text-darkOlive">Please wait while we fetch the latest SAG data...</p>
            </div>
          </div>
        </div>
      </section>

      {/* Content Skeletons */}
      <section className="py-16 bg-ivory">
        <div className="container mx-auto px-4 md:px-6">
          <div className="h-8 bg-deepGreen/20 rounded mb-8 w-64 mx-auto animate-pulse"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-lg p-6 shadow-lg">
                <div className="h-6 bg-deepGreen/20 rounded mb-4 animate-pulse"></div>
                <div className="h-4 bg-deepGreen/15 rounded mb-6 w-3/4 animate-pulse"></div>
                <div className="space-y-3">
                  <div className="h-4 bg-deepGreen/10 rounded animate-pulse"></div>
                  <div className="h-4 bg-deepGreen/10 rounded animate-pulse"></div>
                  <div className="h-4 bg-deepGreen/10 rounded w-2/3 animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
