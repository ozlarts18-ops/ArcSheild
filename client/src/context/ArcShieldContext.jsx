import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { io } from 'socket.io-client';
import {
  fetchFullState,
  updateAlertLifecycleApi,
  createIncidentApi,
  triggerScenarioApi
} from '../services/api';

const ArcShieldContext = createContext(null);

export function ArcShieldProvider({ children }) {
  const [helmets, setHelmets] = useState([]);
  const [readings, setReadings] = useState({});
  const [alerts, setAlerts] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [timeline, setTimeline] = useState([]);
  const [activeSession, setActiveSession] = useState(null);
  const [workers, setWorkers] = useState([]);

  // UI State
  const [activeView, setActiveView] = useState('OVERVIEW');
  const [selectedHelmetId, setSelectedHelmetId] = useState(null);
  const [selectedZoneFilter, setSelectedZoneFilter] = useState('ALL');
  const [selectedTradeFilter, setSelectedTradeFilter] = useState('ALL');
  const [socketConnected, setSocketConnected] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [isScenarioLoading, setIsScenarioLoading] = useState(false);
  const [activeScenarioName, setActiveScenarioName] = useState('Normal Welding');

  // Load Initial Snapshot
  const loadState = useCallback(async () => {
    try {
      const resp = await fetchFullState();
      if (resp.success && resp.data) {
        setHelmets(resp.data.helmets || []);
        setReadings(resp.data.readings || {});
        setAlerts(resp.data.alerts || []);
        setIncidents(resp.data.incidents || []);
        setTimeline(resp.data.timeline || []);
        setActiveSession(resp.data.activeSession || null);
        setWorkers(resp.data.workers || []);
      }
    } catch (err) {
      console.error('[ArcShield] Failed to load initial state:', err);
    }
  }, []);

  // Initialize Socket.IO connection
  useEffect(() => {
    loadState();

    const socketUrl = import.meta.env.VITE_SOCKET_URL || 
      (import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace(/\/api\/?$/, '') : 'http://localhost:5000');

    let token = null;
    try {
      const savedAuth = localStorage.getItem('arcsheild_auth');
      if (savedAuth) {
        token = JSON.parse(savedAuth).token;
      }
    } catch (e) {
      // Ignore parse error
    }

    const socket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      auth: { token: token ? `Bearer ${token}` : undefined }
    });

    socket.on('connect', () => {
      console.log('[ArcShield Socket] Connected to supervisor server');
      setSocketConnected(true);
    });

    socket.on('disconnect', () => {
      console.log('[ArcShield Socket] Disconnected');
      setSocketConnected(false);
    });

    socket.on('state:full', (data) => {
      if (data.helmets) setHelmets(data.helmets);
      if (data.readings) setReadings(data.readings);
      if (data.alerts) setAlerts(data.alerts);
      if (data.incidents) setIncidents(data.incidents);
      if (data.timeline) setTimeline(data.timeline);
      if (data.activeSession) setActiveSession(data.activeSession);
    });

    socket.on('telemetry:batch', (data) => {
      if (data.readings) setReadings(data.readings);
      if (data.helmets) setHelmets(data.helmets);
      if (data.activeSession) setActiveSession(data.activeSession);
    });

    socket.on('timeline:new', (event) => {
      setTimeline((prev) => [event, ...prev.slice(0, 49)]);
    });

    return () => {
      socket.disconnect();
    };
  }, [loadState]);

  // Actions
  const handleTriggerScenario = async (scenarioType, targetHelmetId, scenarioDisplayName) => {
    setIsScenarioLoading(true);
    if (scenarioDisplayName) setActiveScenarioName(scenarioDisplayName);
    try {
      await triggerScenarioApi(scenarioType, targetHelmetId);
    } catch (err) {
      console.error('[ArcShield] Scenario trigger failed:', err);
    } finally {
      setIsScenarioLoading(false);
    }
  };

  const handleUpdateAlertLifecycle = async (alertId, newStatus, note, supervisorAction) => {
    try {
      await updateAlertLifecycleApi(alertId, {
        status: newStatus,
        note,
        supervisorAction
      });
    } catch (err) {
      console.error('[ArcShield] Alert lifecycle update failed:', err);
    }
  };

  const handleCreateIncident = async (incidentData) => {
    try {
      await createIncidentApi(incidentData);
    } catch (err) {
      console.error('[ArcShield] Incident creation failed:', err);
    }
  };

  const value = {
    helmets,
    readings,
    alerts,
    incidents,
    timeline,
    activeSession,
    workers,
    activeView,
    setActiveView,
    selectedHelmetId,
    setSelectedHelmetId,
    selectedZoneFilter,
    setSelectedZoneFilter,
    selectedTradeFilter,
    setSelectedTradeFilter,
    socketConnected,
    showReportModal,
    setShowReportModal,
    isScenarioLoading,
    activeScenarioName,
    triggerScenario: handleTriggerScenario,
    updateAlertLifecycle: handleUpdateAlertLifecycle,
    createIncident: handleCreateIncident,
    refreshState: loadState
  };

  return (
    <ArcShieldContext.Provider value={value}>
      {children}
    </ArcShieldContext.Provider>
  );
}

export function useArcShield() {
  const context = useContext(ArcShieldContext);
  if (!context) {
    throw new Error('useArcShield must be used within an ArcShieldProvider');
  }
  return context;
}
