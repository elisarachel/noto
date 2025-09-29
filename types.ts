export type Profile = {
	id: string;
	name: string;
	course: string;
	institution: string;
	semester: string;
	createdAt: number;
};

export type Discipline = {
	id: string;
	name: string;
	professor?: string;
	code?: string;
	createdAt: number;
};

export type NoteAttachment = {
	uri: string;
	name?: string;
	mimeType?: string;
};

export type Note = {
	id: string;
	disciplineId: string;
	title: string;
	content?: string;
	attachments?: NoteAttachment[];
	createdAt: number;
	updatedAt?: number;
};

export type ClassSchedule = {
	id: string;
	disciplineId: string;
	weekday: number; // 0=Dom, 1=Seg, ... 6=Sab
	start: string;   // "08:00"
	end: string;     // "09:40"
	location?: string;
};

export type TaskType = 'prova' | 'trabalho' | 'projeto';

export type Task = {
	id: string;
	disciplineId: string;
	type: TaskType;
	title: string;       // Ex: "Prova 1", "Projeto final"
	dueDate: string;     // formato "2025-10-10T09:00"
	notes?: string;      // observações extras
	createdAt: number;
};