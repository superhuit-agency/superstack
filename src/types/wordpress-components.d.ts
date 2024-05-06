declare module '@wordpress/components' {
	export interface ToolbarDropdownMenuProps {
		className?: string;
		icon: string | FC<{}> | null;
		label: string;
		controls: DropdownOption[] | DropdownOption[][];
		children?: (callback: DropdownCallbackProps) => React.ReactNode;
		popoverProps?: DropdownProps['popoverProps'];
		toggleProps?: ToggleProps;
		menuProps?: NavigableContainerProps;
		disableOpenOnArrowDown?: boolean;
		defaultOpen?: boolean;
		open?: boolean;
		onToggle?: (willOpen: boolean) => void;
	}

	export interface CustomSelectControlProps {
		__nextUnconstrainedWidth?: boolean;
	}

	export interface BaseControlProps {
		children: React.ReactNode;
		className?: string;
		id?: string;
	}

	export interface FormTokenProps extends FormTokenFieldProps {
		suggestions: Array<any>;
		onInputChange: (value: string) => void;
		displayTransform?: (value: string) => string;
		onChange: (tokens: Array<any>) => void;
		value: Array<any>;
		__experimentalExpandOnFocus: boolean;
	}

	export const ToolbarDropdownMenu: React.ComponentType<ToolbarDropdownMenuProps>;
	export const CustomSelectControl: React.ComponentType<CustomSelectControlProps>;
	export const TextControl: React.ComponentType<TextControlProps>;
	export const PanelBody: React.ComponentType<PanelBodyProps>;
	export const PanelRow: React.ComponentType<PanelRowProps>;
	export const ToggleControl: React.ComponentType<ToggleControlProps>;
	export const TextareaControl: React.ComponentType<TextareaControlProps>;
	export const SelectControl: React.ComponentType<SelectControlProps>;
	export const RadioControl: React.ComponentType<RadioControlProps>;
	export const Spinner: React.ComponentType<SpinnerProps>;
	export const Icon: React.ComponentType<IconProps>;
	export const Button: React.ComponentType<ButtonProps>;
	export const DropZone: React.ComponentType<DropzoneProps>;
	export const BaseControl: React.ComponentType<BaseControlProps> & {
		VisualLabel: React.ComponentType<{ children: React.ReactNode }>;
	};
	export const FormTokenField: React.ComponentType<FormTokenProps>;
	export const KeyboardShortcuts: React.ComponentType<KeyboardShortcutsProps>;
	export const ToolbarButton: React.ComponentType<ToolbarButtonProps>;
	export const Popover: React.ComponentType<PopoverProps>;
}
