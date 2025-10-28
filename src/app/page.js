import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Cre8ion Production App
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Welcome to your custom production management system.
        </p>
        
        <Link 
          href="/shows"
          className="inline-block bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors text-lg font-semibold"
        >
          View All Shows →
        </Link>
      </div>
    </div>
  )
}