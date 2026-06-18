type NextImageProps = import('next/image').ImageProps;
interface CardPostProps {
	featuredimage: NextImageProps | null;
	title: string;
	excerpt: string | null;
	link: string;
	date: string | null;
	author: {
		name: string;
	} | null;
}
