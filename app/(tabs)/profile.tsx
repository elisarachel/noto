import React, { useEffect, useState } from 'react';
import {
	View,
	Text,
	TextInput,
	Pressable,
	Alert,
	KeyboardAvoidingView,
	Platform,
	TouchableWithoutFeedback,
	Keyboard,
	ScrollView,
	Switch
} from 'react-native';
import * as Notifications from 'expo-notifications';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { useApp } from '@/context/AppContext';
import { useAppTheme } from '@/hooks/useAppTheme';

type TTheme = 'light' | 'dark' | 'system';
type TLang = 'pt' | 'en';
type TStudy = 'matutino' | 'integral' | 'noturno';

export default function ProfileAndSettingsScreen() {
	const { profile, setProfile, syncNow, exportCalendarToICS } = useApp();
	const { colors } = useAppTheme();

	// Perfil
	const [name, setName] = useState(profile?.name ?? '');
	const [course, setCourse] = useState(profile?.course ?? '');
	const [institution, setInstitution] = useState(profile?.institution ?? '');
	const [semester, setSemester] = useState(profile?.semester ?? '');
	const [studyPeriod, setStudyPeriod] = useState<TStudy>(profile?.studyPeriod ?? 'integral');

	// Config
	const [theme, setTheme] = useState<TTheme>(profile?.theme ?? 'system');
	const [lang, setLang] = useState<TLang>(profile?.lang ?? 'pt');
	const [syncCloud, setSyncCloud] = useState<boolean>(!!profile?.syncCloud);
	const [notificationsOn, setNotificationsOn] = useState<boolean>(!!profile?.notificationsOn);

	// Estados de operação
	const [saving, setSaving] = useState(false);
	const [syncing, setSyncing] = useState(false);
	const [exporting, setExporting] = useState(false);

	useEffect(() => {
		if (notificationsOn) {
			Notifications.requestPermissionsAsync();
		}
	}, [notificationsOn]);

	useEffect(() => {
		if (profile) {
			setName(profile.name ?? '');
			setCourse(profile.course ?? '');
			setInstitution(profile.institution ?? '');
			setSemester(profile.semester ?? '');
			setStudyPeriod((profile.studyPeriod as TStudy) ?? 'integral');

			setTheme((profile.theme as TTheme) ?? 'system');
			setLang((profile.lang as TLang) ?? 'pt');
			setSyncCloud(!!profile.syncCloud);
			setNotificationsOn(!!profile.notificationsOn);
		}
	}, [profile]);

	const generateUUID = () =>
		'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
			const r = (Math.random() * 16) | 0;
			const v = c === 'x' ? r : (r & 0x3) | 0x8;
			return v.toString(16);
		});

	const save = async () => {
		if (!name.trim() || !course.trim() || !institution.trim() || !semester.trim()) {
			Alert.alert('Preencha todos os campos do perfil');
			return;
		}
		if (saving) return;
		setSaving(true);

		try {
			await setProfile({
				id: profile?.id ?? generateUUID(),
				name: name.trim(),
				course: course.trim(),
				institution: institution.trim(),
				semester: semester.trim(),
				studyPeriod,
				theme,
				lang,
				syncCloud,
				notificationsOn,
			});
			Alert.alert('Salvo!', 'Suas preferências foram atualizadas.');
		} catch (err) {
			console.error(err);
			Alert.alert('Erro', 'Não foi possível salvar seu perfil.');
		} finally {
			setSaving(false);
		}
	};

		const handleExportCalendar = async () => {
		if (exporting) return;
		setExporting(true);

		try {
			const ics = exportCalendarToICS();

			// 1) Verifica se consegue usar o share sheet
			const canShare = await Sharing.isAvailableAsync();
			if (!canShare) {
				Alert.alert(
					'Indisponível',
					'Exportar calendário só está disponível em um dispositivo físico com recursos de compartilhamento.'
				);
				return;
			}

			// 2) Usa o diretório de cache (funciona no Expo Go)
			const fileUri = FileSystem.cacheDirectory + 'noto-calendar.ics';

			// 3) Salva o conteúdo (pode omitir encoding, padrão já é UTF-8)
			await FileSystem.writeAsStringAsync(fileUri, ics);

			// 4) Abre o share sheet → no iOS você escolhe onde salvar (Arquivos, Notas, etc.)
			await Sharing.shareAsync(fileUri, {
				mimeType: 'text/calendar',
				dialogTitle: 'Exportar calendário',
				UTI: 'public.icalendar' // ajuda no iOS a reconhecer como .ics
			});
		} catch (err) {
			console.error(err);
			Alert.alert('Erro', 'Não foi possível exportar o calendário.');
		} finally {
			setExporting(false);
		}
	};


	// estilos dependentes do tema
	const containerStyle = { padding: 16, gap: 16, backgroundColor: colors.background } as const;
	const inputStyle = { borderWidth: 1, borderColor: colors.border, padding: 12, borderRadius: 8, backgroundColor: colors.cardBg, color: colors.text } as const;
	const sectionBox = { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 12, gap: 10 } as const;
	const rowBox = { backgroundColor: colors.cardBg, borderWidth: 1, borderColor: colors.border, borderRadius: 10, padding: 8 } as const;
	const saveBtn = { backgroundColor: colors.primary, padding: 14, borderRadius: 10, alignItems: 'center', marginTop: 4 } as const;
	const syncBtn = (enabled: boolean) => ({ backgroundColor: enabled ? colors.primary : colors.textMuted, padding: 12, borderRadius: 10, alignItems: 'center' } as const);
	const exportBtn = { backgroundColor: colors.accent, padding: 12, borderRadius: 10, alignItems: 'center' } as const;

	return (
		<KeyboardAvoidingView
			behavior={Platform.OS === 'ios' ? 'padding' : undefined}
			style={{ flex: 1, backgroundColor: colors.background }}
		>
			<TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
				<ScrollView
					keyboardShouldPersistTaps="handled"
					contentContainerStyle={containerStyle}
				>
					<Text style={{ fontSize: 22, fontWeight: '700', color: colors.text }}>Perfil & Configurações</Text>

					{/* PERFIL */}
					<View style={{ gap: 10 }}>
						<Text style={{ fontSize: 16, fontWeight: '700', color: colors.text }}>Perfil</Text>
						<View style={sectionBox}>
							<Text style={{ color: colors.text }}>Nome</Text>
							<TextInput
								value={name}
								onChangeText={setName}
								placeholder="Ex.: Elisa Beninca"
								style={inputStyle}
								placeholderTextColor={colors.textMuted}
							/>

							<Text style={{ color: colors.text }}>Curso</Text>
							<TextInput
								value={course}
								onChangeText={setCourse}
								placeholder="Ex.: DSM - FATEC"
								style={inputStyle}
								placeholderTextColor={colors.textMuted}
							/>

							<Text style={{ color: colors.text }}>Instituição</Text>
							<TextInput
								value={institution}
								onChangeText={setInstitution}
								placeholder="Ex.: FATEC SJC"
								style={inputStyle}
								placeholderTextColor={colors.textMuted}
							/>

							<Text style={{ color: colors.text }}>Semestre</Text>
							<TextInput
								value={semester}
								onChangeText={setSemester}
								placeholder="Ex.: 5º"
								style={inputStyle}
								placeholderTextColor={colors.textMuted}
							/>

							<Text style={{ fontWeight: '600', marginTop: 8, color: colors.text }}>Período</Text>
							<RowChips>
								<ChipOption
									label="Matutino"
									selected={studyPeriod === 'matutino'}
									onPress={() => setStudyPeriod('matutino')}
								/>
								<ChipOption
									label="Integral"
									selected={studyPeriod === 'integral'}
									onPress={() => setStudyPeriod('integral')}
								/>
								<ChipOption
									label="Noturno"
									selected={studyPeriod === 'noturno'}
									onPress={() => setStudyPeriod('noturno')}
								/>
							</RowChips>
						</View>
					</View>

					{/* CONFIGURAÇÕES */}
					<View style={{ gap: 10 }}>
						<Text style={{ fontSize: 16, fontWeight: '700', color: colors.text }}>Preferências</Text>
						<View style={sectionBox}>
							<LabeledRow label="Tema" rowBox={rowBox}>
								<Segmented<TTheme>
									value={theme}
									options={[
										{ key: 'light', label: 'Claro' },
										{ key: 'dark', label: 'Escuro' },
										{ key: 'system', label: 'Sistema' }
									]}
									onChange={setTheme}
								/>
							</LabeledRow>

							<LabeledRow label="Notificações" rowBox={rowBox}>
								<Switch
									value={notificationsOn}
									onValueChange={setNotificationsOn}
									trackColor={{ true: colors.primary }}
									thumbColor={notificationsOn ? colors.onPrimary : undefined}
								/>
							</LabeledRow>

							<View style={{ gap: 10, marginTop: 4 }}>
								<Pressable onPress={handleExportCalendar} style={exportBtn}>
									<Text style={{ color: colors.onPrimary, fontWeight: '700' }}>
										{exporting ? 'Exportando...' : 'Exportar calendário (.ics)'}
									</Text>
								</Pressable>
							</View>
						</View>
					</View>

					<Pressable onPress={save} style={saveBtn}>
						<Text style={{ color: colors.onPrimary, fontWeight: '700' }}>
							{saving ? 'Salvando...' : 'Salvar tudo'}
						</Text>
					</Pressable>
				</ScrollView>
			</TouchableWithoutFeedback>
		</KeyboardAvoidingView>
	);
}

 /* ——— UI helpers ——— */

