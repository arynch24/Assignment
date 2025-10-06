import { Controller, Get, Post, Body, Patch, Param, Delete, Request } from '@nestjs/common';
import { QueueService } from './queue.service';
import { CreateQueueDto } from './dto/create-queue.dto';
import { UpdateQueueDto } from './dto/update-queue.dto';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Controller('queue')
export class QueueController {
  constructor(private readonly queueService: QueueService) { }

  @Post()
  @UseGuards(AuthGuard('jwt'))
  create(@Body() createQueueDto: CreateQueueDto, @Request() req) {
    return this.queueService.create(createQueueDto, req.user.id);
  }

  @Get()
  findAll() {
    return this.queueService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.queueService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateQueueDto: UpdateQueueDto) {
    return this.queueService.update(id, updateQueueDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.queueService.remove(id);
  }
}
