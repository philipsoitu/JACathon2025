import Link from "next/link"
import { ArrowRight, Map, Calendar, Users, ThumbsUp } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-emerald-600">TripSync</h1>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/login">Login</Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/signup">Sign up</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="px-4 py-12 md:py-20 bg-gradient-to-b from-emerald-50 to-white">
          <div className="max-w-md mx-auto text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Plan trips together in real-time
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Collaborate with friends on your next adventure. Add destinations, vote on activities, and watch changes
              sync instantly.
            </p>
            <div className="mt-8">
              <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700" asChild>
                <Link href="/trips/new">
                  Create a Trip <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>

          {/* Mobile App Preview */}
          <div className="mt-12 max-w-sm mx-auto">
            <div className="relative mx-auto border-gray-800 dark:border-gray-800 bg-gray-800 border-[14px] rounded-[2.5rem] h-[600px] w-[300px] shadow-xl">
              <div className="w-[148px] h-[18px] bg-gray-800 top-0 rounded-b-[1rem] left-1/2 -translate-x-1/2 absolute"></div>
              <div className="h-[46px] w-[3px] bg-gray-800 absolute -left-[17px] top-[124px] rounded-l-lg"></div>
              <div className="h-[46px] w-[3px] bg-gray-800 absolute -left-[17px] top-[178px] rounded-l-lg"></div>
              <div className="h-[64px] w-[3px] bg-gray-800 absolute -right-[17px] top-[142px] rounded-r-lg"></div>
              <div className="rounded-[2rem] overflow-hidden w-[272px] h-[572px] bg-white">
                <div className="flex flex-col h-full">
                  <div className="bg-emerald-600 text-white p-4">
                    <h3 className="text-lg font-semibold">North America Climbing Trip</h3>
                    <p className="text-sm text-emerald-100">May 15 - June 10, 2025</p>
                  </div>
                  <div className="flex-1 overflow-auto">
                    <div className="p-3 border-b">
                      <div className="text-sm font-medium text-gray-500">DAY 1 - MAY 15</div>
                      <div className="mt-2 p-3 bg-white rounded-lg border border-gray-200 shadow-sm">
                        <div className="flex items-start">
                          <div className="bg-emerald-100 p-2 rounded-lg">
                            <Map className="h-5 w-5 text-emerald-600" />
                          </div>
                          <div className="ml-3 flex-1">
                            <h4 className="font-medium">Yosemite National Park</h4>
                            <p className="text-sm text-gray-500">Arrival & Camp Setup</p>
                            <div className="mt-2 flex items-center text-xs text-gray-500">
                              <ThumbsUp className="h-3.5 w-3.5 mr-1 text-emerald-500" />
                              <span>5 votes</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="mt-2 p-3 bg-white rounded-lg border border-gray-200 shadow-sm">
                        <div className="flex items-start">
                          <div className="bg-blue-100 p-2 rounded-lg">
                            <Calendar className="h-5 w-5 text-blue-600" />
                          </div>
                          <div className="ml-3 flex-1">
                            <h4 className="font-medium">El Capitan Hike</h4>
                            <p className="text-sm text-gray-500">2:00 PM - 6:00 PM</p>
                            <div className="mt-2 flex items-center text-xs text-gray-500">
                              <ThumbsUp className="h-3.5 w-3.5 mr-1 text-emerald-500" />
                              <span>3 votes</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="p-3 border-t bg-gray-50">
                    <div className="flex justify-between">
                      <button className="p-2 rounded-full bg-white border border-gray-200">
                        <Map className="h-5 w-5 text-gray-600" />
                      </button>
                      <button className="p-2 rounded-full bg-white border border-gray-200">
                        <Calendar className="h-5 w-5 text-gray-600" />
                      </button>
                      <button className="p-2 rounded-full bg-emerald-600 text-white">
                        <Users className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="px-4 py-12 bg-white">
          <div className="max-w-md mx-auto">
            <h2 className="text-2xl font-bold text-center text-gray-900">Key Features</h2>
            <div className="mt-8 space-y-8">
              <div className="flex">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-md bg-emerald-100 text-emerald-600">
                    <Map className="h-6 w-6" />
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Interactive Maps</h3>
                  <p className="mt-2 text-base text-gray-500">
                    Pin hotels, activities, and points of interest on a shared map that updates in real-time.
                  </p>
                </div>
              </div>

              <div className="flex">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-md bg-emerald-100 text-emerald-600">
                    <Calendar className="h-6 w-6" />
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Drag & Drop Timeline</h3>
                  <p className="mt-2 text-base text-gray-500">
                    Easily reorder days or move activities to different time slots with intuitive drag-and-drop.
                  </p>
                </div>
              </div>

              <div className="flex">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-md bg-emerald-100 text-emerald-600">
                    <ThumbsUp className="h-6 w-6" />
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Voting & Comments</h3>
                  <p className="mt-2 text-base text-gray-500">
                    Vote on suggestions and leave comments to build consensus on your itinerary.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-200 py-8 px-4">
        <div className="max-w-md mx-auto text-center">
          <h2 className="text-xl font-bold text-emerald-600">TripSync</h2>
          <p className="mt-2 text-sm text-gray-500">Plan your next adventure together, in real-time.</p>
          <div className="mt-4 flex justify-center space-x-6">
            <a href="#" className="text-gray-400 hover:text-gray-500">
              Terms
            </a>
            <a href="#" className="text-gray-400 hover:text-gray-500">
              Privacy
            </a>
            <a href="#" className="text-gray-400 hover:text-gray-500">
              Contact
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
