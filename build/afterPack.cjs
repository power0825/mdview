const path = require('path');

exports.default = async function afterPack(context) {
  if (context.electronPlatformName !== 'win32') {
    return;
  }

  const rcedit = require('rcedit');
  const exePath = path.join(context.appOutDir, 'MDView.exe');
  const iconPath = path.join(context.packager.projectDir, 'build', 'icon.ico');

  await rcedit(exePath, {
    icon: iconPath,
    'version-string': {
      CompanyName: 'MDView',
      FileDescription: 'MDView',
      InternalName: 'MDView',
      OriginalFilename: 'MDView.exe',
      ProductName: 'MDView',
      LegalCopyright: 'Copyright (C) 2026 MDView',
    },
    'file-version': context.packager.appInfo.version,
    'product-version': context.packager.appInfo.version,
    'requested-execution-level': 'asInvoker',
  });
};
