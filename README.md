# TEAM23 - Democratizing College Credit Recognition

[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Database-green)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.0-38B2AC)](https://tailwindcss.com/)

## Overview

# TEAM23 - Democratizing College Credit Recognition
 is an automation and visualization platform born from a simple yet powerful belief: every learner who has demonstrated college-level knowledge through CLEP exams deserves a clear path to credit recognition. In partnership with Modern States Education Alliance, we're transforming how over 700,000 learners connect with institutions that value their achievements.

### The Challenge We Address
- **For Learners**: Behind every CLEP score is a story of dedication—late nights, sacrificed weekends, and the courage to pursue education independently. Yet finding which colleges honor these achievements remains frustratingly opaque
- **For Institutions**: Registrars and admissions offices genuinely want to maintain current CLEP policies, but manual update processes often fall victim to competing priorities and limited resources

## Key Features

### For Learners - Your Journey, Visualized
- **Interactive Map Discovery**: Transform data points into possibilities—see at a glance which institutions recognize your hard work
- **Personalized Filtering**: Whether you're a working parent, veteran, or first-generation student, filter results by your unique circumstances—exam scores, geographic constraints, and credit needs
- **Portfolio Dashboard**: Your CLEP achievements deserve a home—track, save, and share your academic accomplishments
- **Living Data**: Access information updated by institutions themselves, not outdated PDFs or conflicting web pages

### For Institutions - Simplifying Good Intentions
- **Frictionless Access**: Magic links respect your time—no passwords to remember, no accounts to manage
- **Intelligent Forms**: We remember your policies and pre-populate forms—you only update what's changed
- **Gentle Reminders**: Annual check-ins ensure your commitment to alternative pathways stays visible without adding daily burden
- **Immediate Impact**: Your updates instantly help learners make informed decisions about their educational futures

### For Modern States - Completing the Promise
- **Data Integrity**: Monitor policy freshness to ensure learners have reliable information
- **Engagement Analytics**: Understand how institutions and learners interact with credit pathways
- **Strategic Insights**: Identify opportunities to expand credit recognition and reduce barriers

## Architecture
```
Team-23/
├── backend/              # Flask API server
├── institution-web/      # Next.js institutional portal
├── web/                  # Next.js learner platform
└── database/            # Supabase PostgreSQL
```

## Tech Stack

### Frontend
- **Framework**: Next.js 14 with TypeScript - ensuring accessibility and performance
- **Styling**: Tailwind CSS - creating intuitive, responsive interfaces
- **Maps**: Mapbox - making data exploration engaging and insightful
- **State Management**: React Context API - maintaining seamless user experience
- **Authentication**: Supabase Auth - protecting privacy while reducing friction

### Backend
- **API**: Flask (Python) - reliable, scalable service architecture
- **Database**: Supabase (PostgreSQL) - secure, real-time data management
- **Authentication**: JWT tokens - balancing security with usability
- **Email Service**: Automated magic links - respecting institutional staff time

## Database Schema

Our data architecture reflects the complex relationships between learners, institutions, and credit recognition:

### Users Table
```sql
- id: UUID
- email: string
- name: string
- location: string  # Understanding geographic constraints
- clep_exams: JSON[]  # Honoring each achievement
- created_at: timestamp
```

### Institutions Table
```sql
- id: UUID
- name: string
- location: {city, state, zip}
- max_credits: integer  # Transparency in credit limits
- score_validity: string  # Clear policy timelines
- can_use_for_failed_courses: boolean
- can_enrolled_students_use_clep: boolean
- updated_at: timestamp  # Ensuring data freshness
```

### Acceptances Table
```sql
- id: UUID
- institution_id: UUID
- exam_id: integer
- cut_score: integer  # Clear requirements
- credits: integer  # Tangible value
- related_course: string  # Direct equivalencies
- updated_at: timestamp
```

## Getting Started

### Prerequisites
```bash
- Node.js 18+
- Python 3.11+
- Supabase account
- Git
```

### Installation

1. **Clone and install dependencies**
```bash
# Frontend applications
cd web && npm install
cd ../institution-web && npm install

# Backend service
cd ../backend && pip install -r requirements.txt
```

2. **Environment Setup**
Create `.env` files in each directory (see `.env.example` for templates)

3. **Launch the platform**
```bash
# Backend
cd backend && python app.py

# Learner interface
cd web && npm run dev

# Institution interface
cd institution-web && npm run dev
```

## Usage

### For Learners - Your Path Forward
1. Visit the dashboard at `http://localhost:3000`
2. Create your account—your achievements deserve recognition
3. Enter your CLEP scores—each one represents hours of dedication
4. Explore matching institutions—visualize your possibilities
5. Build your favorites—create your personalized pathway

### For Institutions - Streamlined Updates
1. Receive your secure magic link
2. Click to access your pre-populated form
3. Review and update only what's changed
4. Submit to instantly help thousands of learners

### For Administrators - Strategic Oversight
1. Monitor data freshness across institutions
2. Identify engagement patterns
3. Support institutions needing assistance
4. Measure platform impact on learner success

## Testing
```bash
# Frontend tests
npm test

# Backend tests
pytest

# End-to-end validation
npm run test:e2e
```

## API Documentation

### Authentication Endpoints
- `POST /auth/login` - Secure learner access
- `POST /auth/logout` - Session management
- `GET /auth/me` - Profile verification

### Institution Endpoints
- `GET /institution/acceptances` - Current policies
- `PUT /institution/acceptances/{id}` - Policy updates
- `POST /institution/acceptances` - New exam acceptance
- `DELETE /institution/acceptances/{id}` - Remove outdated policies

### Learner Endpoints
- `GET /api/institutions` - Personalized matches
- `GET /api/exams` - Complete CLEP catalog
- `POST /api/user/favorites` - Portfolio building

## Contributing

We welcome contributions that align with our mission of educational equity. Your perspective—whether as a learner, educator, or technologist—enriches our community.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/YourContribution`)
3. Commit with purpose (`git commit -m 'Add feature that helps learners'`)
4. Push to branch (`git push origin feature/YourContribution`)
5. Open a Pull Request with context about impact

## Acknowledgments

This platform exists because Modern States Education Alliance believes in removing barriers to higher education. We're grateful to:
- The 700,000+ learners whose journeys inspire every feature
- Institutional partners who recognize that talent is universal
- Contributors who believe education is a human right

## Links
- [Modern States](https://modernstates.org) - Free. Flexible. College Credit. For Everyone.
- [CLEP Program](https://clep.collegeboard.org) - College Level Examination Program
- [Project Documentation](https://docs.google.com/presentation/d/15djM90DmMrcIH-Mv3usfTJ0GzVEeoRsW)

**Built with purpose and love for Modern States by Team-23**
