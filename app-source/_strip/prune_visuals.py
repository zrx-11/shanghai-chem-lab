#!/usr/bin/env python3
"""从 science-visuals 中剥离物理组件，仅保留化学。"""
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent / "src" / "components" / "science-visuals"

# 1) AdvancedScienceVisuals.tsx：保留头部助手与 Chemistry*，删除 Physics* 函数块
adv = ROOT / "AdvancedScienceVisuals.tsx"
lines = adv.read_text(encoding="utf-8").splitlines(keepends=True)
head, tail = [], []
in_chem = False
for i, line in enumerate(lines):
    if line.startswith("export function ChemistryIonVisual"):
        in_chem = True
    (tail if in_chem else head).append(line)
adv.write_text("".join(head + tail), encoding="utf-8")
print("AdvancedScienceVisuals stripped:", len(head), "head lines,", len(tail), "chem lines")

# 2) scienceVisualFamilies.ts：仅保留 Chemistry 类型/分类/路由
fam = ROOT / "scienceVisualFamilies.ts"
text = fam.read_text(encoding="utf-8")
m = re.search(r"export type ChemistryVisualFamily[\s\S]*", text)
fam.write_text(m.group(0), encoding="utf-8")
print("families stripped")

# 3) 删除物理补充视觉文件
for name in ("PhysicsSupplementVisuals.ts", "PhysicsSupplementVisuals2.tsx"):
    p = ROOT / name
    if p.exists():
        p.unlink()
        print("deleted", name)

# 4) ScienceConceptVisual.tsx：去物理导入、内联物理组件、物理路由
scv = ROOT / "ScienceConceptVisual.tsx"
t = scv.read_text(encoding="utf-8")

# 4a) AdvancedScienceVisuals 导入只留 Chemistry
chem_names = [
    "ChemistryCrystalVisual", "ChemistryInorganicVisual", "ChemistryIonVisual",
    "ChemistryMaterialsVisual", "ChemistryPeriodicVisual", "ChemistryPrecipitationVisual",
    "ChemistryRedoxVisual", "ChemistrySpectrumVisual", "ChemistryThermochemistryVisual",
]
adv_import = "import {\n  " + ",\n  ".join(chem_names) + "\n} from './AdvancedScienceVisuals'"
t = re.sub(r"import \{\s*[\s\S]*?\} from './AdvancedScienceVisuals'", adv_import, t, count=1)

# 4b) 删除两个物理补充导入块
t = re.sub(r"import \{\s*ACWaveVisual,[\s\S]*?\} from './PhysicsSupplementVisuals2'\n", "", t)
t = re.sub(r"import \{\s*NuclearDecayVisual,[\s\S]*?\} from './PhysicsSupplementVisuals'\n", "", t)

# 4c) families 导入只留化学路由
t = t.replace(
    "import { resolveChemistryVisualFamily, resolvePhysicsVisualFamily } from './scienceVisualFamilies'",
    "import { resolveChemistryVisualFamily } from './scienceVisualFamilies'")

# 4d) 删除内联物理组件（PhysicsMotionVisual ... PhysicsModernVisual 结束于 ChemistryStoichVisual 前）
t = re.sub(r"function PhysicsMotionVisual\([\s\S]*?\n\}\n\n(?=function ChemistryStoichVisual)", "", t)

# 4e) 路由：去掉 physics 分支，chemistry 分支保留，其余 return null
t = re.sub(r"if \(subjectId === 'physics'\) \{[\s\S]*?\} else if \(subjectId === 'chemistry'\) \{",
           "if (subjectId === 'chemistry') {", t)

scv.write_text(t, encoding="utf-8")
print("ScienceConceptVisual stripped")
