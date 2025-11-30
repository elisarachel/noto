export type AppThemeMode = 'light' | 'dark';

export const palettes = {
	light: {
		background: '#f3f4f6',
		surface: '#ffffff',
		text: '#111827',
		textMuted: '#6b7280',
		primary: '#1e40af',
		border: '#e5e7eb',
		cardBg: '#f9fafb',
		accent: '#d97706',
		mutedBg: '#eef2ff',
		onPrimary: '#ffffff'
	},
	dark: {
		background: '#020617',
		surface: '#0f172a',
		text: '#e5e7eb',
		textMuted: '#9ca3af',
		primary: '#4f46e5',
		border: '#1f2937',
		cardBg: '#020617',
		accent: '#f59e0b',
		mutedBg: '#0b1220',
		onPrimary: '#ffffff'
	}
} as const;
