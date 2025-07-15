"use client";
import { useEffect, useState } from "react";
import { FiLogOut, FiCopy, FiCheck, FiUser } from "react-icons/fi";
import { toast } from "react-toastify";
import { AnimatePresence, motion } from "framer-motion";
import { useAccount, useDisconnect } from "wagmi";

const WalletConnect = () => {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const [copied, setCopied] = useState(false);
  const [showWalletMenu, setShowWalletMenu] = useState(false);

  const copyAddress = () => {
    if (!address) return;
    navigator.clipboard.writeText(address);
    setCopied(true);
    toast.success("Address copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative">
      <AnimatePresence>
        {!isConnected ? null : (
          <motion.div
            key="connected-state"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-3"
          >
            <div className="relative group">
              <button
                onClick={copyAddress}
                className="flex items-center gap-1 px-3 py-1.5 bg-gray-800 rounded-full text-sm font-mono hover:border-purple-500"
              >
                <span className="text-purple-400">
                  {address?.slice(0, 6)}...{address?.slice(-4)}
                </span>
                {copied ? <FiCheck /> : <FiCopy />}
              </button>
            </div>

            <button
              onClick={() => setShowWalletMenu(!showWalletMenu)}
              className="p-2 bg-gray-800 rounded-full hover:bg-gray-700"
            >
              <FiUser />
            </button>

            {showWalletMenu && (
              <motion.div
                className="absolute top-full right-0 mt-2 bg-gray-900 rounded-lg shadow-lg border border-gray-700 z-50"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="p-2 text-sm">
                  <div className="px-4 py-2 text-gray-400">Connected with Wallet</div>
                  <button
                    onClick={()=>disconnect()}
                    className="w-full px-4 py-2 text-left hover:bg-gray-800 rounded"
                  >
                    Disconnect
                  </button>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default WalletConnect;