# ASSON UI

The official academic web portal for the **Association of Statistics Students of Nigeria (ASSON)**, University of Ibadan Chapter.

*Motto: Facts from Reliable Figures*

---

## About

ASSON UI provides statistics scholars with direct access to departmental course resources, past examination archives, academic notices, and student enterprise showcases.

### Key Capabilities
- **Academic Catalog**: Curated repository of past examination papers, course outlines, and study notes for 100L through 400L.
- **Student Study Locker**: Browser-synced bookmarks and tracking for peer-submitted academic resources.
- **Departmental Directory**: Academic staff, HOD, and level adviser contacts with consultation hours.
- **Enterprise Hub**: Moderated showcase of student-run businesses, freelance data consulting, and tutoring services.
- **Academic Calendar**: Live schedule of departmental assessments, lectures, and university milestones.

---

## Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, Lucide Icons
- **Build Tool**: Vite
- **Backend & Persistence**: Supabase (PostgreSQL, Storage, Auth)
- **Deployment**: Vercel

---

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or pnpm

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/emmanuelikeh2993/asson_website.git
   cd asson_website
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Build for production:
   ```bash
   npm run build
   ```

---

## Contributing

Contributions from departmental course representatives, developers, and scholars are welcome. Please open an issue or submit a pull request for review.

---

## License

© 2026 Association of Statistics Students of Nigeria (ASSON), University of Ibadan Chapter. All rights reserved.
