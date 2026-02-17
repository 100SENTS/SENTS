import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import {
  Wallet, ArrowRight, CheckCircle, AlertTriangle,
  Zap, Layers, TrendingUp, Shield, Activity,
  RefreshCw, Hourglass, ExternalLink,
  ArrowDown, Flame, Coins, Scale,
  Box, Sparkles, Network, XCircle, Ghost,
  Fingerprint, FileKey, X, Radio, Hexagon, Rocket, Map,
  ChevronDown, Maximize2, Minimize2, Home, Plus, Minus, Lock,
  History, Repeat, LinkIcon
} from 'lucide-react';

// ==============================================
// DEPLOYED CONTRACT ADDRESSES – UPDATED
// ==============================================
const MANAGER_ADDRESS = "0x3cbb97A5B89731Eb3424a818F148b5cB21Aa027b";
const TOKEN_100_ADDRESS = "0xaad060534d1BE34EFD24F919c0fa051F67b80C7F";
const SENTS_ADDRESS = "0x7dF16f1c80A5c1AE4922dF141B976eD883d9F5b2";

// LP Token Addresses
const LP_100_SENTS = "0x23df1F336697B50DA0D6F1fdC4d765f98459e172";
const LP_DAI_100 = "0x37582B81DAa89264b775746037f44978e3Ed1Aa3";
const LP_DAI_SENTS = "0x7a92b06EfE2dC236B93B04C78dA3d3981143F003";

// DEX Pair for Chart (DAI/100)
const DAI_100_PAIR = "0x37582b81daa89264b775746037f44978e3ed1aa3";

const PULSECHAIN_CHAIN_ID = '0x171'; // 369
const PULSECHAIN_RPC = 'https://rpc.pulsechain.com';

// ==============================================
// COMPLETE ABI FOR MANAGER
// ==============================================
const MANAGER_ABI = [
  "function mintThe100(uint256 amount100) external payable",
  "function mintThe100WithToken(address token, uint256 amount100) external",
  "function forgeSents(address token, uint256 amount, address recipient) external",
  "function unforgeSents(address token, uint256 sentsAmount, address recipient) external",
  "function stake(uint256 amount, bool isLP) external",
  "function unstake(uint256 amount, bool isLP) external",
  "function claimFees(bool isLP) external",
  "function claimLpReward() external",
  "function pendingFeeRewards(address user, bool isLP, address token) view returns (uint256)",
  "function pendingLpReward(address user) view returns (uint256)",
  "function totalSingleStake() view returns (uint256)",
  "function totalLpStake() view returns (uint256)",
  "function feeRewardPerTokenStored(address) view returns (uint256)",
  "function lpRewardPerTokenStored() view returns (uint256)",
  "function stablecoins(uint256) view returns (address)",
  "function getStablecoins() view returns (address[])",
  "function isForgeAsset(address) view returns (bool)",
  "function assetRates(address) view returns (uint256)",
  "function singleStakes(address) view returns (uint256 amount, uint256 lastUpdate, uint256 lpRewards)",
  "function lpStakes(address) view returns (uint256 amount, uint256 lastUpdate, uint256 lpRewards)",
  "function getStakedAmount(address user, bool isLP) view returns (uint256)",
  "function ownerMint(address to, uint256 amount, bool isSents) external"
];

const ERC20_ABI = [
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function balanceOf(address account) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",
  "function name() view returns (string)",
  "function totalSupply() view returns (uint256)"
];

// ==============================================
// APPROVED ASSETS (Stablecoins only)
// ==============================================
const MINT_TOKENS = [
  { symbol: 'DAI', name: 'Dai from Ethereum', addr: "0xefD766cCb38EaF1dfd701853BFCe31359239F305", decimals: 18 },
  { symbol: 'USDC', name: 'USDC from Ethereum', addr: "0x15D38573d2feeb82e7ad5187aB8c1D52810B1f07", decimals: 6 },
  { symbol: 'USDT', name: 'USDT from Ethereum', addr: "0x0Cb6F5a34ad42ec934882A05265A7d5F59b51A2f", decimals: 6 },
];

const LP_TOKENS = [
  { symbol: '100/SENTS LP', name: '100/SENTS PulseX LP', addr: LP_100_SENTS, decimals: 18 },
  { symbol: 'DAI/100 LP', name: 'DAI/100 PulseX LP', addr: LP_DAI_100, decimals: 18 },
  { symbol: 'DAI/SENTS LP', name: 'DAI/SENTS PulseX LP', addr: LP_DAI_SENTS, decimals: 18 },
];

const RICH_TOKENS = [
  { symbol: 'WPLS', addr: "0xA1077a294dDE1B09bB078844df40758a5D0f9a27", decimals: 18 },
  { symbol: 'PLSX', addr: "0x95B303987A60C71504D99Aa1b13B4DA07b0790ab", decimals: 18 },
  { symbol: 'INC', addr: "0x2fa878Ab3F87CC1C9737Fc071108F904c0B0C95d", decimals: 18 },
  { symbol: 'HEX', addr: "0x2b591e99afE9f32eAA6214f7B7629768c40Eeb39", decimals: 8 },
  { symbol: 'eHEX', addr: "0x57fde0a71132198BBeC939B98976993d8D89D225", decimals: 8 },
  { symbol: 'WETH', addr: "0x02DcdD04e3F455D838cd1249292C58f3B79e3C3C", decimals: 18 }
];

// ==============================================
// PROJECT DETAILS (Enhanced explanations)
// ==============================================
const PROJECT_DETAILS = {
  overview: `100SENTS is a privacy‑centric stable unit protocol built on PulseChain. 
    It replaces the traditional dollar peg with SENTS (1 SENT = $0.01) and anchors the system around 
    a hyper‑scarce governance token, "The 100". The protocol is designed to be fully autonomous, 
    with no oracles or external dependencies.`,
  vision: `We envision a future where financial sovereignty is the norm. 100SENTS enables 
    private, peer‑to‑peer transactions with a stable unit that is not controlled by any central authority. 
    The upcoming "Constant" phase will introduce a revolutionary backing mechanism – 
    the first stablecoin ever to be backed by a universal constant, making it truly unstoppable.`,
  arbitrage: `When liquidity pools launch, "The 100" will trade freely on PulseX. 
    If the market price rises above the $1,000 minting cost, arbitrageurs can mint new "The 100" 
    here and sell them on the DEX for a profit, simultaneously stabilising the price. 
    This mechanism ensures that "The 100" never strays far from its fundamental value.`,
  fees: `Every forge or unforge transaction incurs a 1% fee. 
    This fee is split: 50% goes to stakers (both single and LP), 30% to the Reserve, 
    and 20% to Operations (buy & burn). Stakers earn fees in the stablecoin they helped facilitate.`,
  backing: `SENTS are always backed 1:1 by bridged Ethereum stablecoins (DAI, USDC, USDT) 
    held in the contract. Phase 4, "The Constant", will introduce a new type of backing – 
    a universal constant that has never been used before in DeFi. This will make SENTS 
    the most resilient stablecoin on earth, fully independent of any fiat system.`,
  emission: `Only 100 "The 100" tokens will ever be minted by the public. 
    An additional 100 tokens are emitted over 10 months (10 per month) exclusively to 
    LP stakers. After the emission period ends, the supply becomes deflationary via 
    buy‑and‑burn mechanisms. The total maximum supply is 200.`,
  phases: [
    { id: 1, title: "Genesis", desc: "Smart contract deployment, security audits, and community building. The foundation is laid." },
    { id: 2, title: "Ignition", desc: "Mainnet launch. Public minting of 'The 100' begins at $1,000 per token. SENTS forge goes live." },
    { id: 3, title: "Expansion", desc: "Liquidity pools are created on PulseX. Arbitrageurs stabilise the peg. Staking rewards commence." },
    { id: 4, title: "The Constant", desc: "A revolutionary shift: SENTS becomes backed by a universal constant. No more fiat dependency. zk‑integration for private transactions." },
    { id: 5, title: "The Shift", desc: "A 24‑hour pause, after which all liquidity migrates to decentralised baskets. Full autonomy achieved." }
  ]
};

