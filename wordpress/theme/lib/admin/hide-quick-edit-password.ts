
export default function hideQuickEditPasswordProtected() {
	const input = document.querySelector('.inline-edit-password-input');
	if ( !input ) return;

	const group = input.closest('.inline-edit-group');
	if ( !group ) return;
	group.firstElementChild.style.display = 'none';
	group.firstElementChild.nextElementSibling.style.display = 'none';

}
