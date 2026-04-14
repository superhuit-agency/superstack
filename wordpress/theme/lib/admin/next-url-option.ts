export default function nextURLOption() {
	const input = document.querySelector('#next_url');
	if ( !input ) return;

	const row = input.closest('tr');
	if ( !row ) return;

	const homeRow = document.querySelector('#home')?.closest('tr');
	if ( !homeRow ) return;

	homeRow.insertAdjacentElement('afterend', row);
}
