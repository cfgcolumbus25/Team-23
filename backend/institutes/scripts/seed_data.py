"""
Seed script to populate Supabase database with initial institution data
"""
from supabase_client import supabase
from datetime import datetime
from dotenv import load_dotenv

# Load environment variables
load_dotenv()


# Sample Institutions Data
institutions_data = [
    {
        "msea_org_id": "ipeds-196130",
        "name": "SUNY Buffalo",
        "city": "Buffalo",
        "state": "NY",
        "zipcode": "12345",
        "enrollment": 1005,
        "max_credits": 30,
        "transcription_fee": 50,
        "can_use_for_failed_courses": True,
        "can_enrolled_students_use_clep": False,
        "score_validity_years": 5,
        "website_url": "suny.edu"
    },
    {
        "msea_org_id": "ipeds-165015",
        "name": "Brandeis University",
        "city": "Waltham",
        "state": "MA",
        "zipcode": "34575",
        "enrollment": 16068,
        "max_credits": 72,
        "transcription_fee": 0,
        "can_use_for_failed_courses": False,
        "can_enrolled_students_use_clep": False,
        "score_validity_years": 4,
        "website_url": "brandeis.edu"
    },
    {
        "msea_org_id": "ipeds-130934",
        "name": "Delaware State University",
        "city": "Dover",
        "state": "DE",
        "zipcode": "36370",
        "enrollment": 27872,
        "max_credits": 18,
        "transcription_fee": 5,
        "can_use_for_failed_courses": True,
        "can_enrolled_students_use_clep": True,
        "score_validity_years": 6,
        "website_url": "delaware.edu"
    },
    {
        "msea_org_id": "ipeds-202523",
        "name": "Denison University",
        "city": "Granville",
        "state": "OH",
        "zipcode": "13922",
        "enrollment": 51498,
        "max_credits": 78,
        "transcription_fee": 10,
        "can_use_for_failed_courses": True,
        "can_enrolled_students_use_clep": True,
        "score_validity_years": 10,
        "website_url": "denison.edu"
    },
    {
        "msea_org_id": "ipeds-144740",
        "name": "DePaul University",
        "city": "Chicago",
        "state": "IL",
        "zipcode": "51059",
        "enrollment": 949,
        "max_credits": 93,
        "transcription_fee": 15,
        "can_use_for_failed_courses": True,
        "can_enrolled_students_use_clep": False,
        "score_validity_years": 6,
        "website_url": "depaul.edu"
    },
    {
        "msea_org_id": "ipeds-212054",
        "name": "Drexel University",
        "city": "Philadelphia",
        "state": "PA",
        "zipcode": "62026",
        "enrollment": 48035,
        "max_credits": 63,
        "transcription_fee": 20,
        "can_use_for_failed_courses": True,
        "can_enrolled_students_use_clep": False,
        "score_validity_years": 3,
        "website_url": "drexel.edu"
    },
    {
        "msea_org_id": "ipeds-171100",
        "name": "Michigan State University",
        "city": "East Lansing",
        "state": "MI",
        "zipcode": "14530",
        "enrollment": 42442,
        "max_credits": 15,
        "transcription_fee": 15,
        "can_use_for_failed_courses": False,
        "can_enrolled_students_use_clep": True,
        "score_validity_years": 7,
        "website_url": "michigan.edu"
    },
    {
        "msea_org_id": "ipeds-185828",
        "name": "New Jersey Institute Of Technology",
        "city": "Newark",
        "state": "NJ",
        "zipcode": "17123",
        "enrollment": 44395,
        "max_credits": 42,
        "transcription_fee": 20,
        "can_use_for_failed_courses": False,
        "can_enrolled_students_use_clep": True,
        "score_validity_years": 2,
        "website_url": "new.edu"
    },
    {
        "msea_org_id": "ipeds-193900",
        "name": "New York University",
        "city": "New York",
        "state": "NY",
        "zipcode": "42608",
        "enrollment": 46504,
        "max_credits": 18,
        "transcription_fee": 15,
        "can_use_for_failed_courses": False,
        "can_enrolled_students_use_clep": False,
        "score_validity_years": 4,
        "website_url": "new.edu"
    },
    {
        "msea_org_id": "ipeds-204635",
        "name": "Ohio Northern University",
        "city": "Ada",
        "state": "OH",
        "zipcode": "25627",
        "enrollment": 46867,
        "max_credits": 12,
        "transcription_fee": 10,
        "can_use_for_failed_courses": True,
        "can_enrolled_students_use_clep": True,
        "score_validity_years": 4,
        "website_url": "ohio.edu"
    },
    {
        "msea_org_id": "ipeds-204796",
        "name": "Ohio State University",
        "city": "Columbus",
        "state": "OH",
        "zipcode": "33303",
        "enrollment": 17926,
        "max_credits": 21,
        "transcription_fee": 5,
        "can_use_for_failed_courses": True,
        "can_enrolled_students_use_clep": True,
        "score_validity_years": 9,
        "website_url": "ohio.edu"
    },
    {
        "msea_org_id": "ipeds-163851",
        "name": "Salisbury University",
        "city": "Salisbury",
        "state": "MD",
        "zipcode": "39686",
        "enrollment": 8753,
        "max_credits": 66,
        "transcription_fee": 50,
        "can_use_for_failed_courses": True,
        "can_enrolled_students_use_clep": True,
        "score_validity_years": 6,
        "website_url": "salisbury.edu"
    },
    {
        "msea_org_id": "ipeds-196413",
        "name": "Syracuse University",
        "city": "Syracuse",
        "state": "NY",
        "zipcode": "54481",
        "enrollment": 24525,
        "max_credits": 21,
        "transcription_fee": 45,
        "can_use_for_failed_courses": False,
        "can_enrolled_students_use_clep": False,
        "score_validity_years": 8,
        "website_url": "syracuse.edu"
    },
    {
        "msea_org_id": "ipeds-216339",
        "name": "Temple University",
        "city": "Philadelphia",
        "state": "PA",
        "zipcode": "71632",
        "enrollment": 41542,
        "max_credits": 66,
        "transcription_fee": 40,
        "can_use_for_failed_courses": False,
        "can_enrolled_students_use_clep": False,
        "score_validity_years": 9,
        "website_url": "temple.edu"
    },
    {
        "msea_org_id": "ipeds-164076",
        "name": "Towson University",
        "city": "Towson",
        "state": "MD",
        "zipcode": "98918",
        "enrollment": 42752,
        "max_credits": 24,
        "transcription_fee": 35,
        "can_use_for_failed_courses": False,
        "can_enrolled_students_use_clep": True,
        "score_validity_years": 1,
        "website_url": "towson.edu"
    },
    {
        "msea_org_id": "ipeds-168148",
        "name": "Tufts University",
        "city": "Medford",
        "state": "MA",
        "zipcode": "46386",
        "enrollment": 11273,
        "max_credits": 24,
        "transcription_fee": 30,
        "can_use_for_failed_courses": True,
        "can_enrolled_students_use_clep": False,
        "score_validity_years": 10,
        "website_url": "tufts.edu"
    },
    {
        "msea_org_id": "ipeds-132903",
        "name": "University Of Central Florida",
        "city": "Orlando",
        "state": "FL",
        "zipcode": "41755",
        "enrollment": 38702,
        "max_credits": 45,
        "transcription_fee": 25,
        "can_use_for_failed_courses": True,
        "can_enrolled_students_use_clep": True,
        "score_validity_years": 8,
        "website_url": "university.edu"
    },
    {
        "msea_org_id": "ipeds-202480",
        "name": "University Of Dayton",
        "city": "Dayton",
        "state": "OH",
        "zipcode": "60512",
        "enrollment": 18899,
        "max_credits": 36,
        "transcription_fee": 20,
        "can_use_for_failed_courses": False,
        "can_enrolled_students_use_clep": False,
        "score_validity_years": 2,
        "website_url": "university.edu"
    },
    {
        "msea_org_id": "ipeds-130943",
        "name": "University of Delaware",
        "city": "Newark",
        "state": "DE",
        "zipcode": "24753",
        "enrollment": 29813,
        "max_credits": 3,
        "transcription_fee": 15,
        "can_use_for_failed_courses": True,
        "can_enrolled_students_use_clep": False,
        "score_validity_years": 6,
        "website_url": "university.edu"
    },
    {
        "msea_org_id": "ipeds-170976",
        "name": "University of Michigan",
        "city": "Ann Arbor",
        "state": "MI",
        "zipcode": "10463",
        "enrollment": 36190,
        "max_credits": 78,
        "transcription_fee": 10,
        "can_use_for_failed_courses": False,
        "can_enrolled_students_use_clep": False,
        "score_validity_years": 5,
        "website_url": "university.edu"
    },
    {
        "msea_org_id": "ipeds-221999",
        "name": "Vanderbilt University",
        "city": "Nashville",
        "state": "TN",
        "zipcode": "51923",
        "enrollment": 26933,
        "max_credits": 3,
        "transcription_fee": 15,
        "can_use_for_failed_courses": True,
        "can_enrolled_students_use_clep": True,
        "score_validity_years": 8,
        "website_url": "vanderbilt.edu"
    },
    {
        "msea_org_id": "ipeds-206604",
        "name": "Wright State University",
        "city": "Dayton",
        "state": "OH",
        "zipcode": "36374",
        "enrollment": 6451,
        "max_credits": 39,
        "transcription_fee": 20,
        "can_use_for_failed_courses": True,
        "can_enrolled_students_use_clep": True,
        "score_validity_years": 9,
        "website_url": "wright.edu"
    }
]

