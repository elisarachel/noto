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
	grading?: GradingScheme;

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
    type: 'prova' | 'trabalho' | 'projeto';
    title: string;
    dueDate: string; // ISO
    notes?: string;
    createdAt: number;

    grade?: number;
    gradeMax?: number;

    componentId?: string;
};

export type AssessmentComponent = {
  id: string;
  label: string;   // Ex.: "Provas", "Trabalhos", "Projeto final"
  weight: number;  // % (0–100)
};

export type GradingScheme = {
  components: AssessmentComponent[];
  approvalThreshold?: number; // Ex.: 6.0 (média para aprovação)
  scaleMax?: number;          // Ex.: 10 (nota máxima)
};

export type Grade = {
  id: string;
  disciplineId: string;
  componentId: string; // aponta p/ AssessmentComponent.id
  value: number;       // 0..scaleMax
};