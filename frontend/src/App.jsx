import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import AccessRestricted from './pages/AccessRestricted';
import NotFoundPage from './pages/NotFoundPage';
import ProtectedRoute from './components/ProtectedRoute';

// Layout Shells
import MerchantLayout from './layouts/MerchantLayout';
import BuyerLayout from './layouts/BuyerLayout';
import AdminLayout from './layouts/AdminLayout';

// View Components
import MerchantDashboard from './components/MerchantDashboard';
import ConversationalCheckout from './components/ConversationalCheckout';
import ProductDetailView from './components/ProductDetailView';
import CartView from './components/CartView';
import CheckoutView from './components/CheckoutView';
import OrderSuccessView from './components/OrderSuccessView';
import OrdersView from './components/OrdersView';
import AgentCommerceCatalog from './components/AgentCommerceCatalog';
import CampaignOrchestratorView from './components/CampaignOrchestratorView';
import AnalyticsView from './components/AnalyticsView';
import AgentNetworkView from './components/AgentNetworkView';
import PolicySettingsView from './components/PolicySettingsView';
import AuditTrailView from './components/AuditTrailView';
import MerchantAICommerceView from './components/MerchantAICommerceView';
import MerchantApprovalsView from './components/MerchantApprovalsView';

export default function App() {
  return (
    <Router>
      <Routes>
        {/* 1. PUBLIC ROUTES */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<AuthPage />} />
        <Route path="/login/merchant" element={<AuthPage />} />
        <Route path="/login/buyer" element={<AuthPage />} />
        <Route path="/login/admin" element={<AuthPage />} />
        <Route path="/403" element={<AccessRestricted />} />

        {/* 2. PROTECTED MERCHANT WORKSPACE ROUTES */}
        <Route element={<ProtectedRoute allowedRoles={['MERCHANT', 'ADMIN']} />}>
          <Route element={<MerchantLayout />}>
            <Route path="/merchant" element={<Navigate to="/merchant/overview" replace />} />
            <Route path="/merchant/overview" element={<MerchantDashboard />} />
            <Route path="/merchant/dashboard" element={<MerchantDashboard />} />
            <Route path="/merchant/ai-commerce" element={<MerchantAICommerceView />} />
            <Route path="/merchant/ai-shopping" element={<Navigate to="/merchant/ai-commerce" replace />} />
            <Route path="/merchant/products" element={<AgentCommerceCatalog />} />
            <Route path="/merchant/products/:productId" element={<ProductDetailView />} />
            <Route path="/merchant/orders" element={<OrdersView />} />
            <Route path="/merchant/orders/:orderId" element={<OrdersView />} />
            <Route path="/merchant/customers" element={<AnalyticsView />} />
            <Route path="/merchant/customers/:customerId" element={<AnalyticsView />} />
            <Route path="/merchant/campaigns" element={<CampaignOrchestratorView />} />
            <Route path="/merchant/campaigns/:campaignId" element={<CampaignOrchestratorView />} />
            <Route path="/merchant/policies" element={<PolicySettingsView />} />
            <Route path="/merchant/approvals" element={<MerchantApprovalsView />} />
            <Route path="/merchant/agent-activity" element={<AgentNetworkView />} />
            <Route path="/merchant/revenue" element={<AnalyticsView />} />
            <Route path="/merchant/audit" element={<AuditTrailView />} />
            <Route path="/merchant/settings" element={<PolicySettingsView />} />
          </Route>
        </Route>

        {/* 3. BUYER WORKSPACE ROUTES (PUBLIC EXPLORATION + PROTECTED CHECKOUT) */}
        <Route element={<BuyerLayout />}>
          <Route path="/buyer" element={<Navigate to="/buyer/ai-shopping" replace />} />
          <Route path="/buyer/ai-shopping" element={<ConversationalCheckout />} />
          <Route path="/buyer/products" element={<AgentCommerceCatalog />} />
          <Route path="/buyer/products/:productId" element={<ProductDetailView />} />
          <Route path="/buyer/cart" element={<CartView />} />

          <Route element={<ProtectedRoute allowedRoles={['AI_BUYER', 'BUYER', 'MERCHANT', 'ADMIN']} />}>
            <Route path="/buyer/checkout" element={<CheckoutView />} />
            <Route path="/buyer/payment/success/:orderId" element={<OrderSuccessView />} />
            <Route path="/buyer/orders" element={<OrdersView />} />
            <Route path="/buyer/orders/:orderId" element={<OrdersView />} />
            <Route path="/buyer/profile" element={<AnalyticsView />} />
          </Route>
        </Route>

        {/* 4. PROTECTED ADMIN CONSOLE ROUTES */}
        <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<Navigate to="/admin/overview" replace />} />
            <Route path="/admin/overview" element={<AgentNetworkView />} />
            <Route path="/admin/merchants" element={<AgentCommerceCatalog />} />
            <Route path="/admin/orders" element={<OrdersView />} />
            <Route path="/admin/payments" element={<AnalyticsView />} />
            <Route path="/admin/agents" element={<AgentNetworkView />} />
            <Route path="/admin/campaigns" element={<CampaignOrchestratorView />} />
            <Route path="/admin/audit" element={<AuditTrailView />} />
            <Route path="/admin/system-health" element={<AgentNetworkView />} />
            <Route path="/admin/settings" element={<PolicySettingsView />} />
          </Route>
        </Route>

        {/* 5. BACKWARD-COMPATIBLE ALIASES */}
        <Route path="/ai-shopping" element={<Navigate to="/buyer/ai-shopping" replace />} />
        <Route path="/cart" element={<Navigate to="/buyer/cart" replace />} />
        <Route path="/checkout" element={<Navigate to="/buyer/checkout" replace />} />
        <Route path="/orders" element={<Navigate to="/buyer/orders" replace />} />
        <Route path="/payment/success/:orderId" element={<OrderSuccessView />} />
        <Route path="/products/:productId" element={<ProductDetailView />} />

        {/* 6. CUSTOM 404 CATCH-ALL */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
}
