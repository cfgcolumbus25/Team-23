import { InstituteForm } from '../components/InstituteForm'

export default function ManagePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <h1 className="text-2xl font-semibold mb-6">Manage Institution Policies</h1>
      <InstituteForm instituteId="12345" />
    </main>
  )
}

