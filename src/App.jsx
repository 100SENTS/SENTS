// Yield View – Enhanced with better debugging
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
  const [lpTokenSet, setLpTokenSet] = useState(true);
  const [allowance, setAllowance] = useState('0');
  const [managerBalance, setManagerBalance] = useState('0');

  // Check if LP token is set
  useEffect(() => {
    const checkLpToken = async () => {
      if (!provider) return;
      try {
        const manager = new ethers.Contract(MANAGER_ADDRESS, MANAGER_ABI, provider);
        const lpAddr = await manager.getLpToken();
        setLpTokenSet(lpAddr !== ethers.constants.AddressZero);
      } catch {
        setLpTokenSet(false);
      }
    };
    checkLpToken();
  }, [provider]);

  // Fetch stake token balance (100 or LP)
  useEffect(() => {
    const fetchStakeBalance = async () => {
      if (!wallet || !provider) return;
      try {
        const tokenAddr = stakeType === 'single' ? TOKEN_100_ADDRESS : LP_100_SENTS;
        const tokenContract = new ethers.Contract(tokenAddr, ERC20_ABI, provider);
        const bal = await tokenContract.balanceOf(wallet);
        setStakeBalance(ethers.utils.formatUnits(bal, 18));

        // Also fetch allowance for single stake
        if (stakeType === 'single') {
          const allowanceWei = await tokenContract.allowance(wallet, MANAGER_ADDRESS);
          setAllowance(ethers.utils.formatUnits(allowanceWei, 18));
        }

        // Fetch manager's balance of 100 tokens (for unstaking)
        if (stakeType === 'single') {
          const managerBal = await tokenContract.balanceOf(MANAGER_ADDRESS);
          setManagerBalance(ethers.utils.formatUnits(managerBal, 18));
        }
      } catch (e) {
        console.error(e);
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
    if (stakeType === 'lp' && !lpTokenSet) {
      alert('LP staking is not yet available');
      return;
    }
    setTxState({ open: true, status: 'approving', title: stakeType === 'single' ? 'STAKE 100' : 'STAKE LP' });

    try {
      const signer = provider.getSigner();
      const manager = new ethers.Contract(MANAGER_ADDRESS, MANAGER_ABI, signer);
      const tokenAddr = stakeType === 'single' ? TOKEN_100_ADDRESS : LP_100_SENTS;
      const tokenContract = new ethers.Contract(tokenAddr, ERC20_ABI, signer);
      const stakeWei = ethers.utils.parseUnits(amount, 18);

      // Check allowance
      const allowanceWei = await tokenContract.allowance(wallet, MANAGER_ADDRESS);
      if (allowanceWei.lt(stakeWei)) {
        setTxState(s => ({ ...s, status: 'pending', step: 'Approving...' }));
        const txApp = await tokenContract.approve(MANAGER_ADDRESS, ethers.constants.MaxUint256);
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
      setTxState({
        open: true,
        status: 'error',
        title: 'Transaction Failed',
        step: e.reason || e.message || 'Unknown error',
      });
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
      setTxState({
        open: true,
        status: 'error',
        title: 'Transaction Failed',
        step: e.reason || e.message || 'Unknown error',
      });
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
      setTxState({
        open: true,
        status: 'error',
        title: 'Transaction Failed',
        step: e.reason || e.message || 'Unknown error',
      });
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
      setTxState({
        open: true,
        status: 'error',
        title: 'Transaction Failed',
        step: e.reason || e.message || 'Unknown error',
      });
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
          disabled={!lpTokenSet}
          className={`px-6 py-2 font-mono text-sm ${
            stakeType === 'lp' ? 'bg-[var(--neon-orange)] text-black font-bold' : 
            !lpTokenSet ? 'text-gray-600 cursor-not-allowed' : 'text-gray-500'
          }`}
        >
          LP STAKE (100/SENTS) {!lpTokenSet && '(coming soon)'}
        </button>
      </div>

      {/* Debug Info for Single Stake */}
      {stakeType === 'single' && (
        <div className="grid grid-cols-3 gap-4 mb-4 text-xs font-mono">
          <div className="holo-card p-2 bg-black/30">
            <span className="text-gray-500">Your 100 Balance:</span>
            <span className="text-white ml-2">{parseFloat(stakeBalance).toFixed(4)}</span>
          </div>
          <div className="holo-card p-2 bg-black/30">
            <span className="text-gray-500">Allowance:</span>
            <span className="text-white ml-2">{parseFloat(allowance).toFixed(4)}</span>
          </div>
          <div className="holo-card p-2 bg-black/30">
            <span className="text-gray-500">Manager 100 Balance:</span>
            <span className="text-white ml-2">{parseFloat(managerBalance).toFixed(4)}</span>
          </div>
        </div>
      )}

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
            {stakeType === 'lp' && lpTokenSet && (
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
