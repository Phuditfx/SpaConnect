import { createBrowserRouter, Navigate } from 'react-router-dom';
import { ShopLayout } from '../layouts/ShopLayout';
import { TherapistLayout } from '../layouts/TherapistLayout';
import { ProtectedRoute } from './ProtectedRoute';
import { ShopBroadcastPage } from '../features/freelance-shop/pages/ShopBroadcastPage';
import { TherapistRadarPage } from '../features/freelance-therapist/pages/TherapistRadarPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/shop/freelance-request" replace />,
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
