import { useState, useEffect, ReactElement } from 'react';
import { t } from '../../i18n';
import { getAllChangelogs, isChangelogLoaded } from '../../data/ChangelogLoader';
import { ChangelogMarkdownRenderer } from '../../utils/ChangelogMarkdownRenderer';

type LoadState = 'loading' | 'loaded' | 'error';

export function ChangelogScreen(): ReactElement {
    const [htmlContent, setHtmlContent] = useState<string>('');
    const [loadState, setLoadState] = useState<LoadState>('loading');

    useEffect(() => {
        try {
            if (!isChangelogLoaded()) {
                throw new Error('Changelogs are not loaded yet');
            }

            const allChangelogs = getAllChangelogs();

            if (allChangelogs.length === 0) {
                throw new Error('No changelogs available');
            }

            const markdownContent = allChangelogs
                .map((changelog) => `${changelog.content}\n\n---\n\n`)
                .join('');

            const html = ChangelogMarkdownRenderer.convert(markdownContent);
            setHtmlContent(html);
            setLoadState('loaded');
        } catch (error) {
            console.error('[ChangelogScreen] Failed to load changelog:', error);
            setLoadState('error');
        }
    }, []);

    return (
        <div className="container-fluid py-4">
            <div className="row justify-content-center">
                <div className="col-12 col-lg-10 col-xl-8">
                    <div className="card mb-4 border-0 shadow-sm">
                        <div className="card-body text-center py-4">
                            <h1 className="display-5 mb-3">{t('changelog.title')}</h1>
                        </div>
                    </div>
                    <div className="card border-0 shadow-sm">
                        <div className="card-body">
                            {loadState === 'loading' && (
                                <div className="text-center py-5">
                                    <div
                                        className="spinner-border text-primary"
                                        role="status"
                                        style={{ width: '3rem', height: '3rem' }}
                                    >
                                        <span className="visually-hidden">
                                            {t('changelog.loadingSpinner')}
                                        </span>
                                    </div>
                                    <div className="mt-3">
                                        <h5 className="text-muted">{t('changelog.loadingTitle')}</h5>
                                        <p className="text-muted mb-0">{t('changelog.loadingMessage')}</p>
                                    </div>
                                </div>
                            )}
                            {loadState === 'error' && (
                                <div className="alert alert-warning" role="alert">
                                    <h4 className="alert-heading">📋 更新履歴の読み込みエラー</h4>
                                    <p className="mb-0">
                                        更新履歴ファイルの読み込みに失敗しました。
                                        <br />
                                        ファイルが存在しないか、ネットワークエラーが発生している可能性があります。
                                    </p>
                                </div>
                            )}
                            {loadState === 'loaded' && (
                                <div
                                    className="changelog-container"
                                    dangerouslySetInnerHTML={{ __html: htmlContent }}
                                />
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
