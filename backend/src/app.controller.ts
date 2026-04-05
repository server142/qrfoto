import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ConfigService } from '@nestjs/config';
import * as os from 'os';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private configService: ConfigService
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('api/config')
  getConfig() {
    const manualIp = this.configService.get('PUBLIC_IP');
    if (manualIp) {
        return {
            localIp: manualIp,
            frontendUrl: `http://${manualIp}:3000`
        };
    }

    const networkInterfaces = os.networkInterfaces();
    let localIp = 'localhost';
    
    // Buscar la primera IP de red local (que no sea 127.0.0.1)
    for (const iface of Object.values(networkInterfaces)) {
      if (!iface) continue;
      for (const alias of iface) {
        if (alias.family === 'IPv4' && !alias.internal) {
          localIp = alias.address;
          break;
        }
      }
      if (localIp !== 'localhost') break;
    }

    return {
        localIp,
        frontendUrl: `http://${localIp}:3000`
    };
  }
}
