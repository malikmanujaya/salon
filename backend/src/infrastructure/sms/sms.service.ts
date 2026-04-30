import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import type { AppConfig } from '../../config/configuration';

@Injectable()
export class SmsService {
  constructor(private readonly config: ConfigService<AppConfig>) {}

  private get smsOpts() {
    return this.config.get('sms', { infer: true })!;
  }

  async sendNotifySms(to: string, message: string): Promise<void> {
    const sms = this.smsOpts;
    if (!sms.userId || !sms.apiKey || !sms.senderId) {
      throw new BadRequestException('SMS service is not configured.');
    }

    const params = new URLSearchParams({
      user_id: sms.userId,
      api_key: sms.apiKey,
      sender_id: sms.senderId,
      to,
      message,
    });

    const res = await fetch(`https://app.notify.lk/api/v1/send?${params.toString()}`, {
      method: 'GET',
    });

    if (!res.ok) {
      throw new BadRequestException('Failed to send OTP SMS.');
    }
  }
}

