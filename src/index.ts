import { init, enhance, destroy, getInstances } from './core';
import type { UnlurkConfig, UnlurkContext, EnhanceOptions, UnlurkInstance } from './types';

export type { UnlurkConfig, UnlurkContext, EnhanceOptions, UnlurkInstance };

export { init, enhance, destroy, getInstances };

// Default export for UMD/CDN usage
const Unlurk = {
  init,
  enhance,
  destroy,
  getInstances,
};

export default Unlurk;

// Auto-attach to window for CDN usage
if (typeof window !== 'undefined') {
  (window as unknown as { Unlurk: typeof Unlurk }).Unlurk = Unlurk;
}
