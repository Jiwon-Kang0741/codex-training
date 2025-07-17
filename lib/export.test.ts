import { entriesToCSV } from './export'

describe('entriesToCSV', () => {
  it('converts entries to csv', () => {
    const csv = entriesToCSV([
      { name: 'a', email: 'b', notes: 'c', tags: 't', next_steps: 'n' },
      { name: 'x', email: 'y', notes: 'z' },
    ])
    expect(csv).toBe(
      'name,email,notes,tags,next_steps\n"a","b","c","t","n"\n"x","y","z","",""'
    )
  })
})
