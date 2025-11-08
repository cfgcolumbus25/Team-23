import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="max-w-2xl mx-auto text-center px-4">
        <h1 className="text-4xl font-bold mb-4 text-gray-900">
          CLEP Acceptance Tool Institution Portal
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Manage your institution's CLEP exam acceptance policies
        </p>

        <div className="flex gap-4 justify-center">
          <Link
            href="/login"
            className="bg-[#66b10e] hover:bg-[#5a9e0d] text-white py-3 px-8 rounded-lg transition-colors font-semibold"
          >
            Login
          </Link>
          <Link
            href="/signup"
            className="bg-white hover:bg-gray-50 text-[#66b10e] border-2 border-[#66b10e] py-3 px-8 rounded-lg transition-colors font-semibold"
          >
            Sign Up
          </Link>
        </div>

        <div className="mt-12 text-sm text-gray-500">
          <p>Already have an account? Login to manage your CLEP policies.</p>
          <p className="mt-2">
            Need access? Contact your institution administrator.
          </p>
        </div>
      </div>
    </main>
  );
}
