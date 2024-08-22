import '@testing-library/jest-dom';
import { render } from '@testing-library/react';
import { Primary, Secondary } from './Button.stories';
import { Button } from './index';


/**
 * Button Unit tests.
 * Read more at https://testing-library.com/docs/ and /node_modules/@testing-library/jest-dom/readme.md
 */
describe('DOM Tests', () => {
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

	it('Secondary button', () => {
		const id = 'button_secondary';
		const { container } = render(<Button {...Secondary.args} id={id} />);
		const component = container.querySelector(`#${id}`);

		expect(component).toBeInTheDocument();
		expect(component).toHaveClass(['supt-button', '-secondary'], {exact: true});
		expect(component).toHaveTextContent('Button Secondary');
		expect(component).toHaveRole('link');
		expect(component).toBeEnabled();
		expect(component).toBeVisible();
	});

	it('Submit button', () => {
		const id = 'button_submit';
		const { container } = render(<Button type='submit' title='Submit Form' id={id} />);
		const component = container.querySelector(`#${id}`);

		expect(component).toBeInTheDocument();
		expect(component).toHaveClass(['supt-button', '-primary'], {exact: true});
		expect(component).toHaveTextContent('Submit Form');
		expect(component).toHaveRole('button');
		expect(component).toBeEnabled();
		expect(component).toBeVisible();
	});

	it('Download button', () => {
		const id = 'button_download';
		const { container } = render(<Button download={true} title='Download file' href="/file.pdf" id={id} />);
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
		const { container } = render(<Button title='Made by Superhuit' href="https://superhuit.ch" target='_blank' id={id} />);
		const component = container.querySelector(`#${id}`);

		expect(component).toBeInTheDocument();
		expect(component).toHaveClass(['supt-button', '-primary'], {exact: true});
		expect(component).toHaveTextContent('Made by Superhuit');
		expect(component).toHaveRole('link');
		expect(component).toHaveAttribute('target', '_blank');
		expect(component).toBeEnabled();
		expect(component).toBeVisible();
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
