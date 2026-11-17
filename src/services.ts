import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category, Note, User } from './entities.js';

@Injectable()
export class CategoriesService {
  constructor(@InjectRepository(Category) private repo: Repository<Category>) {}
  all() { return this.repo.find({ order: { id: 'ASC' } }); }
  async one(id: number) { const row = await this.repo.findOneBy({ id }); if (!row) throw new NotFoundException('Category not found'); return row; }
  async create(name: string, description?: string) {
    if (!name?.trim()) throw new BadRequestException('name is required');
    return this.repo.save(this.repo.create({ name: name.trim(), description: description ?? null }));
  }
  async update(id: number, data: { name?: string; description?: string }) {
    const row = await this.one(id);
    if (data.name !== undefined) { if (!data.name.trim()) throw new BadRequestException('name cannot be empty'); row.name = data.name.trim(); }
    if (data.description !== undefined) row.description = data.description;
    return this.repo.save(row);
  }
  async remove(id: number) { const row = await this.one(id); await this.repo.remove(row); return { deleted: true, id }; }
}

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private repo: Repository<User>) {}
  async create(name: string, email: string) {
    if (!name?.trim() || !email?.trim()) throw new BadRequestException('name and email are required');
    return this.repo.save(this.repo.create({ name: name.trim(), email: email.trim() }));
  }
  all() { return this.repo.find({ order: { id: 'ASC' } }); }
  async statistics(id: number) {
    const user = await this.repo.findOneBy({ id });
    if (!user) throw new NotFoundException('User not found');
    const stats = await this.repo.createQueryBuilder('user')
      .leftJoin('user.notes', 'note').where('user.id = :id', { id })
      .select('COUNT(note.id)', 'totalNotes')
      .addSelect('COUNT(note.id) FILTER (WHERE note.isPinned = true)', 'pinnedNotes')
      .addSelect('COUNT(DISTINCT note.category)', 'categoriesUsed')
      .getRawOne<{ totalNotes: string; pinnedNotes: string; categoriesUsed: string }>();
    return { userId: id, totalNotes: Number(stats?.totalNotes ?? 0), pinnedNotes: Number(stats?.pinnedNotes ?? 0), categoriesUsed: Number(stats?.categoriesUsed ?? 0) };
  }
}

@Injectable()
export class NotesService {
  constructor(@InjectRepository(Note) private repo: Repository<Note>, @InjectRepository(User) private users: Repository<User>, @InjectRepository(Category) private categories: Repository<Category>) {}
  async create(data: { title: string; content: string; userId: number; categoryId?: number; isPinned?: boolean }) {
    if (!data.title?.trim() || !data.content?.trim() || !Number.isInteger(data.userId)) throw new BadRequestException('title, content and userId are required');
    const user = await this.users.findOneBy({ id: data.userId });
    if (!user) throw new NotFoundException('User not found');
    const category = data.categoryId == null ? null : await this.categories.findOneBy({ id: data.categoryId });
    if (data.categoryId != null && !category) throw new NotFoundException('Category not found');
    return this.repo.save(this.repo.create({ title: data.title.trim(), content: data.content.trim(), user, category, isPinned: data.isPinned ?? false }));
  }
  async one(id: number) { const note = await this.repo.findOne({ where: { id }, relations: { user: true, category: true, tags: true } }); if (!note) throw new NotFoundException('Note not found'); return note; }
  async setCategory(id: number, categoryId: number | null) {
    const note = await this.one(id);
    const category = categoryId === null ? null : await this.categories.findOneBy({ id: categoryId });
    if (categoryId !== null && !category) throw new NotFoundException('Category not found');
    note.category = category; note.updatedAt = new Date(); await this.repo.save(note); return this.one(id);
  }
  async search(page = 1, limit = 10, search = '', categoryId?: number) {
    if (!Number.isInteger(page) || page < 1 || !Number.isInteger(limit) || limit < 1 || limit > 100) throw new BadRequestException('page must be >= 1 and limit must be 1..100');
    const query = this.repo.createQueryBuilder('note').leftJoinAndSelect('note.category', 'category').leftJoinAndSelect('note.user', 'user');
    if (search.trim()) query.andWhere('(note.title ILIKE :search OR note.content ILIKE :search)', { search: `%${search.trim()}%` });
    if (categoryId !== undefined) query.andWhere('category.id = :categoryId', { categoryId });
    query.orderBy('note.createdAt', 'DESC').addOrderBy('note.id', 'DESC').skip((page - 1) * limit).take(limit);
    const [data, total] = await query.getManyAndCount();
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }
}
