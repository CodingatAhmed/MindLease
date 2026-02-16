import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { LeaseService } from './lease.service';

@Injectable()
export class LeaseProcessor {
  private readonly logger = new Logger(LeaseProcessor.name);

  constructor(private readonly leaseService: LeaseService) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async handleExpiredLeases() {
    this.logger.debug('Checking for expired leases...');
    await this.leaseService.expireCompletedLeases();
  }
}