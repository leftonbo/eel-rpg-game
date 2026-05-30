import React, { ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import Alert from 'react-bootstrap/Alert';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import { getBossData } from '../data';
import type { Boss } from '../entities/Boss';
import type { Player } from '../entities/Player';
import { StatusEffectManager, StatusEffectType } from '../systems/StatusEffect';
import { t } from '../i18n';
import {
    BattleDebugModalRequest,
    BossModalRequest,
    ChangelogModalRequest,
    ChangelogModalResult,
    CustomVarResult,
    registerDialogController,
    SelectOption,
    StatusEffectModalResult,
} from '../utils/ModalUtils';
import { ToastType, ToastUtils } from '../utils/ToastUtils';

interface DialogProviderProps {
    children: ReactNode;
}

type DialogItem =
    | { kind: 'alert'; message: string; title: string; resolve: (value: void) => void }
    | { kind: 'confirm'; message: string; title: string; resolve: (value: boolean) => void }
    | { kind: 'prompt'; message: string; defaultValue: string; title: string; inputType: string; resolve: (value: string | null) => void }
    | { kind: 'select'; message: string; options: SelectOption[]; title: string; resolve: (value: string | null) => void }
    | { kind: 'custom-var'; resolve: (value: CustomVarResult | null) => void }
    | { kind: 'status-effect'; target: 'player' | 'boss'; statusTypes: string[]; resolve: (value: StatusEffectModalResult | null) => void }
    | { kind: 'boss'; request: BossModalRequest; resolve: (value: boolean) => void }
    | { kind: 'changelog'; request: ChangelogModalRequest; resolve: (value: ChangelogModalResult) => void }
    | { kind: 'battle-debug'; request: BattleDebugModalRequest; resolve: (value: boolean) => void };

type DialogResult =
    | void
    | boolean
    | string
    | null
    | CustomVarResult
    | StatusEffectModalResult
    | ChangelogModalResult;

function getDismissValue(item: DialogItem): DialogResult {
    switch (item.kind) {
        case 'alert':
            return undefined;
        case 'confirm':
        case 'boss':
        case 'battle-debug':
            return false;
        case 'changelog':
            return 'closed';
        case 'prompt':
        case 'select':
        case 'custom-var':
        case 'status-effect':
            return null;
    }
}

function parseCustomValue(value: string, originalType?: string): string | number | boolean {
    if (originalType === 'number') {
        return Number(value) || 0;
    }

    if (originalType === 'boolean') {
        return value.toLowerCase() === 'true';
    }

    if (!Number.isNaN(Number(value))) {
        return Number(value);
    }

    if (value.toLowerCase() === 'true' || value.toLowerCase() === 'false') {
        return value.toLowerCase() === 'true';
    }

    return value;
}

export function DialogProvider({ children }: DialogProviderProps): React.ReactElement {
    const [current, setCurrent] = useState<DialogItem | null>(null);
    const [, setQueue] = useState<DialogItem[]>([]);

    const enqueue = useCallback((item: DialogItem) => {
        setCurrent((active) => {
            if (active) {
                setQueue((items) => [...items, item]);
                return active;
            }
            return item;
        });
    }, []);

    const finish = useCallback((value: DialogResult) => {
        setCurrent((active) => {
            if (active) {
                (active.resolve as (result: DialogResult) => void)(value);
            }
            return null;
        });
        setQueue((items) => {
            const [next, ...rest] = items;
            if (next) {
                setCurrent(next);
            }
            return rest;
        });
    }, []);

    useEffect(() => {
        registerDialogController({
            showAlert: (message, title) => new Promise<void>((resolve) => enqueue({ kind: 'alert', message, title, resolve })),
            showConfirm: (message, title) => new Promise<boolean>((resolve) => enqueue({ kind: 'confirm', message, title, resolve })),
            showPrompt: (message, defaultValue, title, inputType) =>
                new Promise<string | null>((resolve) => enqueue({ kind: 'prompt', message, defaultValue, title, inputType, resolve })),
            showSelect: (message, options, title) =>
                new Promise<string | null>((resolve) => enqueue({ kind: 'select', message, options, title, resolve })),
            showCustomVarModal: () => new Promise<CustomVarResult | null>((resolve) => enqueue({ kind: 'custom-var', resolve })),
            showStatusEffectModal: (target, statusTypes) =>
                new Promise<StatusEffectModalResult | null>((resolve) => enqueue({ kind: 'status-effect', target, statusTypes, resolve })),
            showBossModal: (request) => new Promise<boolean>((resolve) => enqueue({ kind: 'boss', request, resolve })),
            showChangelogModal: (request) => new Promise<ChangelogModalResult>((resolve) => enqueue({ kind: 'changelog', request, resolve })),
            showBattleDebugModal: (request) => new Promise<boolean>((resolve) => enqueue({ kind: 'battle-debug', request, resolve })),
        });

        return () => registerDialogController(null);
    }, [enqueue]);

    const handleHide = () => {
        if (!current) return;
        finish(getDismissValue(current));
    };

    return (
        <>
            {children}
            {current?.kind === 'alert' && (
                <AlertDialog item={current} onHide={handleHide} onResolve={() => finish(undefined)} />
            )}
            {current?.kind === 'confirm' && (
                <ConfirmDialog item={current} onHide={handleHide} onResolve={finish} />
            )}
            {current?.kind === 'prompt' && (
                <PromptDialog item={current} onHide={handleHide} onResolve={finish} />
            )}
            {current?.kind === 'select' && (
                <SelectDialog item={current} onHide={handleHide} onResolve={finish} />
            )}
            {current?.kind === 'custom-var' && (
                <CustomVarDialog onHide={handleHide} onResolve={finish} />
            )}
            {current?.kind === 'status-effect' && (
                <StatusEffectDialog item={current} onHide={handleHide} onResolve={finish} />
            )}
            {current?.kind === 'boss' && (
                <BossModalDialog item={current} onHide={handleHide} onResolve={finish} />
            )}
            {current?.kind === 'changelog' && (
                <ChangelogDialog item={current} onHide={handleHide} onResolve={finish} />
            )}
            {current?.kind === 'battle-debug' && (
                <BattleDebugDialog item={current} onHide={handleHide} onResolve={finish} />
            )}
        </>
    );
}

function AlertDialog({
    item,
    onHide,
    onResolve,
}: {
    item: Extract<DialogItem, { kind: 'alert' }>;
    onHide: () => void;
    onResolve: () => void;
}): React.ReactElement {
    return (
        <Modal show onHide={onHide} centered contentClassName="bg-dark text-light">
            <Modal.Header closeButton closeVariant="white">
                <Modal.Title>{item.title}</Modal.Title>
            </Modal.Header>
            <Modal.Body>{item.message}</Modal.Body>
            <Modal.Footer>
                <Button variant="primary" onClick={onResolve}>
                    {t('dialogs.common.ok')}
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

function ConfirmDialog({
    item,
    onHide,
    onResolve,
}: {
    item: Extract<DialogItem, { kind: 'confirm' }>;
    onHide: () => void;
    onResolve: (value: boolean) => void;
}): React.ReactElement {
    return (
        <Modal show onHide={onHide} centered contentClassName="bg-dark text-light">
            <Modal.Header closeButton closeVariant="white">
                <Modal.Title>{item.title}</Modal.Title>
            </Modal.Header>
            <Modal.Body>{item.message}</Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={() => onResolve(false)}>
                    {t('dialogs.common.cancel')}
                </Button>
                <Button variant="danger" onClick={() => onResolve(true)}>
                    {t('dialogs.common.ok')}
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

function PromptDialog({
    item,
    onHide,
    onResolve,
}: {
    item: Extract<DialogItem, { kind: 'prompt' }>;
    onHide: () => void;
    onResolve: (value: string | null) => void;
}): React.ReactElement {
    const [value, setValue] = useState(item.defaultValue);

    useEffect(() => {
        setValue(item.defaultValue);
    }, [item]);

    return (
        <Modal show onHide={onHide} centered contentClassName="bg-dark text-light">
            <Modal.Header closeButton closeVariant="white">
                <Modal.Title>{item.title}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div className="mb-3">{item.message}</div>
                <Form.Control
                    autoFocus
                    type={item.inputType}
                    value={value}
                    placeholder={t('dialogs.common.prompt.placeholder')}
                    onChange={(event) => setValue(event.target.value)}
                    onKeyDown={(event) => {
                        if (event.key === 'Enter') {
                            onResolve(value);
                        }
                    }}
                />
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={() => onResolve(null)}>
                    {t('dialogs.common.cancel')}
                </Button>
                <Button variant="primary" onClick={() => onResolve(value)}>
                    {t('dialogs.common.ok')}
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

function SelectDialog({
    item,
    onHide,
    onResolve,
}: {
    item: Extract<DialogItem, { kind: 'select' }>;
    onHide: () => void;
    onResolve: (value: string | null) => void;
}): React.ReactElement {
    const [value, setValue] = useState(item.options[0]?.value ?? '');

    useEffect(() => {
        setValue(item.options[0]?.value ?? '');
    }, [item]);

    return (
        <Modal show onHide={onHide} centered contentClassName="bg-dark text-light">
            <Modal.Header closeButton closeVariant="white">
                <Modal.Title>{item.title}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div className="mb-3">{item.message}</div>
                <Form.Select value={value} onChange={(event) => setValue(event.target.value)}>
                    {item.options.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.text}
                        </option>
                    ))}
                </Form.Select>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={() => onResolve(null)}>
                    {t('dialogs.common.cancel')}
                </Button>
                <Button variant="primary" onClick={() => onResolve(value || null)}>
                    {t('dialogs.common.select')}
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

function CustomVarDialog({
    onHide,
    onResolve,
}: {
    onHide: () => void;
    onResolve: (value: CustomVarResult | null) => void;
}): React.ReactElement {
    const [key, setKey] = useState('');
    const [value, setValue] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [invalidField, setInvalidField] = useState<'key' | 'value' | null>(null);

    const submit = () => {
        const trimmedKey = key.trim();
        const trimmedValue = value.trim();
        setError(null);
        setInvalidField(null);

        if (!trimmedKey) {
            setError(t('dialogs.customVar.errors.missingKey'));
            setInvalidField('key');
            return;
        }

        if (!trimmedValue) {
            setError(t('dialogs.customVar.errors.missingValue'));
            setInvalidField('value');
            return;
        }

        onResolve({ key: trimmedKey, value: parseCustomValue(trimmedValue) });
    };

    return (
        <Modal show onHide={onHide} centered contentClassName="bg-dark text-light">
            <Modal.Header closeButton closeVariant="white">
                <Modal.Title>{t('dialogs.customVar.title')}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {error && <Alert variant="danger">{error}</Alert>}
                <Form.Group className="mb-3" controlId="custom-var-key-react">
                    <Form.Label>{t('dialogs.customVar.keyLabel')}</Form.Label>
                    <Form.Control
                        autoFocus
                        isInvalid={invalidField === 'key'}
                        value={key}
                        placeholder={t('dialogs.customVar.keyPlaceholder')}
                        onChange={(event) => setKey(event.target.value)}
                        onKeyDown={(event) => {
                            if (event.key === 'Enter') submit();
                        }}
                    />
                </Form.Group>
                <Form.Group className="mb-3" controlId="custom-var-value-react">
                    <Form.Label>{t('dialogs.customVar.valueLabel')}</Form.Label>
                    <Form.Control
                        isInvalid={invalidField === 'value'}
                        value={value}
                        placeholder={t('dialogs.customVar.valuePlaceholder')}
                        onChange={(event) => setValue(event.target.value)}
                        onKeyDown={(event) => {
                            if (event.key === 'Enter') submit();
                        }}
                    />
                    <Form.Text>{t('dialogs.customVar.helper')}</Form.Text>
                </Form.Group>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={() => onResolve(null)}>
                    {t('dialogs.common.cancel')}
                </Button>
                <Button variant="primary" onClick={submit}>
                    {t('common.add')}
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

function StatusEffectDialog({
    item,
    onHide,
    onResolve,
}: {
    item: Extract<DialogItem, { kind: 'status-effect' }>;
    onHide: () => void;
    onResolve: (value: StatusEffectModalResult | null) => void;
}): React.ReactElement {
    const [type, setType] = useState(item.statusTypes[0] ?? '');
    const [duration, setDuration] = useState('3');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setType(item.statusTypes[0] ?? '');
        setDuration('3');
        setError(null);
    }, [item]);

    const submit = () => {
        const durationValue = Number.parseInt(duration, 10);

        if (!type) {
            setError(t('dialogs.statusEffect.errors.invalidDuration'));
            return;
        }

        if (Number.isNaN(durationValue) || durationValue < 1) {
            setError(t('dialogs.statusEffect.errors.invalidDuration'));
            return;
        }

        if (durationValue > 99) {
            setError(t('dialogs.statusEffect.errors.maxDuration'));
            return;
        }

        onResolve({ type, duration: durationValue });
    };

    const targetLabel = item.target === 'player' ? t('common.player') : t('common.boss');

    return (
        <Modal show onHide={onHide} centered contentClassName="bg-dark text-light">
            <Modal.Header closeButton closeVariant="white">
                <Modal.Title>{t('dialogs.statusEffect.title', { target: targetLabel })}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {error && <Alert variant="danger">{error}</Alert>}
                <Form.Group className="mb-3" controlId="status-effect-type-react">
                    <Form.Label>{t('dialogs.statusEffect.typeLabel')}</Form.Label>
                    <Form.Select value={type} onChange={(event) => setType(event.target.value)}>
                        {item.statusTypes.map((statusType) => (
                            <option key={statusType} value={statusType}>
                                {statusType}
                            </option>
                        ))}
                    </Form.Select>
                </Form.Group>
                <Form.Group className="mb-3" controlId="status-effect-duration-react">
                    <Form.Label>{t('dialogs.statusEffect.durationLabel')}</Form.Label>
                    <Form.Control
                        autoFocus
                        type="number"
                        min={1}
                        max={99}
                        value={duration}
                        onChange={(event) => setDuration(event.target.value)}
                        onKeyDown={(event) => {
                            if (event.key === 'Enter') submit();
                        }}
                    />
                </Form.Group>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={() => onResolve(null)}>
                    {t('dialogs.common.cancel')}
                </Button>
                <Button variant="primary" onClick={submit}>
                    {t('common.add')}
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

function BossModalDialog({
    item,
    onHide,
    onResolve,
}: {
    item: Extract<DialogItem, { kind: 'boss' }>;
    onHide: () => void;
    onResolve: (value: boolean) => void;
}): React.ReactElement {
    const bossData = getBossData(item.request.bossId);
    const isSelectMode = item.request.mode === 'select';

    return (
        <Modal show onHide={onHide} centered contentClassName="bg-dark text-light">
            <Modal.Header closeButton closeVariant="white">
                <Modal.Title className="fs-3">
                    <span>{bossData.icon}</span> <span>{bossData.displayName}</span>
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <h2 className="fs-5">{bossData.description}</h2>
                <div className="row">
                    <div className="col-6">
                        <strong>{t('common.hp')}:</strong> {bossData.maxHp}
                    </div>
                    <div className="col-6">
                        <strong>{t('common.attack')}:</strong> {bossData.attackPower}
                    </div>
                </div>
                <hr />
                <h2 className="fs-5">{t('bossModal.questTitle')}</h2>
                <p>{bossData.questNote}</p>
                {bossData.appearanceNote && (
                    <p>
                        <small className="text-muted">
                            {t('bossModal.appearanceLabel')}: {bossData.appearanceNote}
                        </small>
                    </p>
                )}
                {bossData.guestCharacterInfo && (
                    <p>
                        <small className="text-muted">
                            {t('bossModal.guest.createdBy', {
                                name: bossData.guestCharacterInfo.characterName || t('bossModal.guest.fallbackName'),
                                creator: bossData.guestCharacterInfo.creator,
                            })}
                        </small>
                    </p>
                )}
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={() => onResolve(false)}>
                    {isSelectMode ? t('bossModal.buttons.cancel') : t('bossModal.buttons.back')}
                </Button>
                {isSelectMode && (
                    <Button variant="primary" onClick={() => onResolve(true)}>
                        {t('bossModal.buttons.confirm')}
                    </Button>
                )}
            </Modal.Footer>
        </Modal>
    );
}

function ChangelogDialog({
    item,
    onHide,
    onResolve,
}: {
    item: Extract<DialogItem, { kind: 'changelog' }>;
    onHide: () => void;
    onResolve: (value: ChangelogModalResult) => void;
}): React.ReactElement {
    return (
        <Modal show onHide={onHide} size="xl" scrollable contentClassName="bg-dark text-light">
            <Modal.Header closeButton closeVariant="white" className="bg-primary text-white">
                <Modal.Title>🎉 新しい更新履歴</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Alert variant="info" className="mb-4">
                    <Alert.Heading as="h6">📋 更新履歴が追加されました！</Alert.Heading>
                    <p className="mb-0">ゲームが更新され、新しい機能や改善点が追加されました。</p>
                </Alert>
                <div dangerouslySetInnerHTML={{ __html: item.request.htmlContent }} />
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={() => onResolve('closed')}>
                    閉じる
                </Button>
                <Button variant="primary" onClick={() => onResolve('goto')}>
                    更新履歴ページへ
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

interface DebugStatusEffectState {
    type: StatusEffectType;
    name: string;
    duration: string;
}

interface DebugCustomVarState {
    key: string;
    value: string;
    originalType: string;
}

function buildStatusEffectState(playerOrBoss: Player | Boss): DebugStatusEffectState[] {
    return playerOrBoss.statusEffects.getAllEffects().map((effect) => ({
        type: effect.type,
        name: effect.name,
        duration: effect.duration.toString(),
    }));
}

function buildCustomVarState(boss: Boss): DebugCustomVarState[] {
    return Object.entries(boss.getAllCustomVariables()).map(([key, value]) => ({
        key,
        value: String(value),
        originalType: typeof value,
    }));
}

function BattleDebugDialog({
    item,
    onHide,
    onResolve,
}: {
    item: Extract<DialogItem, { kind: 'battle-debug' }>;
    onHide: () => void;
    onResolve: (value: boolean) => void;
}): React.ReactElement {
    const { player, boss } = item.request;
    const statusTypes = useMemo(() => Object.values(StatusEffectType), []);
    const [playerHp, setPlayerHp] = useState(player.hp.toString());
    const [playerMaxHp, setPlayerMaxHp] = useState(player.maxHp.toString());
    const [playerMp, setPlayerMp] = useState(player.mp.toString());
    const [playerMaxMp, setPlayerMaxMp] = useState(player.maxMp.toString());
    const [bossHp, setBossHp] = useState(boss.hp.toString());
    const [bossMaxHp, setBossMaxHp] = useState(boss.maxHp.toString());
    const [playerEffects, setPlayerEffects] = useState<DebugStatusEffectState[]>(() => buildStatusEffectState(player));
    const [bossEffects, setBossEffects] = useState<DebugStatusEffectState[]>(() => buildStatusEffectState(boss));
    const [customVars, setCustomVars] = useState<DebugCustomVarState[]>(() => buildCustomVarState(boss));
    const [playerNewStatus, setPlayerNewStatus] = useState(statusTypes[0]);
    const [playerNewDuration, setPlayerNewDuration] = useState('3');
    const [bossNewStatus, setBossNewStatus] = useState(statusTypes[0]);
    const [bossNewDuration, setBossNewDuration] = useState('3');
    const [newCustomKey, setNewCustomKey] = useState('');
    const [newCustomValue, setNewCustomValue] = useState('');
    const [error, setError] = useState<string | null>(null);

    const updateEffectDuration = (
        target: 'player' | 'boss',
        type: StatusEffectType,
        duration: string
    ) => {
        const update = (effects: DebugStatusEffectState[]) =>
            effects.map((effect) => effect.type === type ? { ...effect, duration } : effect);

        if (target === 'player') {
            setPlayerEffects(update);
        } else {
            setBossEffects(update);
        }
    };

    const removeEffect = (target: 'player' | 'boss', type: StatusEffectType) => {
        if (target === 'player') {
            setPlayerEffects((effects) => effects.filter((effect) => effect.type !== type));
        } else {
            setBossEffects((effects) => effects.filter((effect) => effect.type !== type));
        }
    };

    const addEffect = (target: 'player' | 'boss') => {
        const type = target === 'player' ? playerNewStatus : bossNewStatus;
        const duration = target === 'player' ? playerNewDuration : bossNewDuration;
        const durationValue = Number.parseInt(duration, 10);

        if (Number.isNaN(durationValue) || durationValue < 1 || durationValue > 99) {
            setError(t('dialogs.statusEffect.errors.invalidDuration'));
            return;
        }

        const nextEffect: DebugStatusEffectState = {
            type,
            name: StatusEffectManager.getEffectName(type),
            duration: durationValue.toString(),
        };

        const append = (effects: DebugStatusEffectState[]) => [
            ...effects.filter((effect) => effect.type !== type),
            nextEffect,
        ];

        if (target === 'player') {
            setPlayerEffects(append);
        } else {
            setBossEffects(append);
        }
        setError(null);
    };

    const addCustomVar = () => {
        const key = newCustomKey.trim();
        const value = newCustomValue.trim();

        if (!key) {
            setError(t('dialogs.customVar.errors.missingKey'));
            return;
        }

        if (!value) {
            setError(t('dialogs.customVar.errors.missingValue'));
            return;
        }

        setCustomVars((vars) => [
            ...vars.filter((customVar) => customVar.key !== key),
            { key, value, originalType: 'auto' },
        ]);
        setNewCustomKey('');
        setNewCustomValue('');
        setError(null);
    };

    const removeCustomVar = (key: string) => {
        setCustomVars((vars) => vars.filter((customVar) => customVar.key !== key));
    };

    const syncEffects = (target: Player | Boss, effects: DebugStatusEffectState[]) => {
        const desiredTypes = new Set(effects.map((effect) => effect.type));
        target.statusEffects.getAllEffects().forEach((effect) => {
            if (!desiredTypes.has(effect.type)) {
                target.statusEffects.removeEffect(effect.type);
            }
        });

        effects.forEach((effect) => {
            const duration = Number.parseInt(effect.duration, 10);
            const normalizedDuration = Number.isNaN(duration) ? 1 : Math.max(1, duration);
            const existing = target.statusEffects.getEffect(effect.type);
            if (existing) {
                existing.duration = normalizedDuration;
            } else {
                target.statusEffects.addEffect(effect.type, normalizedDuration);
            }
        });
    };

    const applyChanges = () => {
        try {
            player.maxHp = Math.max(1, Number.parseInt(playerMaxHp, 10) || 1);
            player.hp = Math.max(0, Math.min(Number.parseInt(playerHp, 10) || 0, player.maxHp));
            player.maxMp = Math.max(0, Number.parseInt(playerMaxMp, 10) || 0);
            player.mp = Math.max(0, Math.min(Number.parseInt(playerMp, 10) || 0, player.maxMp));

            boss.maxHp = Math.max(1, Number.parseInt(bossMaxHp, 10) || 1);
            boss.hp = Math.max(0, Math.min(Number.parseInt(bossHp, 10) || 0, boss.maxHp));

            syncEffects(player, playerEffects);
            syncEffects(boss, bossEffects);

            const desiredCustomKeys = new Set(customVars.map((customVar) => customVar.key));
            Object.keys(boss.getAllCustomVariables()).forEach((key) => {
                if (!desiredCustomKeys.has(key)) {
                    boss.removeCustomVariable(key);
                }
            });
            customVars.forEach((customVar) => {
                boss.setCustomVariable(customVar.key, parseCustomValue(customVar.value, customVar.originalType));
            });

            ToastUtils.showToast('変更が適用されました！', 'デバッグ変更', ToastType.Success);
            onResolve(true);
        } catch (applyError) {
            console.error('Error applying debug changes:', applyError);
            ToastUtils.showToast('変更の適用中にエラーが発生しました', 'デバッグ変更', ToastType.Error);
        }
    };

    return (
        <Modal show onHide={onHide} size="xl" scrollable contentClassName="bg-dark text-light" dialogClassName="debug-modal-dialog">
            <Modal.Header closeButton closeVariant="white">
                <Modal.Title className="text-warning">{t('debug.title')}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {error && <Alert variant="danger">{error}</Alert>}
                <div className="row">
                    <div className="col-md-6 mb-4">
                        <DebugActorPanel
                            title={t('debug.playerTitle')}
                            hp={playerHp}
                            maxHp={playerMaxHp}
                            mp={playerMp}
                            maxMp={playerMaxMp}
                            effects={playerEffects}
                            statusTypes={statusTypes}
                            newStatus={playerNewStatus}
                            newDuration={playerNewDuration}
                            onHpChange={setPlayerHp}
                            onMaxHpChange={setPlayerMaxHp}
                            onMpChange={setPlayerMp}
                            onMaxMpChange={setPlayerMaxMp}
                            onEffectDurationChange={(type, duration) => updateEffectDuration('player', type, duration)}
                            onEffectRemove={(type) => removeEffect('player', type)}
                            onNewStatusChange={setPlayerNewStatus}
                            onNewDurationChange={setPlayerNewDuration}
                            onAddStatus={() => addEffect('player')}
                        />
                    </div>
                    <div className="col-md-6 mb-4">
                        <DebugActorPanel
                            title={`👹 ${boss.displayName}`}
                            hp={bossHp}
                            maxHp={bossMaxHp}
                            effects={bossEffects}
                            statusTypes={statusTypes}
                            newStatus={bossNewStatus}
                            newDuration={bossNewDuration}
                            onHpChange={setBossHp}
                            onMaxHpChange={setBossMaxHp}
                            onEffectDurationChange={(type, duration) => updateEffectDuration('boss', type, duration)}
                            onEffectRemove={(type) => removeEffect('boss', type)}
                            onNewStatusChange={setBossNewStatus}
                            onNewDurationChange={setBossNewDuration}
                            onAddStatus={() => addEffect('boss')}
                            customVars={customVars}
                            newCustomKey={newCustomKey}
                            newCustomValue={newCustomValue}
                            onCustomVarChange={(key, value) => {
                                setCustomVars((vars) => vars.map((customVar) => customVar.key === key ? { ...customVar, value } : customVar));
                            }}
                            onCustomVarRemove={removeCustomVar}
                            onNewCustomKeyChange={setNewCustomKey}
                            onNewCustomValueChange={setNewCustomValue}
                            onAddCustomVar={addCustomVar}
                        />
                    </div>
                </div>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={() => onResolve(false)}>
                    {t('dialogs.common.cancel')}
                </Button>
                <Button variant="success" onClick={applyChanges}>
                    {t('debug.applyChanges')}
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

function DebugActorPanel({
    title,
    hp,
    maxHp,
    mp,
    maxMp,
    effects,
    statusTypes,
    newStatus,
    newDuration,
    onHpChange,
    onMaxHpChange,
    onMpChange,
    onMaxMpChange,
    onEffectDurationChange,
    onEffectRemove,
    onNewStatusChange,
    onNewDurationChange,
    onAddStatus,
    customVars,
    newCustomKey,
    newCustomValue,
    onCustomVarChange,
    onCustomVarRemove,
    onNewCustomKeyChange,
    onNewCustomValueChange,
    onAddCustomVar,
}: {
    title: string;
    hp: string;
    maxHp: string;
    mp?: string;
    maxMp?: string;
    effects: DebugStatusEffectState[];
    statusTypes: StatusEffectType[];
    newStatus: StatusEffectType;
    newDuration: string;
    onHpChange: (value: string) => void;
    onMaxHpChange: (value: string) => void;
    onMpChange?: (value: string) => void;
    onMaxMpChange?: (value: string) => void;
    onEffectDurationChange: (type: StatusEffectType, duration: string) => void;
    onEffectRemove: (type: StatusEffectType) => void;
    onNewStatusChange: (type: StatusEffectType) => void;
    onNewDurationChange: (duration: string) => void;
    onAddStatus: () => void;
    customVars?: DebugCustomVarState[];
    newCustomKey?: string;
    newCustomValue?: string;
    onCustomVarChange?: (key: string, value: string) => void;
    onCustomVarRemove?: (key: string) => void;
    onNewCustomKeyChange?: (value: string) => void;
    onNewCustomValueChange?: (value: string) => void;
    onAddCustomVar?: () => void;
}): React.ReactElement {
    return (
        <div className="card bg-secondary h-100">
            <div className="card-header">
                <h5 className="mb-0">{title}</h5>
            </div>
            <div className="card-body">
                <div className="row mb-3">
                    <div className="col-6">
                        <Form.Label>{t('common.hpShort')}</Form.Label>
                        <Form.Control type="number" min={0} value={hp} onChange={(event) => onHpChange(event.target.value)} />
                    </div>
                    <div className="col-6">
                        <Form.Label>{t('common.maxHp')}</Form.Label>
                        <Form.Control type="number" min={1} value={maxHp} onChange={(event) => onMaxHpChange(event.target.value)} />
                    </div>
                </div>
                {mp !== undefined && maxMp !== undefined && onMpChange && onMaxMpChange && (
                    <div className="row mb-3">
                        <div className="col-6">
                            <Form.Label>{t('common.mpShort')}</Form.Label>
                            <Form.Control type="number" min={0} value={mp} onChange={(event) => onMpChange(event.target.value)} />
                        </div>
                        <div className="col-6">
                            <Form.Label>{t('common.maxMp')}</Form.Label>
                            <Form.Control type="number" min={0} value={maxMp} onChange={(event) => onMaxMpChange(event.target.value)} />
                        </div>
                    </div>
                )}
                <h6>{t('common.statusEffects')}</h6>
                {effects.length === 0 ? (
                    <div className="text-muted mb-2">{t('playerItems.noItems')}</div>
                ) : (
                    effects.map((effect) => (
                        <div className="debug-status-effect d-flex align-items-center justify-content-between bg-dark p-2 mb-1 rounded" key={effect.type}>
                            <span className="me-2">{effect.name}</span>
                            <div className="d-flex align-items-center gap-2">
                                <Form.Control
                                    size="sm"
                                    type="number"
                                    min={1}
                                    max={99}
                                    value={effect.duration}
                                    style={{ width: '70px' }}
                                    onChange={(event) => onEffectDurationChange(effect.type, event.target.value)}
                                />
                                <Button size="sm" variant="outline-danger" onClick={() => onEffectRemove(effect.type)}>
                                    x
                                </Button>
                            </div>
                        </div>
                    ))
                )}
                <div className="input-group input-group-sm mt-2">
                    <Form.Select value={newStatus} onChange={(event) => onNewStatusChange(event.target.value as StatusEffectType)}>
                        {statusTypes.map((statusType) => (
                            <option key={statusType} value={statusType}>
                                {statusType}
                            </option>
                        ))}
                    </Form.Select>
                    <Form.Control
                        type="number"
                        min={1}
                        max={99}
                        value={newDuration}
                        onChange={(event) => onNewDurationChange(event.target.value)}
                    />
                    <Button variant="outline-light" onClick={onAddStatus}>
                        {t('debug.addStatusEffect')}
                    </Button>
                </div>
                {customVars && onCustomVarChange && onCustomVarRemove && onNewCustomKeyChange && onNewCustomValueChange && onAddCustomVar && (
                    <>
                        <h6 className="mt-4">{t('common.customVariables')}</h6>
                        {customVars.map((customVar) => (
                            <div className="debug-custom-var d-flex align-items-center justify-content-between bg-dark p-2 mb-1 rounded" key={customVar.key}>
                                <span className="me-2 fw-bold">{customVar.key}</span>
                                <div className="d-flex align-items-center gap-2">
                                    <Form.Control
                                        size="sm"
                                        value={customVar.value}
                                        style={{ width: '110px' }}
                                        onChange={(event) => onCustomVarChange(customVar.key, event.target.value)}
                                    />
                                    <Button size="sm" variant="outline-danger" onClick={() => onCustomVarRemove(customVar.key)}>
                                        x
                                    </Button>
                                </div>
                            </div>
                        ))}
                        <div className="input-group input-group-sm mt-2">
                            <Form.Control
                                value={newCustomKey || ''}
                                placeholder={t('dialogs.customVar.keyPlaceholder')}
                                onChange={(event) => onNewCustomKeyChange(event.target.value)}
                            />
                            <Form.Control
                                value={newCustomValue || ''}
                                placeholder={t('dialogs.customVar.valuePlaceholder')}
                                onChange={(event) => onNewCustomValueChange(event.target.value)}
                            />
                            <Button variant="outline-light" onClick={onAddCustomVar}>
                                {t('debug.addCustomVar')}
                            </Button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
