import { reports, reportRelations } from './report.schema';

describe('Report Schema', () => {
  it('should export reports table', () => {
    expect(reports).toBeDefined();
  });

  it('should export reportRelations', () => {
    expect(reportRelations).toBeDefined();
  });
});
