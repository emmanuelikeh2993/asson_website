# ASSON UI STUDENT PLATFORM

## Complete Version 1 Product, Design and Engineering Specification



Controlling build specification

Version 1.0



Project: Association of Statistics Students of Nigeria (ASSON), University of Ibadan Chapter.

Document audience: UI/UX designers, frontend developers, backend developers, database engineers, quality assurance engineers, project managers and AI coding agents such as Antigravity.

Purpose: This document specifies exactly what must be designed, developed, tested and delivered for the first version of the ASSON UI platform.

The development team should treat this as the controlling specification. The team should not return another proposal, a list of suggestions or merely a visual prototype. The required deliverable is a working application.

Where a real credential, approved contact, official document or verified piece of information is unavailable, the team should build the appropriate configuration mechanism and identify the missing item. It must not invent information.

# PART ONE: PRODUCT DEFINITION

## 1. What we are building

Build a modern, mobile-first academic information and student-support platform for Statistics students at the University of Ibadan.

The platform should become a reliable place where students can:

1. Find academic resources.
2. Access past examination questions.
3. Find course outlines and approved lecture materials.
4. Discover scholarships and internship opportunities.
5. Read important departmental and association announcements.
6. Find verified information about ASSON and its executives.
7. Ask common academic and administrative questions.
8. Submit useful academic materials for review.
9. Report broken links, incorrect information and outdated materials.
10. Track their contributions and submissions.

The platform must be easy to use, trustworthy, accessible on mobile phones and manageable by future ASSON executives.

### 1.1 The product philosophy

The website must not attempt to replace:

- WhatsApp groups.
- The University of Ibadan student portal.
- The university's learning management system.
- Official departmental communication channels.

Instead, it should become the organised and searchable information layer that these platforms do not necessarily provide.

For example:

A student might receive a message in a WhatsApp group saying that STA 212 past questions are available.

They should be able to click a link, open the ASSON website, search for STA 212 and find the correct materials without scrolling through hundreds of WhatsApp messages.

WhatsApp can distribute information. ASSON should provide the permanent destination where students retrieve it.

### 1.2 What success looks like

The platform succeeds when:

- Students can find relevant academic materials quickly.
- Important information is accurate and current.
- Students can access public resources without unnecessary registration.
- Editors can manage content without contacting a developer.
- Students trust the information they find.
- The next ASSON administration can take over the platform without rebuilding it.

The goal is not to build the website with the highest number of features. The goal is to build the most useful and maintainable Version 1.

# PART TWO: BRAND AND DESIGN SYSTEM

## 2. Visual identity

Use the supplied ASSON UI logo as the principal brand reference.

The logo contains green, red and cyan. These colours should guide the interface, but the design is not restricted to those colours.

The result should look like a professional university technology platform.

It should not look like an ordinary departmental blog, a campaign flyer or a generic AI-generated dashboard.

### 2.1 Colour palette

Use these colours as the initial design tokens:

| Colour        | Hex code  | Application                                           |
| ------------- | --------- | ----------------------------------------------------- |
| Primary green | `#087A3E` | Primary buttons, active navigation, links             |
| Deep green    | `#064B2B` | Strong brand surfaces, footer                         |
| Red           | `#C62828` | Urgent notices, destructive actions, selected accents |
| Cyan          | `#55C9D5` | Information highlights and secondary accents          |
| White         | `#FFFFFF` | Main cards and surfaces                               |
| Off-white     | `#F6F8F7` | Main page background                                  |
| Charcoal      | `#17232D` | Main text                                             |
| Muted grey    | `#5C6B75` | Secondary text                                        |
| Border grey   | `#D8E2DE` | Dividers, borders and input outlines                  |

### 2.2 Colour application rules

Green should be the dominant brand colour.

Red should be used selectively. It should not be used for every button or section.

Cyan should provide visual contrast and support information-related components.

Use white and neutral backgrounds to keep the interface clean.

Avoid:

- Excessive gradients.
- Excessive shadows.
- Too many competing colours.
- Oversized headings.
- Unnecessary animations.
- Random emoji used as interface icons.
- Inconsistent button styles.
- Inconsistent spacing.

### 2.3 Typography

Use Inter or a similar readable sans-serif font.

Establish a consistent hierarchy:

- Page title.
- Section title.
- Card title.
- Body text.
- Supporting information.
- Metadata.

All typography must remain readable on small mobile screens.

### 2.4 Design system components

Create reusable components for:

- Primary and secondary buttons.
- Text inputs.
- Search fields.
- Dropdowns.
- Filter controls.
- Cards.
- Status badges.
- Navigation.
- Breadcrumbs.
- Tables.
- Modals.
- Confirmation dialogs.
- Toast notifications.
- Empty states.
- Loading skeletons.
- Error messages.
- Pagination.
- File upload areas.
- Date displays.
- Profile menus.

Use Lucide icons consistently.

### 2.5 Responsive design

Design mobile-first.

The application must work on:

- Android phones.
- iPhones.
- Tablets.
- Laptops.
- Desktop monitors.

The mobile interface must not simply be a compressed desktop layout.

It needs its own appropriate navigation, spacing, card arrangement and interaction behaviour.

### 2.6 Accessibility

Target WCAG 2.2 AA principles.

Implement:

- Proper semantic HTML.
- Keyboard navigation.
- Visible focus indicators.
- Accessible form labels.
- Adequate text contrast.
- Accessible dialogs.
- Clear error messages.
- Screen-reader-friendly buttons.
- Reduced-motion support.

Do not communicate information through colour alone.

# PART THREE: EXACT VERSION 1 FEATURES

## 3. Homepage

The homepage is the main entry point.

It must immediately communicate what the platform does and direct students towards the most useful sections.

### 3.1 Header

Include:

- ASSON UI logo.
- Home.
- Resources.
- Past Questions.
- Notices.
- Opportunities.
- FAQ.
- Contacts/About.
- Search.
- Login or Profile.

On mobile, use an accessible collapsible navigation menu.

The header should remain visually clean and should not occupy too much screen space.

