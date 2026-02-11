const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const VERSIONS_WITH_KOREAN = ['12.x', '11.x', '9.x', '8.x', '7.x', '6.x', '5.8', '5.7', '5.6', '5.5', '5.4', '5.3', '5.2', '5.1', '5.0'];

function stripMarkdown(text) {
    return text
        .replace(/```[\s\S]*?```/g, '')
        .replace(/`[^`]+`/g, '')
        .replace(/<[^>]+>/g, '')
        .replace(/!\[.*?\]\(.*?\)/g, '')
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
        .replace(/[*_]{1,3}([^*_]+)[*_]{1,3}/g, '$1')
        .replace(/^#{1,6}\s+/gm, '')
        .replace(/^>\s?/gm, '')
        .replace(/^---+$/gm, '')
        .replace(/^[\s]*[-*+]\s/gm, '')
        .replace(/^[\s]*\d+\.\s/gm, '')
        .replace(/\{\{version\}\}/g, '')
        .replace(/\s+/g, ' ')
        .trim();
}

function buildIndexForDir(dir) {
    const files = fs.readdirSync(dir)
        .filter(f => f.endsWith('.md') && f !== 'documentation.md');

    const index = [];

    for (const file of files) {
        const slug = file.replace('.md', '');
        const content = fs.readFileSync(path.join(dir, file), 'utf-8');
        const lines = content.split('\n');

        // Extract H1 title
        const h1Match = lines[0] && lines[0].match(/^#\s+(.+)/);
        const pageTitle = h1Match ? h1Match[1].trim() : slug;

        // Split into sections by <a name="..."> anchors
        const sections = [];
        let currentAnchor = null;
        let currentHeading = null;
        let currentBody = [];

        for (let i = 0; i < lines.length; i++) {
            const anchorMatch = lines[i].match(/<a name="([^"]+)">/);
            if (anchorMatch) {
                if (currentAnchor !== null) {
                    sections.push({
                        anchor: currentAnchor,
                        heading: currentHeading,
                        body: currentBody.join('\n')
                    });
                }
                currentAnchor = anchorMatch[1];
                const nextLine = lines[i + 1] || '';
                const headingMatch = nextLine.match(/^#{1,4}\s+(.+)/);
                currentHeading = headingMatch ? headingMatch[1].trim() : '';
                currentBody = [];
                i++;
                continue;
            }
            if (currentAnchor !== null) {
                currentBody.push(lines[i]);
            }
        }

        // Push last section
        if (currentAnchor !== null) {
            sections.push({
                anchor: currentAnchor,
                heading: currentHeading,
                body: currentBody.join('\n')
            });
        }

        // If no anchors found, create a single entry for the whole page
        if (sections.length === 0) {
            const plainBody = stripMarkdown(content);
            if (plainBody) {
                index.push({
                    p: slug,
                    t: pageTitle,
                    a: '',
                    h: pageTitle,
                    b: plainBody.substring(0, 300)
                });
            }
            continue;
        }

        for (const section of sections) {
            const plainBody = stripMarkdown(section.body);
            if (!plainBody && !section.heading) continue;

            index.push({
                p: slug,
                t: pageTitle,
                a: section.anchor,
                h: section.heading,
                b: plainBody.substring(0, 300)
            });
        }
    }

    return index;
}

function buildAllIndexes() {
    // Auto-detect version directories (e.g. 5.0, 5.8, 10.x, 12.x)
    const versionDirs = fs.readdirSync(ROOT)
        .filter(d => /^\d+\.\w+$/.test(d) && fs.statSync(path.join(ROOT, d)).isDirectory());

    let totalSections = 0;

    for (const version of versionDirs) {
        // For versions with Korean translations, index the kr/ subdirectory
        // For others, index the English md files directly
        const hasKorean = VERSIONS_WITH_KOREAN.includes(version);
        const sourceDir = hasKorean
            ? path.join(ROOT, version, 'kr')
            : path.join(ROOT, version);

        if (!fs.existsSync(sourceDir)) {
            console.log(`Skipping ${version}: directory not found`);
            continue;
        }

        const index = buildIndexForDir(sourceDir);
        const outputFile = path.join(ROOT, `search-index-${version}.json`);
        fs.writeFileSync(outputFile, JSON.stringify(index));
        totalSections += index.length;
        console.log(`  ${version}: ${index.length} sections (${hasKorean ? 'Korean' : 'English'})`);
    }

    console.log(`Search indexes built: ${totalSections} total sections from ${versionDirs.length} versions`);
}

buildAllIndexes();
