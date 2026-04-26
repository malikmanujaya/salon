Salon Management Web Product Requirements Guide
You’re building a Salon Management Web Platform for Sri Lankan salons, especially well-known salons that currently manage bookings through phone calls, WhatsApp, paper books, and manual follow-ups.
The product should be simple, fast, and reliable. Famous salons will not adopt it just because it has many features. They will adopt it if it saves time, reduces missed appointments, and improves the customer experience.

---

## How to start frontend and backend

**Prerequisites:** Node.js 20+ (recommended). The API needs **MySQL 8+** running with a database (see `backend/.env.example`).

Run the **frontend** and **backend** in separate terminals.

### Frontend

From the repo root:

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Open [http://localhost:5173](http://localhost:5173). Set `VITE_API_URL` in `.env` if your API is not on the default URL.

### Backend

**First-time setup** (once per machine):

```bash
cd backend
npm install
cp .env.example .env
# Edit .env if your MySQL user, password, host, port, or database name differ.
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS salon CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
npm run prisma:generate
npm run prisma:migrate -- --name init
```

**Start the API** (every time you develop):

```bash
cd backend
npm run start:dev
```

- Base URL: [http://localhost:4000/api](http://localhost:4000/api)
- Health check: `GET /api/health`
- Swagger (development): [http://localhost:4000/api/docs](http://localhost:4000/api/docs)

`npm run start:dev` watches NestJS code and, when `prisma/schema.prisma` changes, regenerates the Prisma client and restarts the server.

More detail: [frontend/README.md](frontend/README.md) and [backend/README.md](backend/README.md).

---

🧩 1. Core Product Scope
A web-based salon management system with:
Appointment booking management
Staff and schedule management
Customer management
SMS and email reminders
Service and pricing management
Admin portal
Multi-salon support for future SaaS scaling

⭐ 2. Must-Have Features for MVP
These are the features needed for the first release.

📅 2.1 Appointment Booking System
Features
Create bookings
Edit bookings
Cancel bookings
Reschedule bookings
Assign staff member
Select one or more services
Set appointment date and time
Show booking status:
Pending
Confirmed
Completed
Cancelled
No-show
Support walk-in customers
Support pre-booked appointments
Prevent double bookings
Booking Fields
Customer name
Customer phone number
Customer email
Service
Staff member
Date
Start time
End time
Booking status
Notes
Created by
Why this is critical
This is the heart of the product. It replaces the salon’s physical booking book and reduces missed or overlapping appointments.

👩‍🔧 2.2 Staff Management
Features
Add staff members
Edit staff profiles
Deactivate staff
Assign services to staff
Set working days
Set working hours
Set lunch breaks
Mark staff unavailable
Mark staff leave days
Staff Fields
Full name
Phone number
Email
Role
Assigned branch
Assigned services
Working hours
Status

🧾 2.3 Customer Management
Features
Add customers
Edit customer details
View booking history
Search customers by name or phone number
Add customer notes
Track no-shows
Track repeat customers
Customer Fields
Name
Phone number
Email
Gender, optional
Birthday, optional
Notes
Booking history
Created date
Why this matters
Sri Lankan salons depend heavily on repeat customers. A simple CRM helps salons remember customer preferences and improve service.

🔔 2.4 SMS and Email Reminders
Features
Send booking confirmation SMS
Send booking confirmation email
Send appointment reminders
Send cancellation notification
Send reschedule notification
Track notification status
Reminder Timings
Default reminder options:
Immediately after booking confirmation
24 hours before appointment
2 hours before appointment
Notification Statuses
Pending
Sent
Failed
Delivered, if provider supports it
Important note for Sri Lanka
SMS should be treated as the primary reminder channel. Email is useful, but many salon customers will respond better to SMS or WhatsApp in future versions.

📊 2.5 Basic Dashboard
Dashboard should show
Today’s bookings
Upcoming bookings
Cancelled bookings
Completed bookings
No-shows
Staff schedule summary
Total bookings today
Total bookings this week
For MVP
Keep the dashboard simple. Salon staff should understand it within a few seconds.

💰 2.6 Service and Pricing Management
Features
Add service categories
Add services
Edit services
Set service price
Set service duration
Assign staff to services
Activate/deactivate services
Example Categories
Hair
Bridal
Makeup
Facial
Nails
Waxing
Spa
Grooming
Service Fields
Service name
Category
Duration
Price
Description
Assigned staff
Status

🧑‍💼 2.7 Admin Portal
Features
Manage salon profile
Manage branches
Manage staff
Manage services
Manage customers
Manage bookings
View dashboard
Configure reminder settings
Manage user roles
MVP approach
Start with single-branch support in the UI, but design the database to support multiple branches later.

🌱 3. Good-to-Have Features for Future Releases
These should not block the MVP.

🚀 Phase 2 Features
3.1 Public Online Booking Page
Customers can book appointments through a public salon link.
Example:
salonapp.lk/glamour-salon

Features:
View services
Select staff, optional
Choose date and time
Enter name and phone number
Receive confirmation SMS/email

3.2 WhatsApp Integration
Very valuable for Sri Lanka.
Features:
WhatsApp booking confirmation
WhatsApp reminders
WhatsApp reschedule message
WhatsApp cancellation message

3.3 Payment Tracking
Not full POS yet.
Features:
Mark payment as paid/unpaid
Add payment method:
Cash
Card
Bank transfer
Online payment
Track total daily collection

3.4 Customer Notes and Preferences
Examples:
Preferred stylist
Hair color formula
Skin sensitivity
Allergies
Bridal package notes
Special requests

3.5 Multiple Branches
Useful for famous salons with several locations.
Features:
Branch-level bookings
Branch-level staff
Branch-level services
Branch-level reports

📈 Phase 3 Features
3.6 Loyalty Program
Features:
Points per booking
Discounts
Birthday offers
VIP customer tagging

3.7 Advanced Analytics
Reports:
Revenue per day
Revenue per month
Most booked services
Most active customers
Staff performance
Cancellation rate
No-show rate
Peak booking hours

3.8 Inventory Management
Features:
Track salon products
Track product usage
Low-stock alerts
Product sales
Examples:
Shampoo
Hair color
Facial products
Nail products

💎 Advanced Features Later
Mobile app for staff
Mobile app for customers
AI-based smart scheduling
Instagram booking integration
Marketing campaigns
Promo code system
Gift cards
Membership packages
Bridal package management
Customer feedback system

👥 4. User Roles and Privileges
Role design is very important. Do this properly from the beginning.

🧑‍💼 4.1 Super Admin
Who
Your company / SaaS platform owner.
Purpose
Controls the whole system across all salons.
Permissions
Salon Management
Create salon account
Edit salon account
Suspend salon account
Delete salon account
View salon subscription status
Manage salon limits
User Management
Create salon owner account
Reset user passwords
Disable users
View users across salons
Platform Monitoring
View total salons
View total bookings
View SMS usage
View email usage
View failed notification logs
View system errors
Subscription Management, future
Create subscription plans
Assign plans to salons
Track payments
Limit usage by plan
Restrictions
Super Admin should not casually modify customer bookings unless required for support.

🏢 4.2 Salon Owner / Salon Admin
Who
Salon owner, branch owner, or senior manager.
Purpose
Manages the full salon operation.
Permissions
Booking Management
Create bookings
Edit bookings
Cancel bookings
Reschedule bookings
Mark booking as completed
Mark booking as no-show
View all bookings
Staff Management
Add staff
Edit staff
Deactivate staff
Set working hours
Assign services to staff
Manage leave/unavailable times
Service Management
Add services
Edit services
Change pricing
Change service duration
Deactivate services
Customer Management
Add customers
Edit customers
View customer history
Add customer notes
View customer contact details
Reports
View daily reports
View weekly reports
View monthly reports
View staff performance
View cancellation/no-show reports
Settings
Configure SMS reminders
Configure email reminders
Manage salon profile
Manage branch details
Manage role permissions
Restrictions
Cannot access other salons’ data.

👩‍💻 4.3 Receptionist / Front Desk
Who
Person handling bookings and daily customer communication.
Purpose
Handles daily appointment operations.
Permissions
Booking Management
Create bookings
Edit bookings
Reschedule bookings
Cancel bookings
Assign staff
View calendar
View today’s bookings
View upcoming bookings
Customer Management
Add customers
Edit basic customer details
View customer booking history
Add simple notes
Limited Staff View
View staff availability
View staff schedule
Cannot change staff salary or account permissions
Restrictions
Cannot delete staff
Cannot create admin users
Cannot change service pricing
Cannot view full financial reports
Cannot change reminder settings
Cannot access subscription settings

✂️ 4.4 Staff / Stylist / Therapist
Who
Hair stylist, beautician, makeup artist, therapist, nail artist, etc.
Purpose
Views and manages their own appointments.
Permissions
Schedule
View own bookings
View own daily schedule
View assigned customer details
Mark service as completed
Add customer service notes
Customer Notes
Can add notes like:
Preferred style
Product used
Color mix
Special instruction
Restrictions
Cannot view all business reports
Cannot edit other staff bookings
Cannot change service pricing
Cannot cancel appointments unless allowed
Cannot create users
Cannot manage salon settings

👤 4.5 Customer, Future Phase
Who
Salon customer booking online.
Purpose
Allows self-service booking.
Permissions
View services
Book appointment
Reschedule appointment, based on salon rules
Cancel appointment, based on salon rules
Receive reminders
View own booking history
Restrictions
Cannot view staff internal schedule
Cannot see other customers
Cannot access admin portal

🔐 5. Role Permission Matrix
Feature
Super Admin
Salon Owner
Receptionist
Staff
Customer
Manage salons
✅
❌
❌
❌
❌
Manage subscription
✅
❌
❌
❌
❌
Manage branches
✅
✅
❌
❌
❌
Manage staff
✅
✅
❌
❌
❌
Manage services
✅
✅
❌
❌
❌
Create bookings
✅
✅
✅
Optional
✅ future
Edit bookings
✅
✅
✅
Limited
Limited future
Cancel bookings
✅
✅
✅
Optional
Limited future
View all bookings
✅
✅
✅
❌
❌
View own bookings
✅
✅
✅
✅
✅
Manage customers
✅
✅
✅
Limited
❌
View reports
✅
✅
Limited
❌
❌
Configure reminders
✅
✅
❌
❌
❌
Send SMS/email
✅
✅
✅
Optional
❌
View audit logs
✅
✅
❌
❌
❌


🧱 6. System Module Breakdown
Build the system as separate modules.

6.1 Authentication Module
Features
Login
Logout
Refresh token
Forgot password
Reset password
Role-based access
Permission-based access
Recommended
Use JWT access token + refresh token.

6.2 Salon Module
Features
Create salon
Edit salon
Upload logo
Set business details
Set timezone
Set contact details
Salon Fields
Name
Address
Phone number
Email
Logo
Business registration number, optional
Status

6.3 Branch Module
Features
Add branch
Edit branch
Set branch working hours
Assign staff to branch
Branch Fields
Salon ID
Branch name
Address
Phone number
Opening hours
Status

6.4 Booking Module
Features
Create booking
Update booking
Cancel booking
Reschedule booking
Mark completed
Mark no-show
Prevent double booking
Important Rule
A staff member cannot have two bookings during overlapping times.

6.5 Staff Module
Features
Manage staff profile
Manage staff schedule
Manage leave
Assign services

6.6 Customer Module
Features
Add customer
Update customer
Search customer
View booking history
Customer notes

6.7 Service Module
Features
Add category
Add service
Set price
Set duration
Assign staff
Activate/deactivate service

6.8 Notification Module
Features
Send SMS
Send email
Log notification
Retry failed notifications
Track delivery status

6.9 Reminder Module
Features
Create reminder jobs
Schedule reminders
Cancel reminders if booking is cancelled
Reschedule reminders if booking time changes

6.10 Reports Module
MVP Reports
Daily bookings
Weekly bookings
Cancelled bookings
Completed bookings
Staff booking count
No-show count

6.11 Audit Log Module
Track important actions.
Examples:
Booking created
Booking cancelled
Staff created
Service price changed
Reminder failed
User logged in

🔔 7. SMS and Email Requirements
SMS Requirements
Must support
Booking confirmation SMS
Reminder SMS
Cancellation SMS
Reschedule SMS
Failed SMS logging
Example SMS
Hi Nimesha, your appointment at Glamour Salon is confirmed for 25 Apr at 3:00 PM. Service: Hair Coloring.

SMS Providers
Consider:
Dialog Enterprise SMS
Mobitel mSpace
Notify.lk
Twilio, if international support is needed
For MVP, create a provider abstraction so you can change providers later.
NotificationService
   |
   |-- SmsProvider
   |-- EmailProvider


Email Requirements
Use for
Booking confirmation
Reminder
Cancellation
Admin alerts
Monthly reports, future
Providers
Amazon SES
SendGrid
Mailgun

⚙️ 8. Non-Functional Requirements
8.1 Performance
The system should:
Load dashboard quickly
Create booking in under 2 seconds
Search customers quickly
Handle weekend booking peaks

8.2 Reliability
The system must:
Prevent double bookings
Not lose booking data
Retry failed reminders
Log all failed SMS/email attempts

8.3 Security
Must include:
Password hashing
JWT authentication
Refresh tokens
Role-based access control
Permission checks
Secure customer data
Audit logs
HTTPS in production

8.4 Usability
The UI should be:
Simple
Fast
Mobile responsive
Easy for receptionists
Easy for non-technical users
Booking creation should take less than 10 seconds.

8.5 Data Privacy
Customer phone numbers and personal details must be protected.
Important:
Do not expose customer data across salons
Keep each salon’s data separated
Use tenant-based authorization

🛠️ 9. Recommended Tech Stack
Based on your decision:
Frontend
Next.js
TypeScript
Tailwind CSS
shadcn/ui
React Hook Form
Zod
TanStack Query

Backend
NestJS
TypeScript
Node.js LTS
PostgreSQL
Prisma ORM
Redis
BullMQ
JWT Auth

Infrastructure
Frontend: Vercel
Backend: AWS / DigitalOcean / Render
Database: PostgreSQL
Queue: Redis
Storage: S3-compatible storage

Notifications
SMS: Dialog / Mobitel / Notify.lk / Twilio
Email: Amazon SES / SendGrid


🏗️ 10. Suggested Backend Architecture with NestJS
Core NestJS Modules
auth
users
roles
permissions
salons
branches
staff
customers
services
bookings
availability
notifications
reminders
reports
audit-logs
settings


Recommended Flow
Next.js Frontend
        |
        v
NestJS REST API
        |
        v
PostgreSQL Database
        |
        v
Redis + BullMQ
        |
        v
SMS / Email Providers


🧬 11. MVP Database Entities
Start with these.
User
Role
Permission
Salon
Branch
StaffProfile
Customer
ServiceCategory
Service
Booking
BookingService
StaffAvailability
StaffLeave
NotificationLog
ReminderJob
AuditLog


🗃️ 12. Important Database Design Rules
Multi-tenant from day one
Most tables should include:
salonId
branchId

This allows you to support many salons later.
Examples:
Booking
- id
- salonId
- branchId
- customerId
- staffId
- startTime
- endTime
- status

Service
- id
- salonId
- branchId
- name
- price
- duration
- status


🔁 13. Booking Lifecycle
Booking Status Flow
Pending
   ↓
Confirmed
   ↓
Completed

Alternative flows:
Confirmed → Cancelled
Confirmed → No-show
Confirmed → Rescheduled


Booking Creation Flow
Receptionist selects customer
        ↓
Selects service
        ↓
Selects staff
        ↓
Selects date/time
        ↓
System checks availability
        ↓
Booking is created
        ↓
SMS/email confirmation sent
        ↓
Reminder jobs are scheduled


🔔 14. Reminder System Flow
Do not send reminders directly inside the booking API request.
Better design:
Booking Created
        ↓
Create reminder jobs
        ↓
BullMQ queue
        ↓
Send SMS/email at scheduled time
        ↓
Save delivery status

When booking is cancelled:
Cancel booking
        ↓
Cancel pending reminders
        ↓
Send cancellation notification

When booking is rescheduled:
Update booking time
        ↓
Cancel old reminders
        ↓
Create new reminders
        ↓
Send reschedule notification


🖥️ 15. Frontend Pages
Public / Auth Pages
/login
/forgot-password
/reset-password

Admin Portal Pages
/dashboard
/bookings
/bookings/new
/calendar
/customers
/staff
/services
/reports
/settings

Future Customer Booking Pages
/[salonSlug]
/[salonSlug]/book
/[salonSlug]/booking-confirmed


📌 16. MVP API Endpoints
Auth
POST /auth/login
POST /auth/logout
POST /auth/refresh
POST /auth/forgot-password
POST /auth/reset-password

Bookings
GET    /bookings
POST   /bookings
GET    /bookings/:id
PATCH  /bookings/:id
DELETE /bookings/:id
POST   /bookings/:id/cancel
POST   /bookings/:id/complete
POST   /bookings/:id/no-show

Staff
GET    /staff
POST   /staff
GET    /staff/:id
PATCH  /staff/:id
DELETE /staff/:id

Customers
GET    /customers
POST   /customers
GET    /customers/:id
PATCH  /customers/:id
GET    /customers/:id/bookings

Services
GET    /services
POST   /services
GET    /services/:id
PATCH  /services/:id
DELETE /services/:id

Reports
GET /reports/summary
GET /reports/bookings
GET /reports/staff

Notifications
GET  /notifications/logs
POST /notifications/test-sms
POST /notifications/test-email


📦 17. MVP Release Checklist
Before launching to real salons:
✅ Login works
✅ Roles work correctly
✅ Booking creation works
✅ Booking edit/reschedule works
✅ Booking cancellation works
✅ No double booking possible
✅ Staff schedule works
✅ Service duration works
✅ SMS confirmation works
✅ SMS reminders work
✅ Email reminders work
✅ Failed notification logs are visible
✅ Customer search works
✅ Dashboard shows today’s bookings
✅ System works well on mobile/tablet
✅ Basic audit logs are saved

🚨 18. Reality Check
Do not build everything at once.
Your first sellable version should focus on:
Bookings
Staff schedules
Customers
SMS reminders
Admin dashboard

That alone is enough to approach premium salons.
For Sri Lanka, the strongest selling points are:
Fewer missed appointments
Better customer follow-up
Easier receptionist workflow
Professional reminder messages
Clear daily schedule
Less dependency on manual books and WhatsApp chats

