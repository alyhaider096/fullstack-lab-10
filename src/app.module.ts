import 'dotenv/config';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { CategoriesModule } from './categories.module.js';
import { Category, Note, Profile, Tag, User } from './entities.js';
import { HomeController, NotesController, UsersController } from './controllers.js';
import { NotesService, UsersService } from './services.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres', host: process.env.DB_HOST ?? '127.0.0.1',
      port: Number(process.env.DB_PORT ?? 5432), username: process.env.DB_USER ?? 'postgres',
      password: process.env.DB_PASSWORD, database: process.env.DB_NAME ?? 'lab10_db',
      entities: [User, Profile, Category, Tag, Note], synchronize: false,
    }),
    TypeOrmModule.forFeature([User, Profile, Category, Tag, Note]),
    CategoriesModule,
  ],
  controllers: [HomeController, NotesController, UsersController],
  providers: [NotesService, UsersService],
})
export class AppModule {}