# Contacts Data
contacts_data = [
    {
        "cid": 5,
        "msea_org_id": "ipeds-196130",
        "first_name": "Ben",
        "last_name": "Shapiro",
        "email": "ben@sunybuffalo.edu",
        "phone": "716.555.1234",
        "title": "Registrar"
    },
    {
        "cid": 6,
        "msea_org_id": "ipeds-196130",
        "first_name": "John",
        "last_name": "Smith",
        "email": "john@sunybuffalo.edu",
        "phone": "716.555.1235",
        "title": "Registrar"
    },
    {
        "cid": 7,
        "msea_org_id": "ipeds-204796",
        "first_name": "Shaun",
        "last_name": "Yoder",
        "email": "shaun@theohio.edu",
        "phone": "614.867.5309",
        "title": "Registrar"
    }
]

# Exams Data (39 CLEP exams)
exams_data = [
    {"eid": 1, "name": "American Government"},
    {"eid": 2, "name": "American Literature"},
    {"eid": 3, "name": "Analyzing and Interpreting Literature"},
    {"eid": 4, "name": "Biology"},
    {"eid": 5, "name": "Calculus"},
    {"eid": 6, "name": "Chemistry"},
    {"eid": 7, "name": "College Algebra"},
    {"eid": 8, "name": "College Composition"},
    {"eid": 9, "name": "College Composition Modular"},
    {"eid": 10, "name": "College Mathematics"},
    {"eid": 11, "name": "English Literature"},
    {"eid": 12, "name": "Financial Accounting"},
    {"eid": 13, "name": "French Language Level I"},
    {"eid": 14, "name": "French Language Level II"},
    {"eid": 15, "name": "German Language Level I"},
    {"eid": 16, "name": "German Language Level II"},
    {"eid": 17, "name": "History of the United States I"},
    {"eid": 18, "name": "History of the United States II"},
    {"eid": 19, "name": "Human Growth and Development"},
    {"eid": 20, "name": "Humanities"},
    {"eid": 21, "name": "Information Systems"},
    {"eid": 22, "name": "Introduction to Educational Psychology"},
    {"eid": 23, "name": "Introductory Business Law"},
    {"eid": 24, "name": "Introductory Psychology"},
    {"eid": 25, "name": "Introductory Sociology"},
    {"eid": 26, "name": "Natural Sciences"},
    {"eid": 27, "name": "Precalculus"},
    {"eid": 28, "name": "Principles of Macroeconomics"},
    {"eid": 29, "name": "Principles of Management"},
    {"eid": 30, "name": "Principles of Marketing"},
    {"eid": 31, "name": "Principles of Microeconomics"},
    {"eid": 32, "name": "Social Sciences and History"},
    {"eid": 33, "name": "Spanish Language Level I"},
    {"eid": 34, "name": "Spanish Language Level II"},
    {"eid": 35, "name": "Spanish With Writing Level I"},
    {"eid": 36, "name": "Spanish With Writing Level II"},
    {"eid": 37, "name": "Western Civilization I"},
    {"eid": 38, "name": "Western Civilization II"}
]