function Section({ title, children }: { title: string; children: React.ReactNode }) {
	const { colors } = useAppTheme();
	return (
		<View style={{ gap: 10 }}>
			<Text style={{ fontSize: 16, fontWeight: '700', color: colors.text }}>{title}</Text>
			<View style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 12, gap: 10 }}>
				{children}
			</View>
		</View>
	);
}

function LabeledRow({ label, children, rowBox }: { label: string; children: React.ReactNode; rowBox?: any }) {
	const { colors } = useAppTheme();
	return (
		<View style={{ gap: 6 }}>
			<Text style={{ fontWeight: '600', color: colors.text }}>{label}</Text>
			<View style={rowBox ?? { backgroundColor: colors.cardBg, borderWidth: 1, borderColor: colors.border, borderRadius: 10, padding: 8 }}>
				{children}
			</View>
		</View>
	);
}

function RowChips({ children }: { children: React.ReactNode }) {
	return (
		<View style={{ flexDirection: 'row', gap: 8, marginTop: 6, flexWrap: 'wrap' }}>
			{children}
		</View>
	);
}

function ChipOption({
	label,
	selected,
	onPress
}: {
	label: string;
	selected?: boolean;
	onPress: () => void;
}) {
	const { colors } = useAppTheme();
	return (
		<Pressable
			onPress={onPress}
			style={{
				backgroundColor: selected ? colors.primary : colors.border,
				paddingVertical: 8,
				paddingHorizontal: 12,
				borderRadius: 999
			}}
		>
			<Text
				style={{
					color: selected ? colors.onPrimary : colors.text,
					fontWeight: '600'
				}}
			>
				{label}
			</Text>
		</Pressable>
	);
}

function Segmented<T extends string>({
	value,
	options,
	onChange
}: {
	value: T;
	options: { key: T; label: string }[];
	onChange: (v: T) => void;
}) {
	const { colors } = useAppTheme();
	return (
		<View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
			{options.map(opt => {
				const active = opt.key === value;
				return (
					<Pressable
						key={opt.key}
						onPress={() => onChange(opt.key)}
						style={{
							paddingVertical: 8,
							paddingHorizontal: 12,
							borderRadius: 999,
							backgroundColor: active ? colors.primary : colors.border
						}}
					>
						<Text
							style={{
								color: active ? colors.onPrimary : colors.text,
								fontWeight: '600'
							}}
						>
							{opt.label}
						</Text>
					</Pressable>
				);
			})}
		</View>
	);
}
