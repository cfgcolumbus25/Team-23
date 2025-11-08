'use server'

export async function updateInstitute(instituteId: string, formData: FormData) {
  const data = {
    maxCredits: parseInt(formData.get('maxCredits') as string, 10),
    useFailedCourses: formData.get('useFailedCourses') === 'on',
    enrolledCanUseClep: formData.get('enrolledCanUseClep') === 'on',
    scoreValidity: parseInt(formData.get('scoreValidity') as string, 10),
  }

  console.log('Updating institute:', instituteId, data)
  // Sending information to the backend.
}
