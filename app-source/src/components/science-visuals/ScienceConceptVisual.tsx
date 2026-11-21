import { useEffect, useState, type ReactNode } from 'react'
import type { SubjectId } from '../../data'
import { MathChoices, MathRange, MathVisualFrame } from '../math-visuals/AdvancedMathVisualFrame'
import {
  ChemistryCrystalVisual,
  ChemistryInorganicVisual,
  ChemistryIonVisual,
  ChemistryMaterialsVisual,
  ChemistryPeriodicVisual,
  ChemistryPrecipitationVisual,
  ChemistryRedoxVisual,
  ChemistrySpectrumVisual,
  ChemistryThermochemistryVisual,
} from './AdvancedScienceVisuals'
import {
  ChemistryApparatusVisual,
  ElectrolysisCorrosionVisual,
  OrganicReactionVisual,
  TitrationVisual,
} from './ChemistrySupplementVisuals'
import { QuantitativeErrorVisual, SeparationVisual } from './ChemistrySupplementVisuals2'
import { resolveChemistryVisualFamily } from './scienceVisualFamilies'
import './ScienceConceptVisual.css'

type ScienceConceptVisualProps = {
  subjectId: SubjectId
  topicTitle: string
  unitTitle: string
}

const reducedMotion = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

function PlayButton({ playing, onToggle }: { playing: boolean; onToggle: () => void }) {
  return <button className="science-play" type="button" aria-pressed={playing} onClick={onToggle}>{playing ? '暂停动画' : '播放动画'}</button>
}

function useTicker(initial = 0, step = 0.04, max = 1) {
  const [value, setValue] = useState(initial)
  const [playing, setPlaying] = useState(false)
  const [reduceMotion, setReduceMotion] = useState(reducedMotion)
  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReduceMotion(media.matches)
    update()
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [])
  useEffect(() => {
    if (!playing || reduceMotion) return undefined
    const timer = window.setInterval(() => setValue((current) => (current + step >= max ? 0 : current + step)), 40)
    return () => window.clearInterval(timer)
  }, [max, playing, reduceMotion, step])
  return { value, setValue, playing, setPlaying }
}

function ChemistryStoichVisual({ topicTitle }: { topicTitle: string }) {
  const [moles, setMoles] = useState(2)
  const particles = Array.from({ length: moles * 4 }, (_, index) => ({ x: 110 + (index % 8) * 48, y: 84 + Math.floor(index / 8) * 54 }))
  return <MathVisualFrame
    title={`${topicTitle}：从微粒数到物质的量`}
    summary="每组小球代表相同数量级的微观粒子。物质的量 n 把粒子数、质量、气体体积和溶液浓度放进同一条换算链。"
    controls={<MathRange label="物质的量 n" value={moles} min={1} max={5} step={1} output={`${moles} mol`} onChange={setMoles} />}
    takeaway={<>先把已知量统一成 mol，再按化学方程式系数比传递，最后换回题目要求的质量、体积或粒子数。</>}
  >
    <svg viewBox="0 0 640 300" role="img" aria-label={`${topicTitle}微粒示意，物质的量 ${moles} 摩尔`}>
      <title>{topicTitle}物质的量示意</title><desc>粒子数量随物质的量滑块增加，右侧给出摩尔质量和粒子数换算。</desc>
      <rect className="science-container" x="46" y="34" width="420" height="210" rx="8" />
      {particles.map((particle, index) => <circle key={index} className="science-particle" cx={particle.x} cy={particle.y} r="9" />)}
      <text className="science-label" x="492" y="90">n = {moles} mol</text><text className="science-label" x="492" y="136">N = {moles}Nₐ</text><text className="science-label" x="492" y="182">m = nM</text>
      <text className="science-label" x="62" y="278">一小组圆点 = 0.25 mol</text>
    </svg>
  </MathVisualFrame>
}

