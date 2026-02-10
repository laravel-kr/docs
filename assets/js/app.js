(function () {
    'use strict';

    const VERSION = '12.x';
    let sideBySide = false;
    let currentPage = '';
    let sidebarData = [];

    // ===== Highlight.js Aliases =====
    hljs.registerAliases('shell', { languageName: 'bash' });
    hljs.registerAliases(['tsx', 'jsx'], { languageName: 'typescript' });
    hljs.registerAliases('vue', { languageName: 'xml' });
    hljs.registerAliases('blade', { languageName: 'xml' });
    hljs.registerAliases('env', { languageName: 'ini' });

    // ===== Marked Configuration =====
    marked.setOptions({
        highlight: function (code, lang) {
            if (lang && hljs.getLanguage(lang)) {
                return hljs.highlight(code, { language: lang }).value;
            }
            return hljs.highlightAuto(code).value;
        },
        breaks: false,
        gfm: true,
    });

    // ===== Init =====
    async function init() {
        await buildSidebar();
        setupRouting();
        setupMobileMenu();
        setupSideBySideToggle();
        navigateFromHash();
    }

    // ===== Sidebar =====
    async function buildSidebar() {
        const res = await fetch('kr/documentation.md');
        const text = await res.text();
        const sidebar = document.getElementById('sidebar-nav');
        sidebarData = parseSidebarMarkdown(text);

        let html = '';
        for (const section of sidebarData) {
            html += `<div class="sidebar-section">`;
            html += `<div class="sidebar-section-title">${section.title}</div>`;
            html += `<ul class="sidebar-links">`;
            for (const link of section.links) {
                html += `<li><a href="#/${link.slug}" data-page="${link.slug}">${link.title}</a></li>`;
            }
            html += `</ul></div>`;
        }
        sidebar.innerHTML = html;

        sidebar.querySelectorAll('a').forEach(a => {
            a.addEventListener('click', function (e) {
                e.preventDefault();
                const page = this.dataset.page;
                window.location.hash = '#/' + page;
                closeMobileSidebar();
            });
        });
    }

    function parseSidebarMarkdown(md) {
        const sections = [];
        let current = null;

        for (const line of md.split('\n')) {
            const sectionMatch = line.match(/^-\s+##\s+(.+)/);
            if (sectionMatch) {
                current = { title: sectionMatch[1], links: [] };
                sections.push(current);
                continue;
            }

            const linkMatch = line.match(/^\s+-\s+\[(.+?)\]\(\/docs\/\{\{version\}\}\/(.+?)\)/);
            if (linkMatch && current) {
                current.links.push({ title: linkMatch[1], slug: linkMatch[2] });
            }
        }
        return sections;
    }

    // ===== Routing =====
    function setupRouting() {
        window.addEventListener('hashchange', navigateFromHash);
    }

    function navigateFromHash() {
        const hash = window.location.hash;
        let page = 'installation';
        let anchor = '';

        if (hash.startsWith('#/')) {
            const parts = hash.substring(2).split('#');
            page = parts[0] || 'installation';
            anchor = parts[1] || '';
        }

        if (page !== currentPage) {
            currentPage = page;
            loadPage(page, anchor);
            updateActiveLink(page);
        } else if (anchor) {
            scrollToAnchor(anchor);
        }
    }

    function updateActiveLink(page) {
        document.querySelectorAll('.sidebar-links a').forEach(a => {
            a.classList.toggle('active', a.dataset.page === page);
        });
    }

    // ===== Page Loading =====
    async function loadPage(page, anchor) {
        const wrapper = document.getElementById('content-wrapper');

        if (sideBySide) {
            wrapper.className = 'content-wrapper side-by-side';
            wrapper.innerHTML = `
                <div class="mobile-tab-bar">
                    <button class="mobile-tab active" data-lang="kr">한국어</button>
                    <button class="mobile-tab" data-lang="en">English</button>
                </div>
                <div class="content-panel" id="panel-kr">
                    <span class="panel-label kr">한국어</span>
                    <div class="content loading">문서를 불러오는 중...</div>
                </div>
                <div class="content-panel" id="panel-en">
                    <span class="panel-label en">English</span>
                    <div class="content loading">Loading...</div>
                </div>`;

            setupMobileTabs();
            setupSyncScroll();

            const [krHtml, enHtml] = await Promise.all([
                fetchAndRender('kr/' + page + '.md'),
                fetchAndRender(page + '.md'),
            ]);

            document.querySelector('#panel-kr .content').innerHTML = krHtml;
            document.querySelector('#panel-kr .content').classList.remove('loading');
            document.querySelector('#panel-en .content').innerHTML = enHtml;
            document.querySelector('#panel-en .content').classList.remove('loading');

            postProcess(document.querySelector('#panel-kr .content'));
            postProcess(document.querySelector('#panel-en .content'));
        } else {
            wrapper.className = 'content-wrapper';
            wrapper.innerHTML = `<div class="content loading">문서를 불러오는 중...</div>`;

            const html = await fetchAndRender('kr/' + page + '.md');
            const contentEl = document.querySelector('.content');
            contentEl.innerHTML = html;
            contentEl.classList.remove('loading');
            postProcess(contentEl);
        }

        if (anchor) {
            setTimeout(() => scrollToAnchor(anchor), 100);
        } else {
            const panels = wrapper.querySelectorAll('.content-panel');
            if (panels.length) {
                panels.forEach(p => p.scrollTop = 0);
            } else {
                window.scrollTo(0, 0);
            }
        }
    }

    async function fetchAndRender(path) {
        try {
            const res = await fetch(path);
            if (!res.ok) throw new Error(res.status);
            let md = await res.text();
            return renderMarkdown(md);
        } catch (e) {
            return `<h1>문서를 찾을 수 없습니다</h1><p>"${path}" 파일을 불러올 수 없습니다.</p>`;
        }
    }

    // ===== Markdown Rendering =====
    function renderMarkdown(md) {
        // Handle tab-based code blocks: ```php tab=React
        md = processCodeTabs(md);

        // Handle [!NOTE] and [!WARNING] callouts
        md = md.replace(/>\s*\[!NOTE\]\n/g, '> **Note** \n');
        md = md.replace(/>\s*\[!WARNING\]\n/g, '> **Warning** \n');

        let html = marked.parse(md);

        // Convert internal links: /docs/{{version}}/page → #/page
        html = html.replace(/href="\/docs\/\{\{version\}\}\/([^"#]+)(#[^"]*)?"/g, (m, page, anchor) => {
            return `href="#/${page}${anchor || ''}"`;
        });

        // Process Note/Warning blockquotes
        html = html.replace(/<blockquote>\s*<p><strong>Note<\/strong>/g, '<blockquote class="note"><p>');
        html = html.replace(/<blockquote>\s*<p><strong>Warning<\/strong>/g, '<blockquote class="warning"><p>');

        return html;
    }

    function processCodeTabs(md) {
        const tabBlockRegex = /(```(\w+)\s+tab=(\S+)\n([\s\S]*?)```\n?)+/g;
        const singleTabRegex = /```(\w+)\s+tab=(\S+)\n([\s\S]*?)```/g;

        return md.replace(tabBlockRegex, (block) => {
            const tabs = [];
            let match;
            const regex = /```(\w+)\s+tab=(\S+)\n([\s\S]*?)```/g;
            while ((match = regex.exec(block)) !== null) {
                tabs.push({ lang: match[1], name: match[2], code: match[3].trim() });
            }

            if (tabs.length <= 1) return block;

            const id = 'tab-' + Math.random().toString(36).substring(2, 8);
            let html = `<div class="code-tabs">`;
            tabs.forEach((t, i) => {
                html += `<button class="code-tab${i === 0 ? ' active' : ''}" data-tab="${id}-${i}">${t.name}</button>`;
            });
            html += `</div>`;
            tabs.forEach((t, i) => {
                const highlighted = t.lang && hljs.getLanguage(t.lang)
                    ? hljs.highlight(t.code, { language: t.lang }).value
                    : hljs.highlightAuto(t.code).value;
                html += `<div class="tab-content${i === 0 ? ' active' : ''}" id="${id}-${i}"><pre><code class="hljs language-${t.lang}">${highlighted}</code></pre></div>`;
            });

            return html;
        });
    }

    // ===== Post-processing =====
    function postProcess(el) {
        // Tab click handlers
        el.querySelectorAll('.code-tab').forEach(btn => {
            btn.addEventListener('click', function () {
                const tabId = this.dataset.tab;
                const parent = this.closest('.code-tabs').parentElement || this.parentElement.parentElement;

                this.parentElement.querySelectorAll('.code-tab').forEach(b => b.classList.remove('active'));
                this.classList.add('active');

                // Find all tab-content siblings
                let sibling = this.parentElement.nextElementSibling;
                while (sibling && sibling.classList.contains('tab-content')) {
                    sibling.classList.toggle('active', sibling.id === tabId);
                    sibling = sibling.nextElementSibling;
                }
            });
        });

        // Highlight any unhighlighted code blocks
        el.querySelectorAll('pre code:not(.hljs)').forEach(block => {
            hljs.highlightElement(block);
        });

        // Internal link handling
        el.querySelectorAll('a[href^="#/"]').forEach(a => {
            a.addEventListener('click', function (e) {
                e.preventDefault();
                window.location.hash = this.getAttribute('href');
            });
        });
    }

    // ===== Side-by-Side =====
    function setupSideBySideToggle() {
        const btn = document.getElementById('btn-side-by-side');
        btn.addEventListener('click', () => {
            sideBySide = !sideBySide;
            btn.classList.toggle('active', sideBySide);
            btn.querySelector('.label').textContent = sideBySide ? '번역만 보기' : '원본 비교';
            loadPage(currentPage, '');
        });
    }

    function setupSyncScroll() {
        setTimeout(() => {
            const kr = document.getElementById('panel-kr');
            const en = document.getElementById('panel-en');
            if (!kr || !en) return;

            let syncing = false;
            function syncScroll(source, target) {
                if (syncing) return;
                syncing = true;
                const ratio = source.scrollTop / (source.scrollHeight - source.clientHeight || 1);
                target.scrollTop = ratio * (target.scrollHeight - target.clientHeight || 1);
                syncing = false;
            }

            kr.addEventListener('scroll', () => syncScroll(kr, en));
            en.addEventListener('scroll', () => syncScroll(en, kr));
        }, 200);
    }

    function setupMobileTabs() {
        setTimeout(() => {
            document.querySelectorAll('.mobile-tab').forEach(tab => {
                tab.addEventListener('click', function () {
                    const lang = this.dataset.lang;
                    document.querySelectorAll('.mobile-tab').forEach(t => t.classList.remove('active'));
                    this.classList.add('active');

                    const kr = document.getElementById('panel-kr');
                    const en = document.getElementById('panel-en');
                    if (lang === 'kr') {
                        kr.style.display = 'block';
                        en.style.display = 'none';
                    } else {
                        kr.style.display = 'none';
                        en.style.display = 'block';
                    }
                });
            });
        }, 50);
    }

    // ===== Mobile Menu =====
    function setupMobileMenu() {
        const btn = document.getElementById('btn-menu');
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('sidebar-overlay');

        btn.addEventListener('click', () => {
            sidebar.classList.toggle('open');
            overlay.classList.toggle('active');
        });
        overlay.addEventListener('click', closeMobileSidebar);
    }

    function closeMobileSidebar() {
        document.getElementById('sidebar').classList.remove('open');
        document.getElementById('sidebar-overlay').classList.remove('active');
    }

    // ===== Scroll to Anchor =====
    function scrollToAnchor(anchor) {
        const target = document.querySelector(`a[name="${anchor}"]`) ||
                       document.getElementById(anchor);
        if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }

    // ===== Start =====
    document.addEventListener('DOMContentLoaded', init);
})();
