import { BadRequestException, Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { CategoriesService, NotesService, UsersService } from './services.js';
import { CreateCategoryDto, CreateNoteDto, CreateUserDto, QueryNotesDto, UpdateCategoryDto, UpdateNoteDto } from './dto.js';

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
  @Post() create(@Body() body: CreateCategoryDto) { return this.service.create(body.name, body.description); }
  @Patch(':id') update(@Param('id', ParseIntPipe) id: number, @Body() body: UpdateCategoryDto) { return this.service.update(id, body); }
  @Delete(':id') remove(@Param('id', ParseIntPipe) id: number) { return this.service.remove(id); }
}

@Controller('users')
export class UsersController {
  constructor(private service: UsersService) {}
  @Get() all() { return this.service.all(); }
  @Post() create(@Body() body: CreateUserDto) { return this.service.create(body.name, body.email); }
  @Get(':id/stats') statistics(@Param('id', ParseIntPipe) id: number) { return this.service.statistics(id); }
}

@Controller('notes')
export class NotesController {
  constructor(private service: NotesService) {}
  @Post() create(@Body() body: CreateNoteDto) { return this.service.create(body); }
  @Get() search(@Query() query: QueryNotesDto) { return this.service.search(query); }
  @Get(':id') one(@Param('id', ParseIntPipe) id: number) { return this.service.one(id, true); }
  @Patch(':id') update(@Param('id', ParseIntPipe) id: number, @Body() body: UpdateNoteDto) { return this.service.update(id, body); }
  @Patch(':id/category') setCategory(@Param('id', ParseIntPipe) id: number, @Body() body: { categoryId: number | null }) {
    if (!body || !Object.hasOwn(body, 'categoryId') || (body.categoryId !== null && !Number.isInteger(body.categoryId))) throw new BadRequestException('categoryId must be an integer or null');
    return this.service.setCategory(id, body.categoryId);
  }
}