function ChemistryRateVisual({ topicTitle }: { topicTitle: string }) {
  const { value: phase, setValue: setPhase, playing, setPlaying } = useTicker(0, 0.025, 1)
  const [temperature, setTemperature] = useState(300)
  const particleCount = 16
  const speedFactor = temperature / 300
  return <MathVisualFrame
    title={`${topicTitle}：有效碰撞与反应速率`}
    summary="粒子碰撞不一定发生反应，只有能量足够且取向合适的有效碰撞才会生成产物。温度升高会增加有效碰撞比例。"
    controls={<><MathRange label="温度 T" value={temperature} min={200} max={500} step={20} output={`${temperature} K`} onChange={setTemperature} /><MathRange label="动画相位" value={phase} min={0} max={1} step={0.01} output={`${(phase * 360).toFixed(0)}°`} onChange={setPhase} /><PlayButton playing={playing} onToggle={() => setPlaying((current) => !current)} /></>}
    takeaway={<>催化剂降低活化能，改变达到有效碰撞的比例，但不改变反应物和生成物的总能量差。</>}
  >
    <svg viewBox="0 0 640 300" role="img" data-particle-count={particleCount} aria-label={`${topicTitle}有效碰撞示意，温度 ${temperature} 开尔文`}>
      <title>{topicTitle}有效碰撞</title><desc>两类粒子在容器中运动，红色连接表示发生有效碰撞。</desc>
      <rect className="science-container" x="42" y="32" width="556" height="220" rx="8" />
      {Array.from({ length: particleCount }, (_, index) => { const x = 80 + ((index * 67 + phase * 140 * speedFactor) % 470); const y = 72 + ((index * 43 + phase * 75 * speedFactor) % 140); const dx = (((index * 13) % 9) - 4) * speedFactor * 2; const dy = (((index * 7) % 7) - 3) * speedFactor * 2; return <g key={index}><circle className={index % 3 === 0 ? 'science-reactant science-reactant-b' : 'science-reactant'} cx={x} cy={y} r="9" /><line className="science-vector science-vector-soft" x1={x} y1={y} x2={x + dx} y2={y + dy} /></g> })}
      <circle className="science-collision" cx="319" cy="150" r="28" /><text className="science-label" x="278" y="205">有效碰撞</text><text className="science-label" x="62" y="278">速率随有效碰撞比例增加</text>
    </svg>
  </MathVisualFrame>
}

function ChemistryEquilibriumVisual({ topicTitle }: { topicTitle: string }) {
  const [extent, setExtent] = useState(50)
  const reactant = Math.round((100 - extent) / 10)
  const product = Math.round(extent / 10)
  return <MathVisualFrame
    title={`${topicTitle}：可逆反应的动态平衡`}
    summary="平衡不是反应停止，而是正、逆反应速率相等。拖动平衡程度，观察反应物与生成物微粒数量的相对变化。"
    controls={<MathRange label="平衡移动程度" value={extent} min={10} max={90} step={5} output={`${extent}%`} onChange={setExtent} />}
    takeaway={<>改变浓度、压强或温度会让体系重新建立平衡；平衡常数只由温度决定，不能把“平衡移动”理解成单向反应停止。</>}
  >
    <svg viewBox="0 0 640 300" role="img" aria-label={`${topicTitle}平衡示意，生成物比例 ${extent}%`}>
      <title>{topicTitle}动态平衡</title><desc>反应物和生成物微粒在同一容器中共存，数量随平衡程度改变。</desc>
      <rect className="science-container" x="42" y="32" width="556" height="220" rx="8" />
      {Array.from({ length: reactant }, (_, index) => <circle key={`r-${index}`} className="science-reactant" cx={78 + (index % 5) * 55} cy={78 + Math.floor(index / 5) * 58} r="11" />)}
      {Array.from({ length: product }, (_, index) => <rect key={`p-${index}`} className="science-product" x={360 + (index % 5) * 45} y={70 + Math.floor(index / 5) * 58} width="20" height="20" rx="4" />)}
      <text className="science-label" x="64" y="278">反应物 {reactant}</text><text className="science-label" x="442" y="278">生成物 {product}</text>
    </svg>
  </MathVisualFrame>
}

