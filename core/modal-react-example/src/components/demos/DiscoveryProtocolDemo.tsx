import {
  type BaseResponderInfo,
  type TechnologyCapability,
  DiscoveryResponder,
  type DiscoveryRequestEvent,
  type DiscoveryResponseEvent,
  type ResponderInfo,
} from '@walletmesh/discovery';
import { MockEventTarget } from '@walletmesh/discovery/testing';
import { useWalletMeshContext } from '@walletmesh/modal-react/all';
import { useCallback, useEffect, useRef, useState } from 'react';
import styles from '../../styles/DemoCard.module.css';

interface MockWallet {
  name: string;
  icon: string;
  chains: string[];
  features: string[];
}

interface DiscoveryProfile {
  id: string;
  name: string;
  mockWallet: MockWallet;
  createdAt: number;
  lastUsed: number;
  enabled?: boolean; // Track if profile is currently active
}

interface ProtocolMessage {
  id: string;
  timestamp: number;
  type: 'request' | 'response';
  direction: 'incoming' | 'outgoing';
  data: DiscoveryRequestEvent | DiscoveryResponseEvent;
}

// LocalStorage key for profiles
const PROFILES_STORAGE_KEY = 'walletmesh-discovery-profiles';

// Default profiles for common test scenarios
const DEFAULT_PROFILES: DiscoveryProfile[] = [
  {
    id: 'ethereum-only',
    name: 'Ethereum Only',
    mockWallet: {
      name: 'Ethereum Test Wallet',
      icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8Y2lyY2xlIGN4PSIxNiIgY3k9IjE2IiByPSIxNiIgZmlsbD0iIzYyN0VFQSIvPgogIDxwYXRoIGQ9Ik0xNiA0VjEyLjg3TDIzLjUgMTYuMjJMMTYgNFoiIGZpbGw9IndoaXRlIiBmaWxsLW9wYWNpdHk9IjAuNiIvPgogIDxwYXRoIGQ9Ik0xNiA0TDguNSAxNi4yMkwxNiAxMi44N1Y0WiIgZmlsbD0id2hpdGUiLz4KICA8cGF0aCBkPSJNMTYgMjQuODdWMjhMMjMuNSAxNy43OEwxNiAyNC44N1oiIGZpbGw9IndoaXRlIiBmaWxsLW9wYWNpdHk9IjAuNiIvPgogIDxwYXRoIGQ9Ik0xNiAyOFYyNC44N0w4LjUgMTcuNzhMMTYgMjhaIiBmaWxsPSJ3aGl0ZSIvPgogIDxwYXRoIGQ9Ik0xNiAyMy4yMkwyMy41IDE2LjIyTDE2IDEyLjg3VjIzLjIyWiIgZmlsbD0id2hpdGUiIGZpbGwtb3BhY2l0eT0iMC4yIi8+CiAgPHBhdGggZD0iTTguNSAxNi4yMkwxNiAyMy4yMlYxMi44N0w4LjUgMTYuMjJaIiBmaWxsPSJ3aGl0ZSIgZmlsbC1vcGFjaXR5PSIwLjYiLz4KPC9zdmc+',
      chains: ['eip155:1'],
      features: ['account-management', 'transaction-signing'],
    },
    createdAt: Date.now(),
    lastUsed: Date.now(),
  },
  {
    id: 'multi-chain-evm',
    name: 'Multi-Chain EVM',
    mockWallet: {
      name: 'Multi-Chain Wallet',
      icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8Y2lyY2xlIGN4PSIxNiIgY3k9IjE2IiByPSIxNiIgZmlsbD0iIzZCNzI4MCIvPgogIDxwYXRoIGQ9Ik04IDEyaDR2NGgtNHptNiAwaDR2NGgtNHptNiAwaDR2NGgtNHptLTEyIDZoNHY0aC00em02IDBoNHY0aC00em02IDBoNHY0aC00eiIgZmlsbD0iI2ZmZiIvPgo8L3N2Zz4K',
      chains: ['eip155:1', 'eip155:137', 'eip155:42161', 'eip155:10'],
      features: ['account-management', 'transaction-signing'],
    },
    createdAt: Date.now(),
    lastUsed: Date.now(),
  },
  {
    id: 'full-featured',
    name: 'Full Featured',
    mockWallet: {
      name: 'Advanced Test Wallet',
      icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8Y2lyY2xlIGN4PSIxNiIgY3k9IjE2IiByPSIxNiIgZmlsbD0iIzEwQjk4MSIvPgogIDxwYXRoIGQ9Ik0xNiA4bC0yIDJoNGwtMi0yem0tNCA0bC0yIDJoMTJsLTItMkg4em0tNCAwbC0yIDJoMjBsLTItMkg0em0wIDhsMiAyaDEybDItMkg0eiIgZmlsbD0iI2ZmZiIvPgo8L3N2Zz4K',
      chains: ['eip155:1', 'eip155:137', 'eip155:42161', 'eip155:10'],
      features: ['account-management', 'transaction-signing', 'message-signing', 'hardware-wallet'],
    },
    createdAt: Date.now(),
    lastUsed: Date.now(),
  },
  {
    id: 'minimal',
    name: 'Minimal Wallet',
    mockWallet: {
      name: 'Basic Wallet',
      icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8Y2lyY2xlIGN4PSIxNiIgY3k9IjE2IiByPSIxNiIgZmlsbD0iI0VGNDQ0NCIvPgogIDxjaXJjbGUgY3g9IjE2IiBjeT0iMTYiIHI9IjgiIGZpbGw9IiNmZmYiLz4KPC9zdmc+',
      chains: ['eip155:1'],
      features: ['account-management'],
    },
    createdAt: Date.now(),
    lastUsed: Date.now(),
  },
];

