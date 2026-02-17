import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import {
  Wallet, ArrowRight, CheckCircle, AlertTriangle,
  Zap, Layers, TrendingUp, Shield, Activity,
  RefreshCw, ChevronLeft, Hourglass, ExternalLink,
  ArrowDown, Flame, Coins, Scale, LayoutDashboard,
  Box, Sparkles, Network, XCircle, Ghost,
  Fingerprint, FileKey, X, Radio, Hexagon, Rocket, Map,
  ChevronDown, Maximize2, Minimize2, Home, Plus, Minus, Lock
} from 'lucide-react';

// ==============================================
// DEPLOYED CONTRACT ADDRESSES – UPDATED
// ==============================================
const MANAGER_ADDRESS = "0xb95757494Fa7d550aA4aFE1D8730934F59D4A222";
const TOKEN_100_ADDRESS = "0x672Cc5284f42217F6B429dc4e6DEC56593a922A5";
const SENTS_ADDRESS = "0xa9488636da235Ee0EEa97D1b6C0273A045BBe200";

const PULSECHAIN_CHAIN_ID = '0x171'; // 369
const PULSECHAIN_RPC = 'https://rpc.pulsechain.com';

// ==============================================
// COMPLETE ABI FOR MANAGER (all functions used)
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
  "function lpStakes(address) view returns (uint256 amount, uint256 lastUpdate, uint256 lpRewards)"
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

const THE100_ABI = [
  "function balanceOf(address) view returns (uint256)",
  "function transfer(address, uint256) returns (bool)",
  ...ERC20_ABI
];

const SENTS_ABI = [
  "function balanceOf(address) view returns (uint256)",
  "function transfer(address, uint256) returns (bool)",
  ...ERC20_ABI
];

