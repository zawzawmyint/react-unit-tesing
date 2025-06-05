# React Testing with Jest

This project demonstrates how to test React components using Jest and React Testing Library.

## Features

- Unit testing for React components
- Mocking API calls

## Getting Started

1. Install dependencies:

```
pnpm install
```

2. Run tests:

```
pnpm test
```

3. Run in development mode:

```
pnpm dev
```

## Scripts

- test : Run all tests
- dev : Start development server

## GitHub Actions Workflow

This project includes a CI/CD workflow that:

- Runs on pushes to the `main` branch
- Can be manually triggered via the GitHub Actions UI (using `workflow_dispatch`)
- Performs the following steps:
  1. Checks out the repository
  2. Sets up Node.js v21
  3. Installs dependencies
  4. Runs all Jest tests

To manually run the workflow:

1. Go to the "Actions" tab in your GitHub repository
2. Select the "React Unit Tests" workflow
3. Click "Run workflow"
