import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { CourtController } from './courts.controller';
import { CourtService } from './services/court.service';
import { ReviewService } from './services/review.service';
import { Court, CourtSchema } from './schemas/court.schema';
import { Review, ReviewSchema } from './schemas/review.schema';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Court.name, schema: CourtSchema },
      { name: Review.name, schema: ReviewSchema },
    ]),
    MulterModule.register({
      storage: diskStorage({
        destination: './uploads/courts',
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `court-${uniqueSuffix}-${file.originalname}`);
        },
      }),
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
      },
      fileFilter: (req, file, cb) => {
        if (file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
          cb(null, true);
        } else {
          cb(new Error('Only image files are allowed!'), false);
        }
      },
    }),
    AuthModule,
  ],
  controllers: [CourtController],
  providers: [CourtService, ReviewService],
  exports: [CourtService, ReviewService],
})
export class CourtsModule {}

