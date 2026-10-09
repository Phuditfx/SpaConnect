import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowLeft, CheckCircle, Upload } from 'lucide-react';
import { KYCUploadZone } from '../components/KYCUploadZone';
import { supabase } from '../../../lib/supabase';
import { uploadKYCDocument } from '../api/auth';
import { useNavigate } from 'react-router-dom';

const therapistSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  fullName: z.string().min(2, 'Full name is required'),
  phoneNumber: z.string().min(9, 'Valid phone number is required'),
  licenseNumber: z.string().min(5, 'License number is required'),
});

type TherapistFormData = z.infer<typeof therapistSchema>;

export const TherapistRegisterPage: React.FC = () => {
  const [step, setStep] = useState(1);
  const [kycFile, setKycFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const { register, handleSubmit, trigger, formState: { errors } } = useForm<TherapistFormData>({
    resolver: zodResolver(therapistSchema),
    mode: 'onTouched',
  });

  const nextStep = async () => {
    // Validate Step 1 fields before proceeding
    const isStep1Valid = await trigger(['email', 'password', 'fullName', 'phoneNumber']);
    if (isStep1Valid) {
      setStep(2);
    }
  };

  const prevStep = () => {
    setStep(1);
  };

  const onSubmit = async (data: TherapistFormData) => {
    if (!kycFile) {
      setFileError('Please upload your license document');
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Sign Up User
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            role: 'therapist',
            full_name: data.fullName,
            phone_number: data.phoneNumber,
          }
        }
      });

      if (authError) throw authError;

      const userId = authData.user?.id;
      if (!userId) throw new Error('Failed to retrieve user ID');

      // Note: A trigger in Supabase should ideally create the `freelance_profiles` row on user insert.
      // Assuming the row is created, we can update it. If not, we might need to insert it here first.
      
      // Let's ensure the profile exists before updating (or update triggers it)
      const { error: upsertError } = await supabase.from('freelance_profiles').upsert({
        id: userId,
        full_name: data.fullName,
        phone_number: data.phoneNumber,
        license_number: data.licenseNumber,
        is_verified: false,
        current_status: 'unavailable'
      });

      if (upsertError) throw upsertError;

      // 2. Upload Document
      await uploadKYCDocument(kycFile, userId);

      setSuccess(true);
    } catch (err: any) {
      alert(`Registration failed: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full text-center"
        >
          <div className="w-20 h-20 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={40} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Registration Complete!</h2>
          <p className="text-gray-500 mb-8">
            Your account has been created and your documents have been submitted for verification. 
            We will notify you once you're approved.
          </p>
          <button 
            onClick={() => navigate('/freelance')}
            className="w-full bg-slate-900 text-white font-medium py-3 rounded-xl hover:bg-slate-800 transition-colors"
          >
            Go to Dashboard
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="text-center text-3xl font-extrabold text-gray-900">
          Join as a Therapist
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Step {step} of 2
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl sm:rounded-3xl sm:px-10 border border-gray-100">
          <form onSubmit={handleSubmit(onSubmit)}>
            
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -20, opacity: 0 }}
                  className="space-y-5"
                >
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <input 
                      {...register('fullName')} 
                      className={`w-full px-4 py-3 rounded-xl border ${errors.fullName ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-indigo-500 outline-none transition-all`}
                      placeholder="Jane Doe"
                    />
                    {errors.fullName && <p className="mt-1 text-xs text-red-500">{errors.fullName.message}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                    <input 
                      {...register('email')} 
                      type="email"
                      className={`w-full px-4 py-3 rounded-xl border ${errors.email ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-indigo-500 outline-none transition-all`}
                      placeholder="jane@example.com"
                    />
                    {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                    <input 
                      {...register('phoneNumber')} 
                      className={`w-full px-4 py-3 rounded-xl border ${errors.phoneNumber ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-indigo-500 outline-none transition-all`}
                      placeholder="081-xxx-xxxx"
                    />
                    {errors.phoneNumber && <p className="mt-1 text-xs text-red-500">{errors.phoneNumber.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                    <input 
                      {...register('password')} 
                      type="password"
                      className={`w-full px-4 py-3 rounded-xl border ${errors.password ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-indigo-500 outline-none transition-all`}
                      placeholder="••••••••"
                    />
                    {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
                  </div>

                  <button 
                    type="button" 
                    onClick={nextStep}
                    className="w-full mt-6 bg-indigo-600 text-white font-medium py-3 rounded-xl hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 group"
                  >
                    Continue
                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: 20, opacity: 0 }}
                  className="space-y-6"
                >
                  <button 
                    type="button" 
                    onClick={prevStep}
                    className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors mb-4"
                  >
                    <ArrowLeft size={16} /> Back
                  </button>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Therapist License Number (SBS)</label>
                    <input 
                      {...register('licenseNumber')} 
                      className={`w-full px-4 py-3 rounded-xl border ${errors.licenseNumber ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-indigo-500 outline-none transition-all`}
                      placeholder="e.g. 12345/2566"
                    />
                    {errors.licenseNumber && <p className="mt-1 text-xs text-red-500">{errors.licenseNumber.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Upload License Certificate (e-KYC)</label>
                    <KYCUploadZone 
                      onFileSelect={(file) => {
                        setKycFile(file);
                        if (file) setFileError('');
                      }} 
                      error={fileError}
                    />
                  </div>

                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full mt-6 bg-slate-900 text-white font-medium py-3 rounded-xl hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 disabled:bg-slate-400"
                  >
                    {isSubmitting ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <Upload size={18} />
                        Submit Registration
                      </>
                    )}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
            
          </form>
        </div>
      </div>
    </div>
  );
};
