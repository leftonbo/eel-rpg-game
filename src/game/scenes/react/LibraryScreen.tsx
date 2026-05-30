import { useState, useEffect, useCallback, ReactElement } from 'react';
import { useGameContext } from '../../context/GameContext';
import { getAllDocuments, LibraryDocument, getUnreadCountForPlayer } from '../../data/DocumentLoader';
import { BootstrapMarkdownRenderer } from '../../utils/BootstrapMarkdownRenderer';
import { getBossData } from '../../data';
import { t } from '../../i18n';

// ---- 型定義 ----

interface DocumentStatus extends LibraryDocument {
    unlocked: boolean;
    isRead: boolean;
}

// ---- 解禁判定ヘルパー ----

function checkUnlockConditions(
    doc: LibraryDocument,
    explorerLevel: number,
    defeatedBosses: string[],
    lostToBosses: string[]
): boolean {
    const levelOk = !doc.requiredExplorerLevel || explorerLevel >= doc.requiredExplorerLevel;

    const bossDefeatsOk =
        !doc.requiredBossDefeats?.length ||
        doc.requiredBossDefeats.every((id) => defeatedBosses.includes(id));

    const bossLossesOk =
        !doc.requiredBossLosses?.length ||
        doc.requiredBossLosses.every((id) => lostToBosses.includes(id));

    return levelOk && bossDefeatsOk && bossLossesOk;
}

function buildDocumentStatuses(
    game: ReturnType<typeof useGameContext>['game']
): DocumentStatus[] {
    const player = game.getPlayer();
    const explorerLevel = player.getExplorerLevel();
    const defeatedBosses = player.memorialSystem.getVictoriousBossIds();
    const lostToBosses = player.memorialSystem.getDefeatedBossIds();
    const readDocuments = player.getReadDocuments();

    return getAllDocuments().map((doc) => ({
        ...doc,
        unlocked: checkUnlockConditions(doc, explorerLevel, defeatedBosses, lostToBosses),
        isRead: readDocuments.has(doc.id),
    }));
}

function renderBossRequirements(bossIds: string[], type: 'defeat' | 'victory'): string {
    return bossIds
        .map((bossId) => {
            try {
                const bossData = getBossData(bossId);
                return t(`library.requirements.${type}`, { boss: bossData.displayName });
            } catch {
                return t('library.requirements.unknownBoss', {
                    bossId,
                    type: t(`library.requirements.${type}Label`),
                });
            }
        })
        .join(', ');
}

function updateNavLibraryBadge(
    game: ReturnType<typeof useGameContext>['game']
): void {
    const libraryNavBtn = document.getElementById('nav-library');
    if (!libraryNavBtn) return;

    const existingBadge = libraryNavBtn.querySelector('.unread-badge');
    if (existingBadge) existingBadge.remove();

    const player = game.getPlayer();
    const explorerLevel = player.getExplorerLevel();
    const defeatedBosses = player.memorialSystem.getVictoriousBossIds();
    const lostToBosses = player.memorialSystem.getDefeatedBossIds();

    const unreadCount = getUnreadCountForPlayer(
        player,
        explorerLevel,
        defeatedBosses,
        lostToBosses
    );

    if (unreadCount > 0) {
        const badge = document.createElement('span');
        badge.className = 'badge bg-danger unread-badge ms-1';
        badge.textContent = unreadCount.toString();
        libraryNavBtn.appendChild(badge);
    }
}

// ---- DocumentListItem サブコンポーネント ----

interface DocumentListItemProps {
    doc: DocumentStatus;
    isSelected: boolean;
    onSelect: (id: string) => void;
}

