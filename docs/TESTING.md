# 🧪 Testing Guide

This guide provides instructions on how to run tests for the Form Validator microservice.

## Prerequisites

Ensure Node.js (18+) and pnpm (or npm) are installed as described in the [README.md](README.md) file.

## Running Tests

The project uses Jest for testing. You can run tests using the following `pnpm` commands:

### Run all tests

To execute all test suites once:

```bash
pnpm test
```

### Run tests in watch mode

To run tests and re-run them automatically when file changes are detected:

```bash
pnpm test:watch
```

### Generate test coverage report

To run all tests and generate a detailed code coverage report:

```bash
pnpm test:coverage
```

The coverage report will be generated in the `coverage/` directory. Open `coverage/lcov-report/index.html` in your browser to view the detailed report.

### Testing all endpoints
```bash
#for local test
pnpm verify

#for production test
pnpm verify:prod your_hosted_URL

```

## Test Files

Test files are located in the `src/tests/` directory and follow the naming convention `*.test.ts`.

- [`apiValidation.test.ts`](src/tests/apiValidation.test.ts)
- [`customValidationEngine.test.ts`](src/tests/customValidationEngine.test.ts)
- [`dynamicValidation.test.ts`](src/tests/dynamicValidation.test.ts)
- [`emailDomainValidator.test.ts`](src/tests/emailDomainValidator.test.ts)
- [`fieldTypeDetector.test.ts`](src/tests/fieldTypeDetector.test.ts)
- [`nameFieldValidation.test.ts`](src/tests/nameFieldValidation.test.ts)
- [`passwordValidator.test.ts`](src/tests/passwordValidator.test.ts)

## Adding New Tests

To contribute new tests, create a new file in the `src/tests/` directory following the `*.test.ts` naming convention. Jest will automatically discover and run these tests.