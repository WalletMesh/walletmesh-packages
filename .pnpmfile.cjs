const path = require('node:path');

/**
 * pnpm hook configuration to handle c-kzg native module rebuilding
 */
module.exports = {
  hooks: {
    afterAllResolved(lockfile, context) {
      // Check if c-kzg is being installed or updated
      const packages = lockfile.packages || {};
      const hasCKzg = Object.keys(packages).some((pkg) => pkg.includes('c-kzg'));

      if (hasCKzg) {
        console.log('Detected c-kzg in dependencies, will rebuild after installation...');

        // Store a flag to trigger rebuild in readPackage hook
        context.cKzgDetected = true;
      }

      return lockfile;
    },

    readPackage(pkg, _context) {
      // Only process c-kzg package
      if (pkg.name === 'c-kzg') {
        // Add a postinstall script specifically for c-kzg
        if (!pkg.scripts) {
          pkg.scripts = {};
        }

        // Use our rebuild script
        pkg.scripts.postinstall = `node ${path.join(__dirname, 'scripts', 'rebuild-c-kzg.cjs')}`;

        console.log('Added postinstall script to c-kzg package');
      }

      return pkg;
    },
  },
};
