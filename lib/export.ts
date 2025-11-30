import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as Print from 'expo-print';

// CSV (Excel lê CSV numa boa)
export async function exportTasksToCSV(tasks: any[], path = 'tarefas.csv') {
	const header = ['Tipo', 'Título', 'Disciplina', 'Data', 'Nota', 'Max'];
	const rows = tasks.map(t => [
		t.type, t.title, t.disciplineName ?? '', new Date(t.dueDate).toISOString(),
		t.grade ?? '', t.gradeMax ?? ''
	]);
	const csv = [header, ...rows].map(r => r.map(f => `"${String(f ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
	const baseDir = (FileSystem as any).documentDirectory ?? '';
	const fullPath = baseDir + path;
	await FileSystem.writeAsStringAsync(fullPath, csv);
	await Sharing.shareAsync(fullPath);
}

// PDF via HTML
export async function exportSummaryPDF(htmlBody: string) {
	const html = `
		<html>
		<head><meta charset="utf-8" /><style>body{font-family:Arial;padding:16px}</style></head>
		<body>${htmlBody}</body>
		</html>`;
	const { uri } = await Print.printToFileAsync({ html });
	await Sharing.shareAsync(uri);
}

// ICS (calendário universal)
function icsEscape(s: string) {
	return String(s ?? '')
		.replace(/\\/g, '\\\\')
		.replace(/\n/g, '\\n')
		.replace(/,/g, '\\,')
		.replace(/;/g, '\\;');
}
export async function exportTasksToICS(tasks: any[], path = 'tarefas.ics') {
	const lines: string[] = [
		'BEGIN:VCALENDAR',
		'VERSION:2.0',
		'PRODID:-//noto//pt-BR'
	];
	for (const t of tasks) {
		const dt = new Date(t.dueDate);
		const stamp = dt.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
		lines.push(
			'BEGIN:VEVENT',
			`UID:${t.id}@noto`,
			`DTSTAMP:${stamp}`,
			`DTSTART:${stamp}`,
			`SUMMARY:${icsEscape(t.title)}`,
			`DESCRIPTION:${icsEscape(t.notes ?? '')}`,
			'END:VEVENT'
		);
	}
	lines.push('END:VCALENDAR');
	const baseDir = (FileSystem as any).documentDirectory ?? '';
	const fullPath = baseDir + path;
	await FileSystem.writeAsStringAsync(fullPath, lines.join('\n'));
	await Sharing.shareAsync(fullPath);
}
