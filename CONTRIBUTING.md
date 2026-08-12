# Contributing to VenDeX Platform

Thank you for your interest in contributing to the VenDeX Multi-Vendor E-Commerce platform! Please review the guidelines below to ensure a smooth development and review process.

## 1. Getting Started

1. **Fork the Repository**: Create a personal copy of the repository on GitHub.
2. **Clone Locally**: Clone your fork to your local system:
   ```bash
   git clone https://github.com/YOUR_USERNAME/distributed-microservices-with-kafka.git
   ```
3. **Install Dependencies**: Install the frontend and microservice node packages:
   - Root project: `pnpm install` (or the equivalent package manager commands).
   - Client workspace: `cd client && pnpm install`.

## 2. Branching Strategy

We follow a simple feature-branch workflow:
- Always base your work on the `master` or current target integration branch.
- Create descriptive feature branches:
  ```bash
  git checkout -b feature/your-awesome-feature
  ```
- Keep commits focused and atomic. Write clear, imperative commit messages.

## 3. Code Standards & Quality

### Frontend (Client)
- Developed using **React**, **Vite**, and **TypeScript**.
- Ensure TypeScript builds cleanly with no compiler warnings or implicit `any` fallbacks. Run `pnpm build` in the `client` directory to verify before pushing.
- Style UI components using clean CSS or utility styling. Rely on component modularity.

### Backend (Microservices)
- Built using **Node.js**, **Express**, and **MongoDB/Mongoose**.
- Enforce strict authentication checks:
  - Do not trust `customerId` or `userId` from the request body. Always derive it from `req.user.id` (populated by JWT auth verification middleware).
  - Implement IDOR validation to ensure resources belong to the requesting user or authorized vendors.
- Keep inventory and checkout flows atomic. Use MongoDB's atomic updates (e.g. `findOneAndUpdate` with `$inc`) to prevent race conditions.

## 4. Submitting Pull Requests

1. Commit your modifications and verify all service tests pass.
2. Push your feature branch to your fork:
   ```bash
   git push origin feature/your-awesome-feature
   ```
3. Open a Pull Request (PR) on GitHub.
4. Provide a clear description of the problem solved and modifications introduced.

## 5. Security Vulnerabilities

Please **do not** open public GitHub issues for security vulnerabilities. Instead, refer to [SECURITY.md](SECURITY.md) for instructions on responsible disclosure.
