import { Global, Module } from '@nestjs/common';
import { OpenAlexService } from './openalex.service';

@Global()
@Module({
  providers: [OpenAlexService],
  exports: [OpenAlexService],
})
export class OpenAlexModule {}
