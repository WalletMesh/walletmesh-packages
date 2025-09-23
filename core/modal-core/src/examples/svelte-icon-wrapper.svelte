<!--
  Example Svelte component demonstrating usage of modal-core icon utilities
  This shows how the migrated utilities can be used across different frameworks
-->
<script lang="ts">
import {
  type CreateSandboxedIconOptions,
  type DisabledIconStyle,
  type FallbackIconConfig,
  RECOVERY_PRESETS,
  applyFallbackToElement,
  createIconAccessibilityAttributes,
  createIconContainerConfig,
  createIconErrorRecovery,
  createSandboxedIcon,
  normalizeIconOptions,
} from '@walletmesh/modal-core';
import { onDestroy, onMount } from 'svelte';

// Props
export let src: string;
export const size = 24;
export const className = '';
export const alt = '';
export const fallbackIcon: string | undefined = undefined;
export const cspTimeout: number | undefined = undefined;
export const disabled = false;
export const disabledStyle: DisabledIconStyle | undefined = undefined;

// Events
import { createEventDispatcher } from 'svelte';
const dispatch = createEventDispatcher<{
  click: undefined;
  'csp-error': Error;
}>();

// Component state
let containerElement: HTMLDivElement;
let hasError = false;
let isLoading = true;

// Create error recovery instance
const errorRecovery = createIconErrorRecovery(RECOVERY_PRESETS.conservative);

// Reactive computations using modal-core utilities
$: containerConfig = createIconContainerConfig({
  size,
  disabled,
  clickable: true,
  loading: isLoading,
  className,
});

$: containerStyle = Object.entries(containerConfig.containerStyles)
  .map(([key, value]) => `${key.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${value}`)
  .join('; ');

$: a11yAttributes = createIconAccessibilityAttributes({
  alt,
  disabled,
  clickable: true,
  loading: isLoading,
});

// Event handlers
function handleClick(event: Event) {
  if (!isLoading && !disabled) {
    event.preventDefault();
    dispatch('click');
  }
}

function handleKeyDown(event: KeyboardEvent) {
  if (!isLoading && !disabled && (event.key === 'Enter' || event.key === ' ')) {
    event.preventDefault();
    dispatch('click');
  }
}

// Icon loading logic
async function loadIcon() {
  if (!containerElement) return;

  // Clear existing content
  containerElement.innerHTML = '';
  hasError = false;
  isLoading = true;

  try {
    // Normalize options using modal-core utility
    const options = normalizeIconOptions({
      iconDataUri: src,
      size,
      fallbackIcon,
      timeout: cspTimeout,
      disabled,
      disabledStyle,
      onCspError: (error: Error) => {
        console.warn('CSP blocked icon:', error);
        dispatch('csp-error', error);
      },
    });

    const iframe = await createSandboxedIcon(options);

    // Apply accessibility attributes
    const a11yAttrs = createIconAccessibilityAttributes({
      alt,
      disabled,
      clickable: true,
      loading: false,
    });

    for (const [key, value] of Object.entries(a11yAttrs)) {
      iframe.setAttribute(key, value);
    }

    if (containerElement) {
      containerElement.appendChild(iframe);
      isLoading = false;
    }
  } catch (error) {
    console.warn('Failed to create sandboxed icon:', error);

    // Use unified error recovery pipeline
    const recoveryResult = await errorRecovery.recover(error as Error, {
      iconDataUri: src,
      size,
      fallbackIcon,
      timeout: cspTimeout,
      disabled,
      disabledStyle,
    });

    if (recoveryResult.success && containerElement) {
      if (recoveryResult.result instanceof HTMLIFrameElement) {
        containerElement.appendChild(recoveryResult.result);
        isLoading = false;
      } else if (
        recoveryResult.result &&
        typeof recoveryResult.result === 'object' &&
        'content' in recoveryResult.result
      ) {
        const fallbackConfig = recoveryResult.result as FallbackIconConfig;
        const fallbackElement = document.createElement('div');
        applyFallbackToElement(fallbackElement, fallbackConfig);
        containerElement.appendChild(fallbackElement);
        isLoading = false;
      }
    } else {
      hasError = true;
      isLoading = false;
    }
  }
}

// Lifecycle
onMount(() => {
  loadIcon();
});

onDestroy(() => {
  if (containerElement) {
    containerElement.innerHTML = '';
  }
});

// Watch for prop changes and reload icon
$: if (containerElement && (src || size || disabled)) {
  loadIcon();
}
</script>

<!-- Svelte template -->
<div
  bind:this={containerElement}
  class={className}
  style={containerStyle}
  on:click={handleClick}
  on:keydown={handleKeyDown}
  {...a11yAttributes}
  {...containerConfig.attributes}
  data-has-error={hasError}
  role="button"
  tabindex={disabled ? -1 : 0}
>
  {#if isLoading}
    <div
      style={Object.entries(containerConfig.loading.styles)
        .map(([key, value]) => `${key.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${value}`)
        .join('; ')}
      {...containerConfig.loading.attributes}
    >
      {containerConfig.loading.content}
    </div>
  {/if}
</div>

<style>
  /* Svelte-specific styles can be added here if needed */
</style>