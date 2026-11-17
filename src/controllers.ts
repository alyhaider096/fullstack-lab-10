import { BadRequestException, Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { CategoriesService, NotesService, UsersService } from './services.js';

@Controller()
export class HomeController {
  @Get()
  home() { return { name: 'Lab 10 Notes API', status: 'ok', endpoints: ['/users', '/categories', '/notes'] }; }
}

@Controller('categories')
export class CategoriesController {
  constructor(private service: CategoriesService) {}
  @Get() all() { return this.service.all(); }
  @Get(':id') one(@Param('id', ParseIntPipe) id: number) { return this.service.one(id); }
  @Post() create(@Body() body: { name: string; description?: string }) { return this.service.create(body.name, body.description); }
  @Patch(':id') update(@Param('id', ParseIntPipe) id: number, @Body() body: { name?: string; description?: string }) { return this.service.update(id, body); }
  @Delete(':id') remove(@Param('id', ParseIntPipe) id: number) { return this.service.remove(id); }
}

@Controller('users')
export class UsersController {
  constructor(private service: UsersService) {}
  @Get() all() { return this.service.all(); }
  @Post() create(@Body() body: { name: string; email: string }) { return this.service.create(body.name, body.email); }
  @Get(':id/stats') statistics(@Param('id', ParseIntPipe) id: number) { return this.service.statistics(id); }
}

@Controller('notes')
export class NotesController {
  constructor(private service: NotesService) {}
  @Post() create(@Body() body: { title: string; content: string; userId: number; categoryId?: number; isPinned?: boolean }) { return this.service.create(body); }
  @Get() search(@Query('page') page = '1', @Query('limit') limit = '10', @Query('search') search = '', @Query('categoryId') categoryId?: string) {
    const p = Number(page), l = Number(limit), c = categoryId === undefined ? undefined : Number(categoryId);
    if (c !== undefined && !Number.isInteger(c)) throw new BadRequestException('categoryId must be an integer');
    return this.service.search(p, l, search, c);
  }
  @Get(':id') one(@Param('id', ParseIntPipe) id: number) { return this.service.one(id); }
  @Patch(':id/category') setCategory(@Param('id', ParseIntPipe) id: number, @Body() body: { categoryId: number | null }) {
    if (!body || !Object.hasOwn(body, 'categoryId') || (body.categoryId !== null && !Number.isInteger(body.categoryId))) throw new BadRequestException('categoryId must be an integer or null');
    return this.service.setCategory(id, body.categoryId);
  }
}
