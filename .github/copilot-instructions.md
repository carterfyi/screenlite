# Screenlite AI Coding Agent Instructions

## Project Overview

Screenlite is an **open-source digital signage CMS** with a centralized backend and distributed web-based players. The system consists of:
- **Server** (Fastify/TypeScript): API, content management, authentication, file processing
- **Client** (React/TypeScript): Web UI for managing content and devices
- **FFmpeg Service** (Node.js/Express): Sandboxed media processing microservice
- **Web Player** (Vite/React): Standalone player app for displaying content

## Architecture & Key Patterns

### Server Architecture (Clean Architecture + DDD-lite)

The server follows a **layered modular architecture** with clear separation of concerns:

```
server/src/
├── core/              # Shared domain concepts (entities, value objects, enums)
├── modules/           # Feature modules (auth, user, workspace, etc.)
│   └── <module>/
│       ├── application/    # Use cases (business logic orchestration)
│       ├── domain/         # Business logic, services, interfaces (ports)
│       └── infrastructure/ # External adapters (repositories, routes, queries)
├── infrastructure/    # Cross-cutting infrastructure (HTTP, DB, Redis, S3, messaging)
└── shared/           # Shared utilities and DTOs
```

**Critical patterns:**
- **Ports & Adapters**: Domain defines interfaces (`IUserRepository`), infrastructure implements them (`PrismaUserRepository`)
- **Dependency Injection**: Manual DI via `di.plugin.ts` - all services/repositories registered as Fastify decorators
- **Use Cases**: Single-responsibility orchestrators in `application/usecases/` - inject dependencies via constructor
- **Entities**: Rich domain objects in `core/entities/` with business logic (e.g., `User.entity.ts`)
- **DTOs**: Data transfer objects in `shared/dto/` - plain TypeScript types for data passing between layers
- **Mappers**: Convert between persistence models and domain entities (e.g., `PrismaRepositoryUserMapper`)

### Server HTTP Layer

- **Fastify with Zod validation**: All routes use `fastify-type-provider-zod` for request/response validation
- **Routes**: Organized by module in `modules/<module>/infrastructure/routes/`
- **Plugin System**: Fastify plugins register infrastructure concerns (see `infrastructure/http/plugins/`)
- **Auth**: Bearer token-based (opaque 64-char hex tokens), no cookies, stored in `Authorization` header
- **Error Handling**: Centralized via `errorHandler` plugin, uses `@fastify/sensible`

### Database & Persistence

- **Prisma ORM**: Schema in `server/prisma/schema.prisma`
- **Migrations**: Use `npx prisma migrate dev` in development, `npm run db:deploy` for production
- **Models Split**: Prisma models in `prisma/models/*.prisma` files (imported into main schema)
- **Optimistic Locking**: Entities have `version` field, repositories use it in `where` clause for updates
- **Unit of Work**: `PrismaUnitOfWork` for transactions (`unitOfWork.execute(async (tx) => { ... })`)
- **Typed SQL**: Prisma preview feature enabled - use for complex queries when needed

### Message Queue & Background Jobs

- **BullMQ + Redis**: Background jobs for emails, file deletions, etc.
- **Job Producer**: `jobProducer.enqueue('job_name', data)` - see `IJobProducer` interface
- **Event Bus**: `BullMQEventBusAdapter` - publishes domain events to queues
- **Queue Names**: Jobs routed to specific queues via `eventQueueMap`

### Storage & Media

- **S3-compatible storage**: MinIO in dev, configurable for prod (AWS S3, etc.)
- **File uploads**: Multipart handled via Fastify plugins (`multipartUpload`, `storage`)
- **FFmpeg isolation**: Media processing **never** runs in main server - all FFmpeg operations delegated to `ffmpeg-service` via HTTP
- **FFmpeg Service**: Sandboxed Express app with strict resource limits (2GB memory, 2 CPU), runs on internal network

### Client Architecture

- **React Router v7**: File-based routing in `client/src/routes/`
- **TanStack Query**: All server state management - query keys in module query files (e.g., `currentUserQuery()`)
- **Zustand**: Client-side UI state only
- **Axios**: Configured in `client/src/config/axios.ts` - auto-injects Bearer token from localStorage
- **Module Organization**: Feature modules in `client/src/modules/<feature>/` with components, hooks, providers, pages
- **Forms**: React Hook Form for form state management
- **Styling**: Tailwind CSS with custom design system

### Web Player Architecture

- **Adapter Pattern**: Different CMS adapters (`ScreenliteAdapter`, `GarlicHubAdapter`, `NetworkFileAdapter`)
- **Media Caching**: `BrowserMediaCacheAdapter` - caches media in IndexedDB for offline playback
- **Time Synchronization**: `useTimeServer` hook for accurate timing across distributed players
- **Media Sequencing**: `useMediaSequence` and `usePlaylist` hooks orchestrate content scheduling

## Development Workflow

### Running Locally (Docker Compose)

```powershell
# Start all services (server, client, postgres, redis, minio, ffmpeg-service)
docker compose up -d

# Access:
# - Frontend: http://localhost:3001
# - Backend API: http://localhost:3000
# - MinIO Console: http://localhost:9001 (screenlite/screenlite)
# - Prisma Studio: http://localhost:5555

# Rebuild after code changes
docker compose up -d --build

# View logs
docker compose logs -f server
docker compose logs -f client

# Full reset (WARNING: deletes all data)
docker compose down -v
```

