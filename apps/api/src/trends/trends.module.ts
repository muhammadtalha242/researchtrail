import { Module } from '@nestjs/common';
import { OpenAlexModule } from '../openalex/openalex.module';
import { TrendsController } from './trends.controller';

@Module({
  imports: [OpenAlexModule],
  controllers: [TrendsController],
})
export class TrendsModule {}
