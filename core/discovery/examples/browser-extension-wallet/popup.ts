/**
 * Popup Script - Permission Management UI
 */

import type { PendingPermission, PermissionResponse } from './types.js';

// Re-export permission names for use in popup
const PERMISSION_DISPLAY_NAMES: Record<string, string> = {
  eth_accounts: 'View wallet addresses',
  eth_requestAccounts: 'Connect wallet',
  eth_sendTransaction: 'Send transactions',
  personal_sign: 'Sign messages',
  eth_signTypedData: 'Sign typed data',
  eth_signTypedData_v3: 'Sign typed data (v3)',
  eth_signTypedData_v4: 'Sign typed data (v4)',
};

let pendingRequest: PendingPermission | null = null;

/**
 * Initialize popup
 */
async function initialize(): Promise<void> {
  // Check for pending permission request
  const storage = await chrome.storage.local.get('pendingPermission');
  const pendingPermission = storage.pendingPermission as PendingPermission | undefined;

  if (pendingPermission && Date.now() - pendingPermission.timestamp < 30000) {
    pendingRequest = pendingPermission;
    showPendingRequest();
  }

  // Load connected sites
  loadConnectedSites();
}

/**
 * Show pending permission request
 */
function showPendingRequest(): void {
  if (!pendingRequest) return;

  const section = document.getElementById('pendingSection') as HTMLDivElement;
  const originEl = document.getElementById('pendingOrigin') as HTMLDivElement;
  const permissionEl = document.getElementById('pendingPermission') as HTMLDivElement;

  section.style.display = 'block';
  originEl.textContent = pendingRequest.origin;
  permissionEl.textContent = `Requesting permission to: ${
    PERMISSION_DISPLAY_NAMES[pendingRequest.permission] || pendingRequest.permission
  }`;
}

/**
 * Approve permission request
 */
async function approvePermission(): Promise<void> {
  if (!pendingRequest) return;

  // Send response
  const response: PermissionResponse = {
    granted: true,
    responseOrigin: pendingRequest.origin,
    responsePermission: pendingRequest.permission,
  };

  await chrome.storage.local.set({ permissionResponse: response });

  // Clear pending request
  await chrome.storage.local.remove('pendingPermission');

  // Hide pending section
  const section = document.getElementById('pendingSection') as HTMLDivElement;
  section.style.display = 'none';
  pendingRequest = null;

  // Reload connected sites
  setTimeout(loadConnectedSites, 100);
}

/**
 * Deny permission request
 */
async function denyPermission(): Promise<void> {
  if (!pendingRequest) return;

  // Send response
  const response: PermissionResponse = {
    granted: false,
    responseOrigin: pendingRequest.origin,
    responsePermission: pendingRequest.permission,
  };

  await chrome.storage.local.set({ permissionResponse: response });

  // Clear pending request
  await chrome.storage.local.remove('pendingPermission');

  // Hide pending section
  const section = document.getElementById('pendingSection') as HTMLDivElement;
  section.style.display = 'none';
  pendingRequest = null;
}

/**
 * Load and display connected sites
 */
async function loadConnectedSites(): Promise<void> {
  const storage = await chrome.storage.local.get('permissions');
  const permissions = storage.permissions as Record<string, string[]> | undefined;
  const container = document.getElementById('connectedSites') as HTMLDivElement;

  if (!permissions || Object.keys(permissions).length === 0) {
    const emptyDiv = document.createElement('div');
    emptyDiv.className = 'empty';
    emptyDiv.textContent = 'No connected sites';
    container.replaceChildren(emptyDiv);
    return;
  }

  container.replaceChildren();

  for (const [origin, perms] of Object.entries(permissions)) {
    const siteEl = createSiteElement(origin, perms);
    container.appendChild(siteEl);
  }
}

/**
 * Create a connected site element
 */
function createSiteElement(origin: string, permissions: string[]): HTMLDivElement {
  const div = document.createElement('div');
  div.className = 'connected-site';

  const info = document.createElement('div');
  info.className = 'site-info';

  const originEl = document.createElement('div');
  originEl.className = 'site-origin';
  originEl.textContent = origin;

  const permsEl = document.createElement('div');
  permsEl.className = 'site-permissions';
  permsEl.textContent = permissions.map((p) => PERMISSION_DISPLAY_NAMES[p] || p).join(', ');

  info.appendChild(originEl);
  info.appendChild(permsEl);

  const disconnectBtn = document.createElement('button');
  disconnectBtn.className = 'disconnect';
  disconnectBtn.textContent = 'Disconnect';
  disconnectBtn.onclick = () => disconnectSite(origin);

  div.appendChild(info);
  div.appendChild(disconnectBtn);

  return div;
}

/**
 * Disconnect a site
 */
async function disconnectSite(origin: string): Promise<void> {
  const storage = await chrome.storage.local.get('permissions');
  const permissions = storage.permissions as Record<string, string[]> | undefined;

  if (permissions?.[origin]) {
    delete permissions[origin];
    await chrome.storage.local.set({ permissions });
    loadConnectedSites();
  }
}

// Extend window interface for onclick handlers
declare global {
  interface Window {
    approvePermission: typeof approvePermission;
    denyPermission: typeof denyPermission;
  }
}

// Make functions available globally for onclick handlers
window.approvePermission = approvePermission;
window.denyPermission = denyPermission;

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initialize);
