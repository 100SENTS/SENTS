// Wallet View
const WalletView = ({ wallet, balances, transactions, connect, onBuy, onSell, onSwap }) => {
  const [showSwap, setShowSwap] = useState(false);

  const totalValue = balances.reduce((acc, b) => acc + (parseFloat(b.bal) * (b.symbol === '100' ? 1000 : 1)), 0); // rough estimate

  return (
    <div className="view-enter max-w-4xl mx-auto px-4 py-8">
      {showSwap && <PiteasIframe onClose={() => setShowSwap(false)} />}

      <div className="holo-card p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-xs text-[var(--text-secondary)] font-mono mb-1">CONNECTED ADDRESS</div>
            <div className="text-lg text-[var(--accent-primary)] font-mono break-all">{wallet || 'Not Connected'}</div>
          </div>
          <div className="text-right">
            <div className="text-xs text-[var(--text-secondary)] font-mono">TOTAL VALUE</div>
            <div className="text-xl font-bold text-[var(--text-primary)]">${totalValue.toFixed(2)}</div>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2 mt-4">
          <button onClick={onBuy} className="p-3 bg-[var(--accent-primary)]/10 hover:bg-[var(--accent-primary)]/20 rounded-lg flex flex-col items-center gap-1">
            <ShoppingCart size={20} className="text-[var(--accent-primary)]" />
            <span className="text-xs font-mono">Buy</span>
          </button>
          <button onClick={onSell} className="p-3 bg-[var(--accent-secondary)]/10 hover:bg-[var(--accent-secondary)]/20 rounded-lg flex flex-col items-center gap-1">
            <CreditCard size={20} className="text-[var(--accent-secondary)]" />
            <span className="text-xs font-mono">Sell</span>
          </button>
          <button onClick={() => setShowSwap(true)} className="p-3 bg-[var(--accent-primary)]/10 hover:bg-[var(--accent-primary)]/20 rounded-lg flex flex-col items-center gap-1">
            <SwapIcon size={20} className="text-[var(--accent-primary)]" />
            <span className="text-xs font-mono">Swap</span>
          </button>
          <button className="p-3 bg-[var(--accent-secondary)]/10 hover:bg-[var(--accent-secondary)]/20 rounded-lg flex flex-col items-center gap-1">
            <Send size={20} className="text-[var(--accent-secondary)]" />
            <span className="text-xs font-mono">Send</span>
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="holo-card p-6">
          <h3 className="text-lg font-mono text-[var(--accent-primary)] mb-4">ASSETS</h3>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {balances.map((b, i) => (
              <div key={i} className="flex justify-between items-center p-3 bg-[var(--bg-primary)] rounded-lg">
                <div className="flex items-center gap-2">
                  <span className="text-[var(--text-primary)] font-bold">{b.symbol}</span>
                  {b.addr && <CopyableAddress address={b.addr} symbol={b.symbol} showSymbol={false} />}
                </div>
                <span className="text-[var(--text-primary)] font-mono">{b.bal}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <RecentTransactions txs={transactions} />
        </div>
      </div>
    </div>
  );
};

// Trajectory View
const TrajectoryView = () => (
  <div className="view-enter max-w-4xl mx-auto px-4 py-8 space-y-4">
     <h2 className="text-4xl font-bold text-[var(--text-primary)] text-center mb-12">TRAJECTORY</h2>
     {PROJECT_DETAILS.phases.map(p => (
        <div key={p.id} className="holo-card p-6 flex gap-4 items-center hover:bg-[var(--bg-secondary)] transition-colors">
           <div className="text-4xl font-black text-[var(--text-secondary)] font-mono">0{p.id}</div>
           <div>
              <h3 className={`font-bold uppercase text-[var(--accent-primary)]`}>{p.title}</h3>
              <p className="text-sm text-[var(--text-secondary)] font-mono">{p.desc}</p>
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
  const [transactions, setTransactions] = useState([]);
  const [currentTheme, setCurrentTheme] = useState('dark');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Apply theme
  useEffect(() => {
    const theme = THEMES[currentTheme];
    if (theme) {
      Object.keys(theme).forEach(key => {
        document.documentElement.style.setProperty(key, theme[key]);
      });
    }
  }, [currentTheme]);

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
    const savedTheme = localStorage.getItem('100sents_theme');
    if (savedTheme && THEMES[savedTheme]) {
      setCurrentTheme(savedTheme);
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

  useEffect(() => {
    localStorage.setItem('100sents_theme', currentTheme);
  }, [currentTheme]);

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
      { symbol: '100', name: 'The 100', addr: TOKEN_100_ADDRESS, dec: 18 },
      { symbol: 'SENTS', name: '100SENTS Stable', addr: SENTS_ADDRESS, dec: 18 },
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
         bals.push({ symbol: t.symbol, name: t.name, bal: parseFloat(fmt).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 6}), addr: t.addr });
       } catch(e) { bals.push({ symbol: t.symbol, name: t.name, bal: '0.00', addr: t.addr }); }
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

  const handleBuy = () => {
    window.open(RAMP_LINKS.provex, '_blank');
  };

  const handleSell = () => {
    window.open(RAMP_LINKS.peer, '_blank');
  };

  const navItems = [
    { id: 'landing', label: 'HOME', icon: Home },
    { id: 'mint', label: 'MINT 100', icon: Hourglass },
    { id: 'forge', label: 'FORGE', icon: Box },
    { id: 'yield', label: 'YIELD', icon: Zap },
    { id: 'trajectory', label: 'TRAJECTORY', icon: Map },
    { id: 'wallet', label: 'WALLET', icon: Wallet }
  ];

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] font-sans selection:bg-[var(--accent-primary)]/30 overflow-x-hidden">
      <style>{baseStyles}</style>
      <div className="sci-fi-grid"></div>
      
      <div className="relative z-10 p-6">
        <header className="flex justify-between items-center mb-8 max-w-7xl mx-auto">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('landing')}>
            <div className="w-10 h-10 bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-secondary)] rounded flex items-center justify-center text-black font-bold text-xl">¢</div>
            <span className="text-2xl font-bold tracking-widest text-[var(--text-primary)] font-mono">100SENTS</span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-2 bg-[var(--bg-secondary)] p-1.5 rounded-full border border-[var(--border)]">
            {navItems.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-full text-xs font-bold font-mono uppercase transition-all ${
                  activeTab === tab.id
                    ? 'bg-[var(--accent-primary)] text-black'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <ThemeSwitcher currentTheme={currentTheme} setTheme={setCurrentTheme} />
            
            <button
              onClick={connect}
              className="px-4 py-2 border border-[var(--accent-primary)]/50 text-[var(--accent-primary)] hover:bg-[var(--accent-primary)]/10 font-mono text-xs font-bold uppercase tracking-widest rounded"
            >
              {wallet ? (wallet.slice(0,6) + '...' + wallet.slice(-4)) : 'CONNECT'}
            </button>

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <CloseIcon size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </header>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden fixed inset-0 z-50 bg-[var(--bg-primary)] p-6">
            <div className="flex justify-end mb-8">
              <button onClick={() => setMobileMenuOpen(false)}>
                <CloseIcon size={24} />
              </button>
            </div>
            <nav className="flex flex-col gap-4">
              {navItems.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`px-4 py-3 rounded-lg text-left font-bold font-mono uppercase ${
                    activeTab === tab.id
                      ? 'bg-[var(--accent-primary)] text-black'
                      : 'text-[var(--text-secondary)]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        )}

        <div className="max-w-7xl mx-auto">
          {activeTab === 'landing' && <LandingPage setActiveTab={setActiveTab} />}
          {activeTab === 'mint' && <MintView wallet={wallet} connect={connect} provider={provider} updateBalances={updateBalances} addTransaction={addTransaction} />}
          {activeTab === 'forge' && <ForgeInterface wallet={wallet} connect={connect} provider={provider} updateBalances={updateBalances} addTransaction={addTransaction} />}
          {activeTab === 'yield' && <YieldView wallet={wallet} connect={connect} provider={provider} updateBalances={updateBalances} addTransaction={addTransaction} />}
          {activeTab === 'trajectory' && <TrajectoryView />}
          {activeTab === 'wallet' && (
            <WalletView
              wallet={wallet}
              balances={balances}
              transactions={transactions}
              connect={connect}
              onBuy={handleBuy}
              onSell={handleSell}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default App;
