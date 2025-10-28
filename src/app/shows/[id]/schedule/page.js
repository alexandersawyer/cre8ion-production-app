import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export const revalidate = 0

export default async function ProductionSchedulePage({ params }) {
  // Fetch the show
  const { data: show } = await supabase
    .from('shows')
    .select('*')
    .eq('id', params.id)
    .single()

  // Fetch schedule items for this show
  const { data: scheduleItems, error } = await supabase
    .from('schedule_items')
    .select('*')
    .eq('show_id', params.id)
    .order('date', { ascending: true })
    .order('start_time', { ascending: true })

  if (error) {
    console.error('Error fetching schedule:', error)
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <div className="mb-4 text-sm text-gray-600">
          <Link href="/shows" className="hover:text-blue-600">Shows</Link>
          {' > '}
          <Link href={`/shows/${params.id}`} className="hover:text-blue-600">{show?.name}</Link>
          {' > '}
          <span className="text-gray-900">Production Schedule</span>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Production Schedule</h1>
            <p className="text-gray-600 mt-1">{show?.name} ({show?.code})</p>
          </div>
          <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            + Add Schedule Item
          </button>
        </div>

        {/* Schedule Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Start Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  End Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Notes
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {scheduleItems && scheduleItems.length > 0 ? (
                scheduleItems.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{item.date}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{item.start_time}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{item.end_time}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{item.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{item.location}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-500">{item.notes}</div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                    No schedule items yet. Click "+ Add Schedule Item" to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Summary Stats */}
        {scheduleItems && scheduleItems.length > 0 && (
          <div className="mt-6 grid grid-cols-3 gap-4">
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-sm text-gray-500">Total Items</div>
              <div className="text-2xl font-bold text-gray-900">{scheduleItems.length}</div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-sm text-gray-500">Unique Dates</div>
              <div className="text-2xl font-bold text-gray-900">
                {new Set(scheduleItems.map(item => item.date)).size}
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-sm text-gray-500">Locations</div>
              <div className="text-2xl font-bold text-gray-900">
                {new Set(scheduleItems.map(item => item.location)).size}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}