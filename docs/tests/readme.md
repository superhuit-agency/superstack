# How to run tests

This project contains _unit tests_ and _end-to-end tests_. The Jest engine is used to execute the tests and follow code coverage.

## Unit tests

They use the react engine and can be run anytime using the following command:

```
npm run test:unit
```

This will execute all the tests located in the `src/__tests__/unit` folder. So far one test is available but covers all the components this boilerplate has to offer.

Each component that should be tested should have a `test.tsx` file within its component folder, and that file should be referenced and exported by the `test.ts` files in the parent directories.

### Component Test Implementation

Unit tests in this project are tightly integrated with Storybook stories so each story automatically becomes a unit test and ensures consistency between visual testing, and unit testing.

#### Test Structure

Each component that needs testing follows this structure:

```typescript
// Example: src/components/atoms/Button/test.tsx
import { expect } from '@storybook/test';
import block from './block.json';
import { Button } from './index';
import * as stories from './Button.stories';

export const ButtonTests: ComponentTests = {
	block: block,
	component: Button,
	tests: {
		Primary: {
			args: stories.Primary.args,
			unitTest: async (component, container) => {
				// Test implementation
				expect(component).toBeInTheDocument();
				expect(component).toHaveTextContent('Button Primary');
				expect(component).toHaveClass('supt-button -primary');
			},
		},
		// ... more test cases
	},
};
```

#### Storybook Integration

The key innovation of this testing approach is the direct reuse of Storybook story arguments:

1. **Shared Arguments**: Each test case uses `stories.StoryName.args` to ensure the same props are used in both Storybook and unit tests

2. **Visual-Test Consistency**: What you see in Storybook is exactly what gets tested

3. **Single Source of Truth**: Story arguments serve as the component's test data, but _when needed_ it is possible to make specific arguments in a unit tests without having a matching example in storybook.

#### Test Execution Flow

The test runner in `src/__tests__/unit/all-components.tsx` automatically:

1. Imports all component tests via `@/components/test`
2. Iterates through each component's test cases
3. Renders each component with the corresponding story arguments
4. Executes the unit test function with the rendered component
5. Provides both the component DOM element and container for assertions

## End-to-End Tests

End-to-end tests verify the complete workflow from WordPress admin to frontend rendering. They can be run using:

```
npm run test:endtoend
```

These tests use Puppeteer to control a headless browser and perform integration testing across the entire application stack.

### Test Architecture

End-to-end tests reuse the same component test structure as unit tests, ensuring consistency across testing layers:

1. **Component Reuse**: Tests import `* as AllComponentsTests from '@/components/test'` to access the same test cases
2. **Story Integration**: Uses `Stories as AllTestableComponents from '@/components/stories'` for Storybook integration
3. **WordPress Integration**: Creates actual WordPress posts/pages with component blocks
4. **Frontend Verification**: Navigates to the frontend to verify proper rendering

### Test Flow

The end-to-end testing process follows this workflow:

1. **WordPress Admin Login**: Authenticates with WordPress admin panel
2. **Content Creation**: Creates a new post/page with all component blocks
3. **Block HTML Generation**: Converts component test arguments into WordPress block HTML
4. **Content Publishing**: Saves and publishes the content
5. **Frontend Navigation**: Visits the published page to verify rendering
6. **DOM Inspection**: Validates that components render correctly on the frontend

```typescript
// Example: Block HTML generation from test arguments
for (const componentTests of Object.values(AllComponentsTests)) {
	Object.values(componentTests.tests).forEach((testableStory) => {
		allComponentsHTML += writeBlockHTML(blockClassName, testableStory.args);
	});
}
```

### Video Recording

End-to-end tests support video recording for debugging and documentation purposes:

-   **Automatic Recording**: Each test suite records a video of the browser session
-   **Debug Mode**: Use `VIDEO_RECORD=true npm run test:endtoend` to enable recording
-   **Storage Location**: Videos are saved in `src/__tests__/video-logs/`

In production, you can set this environment variable to true as well to enable the video capture. Refer to the github workflow located at `.github/workflows/run-tests-development.yml` to see more.

## Coverage Guidelines

Code coverage is automatically collected during unit test execution with the following configuration:

### Coverage Settings

-   **Collection**: Enabled by default (`collectCoverage: true`)
-   **Output Directory**: `src/__tests__/coverage/`
-   **Reporters**: HTML, JSON, and text reports are generated
-   **Threshold**: Currently no minimum threshold enforced

### Coverage Best Practices

1. **Component Coverage**: Aim for >80% coverage on component logic
2. **Critical Paths**: Ensure 100% coverage on form validation, data processing, and error handling
3. **Integration Points**: Focus on testing component interfaces and prop handling
4. **Accessibility**: Include coverage for ARIA attributes and keyboard navigation

### Excluded Files

The following are typically excluded from coverage:

-   Storybook configuration files
-   Test utilities and mocks
-   Build configuration files
-   WordPress PHP files

## Best Practices

### Unit Testing

1. **Story-Driven Testing**: Always create corresponding Storybook stories before writing tests
2. **Comprehensive Assertions**: Test multiple aspects of each component:

    - **General**: Presence in document (`toBeInTheDocument`)
    - **Content**: Text content and structure
    - **Display**: CSS classes and visibility
    - **Accessibility**: ARIA roles, labels, and keyboard support
    - **Behaviour**: If interactive, user events should be fired to the component to check their reaction.

3. **Test Organization**: Follow the established pattern:

    ```typescript
    unitTest: async (component, container) => {
    	// General tests
    	expect(component).toBeInTheDocument();

    	// Content tests
    	expect(component).toHaveTextContent('Expected Text');

    	// Display tests
    	expect(component).toBeVisible();
    	expect(component).toHaveClass('expected-class');

    	// Accessibility tests
    	expect(component).toBeEnabled();
    	expect(component).toHaveRole('button');

    	// Behaviour tests
    	act(() => {
    		fireEvent.click(component);
    		expect(component).toBeEnabled();
    	});
    };
    ```

4. **Error Scenarios**: Include test cases for edge cases and error states
5. **Mock External Dependencies**: Use Jest mocks for external services and APIs

### End-to-End Testing

1. **Environment Setup**: Ensure WordPress and Next.js development servers are running
2. **Test Isolation**: Each test should be independent and not rely on previous test state
3. **Timeouts**: Use appropriate timeouts for WordPress admin operations (default: 120 seconds)
4. **Error Handling**: Include proper error handling and cleanup in test teardown
5. **Video Documentation**: Use video recording for complex user flows and debugging

### General Guidelines

1. **Test Naming**: Use descriptive test names that explain the expected behavior
2. **Documentation**: Keep test documentation up-to-date with code changes
3. **Performance**: Run tests with `--maxWorkers=1` for unit tests to avoid resource conflicts
4. **Continuous Integration**: End-to-end tests use `bail: 1` to fail fast in CI environments
5. **Debugging**: Use `node --inspect-brk` for debugging complex test scenarios

### File Organization

```
src/__tests__/
├── unit/                    # Unit test execution
│   └── all-components.tsx   # Test runner
├── endtoend/               # End-to-end tests
│   ├── admin_*.ts          # WordPress admin tests
│   └── frontend_*.js       # Frontend verification tests
├── utils/                  # Test utilities
│   ├── admin-manipulation.ts
│   └── video-recorder.ts
└── coverage/              # Coverage reports (generated)
```
