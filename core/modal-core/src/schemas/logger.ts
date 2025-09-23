/**
 * @fileoverview Logger system schemas for runtime validation
 */

import { z } from 'zod';

/**
 * Log level enumeration schema
 */
export const logLevelSchema = z.enum(['DEBUG', 'INFO', 'WARN', 'ERROR', 'SILENT']);

/**
 * Logger configuration schema
 */
export const loggerConfigSchema = z.object({
  /**
   * Debug mode setting (boolean or function)
   */
  debugEnabled: z.union([z.boolean(), z.function().returns(z.boolean())]),

  /**
   * Log message prefix
   */
  prefix: z.string().optional(),

  /**
   * Minimum log level
   */
  level: logLevelSchema.optional(),

  /**
   * Whether to use colorized output
   */
  colorized: z.boolean().optional(),

  /**
   * Whether to include timestamps
   */
  timestamps: z.boolean().optional(),

  /**
   * Custom log formatter function
   */
  formatter: z
    .function()
    .args(logLevelSchema, z.string(), z.unknown().optional())
    .returns(z.string())
    .optional(),
});

/**
 * Log data schema for structured logging
 */
export const logDataSchema = z.union([
  z.string(),
  z.number(),
  z.boolean(),
  z.null(),
  z.undefined(),
  z.record(z.unknown()),
  z.array(z.unknown()),
  z.instanceof(Error),
  z.date(),
]);

/**
 * Log entry schema
 */
export const logEntrySchema = z.object({
  /**
   * Log level
   */
  level: logLevelSchema,

  /**
   * Log message
   */
  message: z.string(),

  /**
   * Additional log data
   */
  data: logDataSchema.optional(),

  /**
   * Log timestamp
   */
  timestamp: z.date(),

  /**
   * Logger name/prefix
   */
  logger: z.string().optional(),

  /**
   * Log context/metadata
   */
  context: z.record(z.unknown()).optional(),
});

/**
 * Logger transport schema for custom log outputs
 */
export const loggerTransportSchema = z.object({
  /**
   * Transport name
   */
  name: z.string(),

  /**
   * Minimum log level for this transport
   */
  level: logLevelSchema.optional(),

  /**
   * Transport write function
   */
  write: z
    .function()
    .args(logEntrySchema)
    .returns(z.union([z.void(), z.promise(z.void())])),

  /**
   * Whether transport should format messages
   */
  format: z.boolean().optional(),

  /**
   * Transport-specific options
   */
  options: z.record(z.unknown()).optional(),
});

/**
 * Performance log entry schema
 */
export const performanceLogEntrySchema = z.object({
  /**
   * Operation name
   */
  operation: z.string(),

  /**
   * Start timestamp
   */
  startTime: z.number(),

  /**
   * End timestamp
   */
  endTime: z.number(),

  /**
   * Duration in milliseconds
   */
  duration: z.number(),

  /**
   * Additional performance metadata
   */
  metadata: z.record(z.unknown()).optional(),
});

/**
 * Error log entry schema with enhanced error information
 */
export const errorLogEntrySchema = logEntrySchema.extend({
  level: z.literal('ERROR'),

  /**
   * Error object
   */
  error: z.instanceof(Error),

  /**
   * Error stack trace
   */
  stack: z.string().optional(),

  /**
   * Error code
   */
  code: z.union([z.string(), z.number()]).optional(),

  /**
   * Error category
   */
  category: z.string().optional(),

  /**
   * Whether error is fatal (not retryable)
   */
  fatal: z.boolean().optional(),

  /**
   * User agent when error occurred
   */
  userAgent: z.string().optional(),
});

/**
 * Debug log configuration schema
 */
export const debugLogConfigSchema = z.object({
  /**
   * Debug namespaces to enable
   */
  namespaces: z.array(z.string()).optional(),

  /**
   * Whether to log performance metrics
   */
  performance: z.boolean().optional(),

  /**
   * Whether to log memory usage
   */
  memory: z.boolean().optional(),

  /**
   * Whether to log function calls
   */
  functions: z.boolean().optional(),

  /**
   * Maximum log entry length
   */
  maxLength: z.number().int().positive().optional(),
});

// Type exports
export type LogLevel = z.infer<typeof logLevelSchema>;
export type LoggerConfig = z.infer<typeof loggerConfigSchema>;
export type LogData = z.infer<typeof logDataSchema>;
export type LogEntry = z.infer<typeof logEntrySchema>;
export type LoggerTransport = z.infer<typeof loggerTransportSchema>;
export type PerformanceLogEntry = z.infer<typeof performanceLogEntrySchema>;
export type ErrorLogEntry = z.infer<typeof errorLogEntrySchema>;
export type DebugLogConfig = z.infer<typeof debugLogConfigSchema>;
