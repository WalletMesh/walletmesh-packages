/**
 * @fileoverview Tests for modal-specific schemas
 */

import { describe, it, expect } from 'vitest';
import {
  modalThemeSchema,
  modalSizeSchema,
  modalPositionSchema,
  modalAnimationSchema,
  modalBackdropSchema,
  walletDisplayConfigSchema,
  qrCodeConfigSchema,
  modalSectionsSchema,
  modalViewSchema,
  modalStateSchema,
  modalConfigSchema,
  modalEventTypeSchema,
  modalEventSchema,
  modalActionSchema,
} from './modal.js';

describe('Modal UI Schemas', () => {
  describe('modalThemeSchema', () => {
    it('should provide defaults', () => {
      const result = modalThemeSchema.parse({});
      expect(result.mode).toBe('auto');
    });

    it('should validate complete theme', () => {
      const theme = {
        mode: 'dark',
        primaryColor: '#007AFF',
        backgroundColor: '#1C1C1E',
        textColor: '#FFFFFF',
        borderRadius: 12,
        fontFamily: 'Inter, sans-serif',
        cssVariables: {
          '--modal-shadow': '0 4px 20px rgba(0,0,0,0.3)',
          '--modal-transition': 'all 0.3s ease',
        },
      };
      expect(() => modalThemeSchema.parse(theme)).not.toThrow();
    });

    it('should validate theme modes', () => {
      const modes = ['light', 'dark', 'auto'];
      for (const mode of modes) {
        expect(() => modalThemeSchema.parse({ mode })).not.toThrow();
      }
    });

    it('should validate hex colors', () => {
      expect(() => modalThemeSchema.parse({ primaryColor: '#FF0000' })).not.toThrow();
      expect(() => modalThemeSchema.parse({ primaryColor: 'red' })).toThrow();
      expect(() => modalThemeSchema.parse({ primaryColor: '#GG0000' })).toThrow();
      expect(() => modalThemeSchema.parse({ primaryColor: '#FF00' })).toThrow();
    });

    it('should validate border radius range', () => {
      expect(() => modalThemeSchema.parse({ borderRadius: -1 })).toThrow();
      expect(() => modalThemeSchema.parse({ borderRadius: 51 })).toThrow();
      expect(() => modalThemeSchema.parse({ borderRadius: 20 })).not.toThrow();
    });
  });

  describe('modalSizeSchema', () => {
    it('should provide defaults', () => {
      const result = modalSizeSchema.parse({});
      expect(result.width).toBe(400);
      expect(result.height).toBe('auto');
    });

    it('should validate numeric dimensions', () => {
      const size = {
        width: 500,
        height: 600,
        maxWidth: 800,
        maxHeight: 900,
      };
      expect(() => modalSizeSchema.parse(size)).not.toThrow();
    });

    it('should validate string dimensions', () => {
      const size = {
        width: '80%',
        height: '600px',
        maxWidth: '90vw',
        maxHeight: '80vh',
      };
      expect(() => modalSizeSchema.parse(size)).not.toThrow();
    });

    it('should validate dimension units', () => {
      // Test width units (vw for width)
      const validWidthUnits = ['100%', '500px', '2em', '1.5rem', '80vw'];
      for (const unit of validWidthUnits) {
        expect(() => modalSizeSchema.parse({ width: unit })).not.toThrow();
      }

      // Test height units (vh for height)
      const validHeightUnits = ['100%', '500px', '2em', '1.5rem', '90vh'];
      for (const unit of validHeightUnits) {
        expect(() => modalSizeSchema.parse({ height: unit })).not.toThrow();
      }

      const invalidUnits = ['100', 'auto%', 'px500', '80vmax'];
      for (const unit of invalidUnits) {
        expect(() => modalSizeSchema.parse({ width: unit })).toThrow();
        expect(() => modalSizeSchema.parse({ height: unit })).toThrow();
      }
    });

    it('should allow auto height', () => {
      expect(() => modalSizeSchema.parse({ height: 'auto' })).not.toThrow();
      expect(() => modalSizeSchema.parse({ width: 'auto' })).toThrow(); // Width can't be auto
    });
  });

  describe('modalPositionSchema', () => {
    it('should provide defaults', () => {
      const result = modalPositionSchema.parse({});
      expect(result.horizontal).toBe('center');
      expect(result.vertical).toBe('center');
    });

    it('should validate positions', () => {
      const positions = [
        { horizontal: 'left', vertical: 'top' },
        { horizontal: 'center', vertical: 'center' },
        { horizontal: 'right', vertical: 'bottom' },
      ];
      for (const position of positions) {
        expect(() => modalPositionSchema.parse(position)).not.toThrow();
      }
    });

    it('should validate with offset', () => {
      const position = {
        horizontal: 'center',
        vertical: 'center',
        offset: { x: 20, y: -10 },
      };
      expect(() => modalPositionSchema.parse(position)).not.toThrow();
    });
  });

  describe('modalAnimationSchema', () => {
    it('should provide defaults', () => {
      const result = modalAnimationSchema.parse({});
      expect(result.enabled).toBe(true);
      expect(result.duration).toBe(300);
      expect(result.easing).toBe('ease-out');
    });

    it('should validate animation config', () => {
      const animation = {
        enabled: false,
        duration: 500,
        easing: 'ease-in-out',
      };
      expect(() => modalAnimationSchema.parse(animation)).not.toThrow();
    });

    it('should validate cubic bezier', () => {
      const animation = {
        easing: 'cubic-bezier',
        cubicBezier: [0.4, 0.0, 0.2, 1.0],
      };
      expect(() => modalAnimationSchema.parse(animation)).not.toThrow();
    });

    it('should validate duration range', () => {
      expect(() => modalAnimationSchema.parse({ duration: -1 })).toThrow();
      expect(() => modalAnimationSchema.parse({ duration: 1001 })).toThrow();
      expect(() => modalAnimationSchema.parse({ duration: 200 })).not.toThrow();
    });
  });

  describe('modalBackdropSchema', () => {
    it('should provide defaults', () => {
      const result = modalBackdropSchema.parse({});
      expect(result.enabled).toBe(true);
      expect(result.color).toBe('rgba(0, 0, 0, 0.5)');
      expect(result.closeOnClick).toBe(true);
    });

    it('should validate backdrop config', () => {
      const backdrop = {
        enabled: true,
        color: 'rgba(0, 0, 0, 0.8)',
        blur: 5,
        closeOnClick: false,
      };
      expect(() => modalBackdropSchema.parse(backdrop)).not.toThrow();
    });

    it('should validate blur range', () => {
      expect(() => modalBackdropSchema.parse({ blur: -1 })).toThrow();
      expect(() => modalBackdropSchema.parse({ blur: 21 })).toThrow();
      expect(() => modalBackdropSchema.parse({ blur: 10 })).not.toThrow();
    });
  });
});

