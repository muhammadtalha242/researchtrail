import { IsUUID } from 'class-validator';

export class AddWorkToCollectionDto {
  @IsUUID()
  savedWorkId: string;
}
