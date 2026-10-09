import React from 'react';
import { Link } from 'react-router-dom';
import { Store, User, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 tracking-tight mb-4">
          Spa<span className="text-indigo-600">Connect</span>
        </h1>
        <p className="text-lg text-slate-600 max-w-xl mx-auto">
          The ultimate platform connecting premium Spa Shops with professional Freelance Therapists in real-time.
        </p>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-6 max-w-4xl w-full">
        {/* Shop Card */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-8 rounded-3xl shadow-xl shadow-indigo-100 border border-indigo-50 flex flex-col items-center text-center group hover:-translate-y-1 transition-transform"
        >
          <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <Store size={40} />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-3">For Spa Shops</h2>
          <p className="text-slate-500 mb-8 flex-1">
            Short on staff today? Broadcast a job request and get a verified freelance therapist within minutes.
          </p>
          <div className="w-full space-y-3">
            <Link to="/shop/freelance-request" className="block w-full bg-indigo-600 text-white font-semibold py-3 rounded-xl hover:bg-indigo-700 transition-colors">
              Go to Dashboard (Demo)
            </Link>
            <Link to="/register/shop" className="block w-full bg-indigo-50 text-indigo-700 font-semibold py-3 rounded-xl hover:bg-indigo-100 transition-colors">
              Register Shop
            </Link>
          </div>
        </motion.div>

        {/* Therapist Card */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-8 rounded-3xl shadow-xl shadow-blue-100 border border-blue-50 flex flex-col items-center text-center group hover:-translate-y-1 transition-transform"
        >
          <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <User size={40} />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-3">For Therapists</h2>
          <p className="text-slate-500 mb-8 flex-1">
            Looking for extra income? Accept freelance requests near you and work on your own schedule.
          </p>
          <div className="w-full space-y-3">
            <Link to="/freelance/radar" className="block w-full bg-blue-600 text-white font-semibold py-3 rounded-xl hover:bg-blue-700 transition-colors">
              Open Job Radar (Demo)
            </Link>
            <Link to="/register/therapist" className="block w-full bg-blue-50 text-blue-700 font-semibold py-3 rounded-xl hover:bg-blue-100 transition-colors">
              Register Therapist
            </Link>
          </div>
        </motion.div>
      </div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="mt-12 text-center"
      >
        <Link to="/admin" className="text-slate-400 hover:text-slate-600 text-sm font-medium flex items-center justify-center gap-1">
          Super Admin Login <ArrowRight size={14} />
        </Link>
      </motion.div>
    </div>
  );
};
