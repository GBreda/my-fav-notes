import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, Query } from '@nestjs/common';
import { createItemSchema, listItemsQuerySchema, seenSchema, updateItemSchema } from '@depois/shared';
import { CurrentUser } from '../common/current-user.decorator';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { AuthUser } from '../auth/auth.types';
import { ItemsService } from './items.service';

@Controller('items')
export class ItemsController {
  constructor(private readonly items: ItemsService) {}

  @Get()
  list(
    @CurrentUser() user: AuthUser,
    @Query(new ZodValidationPipe(listItemsQuerySchema)) query: Parameters<ItemsService['list']>[1],
  ) {
    return this.items.list(user.id, query);
  }

  @Get(':id')
  get(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.items.get(user.id, id);
  }

  @Post()
  create(
    @CurrentUser() user: AuthUser,
    @Body(new ZodValidationPipe(createItemSchema)) body: Parameters<ItemsService['create']>[1],
  ) {
    return this.items.create(user.id, body);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateItemSchema)) body: Parameters<ItemsService['update']>[2],
  ) {
    return this.items.update(user.id, id, body);
  }

  @Patch(':id/seen')
  setSeen(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body(new ZodValidationPipe(seenSchema)) body: { seen: boolean },
  ) {
    return this.items.setSeen(user.id, id, body.seen);
  }

  @Delete(':id')
  @HttpCode(200)
  remove(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.items.remove(user.id, id);
  }
}