### 3.2 Hero section

Use the following content as the initial design direction:

Main heading:

"ASSON UI — Together for Academic Excellence."

Supporting text:

"Your academic resource centre, student opportunities hub and trusted source of important information for Statistics students at the University of Ibadan."

Primary action: Explore Resources.

Secondary action: About ASSON.

The hero should be attractive without being excessively large.

### 3.3 Quick-access cards

Display cards for:

1. Academic Resources.
2. Past Questions.
3. Scholarships.
4. Internships.
5. Important Notices.
6. Student Support.

Each card should have an icon, short description and clear navigation action.

### 3.4 Latest notices

Show recently published notices.

Each notice should display:

- Title.
- Category.
- Publication date.
- Issuing organisation.
- Deadline, where applicable.
- Status.

Provide a View All Notices link.

### 3.5 Featured opportunities

Display selected active opportunities.

Each card should show:

- Opportunity title.
- Provider.
- Opportunity category.
- Deadline.
- Brief eligibility information.

Only verified and currently relevant opportunities should appear.

### 3.6 Footer

Include:

- ASSON UI logo.
- Association name.
- Quick links.
- Approved contact information.
- Privacy policy.
- Content policy.
- About ASSON.
- Copyright notice.

Do not invent contact information or executive names.

## 4. Academic resource library

This is one of the most important sections of the platform.

It must be built as a searchable academic resource catalogue.

### 4.1 Resource categories

The system should support:

- Past Examination Questions.
- Lecture Notes.
- Course Outlines.
- Tutorial Materials.
- Practice Questions.
- Approved Reference Materials.
- Other Academic Materials.

### 4.2 Resource catalogue page

The page must contain:

Search bar

Students should be able to search using:

- Course code.
- Course title.
- Resource title.
- Relevant keywords.

Search should be case-insensitive and support partial matches.

Filters

Provide filters for:

- Academic level.
- Course.
- Academic session.
- Semester, where maintained.
- Resource type.
- Verification status.

Include a Clear Filters action.

### 4.3 Resource cards

Each resource card must display:

- Resource title.
- Course code.
- Course title.
- Academic session.
- Resource type.
- File type.
- File size.
- Verification status.
- Last checked date.
- View or Download action.

### 4.4 Resource detail page

When a student opens a resource, display:

- Full title.
- Course information.
- Session.
- Resource category.
- Description.
- File type and size.
- Source or contributor information, where permitted.
- Verification status.
- Upload or publication date.
- Last checked date.
- Download button.
- Report an Issue button.

### 4.5 Past Questions

Past Questions must be a dedicated section.

However, it must use the same underlying resource catalogue.

For example, selecting Past Questions should simply show resources where the resource type is `Past Question`.

Do not build a separate database for past questions.

### 4.6 Download behaviour

Publicly approved resources should be downloadable without registration.

The download button must work.

If a file is missing or inaccessible, show a clear error and provide a way to report the issue.

Do not create buttons that only look functional.

### 4.7 Resource verification

Use visible labels such as:

- Verified.
- Unverified.
- Needs Review.
- Archived.

A verified label must mean that an authorised editor has actually reviewed the resource.

Never automatically label every uploaded file as verified.

## 5. Notices and announcements

Create a dedicated Notices section.

It should serve as a reliable place for important information.

### 5.1 Categories

Support:

- General Announcements.
- Academic Notices.
- Events.
- Administrative Notices.

### 5.2 Notice cards

Each card should contain:

- Notice title.
- Category.
- Issuer.
- Publication date.
- Deadline, if applicable.
- Current status.

### 5.3 Notice detail page

Display:

- Full announcement.
- Issuing organisation.
- Original source.
- Publication date.
- Effective date.
- Deadline.
- Supporting documents, if available.
- Last checked date.

### 5.4 Source distinction

The platform must distinguish between:

- ASSON announcements.
- Department announcements.
- Faculty announcements.
- University announcements.

An ASSON summary must not be presented as an official University policy unless it is supported by the original official source.

### 5.5 Expired notices

Expired notices must not continue appearing as current announcements.

They should be marked expired or archived automatically where the relevant dates are available.

## 6. Scholarships and internship opportunities

Create one Opportunities section with filters for:

- Scholarships.
- Internships.

This avoids building two separate systems that perform essentially the same function.

### 6.1 Opportunity cards

Display:

- Opportunity title.
- Provider.
- Category.
- Location or work mode, if known.
- Deadline.
- Eligibility summary.
- Last checked date.
- Current status.

### 6.2 Opportunity details

Display:

- Full description.
- Provider.
- Eligibility criteria.
- Application deadline.
- Official application URL.
- Location or work mode.
- Required documents, if officially stated.
- Source information.
- Last checked date.

### 6.3 Application behaviour

The Apply Now button must open the provider's official application page.

ASSON should not collect scholarship application documents or application fees.

### 6.4 Verification

Every opportunity must have:

- An identifiable provider.
- An official source.
- A valid application link.
- A deadline where applicable.
- A last-checked date.

The system should clearly distinguish expired opportunities from active ones.

Do not scrape external websites automatically in Version 1.

Editors should manually verify and publish opportunities.

## 7. Frequently Asked Questions

Create a searchable FAQ section.

Organise questions into categories such as:

- Academic Information.
- Departmental Information.
- Association Information.
- Student Resources.
- General Questions.

Use expandable accordion components.

Each answer should have:

- Question.
- Answer.
- Category.
- Source URL where relevant.
- Last reviewed date.

Where an answer concerns university policy or academic requirements, provide an official source.

Do not publish unverified academic advice as official departmental information.

## 8. ASSON executive contacts

Create an executive directory.

Each entry should contain:

- Office title.
- Current office holder.
- Responsibilities.
- Approved contact method.
- Session or term.
- Last updated date.

Do not invent names, telephone numbers or email addresses.

The admin panel must allow authorised editors to update office holders after elections or executive transitions.

Private contact information must not be published without permission.

## 9. About and Contact pages

### About page

Include:

- ASSON's full name.
- University of Ibadan Chapter.
- A short description of the association.
- The purpose of the platform.
- Approved association information.

### Contact page

Provide approved contact routes.

If a contact form is implemented, it must actually deliver messages through a configured and secure process.

If that cannot be configured, display the approved contact channels instead.

Never display a success message when a message has not actually been delivered.

# PART FOUR: STUDENT ACCOUNT FEATURES

## 10. Authentication

Students should be able to create accounts.

Use Supabase Authentication.

Implement:

- Registration.
- Login.
- Email verification.
- Logout.
- Forgot password.
- Password reset.

Use email and password authentication.

Do not require matriculation numbers.

Do not collect unnecessary personal information.

Public resources must remain accessible without login.

Accounts are primarily required for contributions, bookmarks and protected administrative functions.

## 11. Student dashboard

The dashboard should provide a simple overview of the student's activity.

Display:

- Welcome message.
- Total submissions.
- Pending submissions.
- Approved submissions.
- Submissions requiring changes.
- Recent activity.

These figures must come from real database records.

Never hard-code dashboard statistics.

### 11.1 My submissions

Students should see a list of their own submissions.

Provide filters:

- All.
- Pending.
- Needs Changes.
- Approved.
- Rejected.

Each submission should show:

- Title.
- Submission category.
- Date submitted.
- Current status.
- Reviewer feedback, where available.

### 11.2 Resubmission

When an editor requests changes, the student should be able to edit the submission and send it again.

The system should retain the review history.

### 11.3 Bookmarks

Students should be able to save resources for later.

The dashboard should have a Bookmarks section.

Students must only see and manage their own bookmarks.

# PART FIVE: CONTENT CONTRIBUTION AND MODERATION

## 12. Student contribution system

Students should be able to contribute useful materials.

The system must not publish student submissions automatically.

All submissions require human review.

### 12.1 Submission options

Provide:

- Submit Academic Resource.
- Submit Scholarship.
- Submit Internship.

Notice submissions should be restricted to trusted representatives or editors.

### 12.2 Academic resource submission form

Required fields:

- Resource title.
- Course.
- Academic session.
- Academic level, where applicable.
- Resource type.
- Description.
- Source or permission declaration.
- File upload or external URL.

### 12.3 Opportunity submission form

Required fields:

- Opportunity title.
- Provider.
- Opportunity category.
- Official URL.
- Deadline.
- Eligibility information.
- Location or work mode, where known.
- Source evidence.
- Submitter declaration.

### 12.4 File upload rules

For V1:

- Allow PDF uploads only for academic files.
- Maximum upload size: 20 MB.
- Validate MIME type on the server.
- Validate the actual file signature.
- Generate safe storage filenames.
- Do not trust filenames supplied by users.
- Reject executable files, archives and unknown file types.

Pending files must be stored privately.

They must not become publicly accessible until approved.

### 12.5 Submission confirmation

After submission, display:

- Submission reference.
- Submission date.
- Current status.
- Expected review process, without promising an unrealistic review time.

The student should be able to return to the dashboard to check progress.

## 13. Editorial moderation system

This is an essential feature.

Without proper moderation, the platform will gradually become unreliable.

### 13.1 Moderation workflow

The workflow must be:

1. Student submits content.
2. System validates the submission.
3. Submission enters the moderation queue.
4. Editor examines the content.
5. Editor approves, rejects or requests changes.
6. Approved content becomes public.
7. Corrections and reports can be handled later.
8. Content can be archived or removed when necessary.

### 13.2 Editor actions

Provide:

- Preview submission.
- Approve.
- Request Changes.
- Reject.
- Edit metadata.
- Publish.
- Archive.
- Remove or take down.

Every action should be recorded.

### 13.3 Reviewer feedback

If changes are requested, the editor must provide a reason.

The student should be able to see the reason.

### 13.4 Content ownership

Every major content category should have a named editor and deputy.

For example:

- Academic resources: academic committee or designated resource editor.
- Opportunities: designated opportunities editor.
- Notices: publicity or authorised association officer.
- Executive directory: secretary or designated administrator.

These assignments must be configurable.

# PART SIX: FEEDBACK AND REPORTING

## 14. Report an issue

Students must be able to report:

- Broken downloads.
- Incorrect course information.
- Duplicate resources.
- Outdated notices.
- Incorrect opportunity information.
- Inappropriate or unauthorised material.

The report form should ask for:

- Type of issue.
- Description.
- Relevant page or resource.
- Optional contact email.

A user should not be required to create an account merely to report a broken public resource.

### 14.1 Report management

Reports should enter a restricted administrative queue.

Editors should be able to:

- View.
- Assign.
- Acknowledge.
- Resolve.
- Dismiss.

Record the resolution and date.

### 14.2 Sensitive complaints

Do not create a public complaint wall.

Do not promise complete anonymity.

A platform cannot honestly promise anonymity without considering server logs, account details, attachments, analytics and other metadata.

Version 1 should focus on content and platform issues.

Sensitive welfare, disciplinary or personal complaints must either be excluded and directed to an approved official channel, or routed through a separate restricted procedure with authorised handlers and an approved privacy policy.

# PART SEVEN: ADMINISTRATIVE CONSOLE

## 15. Admin dashboard

Create a separate administrative area.

It must be accessible only to authorised users.

The dashboard should display real information:

- Pending submissions.
- Published resources.
- Active notices.
- Active opportunities.
- Unresolved reports.
- Expired opportunities.

Do not use fictional figures.

### 15.1 Resource management

Administrators should be able to:

- Add resources.
- Edit resources.
- Preview resources.
- Publish resources.
- Archive resources.
- Remove resources.
- Verify resource information.

### 15.2 Notice management

Administrators should be able to:

- Create notices.
- Edit notices.
- Set publication dates.
- Set effective dates.
- Set deadlines.
- Add official source URLs.
- Publish.
- Archive.

### 15.3 Opportunity management

Administrators should be able to:

- Add opportunities.
- Edit details.
- Verify provider information.
- Set deadlines.
- Publish.
- Mark closed or expired.
- Archive.

