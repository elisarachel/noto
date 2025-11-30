import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, Pressable, TextInput, Alert, SectionList } from 'react-native';
import { useApp } from '@/context/AppContext';
import TaskForm from '@/components/TaskForm';
import { Task } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@/hooks/useAppTheme';

const typeLabels = {
    prova: 'Prova',
    trabalho: 'Trabalho',
    projeto: 'Projeto',
};

export default function TasksScreen() {
    const { colors } = useAppTheme();
    const { disciplines, tasks, addTask, updateTask, removeTask } = useApp();
    const [creating, setCreating] = useState(false);
    const [editing, setEditing] = useState<Task | null>(null);
    const [showPast, setShowPast] = useState(false);

    // estilos que antes faltavam (usem o tema)
    const card = { backgroundColor: colors.cardBg, padding: 16, borderRadius: 12, gap: 12 } as const;
    const title = { fontSize: 16, fontWeight: '600', color: colors.text } as const;

    // inputs locais por tarefa (evita warnings controlado/não-controlado)
    const [gradeInputs, setGradeInputs] = useState<Record<string, { grade: string; max: string }>>({});
    const getInputs = useCallback((t: Task) => {
        const existing = gradeInputs[t.id] ?? {};
        return {
            grade: existing.grade ?? (t.grade != null ? String(t.grade) : ''),
            max: existing.max ?? String(t.gradeMax ?? 10),
        } as { grade: string; max: string };
    }, [gradeInputs]);
    const setInputFor = (id: string, patch: Partial<{ grade: string; max: string }>) =>
        setGradeInputs(prev => ({ ...prev, [id]: { ...(prev[id] ?? ({} as any)), ...patch } }));

    const persistGrade = useCallback(async (t: Task) => {
		const cur = getInputs(t);

		const gradeText = (cur.grade ?? '').trim();
		const maxText = (cur.max ?? '').trim();

		// valida texto vazio
		if (gradeText.length === 0) {
			Alert.alert('Nota inválida', 'Digite a nota antes de salvar.');
			return;
		}
		if (maxText.length === 0) {
			Alert.alert('Escala inválida', 'Digite a escala (ex.: 10).');
			return;
		}

		const g = Number(gradeText.replace(',', '.'));
		const mx = Number(maxText.replace(',', '.'));

		if (Number.isNaN(g) || g < 0) {
			Alert.alert('Nota inválida', 'Digite um número maior ou igual a 0.');
			return;
		}
		if (Number.isNaN(mx) || mx <= 0) {
			Alert.alert('Escala inválida', 'A escala deve ser maior que 0.');
			return;
		}

		await updateTask(t.id, { grade: g, gradeMax: mx });
		Alert.alert('Pronto!', 'Nota salva com sucesso.');
    }, [updateTask, getInputs]);


    const now = useMemo(() => new Date(), []);

    const sortedTasks = useMemo(
        () => [...tasks].sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()),
        [tasks]
    );

    const upcoming = useMemo(() => sortedTasks.filter(t => new Date(t.dueDate) >= now), [sortedTasks, now]);
    const past = useMemo(() => sortedTasks.filter(t => new Date(t.dueDate) < now), [sortedTasks, now]);

    const renderTask = ({ item }: { item: Task }) => {
        const disciplineName = disciplines.find(d => d.id === item.disciplineId)?.name ?? '—';

        const inputs = getInputs(item);
        const canSave =
            inputs.grade.trim().length > 0 &&
            !Number.isNaN(Number(inputs.grade.replace(',', '.'))) &&
            inputs.max.trim().length > 0 &&
            !Number.isNaN(Number(inputs.max.replace(',', '.')));

        return (
            <View style={{
                backgroundColor: colors.surface,
                borderWidth: 1,
                borderColor: colors.border,
                padding: 14,
                borderRadius: 10,
                flexDirection: 'row',
                alignItems: 'flex-start',
                gap: 12,
            }}>
                <View style={{ flex: 1, gap: 2 }}>
                    <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text }}>
                        {typeLabels[item.type]} – {item.title}
                    </Text>
                    <Text style={{ color: colors.primary, fontWeight: '500' }}>{disciplineName}</Text>
                    <Text style={{ color: colors.textMuted }}>{new Date(item.dueDate).toLocaleString()}</Text>
                    {!!item.notes && <Text style={{ color: colors.textMuted }}>{item.notes}</Text>}

                    {/* NOTA inline (com botão Salvar) */}
                    <View style={{ marginTop: 8, gap: 6 }}>
                        {item.grade == null ? (
                            <>
                                <Text style={{ color: colors.text, fontWeight: '500' }}>Lançar nota:</Text>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                                    <TextInput
                                        placeholder="8.5"
                                        keyboardType="numeric"
                                        value={getInputs(item).grade}
                                        onChangeText={text => setInputFor(item.id, { grade: text })}
                                        style={[{
                                            borderWidth: 1,
                                            borderColor: colors.border,
                                            paddingVertical: 6,
                                            paddingHorizontal: 8,
                                            borderRadius: 8,
                                            backgroundColor: colors.cardBg,
                                            color: colors.text
                                        }, { width: 80 }]}
                                        placeholderTextColor={colors.textMuted}
                                    />
                                    <Text style={{ color: colors.textMuted }}>/</Text>
                                    <TextInput
                                        placeholder="10"
                                        keyboardType="numeric"
                                        value={getInputs(item).max}
                                        onChangeText={text => setInputFor(item.id, { max: text })}
                                        style={[{
                                            borderWidth: 1,
                                            borderColor: colors.border,
                                            paddingVertical: 6,
                                            paddingHorizontal: 8,
                                            borderRadius: 8,
                                            backgroundColor: colors.cardBg,
                                            color: colors.text
                                        }, { width: 80 }]}
                                        placeholderTextColor={colors.textMuted}
                                    />
                                    <Pressable
                                        onPress={() => persistGrade(item)}
                                        disabled={!canSave}
                                        style={[
                                            {
                                                backgroundColor: canSave ? colors.primary : colors.textMuted,
                                                paddingVertical: 8,
                                                paddingHorizontal: 10,
                                                borderRadius: 10,
                                                opacity: canSave ? 1 : 0.7,
                                                alignItems: 'center'
                                            }
                                        ]}
                                    >
                                        <Text style={{ color: colors.onPrimary, fontWeight: '600' }}>Salvar</Text>
                                    </Pressable>
                                </View>
                            </>
                        ) : (
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                                <Ionicons name="checkmark-circle-outline" size={18} color="#16a34a" />
                                <Text style={{ fontWeight: '600', color: colors.text }}>
                                    Nota: {item.grade}{' '}
                                    <Text style={{ color: colors.textMuted }}>/ {item.gradeMax ?? 10}</Text>
                                </Text>
                                <Pressable
                                    onPress={() => {
                                        // prepara inputs com os valores atuais e limpa nota para reedição
                                        setInputFor(item.id, {
                                            grade: String(item.grade ?? ''),
                                            max: String(item.gradeMax ?? 10),
                                        });
                                        updateTask(item.id, { grade: undefined });
                                    }}
                                    style={{
                                        backgroundColor: colors.border,
                                        paddingVertical: 8,
                                        paddingHorizontal: 10,
                                        borderRadius: 10,
                                    }}
                                >
                                    <Text style={{ color: colors.text }}>Editar nota</Text>
                                </Pressable>
                            </View>
                        )}
                    </View>
                </View>

                {/* coluna direita (ações) */}
                <View style={{ gap: 8 }}>
                    <Pressable onPress={() => setEditing(item)} style={{ backgroundColor: colors.border, paddingVertical: 8, paddingHorizontal: 10, borderRadius: 10 }}>
                        <Text style={{ color: colors.text }}>Editar</Text>
                    </Pressable>
                    <Pressable onPress={() => removeTask(item.id)} style={{ backgroundColor: '#b91c1c', paddingVertical: 8, paddingHorizontal: 10, borderRadius: 10 }}>
                        <Text style={{ color: '#fff' }}>Excluir</Text>
                    </Pressable>
                </View>
            </View>
         );
     };

    const sections = useMemo(
        () => [
            { key: 'upcoming', title: 'Próximas', data: upcoming },
            { key: 'past', title: 'Passadas', data: showPast ? past : [] },
        ],
        [upcoming, past, showPast]
    );

    return (
        <View style={{ flex: 1, padding: 16, gap: 16, backgroundColor: colors.background }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ fontSize: 22, fontWeight: '700', color: colors.text }}>Avaliações & Trabalhos</Text>
                <Pressable
                    onPress={() => {
                        setCreating(true);
                        setEditing(null);
                    }}
                    style={{ backgroundColor: colors.primary, paddingVertical: 10, paddingHorizontal: 14, borderRadius: 10 }}
                >
                    <Text style={{ color: colors.onPrimary, fontWeight: '600' }}>Novo</Text>
                </Pressable>
            </View>

            {creating && (
                <View style={card}>
                    <Text style={title}>Adicionar tarefa</Text>
                    <TaskForm
                        disciplines={disciplines}
                        onSubmit={async data => {
                            await addTask(data);
                            setCreating(false);
                        }}
                        onCancel={() => setCreating(false)}
                    />
                </View>
            )}

            {editing && (
                <View style={card}>
                    <Text style={title}>Editar tarefa</Text>
                    <TaskForm
                        disciplines={disciplines}
                        initial={editing}
                        onSubmit={async data => {
                            await updateTask(editing.id, data);
                            setEditing(null);
                        }}
                        onCancel={() => setEditing(null)}
                    />
                </View>
            )}

            <SectionList
                sections={sections}
                keyExtractor={i => i.id}
                contentContainerStyle={{ gap: 10, paddingBottom: 20 }}
                renderItem={renderTask}
                renderSectionHeader={({ section }) => {
                    if ((section as any).key === 'upcoming') {
                        return <SectionHeader label="Próximas" />;
                    }

                    // past section header is the toggle
                    if ((section as any).key === 'past') {
                        return (
                            <Pressable
                                onPress={() => setShowPast(s => !s)}
                                style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 }}
                            >
                                <Ionicons name={showPast ? 'chevron-down' : 'chevron-forward'} size={18} color={colors.textMuted} />
                                <Text style={{ fontWeight: '600', color: colors.textMuted }}>
                                    {showPast ? 'Ocultar' : 'Mostrar'} passadas ({past.length})
                                </Text>
                            </Pressable>
                        );
                    }

                    return null;
                }}
            />
        </View>
    );
}

function SectionHeader({ label }: { label: string }) {
    const { colors } = useAppTheme();
    return (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 }}>
            <Ionicons name="calendar-outline" size={18} color={colors.textMuted} />
            <Text style={{ fontSize: 16, fontWeight: '600', color: colors.textMuted }}>{label}</Text>
        </View>
    );
}
