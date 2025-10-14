import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

export default async function AuthTest() {
  const session = await getServerSession(authOptions)

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">NextAuth Test Page</h1>
      
      {session ? (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          <h2 className="font-bold">✅ Authentication Working!</h2>
          <p><strong>User ID:</strong> {session.user?.id}</p>
          <p><strong>Name:</strong> {session.user?.name || "Not set"}</p>
          <p><strong>Email:</strong> {session.user?.email || "Not set"}</p>
        </div>
      ) : (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
          <h2 className="font-bold">⚠️ Not Authenticated</h2>
          <p>No active session found.</p>
        </div>
      )}
      
      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-2">Test Authentication:</h3>
        <div className="space-y-2">
          <a 
            href="/api/auth/signin" 
            className="inline-block bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Sign In
          </a>
          <a 
            href="/api/auth/signout" 
            className="inline-block bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 ml-2"
          >
            Sign Out
          </a>
        </div>
      </div>
    </div>
  )
}