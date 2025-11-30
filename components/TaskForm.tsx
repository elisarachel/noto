import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, TextInput, Pressable, Alert, Platform, ScrollView, KeyboardAvoidingView } from 'react-native';
import { Discipline, Task } from '@/types';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useAppTheme } from '@/hooks/useAppTheme';

const typeLabels = {
    prova: 'Prova',
    trabalho: 'Trabalho',
    projeto: 'Projeto'
};

type TaskFormProps = {
    disciplines: Discipline[];
    initial?: Partial<Task>;
    onSubmit: (data: Omit<Task, 'id' | 'createdAt'>) => void;
    onCancel?: () => void;
};

export default function TaskForm({ disciplines, initial, onSubmit, onCancel }: TaskFormProps) {
    const { colors } = useAppTheme();
     const [title, setTitle] = useState(initial?.title ?? '');
     const [type, setType] = useState<Task['type']>( (initial?.type as any) ?? 'prova' );
     const [disciplineId, setDisciplineId] = useState(initial?.disciplineId ?? (disciplines[0]?.id ?? ''));
     const [dueDate, setDueDate] = useState(initial?.dueDate ?? new Date().toISOString());
     const [notes, setNotes] = useState(initial?.notes ?? '');

     const [componentId, setComponentId] = useState<string | undefined>(initial?.componentId);
     const [showPicker, setShowPicker] = useState(false);

    // componentes da disciplina selecionada
    const selectedDiscipline = useMemo(
        () => disciplines.find(d => d.id === disciplineId),
        [disciplines, disciplineId]
    );

    const components = useMemo(
        () => selectedDiscipline?.grading?.components ?? [],
        [selectedDiscipline?.grading?.components]
    );

    // ao trocar disciplina, reseta o componente se não existir na nova disciplina
    useEffect(() => {
        if (!components.length) {
            setComponentId(undefined);
        } else {
            // se já havia um componentId, garante que pertence à nova disciplina
            if (!components.some(c => c.id === componentId)) {
                setComponentId(undefined);
            }
        }
    }, [disciplineId, components, componentId]);

    const handleSubmit = () => {
        if (!title.trim()) {
            Alert.alert('Informe o título');
            return;
        }
        if (!disciplineId) {
            Alert.alert('Selecione a disciplina');
            return;
        }

        onSubmit({
            title: title.trim(),
            type,
            disciplineId,
            dueDate,
            notes: notes.trim() || undefined,
            // mantém a nota caso esteja editando
            grade: initial?.grade,
            gradeMax: initial?.gradeMax,
            componentId: componentId || undefined,
        } as Omit<Task, 'id' | 'createdAt'>);
    };

    // estilos dependentes do tema
    const inputStyle = { borderWidth: 1, borderColor: colors.border, padding: 12, borderRadius: 8, backgroundColor: colors.cardBg, color: colors.text } as const;
    const typeButton = (active: boolean) => ({ padding:8, borderRadius:6, backgroundColor: active ? colors.primary : colors.border });
    const typeText = (active: boolean) => ({ color: active ? colors.onPrimary : colors.text });
    const disciplineButton = (active: boolean) => ({ padding:8, borderWidth:1, borderColor: active ? colors.primary : colors.border, borderRadius:6, marginBottom:4, backgroundColor: active ? colors.mutedBg : colors.surface });
    const componentButton = (active: boolean) => ({ padding:8, borderWidth:1, borderColor: active ? colors.primary : colors.border, borderRadius:6, marginBottom:4, backgroundColor: active ? colors.mutedBg : colors.surface });
    const dateRow = [inputStyle, { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }];
    const btnPrimaryLocal = { backgroundColor: colors.primary, paddingVertical: 12, paddingHorizontal: 16, borderRadius: 10 } as const;
    const btnSecondaryLocal = { backgroundColor: colors.border, paddingVertical: 12, paddingHorizontal: 16, borderRadius: 10 } as const;

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={{ width: '100%', backgroundColor: colors.cardBg }}
        >
            <ScrollView
                contentContainerStyle={{ gap: 10, paddingBottom: 100, backgroundColor: colors.cardBg }}
                keyboardShouldPersistTaps="handled"
            >
                <View style={{ gap: 10, padding: 12 }}>
                     <Text style={{ color: colors.text }}>Título*</Text>
                    <TextInput
                        value={title}
                        onChangeText={setTitle}
                        placeholder="Ex.: Prova 1"
                        style={inputStyle}
                        placeholderTextColor={colors.textMuted}
                    />

                    <Text style={{ color: colors.text }}>Tipo</Text>
                    <View style={{ flexDirection:'row', gap:6 }}>
                        {(['prova','trabalho','projeto'] as const).map(t => (
                            <Pressable
                                key={t}
                                onPress={() => setType(t)}
                                style={typeButton(type === t)}
                            >
                                <Text style={typeText(type === t)}>{typeLabels[t]}</Text>
                            </Pressable>
                        ))}
                    </View>

                    <Text style={{ color: colors.text }}>Disciplina</Text>
                    {disciplines.map(d => (
                        <Pressable
                            key={d.id}
                            onPress={() => setDisciplineId(d.id)}
                            style={disciplineButton(d.id === disciplineId)}
                        >
                            <Text style={{ color: d.id === disciplineId ? colors.onPrimary : colors.text }}>{d.name}</Text>
                        </Pressable>
                    ))}

                    {components.length > 0 && (
                        <Text style={{ color: colors.text }}>Componente de nota associado</Text>
                    )}
                    {components.map(d => (
                        <Pressable
                            key={d.id}
                            onPress={() => setComponentId(d.id)}
                            style={componentButton(d.id === componentId)}
                        >
                            <Text style={{ color: d.id === componentId ? colors.onPrimary : colors.text }}>{d.label}</Text>
                        </Pressable>
                    ))}

                    <Text style={{ color: colors.text }}>Data e hora</Text>
                    <Pressable
                        onPress={() => setShowPicker(true)}
                        style={dateRow}
                    >
                        <Text style={{ color: colors.text }}>{new Date(dueDate).toLocaleString('pt-BR')}</Text>
                        <Text style={{ color: colors.primary, fontWeight: '600' }}>📅</Text>
                    </Pressable>

                    {showPicker && (
                        <DateTimePicker
                            value={new Date(dueDate)}
                            mode="datetime"
                            display={Platform.OS === 'ios' ? 'inline' : 'default'}
                            locale="pt-BR"
                            onChange={(event: DateTimePickerEvent, date?: Date) => {
                                if (event.type === 'set' && date) {
                                    setDueDate(date.toISOString());
                                }
                                if (Platform.OS !== 'ios') setShowPicker(false);
                            }}
                            {...(Platform.OS === 'ios' ? { textColor: colors.text } : {})}
                        />
                    )}

                    <Text style={{ color: colors.text }}>Observações</Text>
                    <TextInput
                        value={notes}
                        onChangeText={setNotes}
                        placeholder="Detalhes da avaliação"
                        style={[inputStyle, { minHeight: 80 }]}
                        multiline
                        placeholderTextColor={colors.textMuted}
                    />

                    <View style={{ flexDirection: 'row', gap: 10, marginTop: 4 }}>
                        <Pressable onPress={handleSubmit} style={btnPrimaryLocal}>
                            <Text style={{ color: colors.onPrimary, fontWeight: '600' }}>Salvar</Text>
                        </Pressable>
                        {onCancel && (
                            <Pressable onPress={onCancel} style={btnSecondaryLocal}>
                                <Text style={{ color: colors.text }}>Cancelar</Text>
                            </Pressable>
                        )}
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}
