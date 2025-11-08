'use server'

import { InstitutionData } from './types'
import fs from 'fs/promises'
import path from 'path'

// Mock function to fetch data - replace with your actual database call
export async function fetchInstituteData(instituteId: string): Promise<InstitutionData | null> {
  try {
    
    // In production, this would be a database query
    // For now, reading from a local JSON file as an example
    const dataPath = path.join(process.cwd(), 'data.json')
    const fileContent = await fs.readFile(dataPath, 'utf-8')
    const data = JSON.parse(fileContent)
    
    // Find the institution by ID
    const institutionKey = `institution_uuid_${instituteId}`
    if (data.institutions && data.institutions[institutionKey]) {
      console.log('Looking for institution:', institutionKey)
      console.log('Data found:', data.institutions?.[institutionKey])
      return data.institutions[institutionKey]
    }
    
    // If not found, return default structure WITH exam_name
    return {
      institution_info: {
        max_credits: 30,
        'Can Use For Failed Courses': 0,
        'Can Enrolled Students Use CLEP': 0,
        'Score Validity': '3',  // Changed to string based on earlier discussion
      },
      clep_acceptance: [],
      updated_by: '',
      last_updated: new Date().toISOString(),
    }
  } catch (error) {
    console.error('Error fetching institute data:', error)
    // Return default structure on error WITH exam_name
    return {
      institution_info: {
        max_credits: 30,
        'Can Use For Failed Courses': 0,
        'Can Enrolled Students Use CLEP': 0,
        'Score Validity': '3',  // Changed to string based on earlier discussion
      },
      clep_acceptance: [],
      updated_by: '',
      last_updated: new Date().toISOString(),
    }
  }
}

// Updated function to save institute data
export async function updateInstitute(instituteId: string, data: InstitutionData) {
  try {
    console.log('Updating institute:', instituteId, data)
    
    // Validate the data
    validateInstitutionData(data)
    
    // For now, we'll update the local JSON file as an example
    const dataPath = path.join(process.cwd(), 'data.json')
    
    // Read existing data
    let fileContent = '{}'
    try {
      fileContent = await fs.readFile(dataPath, 'utf-8')
    } catch (error) {
      // File doesn't exist, create new structure
      fileContent = JSON.stringify({ institutions: {} })
    }
    
    const jsonData = JSON.parse(fileContent)
    
    // Update the specific institution
    const institutionKey = `institution_uuid_${instituteId}`
    jsonData.institutions = jsonData.institutions || {}
    jsonData.institutions[institutionKey] = data
    
    // Write back to file
    await fs.writeFile(dataPath, JSON.stringify(jsonData, null, 2))
    
    return { success: true, message: 'Institute data updated successfully' }
  } catch (error) {
    console.error('Error updating institute:', error)
    throw new Error('Failed to update institute data')
  }
}

// Validation function
function validateInstitutionData(data: InstitutionData) {
  // Validate institution_info
  if (!data.institution_info) {
    throw new Error('Institution info is required')
  }
  
  const { max_credits, 'Score Validity': scoreValidity } = data.institution_info
  
  if (max_credits < 0 || max_credits > 120) {
    throw new Error('Max credits must be between 0 and 120')
  }
  
  const validity = Number(scoreValidity);

  if (isNaN(validity) || validity < 0 || validity > 10) {
    throw new Error('Score validity must be between 0 and 10 years');
  }

  // Validate CLEP acceptances
  if (data.clep_acceptance && Array.isArray(data.clep_acceptance)) {
    data.clep_acceptance.forEach((item, index) => {
      // Find the exam key
      const examKey = Object.keys(item).find(key => key.startsWith('exam_id_'))
      if (!examKey) {
        throw new Error(`CLEP acceptance item ${index} must have an exam_id_X key`)
      }
      
      const examData = item[examKey]
      
      if (typeof examData === 'object' && examData !== null) {
        if (!examData.exam_name || examData.cut_score < 20 || examData.cut_score > 80) {
          throw new Error(`Cut score for ${examKey} must be between 20 and 80`)
        }
        
        if (examData.credits_awarded < 0 || examData.credits_awarded > 12) {
          throw new Error(`Credits awarded for ${examKey} must be between 0 and 12`)
        }
        
        if (!examData.course_equivalents || examData.course_equivalents.trim() === '') {
          throw new Error(`Course equivalents for ${examKey} cannot be empty`)
        }
      }
    })
  }
}

// Helper function to get all institutions (for listing page)
export async function getAllInstitutions() {
  try {
    const dataPath = path.join(process.cwd(), 'data.json')
    const fileContent = await fs.readFile(dataPath, 'utf-8')
    const data = JSON.parse(fileContent)
    
    // Transform to array format for easier listing
    const institutions = Object.entries(data.institutions || {}).map(([id, inst]: [string, any]) => ({
      id,
      name: inst.institution_info?.name || id,
      max_credits: inst.institution_info?.max_credits,
      last_updated: inst.last_updated,
      clep_test_count: inst.clep_acceptance?.length || 0,
    }))
    
    return institutions
  } catch (error) {
    console.error('Error fetching all institutions:', error)
    return []
  }
}
