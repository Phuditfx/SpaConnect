import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Coins, Plus, X, CreditCard, CheckCircle } from 'lucide-react';
import { getCreditBalance, topUpCredits } from '../api/wallet';

interface CreditWalletCardProps {
  branchId: string;
}

export const CreditWalletCard: React.FC<CreditWalletCardProps> = ({ branchId }) => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [amount, setAmount] = useState<number>(100);
  const [showSuccess, setShowSuccess] = useState(false);

  const { data: balance = 0, isLoading } = useQuery({
    queryKey: ['creditBalance', branchId],
    queryFn: () => getCreditBalance(branchId),
    enabled: !!branchId,
  });

  const topUpMutation = useMutation({
    mutationFn: (topUpAmount: number) => topUpCredits(branchId, topUpAmount),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['creditBalance', branchId] });
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        setIsModalOpen(false);
      }, 2000);
    },
    onError: (error: Error) => {
      alert(`Top up failed: ${error.message}`);
    }
  });

  const handleTopUp = () => {
    if (amount <= 0) return;
    topUpMutation.mutate(amount);
  };

  return (
    <>
      <div className="bg-gradient-to-br from-indigo-900 to-indigo-800 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden flex flex-col justify-between h-full">
        {/* Decorative elements */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-indigo-600 rounded-full blur-3xl opacity-50 pointer-events-none"></div>
        <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-purple-600 rounded-full blur-3xl opacity-50 pointer-events-none"></div>

        <div className="relative z-10">
          <div className="flex items-center gap-2 text-indigo-200 mb-2 font-medium">
            <Coins size={18} />
            <span>Credit Balance</span>
          </div>
          {isLoading ? (
            <div className="h-10 w-24 bg-white/20 rounded-lg animate-pulse mb-1"></div>
          ) : (
            <div className="text-4xl font-bold mb-1">{balance.toLocaleString()}</div>
          )}
          <p className="text-xs text-indigo-300">10 credits / Job Broadcast</p>
        </div>

        <button 
          onClick={() => setIsModalOpen(true)}
          className="mt-6 w-full relative z-10 bg-white text-indigo-900 hover:bg-indigo-50 font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm"
        >
          <Plus size={18} />
          Top Up Credits
        </button>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !topUpMutation.isPending && setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white rounded-3xl shadow-2xl overflow-hidden w-full max-w-sm flex flex-col z-10 p-6 text-center"
            >
              {!showSuccess ? (
                <>
                  <div className="flex justify-end mb-2">
                    <button 
                      onClick={() => setIsModalOpen(false)}
                      disabled={topUpMutation.isPending}
                      className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
                    >
                      <X size={20} />
                    </button>
                  </div>
                  
                  <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CreditCard size={32} />
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Top Up Wallet</h3>
                  <p className="text-gray-500 text-sm mb-6">Select amount to top up your account. (Mock Payment)</p>
                  
                  <div className="grid grid-cols-3 gap-3 mb-6">
                    {[50, 100, 500].map((val) => (
                      <button
                        key={val}
                        onClick={() => setAmount(val)}
                        className={`py-2 rounded-xl border-2 font-bold transition-all ${
                          amount === val 
                            ? 'border-indigo-600 bg-indigo-50 text-indigo-700' 
                            : 'border-gray-200 text-gray-600 hover:border-indigo-300'
                        }`}
                      >
                        {val}
                      </button>
                    ))}
                  </div>

                  <button 
                    onClick={handleTopUp}
                    disabled={topUpMutation.isPending}
                    className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 disabled:bg-slate-500"
                  >
                    {topUpMutation.isPending ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      `Pay $${(amount / 10).toFixed(2)}` // Mock exchange rate
                    )}
                  </button>
                </>
              ) : (
                <div className="py-8">
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-20 h-20 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4"
                  >
                    <CheckCircle size={40} />
                  </motion.div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Success!</h3>
                  <p className="text-gray-500">Credits have been added to your wallet.</p>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
