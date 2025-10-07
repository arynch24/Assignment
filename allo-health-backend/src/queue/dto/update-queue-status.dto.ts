import { IsEnum } from 'class-validator';
import { QueueStatus } from 'generated/prisma';

export class UpdateQueueStatusDto {
    @IsEnum(QueueStatus)
    status: QueueStatus;
}