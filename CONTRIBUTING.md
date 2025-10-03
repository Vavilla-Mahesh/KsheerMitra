# Contributing to KsheerMitra

Thank you for your interest in contributing to KsheerMitra! This document provides guidelines and instructions for contributing to the project.

## Table of Contents
- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Testing Guidelines](#testing-guidelines)

## Code of Conduct

By participating in this project, you agree to:
- Be respectful and inclusive
- Welcome newcomers
- Accept constructive criticism
- Focus on what's best for the community
- Show empathy towards others

## Getting Started

### Prerequisites

**Backend Development:**
- Node.js 18+
- PostgreSQL 14+
- npm or yarn

**Frontend Development:**
- Flutter SDK 3.0+
- Android Studio / Xcode
- VS Code or Android Studio

### Setting Up Development Environment

1. **Fork and Clone**
```bash
git clone https://github.com/your-username/KsheerMitra.git
cd KsheerMitra
```

2. **Backend Setup**
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your local configuration

# Setup database
createdb ksheer_mitra_dev
psql -d ksheer_mitra_dev -f migrations/001_initial_schema.sql

# Start development server
npm run dev
```

3. **Frontend Setup**
```bash
cd flutter_app
flutter pub get
flutter run
```

## Development Workflow

### Branch Strategy

- `main` - Production-ready code
- `develop` - Development branch
- `feature/*` - New features
- `bugfix/*` - Bug fixes
- `hotfix/*` - Urgent production fixes

### Creating a Feature Branch

```bash
git checkout develop
git pull origin develop
git checkout -b feature/your-feature-name
```

### Making Changes

1. Make your changes
2. Test locally
3. Commit with meaningful messages
4. Push to your fork
5. Create pull request

## Coding Standards

### Backend (Node.js)

#### Style Guide
- Use ES6 module syntax (`import`/`export`)
- Use `const` over `let`, avoid `var`
- Use async/await over callbacks
- Use descriptive variable names
- Add JSDoc comments for functions
- Keep functions small and focused

#### Example:
```javascript
/**
 * Creates a new subscription for a customer
 * @param {Object} subscriptionData - Subscription details
 * @returns {Promise<Object>} Created subscription
 */
export const createSubscription = async (subscriptionData) => {
  const { customer_id, product_id, quantity_per_day } = subscriptionData;
  
  // Validate inputs
  const customer = await findUserById(customer_id);
  if (!customer) {
    throw new Error('Customer not found');
  }
  
  // Create subscription
  return await subscriptionModel.createSubscription(subscriptionData);
};
```

#### File Structure
- Models: Database queries only
- Services: Business logic
- Controllers: HTTP request/response handling
- Routes: Route definitions
- Middlewares: Reusable middleware functions

### Frontend (Flutter/Dart)

#### Style Guide
- Follow official Dart style guide
- Use `flutter format` before committing
- Use descriptive widget names
- Break down complex widgets
- Use `const` constructors when possible
- Add doc comments for public APIs

#### Example:
```dart
/// Displays a list of customer subscriptions
///
/// Fetches subscriptions from the API and displays them in a list.
/// Supports pull-to-refresh and shows appropriate loading/error states.
class SubscriptionsScreen extends ConsumerWidget {
  const SubscriptionsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final subscriptionsAsync = ref.watch(subscriptionsProvider);
    
    return subscriptionsAsync.when(
      data: (subscriptions) => _buildSubscriptionList(subscriptions),
      loading: () => const Center(child: CircularProgressIndicator()),
      error: (error, stack) => _buildErrorView(error),
    );
  }
  
  Widget _buildSubscriptionList(List<Subscription> subscriptions) {
    // Implementation
  }
}
```

#### File Structure
- Models: Data models with serialization
- Services: API calls
- Providers: State management
- Screens: Page-level widgets
- Widgets: Reusable UI components

### Database

#### Migrations
- Create new migration files with sequential numbering
- Include both up and down migrations
- Test migrations on a copy of production data
- Document schema changes

#### Naming Conventions
- Tables: plural, lowercase, underscores (e.g., `subscriptions`)
- Columns: lowercase, underscores (e.g., `customer_id`)
- Indexes: `idx_table_column` (e.g., `idx_users_email`)
- Foreign keys: `fk_table_column` (e.g., `fk_subscriptions_customer`)

## Commit Guidelines

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

#### Types
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

#### Examples

**Good commits:**
```
feat(auth): add refresh token rotation

Implement automatic rotation of refresh tokens on each use.
Old tokens are revoked when new ones are issued.

Closes #123
```

```
fix(billing): correct month total calculation

Fixed issue where daily adjustments weren't included
in monthly billing totals.

Fixes #456
```

```
docs(api): update authentication endpoint documentation

