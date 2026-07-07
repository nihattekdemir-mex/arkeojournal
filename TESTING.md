# Testing Guide - ArkeoJournal

This guide covers how to run and write tests for ArkeoJournal.

## Table of Contents

1. [Setup](#setup)
2. [Running Tests](#running-tests)
3. [Writing Tests](#writing-tests)
4. [Test Structure](#test-structure)
5. [Testing Best Practices](#testing-best-practices)
6. [Coverage Reports](#coverage-reports)

## Setup

### Install Test Dependencies

```bash
npm install --legacy-peer-deps --save-dev jest @testing-library/react @testing-library/jest-dom jest-environment-jsdom ts-node
```

### Configuration Files

The project includes:
- `jest.config.js` - Jest configuration
- `jest.setup.js` - Jest setup file

## Running Tests

### Run All Tests

```bash
npm test
```

### Run Tests in Watch Mode

```bash
npm test -- --watch
```

### Run Tests for Specific File

```bash
npm test -- lib/constants.test.ts
```

### Run with Coverage

```bash
npm test -- --coverage
```

### Run Tests Before Build

```bash
npm test && npm run build
```

## Writing Tests

### Test File Naming

Test files should be named:
- `*.test.ts` or `*.test.tsx`
- `*.spec.ts` or `*.spec.tsx`
- Located in `__tests__` directory

### Example: Unit Test

```typescript
import { hasPermission } from '@/lib/permissions';

describe('hasPermission', () => {
  it('should return true for admin with any permission', () => {
    expect(hasPermission('ADMIN', 'create_news')).toBe(true);
  });

  it('should return false for guest with create permission', () => {
    expect(hasPermission('GUEST', 'create_news')).toBe(false);
  });
});
```

### Example: Component Test

```typescript
import { render, screen } from '@testing-library/react';
import { Button } from '@/components/ui/button';

describe('Button Component', () => {
  it('should render with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('should call onClick handler', () => {
    const mockFn = jest.fn();
    const { getByText } = render(<Button onClick={mockFn}>Click</Button>);
    getByText('Click').click();
    expect(mockFn).toHaveBeenCalled();
  });
});
```

### Example: API Endpoint Test (Mocked)

```typescript
import { createMocks } from 'node-mocks-http';
import { GET } from '@/app/api/haberler/route';

describe('/api/haberler GET', () => {
  it('should return published news', async () => {
    const { req, res } = createMocks({
      method: 'GET',
    });

    await GET(req);

    expect(res._getStatusCode()).toBe(200);
  });
});
```

## Test Structure

```
project/
├── app/
│   ├── api/
│   │   └── __tests__/
│   │       └── endpoints.test.ts
│   └── components/
│       └── __tests__/
│           └── component.test.tsx
├── lib/
│   ├── __tests__/
│   │   ├── permissions.test.ts
│   │   └── constants.test.ts
├── jest.config.js
└── jest.setup.js
```

## Testing Best Practices

### 1. Unit Tests

Test individual functions and utilities in isolation.

```typescript
// Good: Test pure function
describe('formatDate', () => {
  it('should format date correctly', () => {
    expect(formatDate(new Date('2026-07-07'))).toBe('07/07/2026');
  });
});
```

### 2. Component Tests

Test React components with React Testing Library.

```typescript
// Good: Test user interaction
it('should update input value', () => {
  render(<Input />);
  const input = screen.getByRole('textbox');
  fireEvent.change(input, { target: { value: 'test' } });
  expect(input).toHaveValue('test');
});
```

### 3. Async Tests

Use async/await for async operations.

```typescript
// Good: Use async/await
it('should fetch users', async () => {
  const response = await fetch('/api/admin/users');
  expect(response.ok).toBe(true);
});
```

### 4. Mocking

Mock external dependencies.

```typescript
// Mock fetch
global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({ users: [] }),
  })
);
```

### 5. Arrange-Act-Assert Pattern

```typescript
describe('UserForm', () => {
  it('should submit form data', () => {
    // Arrange
    const mockFn = jest.fn();
    render(<UserForm onSubmit={mockFn} />);

    // Act
    fireEvent.click(screen.getByText('Submit'));

    // Assert
    expect(mockFn).toHaveBeenCalled();
  });
});
```

## Coverage Reports

### Generate Coverage Report

```bash
npm test -- --coverage
```

### View Coverage Report

```bash
# Open coverage report
open coverage/lcov-report/index.html
```

### Coverage Targets

Current coverage targets (can be adjusted in `jest.config.js`):

```javascript
coverageThreshold: {
  global: {
    branches: 70,
    functions: 70,
    lines: 70,
    statements: 70,
  },
}
```

## Test Files Included

### Permissions Tests (`lib/__tests__/permissions.test.ts`)

Tests for RBAC permission system:
- Role permissions mapping
- `hasPermission()` function
- `hasAnyPermission()` function
- `hasAllPermissions()` function

### Constants Tests (`lib/__tests__/constants.test.ts`)

Tests for application constants:
- Role labels
- Category labels
- News status labels

### API Endpoint Tests (`app/api/__tests__/endpoints.test.ts`)

Placeholder tests for API endpoints (requires mocking):
- GET /api/haberler
- POST /api/haberler
- GET /api/approvals

## Running Tests in CI/CD

Tests automatically run in GitHub Actions pipeline:

```yaml
# .github/workflows/ci-cd.yml
- name: Run tests
  run: npm test -- --coverage
```

## Debugging Tests

### Run Single Test

```bash
npm test -- lib/__tests__/permissions.test.ts
```

### Debug Mode

```bash
node --inspect-brk node_modules/.bin/jest --runInBand
```

### Watch Specific File

```bash
npm test -- --watch lib/__tests__/
```

## Common Issues

### Test Timeout

```typescript
// Increase timeout for slow tests
it('should do something slow', async () => {
  // test code
}, 10000); // 10 second timeout
```

### Module Not Found

Make sure `moduleNameMapper` in `jest.config.js` includes path aliases:

```javascript
moduleNameMapper: {
  '^@/(.*)$': '<rootDir>/$1',
}
```

### Prisma in Tests

For testing with Prisma, use:

```bash
npm install --save-dev @prisma/internals
```

## Resources

- [Jest Documentation](https://jestjs.io/)
- [React Testing Library](https://testing-library.com/react)
- [Testing Library Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- [Next.js Testing](https://nextjs.org/docs/testing)

## Support

For testing questions, check:
- GitHub Issues: https://github.com/nihattekdemir-mex/arkeojournal/issues
- Jest Docs: https://jestjs.io/docs/getting-started
