import { Container } from '@/components/global/Container';
import { Section404 } from '@/components/organisms';

async function NotFoundPage() {
	return (
		<Container className="supt-single-page">
			<Section404 />
		</Container>
	);
}

export default NotFoundPage;
