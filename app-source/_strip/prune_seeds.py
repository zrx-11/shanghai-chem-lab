#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""把种子文件里 courses 下非 chemistry 的课程块整段删除。

按大括号配对扫描；跳过单引号字符串与行注释，避免把字符串里的括号算进去。
"""
import re, sys, pathlib

KEEP = 'chemistry'


def skip_string(s, i):
    if s[i] in "'\"":
        q = s[i]
        i += 1
        while i < len(s):
            if s[i] == '\\':
                i += 2
                continue
            if s[i] == q:
                return i + 1
            i += 1
    return i


def match_brace(s, open_pos):
    """open_pos 指向 '{'，返回配对 '}' 的位置。"""
    depth = 0
    i = open_pos
    while i < len(s):
        if s[i] in "'\"":
            i = skip_string(s, i)
            continue
        if s[i] == '/' and i + 1 < len(s) and s[i + 1] == '/':
            nl = s.find('\n', i)
            i = len(s) if nl < 0 else nl
            continue
        if s[i] == '{':
            depth += 1
        elif s[i] == '}':
            depth -= 1
            if depth == 0:
                return i
        i += 1
    raise ValueError('brace 未配对')


def prune_courses(text):
    out = []
    i = 0
    n = len(text)
    while i < n:
        m = re.search(r'courses:\s*\{', text[i:])
        if not m:
            out.append(text[i:])
            break
        out.append(text[i:i + m.start()])
        brace_start = i + m.end() - 1
        brace_end = match_brace(text, brace_start)
        block = text[brace_start:brace_end + 1]
        inner = block[1:-1]

        # 扫描顶层条目
        entries = []  # (key, entry_start, entry_end, value_open)
        j = 0
        depth = 0
        entry_start = None
        key = None
        while j < len(inner):
            c = inner[j]
            if c in "'\"":
                j = skip_string(inner, j)
                continue
            if c == '/' and j + 1 < len(inner) and inner[j + 1] == '/':
                nl = inner.find('\n', j)
                j = len(inner) if nl < 0 else nl
                continue
            if c == '{':
                if depth == 0:
                    # 找到当前条目的 key（往前取到上一个逗号/换行）
                    head = inner[entry_start:j] if entry_start is not None else inner[:j]
                    km = re.search(r"([A-Za-z0-9_-]+)\s*:\s*$", head)
                    key = km.group(1) if km else None
                depth += 1
            elif c == '}':
                depth -= 1
                if depth == 0:
                    entries.append((key, entry_start, j + 1))
                    entry_start = None
            elif c == ',' and depth == 0:
                entry_start = j + 1
            elif entry_start is None and c.strip():
                entry_start = j
            j += 1

        kept = []
        for key, es, ee in entries:
            if key == KEEP:
                kept.append(inner[es:ee].rstrip())
        new_inner = '\n    ' + (',\n    '.join(kept)) + '\n  '
        out.append('courses: {' + new_inner + '}')
        i = brace_end + 1
    return ''.join(out)


def main():
    root = pathlib.Path(sys.argv[1])
    for fp in root.glob('src/seeds-*.ts'):
        text = fp.read_text(encoding='utf-8')
        new = prune_courses(text)
        fp.write_text(new, encoding='utf-8')
        print(f'{fp.name}: {len(text)} -> {len(new)} 字节')
    # curriculumSeeds.ts 内联了 g10 两个学期
    fp = root / 'src/curriculumSeeds.ts'
    text = fp.read_text(encoding='utf-8')
    new = prune_courses(text)
    fp.write_text(new, encoding='utf-8')
    print(f'{fp.name}: {len(text)} -> {len(new)} 字节')


if __name__ == '__main__':
    main()
