// Types for the CLEP Database structure
export interface ExamDetails {
  exam_name: string  
  cut_score: number
  credits_awarded: number
  course_equivalents: string
}

export interface CLEPAcceptance {
  id: number
  [key: string]: number | ExamDetails // Allow dynamic exam_id_X keys
}

export interface InstitutionInfo {
  max_credits: number
  'Can Use For Failed Courses': 0 | 1
  'Can Enrolled Students Use CLEP': 0 | 1
  'Score Validity': string
}

export interface InstitutionData {
  institution_info: InstitutionInfo
  clep_acceptance: CLEPAcceptance[]
  updated_by: string
  last_updated: string
}

export interface InstitutionsDatabase {
  institutions: {
    [institution_uuid: string]: InstitutionData
  }
}