// ==============================================
// STYLES (Neon Yellow/Orange)
// ==============================================
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Rajdhani:wght@400;600;700&display=swap');
  :root { --neon-yellow: #FFB347; --neon-orange: #FF8C00; --deep-space: #050505; --panel-bg: rgba(10, 15, 20, 0.85); }
  body { background-color: var(--deep-space); font-family: 'Rajdhani', sans-serif; color: #e0e0e0; overflow-x: hidden; }
  .font-mono { font-family: 'Share Tech Mono', monospace; }
  .sci-fi-grid { position: fixed; top: 0; left: 0; width: 200%; height: 200%; background-image: linear-gradient(rgba(255, 179, 71, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 140, 0, 0.03) 1px, transparent 1px); background-size: 40px 40px; transform: perspective(500px) rotateX(60deg) translateY(-100px) translateZ(-200px); animation: gridMove 20s linear infinite; pointer-events: none; z-index: 0; }
  @keyframes gridMove { 0% { transform: perspective(500px) rotateX(60deg) translateY(0) translateZ(-200px); } 100% { transform: perspective(500px) rotateX(60deg) translateY(40px) translateZ(-200px); } }
  .holo-card { background: var(--panel-bg); border: 1px solid rgba(255, 179, 71, 0.2); box-shadow: 0 0 20px rgba(255, 140, 0, 0.1); backdrop-filter: blur(10px); position: relative; overflow: hidden; }
  .holo-card::before { content: ''; position: absolute; top: 0; left: 0; width: 100%; height: 2px; background: linear-gradient(90deg, transparent, var(--neon-yellow), transparent); animation: scanHorizontal 3s ease-in-out infinite; opacity: 0.5; }
  @keyframes scanHorizontal { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
  .view-enter { animation: zoomIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
  @keyframes zoomIn { from { opacity: 0; transform: scale(0.98) translateY(10px); } to { opacity: 1; transform: scale(1) translateY(0); } }
  ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-track { background: #000; } ::-webkit-scrollbar-thumb { background: #333; } ::-webkit-scrollbar-thumb:hover { background: var(--neon-yellow); }
  .neon-yellow { color: var(--neon-yellow); }
  .neon-orange { color: var(--neon-orange); }
  .bg-neon-yellow { background-color: var(--neon-yellow); }
  .bg-neon-orange { background-color: var(--neon-orange); }
  .border-neon-yellow { border-color: var(--neon-yellow); }
  .border-neon-orange { border-color: var(--neon-orange); }
`;

// ==============================================
// COMPONENTS
// ==============================================

// Transaction Modal
const TransactionModal = ({ isOpen, onClose, status, title, hash, step }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in">
      <div className="holo-card w-full max-w-md p-1 border-l-4 border-l-[var(--neon-yellow)]">
        <div className="bg-black/90 p-8 relative">
          <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-[var(--neon-yellow)]"><X size={20}/></button>
          <div className="text-center">
             {status === 'pending' && <RefreshCw className="animate-spin text-[var(--neon-yellow)] mx-auto mb-4" size={48} />}
             {status === 'approving' && <Lock className="animate-pulse text-[var(--neon-orange)] mx-auto mb-4" size={48} />}
             {status === 'success' && <CheckCircle className="text-green-500 mx-auto mb-4" size={48} />}
             {status === 'error' && <AlertTriangle className="text-red-500 mx-auto mb-4" size={48} />}
             
             <h3 className="text-2xl font-bold text-white mb-2 font-mono uppercase tracking-wider">
               {status === 'approving' ? 'APPROVING TOKEN' : status === 'pending' ? 'CONFIRMING' : status === 'success' ? 'COMPLETE' : 'ERROR'}
             </h3>
             <p className="text-sm text-gray-400 font-mono mb-6">{title}</p>
             {step && <div className="text-xs text-[var(--neon-yellow)] font-mono mb-4">{step}</div>}
             
             {hash && <a href={`https://scan.pulsechain.com/tx/${hash}`} target="_blank" rel="noreferrer" className="block text-xs text-[var(--neon-yellow)] hover:underline mb-4">View Transaction</a>}
          </div>
        </div>
      </div>
    </div>
  );
};

// Dex Chart (DexScreener) – Updated to use DAI/100 pair for mint page
const DexChart = ({ pairAddress = DAI_100_PAIR }) => {
  const [expanded, setExpanded] = useState(false);
  
  if (expanded) {
    return (
      <div className="fixed inset-0 z-50 bg-black/95 p-4 flex flex-col">
        <div className="flex justify-end mb-2">
          <button onClick={() => setExpanded(false)} className="text-white flex items-center gap-2 font-mono hover:text-[var(--neon-yellow)]"><Minimize2 size={16}/> CLOSE VIEW</button>
        </div>
        <iframe src={`https://dexscreener.com/pulsechain/${pairAddress}?embed=1&theme=dark`} className="w-full h-full border-0 rounded-lg"></iframe>
      </div>
    );
  }
  
  return (
    <div className="w-full h-64 border border-white/10 bg-black/50 rounded-xl overflow-hidden relative group">
      <button onClick={() => setExpanded(true)} className="absolute top-2 right-2 bg-black/80 p-2 text-gray-400 hover:text-white rounded opacity-0 group-hover:opacity-100 transition-opacity z-10">
        <Maximize2 size={16} />
      </button>
      <iframe src={`https://dexscreener.com/pulsechain/${pairAddress}?embed=1&theme=dark&info=0`} className="w-full h-full border-0"></iframe>
    </div>
  );
};

// Piteas Iframe
const PiteasIframe = () => (
  <div className="w-full h-[600px] rounded-lg overflow-hidden border border-white/10">
    <iframe 
      src="https://app.piteas.io" 
      className="w-full h-full"
      sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
      title="Piteas DEX"
    />
  </div>
);

// Recent Transactions
const RecentTransactions = ({ txs }) => {
  if (!txs.length) {
    return (
      <div className="holo-card p-6 text-center text-gray-500 font-mono">
        No transactions yet.
      </div>
    );
  }
  return (
    <div className="holo-card p-4 max-h-80 overflow-y-auto">
      <h3 className="text-sm font-mono text-[var(--neon-yellow)] mb-3 flex items-center gap-2"><History size={14} /> RECENT TRANSACTIONS</h3>
      {txs.map((tx, i) => (
        <div key={i} className="flex justify-between items-center py-2 border-b border-white/5 text-xs font-mono">
          <span className="text-gray-400">{tx.type}</span>
          <span className="text-white">{tx.amount}</span>
          <a href={`https://scan.pulsechain.com/tx/${tx.hash}`} target="_blank" rel="noreferrer" className="text-[var(--neon-yellow)] hover:underline">
            <ExternalLink size={12} />
          </a>
        </div>
      ))}
    </div>
  );
};

// Project Info Sidebar
const ProjectInfoSidebar = () => (
  <div className="space-y-4">
    <div className="holo-card p-4 bg-black/50">
      <h3 className="text-sm font-mono text-[var(--neon-yellow)] mb-2">🌌 OVERVIEW</h3>
      <p className="text-xs text-gray-400 leading-relaxed">{PROJECT_DETAILS.overview}</p>
    </div>
    <div className="holo-card p-4 bg-black/50">
      <h3 className="text-sm font-mono text-[var(--neon-yellow)] mb-2">🔮 VISION</h3>
      <p className="text-xs text-gray-400 leading-relaxed">{PROJECT_DETAILS.vision}</p>
    </div>
    <div className="holo-card p-4 bg-black/50">
      <h3 className="text-sm font-mono text-[var(--neon-yellow)] mb-2">📈 ARBITRAGE</h3>
      <p className="text-xs text-gray-400 leading-relaxed">{PROJECT_DETAILS.arbitrage}</p>
    </div>
    <div className="holo-card p-4 bg-black/50">
      <h3 className="text-sm font-mono text-[var(--neon-yellow)] mb-2">💸 FEE DISTRIBUTION</h3>
      <p className="text-xs text-gray-400 leading-relaxed">{PROJECT_DETAILS.fees}</p>
    </div>
    <div className="holo-card p-4 bg-black/50">
      <h3 className="text-sm font-mono text-[var(--neon-yellow)] mb-2">🔒 BACKING</h3>
      <p className="text-xs text-gray-400 leading-relaxed">{PROJECT_DETAILS.backing}</p>
    </div>
    <div className="holo-card p-4 bg-black/50">
      <h3 className="text-sm font-mono text-[var(--neon-yellow)] mb-2">📉 EMISSION & DEFLATION</h3>
      <p className="text-xs text-gray-400 leading-relaxed">{PROJECT_DETAILS.emission}</p>
    </div>
  </div>
);

// Landing Page (Enhanced)
const LandingPage = ({ setActiveTab }) => (
  <div className="view-enter max-w-6xl mx-auto px-4 py-12">
    <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
      <div>
        <h1 className="text-7xl font-black text-white mb-4 tracking-tighter">
          100<span className="text-[var(--neon-yellow)]">SENTS</span>
        </h1>
        <p className="text-2xl text-gray-400 font-mono mb-6">
          THE FUTURE OF FINANCIAL PRIVACY
        </p>
        <p className="text-gray-300 mb-8 text-lg">
          A privacy‑centric stable unit aggregator and scarcity engine on PulseChain. 
          Escape the centralized control system.
        </p>
        <div className="flex gap-4">
          <button onClick={() => setActiveTab('mint')} className="px-6 py-3 bg-[var(--neon-yellow)] text-black font-bold font-mono hover:bg-[var(--neon-orange)] transition-colors">
            MINT 100
          </button>
          <button onClick={() => setActiveTab('forge')} className="px-6 py-3 border border-[var(--neon-yellow)] text-[var(--neon-yellow)] font-mono hover:bg-[var(--neon-yellow)]/10">
            FORGE SENTS
          </button>
        </div>
      </div>
      <div className="holo-card p-6 bg-black/50">
        <h2 className="text-xl font-mono text-white mb-4">⚡ QUICK FACTS</h2>
        <ul className="space-y-3 text-sm text-gray-300">
          <li>• <span className="text-[var(--neon-yellow)]">The 100</span>: Max supply 200 tokens (100 public mint + 100 emissions)</li>
          <li>• <span className="text-[var(--neon-yellow)]">SENTS</span>: 1 SENT = $0.01, backed 1:1 by stables</li>
          <li>• 1% fee on all forges – 50% to stakers</li>
          <li>• LP stakers earn 10 additional 100 tokens per month (for 10 months)</li>
          <li>• Phase 4: Backing by a universal constant – first in DeFi</li>
          <li>• zk‑integrated privacy by default</li>
        </ul>
      </div>
    </div>

    <div className="grid md:grid-cols-3 gap-6 mb-16">
      {PROJECT_DETAILS.phases.map(phase => (
        <div key={phase.id} className="holo-card p-4 bg-black/50">
          <div className="text-2xl font-black text-gray-700 font-mono">0{phase.id}</div>
          <h3 className="text-lg font-bold text-[var(--neon-yellow)] mb-2">{phase.title}</h3>
          <p className="text-xs text-gray-400">{phase.desc}</p>
        </div>
      ))}
    </div>

    <div className="holo-card p-8 bg-black/50 text-center max-w-3xl mx-auto">
      <h2 className="text-2xl font-mono text-white mb-4">🔮 THE CONSTANT – A WORLD FIRST</h2>
      <p className="text-gray-300 mb-4">
        In Phase 4, SENTS will become the first stablecoin backed by a <span className="text-[var(--neon-yellow)]">universal constant</span> – 
        a breakthrough that eliminates any reliance on fiat or oracles. This constant is derived from 
        fundamental physics and mathematics, making it truly unstoppable and independent of any government 
        or institution. Combined with zk‑proofs, every transaction becomes private and trustless.
      </p>
      <p className="text-sm text-gray-500 italic">
        After the minting phases complete, "The 100" enters a deflationary era via buy‑and‑burn. 
        How high can it go? The market will decide.
      </p>
    </div>
  </div>
);

// Mint View
const MintView = ({ wallet, connect, provider, updateBalances, addTransaction }) => {
  const [amount, setAmount] = useState(1);
  const [selectedToken, setSelectedToken] = useState(MINT_TOKENS[0]);
  const [txState, setTxState] = useState({ open: false, status: 'idle', title: '', step: '' });
  const [userBalance, setUserBalance] = useState('0');
  const [rate, setRate] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!provider || !selectedToken) return;
      try {
        const manager = new ethers.Contract(MANAGER_ADDRESS, MANAGER_ABI, provider);
        const r = await manager.assetRates(selectedToken.addr);
        setRate(r);
        if (wallet) {
          const tokenContract = new ethers.Contract(selectedToken.addr, ERC20_ABI, provider);
          const bal = await tokenContract.balanceOf(wallet);
          setUserBalance(ethers.utils.formatUnits(bal, selectedToken.decimals));
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchData();
  }, [wallet, provider, selectedToken]);

  const handleMint = async () => {
    if (!wallet) return connect();
    if (!rate || rate.isZero()) {
      alert('Minting not enabled for this token');
      return;
    }
    setTxState({ open: true, status: 'approving', title: `Minting ${amount} x "100"`, step: 'Preparing...' });

    try {
      const signer = provider.getSigner();
      const manager = new ethers.Contract(MANAGER_ADDRESS, MANAGER_ABI, signer);
      const tokenContract = new ethers.Contract(selectedToken.addr, ERC20_ABI, signer);

      const amount100Wei = ethers.utils.parseUnits(amount.toString(), 18);
      const costWei = amount100Wei.mul(rate).div(ethers.constants.WeiPerEther);

      const allowance = await tokenContract.allowance(wallet, MANAGER_ADDRESS);
      if (allowance.lt(costWei)) {
        const approveTx = await tokenContract.approve(MANAGER_ADDRESS, ethers.constants.MaxUint256);
        setTxState(s => ({ ...s, status: 'pending', step: 'Approving Token...' }));
        await approveTx.wait();
      }

      setTxState(s => ({ ...s, status: 'pending', step: 'Minting "The 100"...' }));
      const tx = await manager.mintThe100WithToken(selectedToken.addr, amount100Wei);
      const receipt = await tx.wait();

      setTxState({ open: true, status: 'success', title: 'Mint Successful', hash: tx.hash });
      addTransaction({
        type: 'Mint 100',
        amount: `${amount} 100`,
        hash: tx.hash,
        timestamp: Date.now()
      });
      updateBalances();
    } catch (e) {
      console.error(e);
      setTxState({ open: true, status: 'error', title: 'Transaction Failed', step: e.reason || e.message });
    }
  };

  const displayCost = rate ? (parseFloat(amount) * 1000).toLocaleString() : '...';

  return (
    <div className="view-enter max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-start px-4">
      <TransactionModal isOpen={txState.open} onClose={() => setTxState({ open: false })} {...txState} />

      <div className="space-y-6">
        <h1 className="text-6xl font-black text-white leading-none tracking-tighter">
          MINT 100.<br />
          <span className="text-[var(--neon-yellow)]">BUILD SENTS.</span>
        </h1>

        <div className="holo-card p-6 border-l-4 border-[var(--neon-yellow)]">
          <h3 className="text-lg font-bold text-[var(--neon-yellow)] font-mono mb-2 flex items-center gap-2">
            <AlertTriangle size={16} /> MINTING PHASE ACTIVE
          </h3>
          <p className="text-sm text-gray-400 mb-2">
            Cost is hard‑pegged at <strong>$1,000 Equivalent</strong> in approved stablecoins.
          </p>
          <p className="text-xs text-gray-500 italic">
            Arbitrage Opportunity: If market price > $1,000, mint here and sell on PulseX to stabilise the peg.
          </p>
        </div>

        <div className="holo-card p-6 bg-black/50">
          <h4 className="text-md font-bold text-white mb-3 font-mono flex items-center gap-2">
            <Hexagon size={16} className="text-[var(--neon-yellow)]" /> Why hold <span className="text-[var(--neon-yellow)]">The 100</span>?
          </h4>
          <ul className="text-sm text-gray-300 space-y-2 list-disc pl-5 font-mono">
            <li>Governance rights over the protocol.</li>
            <li>Earn 25% of all protocol fees via single staking.</li>
            <li>LP stakers earn an additional 120‑token emission (10 per month).</li>
            <li>Hyper‑scarce supply – only 200 will ever exist.</li>
          </ul>
          <p className="text-xs text-gray-500 mt-3 italic">
            When liquidity pools launch, price will float. Mint at $1,000 cost and sell above peg to capture arbitrage.
          </p>
        </div>

        {/* Chart now shows DAI/100 pair as requested */}
        <DexChart pairAddress={DAI_100_PAIR} />
      </div>

      <div className="holo-card p-8 bg-black/80">
        <div className="space-y-6">
          <div>
            <label className="text-xs text-gray-500 font-mono block mb-2">QUANTITY</label>
            <div className="flex items-center bg-[#111] border border-white/10 p-2">
              <button onClick={() => setAmount(Math.max(0.1, parseFloat((amount-0.1).toFixed(1))))} className="p-2 hover:text-white"><Minus size={16}/></button>
              <input type="number" value={amount} onChange={e => setAmount(e.target.value)} className="flex-1 bg-transparent text-center font-mono text-2xl outline-none" step="0.1" min="0.1" />
              <button onClick={() => setAmount(parseFloat((amount+0.1).toFixed(1)))} className="p-2 hover:text-white"><Plus size={16}/></button>
            </div>
            <div className="flex justify-between mt-2 text-xs">
              <span className="text-gray-500">Balance: {parseFloat(userBalance).toFixed(4)} {selectedToken.symbol}</span>
              <div className="flex gap-2">
                <button onClick={() => setAmount(parseFloat((userBalance * 0.25 / 1000).toFixed(1)))} className="px-2 py-1 bg-white/10 hover:bg-white/20 rounded">25%</button>
                <button onClick={() => setAmount(parseFloat((userBalance * 0.5 / 1000).toFixed(1)))} className="px-2 py-1 bg-white/10 hover:bg-white/20 rounded">50%</button>
                <button onClick={() => setAmount(parseFloat((userBalance * 0.75 / 1000).toFixed(1)))} className="px-2 py-1 bg-white/10 hover:bg-white/20 rounded">75%</button>
                <button onClick={() => setAmount(parseFloat((userBalance / 1000).toFixed(1)))} className="px-2 py-1 bg-white/10 hover:bg-white/20 rounded">MAX</button>
              </div>
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-500 font-mono block mb-2">PAYMENT ASSET (STABLECOINS)</label>
            <select
              className="w-full bg-[#111] border border-white/10 p-3 text-white font-mono outline-none"
              onChange={(e) => setSelectedToken(MINT_TOKENS.find((t) => t.symbol === e.target.value))}
            >
              {MINT_TOKENS.map((t) => (
                <option key={t.symbol} value={t.symbol}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-between bg-white/5 p-4 rounded">
            <span className="text-gray-400 text-xs font-mono">TOTAL COST</span>
            <span className="text-white font-mono text-xl">
              {displayCost} {selectedToken.symbol}
            </span>
          </div>

          <button
            onClick={handleMint}
            className="w-full py-4 bg-[var(--neon-yellow)] text-black font-bold font-mono hover:bg-[var(--neon-orange)] transition-colors uppercase tracking-widest"
          >
            {wallet ? 'INITIATE MINT' : 'CONNECT WALLET'}
          </button>
        </div>
      </div>
    </div>
  );
};

// Forge Interface
const ForgeInterface = ({ wallet, connect, provider, updateBalances, addTransaction }) => {
  const [mode, setMode] = useState('forge');
  const [amount, setAmount] = useState('');
  const [token, setToken] = useState(MINT_TOKENS[0]);
  const [recipient, setRecipient] = useState('');
  const [txState, setTxState] = useState({ open: false, status: 'idle', title: '', step: '' });
  const [userBalance, setUserBalance] = useState('0');
  const [isForgeable, setIsForgeable] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!wallet || !provider) return;
      try {
        const manager = new ethers.Contract(MANAGER_ADDRESS, MANAGER_ABI, provider);
        if (mode === 'forge') {
          const forgeable = await manager.isForgeAsset(token.addr);
          setIsForgeable(forgeable);
          const tokenContract = new ethers.Contract(token.addr, ERC20_ABI, provider);
          const bal = await tokenContract.balanceOf(wallet);
          setUserBalance(ethers.utils.formatUnits(bal, token.decimals));
        } else {
          const sentsContract = new ethers.Contract(SENTS_ADDRESS, ERC20_ABI, provider);
          const bal = await sentsContract.balanceOf(wallet);
          setUserBalance(ethers.utils.formatUnits(bal, 18));
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchData();
  }, [wallet, provider, mode, token]);

  const handleForge = async () => {
    if (!wallet) return connect();
    if (!amount || parseFloat(amount) <= 0) return alert('Enter amount');
    if (mode === 'forge' && !isForgeable) return alert('Token not enabled for forging');
    setTxState({ open: true, status: 'approving', title: mode === 'forge' ? 'FORGE SENTS' : 'UNFORGE SENTS' });

    try {
      const signer = provider.getSigner();
      const manager = new ethers.Contract(MANAGER_ADDRESS, MANAGER_ABI, signer);
      const targetRecipient = recipient || wallet;

      if (mode === 'forge') {
        const tokenContract = new ethers.Contract(token.addr, ERC20_ABI, signer);
        const valWei = ethers.utils.parseUnits(amount, token.decimals);
        const allowance = await tokenContract.allowance(wallet, MANAGER_ADDRESS);
        if (allowance.lt(valWei)) {
          setTxState(s => ({ ...s, status: 'pending', step: 'Approving Stablecoin...' }));
          const txApp = await tokenContract.approve(MANAGER_ADDRESS, ethers.constants.MaxUint256);
          await txApp.wait();
        }
        setTxState(s => ({ ...s, status: 'pending', step: 'Forging SENTS...' }));
        const tx = await manager.forgeSents(token.addr, valWei, targetRecipient);
        await tx.wait();
        setTxState({ open: true, status: 'success', title: 'Forge Complete', hash: tx.hash });
        addTransaction({ type: 'Forge SENTS', amount: `${amount} ${token.symbol} → SENTS`, hash: tx.hash, timestamp: Date.now() });
      } else {
        const sentsContract = new ethers.Contract(SENTS_ADDRESS, ERC20_ABI, signer);
        const sentsWei = ethers.utils.parseUnits(amount, 18);
        const allowance = await sentsContract.allowance(wallet, MANAGER_ADDRESS);
        if (allowance.lt(sentsWei)) {
          setTxState(s => ({ ...s, step: 'Approving SENTS...' }));
          const txApp = await sentsContract.approve(MANAGER_ADDRESS, ethers.constants.MaxUint256);
          await txApp.wait();
        }
        setTxState(s => ({ ...s, status: 'pending', step: 'Unforging...' }));
        const tx = await manager.unforgeSents(token.addr, sentsWei, targetRecipient);
        await tx.wait();
        setTxState({ open: true, status: 'success', title: 'Unforge Complete', hash: tx.hash });
        addTransaction({ type: 'Unforge SENTS', amount: `${amount} SENTS → ${token.symbol}`, hash: tx.hash, timestamp: Date.now() });
      }
      updateBalances();
    } catch (e) {
      console.error(e);
      setTxState({ open: true, status: 'error', title: 'Transaction Failed', step: e.reason || e.message });
    }
  };

  const outputAmount = amount
    ? mode === 'forge'
      ? (parseFloat(amount) * 100 * 0.99).toFixed(2)
      : (parseFloat(amount) / 100 * 0.99).toFixed(6)
    : '0';

  return (
    <div className="view-enter max-w-4xl mx-auto px-4">
      <TransactionModal isOpen={txState.open} onClose={() => setTxState({ open: false })} {...txState} />

      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white flex items-center justify-center gap-3">
          <Box className="text-[var(--neon-yellow)]" /> SENTS FORGE
        </h2>
        <p className="text-gray-500 font-mono text-sm mt-2">1 SENTS = $0.01 USD. 1% Protocol Fee applies.</p>
      </div>

      <div className="holo-card p-8">
        <div className="flex mb-8 bg-[#111] p-1 rounded-lg border border-white/10">
          <button
            onClick={() => setMode('forge')}
            className={`flex-1 py-2 font-mono text-sm ${
              mode === 'forge' ? 'bg-[var(--neon-yellow)] text-black font-bold' : 'text-gray-500'
            }`}
          >
            FORGE
          </button>
          <button
            onClick={() => setMode('unforge')}
            className={`flex-1 py-2 font-mono text-sm ${
              mode === 'unforge' ? 'bg-[var(--neon-orange)] text-black font-bold' : 'text-gray-500'
            }`}
          >
            UNFORGE
          </button>
        </div>

        <div className="space-y-6">
          <div className="bg-[#111] p-4 border border-white/10 rounded-lg">
            <label className="text-xs text-gray-500 font-mono block mb-2">INPUT</label>
            <div className="flex gap-4">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="bg-transparent text-3xl font-mono text-white outline-none w-full"
              />
              {mode === 'forge' ? (
                <select
                  className="bg-black border border-white/20 text-white px-3 font-mono"
                  onChange={(e) => setToken(MINT_TOKENS.find((t) => t.symbol === e.target.value))}
                >
                  {MINT_TOKENS.map((t) => (
                    <option key={t.symbol} value={t.symbol}>
                      {t.symbol}
                    </option>
                  ))}
                </select>
              ) : (
                <span className="text-[var(--neon-yellow)] font-bold font-mono pt-2">SENTS</span>
              )}
            </div>
            <div className="flex justify-between mt-2 text-xs">
              <span className="text-gray-500">Balance: {parseFloat(userBalance).toFixed(6)} {mode === 'forge' ? token.symbol : 'SENTS'}</span>
              <div className="flex gap-2">
                <button onClick={() => setAmount((userBalance * 0.25).toFixed(6))} className="px-2 py-1 bg-white/10 hover:bg-white/20 rounded">25%</button>
                <button onClick={() => setAmount((userBalance * 0.5).toFixed(6))} className="px-2 py-1 bg-white/10 hover:bg-white/20 rounded">50%</button>
                <button onClick={() => setAmount((userBalance * 0.75).toFixed(6))} className="px-2 py-1 bg-white/10 hover:bg-white/20 rounded">75%</button>
                <button onClick={() => setAmount(userBalance)} className="px-2 py-1 bg-white/10 hover:bg-white/20 rounded">MAX</button>
              </div>
            </div>
          </div>

          <div className="flex justify-center">
            <ArrowDown className={mode === 'forge' ? 'text-[var(--neon-yellow)]' : 'text-[var(--neon-orange)]'} />
          </div>

          <div className="bg-[#111] p-4 border border-white/10 rounded-lg">
            <label className="text-xs text-gray-500 font-mono block mb-2">OUTPUT</label>
            <div className="flex gap-4 items-center">
              <div className="text-3xl font-mono text-white w-full">{outputAmount}</div>
              {mode === 'forge' ? (
                <span className="text-[var(--neon-yellow)] font-bold font-mono">SENTS</span>
              ) : (
                <span className="text-white font-mono">{token.symbol}</span>
              )}
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-500 font-mono block mb-2">RECIPIENT (optional, for privacy)</label>
            <input
              type="text"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder="Leave empty to send to yourself"
              className="w-full bg-[#111] border border-white/10 p-3 text-white font-mono outline-none"
            />
          </div>

          <div className="text-xs text-gray-500 font-mono space-y-1 border-t border-white/10 pt-4">
            <div className="flex justify-between">
              <span>Fee (1%)</span>
              <span>{(amount * 0.01).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-[var(--neon-yellow)]">
              <span>Distribution:</span>
              <span>50% Stakers / 30% Reserve / 20% Operations</span>
            </div>
          </div>

          <button
            onClick={handleForge}
            className={`w-full py-4 font-bold font-mono transition-colors uppercase ${
              mode === 'forge'
                ? 'bg-[var(--neon-yellow)] text-black hover:bg-[var(--neon-orange)]'
                : 'bg-[var(--neon-orange)] text-black hover:bg-[var(--neon-yellow)]'
            }`}
          >
            {mode === 'forge' ? 'EXECUTE FORGE' : 'EXECUTE UNFORGE'}
          </button>
        </div>
      </div>
    </div>
  );
};

// Yield View (Staking) – Updated with correct LP token address
const YieldView = ({ wallet, connect, provider, updateBalances, addTransaction }) => {
  const [stakeType, setStakeType] = useState('single');
  const [amount, setAmount] = useState('');
  const [txState, setTxState] = useState({ open: false, status: 'idle' });
  const [userStake, setUserStake] = useState('0');
  const [totalStake, setTotalStake] = useState('0');
  const [userShare, setUserShare] = useState(0);
  const [pendingFees, setPendingFees] = useState({});
  const [pendingLp, setPendingLp] = useState('0');
  const [stablecoins, setStablecoins] = useState([]);
  const [decimalsMap, setDecimalsMap] = useState({});
  const [stakeBalance, setStakeBalance] = useState('0');

  // Fetch stake token balance (100 or LP)
  useEffect(() => {
    const fetchStakeBalance = async () => {
      if (!wallet || !provider) return;
      try {
        const tokenAddr = stakeType === 'single' ? TOKEN_100_ADDRESS : LP_100_SENTS;
        const tokenContract = new ethers.Contract(tokenAddr, ERC20_ABI, provider);
        const bal = await tokenContract.balanceOf(wallet);
        setStakeBalance(ethers.utils.formatUnits(bal, 18));
      } catch (e) {
        setStakeBalance('0');
      }
    };
    fetchStakeBalance();
  }, [wallet, provider, stakeType]);

  // Fetch all staking data
  const fetchData = async () => {
    if (!wallet || !provider) return;
    try {
      const signer = provider.getSigner();
      const manager = new ethers.Contract(MANAGER_ADDRESS, MANAGER_ABI, signer);

      const userStakeWei = await manager.getStakedAmount(wallet, stakeType === 'lp');
      setUserStake(userStakeWei.toString());

      const totalStakeWei = stakeType === 'single'
        ? await manager.totalSingleStake()
        : await manager.totalLpStake();
      setTotalStake(totalStakeWei.toString());

      const share = totalStakeWei.isZero() ? 0 : userStakeWei.mul(10000).div(totalStakeWei).toNumber() / 100;
      setUserShare(share);

      const stableList = await manager.getStablecoins();
      setStablecoins(stableList);

      const decimals = {};
      for (let addr of stableList) {
        try {
          const token = new ethers.Contract(addr, ERC20_ABI, provider);
          decimals[addr] = await token.decimals();
        } catch {
          decimals[addr] = 18;
        }
      }
      setDecimalsMap(decimals);

      const fees = {};
      for (let addr of stableList) {
        const pending = await manager.pendingFeeRewards(wallet, stakeType === 'lp', addr);
        fees[addr] = pending.toString();
      }
      setPendingFees(fees);

      if (stakeType === 'lp') {
        const lpReward = await manager.pendingLpReward(wallet);
        setPendingLp(lpReward.toString());
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [wallet, provider, stakeType]);

  const handleStake = async () => {
    if (!wallet) return connect();
    if (!amount || parseFloat(amount) <= 0) return alert('Enter amount');
    setTxState({ open: true, status: 'approving', title: stakeType === 'single' ? 'STAKE 100' : 'STAKE LP' });

    try {
      const signer = provider.getSigner();
      const manager = new ethers.Contract(MANAGER_ADDRESS, MANAGER_ABI, signer);
      const tokenAddr = stakeType === 'single' ? TOKEN_100_ADDRESS : LP_100_SENTS;
      const tokenContract = new ethers.Contract(tokenAddr, ERC20_ABI, signer);
      const stakeWei = ethers.utils.parseUnits(amount, 18);

      const allowance = await tokenContract.allowance(wallet, MANAGER_ADDRESS);
      if (allowance.lt(stakeWei)) {
        const txApp = await tokenContract.approve(MANAGER_ADDRESS, ethers.constants.MaxUint256);
        setTxState(s => ({ ...s, step: 'Approving...' }));
        await txApp.wait();
      }

      setTxState(s => ({ ...s, status: 'pending', step: 'Staking...' }));
      const tx = await manager.stake(stakeWei, stakeType === 'lp');
      await tx.wait();

      setTxState({ open: true, status: 'success', title: 'Stake Successful', hash: tx.hash });
      addTransaction({ type: stakeType === 'single' ? 'Stake 100' : 'Stake LP', amount: `${amount} tokens`, hash: tx.hash, timestamp: Date.now() });
      updateBalances();
      fetchData();
    } catch (e) {
      console.error(e);
      setTxState({ open: true, status: 'error', title: 'Transaction Failed', step: e.reason || e.message });
    }
  };

  const handleUnstake = async () => {
    if (!wallet) return connect();
    if (!amount || parseFloat(amount) <= 0) return alert('Enter amount');
    setTxState({ open: true, status: 'approving', title: stakeType === 'single' ? 'UNSTAKE 100' : 'UNSTAKE LP' });

    try {
      const signer = provider.getSigner();
      const manager = new ethers.Contract(MANAGER_ADDRESS, MANAGER_ABI, signer);
      const stakeWei = ethers.utils.parseUnits(amount, 18);

      setTxState(s => ({ ...s, status: 'pending', step: 'Unstaking...' }));
      const tx = await manager.unstake(stakeWei, stakeType === 'lp');
      await tx.wait();

      setTxState({ open: true, status: 'success', title: 'Unstake Successful', hash: tx.hash });
      addTransaction({ type: stakeType === 'single' ? 'Unstake 100' : 'Unstake LP', amount: `${amount} tokens`, hash: tx.hash, timestamp: Date.now() });
      updateBalances();
      fetchData();
    } catch (e) {
      console.error(e);
      setTxState({ open: true, status: 'error', title: 'Transaction Failed', step: e.reason || e.message });
    }
  };

  const handleClaimFees = async () => {
    if (!wallet) return connect();
    setTxState({ open: true, status: 'pending', title: 'CLAIMING FEES' });

    try {
      const signer = provider.getSigner();
      const manager = new ethers.Contract(MANAGER_ADDRESS, MANAGER_ABI, signer);
      const tx = await manager.claimFees(stakeType === 'lp');
      await tx.wait();
      setTxState({ open: true, status: 'success', title: 'Fees Claimed', hash: tx.hash });
      addTransaction({ type: 'Claim Fees', amount: 'all', hash: tx.hash, timestamp: Date.now() });
      fetchData();
    } catch (e) {
      console.error(e);
      setTxState({ open: true, status: 'error', title: 'Transaction Failed', step: e.reason || e.message });
    }
  };

  const handleClaimLp = async () => {
    if (!wallet) return connect();
    setTxState({ open: true, status: 'pending', title: 'CLAIMING LP REWARDS' });

    try {
      const signer = provider.getSigner();
      const manager = new ethers.Contract(MANAGER_ADDRESS, MANAGER_ABI, signer);
      const tx = await manager.claimLpReward();
      await tx.wait();
      setTxState({ open: true, status: 'success', title: 'LP Rewards Claimed', hash: tx.hash });
      addTransaction({ type: 'Claim LP Rewards', amount: 'all', hash: tx.hash, timestamp: Date.now() });
      fetchData();
    } catch (e) {
      console.error(e);
      setTxState({ open: true, status: 'error', title: 'Transaction Failed', step: e.reason || e.message });
    }
  };

  const formatFull = (val, decimals = 18) => {
    try {
      return ethers.utils.formatUnits(val, decimals);
    } catch {
      return val;
    }
  };

  return (
    <div className="view-enter max-w-6xl mx-auto px-4">
      <TransactionModal isOpen={txState.open} onClose={() => setTxState({ open: false })} {...txState} />

      <h2 className="text-4xl font-bold text-white text-center mb-8">YIELD NEXUS</h2>

      <div className="flex justify-center mb-8 bg-[#111] p-1 rounded-lg border border-white/10 w-fit mx-auto">
        <button
          onClick={() => setStakeType('single')}
          className={`px-6 py-2 font-mono text-sm ${
            stakeType === 'single' ? 'bg-[var(--neon-yellow)] text-black font-bold' : 'text-gray-500'
          }`}
        >
          SINGLE STAKE (100)
        </button>
        <button
          onClick={() => setStakeType('lp')}
          className={`px-6 py-2 font-mono text-sm ${
            stakeType === 'lp' ? 'bg-[var(--neon-orange)] text-black font-bold' : 'text-gray-500'
          }`}
        >
          LP STAKE (100/SENTS)
        </button>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="holo-card p-6 bg-black/50">
          <h3 className="text-lg font-mono text-white mb-4">YOUR POSITION</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-400 text-sm">Staked</span>
              <span className="text-white font-mono">{formatFull(userStake, 18)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400 text-sm">Total Pool</span>
              <span className="text-white font-mono">{formatFull(totalStake, 18)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400 text-sm">Your Share</span>
              <span className="text-[var(--neon-yellow)] font-mono">{userShare.toFixed(4)}%</span>
            </div>
          </div>
        </div>

        <div className="holo-card p-6 bg-black/50">
          <h3 className="text-lg font-mono text-white mb-4">PENDING REWARDS</h3>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {stablecoins.map((addr) => {
              const symbol = MINT_TOKENS.find((t) => t.addr.toLowerCase() === addr.toLowerCase())?.symbol || addr.slice(0, 6);
              return (
                <div key={addr} className="flex justify-between text-sm">
                  <span className="text-gray-400">{symbol}</span>
                  <span className="text-white font-mono">{formatFull(pendingFees[addr] || '0', decimalsMap[addr] || 18)}</span>
                </div>
              );
            })}
            {stakeType === 'lp' && (
              <div className="flex justify-between text-sm">
                <span className="text-[var(--neon-yellow)]">100 EMISSION</span>
                <span className="text-white font-mono">{formatFull(pendingLp, 18)}</span>
              </div>
            )}
          </div>
        </div>

        <div className="holo-card p-6 bg-black/50">
          <h3 className="text-lg font-mono text-white mb-4">PROJECTED REWARDS</h3>
          {userShare > 0 && (
            <div className="space-y-2 text-sm">
              <p className="text-gray-500 italic">Based on current pool share</p>
              <div className="flex justify-between">
                <span className="text-gray-400">Est. daily fees</span>
                <span className="text-white font-mono">--</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Est. weekly fees</span>
                <span className="text-white font-mono">--</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Est. monthly fees</span>
                <span className="text-white font-mono">--</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Est. yearly fees</span>
                <span className="text-white font-mono">--</span>
              </div>
              {stakeType === 'lp' && (
                <div className="flex justify-between">
                  <span className="text-gray-400">100/year</span>
                  <span className="text-white font-mono">{(userShare / 100 * 120).toFixed(4)}</span>
                </div>
              )}
            </div>
          )}
          {userShare === 0 && (
            <p className="text-gray-500 italic text-xs">Stake to see projections.</p>
          )}
          <p className="text-xs text-gray-600 mt-3 border-t border-white/10 pt-2">
            * APY estimates coming soon with indexer.
          </p>
        </div>
      </div>

      <div className="holo-card p-8 bg-black/50 max-w-2xl mx-auto">
        <h3 className="text-xl font-mono mb-4" style={{ color: stakeType === 'single' ? 'var(--neon-yellow)' : 'var(--neon-orange)' }}>
          {stakeType === 'single' ? 'SINGLE STAKE' : 'LP STAKE'}
        </h3>
        <div className="space-y-4">
          <div>
            <label className="text-xs text-gray-500 font-mono block mb-2">AMOUNT</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.0"
              className="w-full bg-[#111] border border-white/10 p-3 text-white font-mono outline-none"
            />
            <div className="flex justify-between mt-2 text-xs">
              <span className="text-gray-500">Balance: {parseFloat(stakeBalance).toFixed(6)} {stakeType === 'single' ? '100' : 'LP'}</span>
              <div className="flex gap-2">
                <button onClick={() => setAmount((stakeBalance * 0.25).toFixed(6))} className="px-2 py-1 bg-white/10 hover:bg-white/20 rounded">25%</button>
                <button onClick={() => setAmount((stakeBalance * 0.5).toFixed(6))} className="px-2 py-1 bg-white/10 hover:bg-white/20 rounded">50%</button>
                <button onClick={() => setAmount((stakeBalance * 0.75).toFixed(6))} className="px-2 py-1 bg-white/10 hover:bg-white/20 rounded">75%</button>
                <button onClick={() => setAmount(stakeBalance)} className="px-2 py-1 bg-white/10 hover:bg-white/20 rounded">MAX</button>
              </div>
            </div>
          </div>
          <div className="flex gap-4">
            <button
              onClick={handleStake}
              className="flex-1 py-3 border border-[var(--neon-yellow)] text-[var(--neon-yellow)] hover:bg-[var(--neon-yellow)] hover:text-black font-bold font-mono uppercase"
            >
              STAKE
            </button>
            <button
              onClick={handleUnstake}
              className="flex-1 py-3 border border-[var(--neon-orange)] text-[var(--neon-orange)] hover:bg-[var(--neon-orange)] hover:text-black font-bold font-mono uppercase"
            >
              UNSTAKE
            </button>
          </div>
          <div className="flex gap-4 pt-4">
            <button
              onClick={handleClaimFees}
              className="flex-1 py-3 bg-[var(--neon-yellow)] text-black font-bold font-mono uppercase hover:bg-[var(--neon-orange)]"
            >
              CLAIM FEES
            </button>
            {stakeType === 'lp' && (
              <button
                onClick={handleClaimLp}
                className="flex-1 py-3 bg-[var(--neon-orange)] text-black font-bold font-mono uppercase hover:bg-[var(--neon-yellow)]"
              >
                CLAIM LP
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Wallet View
const WalletView = ({ wallet, balances }) => (
  <div className="view-enter max-w-4xl mx-auto px-4">
     <div className="holo-card p-6 mb-6">
        <div className="text-xs text-gray-500 font-mono mb-1">CONNECTED ADDRESS</div>
        <div className="text-lg text-[var(--neon-yellow)] font-mono break-all">{wallet || 'Not Connected'}</div>
     </div>
     <div className="grid gap-3 max-h-96 overflow-y-auto">
        {balances.map((b, i) => (
           <div key={i} className="bg-[#111] border border-white/5 p-4 rounded flex justify-between items-center hover:border-white/20 transition-colors">
              <span className="text-white font-bold">{b.symbol}</span>
              <span className="text-gray-400 font-mono">{b.bal}</span>
           </div>
        ))}
     </div>
  </div>
);

// Trajectory View (Roadmap)
const TrajectoryView = () => (
  <div className="view-enter max-w-4xl mx-auto space-y-4 pb-20">
     <h2 className="text-4xl font-bold text-white text-center mb-12">TRAJECTORY</h2>
     {PROJECT_DETAILS.phases.map(p => (
        <div key={p.id} className="holo-card p-6 flex gap-4 items-center hover:bg-white/5 transition-colors">
           <div className="text-4xl font-black text-gray-800 font-mono">0{p.id}</div>
           <div>
              <h3 className={`font-bold uppercase text-[var(--neon-yellow)]`}>{p.title}</h3>
              <p className="text-sm text-gray-500 font-mono">{p.desc}</p>
           </div>
        </div>
     ))}
  </div>
);

// ==============================================
// MAIN APP
// ==============================================
const App = () => {
  const [activeTab, setActiveTab] = useState('landing');
  const [wallet, setWallet] = useState(null);
  const [balances, setBalances] = useState([]);
  const [provider, setProvider] = useState(null);
  const [rampOpen, setRampOpen] = useState(false);
  const [transactions, setTransactions] = useState([]);

  // Initialize provider
  useEffect(() => {
    if (window.ethereum) {
      const ethProvider = new ethers.providers.Web3Provider(window.ethereum);
      setProvider(ethProvider);
    }
  }, []);

  // Load saved wallet and transactions from localStorage
  useEffect(() => {
    const savedWallet = localStorage.getItem('100sents_wallet');
    if (savedWallet && provider) {
      setWallet(savedWallet);
      updateBalances();
    }
    const savedTxs = localStorage.getItem('100sents_txs');
    if (savedTxs) {
      setTransactions(JSON.parse(savedTxs));
    }
  }, [provider]);

  // Save wallet and transactions when they change
  useEffect(() => {
    if (wallet) localStorage.setItem('100sents_wallet', wallet);
    else localStorage.removeItem('100sents_wallet');
  }, [wallet]);

  useEffect(() => {
    localStorage.setItem('100sents_txs', JSON.stringify(transactions));
  }, [transactions]);

  // Listen for account/chain changes
  useEffect(() => {
    if (window.ethereum) {
      const handleAccountsChanged = (accounts) => {
        if (accounts.length > 0) {
          setWallet(accounts[0]);
          updateBalances();
        } else {
          setWallet(null);
        }
      };
      const handleChainChanged = () => window.location.reload();
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);
      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, []);

  const updateBalances = async () => {
    if(!wallet || !provider) return;
    const signer = provider.getSigner();
    
    const allTokens = [
      { symbol: '100', addr: TOKEN_100_ADDRESS, dec: 18 },
      { symbol: 'SENTS', addr: SENTS_ADDRESS, dec: 18 },
      ...MINT_TOKENS,
      ...LP_TOKENS,
      ...RICH_TOKENS
    ];

    const bals = [];
    for(let t of allTokens) {
       try {
         const c = new ethers.Contract(t.addr, ERC20_ABI, signer);
         const b = await c.balanceOf(wallet);
         const fmt = ethers.utils.formatUnits(b, t.decimals || 18);
         bals.push({ symbol: t.symbol, bal: parseFloat(fmt).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 6}) });
       } catch(e) { bals.push({ symbol: t.symbol, bal: '0.00' }); }
    }
    setBalances(bals);
  };

  const connect = async () => {
    if (window.ethereum) {
       try {
         await window.ethereum.request({ method: 'eth_requestAccounts' });
         const accounts = await provider.listAccounts();
         setWallet(accounts[0]);
         
         try {
           await window.ethereum.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: PULSECHAIN_CHAIN_ID }] });
         } catch(e) {
           if (e.code === 4902) {
             await window.ethereum.request({
               method: 'wallet_addEthereumChain',
               params: [{
                 chainId: PULSECHAIN_CHAIN_ID,
                 chainName: 'PulseChain',
                 nativeCurrency: { name: 'PLS', symbol: 'PLS', decimals: 18 },
                 rpcUrls: [PULSECHAIN_RPC],
                 blockExplorerUrls: ['https://scan.pulsechain.com/']
               }]
             });
           }
         }
         updateBalances();
       } catch(e) { console.error(e); }
    } else { alert("Install MetaMask"); }
  };

  const addTransaction = (tx) => {
    setTransactions(prev => [tx, ...prev].slice(0, 20));
  };

  return (
    <div className="min-h-screen bg-[#050505] text-gray-200 font-sans selection:bg-[var(--neon-yellow)]/30 overflow-x-hidden">
      <style>{STYLES}</style>
      <div className="sci-fi-grid"></div>
      
      <div className="relative z-10 p-6">
        <header className="flex flex-col lg:flex-row justify-between items-center mb-12 relative z-50 gap-4 max-w-7xl mx-auto">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setActiveTab('landing')}>
            <div className="w-10 h-10 bg-gradient-to-br from-[var(--neon-yellow)] to-[var(--neon-orange)] rounded flex items-center justify-center text-black font-bold text-xl shadow-lg shadow-[var(--neon-yellow)]/50">¢</div>
            <span className="text-2xl font-bold tracking-widest text-white font-mono group-hover:text-[var(--neon-yellow)] transition-colors">100SENTS</span>
          </div>
          
          <nav className="flex items-center gap-1 bg-[#111] p-1.5 rounded-full border border-white/10 backdrop-blur-md">
            {[
              { id: 'landing', label: 'HOME', icon: Home },
              { id: 'mint', label: 'MINT 100', icon: Hourglass },
              { id: 'forge', label: 'FORGE', icon: Box }, 
              { id: 'yield', label: 'YIELD', icon: Zap },
              { id: 'trajectory', label: 'TRAJECTORY', icon: Map },
              { id: 'swap', label: 'SWAP', icon: Repeat }
            ].map((tab) => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`px-4 py-2 rounded-full text-[10px] font-bold font-mono uppercase transition-all ${activeTab === tab.id ? 'bg-[var(--neon-yellow)] text-black' : 'text-gray-500 hover:text-white'}`}>
                {tab.label}
              </button>
            ))}
            
            <div className="relative">
               <button onClick={() => setRampOpen(!rampOpen)} className="px-4 py-2 text-[10px] font-bold font-mono uppercase text-gray-500 hover:text-white flex items-center gap-1">
                  ON/OFF RAMP <ChevronDown size={12}/>
               </button>
               {rampOpen && (
                 <div className="absolute top-full mt-2 w-40 bg-[#0a0a0a] border border-white/20 rounded-lg overflow-hidden shadow-xl z-50">
                    <a href="https://app.provex.com" target="_blank" className="block px-4 py-3 hover:bg-white/10 text-xs font-mono text-white">PROVEX.COM</a>
                    <a href="https://peer.xyz" target="_blank" className="block px-4 py-3 hover:bg-white/10 text-xs font-mono text-white">PEER.XYZ</a>
                 </div>
               )}
            </div>

            <div className="w-px h-4 bg-white/10 mx-1"></div>
            <button onClick={() => setActiveTab('wallet')} className={`px-4 py-2 rounded-full text-[10px] font-bold font-mono uppercase ${activeTab === 'wallet' ? 'bg-[var(--neon-yellow)] text-black' : 'text-gray-500 hover:text-white'}`}>
               WALLET
            </button>
          </nav>
          
          <button onClick={connect} className="px-6 py-2 border border-[var(--neon-yellow)]/50 text-[var(--neon-yellow)] hover:bg-[var(--neon-yellow)]/10 font-mono text-xs font-bold uppercase tracking-widest">
            {wallet ? (wallet.slice(0,6) + '...' + wallet.slice(-4)) : 'CONNECT UPLINK'}
          </button>
        </header>

        <div className="max-w-7xl mx-auto">
          {activeTab === 'landing' && <LandingPage setActiveTab={setActiveTab} />}
          
          {['mint', 'forge', 'yield'].includes(activeTab) && (
            <div className="grid lg:grid-cols-4 gap-6">
              <div className="lg:col-span-3">
                {activeTab === 'mint' && <MintView wallet={wallet} connect={connect} provider={provider} updateBalances={updateBalances} addTransaction={addTransaction} />}
                {activeTab === 'forge' && <ForgeInterface wallet={wallet} connect={connect} provider={provider} updateBalances={updateBalances} addTransaction={addTransaction} />}
                {activeTab === 'yield' && <YieldView wallet={wallet} connect={connect} provider={provider} updateBalances={updateBalances} addTransaction={addTransaction} />}
              </div>
              <div className="lg:col-span-1 space-y-4">
                <RecentTransactions txs={transactions} />
                <ProjectInfoSidebar />
              </div>
            </div>
          )}
          
          {activeTab === 'trajectory' && <TrajectoryView />}
          
          {activeTab === 'swap' && (
            <div className="view-enter">
              <h2 className="text-3xl font-bold text-white text-center mb-6">PITEAS DEX</h2>
              <PiteasIframe />
            </div>
          )}
          
          {activeTab === 'wallet' && <WalletView wallet={wallet} balances={balances} />}
        </div>
      </div>
    </div>
  );
};

export default App;
