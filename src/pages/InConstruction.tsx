export default function InConstruction() {
    return (
      <div className="h-full w-full flex items-center justify-center bg-background text-textPrimary p-8">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="relative">
            <span className="text-3xl font-semibold">🚧 Page Under Construction</span>
            <span className="absolute -top-2 -right-4 w-3 h-3 bg-primary rounded-full animate-ping"></span>
          </div>
          <p className="text-gray-500 max-w-md">
            This page is currently being built. Please check back soon to see what's coming!
          </p>
        </div>
      </div>
    );
  }
  