function DocumentListItem({ doc, isSelected, onSelect }: DocumentListItemProps): ReactElement {
    if (!doc.unlocked) {
        const requirements: string[] = [];
        if (doc.requiredExplorerLevel) {
            requirements.push(
                t('library.unlockRequirement.explorerLevel', { level: doc.requiredExplorerLevel })
            );
        }
        if (doc.requiredBossDefeats?.length) {
            requirements.push(
                t('library.unlockRequirement.bossDefeats', {
                    bosses: renderBossRequirements(doc.requiredBossDefeats, 'victory'),
                })
            );
        }
        if (doc.requiredBossLosses?.length) {
            requirements.push(
                t('library.unlockRequirement.bossLosses', {
                    bosses: renderBossRequirements(doc.requiredBossLosses, 'defeat'),
                })
            );
        }
        const requirementText = requirements.join(t('library.unlockRequirement.separator'));

        return (
            <button className="btn btn-outline-secondary mb-2 w-100 text-start" disabled>
                <div className="d-flex justify-content-between align-items-center">
                    <span className="text-muted">{t('library.lockedTitle')}</span>
                </div>
                <small className="text-muted d-block mt-1">
                    {t('library.unlockRequirement.lockedPrefix')} {requirementText}
                </small>
            </button>
        );
    }

    const btnClass = `btn w-100 text-start mb-2 ${
        isSelected ? 'btn-info' : 'btn-outline-info'
    }`;

    return (
        <button className={btnClass} onClick={() => onSelect(doc.id)}>
            <div className="d-flex justify-content-between align-items-center">
                <span>{doc.title}</span>
                {!doc.isRead && (
                    <span className="badge bg-danger text-dark ms-2">
                        {t('library.unread')}
                    </span>
                )}
            </div>
        </button>
    );
}

// ---- メインコンポーネント ----

export function LibraryScreen(): ReactElement {
    const { game } = useGameContext();
    const [documents, setDocuments] = useState<DocumentStatus[]>(() =>
        buildDocumentStatuses(game)
    );
    const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
    const [docHtml, setDocHtml] = useState<string>('');

    // マウント時とゲーム変化時にドキュメント一覧を再構築
    useEffect(() => {
        setDocuments(buildDocumentStatuses(game));
        setSelectedDocId(null);
        setDocHtml('');
    }, [game]);

    const handleSelectDocument = useCallback(
        (docId: string) => {
            const doc = documents.find((d) => d.id === docId);
            if (!doc || !doc.unlocked) return;

            // 未読なら既読化
            if (!doc.isRead) {
                const player = game.getPlayer();
                player.markDocumentAsRead(docId);

                // ドキュメント状態を再構築
                const updated = buildDocumentStatuses(game);
                setDocuments(updated);

                // ナビバッジ更新
                updateNavLibraryBadge(game);
            }

            // コンテンツをレンダリング
            const html = BootstrapMarkdownRenderer.convertWithType(doc.content, doc.type);
            setDocHtml(html);
            setSelectedDocId(docId);
        },
        [documents, game]
    );

    return (
        <div className="container-fluid flex-grow-1 d-flex flex-column py-3">
            <div className="row flex-grow-1" style={{ minHeight: 0 }}>
                {/* 左カラム: 文書一覧 */}
                <div className="col-md-4 col-lg-3 d-flex flex-column">
                    <div className="card bg-dark h-100">
                        <div className="card-header">
                            <h6 className="mb-0">{t('library.documentListTitle')}</h6>
                        </div>
                        <div className="card-body overflow-auto p-2">
                            <div id="library-document-list">
                                {documents.map((doc) => (
                                    <DocumentListItem
                                        key={doc.id}
                                        doc={doc}
                                        isSelected={doc.id === selectedDocId}
                                        onSelect={handleSelectDocument}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* 右カラム: 文書コンテンツ */}
                <div className="col-md-8 col-lg-9 d-flex flex-column">
                    <div id="library-document-content" className="h-100">
                        {!selectedDocId ? (
                            <div className="text-center text-muted d-flex align-items-center justify-content-center h-100">
                                <p className="mb-0">{t('library.selectPrompt')}</p>
                            </div>
                        ) : (
                            (() => {
                                const doc = documents.find((d) => d.id === selectedDocId);
                                return (
                                    <div className="card h-100">
                                        <div className="card-header bg-primary text-white">
                                            <h5 className="mb-0">{doc?.title}</h5>
                                        </div>
                                        <div
                                            className="card-body overflow-auto"
                                            style={{ maxHeight: '70vh' }}
                                            dangerouslySetInnerHTML={{ __html: docHtml }}
                                        />
                                    </div>
                                );
                            })()
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
