# NestJS Event Manager

A event management system built with NestJS, TypeORM, and TypeScript. This application provides comprehensive event scheduling, user management, and intelligent event merging capabilities.

## 🚀 Features

- **Event Management**: Create, retrieve, and delete events with comprehensive scheduling
- **User Management**: User registration and relationship management
- **Intelligent Event Merging**: Advanced algorithm to merge overlapping events for users
- **RESTful API**: Clean, well-documented REST endpoints
- **Database Support**: SQLite for development/testing, MySQL for production
- **Comprehensive Testing**: Unit tests, integration tests, and E2E tests
- **Data Seeding**: Automated test data generation with Faker.js

## 📋 Table of Contents

- [Installation](#installation)
- [Database Setup](#database-setup)
- [Quick Start](#quick-start)
- [API Documentation](#api-documentation)
- [Data Models](#data-models)
- [Seed Data](#seed-data)
- [Testing](#testing)
- [Development](#development)
- [Production Deployment](#production-deployment)

## 🛠 Installation

### Prerequisites

- Node.js >= 20.0.0
- npm >= 10.0.0
- MySQL (for production)

### Setup

```bash
# Clone the repository
git clone <repository-url>
cd nestjs-event-manager

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env 
```

## 💾 Database Setup

### Development Environment
The application automatically uses SQLite for development and testing:

```bash
# SQLite database file will be created automatically as 'event_manager.db'
# No additional setup required for development
```

### Production Environment
For production, configure MySQL environment variables:

```bash
# Set these environment variables
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=your_username
DB_PASSWORD=your_password
DB_NAME=event_manager
```

## 🚀 Quick Start

```bash
# Start development server with hot reload
npm run start:dev

# The server will start on http://localhost:3000
# API endpoints are available at http://localhost:3000/api/
```

### Seed Sample Data

```bash
# Seed database with sample users and events
npm run seed:all

# Or seed specific data types
npm run seed:users 15      # Create 15 users
npm run seed:events 20     # Create 20 events
npm run seed:clear         # Clear all data
npm run seed:stats         # Show database statistics
```

## 📚 API Documentation

### Events API

#### Create Event
```bash
curl -X POST http://localhost:3000/api/events \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Team Meeting",
    "description": "Weekly team sync meeting",
    "startTime": "2024-01-15T14:00:00.000Z",
    "endTime": "2024-01-15T15:00:00.000Z",
    "status": "TODO",
    "inviteeIds": ["2e3a1420-0572-423f-b8c4-29ab3402d55d","f0c62620-5154-4d45-9ab6-b8eb2ce6e37d"]
  }'
```

**Response:**
```json
{
  "id": "event-uuid",
  "title": "Team Meeting",
  "description": "Weekly team sync meeting",
  "status": "TODO",
  "startTime": "2024-01-15T14:00:00.000Z",
  "endTime": "2024-01-15T15:00:00.000Z",
  "createdAt": "2024-01-15T10:00:00.000Z",
  "updatedAt": "2024-01-15T10:00:00.000Z",
  "invitees": [
    {
      "id": "user-uuid-1",
      "name": "John Doe"
    },
    {
      "id": "user-uuid-2", 
      "name": "Jane Smith"
    }
  ]
}
```

#### Get Event by ID
```bash
curl -X GET http://localhost:3000/api/events/{event-id}
```

#### Delete Event
```bash
curl -X DELETE http://localhost:3000/api/events/{event-id}
```

### Users API

#### Get All Users
```bash
curl -X GET http://localhost:3000/api/users
```

#### Get User by ID
```bash
curl -X GET http://localhost:3000/api/users/{user-id}
```

#### Merge User Events
Intelligently merges overlapping events for a specific user:

```bash
curl -X POST http://localhost:3000/api/users/{user-id}/merge-events
```

**Response:**
```json
{
  "message": "Successfully merged 3 overlapping events into 1 event",
  "originalEventCount": 5,
  "mergedEventCount": 3,
  "newEventCount": 3,
  "eventsProcessed": 5
}
```

## 🗄 Data Models

### Event Entity

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Primary key, auto-generated |
| `title` | String(255) | Event title (required) |
| `description` | Text | Optional event description |
| `status` | Enum | `TODO`, `IN_PROGRESS`, `COMPLETED` |
| `startTime` | DateTime | Event start time (required) |
| `endTime` | DateTime | Event end time (required) |
| `createdAt` | DateTime | Auto-generated creation timestamp |
| `updatedAt` | DateTime | Auto-updated modification timestamp |
| `invitees` | User[] | Many-to-many relationship with Users |

### User Entity

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Primary key, auto-generated |
| `name` | String(255) | User's full name (required) |
| `events` | Event[] | Many-to-many relationship with Events |

### Event Status Enum

- **TODO**: Event is planned but not started
- **IN_PROGRESS**: Event is currently active
- **COMPLETED**: Event has been finished

## 🌱 Seed Data

The application includes a comprehensive seeding system for development and testing:

### Seed Commands

```bash
# Seed complete dataset (10 users, 5 events with relationships)
npm run seed:all

# Seed only users (default: 10 users)
npm run seed:users
npm run seed:users 25  # Seed 25 users

# Seed only events (default: 5 events)
npm run seed:events
npm run seed:events 15  # Seed 15 events

# Clear all data
npm run seed:clear

# Show database statistics
npm run seed:stats
```

### Sample Data Generation

The seeding system uses Faker.js to generate realistic test data:

- **Users**: Random names and UUIDs
- **Events**: Realistic titles, descriptions, and time ranges
- **Relationships**: Random user-event associations
- **Event Status**: Randomly distributed across TODO, IN_PROGRESS, COMPLETED

## 🧪 Testing

### Unit Tests
```bash
# Run all unit tests
npm run test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:cov
```

### End-to-End Tests
```bash
# Run E2E tests
npm run test:e2e
```

### Test Database
Tests automatically use an in-memory SQLite database that's created and destroyed for each test suite, ensuring isolation and fast execution.

## 🛠 Development

### Development Server
```bash
# Start with hot reload
npm run start:dev

# Start in debug mode
npm run start:debug

# View application logs
tail -f logs/app.log  # if logging is configured
```

### Code Quality
```bash
# Run ESLint with auto-fix
npm run lint

# Format code with Prettier
npm run format

# Build the application
npm run build
```

### Environment Configuration

The application uses different configurations based on `NODE_ENV`:

- **development**: SQLite database with logging enabled
- **test**: In-memory SQLite database 
- **production**: MySQL database with optimized settings

## 🚀 Production Deployment

### Build for Production
```bash
# Install dependencies
npm ci --only=production

# Build the application
npm run build

# Start production server
npm run start:prod
```

### Environment Variables
Set these variables for production deployment:

```bash
NODE_ENV=production
DB_HOST=your-mysql-host
DB_PORT=3306
DB_USERNAME=your-db-user
DB_PASSWORD=your-db-password
DB_NAME=event_manager
PORT=3000
```

### Database Setup for Production
```sql
-- Create database
CREATE DATABASE event_manager CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create user (optional)
CREATE USER 'event_user'@'%' IDENTIFIED BY 'your-secure-password';
GRANT ALL PRIVILEGES ON event_manager.* TO 'event_user'@'%';
FLUSH PRIVILEGES;
```

## 🏗 Architecture

### Technology Stack
- **Framework**: NestJS (Node.js framework)
- **Language**: TypeScript
- **Database**: SQLite (dev/test), MySQL (production)
- **ORM**: TypeORM
- **Validation**: class-validator, class-transformer
- **Testing**: Jest, Supertest

### Project Structure
```
src/
├── entities/           # TypeORM entities
│   ├── event.entity.ts
│   └── user.entity.ts
├── modules/
│   ├── events/         # Event module
│   │   ├── dto/        # Data Transfer Objects
│   │   ├── events.controller.ts
│   │   ├── events.service.ts
│   │   └── events.module.ts
│   └── users/          # User module
│       ├── dto/
│       ├── users.controller.ts
│       ├── users.service.ts
│       └── users.module.ts
├── database/           # Database configuration
│   ├── database.module.ts
│   └── seeds/          # Data seeding
├── config/             # Configuration files
└── main.ts            # Application entry point
```

## 🔧 Event Merging Algorithm

The event merging feature uses a sophisticated algorithm to combine overlapping events:

### How It Works
1. **Retrieve Events**: Fetches all events for a specific user
2. **Detect Overlaps**: Identifies events with overlapping time periods
3. **Merge Logic**: 
   - Combines time ranges (earliest start, latest end)
   - Merges invitee lists (removes duplicates)
   - Concatenates titles and descriptions
   - Selects appropriate status (prioritizes IN_PROGRESS > TODO > COMPLETED)
4. **Database Update**: Atomically removes old events and creates merged event
5. **Relationship Update**: Maintains all user-event relationships

### Example Merge Scenario
```
Before Merge:
- Event A: 2:00 PM - 3:00 PM (Invitees: John, Jane)
- Event B: 2:45 PM - 4:00 PM (Invitees: Jane, Bob)

After Merge:
- Merged Event: 2:00 PM - 4:00 PM (Invitees: John, Jane, Bob)
```

## 📝 API Examples

### Complete Workflow Example

```bash
# 1. Create users (or use seeded data)
curl -X GET http://localhost:3000/api/users

# 2. Create overlapping events
curl -X POST http://localhost:3000/api/events \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Morning Meeting",
    "startTime": "2024-01-15T09:00:00.000Z",
    "endTime": "2024-01-15T10:00:00.000Z",
    "inviteeIds": ["user-id-1"]
  }'

curl -X POST http://localhost:3000/api/events \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Extended Discussion", 
    "startTime": "2024-01-15T09:30:00.000Z",
    "endTime": "2024-01-15T11:00:00.000Z",
    "inviteeIds": ["user-id-1"]
  }'

# 3. Merge overlapping events
curl -X POST http://localhost:3000/api/users/user-id-1/merge-events

# 4. Verify the merge result
curl -X GET http://localhost:3000/api/users/user-id-1
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass (`npm run test`)
6. Commit your changes (`git commit -m 'Add amazing feature'`)
7. Push to the branch (`git push origin feature/amazing-feature`)
8. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For questions and support:
- Open an issue on GitHub
- Check the [NestJS Documentation](https://docs.nestjs.com)
- Review the TypeORM documentation for database questions

---

**Built with ❤️ using NestJS and TypeScript**