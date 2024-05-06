import { sprintf } from 'sprintf-js';
import mime from 'mime';

export const ONE_MEGA_BYTE = 1000 * 1024;

export function uploadFile(file: File, key: string, uniqId: string): Promise<any> {
	const sliceSize = ONE_MEGA_BYTE;
	return new Promise((resolve, reject) => {
		const reader = new FileReader();

		const uploadSlice = (sliceStart = 0) => {
			const nextSlice = sliceStart + sliceSize + 1;
			const blob = file.slice(sliceStart, nextSlice);

			reader.onloadend = (endEvent: ProgressEvent<FileReader>) => {
				// Bail early if not yet done
				if (endEvent.target?.readyState !== FileReader.DONE) return;

				const body = new FormData();
				body.append('id', uniqId);
				body.append('name', file.name);
				body.append('type', file.type);
				body.append('key', key);
				body.append('data', endEvent.target.result as string);

				fetch('/api/submit-form/upload/', {
					method: 'POST',
					body,
				})
					.then((res) => res.json())
					.then(() => {
						// TODO: have a progression on each file input ??
						// const sizeDone = sliceStart + sliceSize;
						// const percentDone = Math.floor( ( sizeDone / file.size ) * 100 );

						if (nextSlice < file.size) uploadSlice(nextSlice);
						else resolve({ name: file.name, key });
					})
					.catch((e) => reject({ name: file.name, key }));
			};

			reader.readAsDataURL(blob);
		};

		// Start the upload process
		uploadSlice();
	});
}

export function getMaxFilesizeValidator(
	maxFilesize: number,
	errorMessage: string
) {
	return (files: File[]) =>
		[...files].every((file) => file.size < maxFilesize * ONE_MEGA_BYTE) ||
		sprintf(errorMessage, maxFilesize, maxFilesize);
}

export function getAcceptValidator(accept: string, errorMessage: string) {
	const allowedMimeTypes = accept
		.split(',')
		.map((ext) =>
			ext.includes('/')
				? ext.trim()
				: mime.getType(ext.replace(/^[\s\.]*|[\s\.]*$/, ''))
		);
	return (files: File[]) =>
		[...files].every((file) => allowedMimeTypes.includes(file.type)) ||
		sprintf(errorMessage, accept);
}
