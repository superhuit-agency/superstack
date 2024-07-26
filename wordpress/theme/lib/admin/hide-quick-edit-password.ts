export default function hideQuickEditPasswordProtected() {
	const input = document.querySelector('.inline-edit-password-input');
	if (!input) return;

	const group = input.closest('.inline-edit-group');
	if (!group || !group.firstElementChild) return;
	(group.firstElementChild as HTMLElement).style.display = 'none';
	(group.firstElementChild.nextElementSibling as HTMLElement).style.display =
		'none';
}