describe('Modal Content Schemas', () => {
  describe('walletDisplayConfigSchema', () => {
    it('should provide defaults', () => {
      const result = walletDisplayConfigSchema.parse({});
      expect(result.showName).toBe(true);
      expect(result.showIcon).toBe(true);
      expect(result.showDescription).toBe(false);
      expect(result.showChains).toBe(false);
      expect(result.showInstallButton).toBe(true);
      expect(result.groupByCategory).toBe(false);
      expect(result.sortBy).toBe('recommended');
    });

    it('should validate display config', () => {
      const config = {
        showName: true,
        showIcon: true,
        showDescription: true,
        showChains: true,
        showInstallButton: false,
        groupByCategory: true,
        sortBy: 'popularity',
      };
      expect(() => walletDisplayConfigSchema.parse(config)).not.toThrow();
    });

    it('should validate sort options', () => {
      const sortOptions = ['name', 'popularity', 'recent', 'recommended'];
      for (const sortBy of sortOptions) {
        expect(() => walletDisplayConfigSchema.parse({ sortBy })).not.toThrow();
      }
    });
  });

  describe('qrCodeConfigSchema', () => {
    it('should provide defaults', () => {
      const result = qrCodeConfigSchema.parse({});
      expect(result.enabled).toBe(true);
      expect(result.size).toBe(256);
      expect(result.errorCorrectionLevel).toBe('M');
      expect(result.includeLogo).toBe(true);
      expect(result.logoSize).toBe(20);
    });

    it('should validate QR config', () => {
      const config = {
        enabled: true,
        size: 384,
        errorCorrectionLevel: 'H',
        includeLogo: false,
        logoSize: 25,
      };
      expect(() => qrCodeConfigSchema.parse(config)).not.toThrow();
    });

    it('should validate size range', () => {
      expect(() => qrCodeConfigSchema.parse({ size: 64 })).toThrow();
      expect(() => qrCodeConfigSchema.parse({ size: 1024 })).toThrow();
      expect(() => qrCodeConfigSchema.parse({ size: 256 })).not.toThrow();
    });

    it('should validate error correction levels', () => {
      const levels = ['L', 'M', 'Q', 'H'];
      for (const errorCorrectionLevel of levels) {
        expect(() => qrCodeConfigSchema.parse({ errorCorrectionLevel })).not.toThrow();
      }
    });
  });

  describe('modalSectionsSchema', () => {
    it('should provide defaults', () => {
      const result = modalSectionsSchema.parse({});
      expect(result.header).toBe(true);
      expect(result.search).toBe(true);
      expect(result.walletList).toBe(true);
      expect(result.qrCode).toBe(true);
      expect(result.help).toBe(true);
      expect(result.terms).toBe(false);
    });

    it('should validate custom sections', () => {
      const sections = {
        header: false,
        custom: [
          {
            id: 'promo',
            title: 'Special Offer',
            content: 'Get 10% off your first transaction!',
            position: 'before-wallets',
          },
          {
            id: 'disclaimer',
            title: 'Disclaimer',
            content: 'Use at your own risk',
            position: 'footer',
          },
        ],
      };
      expect(() => modalSectionsSchema.parse(sections)).not.toThrow();
    });

    it('should validate custom section positions', () => {
      const positions = ['before-wallets', 'after-wallets', 'footer'];
      for (const position of positions) {
        const section = {
          custom: [
            {
              id: 'test',
              title: 'Test',
              content: 'Test content',
              position,
            },
          ],
        };
        expect(() => modalSectionsSchema.parse(section)).not.toThrow();
      }
    });
  });
});

