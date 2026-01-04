import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  health() {
    return {
      status: 'ok',
      service: 'backend',
      phase: 2,
      timestamp: new Date().toISOString(),
    };
  }
}
