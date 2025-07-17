
jest.mock('next/server', () => ({
  __esModule: true,
  NextResponse: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    json: jest.fn((data: any, init?: { status?: number }) => ({
      json: () => data,
      status: init?.status ?? 200,
    })),
  },
  NextRequest: class {}
}));

import { NextRequest } from 'next/server';

jest.mock('openai', () => {
  const mockCreate = jest.fn();
  return {
    __esModule: true,
    default: jest.fn().mockImplementation(() => ({
      chat: { completions: { create: mockCreate } },
    })),
    mockCreate,
  };
});

const { mockCreate } = jest.requireMock('openai');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { POST } = require('./route');

describe('POST /api/summary', () => {
  beforeEach(() => {
    mockCreate.mockReset();
  });

  it('returns summary on success', async () => {
    const req = { json: jest.fn().mockResolvedValue({ notes: 'n', name: 'a', email: 'e' }) } as unknown as NextRequest;
    mockCreate.mockResolvedValue({ choices: [{ message: { content: '{"summary":"ok"}' } }] });
    const res = await POST(req);
    expect(mockCreate).toHaveBeenCalled();
    expect(await res.json()).toEqual({ summary: 'ok' });
  });

  it('handles missing notes', async () => {
    const req = { json: jest.fn().mockResolvedValue({}) } as unknown as NextRequest;
    const res = await POST(req);
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: 'Missing notes' });
  });

  it('handles openai error', async () => {
    const req = { json: jest.fn().mockResolvedValue({ notes: 'n', name: 'a', email: 'e' }) } as unknown as NextRequest;
    mockCreate.mockRejectedValue(new Error('fail'));
    const res = await POST(req);
    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ error: 'Failed to generate summary.' });
  });
});
