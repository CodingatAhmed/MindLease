import { Controller, Post, Get, Body, UseGuards, Req } from '@nestjs/common';
import { LeaseService } from './lease.service';
import { CreateLeaseDto } from './dto/create-lease.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RequestWithUser } from '../auth/auth.controller'; // Using your existing interface


@Controller('leases')
@UseGuards(JwtAuthGuard)
export class LeaseController {
  constructor(private readonly leaseService: LeaseService) {}

  @Post()
  async createLease(
    @Req() req: RequestWithUser,
    @Body() createLeaseDto: CreateLeaseDto,
  ) {
    return this.leaseService.startLease(createLeaseDto, req.user.userId);
  }

  @Get('my-rentals')
  async getMyRentals(@Req() req: RequestWithUser) {
    return this.leaseService.getMyLeases(req.user.userId);
  }
}