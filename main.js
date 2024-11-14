"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const obsidian_1 = require("obsidian");
const DEFAULT_SETTINGS = {
    customCodeProperty: 'code'
};
class DefaultCodeLanguagePlugin extends obsidian_1.Plugin {
    constructor(app, manifest) {
        super(app, manifest);
        this.settings = DEFAULT_SETTINGS; // 初始化 settings 属性
    }
    onload() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('Loading default code language plugin');
            // 加载设置
            yield this.loadSettings();
            // 添加设置项
            this.addSettingTab(new SettingTab(this.app, this));
            // 注册事件以监听文件修改
            this.registerEvent(this.app.vault.on('modify', this.handleFileModify.bind(this)));
        });
    }
    loadSettings() {
        return __awaiter(this, void 0, void 0, function* () {
            this.settings = Object.assign({}, DEFAULT_SETTINGS, yield this.loadData());
        });
    }
    saveSettings() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.saveData(this.settings);
        });
    }
    getCustomCodeProperty() {
        return this.settings.customCodeProperty;
    }
    setCustomCodeProperty(value) {
        this.settings.customCodeProperty = value;
        this.saveSettings();
    }
    handleFileModify(file) {
        return __awaiter(this, void 0, void 0, function* () {
            if (file instanceof obsidian_1.TFile && file.extension === 'md') {
                const frontmatter = this.parseFrontMatter(file);
                const defaultCode = (frontmatter === null || frontmatter === void 0 ? void 0 : frontmatter[this.getCustomCodeProperty()]) || ''; // 使用自定义属性名称
                const content = yield this.app.vault.cachedRead(file);
                const newContent = this.updateCodeBlocks(content, defaultCode);
                if (newContent !== content) {
                    yield this.app.vault.modify(file, newContent);
                }
            }
        });
    }
    parseFrontMatter(file) {
        const cache = this.app.metadataCache.getFileCache(file);
        return (cache === null || cache === void 0 ? void 0 : cache.frontmatter) || null;
    }
    updateCodeBlocks(content, defaultCode) {
        // 正则表达式匹配代码块，捕获可选语言和代码内容
        const codeBlockRegex = /```([^\n]*?)\n([\s\S]*?)(?:\n)?```/g;
        return content.replace(codeBlockRegex, (match, language, code, ...rest) => {
            // 去除语言并检查是否为空
            const trimmedLanguage = language.trim();
            if (trimmedLanguage === '') {
                // 如果没有指定语言，使用默认代码
                return `\`\`\`${defaultCode}\n${code}\n\`\`\``;
            }
            // 如果已经指定了语言，保持不变
            return match;
        });
    }
}
exports.default = DefaultCodeLanguagePlugin;
class SettingTab extends obsidian_1.PluginSettingTab {
    constructor(app, plugin) {
        super(app, plugin);
        this.plugin = plugin;
    }
    display() {
        const { containerEl } = this;
        containerEl.empty();
        containerEl.createEl('h2', { text: 'Default Code Language Settings' });
        new obsidian_1.Setting(containerEl)
            .setName('Custom Code Property Name')
            .setDesc('Enter the custom property name for the default code language in the YAML front matter.')
            .addText(text => text
            .setPlaceholder('code')
            .setValue(this.plugin.getCustomCodeProperty())
            .onChange((value) => __awaiter(this, void 0, void 0, function* () {
            this.plugin.setCustomCodeProperty(value);
            new obsidian_1.Notice('Custom code property updated successfully.');
        })));
    }
}
