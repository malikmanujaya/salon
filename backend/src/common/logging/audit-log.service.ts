import { Injectable, Logger } from '@nestjs/common';
import { appendFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';

type AuditLogInput = {
  feature: string;
  action: string;
  entity: string;
  entityId?: string | null;
  actorId?: string | null;
  salonId?: string | null;
  details?: Record<string, unknown>;
};

@Injectable()
export class AuditLogService {
  private readonly logger = new Logger(AuditLogService.name);
  private readonly logsDir = join(process.cwd(), 'logs');

  async logDbChange(input: AuditLogInput): Promise<void> {
    const line = JSON.stringify({
      ts: new Date().toISOString(),
      type: 'db_change',
      ...input,
    });

    try {
      await mkdir(this.logsDir, { recursive: true });
      const filePath = join(this.logsDir, `${input.feature}.log`);
      await appendFile(filePath, `${line}\n`, 'utf8');
    } catch (error) {
      this.logger.error(`Failed to write audit log for feature "${input.feature}"`, error as Error);
    }
  }
}

