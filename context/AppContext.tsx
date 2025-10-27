import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { load, save } from '@/lib/storage';
import { Profile, Discipline, Note, ClassSchedule, Task } from '@/types';
import uuid from 'react-native-uuid';

	type AppState = {
		profile?: Profile | null;
		disciplines: Discipline[];
		notes: Note[];
		schedule: ClassSchedule[];
		tasks: Task[];
		setProfile: (p: Profile | null) => Promise<void>;
		addDiscipline: (d: Omit<Discipline, 'id' | 'createdAt'>) => Promise<void>;
		updateDiscipline: (id: string, patch: Partial<Discipline>) => Promise<void>;
		removeDiscipline: (id: string) => Promise<void>;
		addNote: (n: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
		updateNote: (id: string, patch: Partial<Note>) => Promise<void>;
		removeNote: (id: string) => Promise<void>;
		refresh: () => Promise<void>;
		addSchedule: (n: Omit<ClassSchedule, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
		removeSchedule: (id: string) => Promise<void>;
		updateSchedule: (id: string, patch: Partial<ClassSchedule>) => Promise<void>;
		addTask: (t: Omit<Task, 'id' | 'createdAt'>) => Promise<void>;
		updateTask: (id: string, patch: Partial<Task>) => Promise<void>;
		removeTask: (id: string) => Promise<void>;
	};

const AppContext = createContext<AppState | null>(null);

const PROFILE_KEY = 'app.profile';
const DISC_KEY = 'app.disciplines';
const NOTES_KEY = 'app.notes';
const SCHEDULE_KEY = 'app.schedule';
const TASKS_KEY = 'app.tasks';

export function AppProvider({ children }: { children: React.ReactNode }) {
	const [profile, setProfileState] = useState<Profile | null>(null);
	const [disciplines, setDisciplines] = useState<Discipline[]>([]);
	const [notes, setNotes] = useState<Note[]>([]);
	const [schedule, setSchedule] = useState<ClassSchedule[]>([]);
	const [tasks, setTasks] = useState<Task[]>([]);

	const refresh = React.useCallback(async () => {
		const p = await load<Profile | null>(PROFILE_KEY, null);
		const d = await load<Discipline[]>(DISC_KEY, []);
		const n = await load<Note[]>(NOTES_KEY, []);
		const tk = await load<Task[]>(TASKS_KEY, []);
		const sch = await load<ClassSchedule[]>(SCHEDULE_KEY, []);
		setProfileState(p);
		setDisciplines(d);
		setNotes(n);
		setTasks(tk);
		setSchedule(sch);
	}, []);
	const addTask = React.useCallback(async (t: Omit<Task, 'id' | 'createdAt'>) => {
		const item: Task = { ...t, id: uuid.v4() as string, createdAt: Date.now() };
		const next = [...tasks, item];
		await save(TASKS_KEY, next);
		setTasks(next);
	}, [tasks]);

	const updateTask = React.useCallback(async (id: string, patch: Partial<Task>) => {
		const next = tasks.map(x => x.id === id ? { ...x, ...patch } : x);
		await save(TASKS_KEY, next);
		setTasks(next);
	}, [tasks]);

	const removeTask = React.useCallback(async (id: string) => {
		const next = tasks.filter(x => x.id !== id);
		await save(TASKS_KEY, next);
		setTasks(next);
	}, [tasks]);

	useEffect(() => {
		refresh();
	}, [refresh]);

	const setProfile = React.useCallback(async (p: Profile | null) => {
		await save(PROFILE_KEY, p);
		setProfileState(p);
	}, []);

	const addDiscipline = React.useCallback(async (d: Omit<Discipline, 'id' | 'createdAt'>) => {
		const newItem: Discipline = { ...d, id: uuid.v4() as string, createdAt: Date.now() };
		const next = [newItem, ...disciplines];
		await save(DISC_KEY, next);
		setDisciplines(next);
	}, [disciplines]);

	const updateDiscipline = React.useCallback(async (id: string, patch: Partial<Discipline>) => {
		const next = disciplines.map(x => x.id === id ? { ...x, ...patch } : x);
		await save(DISC_KEY, next);
		setDisciplines(next);
	}, [disciplines]);

	const removeDiscipline = React.useCallback(async (id: string) => {
		const next = disciplines.filter(x => x.id !== id);
		await save(DISC_KEY, next);
		setDisciplines(next);
		// também removemos notas da disciplina excluída
		const nextNotes = notes.filter(n => n.disciplineId !== id);
		await save(NOTES_KEY, nextNotes);
		setNotes(nextNotes);
	}, [disciplines, notes]);

	const addNote = React.useCallback(async (n: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => {
		const item: Note = { ...n, id: uuid.v4() as string, createdAt: Date.now() };
		const next = [item, ...notes];
		await save(NOTES_KEY, next);
		setNotes(next);
	}, [notes]);

	const updateNote = React.useCallback(async (id: string, patch: Partial<Note>) => {
		const next = notes.map(x => x.id === id ? { ...x, ...patch, updatedAt: Date.now() } : x);
		await save(NOTES_KEY, next);
		setNotes(next);
	}, [notes]);

	const removeNote = React.useCallback(async (id: string) => {
		const next = notes.filter(x => x.id !== id);
		await save(NOTES_KEY, next);
		setNotes(next);
	}, [notes]);

	const addSchedule = React.useCallback(async (s: Omit<ClassSchedule, 'id'>) => {
		const item: ClassSchedule = { ...s, id: uuid.v4() as string };
		const next = [...schedule, item];
		await save(SCHEDULE_KEY, next);
		setSchedule(next);
	}, [schedule]);

	const removeSchedule = React.useCallback(async (id: string) => {
		const next = schedule.filter(x => x.id !== id);
		await save(SCHEDULE_KEY, next);
		setSchedule(next);
	}, [schedule]);

	const updateSchedule = React.useCallback(async (id: string, patch: Partial<ClassSchedule>) => {
		const next = schedule.map(x => x.id === id ? { ...x, ...patch, updatedAt: Date.now() } : x);
		await save(SCHEDULE_KEY, next);
		setSchedule(next);
	}, [schedule]);

	const value = useMemo<AppState>(() => ({
		profile, disciplines, notes, schedule, tasks,
		setProfile, addDiscipline, updateDiscipline, removeDiscipline,
		addNote, updateNote, removeNote, refresh,
		addSchedule, removeSchedule, updateSchedule,
		addTask, updateTask, removeTask
	}), [
		profile,
		disciplines,
		notes,
		schedule,
		tasks,
		setProfile,
		addDiscipline,
		updateDiscipline,
		removeDiscipline,
		addNote,
		updateNote,
		removeNote,
		refresh,
		addSchedule,
		removeSchedule,
		updateSchedule,
		addTask,
		updateTask,
		removeTask
	]);

	return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export const useApp = () => {
	const ctx = useContext(AppContext);
	if (!ctx) throw new Error('useApp must be used within AppProvider');
	return ctx;
};
