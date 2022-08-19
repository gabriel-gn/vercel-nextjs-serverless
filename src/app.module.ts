import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AppRoutingModule } from './app.routing.module';
import { ConfigModule } from '@nestjs/config';
import { UserService } from './shared/services/user.service';
import { PostService } from './shared/services/post.service';
import { PrismaService } from './shared/services/prisma.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: 'src/environments/environment.env',
    }),
    AppRoutingModule.forRoot(),
  ],
  controllers: [AppController],
  providers: [AppService, UserService, PostService, PrismaService],
})
export class AppModule {}
