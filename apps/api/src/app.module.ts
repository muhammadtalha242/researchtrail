import { Module } from '@nestjs/common';
import { OpenAlexModule } from './openalex/openalex.module';
import { TrendsModule } from './trends/trends.module';
import { WorksModule } from './works/works.module';

@Module({
  imports: [
    OpenAlexModule,
    WorksModule,
    TrendsModule,
  ],
})
export class AppModule {}
