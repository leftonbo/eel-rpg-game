import React, { useEffect, useMemo, useState } from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import Nav from 'react-bootstrap/Nav';
import { getAllCategories, getIconsByCategory } from '../../data/PlayerIcons';
import { DEFAULT_PLAYER_ICON, DEFAULT_PLAYER_NAME, Player } from '../../entities/Player';
import { t } from '../../i18n';
import { ToastType, ToastUtils } from '../../utils/ToastUtils';

interface PlayerInfoEditModalProps {
    show: boolean;
    player: Player;
    onHide: () => void;
    onSaved: () => void;
}

export function PlayerInfoEditModal({
    show,
    player,
    onHide,
    onSaved,
}: PlayerInfoEditModalProps): React.ReactElement {
    const categories = useMemo(() => getAllCategories(), []);
    const [name, setName] = useState(player.name);
    const [selectedIcon, setSelectedIcon] = useState(player.icon);
    const [activeCategory, setActiveCategory] = useState(categories[0] ?? '動物');

    useEffect(() => {
        if (!show) return;
        setName(player.name);
        setSelectedIcon(player.icon);
        setActiveCategory(categories[0] ?? '動物');
    }, [categories, player.icon, player.name, show]);

    const save = () => {
        const newName = name.trim();

        if (!newName) {
            ToastUtils.showToast('名前を入力してください', '名前変更エラー', ToastType.Error);
            return;
        }

        if (newName.length > 32) {
            ToastUtils.showToast('名前は32文字以内で入力してください', '名前変更エラー', ToastType.Error);
            return;
        }

        const oldName = player.name;
        const oldIcon = player.icon;
        player.updatePlayerInfo(newName, selectedIcon);

        const changedItems = [];
        if (oldName !== newName) changedItems.push('名前');
        if (oldIcon !== selectedIcon) changedItems.push('アイコン');

        ToastUtils.showToast(
            changedItems.length > 0 ? `${changedItems.join('と')}を変更しました` : '変更はありませんでした',
            'プレイヤー情報更新',
            ToastType.Success
        );

        onSaved();
        onHide();
    };

    const reset = () => {
        setName(DEFAULT_PLAYER_NAME);
        setSelectedIcon(DEFAULT_PLAYER_ICON);
        ToastUtils.showToast('プレイヤー情報を初期状態にリセットしました', 'プレイヤー情報リセット', ToastType.Info);
    };

    return (
        <Modal show={show} onHide={onHide} centered contentClassName="bg-dark text-light">
            <Modal.Header closeButton closeVariant="white">
                <Modal.Title>{t('playerInfoEdit.title')}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form.Group className="mb-3" controlId="player-name-input-react">
                    <Form.Label>{t('playerInfoEdit.nameLabel')}</Form.Label>
                    <Form.Control
                        autoFocus
                        maxLength={32}
                        value={name}
                        placeholder={t('playerInfoEdit.namePlaceholder')}
                        onChange={(event) => setName(event.target.value)}
                    />
                    <Form.Text>
                        {t('playerInfoEdit.currentName')}: {player.name}
                    </Form.Text>
                </Form.Group>

                <Form.Label>{t('playerInfoEdit.iconLabel')}</Form.Label>
                <div className="form-text mb-2">
                    {t('playerInfoEdit.currentIcon')}: {player.icon}
                </div>
                <Nav variant="pills" className="nav-sm mb-3">
                    {categories.map((category) => (
                        <Nav.Item key={category}>
                            <Nav.Link
                                as="button"
                                type="button"
                                active={category === activeCategory}
                                onClick={() => setActiveCategory(category)}
                            >
                                {t(`playerInfoEdit.iconCategories.${getCategoryTranslationKey(category)}`, { defaultValue: category })}
                            </Nav.Link>
                        </Nav.Item>
                    ))}
                </Nav>
                <div className="border rounded p-2 icon-selection-grid">
                    {getIconsByCategory(activeCategory).map((icon) => (
                        <Button
                            key={icon.id}
                            type="button"
                            variant="outline-secondary"
                            active={selectedIcon === icon.emoji}
                            className="m-1 player-icon-button"
                            title={icon.name}
                            onClick={() => setSelectedIcon(icon.emoji)}
                        >
                            {icon.emoji}
                        </Button>
                    ))}
                </div>
                <div className="form-text">
                    {t('playerInfoEdit.selectedIcon')}: {selectedIcon}
                </div>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onHide}>
                    {t('dialogs.common.cancel')}
                </Button>
                <Button variant="warning" onClick={reset}>
                    {t('playerInfoEdit.reset')}
                </Button>
                <Button variant="primary" onClick={save}>
                    {t('playerInfoEdit.save')}
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

function getCategoryTranslationKey(category: string): string {
    switch (category) {
        case '動物':
            return 'animal';
        case 'ファンタジー':
            return 'fantasy';
        case '自然':
            return 'nature';
        case '武器':
            return 'weapon';
        case 'エレメント':
            return 'element';
        default:
            return category;
    }
}