function ChemistryAcidVisual({ topicTitle }: { topicTitle: string }) {
  const [ph, setPh] = useState(7)
  const hue = ph <= 7 ? ph / 7 * 50 : 50 + (ph - 7) / 7 * 190
  return <MathVisualFrame
    title={`${topicTitle}：酸碱性与 pH`}
    summary="pH 用氢离子浓度的负对数表示酸碱性。拖动 pH，从颜色和刻度看出酸碱性是连续变化的。"
    controls={<MathRange label="pH" value={ph} min={0} max={14} step={0.5} output={ph.toFixed(1)} onChange={setPh} />}
    takeaway={<>pH 每变化 1，氢离子浓度变化 10 倍；滴定曲线的突跃区是判断终点指示剂范围的依据。</>}
  >
    <svg viewBox="0 0 640 300" role="img" aria-label={`${topicTitle}pH刻度，当前 ${ph.toFixed(1)}`}>
      <title>{topicTitle}pH刻度</title><desc>从强酸到强碱的连续颜色刻度，指针标出当前 pH。</desc>
      <defs><linearGradient id="science-ph-gradient" x1="0" x2="1"><stop offset="0%" stopColor="#e45b66" /><stop offset="50%" stopColor="#f3cf5b" /><stop offset="100%" stopColor="#4d91d8" /></linearGradient></defs>
      <rect x="62" y="105" width="516" height="44" rx="8" fill="url(#science-ph-gradient)" /><line className="science-ph-marker" x1={62 + ph / 14 * 516} y1="82" x2={62 + ph / 14 * 516} y2="176" /><polygon className="science-arrow-head" points={`${62 + ph / 14 * 516 - 9},82 ${62 + ph / 14 * 516 + 9},82 ${62 + ph / 14 * 516},68`} />
      {Array.from({ length: 15 }, (_, index) => <g key={index}><line className="science-tick" x1={62 + index / 14 * 516} y1="149" x2={62 + index / 14 * 516} y2="160" /><text className="science-label" x={62 + index / 14 * 516} y="190" textAnchor="middle">{index}</text></g>)}
      <circle data-ph-indicator="true" cx="62" cy="234" r="9" fill={`hsl(${hue} 70% 55%)`} /><text className="science-label" x="82" y="240">当前 pH = {ph.toFixed(1)}</text><text className="science-label" x="62" y="72">酸性</text><text className="science-label" x="534" y="72">碱性</text>
    </svg>
  </MathVisualFrame>
}

function ChemistryElectrochemVisual({ topicTitle }: { topicTitle: string }) {
  const [load, setLoad] = useState(50)
  const electrons = Math.max(1, Math.round(load / 15))
  return <MathVisualFrame
    title={`${topicTitle}：原电池中的电子流向`}
    summary="氧化反应发生在负极，电子经外电路流向正极；盐桥中的离子迁移维持溶液电中性。"
    controls={<MathRange label="反应进程" value={load} min={10} max={90} step={5} output={`${load}%`} onChange={setLoad} />}
    takeaway={<>判断电极先看氧化还原，再确定电子方向；电流方向与电子方向相反，盐桥离子不通过外电路。</>}
  >
    <svg viewBox="0 0 640 300" role="img" aria-label={`${topicTitle}原电池示意，反应进程 ${load}%`}>
      <title>{topicTitle}原电池</title><desc>两个半电池通过导线和盐桥相连，电子从负极流向正极。</desc>
      <path className="science-wire" d="M100 72 H540 V92" /><rect className="science-beaker" x="74" y="100" width="178" height="140" rx="7" /><rect className="science-beaker" x="388" y="100" width="178" height="140" rx="7" /><rect className="science-saltbridge" x="245" y="100" width="150" height="28" rx="14" />
      <rect className="science-electrode science-electrode-negative" x="132" y="124" width="28" height="102" rx="4" /><rect className="science-electrode science-electrode-positive" x="474" y="124" width="28" height="102" rx="4" />
      {Array.from({ length: electrons }, (_, index) => <circle key={index} className="science-electron" cx={150 + index * 72} cy="72" r="5" />)}
      <text className="science-label" x="108" y="264">负极：氧化</text><text className="science-label" x="430" y="264">正极：还原</text><text className="science-label" x="260" y="66">e⁻ →</text><text className="science-label" x="262" y="154">盐桥</text>
    </svg>
  </MathVisualFrame>
}

