/* On github CI, the import fails but it's not a problem */
/* eslint-disable storybook/use-storybook-testing-library */
import { render } from '@testing-library/react';
import { Stories as AllTestableComponents } from '@/components/stories';

for (const componentMeta of AllTestableComponents) {
	describe(
		'Unit Tests: Run all the unit tests for ' + componentMeta.title,
		() => {
			componentMeta.getUnitTests().forEach((story) => {
				it('Story: ' + story.name, () => {
					const id =
						'test-' + Math.random().toString(36).substring(2, 10);
					if (!componentMeta.component) {
						story.unitTest(null, null, story.args);
						return;
					}
					/**
					 * Render the React Node rendered from Component's index.tsx
					 */
					const { container } = render(
						// @ts-ignore - Of course this is a mess to make compile, so we ignore the type error
						<componentMeta.component {...story.args} id={id} />
					);
					// Sometimes the component is not rendered but it could be expected,
					// so use null in that case
					if (
						!container ||
						container.children.length === 0 ||
						container.children[0] === undefined
					) {
						story.unitTest(null, container, story.args);
						return;
					}
					const component = container.children[0];
					story.unitTest(component, container, story.args);
				});
			});
		}
	);
}