// ==============================================
// APPROVED ASSETS (Stablecoins only)
// ==============================================
const MINT_TOKENS = [
  { symbol: 'DAI', name: 'Dai from Ethereum', addr: "0xefD766cCb38EaF1dfd701853BFCe31359239F305", decimals: 18 },
  { symbol: 'USDC', name: 'USDC from Ethereum', addr: "0x15D38573d2feeb82e7ad5187aB8c1D52810B1f07", decimals: 6 },
  { symbol: 'USDT', name: 'USDT from Ethereum', addr: "0x0Cb6F5a34ad42ec934882A05265A7d5F59b51A2f", decimals: 6 },
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
// ROADMAP PHASES
// ==============================================
const ROADMAP_PHASES = [
  { id: 1, title: "Phase 1: Genesis", status: "active", icon: Radio, desc: "Preparing for launch. Security audits, community formation. We are here.", detail: "System Check: Green" },
  { id: 2, title: "Phase 2: Ignition", status: "pending", icon: Flame, desc: "Mainnet Launch. Minting 'The 100'. SENTS Forge online.", detail: "Target: 100 Tokens" },
  { id: 3, title: "Phase 3: Expansion", status: "pending", icon: TrendingUp, desc: "Liquidity Building on PulseX. Arbitrage stabilization.", detail: "Target: Deep Liquidity" },
  { id: 4, title: "Phase 4: The Constant", status: "locked", icon: Hexagon, desc: "Forging a new stable asset pegged to a timeless universal constant.", detail: "Classified: Top Secret" },
  { id: 5, title: "Phase 5: The Shift", status: "locked", icon: Rocket, desc: "24hr Protocol Pause. Liquidity migrates to decentralized baskets.", detail: "Endgame: Autonomy" }
];

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
// TRANSACTION MODAL COMPONENT
// ==============================================
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

// ==============================================
// DEX CHART COMPONENT (DexScreener)
// ==============================================
const DexChart = ({ pairAddress }) => {
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

// ==============================================
// LANDING PAGE
// ==============================================
const LandingPage = ({ setActiveTab }) => (
  <div className="view-enter max-w-6xl mx-auto px-4 py-12 text-center">
    <h1 className="text-7xl font-black text-white mb-6 tracking-tighter">
      100<span className="text-[var(--neon-yellow)]">SENTS</span>
    </h1>
    <p className="text-2xl text-gray-400 font-mono mb-12 max-w-3xl mx-auto">
      THE FUTURE OF FINANCIAL PRIVACY
    </p>
    <div className="grid md:grid-cols-3 gap-6 mb-12">
      <div className="holo-card p-6">
        <Shield className="text-[var(--neon-yellow)] mx-auto mb-4" size={40} />
        <h3 className="text-xl font-bold text-white mb-2">Sovereign</h3>
        <p className="text-gray-400 text-sm">No oracles, no dependencies. Pure code.</p>
      </div>
      <div className="holo-card p-6">
        <Layers className="text-[var(--neon-orange)] mx-auto mb-4" size={40} />
        <h3 className="text-xl font-bold text-white mb-2">Scarce</h3>
        <p className="text-gray-400 text-sm">Only 220 "The 100" will ever exist.</p>
      </div>
      <div className="holo-card p-6">
        <Zap className="text-[var(--neon-yellow)] mx-auto mb-4" size={40} />
        <h3 className="text-xl font-bold text-white mb-2">Private</h3>
        <p className="text-gray-400 text-sm">Forge to any address. Break the link.</p>
      </div>
    </div>
    <button onClick={() => setActiveTab('mint')} className="px-8 py-4 bg-[var(--neon-yellow)] text-black font-bold font-mono text-lg hover:bg-[var(--neon-orange)] transition-colors">
      ENTER THE FORGE
    </button>
  </div>
);

// ==============================================
// MINT VIEW – Stablecoins only, fixed $1000 peg
// ==============================================
const MintView = ({ wallet, connect, provider, updateBalances }) => {
  const [amount, setAmount] = useState(1);
  const [selectedToken, setSelectedToken] = useState(MINT_TOKENS[0]);
  const [txState, setTxState] = useState({ open: false, status: 'idle', title: '', step: '' });
  const [userBalance, setUserBalance] = useState('0');

  useEffect(() => {
    const fetchBalance = async () => {
      if (!wallet || !provider || !selectedToken) return;
      try {
        const tokenContract = new ethers.Contract(selectedToken.addr, ERC20_ABI, provider);
        const bal = await tokenContract.balanceOf(wallet);
        setUserBalance(ethers.utils.formatUnits(bal, selectedToken.decimals));
      } catch (e) {
        setUserBalance('0');
      }
    };
    fetchBalance();
  }, [wallet, provider, selectedToken]);

  const handleMint = async () => {
    if (!wallet) return connect();
    setTxState({ open: true, status: 'approving', title: `Minting ${amount} x "100"`, step: 'Preparing...' });

    try {
      const signer = provider.getSigner();
      const manager = new ethers.Contract(MANAGER_ADDRESS, MANAGER_ABI, signer);
      const tokenContract = new ethers.Contract(selectedToken.addr, ERC20_ABI, signer);

      const costAmount = amount * 1000;
      const costWei = ethers.utils.parseUnits(costAmount.toString(), selectedToken.decimals);

      const allowance = await tokenContract.allowance(wallet, MANAGER_ADDRESS);
      if (allowance.lt(costWei)) {
        const approveTx = await tokenContract.approve(MANAGER_ADDRESS, ethers.constants.MaxUint256);
        setTxState(s => ({ ...s, status: 'pending', step: 'Approving Token...' }));
        await approveTx.wait();
      }

      setTxState(s => ({ ...s, status: 'pending', step: 'Minting "The 100"...' }));
      const mintAmountWei = ethers.utils.parseUnits(amount.toString(), 18);
      const tx = await manager.mintThe100WithToken(selectedToken.addr, mintAmountWei);
      await tx.wait();

      setTxState({ open: true, status: 'success', title: 'Mint Successful', hash: tx.hash });
      updateBalances();
    } catch (e) {
      console.error(e);
      setTxState({ open: true, status: 'error', title: 'Transaction Failed', step: e.reason || e.message });
    }
  };

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
            <li>Hyper‑scarce supply – only 220 will ever exist.</li>
          </ul>
          <p className="text-xs text-gray-500 mt-3 italic">
            When liquidity pools launch, price will float. Mint at $1,000 cost and sell above peg to capture arbitrage.
          </p>
        </div>

        <DexChart pairAddress="0xE56043671df55dE5CDf8459710433C10324DE0aE" />
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
              {(1000 * amount).toLocaleString()} {selectedToken.symbol}
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

// ==============================================
// FORGE INTERFACE – Enhanced error handling, balance, percentages
// ==============================================
const ForgeInterface = ({ wallet, connect, provider, updateBalances }) => {
  const [mode, setMode] = useState('forge'); // 'forge' or 'unforge'
  const [amount, setAmount] = useState('');
  const [token, setToken] = useState(MINT_TOKENS[0]);
  const [recipient, setRecipient] = useState('');
  const [txState, setTxState] = useState({ open: false, status: 'idle', title: '', step: '', error: '' });
  const [allowance, setAllowance] = useState(null);
  const [userBalance, setUserBalance] = useState('0');

  // Fetch allowance
  useEffect(() => {
    const fetchAllowance = async () => {
      if (!wallet || !provider || !amount) return;
      try {
        const signer = provider.getSigner();
        let tokenContract;
        if (mode === 'forge') {
          tokenContract = new ethers.Contract(token.addr, ERC20_ABI, signer);
        } else {
          tokenContract = new ethers.Contract(SENTS_ADDRESS, ERC20_ABI, signer);
        }
        const allowanceWei = await tokenContract.allowance(wallet, MANAGER_ADDRESS);
        setAllowance(allowanceWei);
      } catch (e) {
        setAllowance(null);
      }
    };
    fetchAllowance();
  }, [wallet, provider, mode, token, amount]);

  // Fetch user balance
  useEffect(() => {
    const fetchBalance = async () => {
      if (!wallet || !provider) return;
      try {
        if (mode === 'forge') {
          const tokenContract = new ethers.Contract(token.addr, ERC20_ABI, provider);
          const bal = await tokenContract.balanceOf(wallet);
          setUserBalance(ethers.utils.formatUnits(bal, token.decimals));
        } else {
          const sentsContract = new ethers.Contract(SENTS_ADDRESS, ERC20_ABI, provider);
          const bal = await sentsContract.balanceOf(wallet);
          setUserBalance(ethers.utils.formatUnits(bal, 18));
        }
      } catch (e) {
        setUserBalance('0');
      }
    };
    fetchBalance();
  }, [wallet, provider, mode, token]);

  const handleForge = async () => {
    if (!wallet) return connect();
    if (!amount || parseFloat(amount) <= 0) {
      alert('Enter a valid amount');
      return;
    }
    setTxState({ open: true, status: 'approving', title: mode === 'forge' ? 'FORGE SENTS' : 'UNFORGE SENTS', step: 'Preparing...' });

    try {
      const signer = provider.getSigner();
      const manager = new ethers.Contract(MANAGER_ADDRESS, MANAGER_ABI, signer);
      const targetRecipient = recipient || wallet;

      if (mode === 'forge') {
        const tokenContract = new ethers.Contract(token.addr, ERC20_ABI, signer);
        const valWei = ethers.utils.parseUnits(amount, token.decimals);

        const isForge = await manager.isForgeAsset(token.addr);
        if (!isForge) throw new Error('Token not enabled for forging');

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
      }
      updateBalances();
    } catch (e) {
      console.error(e);
      setTxState({
        open: true,
        status: 'error',
        title: 'Transaction Failed',
        step: e.reason || e.message || 'Unknown error',
      });
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
              <span className="text-gray-500">Balance: {parseFloat(userBalance).toFixed(4)} {mode === 'forge' ? token.symbol : 'SENTS'}</span>
              <div className="flex gap-2">
                <button onClick={() => setAmount((userBalance * 0.25).toFixed(mode === 'forge' ? token.decimals : 2))} className="px-2 py-1 bg-white/10 hover:bg-white/20 rounded">25%</button>
                <button onClick={() => setAmount((userBalance * 0.5).toFixed(mode === 'forge' ? token.decimals : 2))} className="px-2 py-1 bg-white/10 hover:bg-white/20 rounded">50%</button>
                <button onClick={() => setAmount((userBalance * 0.75).toFixed(mode === 'forge' ? token.decimals : 2))} className="px-2 py-1 bg-white/10 hover:bg-white/20 rounded">75%</button>
                <button onClick={() => setAmount(userBalance)} className="px-2 py-1 bg-white/10 hover:bg-white/20 rounded">MAX</button>
              </div>
            </div>
            {allowance && amount && mode === 'forge' && (
              <div className="text-xs text-gray-500 mt-2 font-mono">
                Allowance: {ethers.utils.formatUnits(allowance, token.decimals)} {token.symbol}
              </div>
            )}
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

// ==============================================
// YIELD VIEW – Full staking analytics
// ==============================================
const YieldView = ({ wallet, connect, provider, updateBalances }) => {
  const [stakeType, setStakeType] = useState('single'); // 'single' or 'lp'
  const [amount, setAmount] = useState('');
  const [txState, setTxState] = useState({ open: false, status: 'idle' });
  const [userStake, setUserStake] = useState('0');
  const [totalStake, setTotalStake] = useState('0');
  const [userShare, setUserShare] = useState(0);
  const [pendingFees, setPendingFees] = useState({});
  const [pendingLp, setPendingLp] = useState('0');
  const [stablecoins, setStablecoins] = useState([]);
  const [decimalsMap, setDecimalsMap] = useState({});
  const [feeRates, setFeeRates] = useState({});
  const [lastUpdate, setLastUpdate] = useState(Date.now());
  const [stakeBalance, setStakeBalance] = useState('0');

  // Fetch stake token balance (100 or LP)
  useEffect(() => {
    const fetchStakeBalance = async () => {
      if (!wallet || !provider) return;
      try {
        const tokenAddr = stakeType === 'single' ? TOKEN_100_ADDRESS : '0x0000000000000000000000000000000000000000'; // Replace with real LP address
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

      const userStakeWei = stakeType === 'single'
        ? (await manager.singleStakes(wallet)).amount
        : (await manager.lpStakes(wallet)).amount;
      setUserStake(ethers.utils.formatUnits(userStakeWei, 18));

      const totalStakeWei = stakeType === 'single'
        ? await manager.totalSingleStake()
        : await manager.totalLpStake();
      setTotalStake(ethers.utils.formatUnits(totalStakeWei, 18));

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
        fees[addr] = ethers.utils.formatUnits(pending, decimals[addr] || 18);
      }
      setPendingFees(fees);

      if (stakeType === 'lp') {
        const lpReward = await manager.pendingLpReward(wallet);
        setPendingLp(ethers.utils.formatUnits(lpReward, 18));
      }

      const now = Date.now();
      const timeDiffSeconds = (now - lastUpdate) / 1000;
      if (timeDiffSeconds > 5 && lastUpdate !== Date.now()) {
        const newFeeRates = {};
        for (let addr of stableList) {
          const currentRpt = await manager.feeRewardPerTokenStored(addr);
          const prevRpt = feeRates[addr]?.rpt || ethers.BigNumber.from(0);
          if (prevRpt.gt(0) && currentRpt.gt(prevRpt) && timeDiffSeconds > 0) {
            const increase = currentRpt.sub(prevRpt);
            const perSecond = increase.mul(ethers.constants.WeiPerEther).div(ethers.BigNumber.from(Math.floor(timeDiffSeconds * 1e18)));
            newFeeRates[addr] = {
              rpt: currentRpt,
              annualPerToken: perSecond.mul(365 * 24 * 3600).div(ethers.constants.WeiPerEther),
            };
          } else {
            newFeeRates[addr] = { rpt: currentRpt, annualPerToken: ethers.BigNumber.from(0) };
          }
        }
        setFeeRates(newFeeRates);
        setLastUpdate(now);
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
      const lpTokenAddress = '0x0000000000000000000000000000000000000000'; // Replace later
      const tokenAddr = stakeType === 'single' ? TOKEN_100_ADDRESS : lpTokenAddress;
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
      fetchData();
    } catch (e) {
      console.error(e);
      setTxState({ open: true, status: 'error', title: 'Transaction Failed', step: e.reason || e.message });
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

      {/* Staking Analytics Panel */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="holo-card p-6 bg-black/50">
          <h3 className="text-lg font-mono text-white mb-4">YOUR POSITION</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-400 text-sm">Staked</span>
              <span className="text-white font-mono">{parseFloat(userStake).toFixed(4)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400 text-sm">Total Pool</span>
              <span className="text-white font-mono">{parseFloat(totalStake).toFixed(4)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400 text-sm">Your Share</span>
              <span className="text-[var(--neon-yellow)] font-mono">{userShare.toFixed(2)}%</span>
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
                  <span className="text-white font-mono">{pendingFees[addr] || '0'}</span>
                </div>
              );
            })}
            {stakeType === 'lp' && (
              <div className="flex justify-between text-sm">
                <span className="text-[var(--neon-yellow)]">100 EMISSION</span>
                <span className="text-white font-mono">{pendingLp}</span>
              </div>
            )}
          </div>
        </div>

        <div className="holo-card p-6 bg-black/50">
          <h3 className="text-lg font-mono text-white mb-4">PROJECTED REWARDS</h3>
          {userShare > 0 && (
            <div className="space-y-2 text-sm">
              {stablecoins.map((addr) => {
                const ratePerToken = feeRates[addr]?.annualPerToken;
                if (!ratePerToken || ratePerToken.isZero()) return null;
                const userStakeWei = ethers.utils.parseUnits(userStake, 18);
                const annualRewardWei = userStakeWei.mul(ratePerToken).div(ethers.constants.WeiPerEther);
                const annualReward = ethers.utils.formatUnits(annualRewardWei, decimalsMap[addr] || 18);
                const symbol = MINT_TOKENS.find((t) => t.addr.toLowerCase() === addr.toLowerCase())?.symbol || addr.slice(0, 6);
                return (
                  <div key={addr} className="flex justify-between">
                    <span className="text-gray-400">{symbol}/year</span>
                    <span className="text-white font-mono">{parseFloat(annualReward).toFixed(2)}</span>
                  </div>
                );
              })}
              {stakeType === 'lp' && (
                <div className="flex justify-between">
                  <span className="text-gray-400">100/year</span>
                  <span className="text-white font-mono">
                    {userShare > 0 ? ((userShare / 100) * 120).toFixed(2) : '0'} (est.)
                  </span>
                </div>
              )}
              {Object.keys(feeRates).length === 0 && (
                <p className="text-gray-500 italic text-xs">
                  Fee rate accumulating... check back soon.
                </p>
              )}
            </div>
          )}
          {userShare === 0 && (
            <p className="text-gray-500 italic text-xs">Stake to see projections.</p>
          )}
          <p className="text-xs text-gray-600 mt-3 border-t border-white/10 pt-2">
            * APY estimates based on recent fee accrual. Actual yields vary.
          </p>
        </div>
      </div>

      {/* Stake/Unstake Controls */}
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
              <span className="text-gray-500">Balance: {parseFloat(stakeBalance).toFixed(4)} {stakeType === 'single' ? '100' : 'LP'}</span>
              <div className="flex gap-2">
                <button onClick={() => setAmount((stakeBalance * 0.25).toFixed(4))} className="px-2 py-1 bg-white/10 hover:bg-white/20 rounded">25%</button>
                <button onClick={() => setAmount((stakeBalance * 0.5).toFixed(4))} className="px-2 py-1 bg-white/10 hover:bg-white/20 rounded">50%</button>
                <button onClick={() => setAmount((stakeBalance * 0.75).toFixed(4))} className="px-2 py-1 bg-white/10 hover:bg-white/20 rounded">75%</button>
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

// ==============================================
// WALLET VIEW
// ==============================================
const WalletView = ({ wallet, balances }) => (
  <div className="view-enter max-w-4xl mx-auto px-4">
     <div className="holo-card p-6 mb-6">
        <div className="text-xs text-gray-500 font-mono mb-1">CONNECTED ADDRESS</div>
        <div className="text-lg text-[var(--neon-yellow)] font-mono">{wallet || 'Not Connected'}</div>
     </div>
     <div className="grid gap-3">
        {balances.map((b, i) => (
           <div key={i} className="bg-[#111] border border-white/5 p-4 rounded flex justify-between items-center hover:border-white/20 transition-colors">
              <span className="text-white font-bold">{b.symbol}</span>
              <span className="text-gray-400 font-mono">{b.bal}</span>
           </div>
        ))}
     </div>
  </div>
);

// ==============================================
// TRAJECTORY VIEW (Roadmap)
// ==============================================
const TrajectoryView = () => (
  <div className="view-enter max-w-4xl mx-auto space-y-4 pb-20">
     <h2 className="text-4xl font-bold text-white text-center mb-12">TRAJECTORY</h2>
     {ROADMAP_PHASES.map(p => (
        <div key={p.id} className="holo-card p-6 flex gap-4 items-center hover:bg-white/5 transition-colors">
           <div className="text-4xl font-black text-gray-800 font-mono">0{p.id}</div>
           <div>
              <h3 className={`font-bold uppercase ${p.status === 'active' ? 'text-[var(--neon-yellow)]' : 'text-white'}`}>{p.title}</h3>
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

  // Initialize provider
  useEffect(() => {
    if (window.ethereum) {
      const ethProvider = new ethers.providers.Web3Provider(window.ethereum);
      setProvider(ethProvider);
    }
  }, []);

  // Load saved wallet from localStorage
  useEffect(() => {
    const savedWallet = localStorage.getItem('100sents_wallet');
    if (savedWallet && provider) {
      setWallet(savedWallet);
      updateBalances();
    }
  }, [provider]);

  // Save wallet to localStorage when it changes
  useEffect(() => {
    if (wallet) {
      localStorage.setItem('100sents_wallet', wallet);
    } else {
      localStorage.removeItem('100sents_wallet');
    }
  }, [wallet]);

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
         
         // Switch to PulseChain
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
              { id: 'trajectory', label: 'TRAJECTORY', icon: Map }
            ].map((tab) => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`px-4 py-2 rounded-full text-[10px] font-bold font-mono uppercase transition-all ${activeTab === tab.id ? 'bg-[var(--neon-yellow)] text-black' : 'text-gray-500 hover:text-white'}`}>
                {tab.label}
              </button>
            ))}
            
            {/* On/Off Ramp Dropdown */}
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

        {activeTab === 'landing' && <LandingPage setActiveTab={setActiveTab} />}
        {activeTab === 'mint' && <MintView wallet={wallet} connect={connect} provider={provider} updateBalances={updateBalances} />}
        {activeTab === 'forge' && <ForgeInterface wallet={wallet} connect={connect} provider={provider} updateBalances={updateBalances} />}
        {activeTab === 'yield' && <YieldView wallet={wallet} connect={connect} provider={provider} updateBalances={updateBalances} />}
        {activeTab === 'trajectory' && <TrajectoryView />}
        {activeTab === 'wallet' && <WalletView wallet={wallet} balances={balances} />}
      </div>
    </div>
  );
};

export default App;
