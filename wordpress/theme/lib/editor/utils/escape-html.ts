export const escapeHTML = (html: string) => {
	const d = document.createElement('div');
	d.innerHTML = html;
	return d.textContent ?? '';
};
