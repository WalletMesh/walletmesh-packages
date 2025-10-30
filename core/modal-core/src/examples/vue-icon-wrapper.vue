<!--
  Example Vue 3 component demonstrating usage of modal-core icon utilities
  This shows how the migrated utilities can be used across different frameworks
-->
<template>
  <div
    ref="containerRef"
    :class="containerConfig.className"
    :style="containerStyle"
    @click="handleClick"
    @keydown="handleKeyDown"
    v-bind="containerConfig.attributes"
    v-bind="a11yAttributes"
    :data-has-error="hasError"
  >
    <!-- Loading overlay -->
    <div
      v-if="isLoading"
      :style="containerConfig.loading.styles"
      v-bind="containerConfig.loading.attributes"
    >
      {{ containerConfig.loading.content }}
    </div>
  </div>
</template>

<script setup lang="ts">
import {
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
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';

interface Props {
  src: string;
  size?: number;
  className?: string;
  alt?: string;
  fallbackIcon?: string;
  cspTimeout?: number;
  disabled?: boolean;
  disabledStyle?: DisabledIconStyle;
}

interface Emits {
  (e: 'click'): void;
  (e: 'csp-error', error: Error): void;
}

const props = withDefaults(defineProps<Props>(), {
  size: 24,
  disabled: false,
});

const emit = defineEmits<Emits>();

// Reactive state
const containerRef = ref<HTMLDivElement>();
const hasError = ref(false);
const isLoading = ref(true);

// Create error recovery instance
const errorRecovery = createIconErrorRecovery(RECOVERY_PRESETS.conservative);

// Computed properties using modal-core utilities
const containerConfig = computed(() =>
  createIconContainerConfig({
    size: props.size,
    disabled: props.disabled,
    clickable: true,
    loading: isLoading.value,
    className: props.className,
  }),
);

const _containerStyle = computed(() => containerConfig.value.containerStyles);

const _a11yAttributes = computed(() =>
  createIconAccessibilityAttributes({
    alt: props.alt,
    disabled: props.disabled,
    clickable: true,
    loading: isLoading.value,
  }),
);

// Event handlers
const _handleClick = (event: Event) => {
  if (!isLoading.value && !props.disabled) {
    event.preventDefault();
    emit('click');
  }
};

const _handleKeyDown = (event: KeyboardEvent) => {
  if (!isLoading.value && !props.disabled && (event.key === 'Enter' || event.key === ' ')) {
    event.preventDefault();
    emit('click');
  }
};

// Icon loading logic
const loadIcon = async () => {
  if (!containerRef.value) return;

  // Clear existing content
  containerRef.value.innerHTML = '';
  hasError.value = false;
  isLoading.value = true;

  try {
    // Normalize options using modal-core utility
    const options = normalizeIconOptions({
      iconDataUri: props.src,
      size: props.size,
      fallbackIcon: props.fallbackIcon,
      timeout: props.cspTimeout,
      disabled: props.disabled,
      disabledStyle: props.disabledStyle,
      onCspError: (error: Error) => {
        console.warn('CSP blocked icon:', error);
        emit('csp-error', error);
      },
    });

    const iframe = await createSandboxedIcon(options);

    // Apply accessibility attributes
    const a11yAttrs = createIconAccessibilityAttributes({
      alt: props.alt,
      disabled: props.disabled,
      clickable: true,
      loading: false,
    });

    for (const [key, value] of Object.entries(a11yAttrs)) {
      iframe.setAttribute(key, value);
    }

    if (containerRef.value) {
      containerRef.value.appendChild(iframe);
      isLoading.value = false;
    }
  } catch (error) {
    console.warn('Failed to create sandboxed icon:', error);

    // Use unified error recovery pipeline
    const recoveryResult = await errorRecovery.recover(error as Error, {
      iconDataUri: props.src,
      size: props.size,
      fallbackIcon: props.fallbackIcon,
      timeout: props.cspTimeout,
      disabled: props.disabled,
      disabledStyle: props.disabledStyle,
    });

    if (recoveryResult.success && containerRef.value) {
      if (recoveryResult.result instanceof HTMLIFrameElement) {
        containerRef.value.appendChild(recoveryResult.result);
        isLoading.value = false;
      } else if (
        recoveryResult.result &&
        typeof recoveryResult.result === 'object' &&
        'content' in recoveryResult.result
      ) {
        const fallbackConfig = recoveryResult.result as FallbackIconConfig;
        const fallbackElement = document.createElement('div');
        applyFallbackToElement(fallbackElement, fallbackConfig);
        containerRef.value.appendChild(fallbackElement);
        isLoading.value = false;
      }
    } else {
      hasError.value = true;
      isLoading.value = false;
    }
  }
};

// Watch for prop changes and reload icon
watch([() => props.src, () => props.size, () => props.disabled], loadIcon);

// Lifecycle
onMounted(loadIcon);

onUnmounted(() => {
  if (containerRef.value) {
    containerRef.value.innerHTML = '';
  }
});
</script>

<style scoped>
/* Vue-specific styles can be added here if needed */
</style>