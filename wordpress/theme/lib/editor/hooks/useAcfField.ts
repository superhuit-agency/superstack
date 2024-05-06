import { useEffect, useState } from '@wordpress/element';

declare global {
	interface Window {
		acf: any;
		jQuery: any;
	}
}

function getRepeaterValues(repeater: any) {
	let values: any[] = [];
	repeater.$el.find('.acf-row:not(.acf-clone)').each((i: number, row: any) =>
		values.push(
			window.acf
				.getFields({
					parent: window.jQuery(row),
				})
				.reduce(
					(
						acc: any,
						field: {
							data: { name: any };
							type: string;
							val: () => any;
						}
					) => ({
						...acc,
						[field.data.name]:
							field.type === 'repeater'
								? getRepeaterValues(field)
								: field.val(),
					}),
					{}
				)
		)
	);

	return values;
}

export function useAcfField(
	fieldId: any,
	callback: Function | null = null,
	dflt = null
) {
	const [fieldValue, setFieldValue] = useState(dflt);

	useEffect(() => {
		if (!window.acf) return;

		const field = window.acf.getField(fieldId);
		const isRepeater = field.type === 'repeater';

		const onChangeHandler = () => {
			let newValue;

			if (typeof callback === 'function') newValue = callback(field);
			else if (isRepeater) newValue = getRepeaterValues(field);
			else newValue = field.val();

			setFieldValue(newValue);
		};
		field.on('change', onChangeHandler);

		onChangeHandler();

		return () => field.off('change', onChangeHandler);
	}, [callback, fieldId]);

	return fieldValue;
}
