// Run against a local dev/preview server. PLAYWRIGHT_MODULE can point to an existing Playwright install.
import assert from 'node:assert/strict';
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ locale: 'ja-JP', viewport: { width: 1280, height: 900 } });
// Fix the random sequence only in this isolated test context.
await context.addInitScript(() => {
    let seed = 48;
    Math.random = () => {
        seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
        return seed / 4294967296;
    };
});
const page = await context.newPage();
const errors = [];
page.on('pageerror', error => errors.push(error.message));
const chooseBoss = async () => {
    await page.locator('[data-boss="dark-ghost"]').getByRole('button', { name: '選択' }).click();
    await page.getByRole('button', { name: '戦闘開始！' }).click();
    await page.locator('.modal').waitFor({ state: 'hidden' });
};
const readSave = () => page.evaluate(() => JSON.parse(localStorage.getItem('eelfood_player_data')));
try {
    await page.goto(process.env.GAME_URL || 'http://127.0.0.1:4188/');
    await page.getByRole('button', { name: '🎮 ゲームスタート' }).click();
    await chooseBoss();
    await page.locator('#attack-btn').click();
    assert(await page.locator('#attack-btn').isDisabled(), 'Enemy turn blocks native button input');
    assert.match(await page.locator('#battle-turn-status').innerText(), /待っています/);
    await page.locator('#back-to-select-btn').click();
    assert.match(await page.locator('#battle-result-title').innerText(), /戦闘中断/);
    const earned = await readSave();
    await page.locator('#battle-result-retry-btn').click();
    const firstRound = await page.locator('#battle-log').textContent();
    await page.waitForTimeout(1200); // Beyond the old battle's scheduled enemy turn.
    assert.equal(await page.locator('#battle-log').textContent(), firstRound, 'Old battle cannot act after retry');
    assert.deepEqual(await readSave(), earned, 'Retry must not award the same result twice');
    assert.equal(await page.locator('#player-hp').innerText(), await page.locator('#player-max-hp').innerText());

    // Real input through a fresh battle, including the existing post-defeat scene.
    for (let turn = 0; turn < 60 && !await page.locator('#battle-end-btn').isVisible(); turn++) {
        const attack = page.locator('#attack-btn');
        if (await attack.isVisible()) await attack.click();
        else await page.locator('#give-up-btn').click();
        await page.waitForFunction(() =>
            !document.getElementById('battle-turn-status').textContent.includes('待っています'));
    }
    assert(await page.locator('#battle-end-btn').isVisible(), 'Defeat offers results');
    assert(await page.locator('#give-up-btn').isVisible(), 'Post-defeat play remains available');
    await page.locator('#give-up-btn').click();
    await page.waitForFunction(() =>
        document.getElementById('battle-turn-status').textContent.includes('敗北しました'));
    await page.locator('#battle-end-btn').click();
    assert.match(await page.locator('#battle-result-title').innerText(), /敗北/);

    for (const size of [{ width: 1280, height: 900 }, { width: 390, height: 844 }, { width: 320, height: 568 }]) {
        await page.setViewportSize(size);
        for (const id of ['battle-result-equip-btn', 'battle-result-retry-btn', 'battle-result-continue-btn']) {
            const box = await page.locator('#' + id).boundingBox();
            assert(box && box.x >= 0 && box.y >= 0 && box.x + box.width <= size.width &&
                box.y + box.height <= size.height, id + ' stays in the viewport');
        }
    }
    await page.locator('#battle-result-equip-btn').click();
    assert.match(await page.locator('#battle-result-equipment-status').innerText(), /変更しました/);
    const equipped = await readSave();
    await page.locator('#battle-result-retry-btn').click();
    assert(Number(await page.locator('#player-max-hp').innerText()) > 100, 'New armor improves the next battle');
    assert.deepEqual(await readSave(), equipped, 'Equipment and progress survive retry');

    // A no-action retreat returns to selection; saved gear survives a reload.
    await page.locator('#back-to-select-btn').click();
    await page.reload();
    await page.getByRole('button', { name: '🎮 ゲームスタート' }).click();
    await chooseBoss();
    assert(Number(await page.locator('#player-max-hp').innerText()) > 100);
    assert.equal(await page.locator('#player-hp').innerText(), await page.locator('#player-max-hp').innerText());
    assert.deepEqual(errors, [], 'No browser runtime errors');
    console.log('PASS: turn input, cancelled enemy turn, defeat/continued scene, responsive results, equipment, retry and save reload');
} finally {
    await browser.close();
}
