type MediaUploadType = any; // TODO: type this

interface MediaAttributes extends BlockAttributes {
	image?: ImageAttributes;
	// isSticky?: boolean;
	mediaType?: 'image' | 'video';
	video?: VideoAttributes;
}

type MediaProps = MediaAttributes &
	BlockProps &
	(
		| { mediaType: 'image'; image: ImageProps }
		| { mediaType: 'video'; video: VideoProps }
	);
