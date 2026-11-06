import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateItemInput, ListItemsQuery } from '@depois/shared';
import { PrismaService } from '../prisma/prisma.service';
import { buildItemWhere, buildSummary } from './item-query';
import { toItemDto } from './item.mapper';

@Injectable()
export class ItemsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(userId: string, query: ListItemsQuery) {
    const where = buildItemWhere(userId, query);
    const [rows, byCategory, bySeen] = await Promise.all([
      this.prisma.item.findMany({
        where,
        orderBy:
          query.status === 'seen'
            ? [{ seenAt: 'desc' }, { createdAt: 'desc' }]
            : [{ seen: 'asc' }, { createdAt: 'desc' }],
        take: 500,
      }),
      this.prisma.item.groupBy({
        by: ['category'],
        where: { userId },
        _count: { _all: true },
      }),
      this.prisma.item.groupBy({
        by: ['seen'],
        where: { userId },
        _count: { _all: true },
      }),
    ]);

    return {
      items: rows.map(toItemDto),
      summary: buildSummary(
        byCategory.map((row) => ({ category: row.category, count: row._count._all })),
        bySeen.map((row) => ({ seen: row.seen, count: row._count._all })),
      ),
    };
  }

  async get(userId: string, id: string) {
    const item = await this.prisma.item.findFirst({ where: { id, userId } });
    if (!item) throw new NotFoundException({ code: 'NOT_FOUND' });
    return toItemDto(item);
  }

  async create(userId: string, input: CreateItemInput) {
    const item = await this.prisma.item.create({
      data: {
        userId,
        title: input.title,
        url: input.url,
        category: input.category,
        notes: input.notes,
      },
    });
    return toItemDto(item);
  }

  async update(userId: string, id: string, input: CreateItemInput) {
    await this.get(userId, id);
    const item = await this.prisma.item.update({
      where: { id },
      data: {
        title: input.title,
        url: input.url,
        category: input.category,
        notes: input.notes,
      },
    });
    return toItemDto(item);
  }

  async setSeen(userId: string, id: string, seen: boolean) {
    const existing = await this.prisma.item.findFirst({ where: { id, userId } });
    if (!existing) throw new NotFoundException({ code: 'NOT_FOUND' });
    const seenAt = seen ? (existing.seen ? (existing.seenAt ?? new Date()) : new Date()) : null;
    const item = await this.prisma.item.update({
      where: { id },
      data: { seen, seenAt },
    });
    return toItemDto(item);
  }

  async remove(userId: string, id: string) {
    const result = await this.prisma.item.deleteMany({ where: { id, userId } });
    if (result.count === 0) throw new NotFoundException({ code: 'NOT_FOUND' });
    return { ok: true };
  }
}
