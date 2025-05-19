import '@testing-library/jest-dom';
import { render } from '@testing-library/react';

import { Primary, Secondary, Submit, Download, External, Empty } from './Button.stories';
import { Button } from './index';

/**
 * Button Unit tests.
 * Read more at https://testing-library.com/docs/ and /node_modules/@testing-library/jest-dom/readme.md
 */
describe('React Component Unit Tests: ' + Button.name, () => {
	it('Primary button', () => {
		const id = 'button_primary';
		const { container } = render(<Button {...Primary.args} id={id} />);
		const component = container.querySelector(`#${id}`);

		expect(component).toBeInTheDocument();
		expect(component).toHaveClass(['supt-button', '-primary'], {exact: true});

		expect(component).toHaveTextContent(Primary.args.title);

		expect(component).toHaveRole('link');
		expect(component).toBeEnabled();
		expect(component).toBeVisible();
	});

	it('Secondary button', () => {
		const id = 'button_secondary';
		const { container } = render(<Button {...Secondary.args} id={id} />);
		const component = container.querySelector(`#${id}`);

		expect(component).toBeInTheDocument();
		expect(component).toHaveClass(['supt-button', '-secondary'], {exact: true});

		expect(component).toHaveTextContent(Secondary.args.title);
		expect(component).toHaveRole('link');
		expect(component).toBeEnabled();
		expect(component).toBeVisible();
	});

	it('Submit button', () => {
		const id = 'button_submit';
		const { container } = render(<Button {...Submit.args} id={id} />);
		const component = container.querySelector(`#${id}`);

		expect(component).toBeInTheDocument();
		expect(component).toHaveClass(['supt-button', '-primary'], {exact: true});
		expect(component).toHaveTextContent(Submit.args.title);
		expect(component).toHaveRole('button');
		expect(component).toBeEnabled();
		expect(component).toBeVisible();
	});

	it('Download button', () => {
		const id = 'button_download';
		const { container } = render(<Button {...Download.args} id={id} />);
		const component = container.querySelector(`#${id}`);

		expect(component).toBeInTheDocument();
		expect(component).toHaveClass(['supt-button', '-primary'], {exact: true});
		expect(component).toHaveTextContent('Download file');
		expect(component).toHaveRole('link');
		expect(component).toBeEnabled();
		expect(component).toBeVisible();
	});

	it('External link button', () => {
		const id = 'button_external';
		const { container } = render(<Button {...External.args} id={id} />);
		const component = container.querySelector(`#${id}`);

		expect(component).toBeInTheDocument();
		expect(component).toHaveClass(['supt-button', '-primary'], {exact: true});
		expect(component).toHaveTextContent('Made by Superhuit');
		expect(component).toHaveRole('link');
		expect(component).toHaveAttribute('target', '_blank');
		expect(component).toBeEnabled();
		expect(component).toBeVisible();
	});

	it('Empty button', () => {
		const id = 'button_external';
		const { container } = render(<Button {...Empty.args} id={id} />);
		const component = container.querySelector(`#${id}`);
		expect(component).toBeNull();
	});
});

describe('Accessibility Tests', () => {
	it('Primary button', () => {
		const id = 'button_primary';
		const { container } = render(<Button {...Primary.args} id={id} />);
		const component = container.querySelector(`#${id}`);

		expect(component).toBeInTheDocument();
		expect(component).toHaveClass(['supt-button', '-primary'], {exact: true});
		expect(component).toHaveTextContent('Button Primary');
		expect(component).toHaveRole('link');
		expect(component).toBeEnabled();
		expect(component).toBeVisible();
	});
});
