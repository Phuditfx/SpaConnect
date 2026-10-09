import { createBrowserRouter, Navigate } from 'react-router-dom';
import { ShopLayout } from '../layouts/ShopLayout';
import { TherapistLayout } from '../layouts/TherapistLayout';
import { SuperAdminLayout } from '../layouts/SuperAdminLayout';
import { ProtectedRoute } from './ProtectedRoute';
import { ShopBroadcastPage } from '../features/freelance-shop/pages/ShopBroadcastPage';
import { TherapistRadarPage } from '../features/freelance-therapist/pages/TherapistRadarPage';
import { TherapistRegisterPage } from '../features/auth/pages/TherapistRegisterPage';
import { ShopRegisterPage } from '../features/auth/pages/ShopRegisterPage';
import { VerificationDashboard } from '../features/super-admin/pages/VerificationDashboard';
import { LandingPage } from '../pages/LandingPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <LandingPage />,
  },
  {
    path: '/register/therapist',
    element: <TherapistRegisterPage />,
  },
  {
    path: '/register/shop',
    element: <ShopRegisterPage />,
  },
  {
    path: '/admin',
    element: <ProtectedRoute allowedRoles={['admin']} />,
    children: [
      {
        path: '',
        element: <SuperAdminLayout />,
        children: [
          {
            path: '',
            element: <Navigate to="verification" replace />,
          },
          {
            path: 'verification',
            element: <VerificationDashboard />,
          },
          {
            path: 'users',
            element: <div className="p-8">Users Management Placeholder</div>,
          },
          {
            path: 'activity',
            element: <div className="p-8">Activity Log Placeholder</div>,
          }
        ],
      },
    ],
  },
  {
    path: '/shop',
    element: <ProtectedRoute allowedRoles={['shop']} />,
    children: [
      {
        path: '',
        element: <ShopLayout />,
        children: [
          {
            path: '',
            element: <div className="p-8">Shop Dashboard Placeholder</div>,
          },
          {
            path: 'freelance-request',
            element: <ShopBroadcastPage />,
          },
          {
            path: 'settings',
            element: <div className="p-8">Settings Placeholder</div>,
          },
        ],
      },
    ],
  },
  {
    path: '/freelance',
    element: <ProtectedRoute allowedRoles={['therapist']} />,
    children: [
      {
        path: '',
        element: <TherapistLayout />,
        children: [
          {
            path: '',
            element: <Navigate to="radar" replace />,
          },
          {
            path: 'radar',
            element: <TherapistRadarPage />,
          },
          {
            path: 'profile',
            element: <div className="p-8 text-slate-800">Therapist Profile Placeholder</div>,
          },
          {
            path: 'jobs',
            element: <div className="p-8 text-slate-800">My Jobs Placeholder</div>,
          },
        ],
      },
    ],
  },
]);
