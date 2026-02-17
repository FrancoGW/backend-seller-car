import { Controller, Get, Post, Body, Put, Delete, Param, Query, UseGuards } from '@nestjs/common';
import { VehiclesService } from './vehicles.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from '../auth/admin.guard';

@Controller('vehicles')
export class VehiclesController {
  constructor(private vehiclesService: VehiclesService) {}

  @Get()
  async listPublic(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('brand') brand?: string,
    @Query('minPrice') minPrice?: string,
    @Query('maxPrice') maxPrice?: string,
    @Query('minYear') minYear?: string,
    @Query('maxYear') maxYear?: string,
    @Query('featured') featured?: string,
  ) {
    const query: Record<string, unknown> = {};
    if (page) query.page = Number(page);
    if (limit) query.limit = Number(limit);
    if (brand) query.brand = brand;
    if (minPrice) query.minPrice = Number(minPrice);
    if (maxPrice) query.maxPrice = Number(maxPrice);
    if (minYear) query.minYear = Number(minYear);
    if (maxYear) query.maxYear = Number(maxYear);
    if (featured !== undefined) query.featured = featured === 'true';
    return this.vehiclesService.findPublic(query);
  }

  @Get(':id')
  async getPublic(@Param('id') id: string) {
    return this.vehiclesService.findOnePublic(id);
  }
}

@Controller('admin/vehicles')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminVehiclesController {
  constructor(private vehiclesService: VehiclesService) {}

  @Get()
  async listAdmin(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('brand') brand?: string,
    @Query('search') search?: string,
    @Query('minPrice') minPrice?: string,
    @Query('maxPrice') maxPrice?: string,
    @Query('featured') featured?: string,
  ) {
    const query: Record<string, unknown> = {};
    if (page) query.page = Number(page);
    if (limit) query.limit = Number(limit);
    if (brand) query.brand = brand;
    if (search) query.search = search;
    if (minPrice) query.minPrice = Number(minPrice);
    if (maxPrice) query.maxPrice = Number(maxPrice);
    if (featured !== undefined) query.featured = featured === 'true';
    return this.vehiclesService.findAdmin(query);
  }

  @Get(':id')
  async getAdmin(@Param('id') id: string) {
    return this.vehiclesService.findOneAdmin(id);
  }

  @Post()
  async create(@Body() body: unknown) {
    return this.vehiclesService.create(body);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() body: unknown) {
    return this.vehiclesService.update(id, body);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.vehiclesService.remove(id);
  }
}
