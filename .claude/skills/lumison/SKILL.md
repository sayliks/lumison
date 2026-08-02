```markdown
# lumison Development Patterns

> Auto-generated skill from repository analysis

## Overview
This skill teaches the core development conventions and workflows used in the `lumison` TypeScript codebase. It covers file naming, import/export styles, commit message patterns, documentation update workflows, and testing practices. By following these patterns, contributors can maintain consistency and clarity throughout the project.

## Coding Conventions

### File Naming
- **Style:** PascalCase  
  *Example:*  
  ```plaintext
  MyComponent.ts
  UserService.ts
  ```

### Imports
- **Style:** Relative imports  
  *Example:*  
  ```typescript
  import MyComponent from './MyComponent';
  import { helperFunction } from '../utils/Helper';
  ```

### Exports
- **Style:** Default exports  
  *Example:*  
  ```typescript
  const MyComponent = () => { /* ... */ };
  export default MyComponent;
  ```

### Commit Messages
- **Type:** Conventional commits  
- **Prefixes:** `refactor`, `fix`, `feat`  
  *Example:*  
  ```
  feat: add user authentication flow
  fix: correct typo in UserService
  refactor: simplify data fetching logic
  ```

## Workflows

### Update Project Documentation
**Trigger:** When someone wants to update or clarify project documentation for contributors or users.  
**Command:** `/update-docs`

1. Edit one or more markdown documentation files (e.g., `CLAUDE.md`, `AGENTS.md`).
2. Commit changes with a message indicating documentation update, such as:
   ```
   docs: update CLAUDE.md with new architecture section
   ```
3. Push your changes and open a pull request if required.

## Testing Patterns

- **Framework:** Unknown (not detected)
- **File Pattern:** `*.test.*`
  *Example:*  
  ```
  UserService.test.ts
  AuthFlow.test.ts
  ```
- **Notes:** Place test files alongside the modules they test, following the naming pattern above.

## Commands

| Command      | Purpose                                            |
|--------------|----------------------------------------------------|
| /update-docs | Update or clarify project documentation            |
```
