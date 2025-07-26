export class HTMLTemplateLoader {
    private static templateCache: Map<string, string> = new Map();

    public static async loadTemplate(templatePath: string): Promise<string> {
        if (this.templateCache.has(templatePath)) {
            return this.templateCache.get(templatePath)!;
        }

        try {
            const response = await fetch(templatePath);
            if (!response.ok) {
                throw new Error(`Failed to load template: ${templatePath} (${response.status})`);
            }
            
            const templateContent = await response.text();
            this.templateCache.set(templatePath, templateContent);
            return templateContent;
        } catch (error) {
            console.error(`Error loading template ${templatePath}:`, error);
            throw error;
        }
    }

    public static async injectTemplate(templatePath: string, targetSelector: string): Promise<void> {
        const templateContent = await this.loadTemplate(templatePath);
        const targetElement = document.querySelector(targetSelector);
        
        if (!targetElement) {
            throw new Error(`Target element not found: ${targetSelector}`);
        }

        targetElement.innerHTML = templateContent;
    }

    public static async appendTemplate(templatePath: string, targetSelector: string): Promise<void> {
        const templateContent = await this.loadTemplate(templatePath);
        const targetElement = document.querySelector(targetSelector);
        
        if (!targetElement) {
            throw new Error(`Target element not found: ${targetSelector}`);
        }

        targetElement.insertAdjacentHTML('beforeend', templateContent);
    }

    public static async prependTemplate(templatePath: string, targetSelector: string): Promise<void> {
        const templateContent = await this.loadTemplate(templatePath);
        const targetElement = document.querySelector(targetSelector);
        
        if (!targetElement) {
            throw new Error(`Target element not found: ${targetSelector}`);
        }

        targetElement.insertAdjacentHTML('afterbegin', templateContent);
    }

    public static clearCache(): void {
        this.templateCache.clear();
    }

    public static getCacheSize(): number {
        return this.templateCache.size;
    }
}