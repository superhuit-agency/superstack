import block from "./block.json";

import "./styles.css";

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
    <div className="supt-file">
      {displayPreview && (
        <object
          className="supt-file__embed"
          data={href}
          type="application/pdf"
          aria-label={`Embed of ${fileName}.`}
          style={{ width: '100%', height: previewHeight }}
        />
      )}
      <a href={textLinkHref} target={textLinkTarget ? textLinkTarget : undefined} className="supt-file__text-link">{fileName}</a>
      {/* TODO :: CHANGE TO BUTTON WHEN AVAILABLE! */}
      {showDownloadButton && (
        <a href={textLinkHref} className="supt-file__download-button" download>
          {downloadButtonText}
        </a>
      )}
    </div>
  );
}

File.slug = block.slug;
File.title = block.title;
