import { getWpUrl } from "@/utils/node-utils";

export default function getFunkyWpUploadsURI() {
	const uploadsUri = `${getWpUrl()}/wp-content/uploads/`;
	return uploadsUri.replace(/\//g, '\\\\/');
}
