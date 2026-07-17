import { SetMetadata } from '@nestjs/common';

export const RATE_LIMIT_KEY = 'rate_limit_opts';

type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'DELETE' | 'PUT';

export interface RateLimitOptions {
  points: number;
  duration: number; // seconds
  message?: string;
  methods?: Partial<Record<HttpMethod, Partial<RateLimitOptions>>>;
}

export const RateLimit = (opts?: Partial<RateLimitOptions>) => {
  // Default method limits
  const DEFAULT_METHOD_LIMITS: Record<HttpMethod, RateLimitOptions> = {
    GET: { points: 100, duration: 60 },
    POST: { points: 60, duration: 60 },
    PATCH: { points: 20, duration: 60 },
    DELETE: { points: 50, duration: 60 },
    PUT: { points: 20, duration: 60 },
  };

  // Start with defaults
  const methods = { ...DEFAULT_METHOD_LIMITS };

  // Apply global overrides to ALL methods
  if (opts) {
    for (const method of Object.keys(methods) as HttpMethod[]) {
      if (opts.points !== undefined) methods[method].points = opts.points;
      if (opts.duration !== undefined) methods[method].duration = opts.duration;
      if (opts.message !== undefined) methods[method].message = opts.message;
    }

    // Apply method-specific overrides
    if (opts.methods) {
      for (const method of Object.keys(opts.methods) as HttpMethod[]) {
        const override = opts.methods[method];
        if (override) {
          if (override.points !== undefined)
            methods[method].points = override.points;
          if (override.duration !== undefined)
            methods[method].duration = override.duration;
          if (override.message !== undefined)
            methods[method].message = override.message;
        }
      }
    }
  }

  // Return flat config
  const config: RateLimitOptions = {
    points: opts?.points ?? 100,
    duration: opts?.duration ?? 60,
    message: opts?.message,
    methods,
  };

  return SetMetadata(RATE_LIMIT_KEY, config);
};