Added examples for token refresh flow and error responses.
```

**Bad commits:**
```
fix stuff
updated files
WIP
```

## Pull Request Process

### Before Submitting

- [ ] Code follows project style guidelines
- [ ] All tests pass
- [ ] New features have tests
- [ ] Documentation updated
- [ ] Commit messages are clear
- [ ] Branch is up to date with develop

### PR Template

When creating a pull request, include:

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
How has this been tested?

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-reviewed code
- [ ] Commented complex code
- [ ] Updated documentation
- [ ] No new warnings
- [ ] Added tests
- [ ] All tests pass

## Screenshots (if applicable)
Add screenshots for UI changes

## Related Issues
Closes #issue_number
```

### Review Process

1. Submit PR to `develop` branch
2. Automated checks run (if configured)
3. At least one maintainer reviews
4. Address review feedback
5. PR is merged by maintainer

### After Merge

- Delete your feature branch
- Pull latest develop
- Start next feature

## Testing Guidelines

### Backend Testing

Create tests in `backend/test/`:

```javascript
// Example test
import { expect } from 'chai';
import { createSubscription } from '../services/subscriptionService.js';

describe('Subscription Service', () => {
  describe('createSubscription', () => {
    it('should create a new subscription', async () => {
      const data = {
        customer_id: 'uuid',
        product_id: 'uuid',
        quantity_per_day: 2,
        start_date: '2024-01-01'
      };
      
      const subscription = await createSubscription(data);
      expect(subscription).to.have.property('id');
      expect(subscription.quantity_per_day).to.equal(2);
    });
    
    it('should throw error for invalid customer', async () => {
      const data = {
        customer_id: 'invalid',
        product_id: 'uuid',
        quantity_per_day: 2,
        start_date: '2024-01-01'
      };
      
      await expect(createSubscription(data)).to.be.rejected;
    });
  });
});
```

Run tests:
```bash
npm test
```

### Flutter Testing

Create tests in `flutter_app/test/`:

```dart
// Example test
import 'package:flutter_test/flutter_test.dart';
import 'package:ksheer_mitra/models/subscription_model.dart';

void main() {
  group('Subscription Model', () {
    test('should parse JSON correctly', () {
      final json = {
        'id': 'uuid',
        'customer_id': 'uuid',
        'product_id': 'uuid',
        'quantity_per_day': 2,
        'start_date': '2024-01-01',
        'is_active': true,
        'created_at': '2024-01-01T00:00:00.000Z',
        'updated_at': '2024-01-01T00:00:00.000Z',
      };
      
      final subscription = Subscription.fromJson(json);
      
      expect(subscription.id, 'uuid');
      expect(subscription.quantityPerDay, 2);
      expect(subscription.isActive, true);
    });
  });
}
```

Run tests:
```bash
flutter test
```

### Integration Testing

Test API endpoints:
```javascript
import request from 'supertest';
import app from '../server.js';

describe('Auth API', () => {
  it('POST /auth/signup should create new user', async () => {
    const response = await request(app)
      .post('/auth/signup')
      .send({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        phone: '1234567890',
        location: 'Test Location'
      });
      
    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveProperty('accessToken');
  });
});
```

## Feature Requests

### Proposing New Features

1. Check existing issues for duplicates
2. Create new issue with "Feature Request" label
3. Describe:
   - Problem you're solving
   - Proposed solution
   - Alternative solutions considered
   - Additional context

### Template
```markdown
## Feature Description
Clear description of the feature

## Problem it Solves
What problem does this solve?

## Proposed Solution
How should it work?

## Alternatives
Other solutions considered

## Additional Context
Screenshots, mockups, examples
```

## Bug Reports

### Reporting Bugs

1. Check existing issues for duplicates
2. Create new issue with "Bug" label
3. Include:
   - Clear title
   - Steps to reproduce
   - Expected behavior
   - Actual behavior
   - Environment details
   - Screenshots if applicable

### Template
```markdown
## Bug Description
Clear description of the bug

## Steps to Reproduce
1. Step one
2. Step two
3. ...

## Expected Behavior
What should happen

## Actual Behavior
What actually happens

## Environment
- OS: [e.g., Ubuntu 22.04]
- Node Version: [e.g., 18.0.0]
- Flutter Version: [e.g., 3.10.0]
- Browser: [if applicable]

## Screenshots
Add screenshots if helpful
```

## Documentation

### Updating Documentation

Documentation is as important as code:

- Update README.md for user-facing changes
- Update API_DOCUMENTATION.md for API changes
- Add inline comments for complex logic
- Update deployment docs for infrastructure changes

### Documentation Standards

- Use clear, simple language
- Include code examples
- Keep up to date with code changes
- Add diagrams when helpful

## Questions?

- Create an issue with "Question" label
- Join our community chat (if available)
- Email: contribute@ksheermitra.com

## Recognition

Contributors will be:
- Listed in CONTRIBUTORS.md
- Credited in release notes
- Acknowledged in documentation

Thank you for contributing to KsheerMitra! 🥛
