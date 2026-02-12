#!/usr/bin/env bash
#
# check-docs-updates.sh
# upstream(laravel/docs)과 로컬 영문 원본의 차이를 버전별로 보고한다.
#
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
VERSIONS=("12.x" "11.x" "10.x")

# upstream fetch
git -C "$REPO_ROOT" fetch upstream --quiet

for VERSION in "${VERSIONS[@]}"; do
    echo "=== VERSION: $VERSION ==="

    # upstream 브랜치에 있는 .md 파일 목록
    upstream_files=()
    while IFS= read -r f; do
        [[ "$f" == *.md ]] && upstream_files+=("$f")
    done < <(git -C "$REPO_ROOT" ls-tree --name-only "upstream/$VERSION" 2>/dev/null || true)

    # 로컬 디렉토리에 있는 .md 파일 목록
    local_files=()
    if [[ -d "$REPO_ROOT/$VERSION" ]]; then
        while IFS= read -r f; do
            local_files+=("$(basename "$f")")
        done < <(find "$REPO_ROOT/$VERSION" -maxdepth 1 -name '*.md' -type f)
    fi

    found_changes=false

    # upstream 파일 순회: NEW / CHANGED 감지
    for file in "${upstream_files[@]}"; do
        local_path="$REPO_ROOT/$VERSION/$file"
        if [[ ! -f "$local_path" ]]; then
            echo "NEW: $file"
            found_changes=true
        else
            # upstream 내용과 로컬 파일 비교
            diff_lines=$(diff <(git -C "$REPO_ROOT" show "upstream/$VERSION:$file") "$local_path" | grep -c '^[<>]' || true)
            if [[ "$diff_lines" -gt 0 ]]; then
                echo "CHANGED: $file ($diff_lines lines differ)"
                found_changes=true
            fi
        fi
    done

    # 로컬 파일 순회: DELETED 감지 (upstream에 없는 파일)
    for file in "${local_files[@]}"; do
        # upstream 목록에 있는지 확인
        in_upstream=false
        for uf in "${upstream_files[@]}"; do
            if [[ "$uf" == "$file" ]]; then
                in_upstream=true
                break
            fi
        done
        if [[ "$in_upstream" == false ]]; then
            echo "DELETED: $file"
            found_changes=true
        fi
    done

    if [[ "$found_changes" == false ]]; then
        echo "(no changes)"
    fi
done
