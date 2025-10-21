
import Link from 'next/link';

async function getCareers() {
  const baseUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const res = await fetch(`${baseUrl}/api/careers`, {
    next: { revalidate: 60 },
    cache: 'no-store',
  });
  if (!res.ok) throw new Error('Failed to fetch careers');
  return res.json();
}

export default async function CareersPage() {
  const careers = await getCareers();

  return (
    <main className="max-w-4xl mx-auto py-20 px-4 bg-[#f6f6f6] min-h-screen">
      <div className="mb-12 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4 leading-tight">Careers at Avidato</h1>
        <p className="text-lg text-gray-700 mb-2">Join our mission to empower educators and learners worldwide. Explore open roles and apply via Typeform.</p>
      </div>
      <div className="flex flex-col gap-8">
        {careers.map(role => (
          <div key={role.id} className="border rounded-xl bg-white p-8 shadow flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">{role.title}</h2>
              <p className="mb-3 text-gray-700">{role.description || `We're looking for talented ${role.title}${role.title.endsWith('s') ? 'es' : 's'} to join our team.`}</p>
              <div className="flex gap-3 mb-2 flex-wrap">
                <span className="inline-flex items-center px-3 py-1 text-xs font-semibold bg-gray-100 text-gray-800 rounded-full border border-gray-300">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657A8 8 0 1 1 6.343 5.343a8 8 0 0 1 11.314 11.314z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" /></svg>
                  100% remote
                </span>
                <span className="inline-flex items-center px-3 py-1 text-xs font-semibold bg-gray-100 text-gray-800 rounded-full border border-gray-300">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2" /></svg>
                  Full-time
                </span>
              </div>
            </div>
            <div className="flex-shrink-0 mt-4 md:mt-0 md:ml-8">
              <Link href={role.typeformUrl} target="_blank" className="inline-flex items-center px-5 py-2 bg-black text-white font-semibold rounded-lg hover:bg-gray-800 transition">
                Apply
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 7l-10 10M17 7H7m10 0v10" /></svg>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