function ChemistryStructureVisual({ topicTitle }: { topicTitle: string }) {
  const [shape, setShape] = useState('tetrahedral')
  const layouts: Record<string, Array<[number, number]>> = { linear: [[240, 150], [400, 150]], bent: [[235, 105], [405, 180]], tetrahedral: [[210, 100], [415, 100], [245, 220], [390, 225]] }
  const labels: Record<string, string> = { linear: '直线形', bent: 'V 形', tetrahedral: '正四面体' }
  const bonds = layouts[shape]
  return <MathVisualFrame
    title={`${topicTitle}：分子空间构型`}
    summary="价层电子对互斥模型把成键电子对和孤电子对的排斥转化为可观察的空间几何。"
    controls={<MathChoices label="构型" value={shape} choices={Object.entries(labels).map(([value, label]) => ({ value, label }))} onChange={setShape} />}
    takeaway={<>分子构型由电子对排斥决定，键角变化会影响极性、沸点和溶解性；不能只看化学式的平面写法。</>}
  >
    <svg viewBox="0 0 640 300" role="img" aria-label={`${topicTitle}${labels[shape]}构型`}>
      <title>{topicTitle}分子构型</title><desc>中心原子与周围原子由彩色键相连，按钮可切换三种典型构型。</desc>
      {bonds.map(([x, y], index) => <line key={index} className="science-bond" x1="320" y1="160" x2={x} y2={y} />)}<circle className="science-center" cx="320" cy="160" r="28" />
      {bonds.map(([x, y], index) => <g key={`atom-${index}`}><circle className="science-atom" cx={x} cy={y} r="19" /><text className="science-label" x={x} y={y + 6} textAnchor="middle">X</text></g>)}
      <text className="science-label" x="252" y="274">{labels[shape]}：中心原子 A + {bonds.length} 个 X</text>
    </svg>
  </MathVisualFrame>
}

function ChemistryOrganicVisual({ topicTitle }: { topicTitle: string }) {
  const [length, setLength] = useState(4)
  const atoms = Array.from({ length }, (_, index) => ({ x: 120 + index * (400 / Math.max(length - 1, 1)), y: index % 2 ? 178 : 122 }))
  return <MathVisualFrame
    title={`${topicTitle}：碳链与官能团变化`}
    summary="有机物的性质由碳骨架和官能团共同决定。拖动碳链长度，观察同系物中结构单元的重复。"
    controls={<MathRange label="碳原子数" value={length} min={2} max={7} step={1} output={`${length} 个`} onChange={setLength} />}
    takeaway={<>先识别官能团，再判断反应类型；同系物具有相似的化学性质，但物理性质会随碳链长度有规律地变化。</>}
  >
    <svg viewBox="0 0 640 300" role="img" aria-label={`${topicTitle}碳链示意，${length}个碳原子`}>
      <title>{topicTitle}有机碳链</title><desc>碳原子沿锯齿链连接，末端标出可替换的官能团位置。</desc>
      {atoms.slice(0, -1).map((atom, index) => <line key={index} className="science-bond" x1={atom.x} y1={atom.y} x2={atoms[index + 1].x} y2={atoms[index + 1].y} />)}
      {atoms.map((atom, index) => <g key={index}><circle className="science-carbon" cx={atom.x} cy={atom.y} r="18" /><text className="science-label" x={atom.x} y={atom.y + 6} textAnchor="middle">C</text></g>)}
      <line className="science-functional-bond" x1={atoms.at(-1)?.x ?? 520} y1={atoms.at(-1)?.y ?? 122} x2="570" y2="90" /><text className="science-label" x="548" y="72">—OH</text><text className="science-label" x="74" y="260">碳骨架：{length} 个 C</text>
    </svg>
  </MathVisualFrame>
}

