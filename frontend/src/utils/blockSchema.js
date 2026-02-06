import { ACTION_FIELDS } from '../data/dropdownOptions';
import { getActionTargetError, supportsTargeting } from './actionTargeting';

const titleCase = (value) =>
  value
    .replace(/_/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());

const normalizeType = (type) => {
  if (!type) return 'text';
  if (type === 'string') return 'text';
  if (type === 'integer') return 'number';
  return type;
};

const normalizeField = (field) => ({
  ...field,
  label: field.label || titleCase(field.name || ''),
  type: normalizeType(field.type)
});

const coercePropertiesToFields = (properties) => {
  if (Array.isArray(properties)) {
    return properties.map(normalizeField);
  }
  if (properties && typeof properties === 'object') {
    return Object.entries(properties).map(([name, defaultValue]) =>
      normalizeField({ name, default: defaultValue, type: 'text' })
    );
  }
  return [];
};

export const normalizeBlockDefinition = (definition) => {
  const actionFields = ACTION_FIELDS[definition?.name];
  const properties = actionFields
    ? actionFields.map(normalizeField)
    : coercePropertiesToFields(definition?.properties);

  return {
    ...definition,
    properties
  };
};

export const getFieldDefs = (definition) => {
  const normalized = normalizeBlockDefinition(definition || {});
  return normalized.properties || [];
};

export const getDefaultProperties = (definition) => {
  const fields = getFieldDefs(definition);
  const defaults = {};
  for (const field of fields) {
    if (field.default !== undefined) {
      defaults[field.name] = field.default;
    } else {
      defaults[field.name] = '';
    }
  }
  return defaults;
};

const flattenOptions = (options) => {
  if (!options) return [];
  if (Array.isArray(options)) {
    return options.map((opt) => (typeof opt === 'string' ? opt : opt.value));
  }
  if (typeof options === 'object') {
    return Object.values(options).flat();
  }
  return [];
};

export const validateBlocks = (blocks) => {
  const eventByChildId = new Map();
  for (const eventBlock of blocks) {
    if (eventBlock.type !== 'event') continue;
    for (const childId of eventBlock.children || []) {
      eventByChildId.set(childId, eventBlock);
    }
  }

  for (const block of blocks) {
    if (block.type === 'action' && supportsTargeting(block.name)) {
      const parentEvent = eventByChildId.get(block.id);
      const targetError = getActionTargetError(
        block.name,
        parentEvent?.name,
        block.properties?.target
      );
      if (targetError) return targetError;
    }

    const fields = getFieldDefs(block.definition);
    for (const field of fields) {
      const value = block.properties?.[field.name];
      const isEmpty = value === undefined || value === null || value === '';

      if (field.required && isEmpty) {
        return `${block.name}: ${field.label} is required.`;
      }

      if (!isEmpty && (field.type === 'number' || field.type === 'slider')) {
        const num = Number(value);
        if (Number.isNaN(num)) {
          return `${block.name}: ${field.label} must be a number.`;
        }
        if (field.min !== undefined && num < field.min) {
          return `${block.name}: ${field.label} must be >= ${field.min}.`;
        }
        if (field.max !== undefined && num > field.max) {
          return `${block.name}: ${field.label} must be <= ${field.max}.`;
        }
      }

      if (!isEmpty && (field.type === 'select' || field.type === 'grouped-select')) {
        const allowed = new Set(flattenOptions(field.options));
        if (allowed.size > 0 && !allowed.has(value)) {
          return `${block.name}: ${field.label} is not a valid option.`;
        }
      }

      if (!isEmpty && field.type === 'select-or-custom') {
        const allowed = new Set(flattenOptions(field.options));
        if (allowed.size > 0 && allowed.has(value)) {
          continue;
        }
        const num = Number(value);
        if (Number.isNaN(num)) {
          return `${block.name}: ${field.label} must be a number.`;
        }
        if (field.min !== undefined && num < field.min) {
          return `${block.name}: ${field.label} must be >= ${field.min}.`;
        }
        if (field.max !== undefined && num > field.max) {
          return `${block.name}: ${field.label} must be <= ${field.max}.`;
        }
      }
    }
  }
  return null;
};
