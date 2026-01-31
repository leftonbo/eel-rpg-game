import { t } from './index';

const ATTRIBUTE_PREFIX = 'data-i18n-attr';

export function applyTranslations(root: ParentNode = document): void {
    const elements = root.querySelectorAll<HTMLElement>('[data-i18n]');

    elements.forEach(element => {
        const key = element.dataset.i18n;
        if (!key) return;

        const attr = element.getAttribute(ATTRIBUTE_PREFIX);
        const translation = t(key);

        if (attr) {
            element.setAttribute(attr, translation);
        } else {
            element.textContent = translation;
        }
    });
}
