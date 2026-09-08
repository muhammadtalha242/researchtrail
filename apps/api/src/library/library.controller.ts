import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { CurrentUser, AuthenticatedUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { AddWorkToCollectionDto } from './dto/add-work-to-collection.dto';
import { CreateCollectionDto } from './dto/create-collection.dto';
import { SaveWorkDto } from './dto/save-work.dto';
import { UpdateWorkDto } from './dto/update-work.dto';
import { LibraryService } from './library.service';

@UseGuards(JwtAuthGuard)
@Controller()
export class LibraryController {
  constructor(private readonly library: LibraryService) {}

  @Get('library')
  list(@CurrentUser() user: AuthenticatedUser) {
    return this.library.list(user.userId);
  }

  @Post('library')
  save(@CurrentUser() user: AuthenticatedUser, @Body() dto: SaveWorkDto) {
    return this.library.save(user.userId, dto);
  }

  @Patch('library/:id')
  update(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string, @Body() dto: UpdateWorkDto) {
    return this.library.update(user.userId, id, dto);
  }

  @Delete('library/:id')
  remove(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.library.remove(user.userId, id);
  }

  @Get('collections')
  listCollections(@CurrentUser() user: AuthenticatedUser) {
    return this.library.listCollections(user.userId);
  }

  @Post('collections')
  createCollection(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateCollectionDto) {
    return this.library.createCollection(user.userId, dto);
  }

  @Delete('collections/:id')
  deleteCollection(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.library.deleteCollection(user.userId, id);
  }

  @Post('collections/:id/works')
  addToCollection(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: AddWorkToCollectionDto,
  ) {
    return this.library.addToCollection(user.userId, id, dto);
  }

  @Delete('collections/:id/works/:savedWorkId')
  removeFromCollection(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Param('savedWorkId') savedWorkId: string,
  ) {
    return this.library.removeFromCollection(user.userId, id, savedWorkId);
  }
}
