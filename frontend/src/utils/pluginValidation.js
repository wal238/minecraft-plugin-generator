const SEMVER_REGEX = /^\d+\.\d+\.\d+(?:-[0-9A-Za-z-.]+)?(?:\+[0-9A-Za-z-.]+)?$/;
const JAVA_PACKAGE_REGEX = /^[a-z_][a-z0-9_]*(\.[a-z_][a-z0-9_]*)+$/;

const sanitizeToken = (value) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '')
    .replace(/^[^a-z_]+/, '');

export const suggestMainPackage = (name, author) => {
  const authorToken = sanitizeToken(author || '') || 'author';
  const nameToken = sanitizeToken(name || '') || 'plugin';
  return `com.${authorToken}.${nameToken}`;
};

export const validatePluginSettings = ({ name, version, mainPackage, author }) => {
  const errors = {};

  if (!name || !name.trim()) {
    errors.name = 'Plugin name is required.';
  }

  if (!author || !author.trim()) {
    errors.author = 'Author is required.';
  }

  if (!version || !version.trim()) {
    errors.version = 'Version is required.';
  } else if (!SEMVER_REGEX.test(version.trim())) {
    errors.version = 'Version must be valid semver (e.g., 1.0.0 or 1.0.0-beta).';
  }

  if (!mainPackage || !mainPackage.trim()) {
    errors.mainPackage = 'Main package is required.';
  } else if (!JAVA_PACKAGE_REGEX.test(mainPackage.trim())) {
    errors.mainPackage = 'Use lowercase package format (e.g., com.yourname.plugin).';
  }

  return errors;
};

export const isPluginSettingsValid = (settings) =>
  Object.keys(validatePluginSettings(settings)).length === 0;
