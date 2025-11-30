import { useApp } from '@/context/AppContext';
import { palettes } from '@/theme';

export function useAppTheme() {
	const { effectiveTheme } = useApp();
	const palette = palettes[effectiveTheme];
	return { mode: effectiveTheme, colors: palette };
}
