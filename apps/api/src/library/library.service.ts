import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { OpenAlexService } from '../openalex/openalex.service';
import { PrismaService } from '../prisma/prisma.service';
import { AddWorkToCollectionDto } from './dto/add-work-to-collection.dto';
import { CreateCollectionDto } from './dto/create-collection.dto';
import { SaveWorkDto } from './dto/save-work.dto';
import { UpdateWorkDto } from './dto/update-work.dto';

@Injectable()
export class LibraryService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly openAlex: OpenAlexService,
  ) {}

  list(userId: string) {
    return this.prisma.savedWork.findMany({
      where: { userId },
      include: {
        collectionLinks: { include: { collection: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async save(userId: string, dto: SaveWorkDto) {
    const work = await this.openAlex.getWork(dto.openAlexId);
    return this.prisma.savedWork.upsert({
      where: { userId_openAlexId: { userId, openAlexId: work.openAlexId } },
      update: {
        status: dto.status,
        note: dto.note,
        title: work.title,
        abstract: work.abstract,
        authors: work.authors,
        topics: work.topics,
        citedByCount: work.citedByCount,
        isOpenAccess: work.isOpenAccess,
      },
      create: {
        userId,
        openAlexId: work.openAlexId,
        title: work.title,
        abstract: work.abstract,
        authors: work.authors,
        topics: work.topics,
        publicationYear: work.publicationYear,
        publicationType: work.publicationType,
        venue: work.venue,
        citedByCount: work.citedByCount,
        isOpenAccess: work.isOpenAccess,
        doi: work.doi,
        sourceUrl: work.sourceUrl,
        status: dto.status,
        note: dto.note,
      },
    });
  }

  async update(userId: string, id: string, dto: UpdateWorkDto) {
    await this.requireOwnedWork(userId, id);
    return this.prisma.savedWork.update({ where: { id }, data: dto });
  }

  async remove(userId: string, id: string) {
    await this.requireOwnedWork(userId, id);
    await this.prisma.savedWork.delete({ where: { id } });
    return { success: true };
  }

  listCollections(userId: string) {
    return this.prisma.collection.findMany({
      where: { userId },
      include: { works: { include: { savedWork: true } } },
      orderBy: { name: 'asc' },
    });
  }

  async createCollection(userId: string, dto: CreateCollectionDto) {
    try {
      return await this.prisma.collection.create({
        data: { userId, name: dto.name.trim(), description: dto.description?.trim() || null },
      });
    } catch (error) {
      if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2002') {
        throw new ConflictException('A collection with this name already exists.');
      }
      throw error;
    }
  }

  async deleteCollection(userId: string, collectionId: string) {
    const collection = await this.prisma.collection.findFirst({ where: { id: collectionId, userId } });
    if (!collection) throw new NotFoundException('Collection not found.');
    await this.prisma.collection.delete({ where: { id: collectionId } });
    return { success: true };
  }

  async addToCollection(userId: string, collectionId: string, dto: AddWorkToCollectionDto) {
    const [collection, savedWork] = await Promise.all([
      this.prisma.collection.findFirst({ where: { id: collectionId, userId } }),
      this.prisma.savedWork.findFirst({ where: { id: dto.savedWorkId, userId } }),
    ]);
    if (!collection) throw new NotFoundException('Collection not found.');
    if (!savedWork) throw new NotFoundException('Saved publication not found.');

    return this.prisma.collectionWork.upsert({
      where: { collectionId_savedWorkId: { collectionId, savedWorkId: dto.savedWorkId } },
      update: {},
      create: { collectionId, savedWorkId: dto.savedWorkId },
    });
  }

  async removeFromCollection(userId: string, collectionId: string, savedWorkId: string) {
    const collection = await this.prisma.collection.findFirst({ where: { id: collectionId, userId } });
    if (!collection) throw new NotFoundException('Collection not found.');
    await this.prisma.collectionWork.deleteMany({ where: { collectionId, savedWorkId } });
    return { success: true };
  }

  private async requireOwnedWork(userId: string, id: string) {
    const work = await this.prisma.savedWork.findFirst({ where: { id, userId } });
    if (!work) throw new NotFoundException('Saved publication not found.');
    return work;
  }
}
