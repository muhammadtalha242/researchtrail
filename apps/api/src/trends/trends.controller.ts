import { Controller, Get, Param, Query } from '@nestjs/common';
import { OpenAlexService } from '../openalex/openalex.service';
import { GetTrendsDto, SearchTopicsDto } from './dto/get-trends.dto';

@Controller('trends')
export class TrendsController {
  constructor(private readonly openAlex: OpenAlexService) {}

  @Get()
  getTrends(@Query() query: GetTrendsDto) {
    return this.openAlex.getTopicTrends({
      topicId: query.topicId,
      query: query.q,
      fromYear: query.fromYear,
      toYear: query.toYear,
    });
  }

  @Get('topics')
  searchTopics(@Query() query: SearchTopicsDto) {
    return this.openAlex.searchTopics(query.q, query.limit);
  }

  @Get('topic/:id')
  getTopic(@Param('id') id: string) {
    return this.openAlex.getTopic(id);
  }
}
