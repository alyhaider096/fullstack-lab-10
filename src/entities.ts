import { Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn, type Relation } from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn() id: number;
  @Column({ length: 100 }) name: string;
  @Column({ length: 255, unique: true }) email: string;
  @OneToOne(() => Profile, p => p.user) profile: Relation<Profile>;
  @OneToMany(() => Note, n => n.user) notes: Relation<Note[]>;
}

@Entity('profiles')
export class Profile {
  @PrimaryGeneratedColumn() id: number;
  @Column({ type: 'text', nullable: true }) bio: string | null;
  @OneToOne(() => User, u => u.profile, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' }) user: Relation<User>;
}

@Entity('categories')
export class Category {
  @PrimaryGeneratedColumn() id: number;
  @Column({ length: 30, unique: true }) name: string;
  @Column({ type: 'text', nullable: true }) description: string | null;
  @OneToMany(() => Note, n => n.category) notes: Relation<Note[]>;
}

@Entity('tags')
export class Tag {
  @PrimaryGeneratedColumn() id: number;
  @Column({ length: 100, unique: true }) name: string;
  @ManyToMany(() => Note, n => n.tags) notes: Relation<Note[]>;
}

@Entity('notes')
export class Note {
  @PrimaryGeneratedColumn() id: number;
  @Column({ length: 200 }) title: string;
  @Column({ type: 'text' }) content: string;
  @Column({ name: 'is_pinned', default: false }) isPinned: boolean;
  @Column({ type: 'integer', default: 0 }) views: number;
  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'now()' }) createdAt: Date;
  @Column({ name: 'updated_at', type: 'timestamptz', default: () => 'now()' }) updatedAt: Date;
  @ManyToOne(() => User, u => u.notes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' }) user: Relation<User>;
  @ManyToOne(() => Category, c => c.notes, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'category_id' }) category: Relation<Category> | null;
  @ManyToMany(() => Tag, t => t.notes)
  @JoinTable({ name: 'note_tags', joinColumn: { name: 'note_id', referencedColumnName: 'id' }, inverseJoinColumn: { name: 'tag_id', referencedColumnName: 'id' } })
  tags: Relation<Tag[]>;
}
