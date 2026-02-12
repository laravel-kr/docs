(function () {
    'use strict';

    const VERSIONS_WITH_KOREAN = ['12.x', '11.x', '10.x', '9.x', '8.x', '7.x', '6.x', '5.8', '5.7', '5.6', '5.5', '5.4', '5.3', '5.2', '5.1', '5.0'];
    let currentVersion = localStorage.getItem('doc-version') || '12.x';
    let sideBySide = false;
    let currentPage = '';
    let sidebarData = [];
    let searchIndex = null;
    let searchLoading = false;

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

    // ===== Helpers =====
    function hasKorean() {
        return VERSIONS_WITH_KOREAN.includes(currentVersion);
    }

    function versionPath(file) {
        return currentVersion + '/' + file;
    }

    // ===== Init =====
    async function init() {
        setupVersionSelect();
        await buildSidebar();
        setupRouting();
        setupMobileMenu();
        setupTocToggle();
        setupSideBySideToggle();
        setupSearch();
        navigateFromHash();
    }

    // ===== Version Select =====
    function setupVersionSelect() {
        const select = document.getElementById('version-select');
        select.value = currentVersion;

        select.addEventListener('change', async () => {
            currentVersion = select.value;
            localStorage.setItem('doc-version', currentVersion);

            // Reset search index for new version
            searchIndex = null;

            // Update side-by-side state
            updateSideBySideVisibility();

            // Rebuild sidebar and reload page
            await buildSidebar();
            currentPage = ''; // Force reload
            navigateFromHash();
        });

        updateSideBySideVisibility();
    }

    function updateSideBySideVisibility() {
        const btn = document.getElementById('btn-side-by-side');
        if (hasKorean()) {
            btn.style.display = '';
        } else {
            btn.style.display = 'none';
            if (sideBySide) {
                sideBySide = false;
                btn.classList.remove('active');
                btn.querySelector('.label').textContent = '원본 비교';
            }
        }
    }

    // ===== Sidebar =====
    async function buildSidebar() {
        const docPath = hasKorean()
            ? versionPath('kr/documentation.md')
            : versionPath('documentation.md');

        const res = await fetch(docPath);
        const text = await res.text();
        const sidebar = document.getElementById('sidebar-nav');
        sidebarData = parseSidebarMarkdown(text);

        let html = '';
        for (const section of sidebarData) {
            html += `<div class="sidebar-section">`;
            if (section.externalLink) {
                html += `<a class="sidebar-section-title sidebar-external-link" href="${section.externalLink}" target="_blank" rel="noopener">${section.title}</a>`;
            } else {
                html += `<div class="sidebar-section-title">${section.title}</div>`;
            }
            html += `<ul class="sidebar-links">`;
            for (const link of section.links) {
                html += `<li><a href="#/${link.slug}" data-page="${link.slug}">${link.title}</a></li>`;
            }
            html += `</ul></div>`;
        }
        sidebar.innerHTML = html;

        sidebar.querySelectorAll('a[data-page]').forEach(a => {
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
            const sectionMatch = line.match(/^-\s+(?:##\s+)?(.+)/);
            if (sectionMatch) {
                const titleText = sectionMatch[1];
                const extLinkMatch = titleText.match(/^\[(.+?)\]\((https?:\/\/.+?)\)$/);
                if (extLinkMatch) {
                    current = { title: extLinkMatch[1], links: [], externalLink: extLinkMatch[2] };
                } else {
                    current = { title: titleText, links: [] };
                }
                sections.push(current);
                continue;
            }

            const linkMatch = line.match(/^\s+-\s+\[(.+?)\]\(\/docs\/(?:\{\{version\}\}|[^/]+)\/(.+?)\)/);
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

        if (sideBySide && hasKorean()) {
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
                fetchAndRender(versionPath('kr/' + page + '.md')),
                fetchAndRender(versionPath(page + '.md')),
            ]);

            if (krHtml === null && page !== 'installation') {
                window.location.hash = '#/installation';
                return;
            }

            document.querySelector('#panel-kr .content').innerHTML = krHtml || '';
            document.querySelector('#panel-kr .content').classList.remove('loading');
            document.querySelector('#panel-en .content').innerHTML = enHtml || '';
            document.querySelector('#panel-en .content').classList.remove('loading');

            postProcess(document.querySelector('#panel-kr .content'));
            postProcess(document.querySelector('#panel-en .content'));
        } else {
            wrapper.className = 'content-wrapper';
            wrapper.innerHTML = `<div class="content loading">문서를 불러오는 중...</div>`;

            const mdPath = hasKorean()
                ? versionPath('kr/' + page + '.md')
                : versionPath(page + '.md');

            const html = await fetchAndRender(mdPath);

            if (html === null && page !== 'installation') {
                window.location.hash = '#/installation';
                return;
            }

            const contentEl = document.querySelector('.content');
            contentEl.innerHTML = html || '';
            contentEl.classList.remove('loading');
            postProcess(contentEl);
            buildToc(contentEl);
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
        const res = await fetch(path);
        if (!res.ok) return null;
        let md = await res.text();
        return renderMarkdown(md);
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

        // In-page anchor links (document top TOC) — scroll instead of changing hash
        el.querySelectorAll('a[href^="#"]:not([href^="#/"])').forEach(a => {
            a.addEventListener('click', function (e) {
                e.preventDefault();
                const anchor = this.getAttribute('href').substring(1);
                scrollToAnchor(anchor);
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

    let syncScrollPaused = false;

    function setupSyncScroll() {
        setTimeout(() => {
            const kr = document.getElementById('panel-kr');
            const en = document.getElementById('panel-en');
            if (!kr || !en) return;

            let syncing = false;
            function syncScroll(source, target) {
                if (syncing || syncScrollPaused) return;
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

    // ===== Sidebar Toggle =====
    function setupMobileMenu() {
        const btn = document.getElementById('btn-menu');
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('sidebar-overlay');

        btn.addEventListener('click', () => {
            const isMobile = window.innerWidth <= 900;
            if (isMobile) {
                sidebar.classList.toggle('open');
                overlay.classList.toggle('active');
            } else {
                document.body.classList.toggle('sidebar-collapsed');
            }
        });
        overlay.addEventListener('click', closeMobileSidebar);
    }

    function closeMobileSidebar() {
        document.getElementById('sidebar').classList.remove('open');
        document.getElementById('sidebar-overlay').classList.remove('active');
    }

    // ===== TOC Toggle =====
    function setupTocToggle() {
        const btn = document.getElementById('btn-toc');
        const toc = document.getElementById('toc-sidebar');

        btn.addEventListener('click', () => {
            document.body.classList.toggle('toc-open');
        });

        // Click outside to close (only when unpinned)
        document.addEventListener('click', (e) => {
            if (!document.body.classList.contains('toc-open')) return;
            if (document.body.classList.contains('toc-pinned')) return;
            if (toc.contains(e.target) || btn.contains(e.target)) return;
            document.body.classList.remove('toc-open');
        });

        // Restore pin state
        const savedPin = localStorage.getItem('toc-pinned');
        if (savedPin === 'true') {
            document.body.classList.add('toc-pinned');
        } else if (savedPin === null && window.innerWidth >= 1400) {
            // Default pinned on wide screens
            document.body.classList.add('toc-pinned');
        }
    }

    function closeMobileToc() {
        document.body.classList.remove('toc-open');
    }

    function toggleTocPin() {
        document.body.classList.toggle('toc-pinned');
        const pinned = document.body.classList.contains('toc-pinned');
        localStorage.setItem('toc-pinned', pinned);
        // Update button visual
        const pinBtn = document.getElementById('btn-pin');
        if (pinBtn) {
            pinBtn.classList.toggle('active', pinned);
            pinBtn.querySelector('svg').setAttribute('fill', pinned ? 'currentColor' : 'none');
        }
    }

    // ===== Search =====
    function setupSearch() {
        const btn = document.getElementById('btn-search');
        const overlay = document.getElementById('search-overlay');
        const input = document.getElementById('search-input');
        const results = document.getElementById('search-results');

        btn.addEventListener('click', openSearch);

        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) closeSearch();
        });

        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                openSearch();
            }
            if (e.key === '/' && !isInputFocused()) {
                e.preventDefault();
                openSearch();
            }
            if (e.key === 'Escape') {
                closeSearch();
            }
        });

        let debounceTimer;
        input.addEventListener('input', () => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => performSearch(input.value), 150);
        });

        input.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                moveSelection(1);
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                moveSelection(-1);
            } else if (e.key === 'Enter') {
                e.preventDefault();
                const selected = results.querySelector('.search-result-item.selected');
                if (selected) selected.click();
            }
        });
    }

    function isInputFocused() {
        const el = document.activeElement;
        return el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable);
    }

    async function openSearch() {
        const overlay = document.getElementById('search-overlay');
        const input = document.getElementById('search-input');
        overlay.classList.add('active');
        input.value = '';
        input.focus();
        document.getElementById('search-results').innerHTML =
            '<div class="search-empty">검색어를 입력하세요</div>';

        if (!searchIndex && !searchLoading) {
            searchLoading = true;
            try {
                const res = await fetch('search-index-' + currentVersion + '.json');
                searchIndex = await res.json();
            } catch (e) {
                console.error('Failed to load search index:', e);
            }
            searchLoading = false;
        }
    }

    function closeSearch() {
        document.getElementById('search-overlay').classList.remove('active');
    }

    function performSearch(query) {
        const results = document.getElementById('search-results');
        query = query.trim().toLowerCase();

        if (!query || query.length < 2) {
            results.innerHTML = '<div class="search-empty">검색어를 입력하세요</div>';
            return;
        }

        if (!searchIndex) {
            results.innerHTML = '<div class="search-empty">검색 인덱스를 불러오는 중...</div>';
            return;
        }

        const scored = [];
        for (const entry of searchIndex) {
            let score = 0;
            const headingLower = (entry.h || '').toLowerCase();
            const bodyLower = (entry.b || '').toLowerCase();
            const titleLower = (entry.t || '').toLowerCase();

            if (headingLower.includes(query)) score += 10;
            if (titleLower.includes(query)) score += 5;
            if (bodyLower.includes(query)) score += 3;
            if (headingLower.startsWith(query)) score += 5;

            if (score > 0) {
                scored.push({ entry, score });
            }
        }

        scored.sort((a, b) => b.score - a.score);
        const top = scored.slice(0, 20);

        if (top.length === 0) {
            results.innerHTML = '<div class="search-empty">"' + escapeHtml(query) + '"에 대한 검색 결과가 없습니다</div>';
            return;
        }

        results.innerHTML = top.map((item, i) => {
            const entry = item.entry;
            const snippet = highlightMatch(entry.b || '', query, 120);
            const heading = highlightMatch(entry.h || entry.t, query);
            return '<a class="search-result-item' + (i === 0 ? ' selected' : '') + '" ' +
                'href="#/' + entry.p + (entry.a ? '#' + entry.a : '') + '" ' +
                'data-page="' + entry.p + '">' +
                '<div class="search-result-title">' + heading + '</div>' +
                '<div class="search-result-page">' + escapeHtml(entry.t) + '</div>' +
                (snippet ? '<div class="search-result-snippet">' + snippet + '</div>' : '') +
                '</a>';
        }).join('');

        results.querySelectorAll('.search-result-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const href = item.getAttribute('href');
                closeSearch();
                const page = item.dataset.page;
                if (page === currentPage) {
                    const parts = href.split('#');
                    const anchor = parts.length > 2 ? parts[2] : '';
                    if (anchor) setTimeout(() => scrollToAnchor(anchor), 100);
                } else {
                    window.location.hash = href;
                }
            });
        });
    }

    function moveSelection(direction) {
        const results = document.getElementById('search-results');
        const items = results.querySelectorAll('.search-result-item');
        if (!items.length) return;

        let currentIdx = -1;
        items.forEach((item, i) => {
            if (item.classList.contains('selected')) currentIdx = i;
        });

        const nextIdx = Math.max(0, Math.min(items.length - 1, currentIdx + direction));
        items.forEach(item => item.classList.remove('selected'));
        items[nextIdx].classList.add('selected');
        items[nextIdx].scrollIntoView({ block: 'nearest' });
    }

    function highlightMatch(text, query, maxLen) {
        if (!text) return '';

        if (maxLen) {
            const idx = text.toLowerCase().indexOf(query.toLowerCase());
            if (idx > -1 && text.length > maxLen) {
                const start = Math.max(0, idx - Math.floor(maxLen / 3));
                const end = Math.min(text.length, start + maxLen);
                text = (start > 0 ? '...' : '') + text.substring(start, end) + (end < text.length ? '...' : '');
            } else {
                text = text.substring(0, maxLen) + (text.length > maxLen ? '...' : '');
            }
        }

        text = escapeHtml(text);
        const escaped = escapeRegex(escapeHtml(query));
        const regex = new RegExp('(' + escaped + ')', 'gi');
        return text.replace(regex, '<mark>$1</mark>');
    }

    function escapeHtml(str) {
        return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    function escapeRegex(str) {
        return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    // ===== TOC Sidebar =====
    let scrollSpyCleanup = null;

    function buildToc(contentEl) {
        const toc = document.getElementById('toc-sidebar');
        if (!toc) return;

        const headings = contentEl.querySelectorAll('h2, h3');
        const items = [];

        headings.forEach(h => {
            let anchor = '';
            let prev = h.previousElementSibling;
            if (prev) {
                const a = prev.querySelector ? prev.querySelector('a[name]') : null;
                if (a) anchor = a.getAttribute('name');
            }
            if (!anchor) return;

            items.push({
                level: h.tagName === 'H2' ? 2 : 3,
                text: h.textContent.trim(),
                anchor: anchor
            });
        });

        if (items.length === 0) {
            toc.innerHTML = '';
            return;
        }

        const isPinned = document.body.classList.contains('toc-pinned');
        let html = `<div class="toc-header"><button class="btn-pin${isPinned ? ' active' : ''}" id="btn-pin" title="고정"><svg width="14" height="14" viewBox="0 0 24 24" fill="${isPinned ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="17" x2="12" y2="22"/><path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z"/></svg></button></div>`;
        html += '<ul>';
        items.forEach(item => {
            const cls = item.level === 3 ? ' class="toc-h3"' : '';
            html += `<li${cls}><a href="#/${currentPage}#${item.anchor}" data-anchor="${item.anchor}">${item.text}</a></li>`;
        });
        html += '</ul>';
        toc.innerHTML = html;

        document.getElementById('btn-pin').addEventListener('click', toggleTocPin);

        toc.querySelectorAll('a').forEach(a => {
            a.addEventListener('click', (e) => {
                e.preventDefault();
                scrollToAnchor(a.dataset.anchor);
                closeMobileToc();
            });
        });

        setupScrollSpy();
    }

    function setupScrollSpy() {
        if (scrollSpyCleanup) {
            scrollSpyCleanup();
            scrollSpyCleanup = null;
        }

        let raf = null;
        const onScroll = () => {
            const anchors = document.querySelectorAll('.content a[name]');
            const tocLinks = document.querySelectorAll('.toc-sidebar a');
            if (!anchors.length || !tocLinks.length) return;

            let current = '';
            const offset = 80;

            anchors.forEach(a => {
                if (a.getBoundingClientRect().top <= offset) {
                    current = a.getAttribute('name');
                }
            });

            tocLinks.forEach(a => {
                a.classList.toggle('active', a.dataset.anchor === current);
            });
        };

        const handler = () => {
            if (raf) cancelAnimationFrame(raf);
            raf = requestAnimationFrame(onScroll);
        };

        window.addEventListener('scroll', handler);
        onScroll();

        scrollSpyCleanup = () => {
            window.removeEventListener('scroll', handler);
            if (raf) cancelAnimationFrame(raf);
        };
    }

    // ===== Scroll to Anchor =====
    let highlightTimer = null;
    const HEADER_OFFSET = 70; // header height + padding

    function scrollToAnchor(anchor) {
        // In side-by-side mode, scroll kr panel (en follows via syncScroll)
        if (sideBySide && hasKorean()) {
            const krPanel = document.getElementById('panel-kr');
            const enPanel = document.getElementById('panel-en');
            if (!krPanel) return;
            const krTarget = krPanel.querySelector(`a[name="${anchor}"]`);
            if (krTarget) {
                syncScrollPaused = true;
                const panelRect = krPanel.getBoundingClientRect();
                const targetRect = krTarget.getBoundingClientRect();
                krPanel.scrollTo({ top: krPanel.scrollTop + targetRect.top - panelRect.top - 16 });
                // en 패널도 같은 앵커로 직접 스크롤
                if (enPanel) {
                    const enTarget = enPanel.querySelector(`a[name="${anchor}"]`);
                    if (enTarget) {
                        const enPanelRect = enPanel.getBoundingClientRect();
                        const enTargetRect = enTarget.getBoundingClientRect();
                        enPanel.scrollTo({ top: enPanel.scrollTop + enTargetRect.top - enPanelRect.top - 16 });
                    }
                }
                setTimeout(() => { syncScrollPaused = false; }, 100);
            }
            highlightAllHeadings(anchor);
        } else {
            const target = document.querySelector(`a[name="${anchor}"]`) ||
                           document.getElementById(anchor);
            if (target) {
                const y = target.getBoundingClientRect().top + window.pageYOffset - HEADER_OFFSET;
                window.scrollTo({ top: y, behavior: 'smooth' });
                highlightAllHeadings(anchor);
            }
        }
    }

    function findHeadingAfterAnchor(anchorEl) {
        let heading = anchorEl.nextElementSibling;
        if (!heading || !/^H[2-4]$/.test(heading.tagName)) {
            const parent = anchorEl.parentElement;
            if (parent) heading = parent.nextElementSibling;
        }
        return (heading && /^H[2-4]$/.test(heading.tagName)) ? heading : null;
    }

    function highlightAllHeadings(anchor) {
        // Clear all previous highlights
        if (highlightTimer) clearTimeout(highlightTimer);
        document.querySelectorAll('.anchor-highlight, .anchor-fade').forEach(el => {
            el.classList.remove('anchor-highlight', 'anchor-fade');
        });

        // Find and highlight all matching headings
        const anchors = document.querySelectorAll(`a[name="${anchor}"]`);
        const headings = [];
        anchors.forEach(a => {
            const h = findHeadingAfterAnchor(a);
            if (h) {
                h.classList.add('anchor-highlight');
                headings.push(h);
            }
        });

        highlightTimer = setTimeout(() => {
            headings.forEach(h => {
                h.classList.add('anchor-fade');
                h.addEventListener('transitionend', () => {
                    h.classList.remove('anchor-highlight', 'anchor-fade');
                }, { once: true });
            });
        }, 2400);
    }

    // ===== Start =====
    document.addEventListener('DOMContentLoaded', init);
})();
