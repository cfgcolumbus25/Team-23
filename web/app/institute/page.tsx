import { InstituteForm } from './InstituteForm'

interface PageProps {
  params: { id: string }
  searchParams: { [key: string]: string | string[] | undefined }
}

export default function InstitutePage({ params, searchParams }: PageProps) {
  const instituteId = params?.id || '1' // Default to '1' for demo
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <h1 className="text-2xl font-semibold mb-6">Institute Policy Settings</h1>
      <InstituteForm instituteId="12345" />
    </main>
  )
}
