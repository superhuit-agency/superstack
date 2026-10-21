'use client';

import { FC } from 'react';

import Button from '@/components/core/Button';
import { useLocale } from '@/contexts/locale-context';
import addLangPrefix from '@/lib/add-lang-prefix';

import './styles.css';

interface ErrorPageProps {
	error: Error & { digest?: string };
	retry: () => void;
}

/**
 * The page shown when a route fails to render. It stands alone, without the
 * header and footer template blocks, since they may be what failed.
 */
export const ErrorPage: FC<ErrorPageProps> = ({ error, retry }) => {
	const { locale, dictionary } = useLocale();

	return (
		<main className="supt-error-page">
			<title>{dictionary.error.title}</title>

			<div className="supt-error-page__inner">
				<h1 className="supt-error-page__title">
					{dictionary.error.title}
				</h1>
				<p className="supt-error-page__message">
					{dictionary.error.message}
				</p>

				<div className="supt-error-page__buttons">
					<Button text={dictionary.error.retry} onClick={retry} />
					<Button
						text={dictionary.error.home}
						url={addLangPrefix('/', locale)}
						variant="outline"
					/>
				</div>

				{error.digest ? (
					<p className="supt-error-page__reference">
						{`${dictionary.error.reference} ${error.digest}`}
					</p>
				) : null}
			</div>
		</main>
	);
};
