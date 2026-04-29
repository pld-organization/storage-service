import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  constructor() {
    console.log('✅ AppController instantiated');
  }
  @Get('health')
  health() {
    return { status: 'ok' };
  }
}
