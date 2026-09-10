import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import GuardLogin from './GuardLogin';
import GuardDashboard from './GuardDashboard';
import WalkInVisitor from './WalkInVisitor';
import QRScanner from './QRScanner';
import VehicleLookup from './VehicleLookup';
import VisitorLiveApproval from './VisitorLiveApproval';

const GuardAppLayout = () => {
    // Simple auth check wrapper can be added here
    return (
        <Routes>
            <Route path="/" element={<Navigate to="login" replace />} />
            <Route path="login" element={<GuardLogin />} />
            <Route path="dashboard" element={<GuardDashboard />} />
            <Route path="walk-in" element={<WalkInVisitor />} />
            <Route path="live-approval/:entryId" element={<VisitorLiveApproval />} />
            <Route path="qr-scan" element={<QRScanner />} />
            <Route path="vehicle-lookup" element={<VehicleLookup />} />
        </Routes>
    );
};

export default GuardAppLayout;
