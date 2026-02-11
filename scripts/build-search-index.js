const fs = require('fs');
const path = require('path');

const KR_DIR = path.join(__dirname, '..', 'kr');
const OUTPUT = path.join(__dirname, '..', 'search-index.json');

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

function buildIndex() {
    const files = fs.readdirSync(KR_DIR)
        .filter(f => f.endsWith('.md') && f !== 'documentation.md');

    const index = [];

    for (const file of files) {
        const slug = file.replace('.md', '');
        const content = fs.readFileSync(path.join(KR_DIR, file), 'utf-8');
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

    fs.writeFileSync(OUTPUT, JSON.stringify(index));
    console.log(`Search index built: ${index.length} sections from ${files.length} files`);
}

buildIndex();
