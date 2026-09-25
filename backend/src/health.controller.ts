import { Controller, Get } from '@nestjs/common';

/**
 * Health check endpoint — used by UptimeRobot to keep Render awake.
 * Returns 200 OK with a simple status object.
 */
@Controller('health')
export class HealthController {
  @Get()
  check() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }
}