### Database Operations

```powershell
# In server directory
cd server

# Create migration
npx prisma migrate dev --name migration_name

# Deploy migrations (prod)
npm run db:deploy

# Reset DB (dev only - WARNING: data loss)
npm run db:reset

# Open Prisma Studio
npx prisma studio
```

### Running Without Docker (Dev)

```powershell
# Server (requires Postgres, Redis, MinIO running)
cd server
npm run dev  # Uses tsx watch

# Client
cd client
npm run dev  # Vite dev server

# FFmpeg Service
cd ffmpeg-service
npm run dev
```

### Testing

```powershell
cd server
npm test  # Vitest with --bail=1
```

## Key Conventions

### Naming Conventions

- **Files**: `kebab-case.ts` for implementation, `.interface.ts` for interfaces, `.dto.ts` for DTOs
- **Classes**: `PascalCase` with descriptive suffixes (`UserRepository`, `AuthService`, `LoginUseCase`)
- **Interfaces**: `IPascalCase` prefix (e.g., `IUserRepository`, `IAuthService`)
- **Types/DTOs**: `PascalCase` with `DTO` suffix (e.g., `UserDTO`, `CreateWorkspaceDTO`)
- **Routes**: `kebab-case.route.ts` (e.g., `signup.route.ts`, `get-workspace-members.route.ts`)

### Import Paths

- **Server**: Use path aliases - `@/` maps to `server/src/`
  ```typescript
  import { User } from '@/core/entities/user.entity.ts'
  import { IUserRepository } from '@/modules/user/domain/ports/user-repository.interface.ts'
  ```
- **Client**: Relative imports or `@/` alias
- **Always include `.ts`/`.tsx` extensions** in imports (ESM requirement)

### Code Organization

- **One class/interface per file** (exceptions: small related utilities)
- **Colocate by feature**: Keep module code together (auth module has all auth-related code)
- **Separate queries from commands**: CQRS-lite - read operations in `infrastructure/queries/`, writes in repositories/use cases
- **Factory functions**: Use for complex service initialization (e.g., `workspaceMemberServiceFactory`)

### Error Handling

- **Domain errors**: Throw custom errors from use cases/services (e.g., `UserNotFoundError`)
- **HTTP errors**: Use `@fastify/sensible` errors in routes (`reply.notFound()`, `reply.badRequest()`)
- **Client errors**: React Error Boundaries wrap route components

## Security Notes

- **Authentication**: Opaque Bearer tokens (64-char hex), short-lived, no refresh tokens yet
- **2FA**: TOTP support via `two-factor-auth` module
- **CSRF**: Not required (no cookie-based auth)
- **CORS**: Configured via `ALLOWED_CORS_ORIGINS` env var
- **Passwords**: Min 8 chars (bcrypt hashing), simplified from previous complex rules
- **File uploads**: Multipart validation, Sharp for image processing/validation
- **FFmpeg isolation**: Sandboxed container with resource limits, tmpfs with `noexec`, separate network

## Environment Configuration

Key env vars (see `docker-compose.yml` for full list):
- `DATABASE_URL`: Postgres connection string
- `REDIS_HOST`, `REDIS_PORT`: Redis connection
- `S3_ENDPOINT`, `S3_ACCESS_KEY`, `S3_SECRET_KEY`: S3 storage config
- `ENCRYPTION_SECRET`: For encrypting sensitive data (64+ chars)
- `ALLOWED_CORS_ORIGINS`: Comma-separated trusted origins
- `FFMPEG_SERVICE_API_URL`: FFmpeg service endpoint

## Common Tasks

### Adding a New Module

1. Create module directory structure in `server/src/modules/<module>/`
2. Define domain entities/interfaces in `domain/ports/`
3. Implement use cases in `application/usecases/`
4. Create infrastructure adapters (repositories, routes) in `infrastructure/`
5. Register routes in `infrastructure/http/routes/index.ts`
6. Register services in `infrastructure/http/plugins/di.plugin.ts`

### Adding a New Route

1. Create route file: `modules/<module>/infrastructure/routes/<action>.route.ts`
2. Define Zod schemas for request/response validation
3. Import in module's `routes/index.ts`
4. Use dependency injection: `fastify.userRepository`, `fastify.authService`, etc.

### Adding a Background Job

1. Define job interface in use case
2. Enqueue via `jobProducer.enqueue('job_name', data)`
3. Implement worker (if not yet implemented) - see existing job handlers

## Known Gotchas

- **Database migrations may reset** during early development - not incremental yet
- **Client UI partially broken** - in active development, expect incomplete features
- **Docker volumes persist data** - use `docker compose down -v` to fully reset
- **FFmpeg service must be running** for media operations - server delegates all FFmpeg work
- **No production deployment yet** - development mode only
- **Chrome only for web player** - not tested in other browsers

## Resources

- [Discord Community](https://discord.gg/2wW8zDjAjr)
- [Web Player Repo](https://github.com/screenlite/web-player)
- Main docs: `README.md`, `DEPLOYMENT.md`, `SECURITY_OVERVIEW.md`
