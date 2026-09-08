import { Controller, Get, Param, Query } from '@nestjs/common';
import { OpenAlexService } from '../openalex/openalex.service';
import { SearchWorksDto } from './dto/search-works.dto';

@Controller()
export class WorksController {
  constructor(private readonly openAlex: OpenAlexService) {}

  @Get('search')
  search(@Query() query: SearchWorksDto) {
    return this.openAlex.searchWorks({
      query: query.q,
      fromYear: query.fromYear,
      toYear: query.toYear,
      openAccess: query.openAccess,
      sort: query.sort,
      page: query.page,
    });
  }

  @Get('works/:id')
  getWork(@Param('id') id: string) {
    return this.openAlex.getWorkWithRelated(id);
  }

  @Get('works/:id/graph')
  getGraph(@Param('id') id: string) {
    return this.openAlex.getGraph(id);
  }
}