# Acceptance/Policies Data
acceptance_data = [
    {
        "aid": 1,
        "msea_org_id": "ipeds-196130",  # SUNY Buffalo
        "eid": 14,
        "cut_score": 55,
        "credits": 3,
        "related_course": "BIO 102",
        "updated_by": "5",
        "last_updated": "11/3/2025 11:23:59"
    },
    {
        "aid": 2,
        "msea_org_id": "ipeds-196130",  # SUNY Buffalo
        "eid": 17,
        "cut_score": 60,
        "credits": 4,
        "related_course": "HIST 105",
        "updated_by": "5",
        "last_updated": "1/1/2000 17:55:03"
    },
    {
        "aid": 3,
        "msea_org_id": "ipeds-204796",  # Ohio State University
        "eid": 14,
        "cut_score": 50,
        "credits": 3,
        "related_course": "FREN 102",
        "updated_by": "7",
        "last_updated": "1/1/2000 17:55:03"
    }
]


def insert_institutions():
    """Insert institutions into the database"""
    print("Inserting institutions...")
    
    for inst in institutions_data:
        try:
            # Map to database schema - only include fields that exist in the table
            db_record = {
                "org_id": inst["msea_org_id"],
                "name": inst["name"],
                "city": inst["city"],
                "state": inst["state"],
                "zip": inst["zipcode"],
                "enrollment": inst["enrollment"],
                "max_credits": inst["max_credits"],
                "transcription_fee": inst["transcription_fee"],
                "can_use_for_failed_courses": inst["can_use_for_failed_courses"],
                "can_enrolled_students_use_clep": inst["can_enrolled_students_use_clep"],
                "score_validity": str(inst["score_validity_years"]) + " years",
                "clep_web_url": inst["website_url"]
            }
            
            # Insert and get the ID back
            result = supabase.table('institutions').insert(db_record).execute()
            print(f"✓ Inserted: {inst['name']}")
            
        except Exception as e:
            print(f"✗ Error inserting {inst['name']}: {str(e)}")


