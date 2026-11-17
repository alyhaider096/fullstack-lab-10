import 'dotenv/config';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category, Note, Profile, Tag, User } from './entities.js';
import { CategoriesController, HomeController, NotesController, UsersController } from './controllers.js';
import { CategoriesService, NotesService, UsersService } from './services.js';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres', host: process.env.DB_HOST ?? '127.0.0.1',
      port: Number(process.env.DB_PORT ?? 5432), username: process.env.DB_USER ?? 'postgres',
      password: process.env.DB_PASSWORD, database: process.env.DB_NAME ?? 'lab10_db',
      entities: [User, Profile, Category, Tag, Note], synchronize: false,
    }),
    TypeOrmModule.forFeature([User, Profile, Category, Tag, Note]),
  ],
  controllers: [HomeController, CategoriesController, NotesController, UsersController],
  providers: [CategoriesService, NotesService, UsersService],
})
export class AppModule {}