function ChemistryExperimentVisual({ topicTitle }: { topicTitle: string }) {
  const [step, setStep] = useState(2)
  const stages = ['发生', '净化', '收集', '检验']
  return <MathVisualFrame
    title={`${topicTitle}：实验流程的证据链`}
    summary="实验题不是装置识图竞赛，而是把反应原理、杂质去除、收集方法和检验现象按顺序连接起来。"
    controls={<MathRange label="流程步骤" value={step} min={0} max={3} step={1} output={`${step + 1} / 4`} onChange={setStep} />}
    takeaway={<>每一步都要说明目的和依据：发生装置提供反应条件，净化去除干扰，收集利用物性差异，检验给出可重复证据。</>}
  >
    <svg viewBox="0 0 640 300" role="img" aria-label={`${topicTitle}实验流程，当前步骤 ${stages[step]}`}>
      <title>{topicTitle}实验流程</title><desc>四个实验流程节点由箭头连接，当前节点高亮。</desc>
      {stages.map((stage, index) => <g key={stage}><rect className={index === step ? 'science-stage science-stage-active' : 'science-stage'} x={44 + index * 145} y="108" width="112" height="70" rx="6" /><text className="science-label" x={100 + index * 145} y="150" textAnchor="middle">{stage}</text>{index < stages.length - 1 && <path className="science-process-arrow" d={`M ${158 + index * 145} 143 h 27`} />}</g>)}
      <text className="science-label" x="60" y="236">现象</text><text className="science-label" x="184" y="236">去除干扰</text><text className="science-label" x="334" y="236">利用物性</text><text className="science-label" x="480" y="236">得出结论</text>
    </svg>
  </MathVisualFrame>
}

export function ScienceConceptVisual({ subjectId, topicTitle, unitTitle }: ScienceConceptVisualProps) {
  let family: string
  let visual: ReactNode
  if (subjectId === 'chemistry') {
    family = resolveChemistryVisualFamily(topicTitle, unitTitle)
    if (family === 'separation') visual = <SeparationVisual topicTitle={topicTitle} />
    else if (family === 'quantitative-error') visual = <QuantitativeErrorVisual topicTitle={topicTitle} />
    else if (family === 'electrolysis-corrosion') visual = <ElectrolysisCorrosionVisual topicTitle={topicTitle} />
    else if (family === 'titration') visual = <TitrationVisual topicTitle={topicTitle} />
    else if (family === 'apparatus') visual = <ChemistryApparatusVisual topicTitle={topicTitle} />
    else if (family === 'organic-reaction') visual = <OrganicReactionVisual topicTitle={topicTitle} />
    else if (family === 'electrochem') visual = <ChemistryElectrochemVisual topicTitle={topicTitle} />
    else if (family === 'acid') visual = <ChemistryAcidVisual topicTitle={topicTitle} />
    else if (family === 'rate') visual = <ChemistryRateVisual topicTitle={topicTitle} />
    else if (family === 'equilibrium') visual = <ChemistryEquilibriumVisual topicTitle={topicTitle} />
    else if (family === 'organic') visual = <ChemistryOrganicVisual topicTitle={topicTitle} />
    else if (family === 'structure') visual = <ChemistryStructureVisual topicTitle={topicTitle} />
    else if (family === 'experiment') visual = <ChemistryExperimentVisual topicTitle={topicTitle} />
    else if (family === 'ions') visual = <ChemistryIonVisual topicTitle={topicTitle} />
    else if (family === 'redox') visual = <ChemistryRedoxVisual topicTitle={topicTitle} />
    else if (family === 'periodic') visual = <ChemistryPeriodicVisual topicTitle={topicTitle} />
    else if (family === 'thermochemistry') visual = <ChemistryThermochemistryVisual topicTitle={topicTitle} />
    else if (family === 'crystal') visual = <ChemistryCrystalVisual topicTitle={topicTitle} />
    else if (family === 'inorganic') visual = <ChemistryInorganicVisual topicTitle={topicTitle} />
    else if (family === 'precipitation') visual = <ChemistryPrecipitationVisual topicTitle={topicTitle} />
    else if (family === 'spectrum') visual = <ChemistrySpectrumVisual topicTitle={topicTitle} />
    else if (family === 'materials') visual = <ChemistryMaterialsVisual topicTitle={topicTitle} />
    else visual = <ChemistryStoichVisual topicTitle={topicTitle} />
  } else {
    return null
  }
  return <div className={`science-visual theme-${subjectId}`} data-science-concept-visual={topicTitle} data-science-family={family}>{visual}</div>
}