def insert_contacts():
    """Insert contacts into a contacts table"""
    print("\nInserting contacts...")
    
    for contact in contacts_data:
        try:
            # Lookup institution_id by org_id
            inst_result = supabase.table('institutions').select('id').eq('org_id', contact["msea_org_id"]).single().execute()
            
            if not inst_result.data:
                print(f"✗ Institution not found for org_id: {contact['msea_org_id']}")
                continue
            
            institution_id = inst_result.data['id']
            
            db_record = {
                "institution_id": institution_id,
                "first_name": contact["first_name"],
                "last_name": contact["last_name"],
                "email": contact["email"],
                "phone": contact["phone"],
                "title": contact["title"]
            }
            
            result = supabase.table('contacts').insert(db_record).execute()
            print(f"✓ Inserted contact: {contact['first_name']} {contact['last_name']}")
            
        except Exception as e:
            print(f"✗ Error inserting contact: {str(e)}")


def insert_exams():
    """Insert CLEP exams into exams table"""
    print("\nInserting CLEP exams...")
    
    for exam in exams_data:
        try:
            db_record = {
                "id": exam["eid"],
                "name": exam["name"]
            }
            
            result = supabase.table('exams').insert(db_record).execute()
            print(f"✓ Inserted exam: {exam['name']}")
            
        except Exception as e:
            print(f"✗ Error inserting exam {exam['name']}: {str(e)}")


def insert_acceptances():
    """Insert acceptance records"""
    print("\nInserting acceptances...")
    
    for acceptance in acceptance_data:
        try:
            # Parse the date
            try:
                last_updated = datetime.strptime(acceptance["last_updated"], "%m/%d/%Y %H:%M:%S")
            except:
                last_updated = datetime.now()
            
            # Lookup institution_id by org_id
            inst_result = supabase.table('institutions').select('id').eq('org_id', acceptance["msea_org_id"]).single().execute()
            
            if not inst_result.data:
                print(f"✗ Institution not found for org_id: {acceptance['msea_org_id']}")
                continue
            
            institution_id = inst_result.data['id']
            
            # Note: updated_by is a contact cid in the source data, but we need contact UUID
            # For now, we'll leave updated_by_contact_id as None since we don't have the mapping
            
            db_record = {
                "institution_id": institution_id,
                "exam_id": acceptance["eid"],
                "cut_score": acceptance["cut_score"],
                "credits": acceptance["credits"],
                "related_course": acceptance["related_course"],
                "updated_by_contact_id": None,  # Would need to lookup contact by cid
                "last_updated": last_updated.isoformat()
            }
            
            result = supabase.table('acceptances').insert(db_record).execute()
            print(f"✓ Inserted acceptance for exam ID {acceptance['eid']}")
            
        except Exception as e:
            print(f"✗ Error inserting acceptance: {str(e)}")


def main():
    """Main execution function"""
    print("=" * 60)
    print("Starting database seeding...")
    print("=" * 60)
    
    try:
        # Insert data in proper order
        insert_institutions()
        insert_contacts()
        insert_exams()
        insert_acceptances()
        
        print("\n" + "=" * 60)
        print("Database seeding completed!")
        print("=" * 60)
        
    except Exception as e:
        print(f"\n✗ Fatal error: {str(e)}")


if __name__ == "__main__":
    main()