describe('Modal State Schemas', () => {
  describe('modalViewSchema', () => {
    it('should validate all view states', () => {
      const views = [
        'wallet-selection',
        'connecting',
        'connected',
        'error',
        'qr-code',
        'help',
        'terms',
        'custom',
      ];
      for (const view of views) {
        expect(() => modalViewSchema.parse(view)).not.toThrow();
      }
    });
  });

  describe('modalStateSchema', () => {
    it('should validate minimal state', () => {
      const state = {
        isOpen: true,
        currentView: 'wallet-selection',
        isLoading: false,
      };
      expect(() => modalStateSchema.parse(state)).not.toThrow();
    });

    it('should validate complete state', () => {
      const state = {
        isOpen: true,
        currentView: 'connecting',
        selectedWalletId: 'metamask',
        targetChainId: 'eip155:1',
        connectionProgress: 75,
        error: {
          code: 'CONNECTION_FAILED',
          message: 'Failed to connect to wallet',
          details: { attempt: 3 },
        },
        isLoading: true,
        customViewId: 'my-custom-view',
      };
      expect(() => modalStateSchema.parse(state)).not.toThrow();
    });

    it('should validate progress range', () => {
      expect(() =>
        modalStateSchema.parse({
          isOpen: true,
          currentView: 'connecting',
          isLoading: false,
          connectionProgress: -1,
        }),
      ).toThrow();

      expect(() =>
        modalStateSchema.parse({
          isOpen: true,
          currentView: 'connecting',
          isLoading: false,
          connectionProgress: 101,
        }),
      ).toThrow();
    });
  });
});

