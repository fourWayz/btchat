"use client";
import { motion } from "framer-motion";
import { ConnectButton } from "@rainbow-me/rainbowkit";

const RegisterForm = ({
  username,
  setUsername,
  registerUser,
  isLoading,
  isWalletConnected,
}: {
  username: string;
  setUsername: (username: string) => void;
  registerUser: () => void;
  isLoading: boolean;
  isWalletConnected: boolean;
}) => {
  return (
    <motion.div
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="max-w-md mx-auto bg-gray-800/70 backdrop-blur-sm rounded-2xl overflow-hidden shadow-xl border border-gray-700/50"
    >
      <div className="p-8">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-white mb-2">Join BTChat</h2>
          <p className="text-gray-400">Create your decentralized identity</p>
        </div>

        <div className="space-y-6">
          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium text-gray-300 mb-2"
            >
              Choose a username
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="coolusername"
            />
          </div>

          {/* Conditional button */}
          {!isWalletConnected ? (
            <div className="space-y-3">
              <ConnectButton />
              <div className="text-yellow-400 text-sm">
                Please connect your wallet before registering
              </div>
            </div> 
          ) : (
            <button
              onClick={registerUser}
              disabled={isLoading}
              className={`w-full py-3 rounded-lg text-white font-medium ${
                isLoading
                  ? "bg-purple-600 cursor-not-allowed"
                  : "bg-purple-500 hover:bg-purple-600"
              }`}
            >
              {isLoading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  Registering...
                </>
              ) : (
                "Complete Registration"
              )}
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default RegisterForm;
