import Button from '../Button';
import block from './block.json';

import './styles.css';

export default function File({
	href,
	fileName,
	downloadButtonText,
	previewHeight,
	textLinkHref,
	textLinkTarget,
	showDownloadButton,
	displayPreview,
}: FileProps) {
	return (
		<div className="wp-block-file">
			<div className="wp-block-file__content-wrapper">
				{displayPreview && (
					<object
						className="wp-block-file__embed"
						data={href}
						type="application/pdf"
						aria-label={`Embed of ${fileName}.`}
						style={{ width: '100%', height: previewHeight }}
					/>
				)}
				<a
					href={textLinkHref}
					target={textLinkTarget ? textLinkTarget : undefined}
					className="wp-block-file__text-link"
				>
					{fileName}
				</a>
				{showDownloadButton && (
					<Button
						text={downloadButtonText}
						url={textLinkHref}
						className="wp-block-file__button"
						download
					/>
				)}
			</div>
		</div>
	);
}

File.slug = block.slug;
File.title = block.title;
