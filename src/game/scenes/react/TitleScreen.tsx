import React, { useEffect, useRef } from 'react';
import Button from 'react-bootstrap/Button';
import { useGameContext } from '../../context/GameContext';
import { applyTranslations } from '../../i18n/dom';

export function TitleScreen(): React.ReactElement {
    const { game } = useGameContext();
    const ref = useRef<HTMLDivElement>(null);

    // data-i18n 属性を既存の翻訳システムで処理
    useEffect(() => {
        if (ref.current) applyTranslations(ref.current);
    }, []);

    const handleStart = () => {
        game.startGame();
    };

    return (
        <div
            ref={ref}
            className="scene vh-100 d-flex align-items-center justify-content-center"
        >
            <div className="text-center">
                <h1 className="display-1 mb-4 game-title">🐍 ElnalFTE</h1>

                <div className="alert alert-warning mx-auto max-width-600">
                    <h5 data-i18n="titleScreen.warningTitle">⚠️ 注意事項</h5>
                    <ul className="mb-0 text-start">
                        <li data-i18n="titleScreen.warningItemPredation">
                            捕食や丸呑み表現が含まれます
                        </li>
                    </ul>
                </div>

                <Button
                    id="start-button"
                    variant="primary"
                    size="lg"
                    className="mt-4"
                    onClick={handleStart}
                >
                    <span data-i18n="titleScreen.startButton">🎮 ゲームスタート</span>
                </Button>
            </div>
        </div>
    );
}