describe('Modal Configuration Schema', () => {
  it('should validate empty config', () => {
    const result = modalConfigSchema.parse({});
    expect(result.autoClose).toBe(true);
    expect(result.closeDelay).toBe(1500);
    expect(result.keyboardNavigation).toBe(true);
    expect(result.escapeClose).toBe(true);
    expect(result.zIndex).toBe(9999);
  });

  it('should validate complete config', () => {
    const config = {
      theme: {
        mode: 'dark',
        primaryColor: '#007AFF',
      },
      size: {
        width: 450,
        height: 'auto',
      },
      position: {
        horizontal: 'center',
        vertical: 'center',
      },
      animation: {
        enabled: true,
        duration: 400,
      },
      backdrop: {
        enabled: true,
        blur: 5,
      },
      walletDisplay: {
        sortBy: 'popularity',
      },
      qrCode: {
        size: 300,
      },
      sections: {
        terms: true,
      },
      autoClose: false,
      closeDelay: 3000,
      keyboardNavigation: true,
      escapeClose: false,
      zIndex: 10000,
      container: '#modal-root',
    };
    expect(() => modalConfigSchema.parse(config)).not.toThrow();
  });

  it('should validate z-index range', () => {
    expect(() => modalConfigSchema.parse({ zIndex: 0 })).toThrow();
    expect(() => modalConfigSchema.parse({ zIndex: 1000000 })).toThrow();
    expect(() => modalConfigSchema.parse({ zIndex: 50000 })).not.toThrow();
  });
});

describe('Modal Event Schemas', () => {
  describe('modalEventTypeSchema', () => {
    it('should validate all event types', () => {
      const eventTypes = [
        'open',
        'close',
        'view-change',
        'wallet-select',
        'connection-start',
        'connection-success',
        'connection-error',
        'cancel',
        'help-click',
        'terms-click',
        'qr-scan',
      ];
      for (const type of eventTypes) {
        expect(() => modalEventTypeSchema.parse(type)).not.toThrow();
      }
    });
  });

  describe('modalEventSchema', () => {
    it('should validate minimal event', () => {
      const event = {
        type: 'open',
        timestamp: Date.now(),
      };
      expect(() => modalEventSchema.parse(event)).not.toThrow();
    });

    it('should validate complete event', () => {
      const event = {
        type: 'view-change',
        timestamp: Date.now(),
        data: {
          reason: 'user-navigation',
          duration: 300,
        },
        sourceView: 'wallet-selection',
        targetView: 'qr-code',
      };
      expect(() => modalEventSchema.parse(event)).not.toThrow();
    });
  });
});

describe('Modal Action Schemas', () => {
  it('should validate open action', () => {
    const action = {
      type: 'open',
      config: {
        theme: { mode: 'dark' },
        autoClose: false,
      },
    };
    expect(() => modalActionSchema.parse(action)).not.toThrow();
  });

  it('should validate close action', () => {
    const action = {
      type: 'close',
      reason: 'user-cancelled',
    };
    expect(() => modalActionSchema.parse(action)).not.toThrow();
  });

  it('should validate setView action', () => {
    const action = {
      type: 'setView',
      view: 'qr-code',
      data: {
        walletId: 'walletconnect',
        uri: 'wc:...',
      },
    };
    expect(() => modalActionSchema.parse(action)).not.toThrow();
  });

  it('should validate selectWallet action', () => {
    const action = {
      type: 'selectWallet',
      walletId: 'metamask',
    };
    expect(() => modalActionSchema.parse(action)).not.toThrow();
  });

  it('should validate error actions', () => {
    const setError = {
      type: 'setError',
      error: {
        code: 'WALLET_NOT_FOUND',
        message: 'MetaMask is not installed',
        details: { walletId: 'metamask' },
      },
    };
    expect(() => modalActionSchema.parse(setError)).not.toThrow();

    const clearError = {
      type: 'clearError',
    };
    expect(() => modalActionSchema.parse(clearError)).not.toThrow();
  });

  it('should validate updateProgress action', () => {
    const action = {
      type: 'updateProgress',
      progress: 50,
    };
    expect(() => modalActionSchema.parse(action)).not.toThrow();
  });

  it('should validate updateConfig action', () => {
    const action = {
      type: 'updateConfig',
      config: {
        theme: { mode: 'light' },
        backdrop: { blur: 10 },
      },
    };
    expect(() => modalActionSchema.parse(action)).not.toThrow();
  });
});