### 15.4 FAQ management

Editors should be able to:

- Add questions.
- Edit answers.
- Assign categories.
- Add sources.
- Set review dates.
- Publish or archive.

### 15.5 Executive directory management

Authorised administrators should be able to update:

- Office holders.
- Responsibilities.
- Approved contacts.
- Executive session.
- Display order.

### 15.6 User and role management

Administrators should be able to:

- View authorised user records.
- Assign roles.
- Remove roles.
- Disable inappropriate accounts where appropriate.
- Review role changes.

Role changes must be recorded in the audit log.

### 15.7 Audit log

Record important administrative activities:

- User role changes.
- Content publication.
- Content removal.
- Content approval.
- Content rejection.
- Sensitive report access.
- Administrative configuration changes.

Ordinary users must not be able to edit audit records.

# PART EIGHT: TECHNOLOGY STACK

## 16. Required technology

Use the following stack for Version 1.

| Layer                            | Required technology                      |
| -------------------------------- | ---------------------------------------- |
| Frontend framework               | React                                    |
| Build tool                       | Vite                                     |
| Language                         | TypeScript                               |
| Styling                          | Tailwind CSS                             |
| UI components                    | shadcn/ui and Radix UI where appropriate |
| Icons                            | Lucide React                             |
| Routing                          | React Router                             |
| Forms                            | React Hook Form                          |
| Validation                       | Zod                                      |
| Data fetching                    | TanStack Query                           |
| Database                         | Supabase PostgreSQL                      |
| Authentication                   | Supabase Auth                            |
| File storage                     | Supabase Storage                         |
| Server-side privileged functions | Supabase Edge Functions                  |
| Testing                          | Vitest and React Testing Library         |
| End-to-end testing               | Playwright                               |
| Code quality                     | ESLint and Prettier                      |
| Repository                       | GitHub                                   |
| Frontend hosting                 | Vercel                                   |

### 16.1 Why this stack?

React provides the component-based frontend architecture.

Vite provides a straightforward development and build environment.

TypeScript helps prevent common coding errors and makes the project easier to maintain.

Tailwind CSS provides a consistent styling system.

Supabase provides the database, authentication, storage and server-side functions without requiring a separate backend server for ordinary operations.

GitHub provides source control and collaboration.

Vercel provides frontend deployment and preview environments.

### 16.2 Do not introduce unnecessary technologies

Do not add the following to V1 without a demonstrated requirement:

- Redux.
- Express or Django as another backend.
- GraphQL.
- Redis.
- Microservices.
- AI APIs.
- Automatic external opportunity scraping.
- Multiple file-storage providers.

The project should be as simple as possible while remaining secure and maintainable.

# PART NINE: APPLICATION ARCHITECTURE

## 17. How the application should work

The intended architecture is:

Student's browser → React application → Supabase authentication and database → Supabase Storage.

Privileged operations should pass through trusted Supabase Edge Functions or other server-side mechanisms.

The frontend should never receive a Supabase service-role key.

### 17.1 Frontend responsibilities

The frontend handles:

- Page rendering.
- Navigation.
- Forms.
- Search interface.
- Filters.
- Authentication interface.
- Student dashboard.
- Admin interface.
- Displaying database results.
- User feedback and error states.

### 17.2 Backend responsibilities

Supabase handles:

- User authentication.
- Database records.
- Database relationships.
- Row-Level Security.
- File storage.
- Access permissions.

Edge Functions handle privileged operations such as:

- Role assignment.
- Sensitive report access.
- Restricted moderation operations.
- Scheduled content expiry where needed.

### 17.3 Project structure

Use a clear structure similar to:

```
asson-ui/
│
├── public/
│   ├── logo/
│   ├── icons/
│   └── images/
│
├── src/
│   ├── app/
│   ├── components/
│   │   ├── ui/
│   │   ├── layout/
│   │   └── common/
│   │
│   ├── features/
│   │   ├── auth/
│   │   ├── resources/
│   │   ├── notices/
│   │   ├── opportunities/
│   │   ├── faq/
│   │   ├── contacts/
│   │   ├── submissions/
│   │   ├── reports/
│   │   ├── dashboard/
│   │   └── admin/
│   │
│   ├── hooks/
│   ├── lib/
│   ├── types/
│   ├── tests/
│   └── main.tsx
│
├── supabase/
│   ├── migrations/
│   ├── functions/
│   ├── tests/
│   └── seed.sql
│
├── docs/
│   ├── architecture.md
│   ├── database.md
│   ├── security.md
│   ├── operations.md
│   ├── deployment.md
│   └── handover.md
│
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

# PART TEN: DATABASE DESIGN

## 18. Database principles

Use a relational PostgreSQL database.

Do not put the entire application into one large table.

Create separate related tables for resources, courses, users, submissions, notices and opportunities.

Use UUID primary keys, foreign keys, constraints, indexes and timestamps.

All database changes must be recorded as version-controlled SQL migrations.

## 19. Required tables

### 19.1 Profiles

Stores basic user profile information.

Fields:

- id — UUID matching the Supabase Auth user.
- display_name.
- level — optional.
- department.
- avatar_path — optional.
- created_at.
- updated_at.

### 19.2 User roles

Stores the user's permissions.

Fields:

- id.
- user_id.
- role.
- assigned_by.
- created_at.

Supported roles:

- Student.
- Contributor.
- Editor.
- Administrator.
- Restricted Report Handler.

A user must not be able to assign a role to themselves.

### 19.3 Courses

Stores the department's approved course information.

Fields:

- id.
- code.
- title.
- level.
- semester.
- is_active.
- source_note.
- updated_at.

Course codes should be unique.

### 19.4 Resources

Stores academic resource metadata.

Fields:

- id.
- title.
- course_id.
- session.
- level.
- resource_type.
- description.
- storage_path.
- external_url.
- mime_type.
- file_size_bytes.
- source_name.
- source_url.
- permission_basis.
- status.
- verification_status.
- last_checked_at.
- created_by.
- reviewed_by.
- reviewed_at.
- published_at.
- version_label.

A resource should reference a course using `course_id`.

Do not repeatedly store inconsistent course names as free text.

### 19.5 Notices

Fields:

- id.
- title.
- slug.
- body.
- category.
- issuer_type.
- issuer_name.
- source_url.
- published_at.
- effective_at.
- expires_at.
- status.
- last_checked_at.
- created_by.
- reviewed_by.

### 19.6 Opportunities

Fields:

- id.
- title.
- slug.
- provider.
- opportunity_type.
- description.
- eligibility.
- location_mode.
- official_url.
- deadline_at.
- source_url.
- status.
- last_checked_at.
- published_at.
- created_by.
- reviewed_by.

### 19.7 FAQs

Fields:

- id.
- question.
- answer.
- category.
- source_url.
- last_reviewed_at.
- status.
- sort_order.
- created_by.
- updated_by.

### 19.8 Executive contacts

Fields:

- id.
- office_title.
- holder_name.
- responsibility.
- public_email.
- public_phone.
- contact_url.
- term_label.
- display_order.
- status.
- last_updated_at.
- updated_by.

### 19.9 Submissions

Fields:

- id.
- submitter_id.
- submission_type.
- target_id.
- payload.
- private_file_path.
- status.
- reviewer_id.
- reviewer_message.
- submitted_at.
- reviewed_at.

### 19.10 Content reports

Fields:

- id.
- reporter_id — nullable.
- target_type.
- target_id.
- issue_type.
- description.
- status.
- assigned_to.
- resolution_note.
- created_at.
- resolved_at.

### 19.11 Bookmarks

Fields:

- id.
- user_id.
- resource_id.
- created_at.

Add a unique constraint on `user_id` and `resource_id`.

### 19.12 Audit events

Fields:

- id.
- actor_id.
- action.
- entity_type.
- entity_id.
- summary.
- metadata.
- created_at.

Ordinary users must not be allowed to modify audit records.

### 19.13 Site settings

Fields:

- key.
- value.
- updated_by.
- updated_at.

Only administrators should be able to modify protected settings.

# PART ELEVEN: DATABASE PERFORMANCE

## 20. Indexing

Add appropriate indexes for frequently used queries.

For resources:

- status.
- course_id.
- session.
- resource_type.
- published_at.

For notices:

- status.
- category.
- expires_at.
- published_at.

For opportunities:

- status.
- opportunity_type.
- deadline_at.
- provider.

For submissions:

- submitter_id and submitted_at.
- status and submitted_at.

For reports:

- status and created_at.
- assigned_to and status.

For bookmarks:

- user_id.
- resource_id.
- Unique combination of both.

Implement PostgreSQL full-text search for resource titles, descriptions and course information.

Do not retrieve the entire database to search in the browser.

Use server-side pagination.

# PART TWELVE: SECURITY

## 21. Row-Level Security

Enable Row-Level Security on every table exposed through the Supabase API.

RLS is essential.

It determines what users can read and modify at database level.

Do not rely only on hiding buttons in the frontend.

### 21.1 Visitor permissions

Visitors can:

- Read published resources.
- Read published notices.
- Read published opportunities.
- Read published FAQs.
- Read approved executive contacts.

Visitors cannot access private records.

### 21.2 Student permissions

Students can:

- Read public content.
- Create their own submissions.
- View their own submissions.
- Edit permitted profile fields.
- Manage their own bookmarks.
- Submit content reports.

Students cannot:

- Approve their own submissions.
- View other students' submissions.
- Access private reports assigned to administrators.
- Change their own roles.

### 21.3 Editor permissions

Editors can:

- Review assigned submissions.
- Approve or reject permitted content.
- Request corrections.
- Manage assigned content categories.
- Handle public content reports.

They cannot automatically manage security roles.

### 21.4 Administrator permissions

Administrators can:

- Manage all content.
- Manage user roles.
- Manage settings.
- Review audit events.
- Manage editorial workflows.

All important administrative actions must be recorded.

### 21.5 File security

Use separate storage areas for:

1. Pending submissions.
2. Approved public resources.

Pending submissions must not have public URLs.

Only approved content should be downloadable by visitors.

Validate files on the server.

Do not trust browser-supplied filenames, extensions or MIME types.

### 21.6 Secret management

The frontend may use:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Privileged keys must remain server-side.

Never commit:

- Service-role keys.
- Passwords.
- Private API tokens.
- Production credentials.

Commit an `.env.example` file containing variable names but no real secrets.

# PART THIRTEEN: CONTENT MANAGEMENT

## 22. Content freshness

A major risk is that the platform becomes outdated after the current executives leave office.

Every major content category must have a responsible person.

Establish a content lifecycle:

Submit → Validate → Review → Publish → Recheck → Correct or Archive.

### 22.1 Resource maintenance

Editors should periodically check:

- File accessibility.
- Correct course.
- Correct academic session.
- Correct resource type.
- Permission status.
- Duplicate content.

### 22.2 Opportunity maintenance

Scholarships and internships should be reviewed regularly.

An expired opportunity must not continue to appear as open.

### 22.3 Notice maintenance

Notices should be archived when they are no longer relevant.

### 22.4 Executive directory maintenance

The directory should be reviewed during every executive transition.

### 22.5 Content ownership

Every content category needs:

- A primary owner.
- A deputy.
- A review frequency.
- An escalation route.

The platform must not depend on one person remembering everything.

# PART FOURTEEN: PERFORMANCE AND USER EXPERIENCE

## 23. Performance requirements

The platform must work well on modest Android devices and ordinary Nigerian mobile internet connections.

Implement:

- Optimised images.
- Lazy loading.
- Server-side pagination.
- Efficient database queries.
- Minimal unnecessary JavaScript.
- Compressed assets.
- Loading skeletons.
- Useful empty states.
- Retry behaviour.
- Clear error messages.

Avoid heavy video backgrounds, oversized animations and unnecessary media.

### 23.1 Slow internet behaviour

When a request is taking time:

- Show a loading indicator.
- Prevent accidental duplicate submissions.
- Allow retry when safe.
- Explain failures clearly.

When a file upload fails, the user should know what happened.

### 23.2 Search experience

Search must be easy to find.

Students should be able to search for a course without first navigating through several levels of menus.

### 23.3 Empty states

Examples:

"No resources found for this course."

"No active opportunities at the moment."

"You have not submitted any materials yet."

Every empty state should provide a relevant next action.

# PART FIFTEEN: FEATURES EXCLUDED FROM VERSION 1

## 24. Do not implement these yet

The following features are deliberately excluded from the first release.

| Feature                                   | Decision                                 |
| ----------------------------------------- | ---------------------------------------- |
| AI-generated likely examination questions | Exclude                                  |
| AI tutor/chatbot                          | Exclude                                  |
| Public complaint wall                     | Exclude                                  |
| Guaranteed anonymous complaints           | Exclude                                  |
| Push notifications                        | Postpone                                 |
| SMS notifications                         | Postpone                                 |
| WhatsApp automation                       | Postpone                                 |
| Full offline resource vault               | Postpone                                 |
| OCR processing                            | Postpone                                 |
| Topic-frequency analysis                  | Postpone                                 |
| Lecturer office directory                 | Postpone until authorised and maintained |
| Public discussion forum                   | Exclude from V1                          |
| Real-time chat                            | Exclude                                  |
| Marketplace                               | Exclude                                  |
| Points and leaderboards                   | Exclude                                  |
| Election voting system                    | Exclude                                  |
| Large photo/video gallery                 | Exclude                                  |

### 24.1 Why AI-generated likely questions are excluded

The platform should provide historical examination questions and approved academic resources.

It should not claim to predict examination questions.

An AI system may generate incorrect or misleading predictions. Students could begin treating generated questions as reliable examination guidance.

If AI-assisted academic tools are considered in the future, they should have a separate educational purpose, transparent limitations and proper review.

### 24.2 Why the lecturer directory is postponed

Lecturer names, office locations and consultation hours can become inaccurate.

The platform should not publish personal or administrative information without appropriate authorisation.

Build it later when the department or another authorised office can provide and maintain verified information.

### 24.3 Optional CGPA calculator

A simple CGPA calculator is a possible future addition.

It is not a launch requirement.

If implemented later, the grading scale and unit rules must be verified by the department.

The calculator should operate in the browser and should not send students' grades to the database.

# PART SIXTEEN: DEVELOPMENT PROCESS

## 25. Exact implementation sequence

The team must follow this order.

### Stage 0: Project setup

1. Inspect the existing project directory.
2. Create or initialise the ASSON-owned GitHub repository.
3. Set up React, Vite and TypeScript.
4. Configure Tailwind CSS.
5. Install the required dependencies.
6. Configure ESLint and Prettier.
7. Create `.env.example`.
8. Create a Supabase staging project.
9. Configure CI checks.
10. Establish the project structure.

Exit condition: The application runs locally and in staging.

### Stage 1: Design system

1. Import the approved ASSON logo.
2. Define the colour tokens.
3. Configure typography.
4. Build the header.
5. Build the footer.
6. Build the navigation.
7. Create reusable cards.
8. Create buttons and forms.
9. Create badges and alerts.
10. Create responsive layouts.
11. Create loading, error and empty states.

Exit condition: All page layouts use the same consistent design system.

### Stage 2: Database and security

1. Create database migrations.
2. Create the required tables.
3. Define foreign keys.
4. Add indexes.
5. Create storage buckets.
6. Configure storage policies.
7. Enable RLS.
8. Write policies for each user role.
9. Create secure administrative functions.
10. Test access restrictions.

Exit condition: The database and storage security tests pass.

### Stage 3: Authentication

1. Build registration.
2. Build login.
3. Build email verification.
4. Build forgot password.
5. Build password reset.
6. Build logout.
7. Build protected routes.
8. Create profile management.
9. Implement server-controlled roles.

Exit condition: Authentication works and users cannot assign themselves privileged roles.

### Stage 4: Academic resource library

1. Build the catalogue.
2. Build the search.
3. Build the filters.
4. Build pagination.
5. Build resource cards.
6. Build resource details.
7. Build download functionality.
8. Build report functionality.
9. Connect resources to the database.
10. Build the resource administration interface.

Exit condition: An editor can create, review, publish and archive a resource, and a visitor can find and download the published resource.

### Stage 5: Notices and opportunities

1. Build notice listing.
2. Build notice detail.
3. Build notice creation and editing.
4. Build opportunity listing.
5. Build opportunity detail.
6. Build opportunity creation and editing.
7. Implement official source fields.
8. Implement expiry handling.
9. Connect everything to Supabase.

Exit condition: Editors can publish and maintain real notices and opportunities.

### Stage 6: Student dashboard

1. Build dashboard overview.
2. Build My Submissions.
3. Build submission detail.
4. Build resubmission.
5. Build bookmarks.
6. Build profile settings.
7. Connect all data to the authenticated user.

Exit condition: A student can see and manage only their own permitted records.

### Stage 7: Contribution system

1. Build resource submission form.
2. Build opportunity submission form.
3. Implement file upload.
4. Implement server-side file validation.
5. Implement private storage.
6. Implement submission confirmation.
7. Connect submission records.
8. Implement editor review.
9. Implement approval and rejection.
10. Implement reviewer feedback.

Exit condition: A complete contribution-to-publication workflow works.

### Stage 8: Remaining public information

1. Build FAQ.
2. Build executive contacts.
3. Build About.
4. Build Contact.
5. Build Privacy Policy.
6. Build Content Policy.

Exit condition: All public information pages are connected to editable content.

### Stage 9: Admin console

1. Build admin overview.
2. Build resource management.
3. Build notice management.
4. Build opportunity management.
5. Build FAQ management.
6. Build contact management.
7. Build moderation queue.
8. Build report queue.
9. Build user and role management.
10. Build audit log.

Exit condition: Routine content management can be done without editing the database manually.

### Stage 10: Testing and hardening

1. Run unit tests.
2. Run component tests.
3. Run end-to-end tests.
4. Run RLS tests.
5. Test file access.
6. Test mobile layouts.
7. Test keyboard navigation.
8. Test slow-network behaviour.
9. Test expired content.
10. Test backup and restore.
11. Fix critical and high-severity defects.

Exit condition: All critical tests pass and no unresolved critical security issue remains.

### Stage 11: Pilot and launch

1. Seed approved academic resources.
2. Confirm content owners.
3. Train editors.
4. Test with students from different levels.
5. Launch to a small pilot group.
6. Collect feedback.
7. Fix high-impact usability problems.
8. Publish the production version.
9. Hand over all accounts and documentation.

# PART SEVENTEEN: TESTING REQUIREMENTS

## 26. Required acceptance tests

The developers must test these scenarios before declaring the project complete.

| ID    | Test                                 | Expected result                               |
| ----- | ------------------------------------ | --------------------------------------------- |
| AT-01 | Visitor opens resources              | Published resources appear                    |
| AT-02 | Visitor searches for a course        | Correct matching resources appear             |
| AT-03 | Visitor downloads a resource         | Correct file downloads                        |
| AT-04 | Visitor opens an opportunity         | Official source and deadline appear           |
| AT-05 | Student registers                    | Account is created and verified               |
| AT-06 | Student submits a resource           | Submission enters private review queue        |
| AT-07 | Student views submissions            | Only their own records appear                 |
| AT-08 | Editor approves submission           | Resource becomes public                       |
| AT-09 | Editor requests changes              | Student sees reviewer feedback                |
| AT-10 | Student reports broken file          | Report reaches authorised queue               |
| AT-11 | Student attempts role escalation     | Operation is denied                           |
| AT-12 | Opportunity deadline passes          | Opportunity is marked expired                 |
| AT-13 | Unauthorised user accesses admin URL | Access is denied                              |
| AT-14 | Student uses mobile navigation       | Interface remains usable                      |
| AT-15 | Upload contains invalid file         | Server rejects it                             |
| AT-16 | User opens a pending file URL        | Access is denied                              |
| AT-17 | Editor archives content              | Archived content is no longer publicly listed |
| AT-18 | Admin changes a role                 | Change is recorded in audit log               |

### 26.1 Manual usability tests

Ask students unfamiliar with the platform to complete two tasks without guidance:

1. Find a specified past examination question.
2. Find an opportunity and verify its deadline and official application source.

Observe where they struggle.

Do not assume a feature is easy simply because the developers understand how it works.

# PART EIGHTEEN: DEPLOYMENT AND OWNERSHIP

## 27. Hosting

Use:

- GitHub for source code.
- Vercel for frontend hosting.
- Supabase for database, authentication and storage.

Use separate staging and production environments.

Do not build directly against the production database during development.

### 27.1 Account ownership

The following accounts should belong to ASSON, not an individual developer:

- GitHub organisation or repository.
- Domain registrar.
- Vercel.
- Supabase.
- Storage and other paid services.

Developers should receive appropriate access but should not retain sole ownership.

### 27.2 Domain

Use the official domain approved by ASSON.

If the domain has not been purchased, configure deployment with a temporary staging URL and document the final domain setup process.

Do not invent or purchase a domain without approval.

### 27.3 Backups

Back up:

- PostgreSQL database.
- Uploaded files.
- Important configuration.
- Source code.

Database backups do not automatically guarantee that uploaded PDF files are backed up.

Maintain a separate backup of Storage objects.

Perform a restore test before launch and at least once per semester.

# PART NINETEEN: RETENTION AND PRODUCT MEASUREMENT

## 28. What will make students return?

The platform should not depend on students visiting every day.

It should provide reliable value whenever a student needs it.

There are four important usage patterns.

Frequent academic use: Students search for resources, past questions and course materials.

Time-sensitive use: Students check deadlines, notices and opportunities.

Seasonal use: Students return heavily during tests, examinations and registration periods.

Contribution use: Students submit resources, correct errors and share useful materials.

### 28.1 The intended retention loop

1. A useful resource or announcement is published.
2. A class representative shares its ASSON link in a WhatsApp group.
3. A student opens the website.
4. The student finds the correct information quickly.
5. The student trusts the platform.
6. The student shares the permanent link with others.
7. The student returns when another academic need arises.

The platform should make sharing links easy.

Do not force account creation before public downloads.

### 28.2 What to measure

Track:

- Successful resource downloads.
- Search success.
- Searches with no results.
- Time taken to locate a resource.
- Broken-resource reports.
- Expired opportunity listings.
- Content review delays.
- Repeat successful usage.
- Contribution approval rate.
- Editorial workload.

Do not measure success solely by total page views or registered accounts.

Use privacy-conscious analytics and do not collect unnecessary personal data.

# PART TWENTY: VERSION 1 RELEASE REQUIREMENTS

## 29. What must be completed before launch?

The following are mandatory.

Public website

- Homepage.
- Resource library.
- Past Questions.
- Notices.
- Opportunities.
- FAQ.
- Executive contacts.
- About.
- Contact.
- Privacy Policy.
- Content Policy.

Student features

- Registration.
- Login.
- Password recovery.
- Student dashboard.
- Resource submission.
- Opportunity submission.
- Submission tracking.
- Resubmission.
- Bookmarks.

Administrative features

- Admin dashboard.
- Resource management.
- Notice management.
- Opportunity management.
- FAQ management.
- Executive directory management.
- Moderation queue.
- Content reports.
- User roles.
- Audit log.

Technical requirements

- Supabase database.
- Database migrations.
- RLS policies.
- Secure storage.
- File validation.
- Responsive design.
- Error handling.
- Automated tests.
- Production deployment.
- Documentation.
- Backup and recovery procedure.

A feature is not complete merely because its screen exists.

For example, the resource submission feature is not complete until:

- The form works.
- The file uploads.
- The database record is created.
- The submission is private.
- The editor can review it.
- Approval publishes the resource.
- The visitor can download it.
- Rejection and correction workflows work.

# PART TWENTY-ONE: HANDOVER DOCUMENTATION

## 30. What the development team must deliver

At the end of development, the team must provide:

1. Complete source code.
2. GitHub repository access.
3. Database schema.
4. SQL migration files.
5. Supabase RLS policies.
6. Storage policies.
7. Edge Function source code.
8. Environment variable documentation.
9. Local development instructions.
10. Deployment instructions.
11. Test report.
12. Security documentation.
13. Database data dictionary.
14. Backup and recovery instructions.
15. Admin operating manual.
16. Known issues and limitations.
17. List of recurring costs.
18. A recorded walkthrough.
19. A list of ASSON-owned accounts and their administrators.
20. Handover instructions for the next administration.

The application must be maintainable by a future team.

Do not allow the entire platform to depend on one developer's personal account.

# PART TWENTY-TWO: DIRECT INSTRUCTIONS TO ANTIGRAVITY

## 31. Execution prompt

The following is the instruction that should be given to Antigravity alongside this specification.

You are acting as a complete senior product and engineering team consisting of a product designer, UI/UX designer, frontend engineer, backend engineer, database engineer, security engineer and QA engineer.

Your task is to BUILD the ASSON UI Student Platform Version 1 according to the accompanying Complete Developer Specification.

This is an implementation assignment, not a brainstorming assignment.

**NON-NEGOTIABLE INSTRUCTIONS**

1. Read the entire specification before writing code.
2. Treat the specification as the controlling source of product requirements and implementation decisions.
3. Do not return another proposal, a feature list, a collection of screenshots or a static prototype.
4. Inspect the existing project directory before creating or replacing files.
5. Implement the specified React, Vite, TypeScript, Tailwind CSS and Supabase stack.
6. Build the complete responsive frontend and connect every required feature to the real backend.
7. Implement the database schema, migrations, relationships, indexes, Row-Level Security and Storage policies.
8. Implement the complete authentication, student, editor and administrator workflows.
9. Build the academic resource workflow end-to-end before moving to the remaining modules.
10. Implement all loading, empty, success, validation and error states.
11. Use the ASSON logo and the brand palette specified in the document.
12. Do not invent association information, executive names, academic resources, scholarships, official announcements or contact details.
13. Do not publish student submissions automatically.
14. Do not expose service-role keys or privileged secrets in frontend code.
15. Do not implement features explicitly excluded from Version 1.
16. Do not leave buttons or navigation links that appear functional but do nothing.
17. Do not replace real backend functionality with hard-coded demo data.
18. If credentials are unavailable, build the required configuration and document exactly what is needed. Never invent credentials.
19. Run the required tests and fix failures.
20. Verify the application in a browser on both mobile and desktop.

**IMPLEMENTATION ORDER**

Follow the development sequence in the specification:

- Project setup.
- Design system.
- Database and security.
- Authentication.
- Academic resource library.
- Notices and opportunities.
- Student dashboard.
- Contribution system.
- Public information pages.
- Admin console.
- Testing and security hardening.
- Staging deployment.
- Production readiness.
- Handover documentation.

**IMPORTANT DEVELOPMENT REQUIREMENT**

Build complete user journeys, not disconnected pages.

For example, a resource must be capable of being submitted, privately stored, reviewed, approved, published, searched for and downloaded.

An opportunity must be capable of being created, reviewed, published, corrected, expired and archived.

A student must be able to register, submit materials, see their own submissions and respond to reviewer feedback.

An administrator must be able to manage the platform without directly editing the database.

**FINAL REPORT**

When implementation is complete, provide:

1. Exact local project directory.
2. Local installation and run commands.
3. Production build command.
4. Deployed URL, but only if deployment actually succeeded.
5. List of completed frontend routes.
6. List of implemented backend features.
7. Database tables and migrations created.
8. RLS and Storage policies implemented.
9. Authentication and user roles implemented.
10. Automated test results.
11. Mobile and desktop verification results.
12. Any unresolved issues.
13. Any missing external credentials or approved data.
14. Backup and recovery status.
15. Documentation and handover files created.

Clearly distinguish between features that are fully implemented, features that are partially implemented and features blocked by missing external dependencies.

**COMPLETION STANDARD**

The assignment is complete only when the result is a working, testable, responsive, secure and maintainable Version 1 application.

Do not claim that the application is complete merely because the frontend looks finished.

# FINAL PRODUCT DECISIONS

Before the developers begin, these are the decisions that must remain fixed unless a genuine technical blocker is discovered:

| Area                                | Final decision                                          |
| ----------------------------------- | ------------------------------------------------------- |
| Product identity                    | ASSON UI academic and student-support platform          |
| Frontend                            | React + Vite + TypeScript                               |
| Backend                             | Supabase                                                |
| Database                            | PostgreSQL                                              |
| Authentication                      | Supabase Auth                                           |
| File storage                        | Supabase Storage initially                              |
| Hosting                             | Vercel                                                  |
| Design                              | Green-led, red and cyan accents, neutral surfaces       |
| Public resource access              | No account required                                     |
| Content contribution                | Account required                                        |
| Content publishing                  | Human approval required                                 |
| Resource and past-question database | One shared catalogue                                    |
| Scholarship and internship database | One shared opportunities system                         |
| Feedback                            | Controlled private reports, not a public complaint wall |
| Search                              | PostgreSQL full-text search initially                   |
| AI predictions                      | Not included                                            |
| Offline support                     | Not included in V1                                      |
| Lecturer directory                  | Postponed pending authorised information                |
| Administration                      | Role-based admin console                                |
| Security                            | RLS, secure storage and server-side validation          |
| Ownership                           | ASSON-controlled accounts and repository                |

## One final instruction to the team

Do not build a beautiful website that ASSON cannot maintain. Build a reliable platform that students can trust and future executives can operate.

The resource library, notices, opportunities and contribution workflow are the heart of Version 1. Every other decision should support those four areas.

The first release should be deliberately focused, fully functional and ready for real students — not overloaded with features that nobody has the capacity to maintain.