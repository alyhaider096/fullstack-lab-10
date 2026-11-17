import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { CreateNoteDto, QueryNotesDto, UpdateCategoryDto, UpdateNoteDto } from './dto.js';
import { Category, Note, Tag, User } from './entities.js';

function handleCategoryError(error: unknown): never {
  if (error instanceof QueryFailedError && (error as QueryFailedError & { driverError?: { code?: string } }).driverError?.code === '23505') throw new ConflictException('Category name already exists');
  throw error;
}

@Injectable()
export class CategoriesService {
  constructor(@InjectRepository(Category) private repo: Repository<Category>) {}
  all() { return this.repo.find({ order: { name: 'ASC' } }); }
  async one(id: number) {
    const row = await this.repo.findOne({ where: { id }, relations: { notes: true } });
    if (!row) throw new NotFoundException('Category not found');
    return row;
  }
  async create(name: string, description?: string) {
    try { return await this.repo.save(this.repo.create({ name: name.trim(), description: description ?? null })); }
    catch (error) { handleCategoryError(error); }
  }
  async update(id: number, data: UpdateCategoryDto) {
    const row = await this.one(id);
    if (data.name !== undefined) row.name = data.name.trim();
    if (data.description !== undefined) row.description = data.description;
    try { return await this.repo.save(row); }
    catch (error) { handleCategoryError(error); }
  }
  async remove(id: number) { const row = await this.one(id); await this.repo.remove(row); return { deleted: true, id }; }
}

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private repo: Repository<User>) {}
  create(name: string, email: string) { return this.repo.save(this.repo.create({ name: name.trim(), email: email.trim() })); }
  all() { return this.repo.find({ order: { id: 'ASC' } }); }
  async statistics(id: number) {
    const user = await this.repo.findOneBy({ id });
    if (!user) throw new NotFoundException('User not found');
    const stats = await this.repo.createQueryBuilder('user')
      .leftJoin('user.notes', 'note').where('user.id = :id', { id })
      .select('COUNT(note.id)', 'totalNotes')
      .addSelect('COUNT(note.id) FILTER (WHERE note.isPinned = true)', 'pinnedNotes')
      .addSelect('COALESCE(SUM(note.views), 0)', 'totalViews')
      .getRawOne<{ totalNotes: string; pinnedNotes: string; totalViews: string }>();
    return { userId: id, name: user.name, totalNotes: Number(stats?.totalNotes ?? 0), pinnedNotes: Number(stats?.pinnedNotes ?? 0), totalViews: Number(stats?.totalViews ?? 0) };
  }
}

@Injectable()
export class NotesService {
  constructor(
    @InjectRepository(Note) private repo: Repository<Note>,
    @InjectRepository(User) private users: Repository<User>,
    @InjectRepository(Category) private categories: Repository<Category>,
    @InjectRepository(Tag) private tags: Repository<Tag>,
  ) {}
  async create(data: CreateNoteDto) {
    const user = await this.users.findOneBy({ id: data.userId });
    if (!user) throw new NotFoundException('User not found');
    const category = data.categoryId === undefined ? null : await this.categories.findOneBy({ id: data.categoryId });
    if (data.categoryId !== undefined && !category) throw new NotFoundException('Category not found');
    const tags: Tag[] = [];
    for (const value of data.tags ?? []) {
      const name = value.trim();
      if (!name) throw new BadRequestException('Tag name cannot be empty');
      let tag = await this.tags.findOneBy({ name });
      if (!tag) tag = await this.tags.save(this.tags.create({ name }));
      tags.push(tag);
    }
    const saved = await this.repo.save(this.repo.create({ title: data.title.trim(), content: data.content.trim(), user, category, isPinned: data.isPinned ?? false, tags }));
    return this.one(saved.id);
  }
  async one(id: number, incrementViews = false) {
    if (incrementViews) await this.repo.increment({ id }, 'views', 1);
    const note = await this.repo.findOne({ where: { id }, relations: { user: true, category: true, tags: true } });
    if (!note) throw new NotFoundException('Note not found');
    return note;
  }
  async update(id: number, data: UpdateNoteDto) {
    const note = await this.one(id);
    if (data.categoryId !== undefined) {
      const category = await this.categories.findOneBy({ id: data.categoryId });
      if (!category) throw new NotFoundException('Category not found');
      note.category = category;
    }
    if (data.title !== undefined) note.title = data.title.trim();
    if (data.content !== undefined) note.content = data.content.trim();
    if (data.isPinned !== undefined) note.isPinned = data.isPinned;
    note.updatedAt = new Date();
    await this.repo.save(note);
    return this.one(id);
  }
  async setCategory(id: number, categoryId: number | null) {
    const note = await this.one(id);
    const category = categoryId === null ? null : await this.categories.findOneBy({ id: categoryId });
    if (categoryId !== null && !category) throw new NotFoundException('Category not found');
    note.category = category; note.updatedAt = new Date(); await this.repo.save(note); return this.one(id);
  }
  async search(query: QueryNotesDto) {
    const { page = 1, limit = 5, search, tag, categoryId } = query;
    const qb = this.repo.createQueryBuilder('note').leftJoinAndSelect('note.category', 'category').leftJoinAndSelect('note.tags', 'tags');
    if (search?.trim()) qb.andWhere('note.title ILIKE :search', { search: `%${search.trim()}%` });
    if (tag?.trim()) qb.andWhere('EXISTS (SELECT 1 FROM note_tags nt JOIN tags t ON t.id = nt.tag_id WHERE nt.note_id = note.id AND t.name = :tag)', { tag: tag.trim() });
    if (categoryId !== undefined) qb.andWhere('category.id = :categoryId', { categoryId });
    qb.orderBy('note.isPinned', 'DESC').addOrderBy('note.createdAt', 'DESC').addOrderBy('note.id', 'DESC').skip((page - 1) * limit).take(limit);
    const [data, total] = await qb.getManyAndCount();
    return { data, total, page, limit };
  }
}
