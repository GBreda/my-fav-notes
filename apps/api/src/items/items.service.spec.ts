import { NotFoundException } from '@nestjs/common';
import { ItemsService } from './items.service';

describe('ItemsService', () => {
  const prisma = {
    item: {
      findMany: jest.fn(),
      groupBy: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      deleteMany: jest.fn(),
    },
  };
  const service = new ItemsService(prisma as never);

  const base = {
    id: 'item-1',
    userId: 'user-1',
    title: 'Past Lives',
    url: null,
    category: 'movie',
    notes: null,
    seen: false,
    seenAt: null as Date | null,
    createdAt: new Date('2026-11-01T12:00:00.000Z'),
    updatedAt: new Date('2026-11-01T12:00:00.000Z'),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    prisma.item.findMany.mockResolvedValue([]);
    prisma.item.groupBy.mockResolvedValue([]);
  });

  it('lists only the signed-in user items', async () => {
    await service.list('user-1', { status: 'all' });
    expect(prisma.item.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId: 'user-1' },
      }),
    );
    expect(prisma.item.groupBy).toHaveBeenCalledWith(
      expect.objectContaining({ where: { userId: 'user-1' } }),
    );
  });

  it('creates an item that can exist without a link', async () => {
    prisma.item.create.mockResolvedValue(base);
    const created = await service.create('user-1', {
      title: 'Past Lives',
      url: null,
      category: 'movie',
      notes: null,
    });
    expect(prisma.item.create).toHaveBeenCalledWith({
      data: {
        userId: 'user-1',
        title: 'Past Lives',
        url: null,
        category: 'movie',
        notes: null,
      },
    });
    expect(created.url).toBeNull();
    expect(created.seen).toBe(false);
  });

  it('keeps the original seen date when it is marked seen again', async () => {
    const seenAt = new Date('2026-11-02T08:00:00.000Z');
    prisma.item.findFirst.mockResolvedValue({ ...base, seen: true, seenAt });
    prisma.item.update.mockImplementation(async ({ data }: { data: object }) => ({
      ...base,
      seen: true,
      seenAt,
      ...data,
    }));

    await service.setSeen('user-1', 'item-1', true);
    expect(prisma.item.update).toHaveBeenCalledWith({
      where: { id: 'item-1' },
      data: { seen: true, seenAt },
    });
  });

  it('clears the seen date when the item goes back to the list', async () => {
    const seenAt = new Date('2026-11-02T08:00:00.000Z');
    prisma.item.findFirst.mockResolvedValue({ ...base, seen: true, seenAt });
    prisma.item.update.mockImplementation(async ({ data }: { data: object }) => ({
      ...base,
      ...data,
    }));

    const updated = await service.setSeen('user-1', 'item-1', false);
    expect(updated.seen).toBe(false);
    expect(updated.seenAt).toBeNull();
  });

  it('does not reveal an item owned by someone else', async () => {
    prisma.item.findFirst.mockResolvedValue(null);
    await expect(service.setSeen('user-2', 'item-1', true)).rejects.toBeInstanceOf(NotFoundException);
    expect(prisma.item.update).not.toHaveBeenCalled();
  });

  it('deletes only the owner row', async () => {
    prisma.item.deleteMany.mockResolvedValue({ count: 0 });
    await expect(service.remove('user-2', 'item-1')).rejects.toBeInstanceOf(NotFoundException);
    expect(prisma.item.deleteMany).toHaveBeenCalledWith({
      where: { id: 'item-1', userId: 'user-2' },
    });
  });
});
