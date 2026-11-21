import { useEffect, useMemo, useState } from 'react'
import { MathChoices, MathRange, MathVisualFrame } from '../math-visuals/AdvancedMathVisualFrame'

const reducedMotion = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

function PlayButton({ playing, onToggle }: { playing: boolean; onToggle: () => void }) {
  return <button className="science-play" type="button" aria-pressed={playing} onClick={onToggle}>{playing ? '暂停动画' : '播放动画'}</button>
}

function useTicker(initial = 0, step = 0.025, max = 1) {
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

export function ChemistryIonVisual({ topicTitle }: { topicTitle: string }) {
  const [mixing, setMixing] = useState(0)
  const precipitate = Math.round(mixing * 6)
  const freeReactive = 6 - precipitate
  const leftIons = useMemo(() => Array.from({ length: 6 }, (_, index) => ({ x: 104 + (index % 3) * 45, y: 102 + Math.floor(index / 3) * 55 })), [])
  const rightIons = useMemo(() => Array.from({ length: 6 }, (_, index) => ({ x: 424 + (index % 3) * 45, y: 102 + Math.floor(index / 3) * 55 })), [])
  return <MathVisualFrame
    title={`${topicTitle}：反应微粒与旁观离子`}
    summary="把含Ba²⁺和SO₄²⁻的两份溶液逐步混合。真正减少的是参与沉淀的离子，Na⁺和Cl⁻仍分散在水中，因此净离子方程式只保留发生变化的微粒。"
    controls={<MathRange label="混合进程" value={mixing} min={0} max={1} step={0.1} output={`${Math.round(mixing * 100)}%`} onChange={setMixing} />}
    takeaway={<>离子方程式先拆强电解质，再删除反应前后相同的旁观离子；沉淀、气体、弱电解质和氧化物不能随意拆写。</>}
  >
    <svg viewBox="0 0 640 300" role="img" aria-label={`${topicTitle}离子反应，生成${precipitate}组沉淀`}>
      <title>{topicTitle}离子反应微粒变化</title><desc>两个烧杯中的反应离子随混合减少，底部沉淀增加，旁观离子数量不变。</desc>
      <rect className="science-beaker" x="58" y="54" width="218" height="176" rx="7" /><rect className="science-beaker" x="364" y="54" width="218" height="176" rx="7" />
      {leftIons.slice(0, freeReactive).map((ion, index) => <g key={`ba-${index}`}><circle className="science-ion science-ion-a" cx={ion.x} cy={ion.y} r="13" /><text className="science-ion-label" x={ion.x} y={ion.y + 5} textAnchor="middle">Ba</text></g>)}
      {rightIons.slice(0, freeReactive).map((ion, index) => <g key={`so4-${index}`}><circle className="science-ion science-ion-b" cx={ion.x} cy={ion.y} r="15" /><text className="science-ion-label" x={ion.x} y={ion.y + 5} textAnchor="middle">SO₄</text></g>)}
      {Array.from({ length: 4 }, (_, index) => <g key={`spectator-${index}`}><circle className="science-spectator" cx={102 + index * 42} cy="202" r="9" /><circle className="science-spectator" cx={408 + index * 42} cy="202" r="9" /></g>)}
      {Array.from({ length: precipitate }, (_, index) => <rect key={index} className="science-precipitate" x={252 + (index % 3) * 45} y={224 - Math.floor(index / 3) * 24} width="38" height="18" rx="5" />)}
      <path className="science-process-arrow" d="M 284 136 H 350" /><text className="science-label" x="276" y="112">混合</text>
      <text className="science-label" x="54" y="278">Ba²⁺ + SO₄²⁻ → BaSO₄↓</text><text className="science-label" x="432" y="278">Na⁺、Cl⁻旁观</text>
    </svg>
  </MathVisualFrame>
}

export function ChemistryRedoxVisual({ topicTitle }: { topicTitle: string }) {
  const { value: progress, setValue: setProgress, playing, setPlaying } = useTicker(0, 0.02, 1)
  const transferred = Math.round(progress * 2)
  const electronX = 188 + progress * 252
  return <MathVisualFrame
    title={`${topicTitle}：电子转移与氧化数变化`}
    summary="铁原子失去电子成为Fe²⁺，Cu²⁺得到电子析出铜。播放电子转移，氧化、还原和氧化剂、还原剂四个角色可由同一条电子流确定。"
    controls={<><MathRange label="反应进程" value={progress} min={0} max={1} step={0.01} output={`${Math.round(progress * 100)}%`} onChange={setProgress} /><PlayButton playing={playing} onToggle={() => setPlaying((current) => !current)} /></>}
    takeaway={<>化合价升高者失电子、被氧化，是还原剂；化合价降低者得电子、被还原，是氧化剂。配平时得失电子总数必须相等。</>}
  >
    <svg viewBox="0 0 640 300" role="img" aria-label={`${topicTitle}氧化还原电子转移，已转移${transferred}个电子`}>
      <title>{topicTitle}电子转移</title><desc>铁从零价升到正二价，铜从正二价降到零价，电子由铁转移给铜离子。</desc>
      <circle className="science-redox-donor" cx="150" cy="144" r="48" /><text className="science-charge-label" x="150" y="151" textAnchor="middle">Fe⁰</text>
      <circle className="science-redox-acceptor" cx="490" cy="144" r="48" /><text className="science-charge-label" x="490" y="151" textAnchor="middle">Cu²⁺</text>
      <line className="science-electron-path" x1="206" y1="144" x2="434" y2="144" />
      {Array.from({ length: 2 }, (_, index) => <circle key={index} className={index < transferred ? 'science-electron' : 'science-electron science-electron-pending'} cx={electronX - index * 34} cy={132 + index * 24} r="7" />)}
      <text className="science-label" x="84" y="226">Fe⁰ − 2e⁻ → Fe²⁺</text><text className="science-label" x="362" y="226">Cu²⁺ + 2e⁻ → Cu⁰</text>
      <text className="science-label" x="70" y="270">还原剂：失电子，被氧化</text><text className="science-label" x="356" y="270">氧化剂：得电子，被还原</text>
    </svg>
  </MathVisualFrame>
}

const periodicData = {
  原子半径: { values: [186, 160, 143, 118, 110, 103, 99], unit: 'pm', conclusion: '同周期总体减小' },
  第一电离能: { values: [496, 738, 578, 787, 1012, 1000, 1251], unit: 'kJ/mol', conclusion: '总体增大，但有局部例外' },
  电负性: { values: [0.93, 1.31, 1.61, 1.90, 2.19, 2.58, 3.16], unit: '', conclusion: '同周期总体增大' },
} as const

export function ChemistryPeriodicVisual({ topicTitle }: { topicTitle: string }) {
  const [trend, setTrend] = useState<keyof typeof periodicData>('原子半径')
  const elements = ['Na', 'Mg', 'Al', 'Si', 'P', 'S', 'Cl']
  const data = periodicData[trend]
  const min = Math.min(...data.values)
  const max = Math.max(...data.values)
  const points = data.values.map((value, index) => `${76 + index * 80},${226 - (value - min) / Math.max(max - min, 1) * 132}`).join(' ')
  return <MathVisualFrame
    title={`${topicTitle}：把周期趋势还原为结构变化`}
    summary="切换第三周期的原子半径、第一电离能和电负性。总体趋势来自有效核电荷增强，局部折点则提醒我们还要检查能级和电子排布。"
    controls={<MathChoices label="比较量" value={trend} choices={(Object.keys(periodicData) as Array<keyof typeof periodicData>).map((value) => ({ value, label: value }))} onChange={(value) => setTrend(value as keyof typeof periodicData)} />}
    takeaway={<>周期趋势不是无条件箭头。比较微粒前先判断电子层数和电子总数，再讨论有效核电荷、屏蔽与半满或全满排布。</>}
  >
    <svg viewBox="0 0 640 300" role="img" aria-label={`${topicTitle}${trend}变化，${data.conclusion}`}>
      <title>{topicTitle}元素周期趋势</title><desc>第三周期七种元素的所选性质以折线和数值表示，局部例外保持可见。</desc>
      <line className="science-axis" x1="58" y1="242" x2="584" y2="242" /><polyline className="science-trend-line" points={points} />
      {data.values.map((value, index) => { const [, y] = points.split(' ')[index].split(','); return <g key={elements[index]}><circle className="science-trend-point" cx={76 + index * 80} cy={Number(y)} r="7" /><text className="science-label" x={76 + index * 80} y="268" textAnchor="middle">{elements[index]}</text><text className="science-chart-value" x={76 + index * 80} y={Number(y) - 14} textAnchor="middle">{value}</text></g> })}
      <text className="science-label" x="58" y="42">{trend} {data.unit}</text><text className="science-label" x="582" y="42" textAnchor="end">{data.conclusion}</text>
    </svg>
  </MathVisualFrame>
}

export function ChemistryThermochemistryVisual({ topicTitle }: { topicTitle: string }) {
  const [reaction, setReaction] = useState<'放热反应' | '吸热反应'>('放热反应')
  const [catalyst, setCatalyst] = useState<'无催化剂' | '有催化剂'>('无催化剂')
  const [progress, setProgress] = useState(0.35)
  const reactantY = 190
  const productY = reaction === '放热反应' ? 238 : 132
  const peakY = catalyst === '有催化剂' ? 104 : 54
  const pointOnCurve = (value: number) => {
    if (value <= 0.5) {
      const t = value * 2
      return {
        x: (1 - t) ** 2 * 76 + 2 * (1 - t) * t * 222 + t ** 2 * 320,
        y: (1 - t) ** 2 * reactantY + 2 * (1 - t) * t * peakY + t ** 2 * peakY,
      }
    }
    const t = (value - 0.5) * 2
    return {
      x: (1 - t) ** 2 * 320 + 2 * (1 - t) * t * 424 + t ** 2 * 564,
      y: (1 - t) ** 2 * peakY + 2 * (1 - t) * t * peakY + t ** 2 * productY,
    }
  }
  const marker = pointOnCurve(progress)
  const deltaH = reaction === '放热反应' ? -120 : 80
  return <MathVisualFrame
    title={`${topicTitle}：反应焓与活化能分开判断`}
    summary="切换吸热或放热以及催化路径。催化剂降低能垒，却不改变反应物、生成物的能量差，因此ΔH和化学平衡常数不会因催化剂改变。"
    controls={<><MathChoices label="反应类型" value={reaction} choices={[{ value: '放热反应', label: '放热' }, { value: '吸热反应', label: '吸热' }]} onChange={(value) => setReaction(value as typeof reaction)} /><MathChoices label="反应路径" value={catalyst} choices={[{ value: '无催化剂', label: '无催化剂' }, { value: '有催化剂', label: '有催化剂' }]} onChange={(value) => setCatalyst(value as typeof catalyst)} /><MathRange label="反应进程" value={progress} min={0} max={1} step={0.01} output={`${Math.round(progress * 100)}%`} onChange={setProgress} /></>}
    takeaway={<>断键吸能、成键放能；<code>ΔH=H生成物−H反应物</code>。催化剂只改变路径和活化能，不改变始末态。</>}
  >
    <svg viewBox="0 0 640 300" role="img" aria-label={`${topicTitle}${reaction}${catalyst}能量曲线，焓变${deltaH}千焦每摩尔`}>
      <title>{topicTitle}反应能量曲线</title><desc>反应物经过活化能峰到达生成物，催化路径峰值更低而始末能量不变。</desc>
      <line className="science-axis" x1="58" y1="258" x2="586" y2="258" /><line className="science-axis" x1="58" y1="258" x2="58" y2="30" />
      <path className="science-reaction-curve" d={`M 76 ${reactantY} Q 222 ${peakY} 320 ${peakY} Q 424 ${peakY} 564 ${productY}`} /><circle className="science-collision" cx={marker.x} cy={marker.y} r="10" />
      <line className="science-energy-level" x1="76" y1={reactantY} x2="154" y2={reactantY} /><line className="science-energy-level" x1="486" y1={productY} x2="564" y2={productY} />
      <text className="science-label" x="78" y={reactantY - 14}>反应物</text><text className="science-label" x="484" y={productY - 14}>生成物</text><text className="science-label" x="258" y="278">反应进程</text><text className="science-label" x="360" y="46">ΔH={deltaH} kJ/mol</text>
    </svg>
  </MathVisualFrame>
}

const inorganicNetworks = {
  氯: ['Cl⁻', 'Cl₂', 'HClO', 'ClO⁻'],
  硫: ['S²⁻', 'S', 'SO₂', 'SO₄²⁻'],
  氮: ['NH₃', 'N₂', 'NO', 'NO₃⁻'],
  铁: ['Fe', 'Fe²⁺', 'Fe³⁺', 'Fe(OH)₃'],
} as const

export function ChemistryInorganicVisual({ topicTitle }: { topicTitle: string }) {
  const [element, setElement] = useState<keyof typeof inorganicNetworks>('硫')
  const [step, setStep] = useState(1)
  const nodes = inorganicNetworks[element]
  return <MathVisualFrame
    title={`${topicTitle}：按价态组织无机转化网络`}
    summary="选择氯、硫、氮或铁，把零散反应放到同一条价态链。沿箭头向右通常是氧化，向左通常是还原；酸碱、沉淀等非氧化还原转化另看微粒条件。"
    controls={<><MathChoices label="元素主线" value={element} choices={(Object.keys(inorganicNetworks) as Array<keyof typeof inorganicNetworks>).map((value) => ({ value, label: value }))} onChange={(value) => setElement(value as keyof typeof inorganicNetworks)} /><MathRange label="当前转化" value={step} min={0} max={2} step={1} output={`${nodes[step]} → ${nodes[step + 1]}`} onChange={setStep} /></>}
    takeaway={<>元素化合物复习应同时标“价态、物质类别、反应条件和证据”。能转化不等于一步直接反应，试剂与介质决定实际路径。</>}
  >
    <svg viewBox="0 0 640 300" role="img" aria-label={`${topicTitle}${element}元素转化网络，当前${nodes[step]}转化为${nodes[step + 1]}`}>
      <title>{topicTitle}无机价态网络</title><desc>同一元素的四种代表物质按价态或转化顺序排列，当前相邻转化高亮。</desc>
      {nodes.map((node, index) => <g key={node}><circle className={index === step || index === step + 1 ? 'science-network-node science-network-node-active' : 'science-network-node'} cx={92 + index * 152} cy="146" r="46" /><text className="science-label" x={92 + index * 152} y="153" textAnchor="middle">{node}</text>{index < nodes.length - 1 && <><line className={index === step ? 'science-network-link science-network-link-active' : 'science-network-link'} x1={140 + index * 152} y1="132" x2={194 + index * 152} y2="132" /><line className="science-network-link" x1={194 + index * 152} y1="164" x2={140 + index * 152} y2="164" /></>}</g>)}
      <text className="science-label" x="64" y="242">向右：氧化性条件</text><text className="science-label" x="412" y="242">向左：还原性条件</text>
    </svg>
  </MathVisualFrame>
}

export function ChemistryCrystalVisual({ topicTitle }: { topicTitle: string }) {
  const [cell, setCell] = useState<'简单立方' | '体心立方' | '面心立方'>('面心立方')
  const counts = { 简单立方: 1, 体心立方: 2, 面心立方: 4 }
  const corners = [[178, 82], [390, 82], [178, 224], [390, 224], [246, 42], [458, 42], [246, 184], [458, 184]]
  const faceCenters = [[284, 82], [352, 184], [212, 133], [424, 133], [318, 42], [318, 224]]
  return <MathVisualFrame
    title={`${topicTitle}：共享份额决定晶胞计数`}
    summary="切换简单、体心和面心立方晶胞。图中画出的球并不都完整属于一个晶胞，必须按顶点1/8、面心1/2、体心1计入。"
    controls={<MathChoices label="晶胞类型" value={cell} choices={[{ value: '简单立方', label: '简单立方' }, { value: '体心立方', label: '体心立方' }, { value: '面心立方', label: '面心立方' }]} onChange={(value) => setCell(value as typeof cell)} />}
    takeaway={<>计数先标位置，再乘共享份额。密度题继续用 <code>ρ=ZM/(Nₐa³)</code>，其中Z是一个晶胞中有效粒子数。</>}
  >
    <svg viewBox="0 0 640 300" role="img" aria-label={`${topicTitle}${cell}晶胞，有效粒子数${counts[cell]}`}>
      <title>{topicTitle}晶胞计数</title><desc>透视立方体标出顶点、体心或面心粒子，并给出共享份额计算。</desc>
      <path className="science-cell" d="M 178 82 H 390 V 224 H 178 Z M 246 42 H 458 V 184 H 246 Z M 178 82 L 246 42 M 390 82 L 458 42 M 390 224 L 458 184 M 178 224 L 246 184" />
      {corners.map(([x, y], index) => <circle key={`corner-${index}`} className="science-crystal-particle" cx={x} cy={y} r="12" />)}
      {cell === '体心立方' && <circle className="science-crystal-particle science-crystal-center" cx="318" cy="133" r="16" />}
      {cell === '面心立方' && faceCenters.map(([x, y], index) => <circle key={`face-${index}`} className="science-crystal-particle science-crystal-face" cx={x} cy={y} r="14" />)}
      <rect className="science-meter" x="472" y="76" width="148" height="108" rx="4" /><text className="science-meter-label" x="546" y="104" textAnchor="middle">有效粒子数 Z</text><text className="science-cell-count" x="546" y="154" textAnchor="middle">{counts[cell]}</text>
      <text className="science-label" x="68" y="270">{cell === '简单立方' ? '8×1/8=1' : cell === '体心立方' ? '8×1/8+1=2' : '8×1/8+6×1/2=4'}</text>
    </svg>
  </MathVisualFrame>
}

export function ChemistryPrecipitationVisual({ topicTitle }: { topicTitle: string }) {
  const [ratio, setRatio] = useState(1)
  const precipitate = Math.round(Math.max(0, ratio - 1) * 8)
  const state = ratio < 1 ? '未饱和，可继续溶解' : ratio === 1 ? '饱和临界' : '过饱和，生成沉淀'
  const freeIons = Math.max(4, 12 - precipitate)
  return <MathVisualFrame
    title={`${topicTitle}：用 Qsp 与 Ksp 判断方向`}
    summary="调节离子积与溶度积之比。Qsp小于Ksp时未达到饱和，等于时处在沉淀临界，大于时体系通过析出固体降低自由离子浓度。"
    controls={<MathRange label="Qsp / Ksp" value={ratio} min={0.2} max={2} step={0.1} output={ratio.toFixed(1)} onChange={setRatio} />}
    takeaway={<>比较必须使用混合后的自由离子浓度；刚出现沉淀的边界是 <code>Qsp=Ksp</code>，不是相关离子已经完全反应。</>}
  >
    <svg viewBox="0 0 640 300" role="img" aria-label={`${topicTitle}沉淀平衡，${state}`}>
      <title>{topicTitle}沉淀生成与溶解</title><desc>烧杯中自由离子和底部固体数量随离子积与溶度积比值变化。</desc>
      <rect className="science-beaker" x="120" y="38" width="400" height="210" rx="8" />
      {Array.from({ length: freeIons }, (_, index) => <circle key={index} className={index % 2 ? 'science-ion science-ion-b' : 'science-ion science-ion-a'} cx={162 + (index % 6) * 63} cy={76 + Math.floor(index / 6) * 64} r="13" />)}
      {Array.from({ length: precipitate }, (_, index) => <rect key={index} className="science-precipitate" x={220 + (index % 5) * 42} y={224 - Math.floor(index / 5) * 22} width="34" height="16" rx="4" />)}
      <line className="science-equilibrium-arrow" x1="268" y1="176" x2="372" y2="176" /><text className="science-label" x="274" y="164">溶解 ⇌ 沉淀</text>
      <text className="science-label" x="70" y="282">{state}</text><text className="science-label" x="486" y="282">Q/K={ratio.toFixed(1)}</text>
    </svg>
  </MathVisualFrame>
}

export function ChemistrySpectrumVisual({ topicTitle }: { topicTitle: string }) {
  const [evidence, setEvidence] = useState<'质谱' | '红外' | '核磁'>('红外')
  const peaks = evidence === '质谱'
    ? [{ x: 100, h: 48, label: '31' }, { x: 206, h: 94, label: '45' }, { x: 344, h: 58, label: '46' }, { x: 500, h: 124, label: 'M⁺' }]
    : evidence === '核磁'
      ? [{ x: 126, h: 88, label: '3H' }, { x: 306, h: 124, label: '2H' }, { x: 486, h: 54, label: '1H' }]
      : []
  return <MathVisualFrame
    title={`${topicTitle}：多种谱图证据相互闭合`}
    summary="切换质谱、红外和核磁证据。质谱约束相对分子质量，红外识别官能团，核磁给化学环境数和氢数比例；任何单张谱图都不应孤立定结构。"
    controls={<MathChoices label="证据类型" value={evidence} choices={[{ value: '质谱', label: '质谱' }, { value: '红外', label: '红外' }, { value: '核磁', label: '¹H NMR' }]} onChange={(value) => setEvidence(value as typeof evidence)} />}
    takeaway={<>结构鉴定的顺序是“分子式与不饱和度→官能团→氢环境→全部证据复核”，最高峰不一定就是分子离子峰。</>}
  >
    <svg viewBox="0 0 640 300" role="img" aria-label={`${topicTitle}${evidence}示意谱图`}>
      <title>{topicTitle}{evidence}证据</title><desc>{evidence === '红外' ? '红外透过率曲线在羟基和碳氧键区域出现特征吸收。' : `${evidence}谱图显示多组特征峰及其标签。`}</desc>
      <line className="science-axis" x1="58" y1="242" x2="590" y2="242" /><line className="science-axis" x1="58" y1="242" x2="58" y2="38" />
      {evidence === '红外'
        ? <><path className="science-spectrum-line" d="M 68 70 C 110 68 122 148 174 178 C 220 202 244 80 318 78 C 370 76 398 164 430 194 C 466 224 484 86 574 82" /><text className="science-label" x="110" y="214">O—H 宽峰</text><text className="science-label" x="402" y="224">C—O</text></>
        : peaks.map((peak) => <g key={peak.x}><line className="science-spectrum-peak" x1={peak.x} y1="242" x2={peak.x} y2={242 - peak.h} /><text className="science-label" x={peak.x} y={226 - peak.h} textAnchor="middle">{peak.label}</text></g>)}
      <text className="science-label" x="64" y="278">{evidence === '质谱' ? 'm/z → 相对分子质量与碎片' : evidence === '红外' ? '波数 → 官能团' : '化学位移 → 氢环境与积分比'}</text>
    </svg>
  </MathVisualFrame>
}

export function ChemistryMaterialsVisual({ topicTitle }: { topicTitle: string }) {
  const [recovery, setRecovery] = useState(45)
  const [route, setRoute] = useState<'线性使用' | '循环利用'>('循环利用')
  const recycled = route === '循环利用' ? recovery : 0
  const waste = 100 - recycled
  return <MathVisualFrame
    title={`${topicTitle}：把性能、资源与环境放进全生命周期`}
    summary="材料评价不能只看制得时的性能。改变回收率并比较线性使用与循环利用，观察原料回流和最终废弃量，进一步结合能耗、毒性与原子经济性作选择。"
    controls={<><MathChoices label="资源路线" value={route} choices={[{ value: '线性使用', label: '开采→使用→废弃' }, { value: '循环利用', label: '回收再利用' }]} onChange={(value) => setRoute(value as typeof route)} /><MathRange label="回收率" value={recovery} min={10} max={90} step={5} output={`${recovery}%`} onChange={setRecovery} /></>}
    takeaway={<>“绿色”是多指标判断：原料是否可再生、原子利用率、能耗、毒性、排放、耐用性和回收路径都需要边界清楚的数据。</>}
  >
    <svg viewBox="0 0 640 300" role="img" aria-label={`${topicTitle}${route}，回收${recycled}%，废弃${waste}%`}>
      <title>{topicTitle}材料生命周期</title><desc>原料、制造、使用和回收处置四个阶段相连，循环路线把部分材料返回制造阶段。</desc>
      {['原料', '制造', '使用', '回收/处置'].map((label, index) => <g key={label}><rect className="science-stage" x={48 + index * 145} y="102" width="112" height="66" rx="6" /><text className="science-label" x={104 + index * 145} y="142" textAnchor="middle">{label}</text>{index < 3 && <path className="science-process-arrow" d={`M ${162 + index * 145} 135 h 27`} />}</g>)}
      {route === '循环利用' && <path className="science-recycle-path" d="M 540 178 C 520 252 240 262 210 178" />}
      <rect className="science-bar-track" x="90" y="222" width="460" height="22" rx="3" /><rect className="science-material-recycled" x="90" y="222" width={460 * recycled / 100} height="22" rx="3" /><rect className="science-material-waste" x={90 + 460 * recycled / 100} y="222" width={460 * waste / 100} height="22" rx="3" />
      <text className="science-label" x="90" y="278">回流 {recycled}%</text><text className="science-label" x="550" y="278" textAnchor="end">最终废弃 {waste}%</text>
    </svg>
  </MathVisualFrame>
}
