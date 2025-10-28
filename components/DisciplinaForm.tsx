import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, TextInput, Pressable, Alert, Platform, Keyboard, InputAccessoryView } from 'react-native';
import { AssessmentComponent, Discipline, GradingScheme } from '@/types';
import uuid from 'react-native-uuid';

type Props = {
    initial?: Partial<Discipline>;
    onSubmit: (data: { name: string; professor?: string; code?: string; grading?: GradingScheme, maxAbsences?: number }) => void;
    onCancel?: () => void;
};

export default function DisciplinaForm({ initial, onSubmit, onCancel }: Props) {
    const [name, setName] = useState(initial?.name ?? '');
    const [professor, setProfessor] = useState(initial?.professor ?? '');
    const [code, setCode] = useState(initial?.code ?? '');

    const [components, setComponents] = useState<AssessmentComponent[]>(
        initial?.grading?.components ?? []
    );
    const [approvalThreshold, setApprovalThreshold] = useState(
        initial?.grading?.approvalThreshold != null ? String(initial.grading.approvalThreshold) : '6'
    );
    const [scaleMax, setScaleMax] = useState(
        initial?.grading?.scaleMax != null ? String(initial.grading.scaleMax) : '10'
    );

	const [maxAbsences, setMaxAbsences] = useState(
		initial?.maxAbsences != null ? String(initial.maxAbsences) : ''
	);	

    useEffect(() => {
        if (initial) {
            setName(initial.name ?? '');
            setProfessor(initial.professor ?? '');
            setCode(initial.code ?? '');
            setComponents(initial.grading?.components ?? []);
            setApprovalThreshold(
                initial.grading?.approvalThreshold != null ? String(initial.grading.approvalThreshold) : '6'
            );
            setScaleMax(
                initial.grading?.scaleMax != null ? String(initial.grading.scaleMax) : '10'
            );
			setMaxAbsences(initial?.maxAbsences != null ? String(initial.maxAbsences) : '');
        }
    }, [initial]);

    const weightSum = useMemo(
        () => components.reduce((acc, c) => acc + (Number(c.weight) || 0), 0),
        [components]
    );

    const addComponent = () => {
        setComponents(prev => [
            ...prev,
            { id: uuid.v4() as string, label: '', weight: 0 }
        ]);
    };

    const updateComponent = (id: string, patch: Partial<AssessmentComponent>) => {
        setComponents(prev => prev.map(c => (c.id === id ? { ...c, ...patch } : c)));
    };

    const removeComponent = (id: string) => {
        setComponents(prev => prev.filter(c => c.id !== id));
    };

    const handleSubmit = () => {
        if (!name.trim()) {
            Alert.alert('Informe o nome da disciplina');
            return;
        }
        // Se houver componentes, a soma precisa dar 100
        if (components.length && weightSum !== 100) {
            Alert.alert('A soma dos pesos deve ser 100%');
            return;
        }

        const grading: GradingScheme | undefined = components.length
            ? {
                  components,
                  approvalThreshold: Number(approvalThreshold) || undefined,
                  scaleMax: Number(scaleMax) || undefined
              }
            : undefined;

        onSubmit({
			name: name.trim(),
			professor: professor.trim() || undefined,
			code: code.trim() || undefined,
			grading,
			maxAbsences: maxAbsences ? Number(maxAbsences) : undefined
		});
    };

	const accessoryID = 'gradingWeightDone';

    return (
        <View style={{ gap: 10 }}>
            {/* Campos básicos */}
            <Text>Nome da disciplina*</Text>
            <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Ex.: Cálculo I"
                style={input}
            />

            <Text>Professor(a)</Text>
            <TextInput
                value={professor}
                onChangeText={setProfessor}
                placeholder="Ex.: Profa. Maria"
                style={input}
            />

            <Text>Código da turma</Text>
            <TextInput
                value={code}
                onChangeText={setCode}
                placeholder="Ex.: T01-2025"
                style={input}
            />

			<Text>Máx. de faltas (opcional)</Text>
			<TextInput
				value={maxAbsences}
				onChangeText={setMaxAbsences}
				keyboardType="numeric"
				inputMode="numeric"
				placeholder="Ex.: 10"
				style={input}
			/>


            <View style={box}>
				<Text style={{ fontSize: 16, fontWeight: '600' }}>Fórmula de avaliação</Text>

				{components.map((c, idx) => (
					<View
						key={c.id}
						style={{
							paddingVertical: 6,
							borderBottomWidth: idx === components.length - 1 ? 0 : 1,
							borderColor: '#e5e7eb',
							gap: 4
						}}
					>
						<Text style={{ color: '#374151', fontWeight: '500' }}>
							Componente {idx + 1}
						</Text>
						<View
							style={{
								flexDirection: 'row',
								alignItems: 'center',
								gap: 8,
								flexWrap: 'wrap'
							}}
						>
							<View style={{ flex: 1 }}>
								<Text style={{ color: '#6b7280', marginBottom: 2 }}>
									Nome
								</Text>
								<TextInput
									value={c.label}
									onChangeText={(t) => updateComponent(c.id, { label: t })}
									placeholder="Ex.: Provas"
									style={[input, { flex: 1 }]}
								/>
							</View>

							<View style={{ width: 90 }}>
								<Text style={{ color: '#6b7280', marginBottom: 2 }}>
									Peso (%)
								</Text>
								<TextInput
									value={String(c.weight)}
									onChangeText={(t) =>
										updateComponent(c.id, { weight: Number(t) || 0 })
									}
									placeholder="%"
									keyboardType="numeric"
									style={[input, { textAlign: 'center' }]}
								/>
							</View>

							<View style={{paddingTop: 18}}>
								<Pressable
									onPress={() => removeComponent(c.id)}
									style={chipDanger}
								>
									<Text style={{ color: '#fff' }}>Remover</Text>
								</Pressable>
							</View>
						</View>
					</View>
				))}

				<Pressable onPress={addComponent} style={chip}>
					<Text>+ Adicionar componente</Text>
				</Pressable>

				<Text
					style={{
						color: weightSum === 100 ? '#16a34a' : '#b91c1c',
						fontWeight: '500'
					}}
				>
					Soma dos pesos: {weightSum}%
				</Text>

				<View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
					<View style={{ flex: 1 }}>
						<Text>Mínimo para aprovação</Text>
						<TextInput
							value={approvalThreshold}
							onChangeText={setApprovalThreshold}
							keyboardType="numeric"
							style={input}
							placeholder="Ex.: 6.0"
						/>
					</View>
					<View style={{ width: 140 }}>
						<Text>Escala máxima</Text>
						<TextInput
							value={scaleMax}
							onChangeText={setScaleMax}
							keyboardType="numeric"
							style={input}
							placeholder="Ex.: 10"
						/>
					</View>
				</View>
			</View>


            <View style={{ flexDirection: 'row', gap: 10 }}>
                <Pressable onPress={handleSubmit} style={btnPrimary}>
                    <Text style={{ color: '#fff', fontWeight: '600' }}>Salvar</Text>
                </Pressable>
                {onCancel && (
                    <Pressable onPress={onCancel} style={btnSecondary}>
                        <Text>Cancelar</Text>
                    </Pressable>
                )}
            </View>
        </View>
    );
}

const input = { borderWidth: 1, borderColor: '#ccc', padding: 12, borderRadius: 8 } as const;
const box = { marginTop: 8, padding: 12, borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 10, backgroundColor: '#f9fafb', gap: 10 } as const;
const chip = { backgroundColor: '#e5e7eb', paddingVertical: 8, paddingHorizontal: 10, borderRadius: 10, alignSelf: 'flex-start' } as const;
const chipDanger = { backgroundColor: '#b91c1c', paddingVertical: 10, paddingHorizontal: 10, borderRadius: 10 } as const;
const btnPrimary = { backgroundColor: '#1e40af', paddingVertical: 12, paddingHorizontal: 16, borderRadius: 10 } as const;
const btnSecondary = { backgroundColor: '#e5e7eb', paddingVertical: 12, paddingHorizontal: 16, borderRadius: 10 } as const;