/**
 * Discovery Protocol Testing Component
 *
 * Demonstrates the WalletMesh discovery protocol by allowing users to:
 * 1. Create mock wallets with configurable capabilities
 * 2. Start discovery responder to respond to discovery requests
 * 3. View real-time protocol messages
 * 4. Test integration with the WalletMesh modal
 * 5. Save and load discovery profiles for easy testing
 */
export function DiscoveryProtocolDemo() {
  // Profile management state
  const [profiles, setProfiles] = useState<DiscoveryProfile[]>([]);
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
  const [newProfileName, setNewProfileName] = useState('');
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [importData, setImportData] = useState('');
  const [exportData, setExportData] = useState('');

  // Mock wallet configuration state
  const [mockWallet, setMockWallet] = useState<MockWallet>({
    name: 'Demo Test Wallet',
    icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8Y2lyY2xlIGN4PSIxNiIgY3k9IjE2IiByPSIxNiIgZmlsbD0iIzMzNzNkYyIvPgogIDxwYXRoIGQ9Im0xMC41IDEzIDMgM0wxOSA5IiBzdHJva2U9IiNmZmYiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+Cjwvc3ZnPgo=',
    chains: ['eip155:1', 'eip155:137'],
    features: ['account-management', 'transaction-signing'],
  });

  // Discovery state
  const [isResponderActive, setIsResponderActive] = useState(false);
  const [protocolMessages, setProtocolMessages] = useState<ProtocolMessage[]>([]);
  const [discoveryStats, setDiscoveryStats] = useState({
    totalRequests: 0,
    responses: 0,
    qualified: 0,
  });

  // Refs for cleanup - now supporting multiple responders
  const respondersRef = useRef<Map<string, any>>(new Map());
  const eventTargetsRef = useRef<Map<string, MockEventTarget>>(new Map());

  const { client } = useWalletMeshContext();

  // Load profiles from localStorage on mount
  useEffect(() => {
    const loadProfiles = () => {
      try {
        const storedProfiles = localStorage.getItem(PROFILES_STORAGE_KEY);
        if (storedProfiles) {
          const parsed = JSON.parse(storedProfiles);
          setProfiles(parsed);
        } else {
          // Initialize with default profiles if none exist
          setProfiles(DEFAULT_PROFILES);
          localStorage.setItem(PROFILES_STORAGE_KEY, JSON.stringify(DEFAULT_PROFILES));
        }
      } catch (error) {
        console.error('Failed to load profiles:', error);
        setProfiles(DEFAULT_PROFILES);
      }
    };

    loadProfiles();
  }, []);

  // Save profiles to localStorage whenever they change
  useEffect(() => {
    if (profiles.length > 0) {
      try {
        localStorage.setItem(PROFILES_STORAGE_KEY, JSON.stringify(profiles));
      } catch (error) {
        console.error('Failed to save profiles:', error);
      }
    }
  }, [profiles]);

  // Add protocol message to log
  const addProtocolMessage = useCallback(
    (
      type: 'request' | 'response',
      direction: 'incoming' | 'outgoing',
      data: DiscoveryRequestEvent | DiscoveryResponseEvent,
    ) => {
      const message: ProtocolMessage = {
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        type,
        direction,
        data,
      };

      setProtocolMessages((prev) => [message, ...prev.slice(0, 19)]); // Keep last 20 messages

      // Update stats
      setDiscoveryStats((prev) => ({
        ...prev,
        totalRequests: type === 'request' ? prev.totalRequests + 1 : prev.totalRequests,
        responses: type === 'response' ? prev.responses + 1 : prev.responses,
        qualified: type === 'response' ? prev.qualified + 1 : prev.qualified,
      }));
    },
    [],
  );

  // Create responder info from a specific profile
  const createProfileResponderInfo = useCallback((profile: DiscoveryProfile): ResponderInfo => {
    const technologyCapabilities: TechnologyCapability[] = [];

    for (const chainName of profile.mockWallet.chains) {
      let type: TechnologyCapability['type'];
      let interfaces: string[];

      if (chainName.startsWith('solana')) {
        type = 'solana';
        interfaces = ['solana-wallet-standard'];
      } else if (chainName.startsWith('aztec')) {
        type = 'aztec';
        interfaces = ['aztec-wallet-api-v1'];
      } else {
        type = 'evm';
        interfaces = ['eip-1193', 'eip-6963'];
      }

      const existing = technologyCapabilities.find((tech) => tech.type === type);
      if (existing) {
        existing.interfaces = Array.from(new Set([...existing.interfaces, ...interfaces]));
      } else {
        technologyCapabilities.push({ type, interfaces, features: [] });
      }
    }

    const responderInfo: BaseResponderInfo = {
      name: profile.mockWallet.name,
      icon: profile.mockWallet.icon,
      rdns: `com.walletmesh.demo.${profile.id}`,
      uuid: crypto.randomUUID(),
      version: '1.0.0',
      protocolVersion: '0.1.0',
      type: 'extension',
      technologies: technologyCapabilities,
      features: profile.mockWallet.features.map((feature) => ({
        id: feature,
        name: feature
          .split('-')
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' '),
      })),
      transportConfig: {
        type: 'extension',
        extensionId: `demo-wallet-${profile.id}`,
        walletAdapter: 'DemoWalletAdapter',
      },
    };

    return responderInfo;
  }, []);

  // Stop all discovery responders
  const stopResponders = useCallback(() => {
    for (const [, responder] of respondersRef.current) {
      responder.stopListening();
    }
    respondersRef.current.clear();
    eventTargetsRef.current.clear();
    setIsResponderActive(false);
  }, []);

  // Start discovery responders for all enabled profiles
  const startResponders = useCallback(async () => {
    try {
      const enabledProfiles = profiles.filter((p) => p.enabled);

      if (enabledProfiles.length === 0) {
        alert('No profiles are enabled. Please enable at least one profile.');
        return;
      }

      // Stop any existing responders first
      stopResponders();

      // Create responders for each enabled profile
      for (const profile of enabledProfiles) {
        const eventTarget = new MockEventTarget();
        const responderInfo = createProfileResponderInfo(profile);

        const responder = new DiscoveryResponder(responderInfo, {
          eventTarget,
          security: {
            requireHttps: false,
            allowLocalhost: true,
            rateLimit: {
              enabled: false,
              maxRequests: 100,
              windowMs: 60000,
            },
          },
        });

        // Listen for discovery requests
        eventTarget.addEventListener('discovery:wallet:request', ((
          event: CustomEvent<DiscoveryRequestEvent>,
        ) => {
          const request = event.detail;
          addProtocolMessage('request', 'incoming', request);
        }) as EventListener);

        // Listen for our responses
        eventTarget.addEventListener('discovery:wallet:response', ((
          event: CustomEvent<DiscoveryResponseEvent>,
        ) => {
          const response = event.detail;
          addProtocolMessage('response', 'outgoing', response);
        }) as EventListener);

        respondersRef.current.set(profile.id, responder);
        eventTargetsRef.current.set(profile.id, eventTarget);
        responder.startListening();
      }

      setIsResponderActive(true);

      // Simulate an initial discovery request for demo purposes
      setTimeout(() => {
        const firstEventTarget = Array.from(eventTargetsRef.current.values())[0];
        if (firstEventTarget) {
          const mockRequest: DiscoveryRequestEvent = {
            type: 'discovery:wallet:request',
            version: '0.1.0',
            sessionId: crypto.randomUUID(),
            required: {
              technologies: [
                {
                  type: 'evm',
                  interfaces: ['eip-1193'],
                  features: [],
                },
              ],
              features: ['account-management'],
            },
            origin: window.location.origin,
            initiatorInfo: {
              name: 'Discovery Protocol Demo',
              url: window.location.origin,
              icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHJ4PSI0IiBmaWxsPSIjNGY0NmU1Ii8+CiAgPHBhdGggZD0iTTE2IDhMMjQgMTZMMTYgMjRMOCAxNkwxNiA4WiIgZmlsbD0iI2ZmZiIvPgo8L3N2Zz4K',
            },
          };

          // Broadcast to all event targets
          for (const [, eventTarget] of eventTargetsRef.current) {
            eventTarget.dispatchEvent(new CustomEvent('discovery:wallet:request', { detail: mockRequest }));
          }
        }
      }, 1000);
    } catch (error) {
      console.error('Failed to start responders:', error);
    }
  }, [profiles, createProfileResponderInfo, addProtocolMessage, stopResponders]);

  // Clear message log
  const clearMessages = useCallback(() => {
    setProtocolMessages([]);
    setDiscoveryStats({ totalRequests: 0, responses: 0, qualified: 0 });
  }, []);

  // Update mock wallet configuration
  const updateMockWallet = useCallback((updates: Partial<MockWallet>) => {
    setMockWallet((prev) => ({ ...prev, ...updates }));
  }, []);

  // Profile management functions
  const loadProfile = useCallback(
    (profileId: string) => {
      const profile = profiles.find((p) => p.id === profileId);
      if (profile) {
        setMockWallet(profile.mockWallet);
        setSelectedProfileId(profileId);

        // Update last used timestamp
        setProfiles((prev) => prev.map((p) => (p.id === profileId ? { ...p, lastUsed: Date.now() } : p)));
      }
    },
    [profiles],
  );

  const saveProfile = useCallback(() => {
    if (!newProfileName.trim()) return;

    const newProfile: DiscoveryProfile = {
      id: crypto.randomUUID(),
      name: newProfileName.trim(),
      mockWallet: { ...mockWallet },
      createdAt: Date.now(),
      lastUsed: Date.now(),
    };

    setProfiles((prev) => [...prev, newProfile]);
    setSelectedProfileId(newProfile.id);
    setNewProfileName('');
    setShowSaveDialog(false);
  }, [mockWallet, newProfileName]);

  const deleteProfile = useCallback(
    (profileId: string) => {
      // Prevent deletion of default profiles
      const profile = profiles.find((p) => p.id === profileId);
      if (profile && DEFAULT_PROFILES.some((dp) => dp.id === profileId)) {
        alert('Cannot delete default profiles');
        return;
      }

      setProfiles((prev) => prev.filter((p) => p.id !== profileId));
      if (selectedProfileId === profileId) {
        setSelectedProfileId(null);
      }
    },
    [profiles, selectedProfileId],
  );

  // Toggle profile enabled state
  const toggleProfile = useCallback((profileId: string) => {
    setProfiles((prev) =>
      prev.map((p) => (p.id === profileId ? { ...p, enabled: !p.enabled, lastUsed: Date.now() } : p)),
    );
  }, []);

  // Export profiles to JSON
  const exportProfiles = useCallback(() => {
    const exportableProfiles = profiles.filter((p) => !DEFAULT_PROFILES.some((dp) => dp.id === p.id));
    const exportJson = JSON.stringify(exportableProfiles, null, 2);
    setExportData(exportJson);
    setShowExportDialog(true);
  }, [profiles]);

  // Import profiles from JSON
  const importProfiles = useCallback(() => {
    try {
      const imported = JSON.parse(importData);
      if (!Array.isArray(imported)) {
        alert('Invalid import data: must be an array of profiles');
        return;
      }

      // Validate imported profiles
      const validProfiles = imported.filter(
        (p) =>
          p.id && p.name && p.mockWallet && p.mockWallet.name && p.mockWallet.chains && p.mockWallet.features,
      );

      if (validProfiles.length === 0) {
        alert('No valid profiles found in import data');
        return;
      }

      // Add imported profiles with new IDs to avoid conflicts
      const newProfiles = validProfiles.map((p) => ({
        ...p,
        id: crypto.randomUUID(),
        createdAt: Date.now(),
        lastUsed: Date.now(),
        enabled: false,
      }));

      setProfiles((prev) => [...prev, ...newProfiles]);
      setImportData('');
      setShowImportDialog(false);
      alert(`Successfully imported ${newProfiles.length} profiles`);
    } catch (_error) {
      alert('Failed to import profiles: Invalid JSON');
    }
  }, [importData]);

  // Open modal to test discovery
  const openModal = useCallback(() => {
    if (client) {
      // Try to open the modal - this should trigger discovery
      try {
        // Open modal using client's openModal method
        client.openModal?.();
      } catch (_error) {
        console.log('Modal opening not available in this context');
      }
    }
  }, [client]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopResponders();
    };
  }, [stopResponders]);

  // Focus profile name input when dialog opens
  useEffect(() => {
    if (showSaveDialog) {
      // Use setTimeout to ensure the DOM has updated
      const timer = setTimeout(() => {
        const input = document.querySelector<HTMLInputElement>('input[placeholder="Profile name"]');
        input?.focus();
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [showSaveDialog]);

  // Format protocol message for display
  const formatMessage = (message: ProtocolMessage) => {
    const data = message.data;
    const isRequest = message.type === 'request';

    if (isRequest) {
      const req = data as DiscoveryRequestEvent;
      const techTypes = req.required.technologies.map((t) => t.type).join(', ');
      return {
        title: `Discovery Request from ${req.initiatorInfo.name}`,
        details: `Technologies: ${techTypes} | Features: ${req.required.features.join(', ')}`,
        origin: req.origin,
      };
    }

    const res = data as DiscoveryResponseEvent;
    const matchedTechs = res.matched.required.technologies.map((t) => t.type).join(', ');
    return {
      title: `Response from ${res.name}`,
      details: `Technologies: ${matchedTechs} | RDNS: ${res.rdns}`,
      origin: res.responderId,
    };
  };

  return (
    <div className={styles.demoCard}>
      <h3 className={styles.demoTitle}>🔍 Discovery Protocol Demo</h3>

      {/* Profile Management Section */}
      <div className={styles.section}>
        <h4>Profile Management</h4>

        {/* Profile List with Checkboxes */}
        <div style={{ marginBottom: '16px' }}>
          <h5 style={{ marginBottom: '8px', fontSize: '14px', color: '#666' }}>
            Enable Profiles for Testing:
          </h5>
          <div
            style={{
              maxHeight: '200px',
              overflowY: 'auto',
              border: '1px solid #e5e7eb',
              borderRadius: '4px',
              padding: '8px',
            }}
          >
            {profiles.map((profile) => (
              <div
                key={profile.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '4px 0',
                  borderBottom: '1px solid #f3f4f6',
                }}
              >
                <input
                  type="checkbox"
                  checked={profile.enabled || false}
                  onChange={() => toggleProfile(profile.id)}
                  style={{ marginRight: '8px' }}
                />
                <span style={{ flex: 1 }}>
                  {profile.name}
                  {DEFAULT_PROFILES.some((dp) => dp.id === profile.id) && (
                    <span style={{ fontSize: '12px', color: '#999', marginLeft: '8px' }}>(default)</span>
                  )}
                </span>
                <button
                  type="button"
                  onClick={() => loadProfile(profile.id)}
                  style={{ fontSize: '12px', padding: '2px 8px', marginRight: '4px', cursor: 'pointer' }}
                >
                  Edit
                </button>
                {!DEFAULT_PROFILES.some((dp) => dp.id === profile.id) && (
                  <button
                    type="button"
                    onClick={() => deleteProfile(profile.id)}
                    style={{ fontSize: '12px', padding: '2px 8px', color: '#dc2626', cursor: 'pointer' }}
                  >
                    Delete
                  </button>
                )}
              </div>
            ))}
          </div>
          <div style={{ marginTop: '8px', fontSize: '12px', color: '#666' }}>
            {profiles.filter((p) => p.enabled).length} profile(s) enabled
          </div>
        </div>

        {/* Profile Actions */}
        <div className={styles.actions} style={{ marginBottom: '16px' }}>
          <button
            type="button"
            onClick={() => setShowSaveDialog(true)}
            className={styles.button}
            style={{ padding: '8px 16px', fontSize: '14px' }}
          >
            Save Current as Profile
          </button>
          <button
            type="button"
            onClick={() => setShowImportDialog(true)}
            className={styles.button}
            style={{ padding: '8px 16px', fontSize: '14px' }}
          >
            Import Profiles
          </button>
          <button
            type="button"
            onClick={exportProfiles}
            className={styles.button}
            style={{ padding: '8px 16px', fontSize: '14px' }}
          >
            Export Profiles
          </button>
        </div>

        {/* Current Configuration Info */}
        {selectedProfileId && (
          <div className={styles.infoBox}>
            <strong>Editing Profile:</strong> {profiles.find((p) => p.id === selectedProfileId)?.name}
          </div>
        )}
      </div>

      {/* Save Profile Dialog */}
      {showSaveDialog && (
        <div
          className={styles.modalOverlay}
          onClick={() => setShowSaveDialog(false)}
          onKeyDown={(e) => e.key === 'Escape' && setShowSaveDialog(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Modal overlay"
          tabIndex={-1}
        >
          <dialog
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
            aria-modal="true"
            open
          >
            <h3>Save Profile</h3>
            <p>Enter a name for this profile configuration:</p>
            <input
              type="text"
              value={newProfileName}
              onChange={(e) => setNewProfileName(e.target.value)}
              placeholder="Profile name"
              style={{
                width: '100%',
                padding: '8px',
                borderRadius: '4px',
                border: '1px solid #e5e7eb',
                marginBottom: '16px',
              }}
              onKeyDown={(e) => e.key === 'Enter' && saveProfile()}
            />
            <div className={styles.modalActions}>
              <button
                type="button"
                onClick={() => setShowSaveDialog(false)}
                className={styles.buttonSecondary}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={saveProfile}
                className={styles.button}
                disabled={!newProfileName.trim()}
              >
                Save
              </button>
            </div>
          </dialog>
        </div>
      )}

      {/* Import Profile Dialog */}
      {showImportDialog && (
        <div
          className={styles.modalOverlay}
          onClick={() => setShowImportDialog(false)}
          onKeyDown={(e) => e.key === 'Escape' && setShowImportDialog(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Modal overlay"
          tabIndex={-1}
        >
          <dialog
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
            aria-modal="true"
            open
          >
            <h3>Import Profiles</h3>
            <p>Paste your profile JSON data below:</p>
            <textarea
              value={importData}
              onChange={(e) => setImportData(e.target.value)}
              placeholder='[{"name": "My Profile", "mockWallet": {...}}]'
              style={{
                width: '100%',
                height: '200px',
                padding: '8px',
                borderRadius: '4px',
                border: '1px solid #e5e7eb',
                marginBottom: '16px',
                fontFamily: 'monospace',
                fontSize: '12px',
              }}
            />
            <div className={styles.modalActions}>
              <button
                type="button"
                onClick={() => {
                  setShowImportDialog(false);
                  setImportData('');
                }}
                className={styles.buttonSecondary}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={importProfiles}
                className={styles.button}
                disabled={!importData.trim()}
              >
                Import
              </button>
            </div>
          </dialog>
        </div>
      )}

      {/* Export Profile Dialog */}
      {showExportDialog && (
        <div
          className={styles.modalOverlay}
          onClick={() => setShowExportDialog(false)}
          onKeyDown={(e) => e.key === 'Escape' && setShowExportDialog(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Modal overlay"
          tabIndex={-1}
        >
          <dialog
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
            aria-modal="true"
            open
          >
            <h3>Export Profiles</h3>
            <p>Copy the JSON data below to save your custom profiles:</p>
            <textarea
              value={exportData}
              readOnly
              style={{
                width: '100%',
                height: '200px',
                padding: '8px',
                borderRadius: '4px',
                border: '1px solid #e5e7eb',
                marginBottom: '16px',
                fontFamily: 'monospace',
                fontSize: '12px',
                backgroundColor: '#f9fafb',
              }}
              onClick={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.select();
              }}
              onKeyDown={() => {}}
            />
            <div className={styles.modalActions}>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(exportData);
                  alert('Profiles copied to clipboard!');
                }}
                className={styles.button}
              >
                Copy to Clipboard
              </button>
              <button
                type="button"
                onClick={() => setShowExportDialog(false)}
                className={styles.buttonSecondary}
              >
                Close
              </button>
            </div>
          </dialog>
        </div>
      )}

      {/* Mock Wallet Configuration */}
      <div className={styles.section}>
        <h4>Mock Wallet Configuration</h4>
        <div className={styles.infoGrid}>
          <div className={styles.infoItem}>
            <label className={styles.label}>
              Wallet Name:
              <input
                type="text"
                value={mockWallet.name}
                onChange={(e) => updateMockWallet({ name: e.target.value })}
                style={{
                  marginLeft: '8px',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  border: '1px solid #e5e7eb',
                }}
              />
            </label>
          </div>
          <div className={styles.infoItem}>
            <label className={styles.label}>
              Supported Chains:
              <select
                multiple
                value={mockWallet.chains}
                onChange={(e) =>
                  updateMockWallet({
                    chains: Array.from(e.target.selectedOptions, (option) => option.value),
                  })
                }
                style={{
                  marginLeft: '8px',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  border: '1px solid #e5e7eb',
                }}
              >
                <option value="ethereum">Ethereum</option>
                <option value="polygon">Polygon</option>
                <option value="arbitrum">Arbitrum</option>
                <option value="optimism">Optimism</option>
              </select>
            </label>
          </div>
          <div className={styles.infoItem}>
            <label className={styles.label}>
              Features:
              <select
                multiple
                value={mockWallet.features}
                onChange={(e) =>
                  updateMockWallet({
                    features: Array.from(e.target.selectedOptions, (option) => option.value),
                  })
                }
                style={{
                  marginLeft: '8px',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  border: '1px solid #e5e7eb',
                }}
              >
                <option value="account-management">Account Management</option>
                <option value="transaction-signing">Transaction Signing</option>
                <option value="message-signing">Message Signing</option>
                <option value="hardware-wallet">Hardware Wallet</option>
              </select>
            </label>
          </div>
        </div>
      </div>

      {/* Discovery Controls */}
      <div className={styles.section}>
        <h4>Discovery Controls</h4>
        <div className={styles.actions}>
          <button
            type="button"
            onClick={isResponderActive ? stopResponders : startResponders}
            className={`${styles.button} ${isResponderActive ? styles.buttonDanger : ''}`}
          >
            {isResponderActive ? 'Stop Mock Wallets' : 'Start Mock Wallets'}
          </button>
          <button type="button" onClick={openModal} className={styles.button} disabled={!isResponderActive}>
            Open Modal (Test Discovery)
          </button>
          <button type="button" onClick={clearMessages} className={styles.buttonSecondary}>
            Clear Messages
          </button>
        </div>

        {/* Status Indicators */}
        <div className={styles.statusGrid}>
          <div className={styles.statusItem}>
            <span className={styles.label}>Responder Status:</span>
            <span className={isResponderActive ? styles.valueSuccess : styles.valueError}>
              {isResponderActive ? `Active (${respondersRef.current.size} wallets)` : 'Inactive'}
            </span>
          </div>
          <div className={styles.statusItem}>
            <span className={styles.label}>Total Requests:</span>
            <span className={styles.valueDefault}>{discoveryStats.totalRequests}</span>
          </div>
          <div className={styles.statusItem}>
            <span className={styles.label}>Responses Sent:</span>
            <span className={styles.valueDefault}>{discoveryStats.responses}</span>
          </div>
          <div className={styles.statusItem}>
            <span className={styles.label}>Qualified:</span>
            <span className={styles.valueSuccess}>{discoveryStats.qualified}</span>
          </div>
        </div>
      </div>

      {/* Protocol Messages */}
      <div className={styles.section}>
        <h4>Protocol Messages</h4>
        <div className={styles.logs}>
          {protocolMessages.length === 0 ? (
            <div className={styles.logEmpty}>
              No protocol messages yet. Start the mock wallet and open the modal to see discovery in action.
            </div>
          ) : (
            protocolMessages.map((message) => {
              const formatted = formatMessage(message);
              return (
                <div key={message.id} className={styles.logEntry}>
                  <div style={{ marginBottom: '4px' }}>
                    <strong style={{ color: message.type === 'request' ? '#3b82f6' : '#10b981' }}>
                      [{new Date(message.timestamp).toLocaleTimeString()}] {formatted.title}
                    </strong>
                  </div>
                  <div style={{ fontSize: '11px', color: '#6b7280' }}>{formatted.details}</div>
                  <div style={{ fontSize: '10px', color: '#9ca3af' }}>
                    {message.direction} • {formatted.origin}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Usage Instructions */}
      <div className={styles.codeExample}>
        <h4>How to Use</h4>
        <div className={styles.infoBox}>
          <ol style={{ margin: 0, paddingLeft: '20px' }}>
            <li>Enable one or more profiles by checking the boxes next to them</li>
            <li>Select a profile and click "Edit" to modify its configuration</li>
            <li>Create custom profiles using "Save Current as Profile"</li>
            <li>Import/Export profiles to share test configurations</li>
            <li>Click "Start Mock Wallets" to activate all enabled profiles</li>
            <li>Click "Open Modal" to trigger wallet discovery</li>
            <li>Watch real-time protocol messages in the log above</li>
            <li>Each enabled profile will appear as a separate wallet in the modal</li>
          </ol>
        </div>

        <pre className={styles.code}>
          {`// Discovery Protocol Message Flow
1. dApp broadcasts DiscoveryRequestEvent:
   {
     type: 'discovery:request',
     required: { 
       chains: ['eip155:1'],
       features: ['account-management'],
       interfaces: ['eip-1193']
     },
     initiatorInfo: { name: 'My dApp', url: '...', icon: '...' }
   }

2. Qualified wallets respond with DiscoveryResponseEvent:
   {
     type: 'responder:announce',
     name: 'Demo Test Wallet',
     matched: { 
       required: { chains: ['eip155:1'], features: [...] }
     },
     transportConfig: { type: 'extension', extensionId: '...' }
   }

3. User selects wallet from modal
4. Connection established using transport config`}
        </pre>
      </div>
    </div>
  );
}
