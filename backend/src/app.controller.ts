import { Controller, Get, Logger } from '@nestjs/common';
import { AppService } from './app.service'; // Fixed .ts extension (standard import)

@Controller()
export class AppController {
  // 1. Basic logger service using console.log for Phase 0
  private readonly logger = new Logger(AppController.name);

  constructor(private readonly appService: AppService) {}

  // Your original endpoint
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  /**
   * MindLease Health Check Endpoint
   * Requirement: Return {status: "ok", timestamp}
   */
  @Get('health')
  getHealth() {
    this.logger.log('Health check requested'); // Initial logging
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }
}
