import { FC } from 'react';
import { _x } from '@wordpress/i18n';
import { useState } from '@wordpress/element';
import { PanelBody, ToggleControl } from '@wordpress/components';

import { PostsSelectControl, TermsSelectControl } from '#/components';
import { CATEGORY_TAX_NAME, POST_PT_NAME, TAG_TAX_NAME } from '#/constants';

type QueryVarsType = {
	postIn?: number[];
	tagIn?: number[];
	categoryIn?: number[];
};
interface EditNewsControls {
	vars: QueryVarsType;
	onChange: (vars: QueryVarsType) => void;
	children?: React.ReactNode;
}

const EditNewsControls: FC<EditNewsControls> = ({
	vars,
	onChange,
	children,
}) => {
	const [manual, setManual] = useState(
		!!(vars?.postIn && vars.postIn.length)
	);

	return (
		<PanelBody
			initialOpen={true}
			title={_x('Section settings', 'Section news settings', 'supt')}
		>
			{children}

			<ToggleControl
				label={_x('Manual selection?', 'Section news settings', 'supt')}
				help={
					manual
						? _x(
								'Manual (selected news)',
								'Section news settings',
								'supt'
							)
						: _x(
								'Automatic (latest news)',
								'Section news settings',
								'supt'
							)
				}
				checked={manual}
				onChange={(checked: boolean) => {
					const newVars: QueryVarsType = {};
					if (checked) newVars.postIn = [];
					onChange(newVars);
					setManual(checked);
				}}
			/>
			{manual ? (
				<PostsSelectControl
					postType={POST_PT_NAME}
					values={vars?.postIn}
					label={_x(
						'Selected post(s)',
						'Section news settings',
						'supt'
					)}
					onChange={(postIn: number[]) =>
						onChange({ ...vars, postIn })
					}
				/>
			) : (
				<div>
					<h3>
						{_x('Filter news', 'Section news settings', 'supt')}
					</h3>
					<TermsSelectControl
						taxonomy={TAG_TAX_NAME}
						values={vars?.tagIn}
						label={_x('Tags', 'Section news settings', 'supt')}
						onChange={(tagIn: number[]) =>
							onChange({ ...vars, tagIn })
						}
					/>
					<TermsSelectControl
						taxonomy={CATEGORY_TAX_NAME}
						values={vars?.categoryIn}
						label={_x(
							'Categories',
							'Section news settings',
							'supt'
						)}
						onChange={(categoryIn: number[]) =>
							onChange({ ...vars, categoryIn })
						}
					/>
				</div>
			)}
		</PanelBody>
	);
};
export default EditNewsControls;
